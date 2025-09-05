// netlify/functions/create-patient-note.js
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: "Method Not Allowed" };
    }
    const { token, html, title = "Osler Wellness Dispense" } = JSON.parse(event.body || "{}");
    if (!token || !html) return { statusCode: 400, headers, body: "Missing token or html" };

    const payload = {
      app_id: process.env.PLATO_APP_ID,
      "app-id": process.env.PLATO_APP_ID,
      app_secret: process.env.PLATO_APP_SECRET,
      "app-secret": process.env.PLATO_APP_SECRET,
      token
    };
    const ctxRes = await fetch("https://clinic.platomedical.com/apps/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const ctxText = await ctxRes.text();
    if (!ctxRes.ok) return { statusCode: ctxRes.status, headers, body: `Context failed: ${ctxText}` };

    let ctxObj = {};
    try { ctxObj = JSON.parse(ctxText); } catch {}
    const c = ctxObj?.context || ctxObj?.data || ctxObj || {};
    const patientId = c?.patient?.id ?? c?.patient_id ?? c?.patientId ?? null;
    const database = c?.user?.database ?? c?.database ?? c?.tenant ?? c?.org?.database ?? null;
    if (!patientId || !database) {
      return { statusCode: 400, headers, body: "No patient/database in context" };
    }

    const apiUrl = `https://clinic.platomedical.com/api/${encodeURIComponent(database)}/patient_note`;
    const auth = Buffer.from(`${process.env.PLATO_APP_ID}:${process.env.PLATO_APP_SECRET}`).toString("base64");

    const notePayload = {
      patient_id: patientId,
      title,
      note: html,
      status: "draft",
      folder: "Osler Wellness"
    };

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(notePayload)
    });
    const respText = await r.text();
    if (!r.ok) return { statusCode: r.status, headers, body: `Plato create note failed: ${respText}` };

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, response: respText }) };
  } catch (e) {
    return { statusCode: 500, headers, body: e?.message || "Create note failed" };
  }
}
