const mongoose = require('mongoose');

// One row per achievement a user has unlocked. The achievement definitions
// themselves (title, description, condition) live in code, not the database,
// so this table just tracks "which key did this user unlock, and when".
const unlockedAchievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true }
  },
  { timestamps: true }
);

unlockedAchievementSchema.index({ user: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('UnlockedAchievement', unlockedAchievementSchema);
