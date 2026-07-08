const Topic = require("../models/Topic");

// GET /api/topics
async function getTopics(req, res, next) {
  try {
    const topics = await Topic.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
}

// POST /api/topics
async function createTopic(req, res, next) {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Topic name is required" });

    const topic = await Topic.create({ user: req.userId, name });
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
}

// PUT /api/topics/:id
async function updateTopic(req, res, next) {
  try {
    const { hoursStudied, completionPercentage, status, name } = req.body;

    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { hoursStudied, completionPercentage, status, name },
      { new: true, runValidators: true },
    );

    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json({ topic });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/topics/:id
async function deleteTopic(req, res, next) {
  try {
    const topic = await Topic.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json({ message: "Topic deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTopics, createTopic, updateTopic, deleteTopic };
