const User = require("../models/User");
const XPLog = require("../models/XPLog");
const { getLevelInfo } = require("../utils/levelCalculator");

// GET /api/xp/summary
async function getXPSummary(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    const { level, xpIntoLevel, xpForNextLevel } = getLevelInfo(user.xp);

    res.json({
      xp: user.xp,
      level,
      xpIntoLevel,
      xpForNextLevel,
      progressPercent: Math.round((xpIntoLevel / xpForNextLevel) * 100),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/xp/history
async function getXPHistory(req, res, next) {
  try {
    const logs = await XPLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { getXPSummary, getXPHistory };
