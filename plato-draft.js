/**
 * Frontend helper: call the Netlify function to create a Plato draft note.
 * Usage:
 *   await window.createPlatoDraft({
 *     token: new URLSearchParams(location.search).get('token'),
 *     patientId: window.osler?.patientId, // optional override
 *     doctorInitials: 'AB',
 *     remarks: '1 tab bd',
 *     items: [{name:'ABC', qty:1, unit_price:55, loc:'SV'}]
 *   });
 */
window.createPlatoDraft = async function(payload){
  const token = payload?.token || new URLSearchParams(location.search).get('token');
  if(!token){ throw new Error('Missing token in URL'); }
  const res = await fetch('/.netlify/functions/create_plato_note?token=' + encodeURIComponent(token), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok){ throw new Error(data?.error || (data && JSON.stringify(data)) || 'Failed to create Plato draft'); }
  return data;
}
