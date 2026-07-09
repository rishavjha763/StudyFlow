const DailyStat = require("../models/DailyStat");
const CommitLog = require("../models/CommitLog");
const Note = require("../models/Note");
const StudySession = require("../models/StudySession");
const User = require("../models/User");
const { calculateStreak } = require("../utils/streakCalculator");
const {
  todayStr,
  startOfWeekStr,
  startOfMonthStr,
} = require("../utils/dateHelpers");

// GET /api/stats/dashboard
// One call that returns everything the dashboard analytics cards need
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.userId;
    const today = todayStr();
    const weekStart = startOfWeekStr();
    const monthStart = startOfMonthStr();

    const allDailyStats = await DailyStat.find({ user: userId });
    const commitLogs = await CommitLog.find({ user: userId });
    const noteCount = await Note.countDocuments({ user: userId });
    const sessionCount = await StudySession.countDocuments({ user: userId });
    const longestSession = await StudySession.findOne({ user: userId }).sort({
      durationInSeconds: -1,
    });

    const todayStat = allDailyStats.find((d) => d.date === today);
    const weekSeconds = allDailyStats
      .filter((d) => d.date >= weekStart)
      .reduce((s, d) => s + d.totalStudySeconds, 0);
    const monthSeconds = allDailyStats
      .filter((d) => d.date >= monthStart)
      .reduce((s, d) => s + d.totalStudySeconds, 0);
    const lifetimeSeconds = allDailyStats.reduce(
      (s, d) => s + d.totalStudySeconds,
      0,
    );

    const todayCommits = commitLogs
      .filter((c) => c.date === today)
      .reduce((s, c) => s + c.count, 0);
    const totalCommits = commitLogs.reduce((s, c) => s + c.count, 0);

    const streak = calculateStreak(allDailyStats);
    const user = await User.findById(userId).select("dailyGoalHours");

    res.json({
      todayStudySeconds: todayStat ? todayStat.totalStudySeconds : 0,
      weekStudySeconds: weekSeconds,
      monthStudySeconds: monthSeconds,
      lifetimeStudySeconds: lifetimeSeconds,
      todayCommits,
      totalCommits,
      noteCount,
      sessionCount,
      studyStreak: streak,
      longestSessionSeconds: longestSession
        ? longestSession.durationInSeconds
        : 0,
      dailyGoalHours: user.dailyGoalHours,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/stats/weekly-chart
// Last 7 days of study time, shaped for a bar chart on the frontend
async function getWeeklyChart(req, res, next) {
  try {
    const results = [];
    const cursor = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const stat = await DailyStat.findOne({ user: req.userId, date: dateStr });
      results.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: stat ? Math.round(stat.totalStudySeconds / 60) : 0,
      });
    }

    res.json({ weeklyChart: results });
  } catch (err) {
    next(err);
  }
}

// GET /api/stats/export-csv
// Downloadable CSV of the full daily history, a nice extra for a portfolio project
async function exportCsv(req, res, next) {
  try {
    const stats = await DailyStat.find({ user: req.userId }).sort({ date: 1 });

    let csv = "Date,Total Study Minutes,Session Count,Commit Count\n";
    stats.forEach((s) => {
      csv += `${s.date},${Math.round(s.totalStudySeconds / 60)},${s.sessionCount},${s.commitCount}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=study-history.csv",
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, getWeeklyChart, exportCsv };
