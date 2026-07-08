const mongoose = require("mongoose");

// One row per completed study session (created when the user hits "stop")
const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    durationInSeconds: { type: Number, required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for easy grouping
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

studySessionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("StudySession", studySessionSchema);
