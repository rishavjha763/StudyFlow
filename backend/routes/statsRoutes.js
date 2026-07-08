const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getDashboardStats,
  getWeeklyChart,
  exportCsv,
} = require("../controllers/statsController");

router.use(protect);
router.get("/dashboard", getDashboardStats);
router.get("/weekly-chart", getWeeklyChart);
router.get("/export-csv", exportCsv);

module.exports = router;
