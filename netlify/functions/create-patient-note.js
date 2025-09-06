exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');

    const APP_ID = process.env.PLATO_APP_ID;
    const APP_SECRET = process.env.PLATO_APP_SECRET;
    const DB = process.env.PLATO_DB || 'default';

    if (!APP_ID || !APP_SECRET) {
      return { statusCode: 500, body: 'Missing PLATO_APP_ID/PLATO_APP_SECRET' };
    }
    if (!body.patient_id) {
      return { statusCode: 400, body: 'patient_id required' };
    }

    // Compose a simple HTML block for the draft
    const html = `
      <h3>Osler Wellness — Dispense</h3>
      <p><b>Product:</b> ${body.product || ''}<br/>
         <b>Qty:</b> ${body.qty || ''}<br/>
         <b>Doctor:</b> ${body.doctor || ''}<br/>
         <b>Dosage/Remarks:</b> ${body.remarks || ''}</p>
    `;

    // Plato draft note endpoint per tenant database
    const url = `https://clinic.platomedical.com/api/apps/${APP_ID}/patients/${encodeURIComponent(body.patient_id)}/notes?db=${encodeURIComponent(DB)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-app-secret': APP_SECRET
      },
      body: JSON.stringify({ title: 'Osler Wellness', html })
    });

    const text = await res.text();
    const ok = res.ok ? 'OK' : 'ERROR';
    return { statusCode: res.status, body: `${ok}: ${text}` };

  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
