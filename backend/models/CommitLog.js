const mongoose = require("mongoose");

// Each click of "+1 commit" creates one entry, so we can total by day/week/month/lifetime
const commitLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    count: { type: Number, default: 1 },
  },
  { timestamps: true },
);

commitLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("CommitLog", commitLogSchema);
