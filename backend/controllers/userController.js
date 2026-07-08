const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/user/me
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/user/me
async function updateProfile(req, res, next) {
  try {
    const { fullName, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, profileImage },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/user/upload-profile-image
// multer puts the uploaded file on req.file, then we save its path on the user
async function uploadProfileImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file was uploaded" });
    }

    const imagePath = `/uploads/profile-images/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: imagePath },
      { new: true },
    ).select("-password");

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/user/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
};
