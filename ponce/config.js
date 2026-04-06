// municipios/ponce/config.js
// Configuración específica del Municipio de Ponce

window.MUNICIPIO_CONFIG = {
  // Identidad
  nombre:          "Ponce",
  sistema:         "Ponce Reporta",
  prefijo_id:      "PC",
  apodo:           "La Perla del Sur",
  email_dominio:   "ponce.gov",

  // Supabase
  supabase_url:    "https://bnpoyfwawbjqoeuuaprg.supabase.co",
  supabase_key:    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucG95Zndhd2JqcW9ldXVhcHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDAzMjYsImV4cCI6MjA5MTA3NjMyNn0.vawDmM0T773S-k7H6TSz9JOg9JW58mKrci8_SisgSKI",

  // Apariencia - Colores oficiales de Ponce (Rojo y Negro)
  color_primario:       "#CC0000",
  color_primario_dark:  "#8B0000",
  color_secundario:     "#1A1A1A",
  color_acento:         "#D4AF37",

  // Iniciales para sidebar (cuando no hay logo)
  iniciales:       "PR",

  // Logo (null = usar iniciales)
  logo_url:        null,

  // Mapa - coordenadas del centro de Ponce
  mapa_lat:        18.0111,
  mapa_lng:        -66.6141,
  mapa_zoom:       13,

  // Textos
  descripcion:     "Plataforma oficial del Municipio de Ponce para la gestión de incidencias ciudadanas en tiempo real.",
  footer_texto:    "© 2026 Municipio de Ponce. Todos los derechos reservados.",
};
