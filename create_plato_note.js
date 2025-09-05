/**
 * Netlify Function: create_plato_note
 * Purpose: Create a draft note in Plato's "Osler Wellness" patient tab after a dispense.
 * Auth: Uses Plato App ID/Secret (Basic) + short-lived `token` that Plato app passes as URL param.
 *
 * Env required in Netlify (Site -> Settings -> Build & deploy -> Environment):
 *   PLATO_APP_ID=7de86c881a07
 *   PLATO_APP_SECRET=owsec_8c1e0b5b2d6a4f2e9c7a3f1d8b4a6c0e_Gh7Kp3Qx9Vt2Zm4N
 *   PLATO_API_BASE=https://clinic.platomedical.com
 *   PLATO_NOTE_ENDPOINT_OVERRIDE=   (optional; e.g. /api/{db}/patient_note)
 *
 * Call from the client with: fetch('/.netlify/functions/create_plato_note?token=' + token, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
 *
 * Payload JSON:
 * {
 *   "patientId": "optional-override",
 *   "doctorInitials": "AB",
 *   "remarks": "1 tab bd",
 *   "items": [
 *      {"name":"Magnesium 90", "qty":1, "unit_price":55, "loc":"SV"}
 *   ]
 * }
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function htmlEscape(s=''){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const APP_ID = process.env.PLATO_APP_ID;
    const APP_SECRET = process.env.PLATO_APP_SECRET;
    const API_BASE = process.env.PLATO_API_BASE || 'https://clinic.platomedical.com';
    const NOTE_OVERRIDE = process.env.PLATO_NOTE_ENDPOINT_OVERRIDE || '';

    if (!APP_ID || !APP_SECRET) {
      return { statusCode: 500, body: 'Missing PLATO_APP_ID/PLATO_APP_SECRET env vars' };
    }

    const token = (event.queryStringParameters && event.queryStringParameters.token) || null;
    if (!token) {
      return { statusCode: 400, body: 'Missing ?token= from Plato (URL param)' };
    }

    const payload = JSON.parse(event.body || '{}');
    const { items = [], remarks = '', doctorInitials = '', patientId: overridePatient } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'No items to write to Plato.' };
    }

    // 1) Get context (db, patient) via /apps/context
    const ctxRes = await fetch(`${API_BASE}/apps/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET, token })
    });
    if (!ctxRes.ok) {
      const txt = await ctxRes.text();
      return { statusCode: ctxRes.status, body: `Context error: ${txt}` };
    }
    const ctx = await ctxRes.json();
    const db = ctx?.user?.database;
    const patientId = overridePatient || ctx?.patient?.id || ctx?.patient?._id;

    if (!db || !patientId) {
      return { statusCode: 400, body: 'Could not determine database or patient from context.' };
    }

    // 2) Build HTML content
    const now = new Date();
    const title = `Osler Wellness — POS Dispense (${now.toLocaleString()})`;
    const rows = items.map((it, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${htmlEscape(it.name)}</td>
        <td>${htmlEscape(it.loc||'')}</td>
        <td style="text-align:right">${Number(it.qty||0)}</td>
        <td style="text-align:right">${Number(it.unit_price||0).toFixed(2)}</td>
        <td style="text-align:right">${(Number(it.qty||0)*Number(it.unit_price||0)).toFixed(2)}</td>
      </tr>`).join('');

    const grand = items.reduce((s,it)=>s + (Number(it.qty||0)*Number(it.unit_price||0)), 0);

    const html = `
      <h2>Osler Wellness — Point of Sale</h2>
      <p><strong>Doctor:</strong> ${htmlEscape(doctorInitials||ctx?.provider?.name||'')}</p>
      <p><strong>Remarks:</strong> ${htmlEscape(remarks||'')}</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        <thead>
          <tr>
            <th>#</th><th>Product</th><th>Loc</th><th>Qty</th><th>Unit</th><th>Line</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="5" style="text-align:right"><strong>Total</strong></td><td style="text-align:right"><strong>${grand.toFixed(2)}</strong></td></tr>
        </tfoot>
      </table>
    `;

    // 3) POST create a *draft* patient note.
    // Endpoint varies; we support two forms. Preferred can be set via PLATO_NOTE_ENDPOINT_OVERRIDE
    const basicAuth = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');
    const tryEndpoints = [];

    if (NOTE_OVERRIDE) {
      tryEndpoints.push(NOTE_OVERRIDE.replace('{db}', db));
    }
    // common patterns
    tryEndpoints.push(`/api/${db}/patient_note`);
    tryEndpoints.push(`/api/${db}/notes`);

    let lastErrText = '';
    for (const path of tryEndpoints) {
      const url = `${API_BASE}${path}`;
      const body = {
        patient_id: patientId,
        title,
        html,
        status: 'draft',
        app_id: APP_ID,
        tag: 'Osler Wellness'
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json().catch(()=>({ok:true}));
        return { statusCode: 200, body: JSON.stringify({ ok: true, created_at: now.toISOString(), endpoint: url, data }) };
      } else {
        lastErrText = await res.text();
      }
    }

    return { statusCode: 502, body: `Could not create draft note in Plato. Last error: ${lastErrText}` };

  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
