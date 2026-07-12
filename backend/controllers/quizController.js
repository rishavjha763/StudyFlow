const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { awardXP } = require('../services/xpService');
const { checkAndUnlockAchievements } = require('../services/achievementService');
const { generateQuizQuestions } = require('../services/aiQuizService');
const { todayStr } = require('../utils/dateHelpers');

// GET /api/quizzes
async function getQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    next(err);
  }
}

// POST /api/quizzes
async function createQuiz(req, res, next) {
  try {
    const { title, category, difficulty, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'A title and at least one question are required' });
    }
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length !== 4 || q.correctIndex === undefined) {
        return res.status(400).json({ message: 'Every question needs text, exactly 4 options, and a correct answer' });
      }
    }

    const quiz = await Quiz.create({ user: req.userId, title, category, difficulty, questions });
    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/quizzes/:id
async function deleteQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/quizzes/:id/submit
// Body: { answers: [selectedOptionIndex, ...] } in the same order as quiz.questions
async function submitQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.userId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers must match the number of questions' });
    }

    let score = 0;
    const breakdown = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) score += 1;
      return {
        question: q.question,
        options: q.options,
        yourAnswer: answers[i],
        correctIndex: q.correctIndex,
        isCorrect
      };
    });

    await QuizResult.create({
      user: req.userId,
      quiz: quiz._id,
      quizTitle: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      date: todayStr()
    });

    const xpResult = await awardXP(req.userId, 'QUIZ_COMPLETED', `Completed quiz: ${quiz.title}`);
    const newAchievements = await checkAndUnlockAchievements(req.userId);

    res.json({
      score,
      totalQuestions: quiz.questions.length,
      breakdown,
      xp: xpResult,
      newAchievements
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/quizzes/stats
async function getQuizStats(req, res, next) {
  try {
    const results = await QuizResult.find({ user: req.userId }).sort({ createdAt: -1 });

    const totalQuizzes = results.length;
    const averageScore = totalQuizzes
      ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / totalQuizzes)
      : 0;
    const bestScore = totalQuizzes
      ? Math.max(...results.map((r) => Math.round((r.score / r.totalQuestions) * 100)))
      : 0;

    res.json({
      totalQuizzes,
      averageScore,
      bestScore,
      recentResults: results.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/quizzes/generate
// Body: { topicName, difficulty }
// Auto-builds a quiz using AI based on a topic the user has studied.
async function generateQuiz(req, res, next) {
  try {
    const { topicName, difficulty } = req.body;
    if (!topicName) {
      return res.status(400).json({ message: 'A topic name is required' });
    }

    const questions = await generateQuizQuestions(topicName, difficulty || 'Medium', 5);

    const quiz = await Quiz.create({
      user: req.userId,
      title: `${topicName} Quiz`,
      category: topicName,
      difficulty: difficulty || 'Medium',
      questions
    });

    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuizzes, createQuiz, deleteQuiz, submitQuiz, getQuizStats, generateQuiz };
