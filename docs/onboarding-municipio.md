# Guía: Agregar un municipio nuevo

Tiempo estimado: 2-3 horas

---

## Paso 1 — Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New project
2. Nombre: `municipios-[nombre]` (ej: `municipios-moca`)
3. Password: guardar en lugar seguro
4. Region: **US East (N. Virginia)** — la más cercana a PR
5. Esperar ~2 minutos hasta que el proyecto esté listo

### Obtener las keys
- Settings → API → copiar `Project URL` y `anon public`
- Settings → API → copiar `service_role` (guardar seguro, nunca en GitHub)

---

## Paso 2 — Aplicar el schema

1. SQL Editor → New query
2. Pegar el contenido de `shared/supabase/schema.sql`
3. Editar las primeras líneas del INSERT en `config`:
   ```sql
   insert into config (clave, valor) values
     ('prefijo_id', 'MO'),              -- iniciales del municipio
     ('municipio_nombre', 'Moca'),      -- nombre completo
     ('version_schema', '1.0.0')
   ```
4. Run → verificar que no hay errores

---

## Paso 3 — Crear bucket de fotos

1. Storage → New bucket
2. Name: `fotos-reportes`
3. Public bucket: ✅ activar
4. Allowed MIME types: `image/jpeg, image/png, image/webp`
5. Max file size: `5 MB`

---

## Paso 4 — Cargar datos de demo (opcional)

Si es para presentaciones antes de tener datos reales:

1. SQL Editor → New query
2. Pegar `shared/supabase/seed-demo.sql`
3. Cambiar las referencias a `AG-` por el prefijo del nuevo municipio si es necesario
4. Run

---

## Paso 5 — Deploy de las Edge Functions

```bash
# Instalar Supabase CLI si no está
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref [ref-del-proyecto]

# Deploy de todas las functions
supabase functions deploy nuevo-reporte
supabase functions deploy update-status
supabase functions deploy verificar-duplicado
supabase functions deploy sla-check
supabase functions deploy send-email
```

### Configurar variables de entorno en las functions
En Supabase Dashboard → Edge Functions → cada función → Secrets:

```
RESEND_API_KEY        = re_xxxxxxxxxxxx
MUNICIPIO_NOMBRE      = Moca
SITE_URL              = https://moca.municipioreporta.com
```

### Configurar el cron de SLA
Dashboard → Edge Functions → `sla-check` → Schedule:
```
0 8 * * *
```
(todos los días a las 8:00 AM)

---

## Paso 6 — Crear carpeta del municipio

```bash
cp -r municipios/demo municipios/moca
```

Editar `municipios/moca/config.js`:
- `nombre`: "Moca"
- `sistema`: "Moca Reporta"
- `prefijo_id`: "MO"
- `supabase_url`: URL del proyecto nuevo
- `supabase_key`: anon key del proyecto nuevo
- `categorias`: las que el municipio defina en el kick-off
- `departamentos`: los del municipio
- `color_primario`: color del municipio si quieren personalización

Crear `municipios/moca/.env` con los valores reales (nunca subir a GitHub).

---

## Paso 7 — Crear el primer usuario admin

En Supabase Dashboard → Authentication → Users → Invite user:
- Email del alcalde o director de sistemas
- Luego en SQL Editor:
  ```sql
  insert into perfiles (id, nombre, apellido, email, rol, permisos)
  values (
    '[uuid del usuario creado]',
    'Nombre',
    'Apellido',
    'email@municipio.pr.gov',
    'admin',
    '{"dashboard","reportes","mapa","empleados"}'
  );
  ```

---

## Paso 8 — Verificar

Checklist antes de entregar al municipio:

- [ ] Login funciona con el usuario admin
- [ ] Portal ciudadano puede enviar un reporte
- [ ] El reporte aparece en `reportes1.html`
- [ ] Se puede cambiar el estatus
- [ ] El email de confirmación llega al ciudadano
- [ ] El dashboard muestra estadísticas
- [ ] El mapa muestra los reportes
- [ ] El SLA se calcula correctamente

---

## Estructura de costos por municipio nuevo

| Concepto          | Costo mensual |
|-------------------|---------------|
| Supabase Pro      | $25           |
| Resend (email)    | $0 (hasta 3,000 emails/mes) |
| Dominio           | ~$1 (si usas subdominio propio) |
| **Total infra**   | **~$26/mes**  |
| **Tu margen**     | **~$774/mes** |
