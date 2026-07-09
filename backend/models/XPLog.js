const mongoose = require("mongoose");

// One row per XP-earning action, so we can show "recent activity" and analytics later
const xpLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true }, // e.g. "Completed a study session"
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true },
);

xpLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("XPLog", xpLogSchema);
