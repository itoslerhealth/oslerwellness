export async function handler(event, _context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { patient_id, items, doctor_initials, remarks } = JSON.parse(event.body || '{}');
    if (!patient_id || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Missing patient_id or items' };
    }
    const API_BASE = process.env.PLATO_API_BASE || 'https://clinic.platomedical.com';
    const APP_ID = process.env.PLATO_APP_ID;
    const APP_SECRET = process.env.PLATO_APP_SECRET;
    if (!APP_ID || !APP_SECRET) {
      return { statusCode: 500, body: 'Server missing PLATO_APP_ID/PLATO_APP_SECRET env vars' };
    }
    const rows = items.map(it => `
      <tr>
        <td>${escapeHtml(it.product || '')}</td>
        <td style="text-align:right">${Number(it.qty || 0)}</td>
        <td>${escapeHtml(it.dosage || '')}</td>
      </tr>
    `).join('');

    const html = `
      <h3>Osler Wellness — Dispense</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>Product</th><th>Qty</th><th>Dosage</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><b>Doctor:</b> ${escapeHtml(doctor_initials || '')}</p>
      ${remarks ? `<p><b>Remarks:</b> ${escapeHtml(remarks)}</p>` : ''}
    `;

    const resp = await fetch(`${API_BASE}/api/custom-apps/notes/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Plato-App-Id': APP_ID,
        'X-Plato-App-Secret': APP_SECRET
      },
      body: JSON.stringify({
        patient_id,
        title: 'Osler Wellness — Dispense',
        html
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, body: `Plato API error: ${text}` };
    }

    const data = await resp.json().catch(() => ({}));
    return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
  } catch (err) {
    return { statusCode: 500, body: `Server error: ${String(err)}` };
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}