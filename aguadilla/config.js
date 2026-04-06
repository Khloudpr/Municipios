// municipios/aguadilla/config.js
// Configuración específica del Municipio de Aguadilla

window.MUNICIPIO_CONFIG = {
  // Identidad
  nombre:          "Aguadilla",
  sistema:         "Aguadilla Reporta",
  prefijo_id:      "AG",
  apodo:           "La Villa del Ojo de Agua",
  email_dominio:   "aguadilla.gov",

  // Supabase
  supabase_url:    "https://fqwstwkbusjrzcznnwiv.supabase.co",
  supabase_key:    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd3N0d2tidXNqcnpjem5ud2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTI1OTgsImV4cCI6MjA5MDU2ODU5OH0.qeFlDHW7T8-xd3crCDnP2a57qu52TrfVaWQ7DSMJMwo",

  // Apariencia
  color_primario:       "#1e3a8a",
  color_primario_dark:  "#0f1f3d",
  color_secundario:     "#1e40af",
  color_acento:         "#3b82f6",

  // Iniciales para sidebar (cuando no hay logo)
  iniciales:       "AR",

  // Logo (URL completa o ruta relativa, null = usar iniciales)
  logo_url:        null,

  // Mapa - coordenadas del centro del municipio
  mapa_lat:        18.4274,
  mapa_lng:        -67.1541,
  mapa_zoom:       13,

  // Textos
  descripcion:     "Plataforma oficial del Municipio de Aguadilla para la gestión de incidencias ciudadanas en tiempo real.",
  footer_texto:    "© 2026 Municipio de Aguadilla. Todos los derechos reservados.",
};
