const Note = require('../models/Note');
const { callGeminiForJSON } = require('./geminiClient');

// Answers a study question like a personal tutor would — using the user's
// own recent notes as context, not a generic answer.
async function answerDoubt(userId, question) {
  const recentNotes = await Note.find({ user: userId }).sort({ updatedAt: -1 }).limit(10).select('title description');
  const noteContext = recentNotes.map((n) => `- ${n.title}: ${(n.description || '').slice(0, 150)}`).join('\n');

  const prompt = `You are a warm, thorough personal tutor for a software development student.

Their recent study notes (use as context if relevant to the question, otherwise ignore them):
${noteContext || '(no notes yet)'}

The student's question: "${question}"

Answer like a real teacher explaining deeply — not a short chatbot reply.
Return ONLY a JSON object, no other text before or after it, in exactly this shape:
{
  "en": {
    "directAnswer": "a clear, direct answer in 1-2 sentences",
    "detailedExplanation": "a thorough explanation, several sentences, teaching the underlying concept",
    "simpleExplanation": "an even simpler, beginner-friendly restatement",
    "realLifeExample": "a concrete real-world analogy or use case",
    "codeExample": "a short code snippet if relevant, else null",
    "commonMistakes": ["...", "..."],
    "relatedTopics": ["...", "..."],
    "mcqs": [{"question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..."}]
  },
  "hi": { "directAnswer": "...", "detailedExplanation": "...", "simpleExplanation": "...", "realLifeExample": "...", "codeExample": "... or null", "commonMistakes": [...], "relatedTopics": [...], "mcqs": [...] }
}
The "hi" object must have the exact same fields as "en" but written naturally in Hindi (Devanagari script). Give 3 to 5 mcqs.`;

  return callGeminiForJSON(prompt, { maxOutputTokens: 3000 });
}

module.exports = { answerDoubt };
