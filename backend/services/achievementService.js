const UnlockedAchievement = require("../models/UnlockedAchievement");
const StudySession = require("../models/StudySession");
const Note = require("../models/Note");
const QuizResult = require("../models/QuizResult");
const DailyStat = require("../models/DailyStat");
const { calculateStreak } = require("../utils/streakCalculator");
const { awardXP } = require("./xpService");

// The full list of achievements in the app. Kept in code (not the database)
// since the definitions rarely change — only which ones a user has unlocked does.
const ACHIEVEMENTS = [
  {
    key: "first_session",
    title: "First Study Session",
    description: "Complete your first study session",
    icon: "clock",
  },
  {
    key: "first_note",
    title: "First Note",
    description: "Create your first note",
    icon: "edit",
  },
  {
    key: "first_quiz",
    title: "First Quiz",
    description: "Complete your first quiz",
    icon: "help-circle",
  },
  {
    key: "streak_7",
    title: "7 Day Streak",
    description: "Study 7 days in a row",
    icon: "flame",
  },
  {
    key: "streak_30",
    title: "30 Day Streak",
    description: "Study 30 days in a row",
    icon: "flame",
  },
  {
    key: "hours_100",
    title: "100 Hours Studied",
    description: "Reach 100 lifetime study hours",
    icon: "award",
  },
  {
    key: "notes_100",
    title: "100 Notes",
    description: "Create 100 notes",
    icon: "book",
  },
  {
    key: "quiz_master",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: "star",
  },
];

// Call this after any XP-worthy action. It checks every achievement condition,
// unlocks whichever ones just became true, and awards bonus XP for each.
// Returns the list of achievements newly unlocked (empty array if none).
async function checkAndUnlockAchievements(userId) {
  const already = await UnlockedAchievement.find({ user: userId }).select(
    "key",
  );
  const unlockedKeys = new Set(already.map((a) => a.key));

  const sessionCount = await StudySession.countDocuments({ user: userId });
  const noteCount = await Note.countDocuments({ user: userId });
  const quizCount = await QuizResult.countDocuments({ user: userId });
  const dailyStats = await DailyStat.find({ user: userId });
  const streak = calculateStreak(dailyStats);
  const lifetimeSeconds = dailyStats.reduce(
    (sum, d) => sum + d.totalStudySeconds,
    0,
  );

  const conditionMet = {
    first_session: sessionCount >= 1,
    first_note: noteCount >= 1,
    first_quiz: quizCount >= 1,
    streak_7: streak >= 7,
    streak_30: streak >= 30,
    hours_100: lifetimeSeconds >= 100 * 3600,
    notes_100: noteCount >= 100,
    quiz_master: quizCount >= 10,
  };

  const newlyUnlocked = [];

  for (const def of ACHIEVEMENTS) {
    if (!unlockedKeys.has(def.key) && conditionMet[def.key]) {
      await UnlockedAchievement.create({ user: userId, key: def.key });
      const xpResult = await awardXP(
        userId,
        "ACHIEVEMENT_UNLOCKED",
        `Unlocked: ${def.title}`,
      );
      newlyUnlocked.push({ ...def, xp: xpResult });
    }
  }

  return newlyUnlocked;
}

module.exports = { ACHIEVEMENTS, checkAndUnlockAchievements };
