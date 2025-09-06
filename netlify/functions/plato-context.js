
// /.netlify/functions/plato-context
// Minimal token verifier using HMAC-SHA256. Token format:
//   base64url(JSON payload).hex(hmac_sha256(payload, APP_SECRET))
// Payload example: {"patientId":"P123","exp": 1735689600}  // exp = unix seconds
// Generate this token server-side in Plato app before opening the iframe.
const crypto = require("crypto");

exports.handler = async (event) => {
  const token = (event.queryStringParameters && event.queryStringParameters.token) || "";
  const secret = process.env.APP_SECRET; // set in Netlify env
  let patientId = null;

  try{
    if(!token || !secret){ throw new Error("Missing token or secret"); }
    const parts = token.split(".");
    if(parts.length !== 2) throw new Error("Bad token");
    const payloadB64 = parts[0];
    const sigHex = parts[1];

    // verify signature
    const expected = crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
    if(!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sigHex, "hex"))){
      throw new Error("Bad signature");
    }

    const json = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if(json.exp && Date.now()/1000 > Number(json.exp)){ throw new Error("Token expired"); }
    patientId = json.patientId || null;
  }catch(e){
    return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "invalid_token" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId })
  };
};
