const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const { token, patientId, title, html } = JSON.parse(event.body || '{}');
    if (!token) return { statusCode: 400, body: 'Missing token' };
    if (!patientId) return { statusCode: 400, body: 'Missing patientId' };
    const base = process.env.PLATO_BASE || 'https://clinic.platomedical.com';

    // NOTE: Replace the path below with the actual Plato endpoint if needed.
    // This stub just echoes back so you can verify wiring end-to-end.
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, echoed: { patientId, title, html length: (html||'').length } })
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};