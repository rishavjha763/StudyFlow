const UnlockedAchievement = require("../models/UnlockedAchievement");
const { ACHIEVEMENTS } = require("../services/achievementService");

// GET /api/achievements
async function getAchievements(req, res, next) {
  try {
    const unlocked = await UnlockedAchievement.find({ user: req.userId });
    const unlockedMap = {};
    unlocked.forEach((u) => {
      unlockedMap[u.key] = u.createdAt;
    });

    const achievements = ACHIEVEMENTS.map((def) => ({
      ...def,
      unlocked: Boolean(unlockedMap[def.key]),
      unlockedAt: unlockedMap[def.key] || null,
    }));

    res.json({
      achievements,
      unlockedCount: unlocked.length,
      totalCount: ACHIEVEMENTS.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAchievements };
