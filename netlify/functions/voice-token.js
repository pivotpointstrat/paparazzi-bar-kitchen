// Voice concierge — ephemeral-token proxy for the Gemini Live API.
// Holds GEMINI_API_KEY server-side; the browser only ever gets a short-lived
// (30 min, single-session) token. Same pattern as the standalone template.
//
// GET /.netlify/functions/voice-token?mode=assistant|translate
//   -> { token, model, mode }

const TOKEN_URL = "https://generativelanguage.googleapis.com/v1beta/auth_tokens";

exports.handler = async (event) => {
  const API_KEY = process.env.GEMINI_API_KEY || "";
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "GEMINI_API_KEY not configured." }) };
  }

  const qs = event.queryStringParameters || {};
  const mode = qs.mode === "translate" ? "translate" : "assistant";
  const model = mode === "translate"
    ? "gemini-3.5-live-translate-preview"
    : "gemini-3.1-flash-live-preview";

  const now = new Date();
  const body = {
    uses: 1,
    expireTime: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    newSessionExpireTime: new Date(now.getTime() + 1 * 60 * 1000).toISOString(),
  };

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { statusCode: res.status, headers, body: JSON.stringify({ error: `Token provisioning failed (${res.status})`, detail: text.slice(0, 300) }) };
    }

    const data = await res.json();
    const rawName = data.name || data.token || "";
    const token = rawName.includes("/") ? rawName.slice(rawName.lastIndexOf("/") + 1) : rawName;
    if (!token) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "No token in provisioning response." }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ token, model, mode }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Token proxy error: " + (err.message || "unknown") }) };
  }
};
