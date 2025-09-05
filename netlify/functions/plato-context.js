export async function handler(event) {
  try {
    const token = event.queryStringParameters?.token;
    if (!token) return { statusCode: 400, body: 'Missing token' };

    const r = await fetch('https://clinic.platomedical.com/apps/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.PLATO_APP_ID,
        app_secret: process.env.PLATO_APP_SECRET,
        token
      })
    });
    if (!r.ok) {
      const t = await r.text();
      return { statusCode: r.status, body: t };
    }
    const ctx = await r.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        patientId: ctx?.patient?.id || null,
        patientName: ctx?.patient?.name || null,
        database: ctx?.user?.database || null
      })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || 'Context failed' };
  }
}
