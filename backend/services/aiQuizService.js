// Uses the Google Gemini API (free tier) to auto-generate a multiple-choice
// quiz for a topic name. Requires GEMINI_API_KEY in backend/.env — get a
// free key from https://aistudio.google.com/apikey
async function generateQuizQuestions(
  topicName,
  difficulty = "Medium",
  questionCount = 5,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "AI quiz generation is not set up yet. Add GEMINI_API_KEY to backend/.env to enable it.",
    );
    err.statusCode = 400;
    throw err;
  }

  const prompt = `Create exactly ${questionCount} multiple-choice quiz questions to test understanding of "${topicName}" at a ${difficulty} difficulty level.
Return ONLY a JSON array, with no other text before or after it, in exactly this shape:
[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}]
Every question must have exactly 4 options. correctIndex is the 0-based index of the correct option.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const err = new Error(
      "Could not reach the AI quiz generator, please try again",
    );
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const rawText = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch (e) {
    const err = new Error(
      "The AI returned an unexpected format, please try again",
    );
    err.statusCode = 502;
    throw err;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    const err = new Error(
      "The AI did not return any questions, please try again",
    );
    err.statusCode = 502;
    throw err;
  }

  return questions;
}

module.exports = { generateQuizQuestions };
