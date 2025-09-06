exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      hasAppId: !!process.env.PLATO_APP_ID,
      hasSecret: !!process.env.PLATO_APP_SECRET,
      db: process.env.PLATO_DB || null,
      method: event.httpMethod,
      query: event.queryStringParameters || null
    })
  };
};
