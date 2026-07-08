const mongoose = require("mongoose");

// One row per user per day, keeps running totals so we don't recompute from scratch each time
const dailyStatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    totalStudySeconds: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    commitCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

dailyStatSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyStat", dailyStatSchema);
