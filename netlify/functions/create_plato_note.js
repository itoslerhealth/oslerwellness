const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
exports.handler = async (event) => {
  try {
    const { token, patient_id, title, html } = JSON.parse(event.body || "{}");
    if (!token) return { statusCode: 400, body: JSON.stringify({ ok:false, error:"Missing token" }) };
    if (!patient_id) return { statusCode: 400, body: JSON.stringify({ ok:false, error:"Missing patient_id" }) };
    const base = process.env.PLATO_BASE_URL || "https://clinic.platomedical.com";
    const url  = `${base}/api/1.0/patients/${encodeURIComponent(patient_id)}/notes`;
    const res = await fetch(url, { method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ title: title || "Osler Wellness — Dispense", body_html: html || "<p>No content</p>", is_draft:true }) });
    if (!res.ok){ const t = await res.text(); return { statusCode:400, body: JSON.stringify({ ok:false, error:`Plato API ${res.status}: ${t}` }) }; }
    return { statusCode: 200, body: JSON.stringify({ ok:true }) };
  } catch(e){ return { statusCode:500, body: JSON.stringify({ ok:false, error: e.message }) }; }
};