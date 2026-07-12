const {
  getOrCreateCurrentWeekRevision,
  toggleRevisionTopic,
} = require("../services/revisionService");

// GET /api/revisions/current
async function getCurrentRevision(req, res, next) {
  try {
    const revision = await getOrCreateCurrentWeekRevision(req.userId);
    res.json({ revision });
  } catch (err) {
    next(err);
  }
}

// PUT /api/revisions/:id/toggle/:index
async function toggleTopic(req, res, next) {
  try {
    const { id, index } = req.params;
    const result = await toggleRevisionTopic(
      req.userId,
      id,
      parseInt(index, 10),
    );
    if (!result)
      return res.status(404).json({ message: "Revision or topic not found" });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCurrentRevision, toggleTopic };
