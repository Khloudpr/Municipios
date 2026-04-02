-- ============================================================
-- SCHEMA BASE — Municipios 311
-- Ejecutar en el SQL Editor de cada proyecto Supabase nuevo
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ── TABLAS ──────────────────────────────────────────────────

-- Reportes ciudadanos
create table if not exists reportes (
  id              text primary key,              -- AG-0001, MO-0001, etc.
  nombre          text not null,
  email           text not null,
  telefono        text,
  categoria       text not null,
  departamento    text not null,
  ubicacion       text not null,
  descripcion     text not null,
  fotos           text[] default '{}',           -- array de URLs en Storage
  estatus         text not null default 'Recibido',
  prioridad       text not null default 'Media',
  lat             float,
  lng             float,
  fecha_creacion  timestamptz not null default now(),
  fecha_limite    timestamptz,                   -- calculada según SLA
  fecha_cierre    timestamptz,
  asignado_a      uuid references auth.users(id),
  contador        serial                         -- para generar el ID
);

-- Comentarios internos por reporte
create table if not exists comentarios (
  id              uuid primary key default uuid_generate_v4(),
  id_reporte      text not null references reportes(id) on delete cascade,
  texto           text not null,
  autor           text not null,
  autor_email     text not null,
  fecha           timestamptz not null default now()
);

-- Perfiles de empleados (extiende auth.users de Supabase)
create table if not exists perfiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  nombre          text not null,
  apellido        text not null,
  telefono        text,
  rol             text not null default 'empleado', -- 'admin' | 'empleado'
  departamento    text,
  permisos        text[] default '{"reportes"}',    -- 'dashboard','reportes','mapa','empleados'
  activo          boolean default true,
  created_at      timestamptz default now()
);

-- Registro de auditoría
create table if not exists audit_log (
  id              uuid primary key default uuid_generate_v4(),
  id_reporte      text references reportes(id),
  accion          text not null,                 -- 'status_change','asignacion','comentario'
  campo           text,
  valor_anterior  text,
  valor_nuevo     text,
  usuario_email   text,
  fecha           timestamptz not null default now()
);

-- Contador por municipio (para IDs tipo AG-0001)
create table if not exists config (
  clave           text primary key,
  valor           text not null
);

-- Insertar prefijo del municipio (editar según corresponda)
insert into config (clave, valor) values
  ('prefijo_id', 'AG'),         -- Cambiar: AG=Aguadilla, MO=Moca, IS=Isabela
  ('municipio_nombre', 'Aguadilla'),
  ('version_schema', '1.0.0')
on conflict (clave) do nothing;

-- ── ÍNDICES ─────────────────────────────────────────────────

create index if not exists idx_reportes_estatus      on reportes(estatus);
create index if not exists idx_reportes_categoria    on reportes(categoria);
create index if not exists idx_reportes_departamento on reportes(departamento);
create index if not exists idx_reportes_fecha        on reportes(fecha_creacion desc);
create index if not exists idx_reportes_email        on reportes(email);
create index if not exists idx_comentarios_reporte   on comentarios(id_reporte);
create index if not exists idx_audit_reporte         on audit_log(id_reporte);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table reportes    enable row level security;
alter table comentarios enable row level security;
alter table perfiles    enable row level security;
alter table audit_log   enable row level security;

-- Reportes: cualquiera puede leer (portal ciudadano público)
create policy "Lectura pública de reportes"
  on reportes for select
  using (true);

-- Reportes: cualquiera puede insertar (ciudadano reporta sin login)
create policy "Inserción pública de reportes"
  on reportes for insert
  with check (true);

-- Reportes: solo empleados autenticados pueden actualizar
create policy "Empleados actualizan reportes"
  on reportes for update
  using (auth.role() = 'authenticated');

-- Comentarios: solo empleados autenticados
create policy "Empleados leen comentarios"
  on comentarios for select
  using (auth.role() = 'authenticated');

create policy "Empleados insertan comentarios"
  on comentarios for insert
  with check (auth.role() = 'authenticated');

-- Perfiles: cada empleado lee su propio perfil; admins leen todos
create policy "Empleados leen su perfil"
  on perfiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

create policy "Solo admins modifican perfiles"
  on perfiles for all
  using (
    exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- Audit log: solo admins
create policy "Solo admins leen audit log"
  on audit_log for select
  using (
    exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

create policy "Sistema inserta en audit log"
  on audit_log for insert
  with check (true);

-- ── FUNCIÓN: generar ID de reporte ──────────────────────────

create or replace function generar_id_reporte()
returns trigger as $$
declare
  prefijo text;
  numero  int;
begin
  select valor into prefijo from config where clave = 'prefijo_id';
  numero := new.contador;
  new.id := prefijo || '-' || lpad(numero::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger trigger_generar_id
  before insert on reportes
  for each row
  execute function generar_id_reporte();

-- ── FUNCIÓN: calcular fecha límite SLA ──────────────────────

create or replace function calcular_fecha_limite()
returns trigger as $$
begin
  new.fecha_limite := case new.prioridad
    when 'Alta'  then new.fecha_creacion + interval '2 days'
    when 'Media' then new.fecha_creacion + interval '5 days'
    when 'Baja'  then new.fecha_creacion + interval '10 days'
    else               new.fecha_creacion + interval '5 days'
  end;
  return new;
end;
$$ language plpgsql;

create trigger trigger_sla
  before insert on reportes
  for each row
  execute function calcular_fecha_limite();

-- ── FUNCIÓN: registrar cambios en audit_log ─────────────────

create or replace function registrar_cambio_estatus()
returns trigger as $$
begin
  if old.estatus is distinct from new.estatus then
    insert into audit_log (id_reporte, accion, campo, valor_anterior, valor_nuevo)
    values (new.id, 'status_change', 'estatus', old.estatus, new.estatus);
  end if;
  if old.prioridad is distinct from new.prioridad then
    insert into audit_log (id_reporte, accion, campo, valor_anterior, valor_nuevo)
    values (new.id, 'status_change', 'prioridad', old.prioridad, new.prioridad);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_audit
  after update on reportes
  for each row
  execute function registrar_cambio_estatus();

-- ── STORAGE ─────────────────────────────────────────────────

-- Crear bucket para fotos de reportes (ejecutar desde Dashboard de Supabase
-- o descomentar si tu plan lo permite via SQL):
--
-- insert into storage.buckets (id, name, public)
-- values ('fotos-reportes', 'fotos-reportes', true);
--
-- create policy "Subida pública de fotos"
--   on storage.objects for insert
--   with check (bucket_id = 'fotos-reportes');
--
-- create policy "Lectura pública de fotos"
--   on storage.objects for select
--   using (bucket_id = 'fotos-reportes');
