// netlify/functions/plato-context.js
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    const token = event.queryStringParameters?.token;
    if (!token) return { statusCode: 400, headers, body: "Missing token" };

    const r = await fetch("https://clinic.platomedical.com/apps/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: process.env.PLATO_APP_ID,
        app_secret: process.env.PLATO_APP_SECRET,
        token
      })
    });
    if (!r.ok) {
      const t = await r.text();
      return { statusCode: r.status, headers, body: `Plato context error: ${t}` };
    }
    const ctx = await r.json();
    const payload = {
      patientId: ctx?.patient?.id || null,
      patientName: ctx?.patient?.name || null,
      database: ctx?.user?.database || null
    };
    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (e) {
    return { statusCode: 500, headers, body: e?.message || "Context failed" };
  }
}
