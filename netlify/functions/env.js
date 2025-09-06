exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      PLATO_APP_ID: process.env.PLATO_APP_ID || '',
      PLATO_API_BASE: process.env.PLATO_API_BASE || ''
    })
  };
};
