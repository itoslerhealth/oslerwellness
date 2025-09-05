exports.handler = async (event, context) => {
  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
  const PLATO_APP_ID = process.env.PLATO_APP_ID || "";
  // Token & patientId can be passed via query params from Plato embed
  const params = event.queryStringParameters || {};
  const token = params.token || "";
  const patientId = params.patientId || "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY, PLATO_APP_ID, token, patientId })
  };
};
