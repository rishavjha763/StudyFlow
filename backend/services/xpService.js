const User = require("../models/User");
const XPLog = require("../models/XPLog");
const { getLevelInfo } = require("../utils/levelCalculator");
const { todayStr } = require("../utils/dateHelpers");

// How much XP each action is worth, kept in one place so it's easy to tune later
const XP_VALUES = {
  STUDY_SESSION: 20,
  NOTE_CREATED: 5,
  REVISION_COMPLETED: 10,
  QUIZ_COMPLETED: 15,
  ACHIEVEMENT_UNLOCKED: 50,
};

// Call this any time a user does something XP-worthy.
// It logs the XP, updates the user's total, and recalculates their level.
async function awardXP(userId, reasonKey, reasonLabel) {
  const amount = XP_VALUES[reasonKey];
  if (!amount) return null;

  await XPLog.create({
    user: userId,
    amount,
    reason: reasonLabel,
    date: todayStr(),
  });

  const user = await User.findById(userId);
  const previousLevel = user.level;

  user.xp += amount;
  const { level } = getLevelInfo(user.xp);
  user.level = level;
  await user.save();

  return {
    xpAwarded: amount,
    totalXP: user.xp,
    level: user.level,
    leveledUp: level > previousLevel,
  };
}

module.exports = { awardXP, XP_VALUES };
