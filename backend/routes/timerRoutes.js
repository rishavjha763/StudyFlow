const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  saveSession,
  getSummary,
  getHistory,
} = require("../controllers/timerController");

router.use(protect);
router.post("/session", saveSession);
router.get("/summary", getSummary);
router.get("/history", getHistory);

module.exports = router;
