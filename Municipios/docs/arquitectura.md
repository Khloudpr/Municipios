# Arquitectura del Sistema

## Diagrama general

```
CIUDADANO                    EMPLEADO / ADMIN
    │                              │
    ▼                              ▼
index.html              ┌── login.html ──────────────────────┐
aguadilla-reporta-      │   hub.html                         │
completo.html           │   dashboard1.html                  │
consulta.html           │   reportes1.html                   │
mis-reportes.html       │   mapa1.html                       │
transparencia.html      │   empleados.html                   │
                        └────────────────────────────────────┘
    │                              │
    └──────────────┬───────────────┘
                   │
                   ▼
         config.js (por municipio)
         shared/js/supabase-client.js
         shared/js/auth.js
         shared/js/utils.js
                   │
                   ▼
         ┌─────────────────────┐
         │   SUPABASE          │
         │                     │
         │  PostgreSQL         │
         │  ├── reportes       │
         │  ├── perfiles       │
         │  ├── comentarios    │
         │  ├── audit_log      │
         │  └── config         │
         │                     │
         │  Storage            │
         │  └── fotos-reportes │
         │                     │
         │  Auth               │
         │  └── usuarios       │
         │                     │
         │  Edge Functions     │
         │  ├── nuevo-reporte  │
         │  ├── update-status  │
         │  ├── verif-duplic.  │
         │  ├── sla-check      │
         │  └── send-email     │
         └─────────────────────┘
                   │
                   ▼
              RESEND (email)
```

---

## Flujo de un reporte ciudadano

```
1. Ciudadano llena el formulario
        │
2. JS verifica duplicados (Edge Function verificar-duplicado)
        │
3. Si no es duplicado → sube fotos a Storage
        │
4. Edge Function nuevo-reporte:
   ├── Inserta en tabla reportes
   ├── Trigger genera ID (AG-0001)
   ├── Trigger calcula fecha_limite (SLA)
   └── Envía email de confirmación via Resend
        │
5. Empleado ve el reporte en reportes1.html
        │
6. Empleado cambia estatus → Edge Function update-status:
   ├── Actualiza tabla reportes
   ├── Trigger registra en audit_log
   ├── Inserta comentario (si aplica)
   └── Envía email al ciudadano via Resend
        │
7. Cron diario (sla-check) a las 8am:
   └── Email a admins con reportes vencidos
```

---

## Decisiones de diseño

### ¿Por qué un Supabase por municipio?
- Los datos de cada municipio están completamente aislados
- Si un municipio cancela, se archiva su proyecto sin afectar a otros
- Respuesta clara ante la pregunta "¿mis datos están mezclados?"
- Cada municipio puede tener su propio plan y facturación

### ¿Por qué Supabase y no Firebase?
- PostgreSQL es SQL estándar — cualquier desarrollador lo entiende
- Row Level Security nativa — sin lógica de permisos en el frontend
- Edge Functions en Deno — mismo lenguaje que el frontend (TypeScript)
- Precio predecible — no "pay per read" como Firestore
- Dashboard SQL directo para el cliente si quiere ver sus datos

### ¿Por qué Resend y no SendGrid?
- API más simple — una llamada fetch, sin SDKs
- Free tier generoso: 3,000 emails/mes gratis
- Mejor deliverability en 2024-2025
- Dashboard limpio para ver logs de emails

### ¿Por qué no un framework (React, Vue)?
- Los HTML actuales ya funcionan y el cliente los conoce
- Zero build step — GitHub Pages funciona directo
- Más fácil para un municipio auditar el código si lo piden
- La migración de GAS a Supabase ya es suficiente cambio

---

## Límites y escalabilidad

| Recurso              | Free tier     | Pro ($25/mes) | Límite real       |
|----------------------|---------------|---------------|-------------------|
| Rows en DB           | Sin límite    | Sin límite    | Sin límite        |
| Storage              | 1 GB          | 100 GB        | Escalable         |
| Edge Function invoc. | 500K/mes      | 2M/mes        | Suficiente        |
| Auth users           | 50K           | 100K          | Más que suficiente|
| Bandwidth            | 5 GB          | 250 GB        | OK para municipio |

Un municipio típico en PR podría tener:
- 500-2,000 reportes al año
- 10-50 empleados activos
- 100-500 fotos al mes

El free tier aguanta 1-2 municipios. Pro aguanta 10+ sin problemas.
