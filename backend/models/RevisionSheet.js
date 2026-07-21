const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String
  },
  { _id: false }
);

// One language's worth of content for a topic. Both "en" and "hi" use this
// same shape, so the frontend can just read whichever one the user toggled to.
const languageContentSchema = new mongoose.Schema(
  {
    keyPoints: [String],
    simpleExplanation: String,
    detailedExplanation: String,
    realLifeExample: String,
    codeExample: String,
    commonMistakes: [String],
    interviewInsights: [String],
    memoryTricks: [String],
    mcqs: [mcqSchema]
  },
  { _id: false }
);

const topicSheetSchema = new mongoose.Schema(
  {
    topicName: { type: String, required: true },
    en: languageContentSchema,
    hi: languageContentSchema
  },
  { _id: false }
);

// One row per user per week — generated once (cached) the first time the
// user opens Revision Hub on a Wednesday or Saturday, then reused for the
// rest of that unlock day instead of re-calling the AI every visit.
const revisionSheetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: String, required: true }, // YYYY-MM-DD (Monday of that week)
    topics: [topicSheetSchema],
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

revisionSheetSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('RevisionSheet', revisionSheetSchema);
