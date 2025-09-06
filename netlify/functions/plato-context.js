exports.handler = async (event) => {
  const url = new URL(event.rawUrl || ('https://x'+event.path+'?'+event.queryStringParameters));
  const token = url.searchParams.get('token') || '';
  const patientIdQS = url.searchParams.get('patient_id');
  const resp = { patientId: null, patientName: null };

  if (patientIdQS) {
    resp.patientId = patientIdQS;
  } else if (token && token.includes('pid:')) {
    const m = token.match(/pid:([A-Za-z0-9_\-]+)/);
    if (m) resp.patientId = m[1];
  }

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(resp) };
};
