export function getContext() {
  const q = new URLSearchParams(location.search);
  return {
    token: q.get('token') || '',
    patient_id: q.get('patient_id') || ''
  };
}
