const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  incrementCommit,
  getCommitSummary,
} = require("../controllers/commitController");

router.use(protect);
router.post("/increment", incrementCommit);
router.get("/summary", getCommitSummary);

module.exports = router;
