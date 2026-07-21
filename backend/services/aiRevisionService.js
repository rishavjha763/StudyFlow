const Note = require('../models/Note');
const Topic = require('../models/Topic');
const QuizResult = require('../models/QuizResult');
const RevisionSheet = require('../models/RevisionSheet');
const { callGeminiForJSON } = require('./geminiClient');
const { startOfWeekStr } = require('../utils/dateHelpers');

// Revision Hub only unlocks on Wednesday (3) and Saturday (6) — the two
// "check-in" days for reviewing the week's material.
function isRevisionDayUnlocked(date = new Date()) {
  const day = date.getDay();
  return day === 3 || day === 6;
}

function getNextUnlockInfo(date = new Date()) {
  const day = date.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  const daysUntilSat = (6 - day + 7) % 7 || 7;
  const daysUntil = Math.min(daysUntilWed, daysUntilSat);

  const next = new Date(date);
  next.setDate(date.getDate() + daysUntil);

  return {
    daysUntil,
    date: next.toISOString().split('T')[0],
    label: next.toLocaleDateString('en-US', { weekday: 'long' })
  };
}

// Pulls together everything the user actually did this week — this is the
// "context" the AI uses instead of generating generic, disconnected content.
async function gatherWeeklyContext(userId) {
  const weekStart = startOfWeekStr();
  const weekStartDate = new Date(weekStart);

  const notes = await Note.find({ user: userId, createdAt: { $gte: weekStartDate } }).select('title description');
  const topics = await Topic.find({
    user: userId,
    updatedAt: { $gte: weekStartDate },
    status: { $in: ['In Progress', 'Completed'] }
  });
  const quizResults = await QuizResult.find({ user: userId, createdAt: { $gte: weekStartDate } });

  // QuizResult only stores a total score (not per-question answers), so
  // "weak areas" here means quiz topics the user scored under 70% on.
  const weakQuizzes = quizResults
    .filter((r) => r.totalQuestions > 0 && r.score / r.totalQuestions < 0.7)
    .map((r) => r.quizTitle);

  return { weekStart, notes, topics, weakQuizzes };
}

async function generateWeeklyRevisionSheet(userId) {
  const { weekStart, notes, topics, weakQuizzes } = await gatherWeeklyContext(userId);

  // Cached: if we already built this week's sheet, don't call the AI again.
  const existing = await RevisionSheet.findOne({ user: userId, weekStart });
  if (existing) return existing;

  if (topics.length === 0 && notes.length === 0) {
    return null; // nothing studied this week — nothing to build a sheet from
  }

  const topicNames = topics.length > 0 ? topics.map((t) => t.name) : notes.map((n) => n.title).slice(0, 5);
  const noteSummaries = notes.map((n) => `- ${n.title}: ${(n.description || '').slice(0, 200)}`).join('\n');

  const prompt = `You are an expert tutor building a weekly revision sheet for a student learning software development.

This week the student studied these topics: ${topicNames.join(', ')}.
Their notes this week:
${noteSummaries || '(no notes this week)'}
Quiz topics they scored below 70% on this week (weak areas — give these extra depth): ${weakQuizzes.join(', ') || 'none'}.

For EACH topic listed above, generate a complete bilingual revision sheet.
Return ONLY a JSON object, no other text before or after it, in exactly this shape:
{
  "topics": [
    {
      "topicName": "string",
      "en": {
        "keyPoints": ["...", "..."],
        "simpleExplanation": "2-3 sentences, beginner friendly",
        "detailedExplanation": "a thorough explanation, several sentences",
        "realLifeExample": "a concrete real-world analogy or use case",
        "codeExample": "a short code snippet if this topic is code-related, else null",
        "commonMistakes": ["...", "..."],
        "interviewInsights": ["what interviewers commonly ask or look for on this topic"],
        "memoryTricks": ["a mnemonic or memory aid"],
        "mcqs": [{"question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "why this is correct"}]
      },
      "hi": { "keyPoints": [...], "simpleExplanation": "...", "detailedExplanation": "...", "realLifeExample": "...", "codeExample": "... or null", "commonMistakes": [...], "interviewInsights": [...], "memoryTricks": [...], "mcqs": [...] }
    }
  ]
}
The "hi" object must have the exact same fields as "en" but written naturally in Hindi (Devanagari script). Give each topic 3 to 5 mcqs.`;

  const parsed = await callGeminiForJSON(prompt, { maxOutputTokens: 8000 });
  const topicsData = Array.isArray(parsed) ? parsed : parsed.topics;

  if (!Array.isArray(topicsData) || topicsData.length === 0) {
    const err = new Error('The AI could not build a revision sheet this time, please try again');
    err.statusCode = 502;
    throw err;
  }

  const sheet = await RevisionSheet.create({ user: userId, weekStart, topics: topicsData });
  return sheet;
}

async function markRevisionComplete(userId, weekStart) {
  const sheet = await RevisionSheet.findOne({ user: userId, weekStart });
  if (!sheet) return null;
  if (sheet.completed) return sheet;
  sheet.completed = true;
  await sheet.save();
  return sheet;
}

module.exports = { isRevisionDayUnlocked, getNextUnlockInfo, generateWeeklyRevisionSheet, markRevisionComplete };
