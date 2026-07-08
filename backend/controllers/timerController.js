const StudySession = require("../models/StudySession");
const DailyStat = require("../models/DailyStat");
const { todayStr, startOfWeekStr } = require("../utils/dateHelpers");

// POST /api/timer/session
// Called when the user hits "stop" on the timer, saves the finished session
async function saveSession(req, res, next) {
  try {
    const { durationInSeconds, startedAt, endedAt } = req.body;

    if (!durationInSeconds || durationInSeconds <= 0) {
      return res
        .status(400)
        .json({ message: "A valid session duration is required" });
    }

    const date = todayStr();

    const session = await StudySession.create({
      user: req.userId,
      durationInSeconds,
      date,
      startedAt: startedAt || new Date(),
      endedAt: endedAt || new Date(),
    });

    // Keep the daily summary row up to date so dashboard stats stay fast to read
    await DailyStat.findOneAndUpdate(
      { user: req.userId, date },
      {
        $inc: { totalStudySeconds: durationInSeconds, sessionCount: 1 },
      },
      { upsert: true, new: true },
    );

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

// GET /api/timer/summary
// Returns today / this week / lifetime totals for the study timer cards
async function getSummary(req, res, next) {
  try {
    const today = todayStr();
    const weekStart = startOfWeekStr();

    const todayStat = await DailyStat.findOne({
      user: req.userId,
      date: today,
    });

    const weekStats = await DailyStat.find({
      user: req.userId,
      date: { $gte: weekStart },
    });
    const weekTotal = weekStats.reduce(
      (sum, d) => sum + d.totalStudySeconds,
      0,
    );

    const allStats = await DailyStat.find({ user: req.userId });
    const lifetimeTotal = allStats.reduce(
      (sum, d) => sum + d.totalStudySeconds,
      0,
    );

    const longestSession = await StudySession.findOne({
      user: req.userId,
    }).sort({ durationInSeconds: -1 });

    res.json({
      todaySeconds: todayStat ? todayStat.totalStudySeconds : 0,
      weekSeconds: weekTotal,
      lifetimeSeconds: lifetimeTotal,
      longestSessionSeconds: longestSession
        ? longestSession.durationInSeconds
        : 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/timer/history
// Full daily history: date, total time, session count, commit count
async function getHistory(req, res, next) {
  try {
    const stats = await DailyStat.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(90);
    res.json({ history: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { saveSession, getSummary, getHistory };
