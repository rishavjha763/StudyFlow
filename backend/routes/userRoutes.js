const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
} = require("../controllers/userController");

router.use(protect);
router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/change-password", changePassword);
router.post(
  "/upload-profile-image",
  upload.single("image"),
  uploadProfileImage,
);

module.exports = router;
