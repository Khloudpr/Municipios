// municipios/aguadilla/config.js
// Configuración específica del Municipio de Aguadilla
// Este archivo es el ÚNICO que cambia entre municipios

window.MUNICIPIO_CONFIG = {
  // Identidad
  nombre:           "Aguadilla",
  sistema:          "Aguadilla Reporta",
  prefijo_id:       "AG",

  // Supabase — reemplazar con valores reales del proyecto
  supabase_url:     "https://xxxxxxxxxxxx.supabase.co",
  supabase_key:     "eyJhbGciOiJIUzI1NiIsInR5cCI6...",

  // Apariencia
  color_primario:   "#1E3A5F",
  color_secundario: "#2563EB",

  // Categorías de reportes
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

  // Departamentos municipales
  departamentos: [
    "Obras Públicas",
    "Servicios Municipales",
    "Ambiente",
    "Parques y Recreación",
    "Policía Municipal",
    "Oficina del Alcalde"
  ],

  // SLA en días por prioridad
  sla: {
    Alta:  2,
    Media: 5,
    Baja:  10
  },

  // Contacto
  email_contacto:   "info@aguadilla.pr.gov",
  telefono:         "(787) 882-3505",
  sitio_web:        "https://www.aguadilla.pr.gov"
};
