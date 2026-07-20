const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { searchVideos } = require("../controllers/youtubeController");

router.use(protect);
router.get("/search", searchVideos);

module.exports = router;
