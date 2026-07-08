const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    hoursStudied: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Topic", topicSchema);
