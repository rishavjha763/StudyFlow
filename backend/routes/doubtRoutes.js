const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { askDoubt, getHistory } = require("../controllers/doubtController");

router.use(protect);
router.post("/ask", askDoubt);
router.get("/history", getHistory);

module.exports = router;
