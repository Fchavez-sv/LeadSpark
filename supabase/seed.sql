-- LeadSpark - Datos de prueba (seed)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Requiere haber aplicado previamente supabase/schema.sql
--
-- Nota: este script se ejecuta con privilegios elevados en el SQL Editor,
-- por lo que inserta datos sin pasar por RLS (útil para pruebas).
-- Las notas se insertan con author_id = NULL; si deseas asociarlas a un usuario
-- interno, reemplaza NULL por el UUID del usuario en auth.users.

begin;

-- Limpiar datos de prueba previos (opcional: comenta estas líneas si no quieres borrar)
-- delete from public.lead_notes;
-- delete from public.leads;

insert into public.leads (
  full_name,
  email,
  phone,
  company,
  source,
  privacy_consent,
  consented_at,
  status,
  created_at,
  updated_at
) values
  (
    'Ana Martínez',
    'ana.martinez@innovatech.com',
    '+503 7012 3456',
    'InnovaTech',
    'Sitio web',
    true,
    now() - interval '12 days',
    'nuevo',
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    'Carlos Gómez',
    'carlos.gomez@creativasv.com',
    '+503 7222 3344',
    'Creativa SV',
    'Redes sociales',
    true,
    now() - interval '10 days',
    'contactado',
    now() - interval '10 days',
    now() - interval '3 days'
  ),
  (
    'Lucía Fernández',
    'lucia.fernandez@soluciones.com',
    '+503 7456 7890',
    'Soluciones Empresariales',
    'Referencia',
    true,
    now() - interval '9 days',
    'calificado',
    now() - interval '9 days',
    now() - interval '1 day'
  ),
  (
    'Jorge Ramírez',
    'jorge.ramirez@logistica360.com',
    '+503 7688 1122',
    'Logística 360',
    'Evento',
    true,
    now() - interval '8 days',
    'nuevo',
    now() - interval '8 days',
    now() - interval '8 days'
  ),
  (
    'María López',
    'maria.lopez@edufuturo.org',
    '+503 7990 2211',
    'EduFuturo',
    'Publicidad',
    true,
    now() - interval '7 days',
    'contactado',
    now() - interval '7 days',
    now() - interval '2 days'
  ),
  (
    'Diego Herrera',
    'diego.herrera@agroexport.com',
    '+503 7111 0099',
    'AgroExport',
    'Sitio web',
    true,
    now() - interval '6 days',
    'descartado',
    now() - interval '6 days',
    now() - interval '4 days'
  ),
  (
    'Sofía Castillo',
    'sofia.castillo@healthplus.com',
    '+503 7333 4455',
    'HealthPlus',
    'Referencia',
    true,
    now() - interval '5 days',
    'calificado',
    now() - interval '5 days',
    now() - interval '6 hours'
  ),
  (
    'Andrés Morales',
    'andres.morales@fintechlab.io',
    '+503 7555 6677',
    'Fintech Lab',
    'Redes sociales',
    true,
    now() - interval '4 days',
    'nuevo',
    now() - interval '4 days',
    now() - interval '4 days'
  ),
  (
    'Paola Reyes',
    'paola.reyes@constructora.com',
    '+503 7000 8899',
    'Constructora del Pacífico',
    'Evento',
    true,
    now() - interval '3 days',
    'contactado',
    now() - interval '3 days',
    now() - interval '1 day'
  ),
  (
    'Ricardo Vega',
    'ricardo.vega@retailpro.com',
    '+503 7666 7788',
    'RetailPro',
    'Otro',
    true,
    now() - interval '2 days',
    'nuevo',
    now() - interval '2 days',
    now() - interval '2 days'
  );

-- Notas de seguimiento de ejemplo (author_id = NULL para datos de prueba)
-- Para asociarlas a tu usuario, cambia NULL por 'TU_USER_UUID' (auth.users.id)
insert into public.lead_notes (lead_id, author_id, note, created_at)
select l.id, null, n.note, n.created_at
from public.leads l
join (
  values
    ('carlos.gomez@creativasv.com', 'Se realizó llamada inicial. Interesado en demo la próxima semana.', now() - interval '2 days'),
    ('carlos.gomez@creativasv.com', 'Enviar propuesta con plan básico y tiempos estimados.', now() - interval '1 day'),
    ('lucia.fernandez@soluciones.com', 'Lead calificado: presupuesto aprobado y necesidad confirmada.', now() - interval '20 hours'),
    ('maria.lopez@edufuturo.org', 'Solicitó información adicional por correo; pendiente seguimiento.', now() - interval '30 hours'),
    ('sofia.castillo@healthplus.com', 'Reunión exitosa. Enviar contrato preliminar.', now() - interval '4 hours'),
    ('paola.reyes@constructora.com', 'Contactada por WhatsApp, pendiente agendar reunión.', now() - interval '18 hours')
) as n(email, note, created_at)
  on l.email = n.email;

commit;

-- Verificación rápida:
-- select status, count(*) from public.leads group by status order by status;
-- select l.full_name, ln.note, ln.created_at
-- from public.lead_notes ln join public.leads l on l.id = ln.lead_id
-- order by ln.created_at desc;
