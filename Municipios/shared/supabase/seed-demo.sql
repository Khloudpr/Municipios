-- ============================================================
-- SEED DE DEMO — datos para presentaciones
-- Ejecutar DESPUÉS del schema.sql
-- ============================================================

-- Nota: los IDs los genera el trigger automáticamente.
-- Insertamos con un pequeño hack: forzamos el contador para
-- que los IDs queden bonitos en la demo.

-- ── REPORTES ────────────────────────────────────────────────

insert into reportes
  (nombre, email, telefono, categoria, departamento, ubicacion, descripcion,
   estatus, prioridad, lat, lng, fecha_creacion, fecha_cierre)
values

-- Resueltos (para que las estadísticas se vean bien)
('Carlos Rodríguez',   'carlos.rodriguez@gmail.com',  '787-555-0101', 'Baches y Pavimento',     'Obras Públicas',          'Calle Principal #45, Aguadilla',          'Bache profundo frente al supermercado que daña los vehículos.',          'Resuelto', 'Alta',  18.4274, -67.1541, now() - interval '28 days', now() - interval '26 days'),
('María Colón',        'maria.colon@yahoo.com',       '787-555-0102', 'Alumbrado Público',       'Obras Públicas',          'Ave. Miramar esq. Calle 3',               'Tres postes de luz apagados, zona oscura y peligrosa por las noches.',   'Resuelto', 'Alta',  18.4281, -67.1528, now() - interval '25 days', now() - interval '22 days'),
('José Torres',        'jose.torres@hotmail.com',     '787-555-0103', 'Recogido de Basura',      'Servicios Municipales',   'Urb. Vista Alegre, Calle Orquídea',       'Llevan dos semanas sin pasar a buscar la basura.',                       'Resuelto', 'Media', 18.4265, -67.1555, now() - interval '22 days', now() - interval '19 days'),
('Ana Martínez',       'ana.martinez@gmail.com',      '787-555-0104', 'Parques y Recreación',    'Parques y Recreación',    'Parque Central, Aguadilla',               'Los columpios están rotos y representan peligro para los niños.',         'Resuelto', 'Media', 18.4290, -67.1510, now() - interval '20 days', now() - interval '16 days'),
('Luis Vega',          'luis.vega@gmail.com',         '787-555-0105', 'Señalización',             'Obras Públicas',          'Carr. 2 KM 123, Aguadilla',               'Señal de pare caída desde el último huracán.',                           'Resuelto', 'Alta',  18.4258, -67.1570, now() - interval '18 days', now() - interval '15 days'),
('Carmen López',       'carmen.lopez@yahoo.com',      '787-555-0106', 'Agua y Alcantarillado',   'Servicios Municipales',   'Barrio Borinquen, Calle 7',               'Alcantarilla tapada causando inundación en la calle.',                   'Resuelto', 'Alta',  18.4302, -67.1498, now() - interval '15 days', now() - interval '12 days'),
('Pedro Jiménez',      'pedro.jimenez@gmail.com',     '787-555-0107', 'Baches y Pavimento',      'Obras Públicas',          'Calle Comercio #12',                      'Múltiples baches en toda la cuadra.',                                    'Resuelto', 'Media', 18.4270, -67.1545, now() - interval '14 days', now() - interval '11 days'),
('Rosa Hernández',     'rosa.hernandez@gmail.com',    '787-555-0108', 'Ambiente',                'Ambiente',                'Sector La Palma, detrás del estadio',     'Vertedero ilegal con escombros y basura acumulada.',                     'Resuelto', 'Alta',  18.4245, -67.1580, now() - interval '12 days', now() - interval '9 days'),
('Miguel Santos',      'miguel.santos@hotmail.com',   '787-555-0109', 'Alumbrado Público',       'Obras Públicas',          'Ave. Las Monjas #78',                     'Poste de luz parpadeando toda la noche.',                                'Resuelto', 'Baja',  18.4286, -67.1520, now() - interval '10 days', now() - interval '7 days'),
('Isabel Rivera',      'isabel.rivera@gmail.com',     '787-555-0110', 'Parques y Recreación',    'Parques y Recreación',    'Cancha Cerro Punta',                      'Cancha de baloncesto sin iluminación.',                                  'Resuelto', 'Media', 18.4261, -67.1562, now() - interval '9 days',  now() - interval '6 days'),

-- En proceso
('Fernando García',    'fernando.garcia@gmail.com',   '787-555-0111', 'Baches y Pavimento',      'Obras Públicas',          'Carr. 107 intersección Aguadilla Mall',   'Bache enorme en la entrada del mall que ha dañado varios vehículos.',    'En proceso', 'Alta',  18.4275, -67.1538, now() - interval '5 days',  null),
('Gabriela Cruz',      'gabriela.cruz@yahoo.com',     '787-555-0112', 'Recogido de Basura',      'Servicios Municipales',   'Cond. Vista Mar, Apt 3B',                 'El camión de basura no ha pasado en 10 días.',                           'En proceso', 'Media', 18.4283, -67.1525, now() - interval '4 days',  null),
('Roberto Morales',    'roberto.morales@gmail.com',   '787-555-0113', 'Agua y Alcantarillado',   'Servicios Municipales',   'Calle Segunda #34',                       'Tubería rota con agua saliendo a la calle hace dos días.',               'En proceso', 'Alta',  18.4268, -67.1550, now() - interval '3 days',  null),
('Stephanie Ortiz',    'stephanie.ortiz@gmail.com',   '787-555-0114', 'Alumbrado Público',       'Obras Públicas',          'Urb. El Trigal, Calle Acacia',            'Sector completo sin alumbrado desde anoche.',                            'En proceso', 'Alta',  18.4293, -67.1505, now() - interval '2 days',  null),
('Héctor Delgado',     'hector.delgado@hotmail.com',  '787-555-0115', 'Señalización',             'Obras Públicas',          'Cruce Calle Marina con Ave. Colon',       'Semáforo dañado, solo enciende en verde.',                               'En proceso', 'Alta',  18.4255, -67.1575, now() - interval '2 days',  null),

-- Recibidos (nuevos)
('Xiomara Peña',       'xiomara.pena@gmail.com',      '787-555-0116', 'Ambiente',                'Ambiente',                'Playa Crashboat, área de picnic',         'Basura acumulada en el área de picnic de la playa.',                     'Recibido', 'Media', 18.4240, -67.1588, now() - interval '1 day',   null),
('Andrés Medina',      'andres.medina@yahoo.com',     '787-555-0117', 'Baches y Pavimento',      'Obras Públicas',          'Calle Las Flores #89',                    'Bache peligroso cerca de la escuela elemental.',                         'Recibido', 'Alta',  18.4278, -67.1533, now() - interval '18 hours', null),
('Valeria Ruiz',       'valeria.ruiz@gmail.com',      '787-555-0118', 'Parques y Recreación',    'Parques y Recreación',    'Parque Infantil Sector Norte',            'Tobogán roto que puede causar accidente a los niños.',                   'Recibido', 'Media', 18.4263, -67.1558, now() - interval '12 hours', null),
('Orlando Méndez',     'orlando.mendez@gmail.com',    '787-555-0119', 'Recogido de Basura',      'Servicios Municipales',   'Res. Manuel Portela, Bloque 5',           'Acumulación de basura en el área común del residencial.',                'Recibido', 'Media', 18.4288, -67.1515, now() - interval '6 hours',  null),
('Natalia Flores',     'natalia.flores@yahoo.com',    '787-555-0120', 'Agua y Alcantarillado',   'Servicios Municipales',   'Calle Betances esq. Calle Luna',          'Alcantarilla desbordada con olor desagradable.',                         'Recibido', 'Alta',  18.4257, -67.1568, now() - interval '2 hours',  null);

-- ── COMENTARIOS DE DEMO ─────────────────────────────────────

-- Nota: los IDs de reporte los asigna el trigger (AG-0001, AG-0002, etc.)
-- Los comentarios se agregan manualmente a los reportes "En proceso"

insert into comentarios (id_reporte, texto, autor, autor_email, fecha) values
  ('AG-0011', 'Confirmado. Coordinando con contratista para reparación esta semana.', 'Juan Díaz', 'juan.diaz@aguadilla.pr.gov', now() - interval '4 days'),
  ('AG-0011', 'Material solicitado al almacén. Reparación programada para el jueves.', 'Juan Díaz', 'juan.diaz@aguadilla.pr.gov', now() - interval '2 days'),
  ('AG-0012', 'Contactado al ciudadano. Próxima ruta de recogido es mañana.', 'Pedro Ramos', 'pedro.ramos@aguadilla.pr.gov', now() - interval '3 days'),
  ('AG-0013', 'Cuadrilla en camino. ETA 2 horas.', 'Luis Pérez', 'luis.perez@aguadilla.pr.gov', now() - interval '1 day'),
  ('AG-0014', 'Reportado a LUMA. Esperando respuesta en 24 horas.', 'Carmen Vélez', 'carmen.velez@aguadilla.pr.gov', now() - interval '1 day');

-- ── AUDIT LOG DE DEMO ───────────────────────────────────────

insert into audit_log (id_reporte, accion, campo, valor_anterior, valor_nuevo, usuario_email, fecha) values
  ('AG-0001', 'status_change', 'estatus', 'Recibido',    'En proceso', 'juan.diaz@aguadilla.pr.gov',    now() - interval '27 days'),
  ('AG-0001', 'status_change', 'estatus', 'En proceso',  'Resuelto',   'juan.diaz@aguadilla.pr.gov',    now() - interval '26 days'),
  ('AG-0002', 'status_change', 'estatus', 'Recibido',    'En proceso', 'pedro.ramos@aguadilla.pr.gov',  now() - interval '24 days'),
  ('AG-0002', 'status_change', 'estatus', 'En proceso',  'Resuelto',   'pedro.ramos@aguadilla.pr.gov',  now() - interval '22 days'),
  ('AG-0011', 'status_change', 'estatus', 'Recibido',    'En proceso', 'juan.diaz@aguadilla.pr.gov',    now() - interval '4 days'),
  ('AG-0013', 'status_change', 'estatus', 'Recibido',    'En proceso', 'luis.perez@aguadilla.pr.gov',   now() - interval '2 days');
