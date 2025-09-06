
// plato-context.js
(function(){
  // Simple helpers to read query params and expose env from Netlify
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  window.OW = {
    get patientId(){ return getQueryParam('patient_id'); },
    get supabaseUrl(){ return window.SUPABASE_URL || window._OW_SUPABASE_URL; },
    get supabaseAnon(){ return window.SUPABASE_ANON_KEY || window._OW_SUPABASE_ANON; }
  };
})();
