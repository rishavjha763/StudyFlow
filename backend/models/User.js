const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    profileImage: { type: String, default: "" }, // relative path under /uploads/profile-images
    createdDate: { type: Date, default: Date.now },
    // updatedAt is provided automatically by the timestamps option below
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
