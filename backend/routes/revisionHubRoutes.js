const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getStatus, getCurrentSheet, completeSheet } = require('../controllers/revisionHubController');

router.use(protect);
router.get('/status', getStatus);
router.get('/current', getCurrentSheet);
router.post('/complete', completeSheet);

module.exports = router;
