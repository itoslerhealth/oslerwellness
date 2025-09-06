// netlify/functions/create_patient_note.js
// Placeholder function. If later you obtain a Plato API token + endpoint to create notes,
// you can implement it here and call from index.html.
export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, echo: true, received: event.body || null })
  };
}
