export async function handler(event) {
  try {
    const { token, html, title = 'Osler Wellness Dispense' } = JSON.parse(event.body || '{}');
    if (!token || !html) return { statusCode: 400, body: 'Missing token or html' };

    const ctxRes = await fetch('https://clinic.platomedical.com/apps/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.PLATO_APP_ID,
        app_secret: process.env.PLATO_APP_SECRET,
        token
      })
    });
    const ctx = await ctxRes.json();
    const patientId = ctx?.patient?.id;
    const database = ctx?.user?.database;
    if (!patientId || !database) return { statusCode: 400, body: 'No patient/database in context' };

    const apiUrl = `https://clinic.platomedical.com/api/${encodeURIComponent(database)}/patient_note`;
    const auth = Buffer.from(`${process.env.PLATO_APP_ID}:${process.env.PLATO_APP_SECRET}`).toString('base64');

    const notePayload = {
      patient_id: patientId,
      title,
      note: html,
      status: 'draft',
      folder: 'Osler Wellness'
    };

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(notePayload)
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Plato create note failed: ${t}`);
    }
    return { statusCode: 200, body: '{"ok":true}' };
  } catch (e) {
    return { statusCode: 500, body: e.message || 'Create note failed' };
  }
}
