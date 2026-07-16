// Uses the Google Gemini API (free tier) to auto-generate a multiple-choice
// quiz for a topic or note title. Requires GEMINI_API_KEY in backend/.env —
// get a free key from https://aistudio.google.com/apikey
//
// Google deprecates/retires Gemini model names fairly often. Instead of
// hardcoding one and having it break again later, we try a short list of
// candidates in order and use whichever one actually responds.
const MODEL_CANDIDATES = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

async function callGemini(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  return response;
}

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

  let response;
  let lastErrorBody = "";

  for (const model of MODEL_CANDIDATES) {
    response = await callGemini(model, apiKey, prompt);
    if (response.ok) break;

    lastErrorBody = await response.text().catch(() => "");
    // A 404 here means this particular model name is retired/unavailable —
    // move on and try the next candidate. Any other error (bad key, quota,
    // etc) won't be fixed by trying a different model, so stop immediately.
    if (response.status !== 404) break;
    console.warn(
      `Gemini model "${model}" unavailable, trying next candidate...`,
    );
  }

  if (!response.ok) {
    console.error("Gemini API error:", response.status, lastErrorBody);
    const err = new Error(
      response.status === 400 || response.status === 403
        ? "The AI service rejected the request — check that GEMINI_API_KEY in backend/.env is correct."
        : "Could not reach the AI quiz generator, please try again",
    );
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate || candidate.finishReason === "SAFETY") {
    const err = new Error(
      "The AI could not generate questions for that topic, please try a different one",
    );
    err.statusCode = 502;
    throw err;
  }

  const rawText = (candidate.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();

  const arrayMatch = rawText.match(/\[[\s\S]*\]/);
  const jsonString = arrayMatch
    ? arrayMatch[0]
    : rawText.replace(/```json|```/g, "").trim();

  let questions;
  try {
    questions = JSON.parse(jsonString);
  } catch (e) {
    console.error("Gemini returned unparseable content:", rawText);
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
