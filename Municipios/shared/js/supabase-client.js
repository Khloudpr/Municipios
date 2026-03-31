// shared/js/supabase-client.js
// Inicialización de Supabase — importar en cada HTML que necesite DB

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Las variables vienen del config.js del municipio
// que se carga antes que este archivo
const supabase = createClient(
  window.MUNICIPIO_CONFIG.supabase_url,
  window.MUNICIPIO_CONFIG.supabase_key
);

export default supabase;
