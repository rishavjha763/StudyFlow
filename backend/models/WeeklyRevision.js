const mongoose = require("mongoose");

const revisionTopicSchema = new mongoose.Schema(
  {
    topicName: { type: String, required: true },
    reviewed: { type: Boolean, default: false },
  },
  { _id: false },
);

// One row per user per week. Built automatically from topics the user touched
// that week (updated to "In Progress" or "Completed"), so there's nothing to
// set up manually — it just reflects what was actually studied.
const weeklyRevisionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: String, required: true }, // YYYY-MM-DD (Monday of that week)
    topics: [revisionTopicSchema],
  },
  { timestamps: true },
);

weeklyRevisionSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyRevision", weeklyRevisionSchema);
