// Works out level from total XP.
// Level 1 needs 100 XP, level 2 needs 200 more, level 3 needs 300 more, and so on.
// This "increasing requirement" pattern is the same idea Duolingo/games use.

function getLevelInfo(totalXP) {
  let level = 1;
  let remaining = totalXP;
  let xpForNextLevel = 100;

  while (remaining >= xpForNextLevel) {
    remaining -= xpForNextLevel;
    level += 1;
    xpForNextLevel = level * 100;
  }

  return {
    level,
    xpIntoLevel: remaining, // how much XP earned since reaching this level
    xpForNextLevel, // how much more XP is needed to level up
  };
}

module.exports = { getLevelInfo };
