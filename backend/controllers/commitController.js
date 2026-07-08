const CommitLog = require("../models/commitLog");
const DailyStat = require("../models/DailyStat");
const {
  todayStr,
  startOfWeekStr,
  startOfMonthStr,
} = require("../utils/dateHelpers");

// POST /api/commits/increment
// The "+1 Commit" button calls this
async function incrementCommit(req, res, next) {
  try {
    const date = todayStr();

    await CommitLog.findOneAndUpdate(
      { user: req.userId, date },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );

    await DailyStat.findOneAndUpdate(
      { user: req.userId, date },
      { $inc: { commitCount: 1 } },
      { upsert: true, new: true },
    );

    res.json({ message: "Commit added" });
  } catch (err) {
    next(err);
  }
}

// GET /api/commits/summary
async function getCommitSummary(req, res, next) {
  try {
    const today = todayStr();
    const weekStart = startOfWeekStr();
    const monthStart = startOfMonthStr();

    const logs = await CommitLog.find({ user: req.userId });

    const todayCount = logs
      .filter((l) => l.date === today)
      .reduce((s, l) => s + l.count, 0);
    const weekCount = logs
      .filter((l) => l.date >= weekStart)
      .reduce((s, l) => s + l.count, 0);
    const monthCount = logs
      .filter((l) => l.date >= monthStart)
      .reduce((s, l) => s + l.count, 0);
    const lifetimeCount = logs.reduce((s, l) => s + l.count, 0);

    res.json({ todayCount, weekCount, monthCount, lifetimeCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { incrementCommit, getCommitSummary };
