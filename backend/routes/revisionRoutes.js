const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getCurrentRevision,
  toggleTopic,
} = require("../controllers/revisionController");

router.use(protect);
router.get("/current", getCurrentRevision);
router.put("/:id/toggle/:index", toggleTopic);

module.exports = router;
