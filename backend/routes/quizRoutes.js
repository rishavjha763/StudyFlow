const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getQuizzes,
  createQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizStats,
  generateQuiz,
} = require("../controllers/quizController");

router.use(protect);
router.get("/", getQuizzes);
router.post("/", createQuiz);
router.post("/generate", generateQuiz);
router.get("/stats", getQuizStats);
router.delete("/:id", deleteQuiz);
router.post("/:id/submit", submitQuiz);

module.exports = router;
