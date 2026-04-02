# Municipios — Sistema 311 para Puerto Rico

Plataforma municipal de gestión de incidencias. Un sistema completo por municipio, con base de datos propia en Supabase.

---

## Municipios activos

| Municipio | Estado      | URL                               | Supabase Project       |
|-----------|-------------|-----------------------------------|------------------------|
| Demo      | Demo        | demo.municipioreporta.com         | —                      |
| Aguadilla | En progreso | aguadilla.municipioreporta.com    | —                      |

---

## Estructura del repositorio

```
Municipios/
├── docs/                          Documentación técnica y comercial
├── shared/                        Código compartido entre todos los municipios
│   ├── components/                Fragmentos HTML reutilizables
│   ├── css/                       Estilos base
│   ├── js/                        Lógica compartida (auth, supabase client, utils)
│   └── supabase/
│       ├── schema.sql             Schema base — se aplica en cada proyecto nuevo
│       ├── seed-demo.sql          Datos de demo para presentaciones
│       └── functions/             Edge Functions — iguales para todos
│           ├── nuevo-reporte/
│           ├── update-status/
│           ├── verificar-duplicado/
│           ├── sla-check/
│           └── send-email/
│
└── municipios/                    Un folder por cliente
    ├── demo/                      Ambiente permanente de presentaciones
    └── aguadilla/                 Primer municipio
```

---

## Agregar un municipio nuevo

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `/municipios/demo` → `/municipios/[nombre]`
3. Editar `config.js` con los datos del municipio
4. Crear `.env` basado en `.env.example` con las keys del nuevo proyecto
5. Ejecutar `shared/supabase/schema.sql` en el SQL Editor de Supabase
6. (Opcional) Ejecutar `shared/supabase/seed-demo.sql` para datos iniciales
7. Deploy en GitHub Pages o Netlify

**Tiempo estimado: 2-3 horas por municipio nuevo.**

---

## Variables de entorno requeridas

Cada municipio tiene su propio `.env` (nunca se sube a GitHub):

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## Stack técnico

| Capa        | Tecnología                        |
|-------------|-----------------------------------|
| Frontend    | HTML + Tailwind CSS + Vanilla JS  |
| Base de datos | PostgreSQL (Supabase)            |
| Auth        | Supabase Auth                     |
| Storage     | Supabase Storage (fotos)          |
| Functions   | Supabase Edge Functions           |
| Email       | Resend                            |
| Mapas       | Leaflet + OpenStreetMap           |
| Gráficas    | Chart.js                          |
