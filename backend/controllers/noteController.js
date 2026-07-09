const Note = require("../models/Note");
const { awardXP } = require("../services/xpService");
const {
  checkAndUnlockAchievements,
} = require("../services/achievementService");

// GET /api/notes?search=keyword
async function getNotes(req, res, next) {
  try {
    const { search } = req.query;
    const filter = { user: req.userId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
}

// POST /api/notes
async function createNote(req, res, next) {
  try {
    const { title, description } = req.body;
    if (!title)
      return res.status(400).json({ message: "Note title is required" });

    const note = await Note.create({ user: req.userId, title, description });
    const xpResult = await awardXP(
      req.userId,
      "NOTE_CREATED",
      "Created a note",
    );
    const newAchievements = await checkAndUnlockAchievements(req.userId);
    res.status(201).json({ note, xp: xpResult, newAchievements });
  } catch (err) {
    next(err);
  }
}

// PUT /api/notes/:id
async function updateNote(req, res, next) {
  try {
    const { title, description } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description },
      { new: true, runValidators: true },
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ note });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notes/:id
async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
