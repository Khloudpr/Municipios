// municipios/demo/config.js
// Ambiente de demo — para presentaciones a municipios nuevos

window.MUNICIPIO_CONFIG = {
  nombre:           "Demo Municipio",
  sistema:          "Municipio Reporta",
  prefijo_id:       "DM",

  supabase_url:     "https://xxxxxxxxxxxx.supabase.co",
  supabase_key:     "eyJhbGciOiJIUzI1NiIsInR5cCI6...",

  color_primario:   "#1E3A5F",
  color_secundario: "#2563EB",

  categorias: [
    "Baches y Pavimento",
    "Alumbrado Público",
    "Recogido de Basura",
    "Inundaciones",
    "Parques y Recreación",
    "Señalización",
    "Agua y Alcantarillado",
    "Ambiente",
    "Vandalismo / Grafiti",
    "Otro"
  ],

  departamentos: [
    "Obras Públicas",
    "Servicios Municipales",
    "Ambiente",
    "Parques y Recreación",
    "Policía Municipal",
    "Oficina del Alcalde"
  ],

  sla: { Alta: 2, Media: 5, Baja: 10 },

  email_contacto: "demo@municipioreporta.com",
  telefono:       "(787) 000-0000",
  sitio_web:      "https://demo.municipioreporta.com"
};
