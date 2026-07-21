// Shared Gemini-calling helper used by every AI feature (quiz generation,
// revision sheets, doubt solving) — one place that handles model fallback,
// error messages, and pulling clean JSON out of the response, so each
// feature's service file only has to write its prompt and schema.
const MODEL_CANDIDATES = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

async function callGemini(model, apiKey, prompt, maxOutputTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens, temperature: 0.7 },
    }),
  });
}

// Calls Gemini (trying each candidate model in order until one works) and
// returns the parsed JSON object/array found in its response text.
async function callGeminiForJSON(prompt, { maxOutputTokens = 4000 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "This AI feature needs GEMINI_API_KEY set in backend/.env.",
    );
    err.statusCode = 400;
    throw err;
  }

  let response;
  let lastErrorBody = "";

  for (const model of MODEL_CANDIDATES) {
    response = await callGemini(model, apiKey, prompt, maxOutputTokens);
    if (response.ok) break;
    lastErrorBody = await response.text().catch(() => "");
    if (response.status !== 404) break; // only 404 means "try the next model"
    console.warn(
      `Gemini model "${model}" unavailable, trying next candidate...`,
    );
  }

  if (!response.ok) {
    console.error("Gemini API error:", response.status, lastErrorBody);
    const err = new Error(
      response.status === 400 || response.status === 403
        ? "The AI service rejected the request — check GEMINI_API_KEY in backend/.env."
        : "Could not reach the AI service, please try again",
    );
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate || candidate.finishReason === "SAFETY") {
    const err = new Error(
      "The AI could not generate a response for that, please try something else",
    );
    err.statusCode = 502;
    throw err;
  }

  const rawText = (candidate.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();

  // The model is asked to return only JSON, but may add stray text around
  // it — pull out just the {...} or [...] block instead of failing outright.
  const objMatch = rawText.match(/\{[\s\S]*\}/);
  const arrMatch = rawText.match(/\[[\s\S]*\]/);
  let jsonString = rawText.replace(/```json|```/g, "").trim();
  if (objMatch && (!arrMatch || objMatch.index <= arrMatch.index))
    jsonString = objMatch[0];
  else if (arrMatch) jsonString = arrMatch[0];

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error(
      "Gemini returned unparseable content:",
      rawText.slice(0, 500),
    );
    const err = new Error(
      "The AI returned an unexpected format, please try again",
    );
    err.statusCode = 502;
    throw err;
  }
}

module.exports = { callGeminiForJSON };
