exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body||'{}');
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok: false, error: String(e) }) };
  }
};
