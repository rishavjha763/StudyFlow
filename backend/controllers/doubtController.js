const DoubtQuery = require("../models/DoubtQuery");
const { answerDoubt } = require("../services/aiDoubtService");

// POST /api/doubts/ask
async function askDoubt(req, res, next) {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Type a question first" });
    }

    const answer = await answerDoubt(req.userId, question.trim());
    await DoubtQuery.create({
      user: req.userId,
      question: question.trim(),
      answer,
    });

    res.json({ answer });
  } catch (err) {
    next(err);
  }
}

// GET /api/doubts/history
async function getHistory(req, res, next) {
  try {
    const history = await DoubtQuery.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

module.exports = { askDoubt, getHistory };
