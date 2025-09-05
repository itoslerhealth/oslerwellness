// netlify/functions/plato-context.js
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    const token = event.queryStringParameters?.token;
    if (!token) return { statusCode: 400, headers, body: "Missing token" };

    const payload = {
      app_id: process.env.PLATO_APP_ID,
      "app-id": process.env.PLATO_APP_ID,
      app_secret: process.env.PLATO_APP_SECRET,
      "app-secret": process.env.PLATO_APP_SECRET,
      token
    };

    const r = await fetch("https://clinic.platomedical.com/apps/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    if (!r.ok) return { statusCode: r.status, headers, body: `Plato context error: ${text}` };

    let ctx = {};
    try { ctx = JSON.parse(text); } catch {}
    const c = ctx?.context || ctx?.data || ctx || {};

    const patientId = c?.patient?.id ?? c?.patient_id ?? c?.patientId ?? null;
    const patientName = c?.patient?.name ?? c?.patient_name ?? c?.patientName ?? null;
    const database = c?.user?.database ?? c?.database ?? c?.tenant ?? c?.org?.database ?? null;

    const result = { patientId, patientName, database, debug: { ctx: c } };
    if (!patientId || !database) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: "No patient/database in context", ...result }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: e?.message || "Context failed" };
  }
}
