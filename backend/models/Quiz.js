const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: (arr) => arr.length === 4
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 }
});

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    questions: { type: [questionSchema], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
