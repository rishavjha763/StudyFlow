const { callGeminiForJSON } = require('./geminiClient');

// Uses Gemini (via the shared geminiClient) to auto-generate a multiple-choice
// quiz for a topic or note title.
async function generateQuizQuestions(topicName, difficulty = 'Medium', questionCount = 5) {
  const prompt = `Create exactly ${questionCount} multiple-choice quiz questions to test understanding of "${topicName}" at a ${difficulty} difficulty level.
Return ONLY a JSON array, with no other text before or after it, in exactly this shape:
[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}]
Every question must have exactly 4 options. correctIndex is the 0-based index of the correct option.`;

  const questions = await callGeminiForJSON(prompt, { maxOutputTokens: 2000 });

  if (!Array.isArray(questions) || questions.length === 0) {
    const err = new Error('The AI did not return any questions, please try again');
    err.statusCode = 502;
    throw err;
  }

  return questions;
}

module.exports = { generateQuizQuestions };
