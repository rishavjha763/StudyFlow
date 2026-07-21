const {
  isRevisionDayUnlocked,
  getNextUnlockInfo,
  generateWeeklyRevisionSheet,
  markRevisionComplete,
} = require("../services/aiRevisionService");
const { startOfWeekStr } = require("../utils/dateHelpers");
const { awardXP } = require("../services/xpService");

// GET /api/revision-hub/status
async function getStatus(req, res, next) {
  try {
    const unlocked = isRevisionDayUnlocked();
    const today = new Date();
    res.json({
      unlocked,
      today: today.toLocaleDateString("en-US", { weekday: "long" }),
      nextUnlock: unlocked ? null : getNextUnlockInfo(today),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/revision-hub/current
// Auto-generates (and caches) this week's sheet the first time it's requested.
async function getCurrentSheet(req, res, next) {
  try {
    if (!isRevisionDayUnlocked()) {
      return res
        .status(403)
        .json({
          message: "Revision Hub only unlocks on Wednesdays and Saturdays",
        });
    }
    const sheet = await generateWeeklyRevisionSheet(req.userId);
    if (!sheet) {
      return res.json({ sheet: null });
    }
    res.json({ sheet });
  } catch (err) {
    next(err);
  }
}

// POST /api/revision-hub/complete
async function completeSheet(req, res, next) {
  try {
    const weekStart = startOfWeekStr();
    const sheet = await markRevisionComplete(req.userId, weekStart);
    if (!sheet)
      return res
        .status(404)
        .json({ message: "No revision sheet found for this week" });

    const xpResult = await awardXP(
      req.userId,
      "REVISION_COMPLETED",
      "Completed weekly AI revision sheet",
    );
    res.json({ sheet, xp: xpResult });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus, getCurrentSheet, completeSheet };
