const mongoose = require('mongoose');

// Stores every question asked to the AI Doubt Solver along with its full
// bilingual answer, so a user's past doubts aren't lost the moment they close
// the modal.
const doubtQuerySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoubtQuery', doubtQuerySchema);
