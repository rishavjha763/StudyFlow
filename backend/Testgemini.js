// Standalone diagnostic script — run this directly to see EXACTLY what
// Gemini's API says, without going through the rest of the app.
//
// Usage:
//   cd backend
//   node testGemini.js
//
// It reads GEMINI_API_KEY from your .env file automatically.

require("dotenv").config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("--- Gemini API test ---");
  console.log(
    "Key found in .env:",
    apiKey
      ? `yes (starts with "${apiKey.slice(0, 6)}...")`
      : "NO — GEMINI_API_KEY is missing from backend/.env",
  );

  if (!apiKey) {
    console.log(
      "\n❌ Add GEMINI_API_KEY=your_key to backend/.env and run this again.",
    );
    return;
  }

  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  for (const model of models) {
    console.log(`\nTrying model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "hello" and nothing else.' }] }],
        }),
      });

      console.log("HTTP status:", response.status, response.statusText);
      const text = await response.text();

      if (response.ok) {
        console.log("Raw response body:\n", text);
        console.log(`\n✅ SUCCESS with model "${model}" — use this one.`);
        return;
      }

      console.log("Failed:", text.slice(0, 200));
    } catch (err) {
      console.log("\n❌ Network-level error:", err.message);
      console.log(
        "Common causes: no internet, a firewall/proxy blocking the request,",
      );
      console.log(
        "or a very old Node.js version without built-in fetch (need Node 18+).",
      );
      return;
    }
  }

  console.log(
    "\n❌ None of the candidate models worked. Read the failure messages above —",
  );
  console.log(
    "   if they all say 404, Google has renamed things again; if any says 400/403,",
  );
  console.log("   the API key itself is the problem.");
}

main();
