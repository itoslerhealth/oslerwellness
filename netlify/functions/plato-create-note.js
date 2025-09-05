const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { token, patientId, html, title } = JSON.parse(event.body||'{}');
    if (!token || !patientId || !html) {
      return { statusCode: 400, body: JSON.stringify({ error: 'token, patientId, html required' }) };
    }

    // NOTE: Plato's internal draft creation endpoint is not public.
    // This function is a placeholder: it echoes back the payload so you can
    // confirm the flow works. Replace the URL and payload below with your clinic's
    // private draft-create endpoint when available.
    // Example (fictional):
    // const res = await fetch('https://clinic.platomedical.com/api/patient-notes/drafts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    //   body: JSON.stringify({ patient_id: patientId, title: title || 'Osler Wellness — POS', content_html: html })
    // });
    // const out = await res.json();
    // if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: out.error || out }) };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, echoed: { patientId, title: title || 'Osler Wellness — POS', size: html.length } })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
