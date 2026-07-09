const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getAchievements } = require("../controllers/achievementController");

router.use(protect);
router.get("/", getAchievements);

module.exports = router;
