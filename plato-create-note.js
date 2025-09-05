// Netlify serverless function to create a Draft Note in Plato.
// Requires environment vars:
//   PLATO_APP_ID, PLATO_APP_SECRET
// Optional:
//   PLATO_BASE (default https://clinic.platomedical.com/developers/1.0)
//
// NOTE: If your Plato endpoint path differs, adjust ENDPOINT below.

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  const { patientId, title, html } = JSON.parse(event.body || "{}");
  if (!patientId) return { statusCode: 400, body: JSON.stringify({ message: "patientId required" }) };

  const APP_ID = process.env.PLATO_APP_ID;
  const APP_SECRET = process.env.PLATO_APP_SECRET;
  const BASE = process.env.PLATO_BASE || "https://clinic.platomedical.com/developers/1.0";

  if (!APP_ID || !APP_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ message: "Missing PLATO_APP_ID / PLATO_APP_SECRET" }) };
  }

  // This endpoint is a best-guess template. Confirm against your Plato docs.
  const ENDPOINT = `${BASE}/apps/${APP_ID}/patients/${encodeURIComponent(patientId)}/notes/drafts`;

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${APP_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title || "Osler Wellness – Supplement Order",
        content_html: html || "<p>Order</p>"
      })
    });

    const text = await r.text();
    if (!r.ok) {
      return { statusCode: r.status, body: JSON.stringify({ message: text }) };
    }
    // Pass through API response
    return { statusCode: 200, body: text };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ message: e.message || "Network error" }) };
  }
}
