const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }, // createdAt doubles as "Date", updatedAt as "Last Updated"
);

noteSchema.index({ user: 1, title: "text", description: "text" });

module.exports = mongoose.model("Note", noteSchema);
