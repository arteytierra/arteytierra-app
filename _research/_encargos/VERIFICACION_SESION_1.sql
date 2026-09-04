-- ===========================================================================
-- Verificación posterior a aplicar las migraciones de la sesión 1 (Acequia).
-- Sólo lecturas: no crea, no modifica y no borra nada. Se puede correr entero
-- en el editor SQL de Supabase, tantas veces como haga falta.
--
-- Cubre 0049, 0050, 202609020001 (landing), 0051 y 0052.
-- Cada bloque devuelve una columna `ok`: todas tienen que dar true.
-- Derivado del contenido real de los archivos el 04/09/2026.
-- ===========================================================================

-- 1. Las siete tablas existen -----------------------------------------------
select 'tablas' as control,
       t.esperada,
       to_regclass(t.esperada) is not null as ok
from (values
  ('public.acequia_pilot_applications'),
  ('public.acequia_account_requests'),
  ('public.acequia_pilot_participants'),
  ('public.acequia_pilot_feedback'),
  ('public.acequia_product_events'),
  ('terreno.suscripcion_eventos_proveedor'),
  ('terreno.eventos_recorrido')
) as t(esperada);

-- 2. Todas con RLS activa ---------------------------------------------------
-- Sin esto la clave anónima podría leer postulaciones y devoluciones.
select 'rls' as control,
       n.nspname || '.' || c.relname as tabla,
       c.relrowsecurity as ok
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where (n.nspname, c.relname) in (
  ('public','acequia_pilot_applications'),
  ('public','acequia_account_requests'),
  ('public','acequia_pilot_participants'),
  ('public','acequia_pilot_feedback'),
  ('public','acequia_product_events'),
  ('terreno','suscripcion_eventos_proveedor'),
  ('terreno','eventos_recorrido')
)
order by 2;

-- 3. Las seis funciones de escritura existen y son SECURITY DEFINER ---------
-- El landing escribe únicamente por estas funciones, nunca por tabla directa.
select 'funciones' as control,
       p.proname,
       p.prosecdef as ok_security_definer,
       pg_get_function_identity_arguments(p.oid) as firma
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public','terreno')
  and p.proname in (
    'submit_acequia_pilot_application',
    'submit_acequia_account_request',
    'submit_acequia_pilot_feedback',
    'submit_acequia_product_event',
    'limite_proyectos_semilla'
  )
order by 2;

-- 4. Los índices que traen las migraciones ----------------------------------
-- acequia_account_requests_ip_hash_idx es el que falta en la versión del
-- landing: si no aparece, se aplicó ese archivo en vez de 0050.
select 'indices' as control,
       i.esperado,
       to_regclass(i.esperado) is not null as ok
from (values
  ('public.acequia_pilot_applications_created_at_idx'),
  ('public.acequia_pilot_applications_ip_hash_idx'),
  ('public.acequia_account_requests_created_at_idx'),
  ('public.acequia_account_requests_ip_hash_idx'),
  ('public.acequia_pilot_feedback_priority_idx'),
  ('public.acequia_pilot_feedback_participant_idx'),
  ('public.acequia_product_events_funnel_idx'),
  ('public.acequia_product_events_rate_idx'),
  ('terreno.suscripcion_eventos_provider_ref_idx'),
  ('terreno.eventos_recorrido_user_created_idx'),
  ('terreno.eventos_recorrido_event_created_idx')
) as i(esperado);

-- 5. Las columnas nuevas del estado de prueba (0051) ------------------------
select 'columnas_suscripciones' as control,
       c.esperada,
       exists (
         select 1 from information_schema.columns
         where table_schema = 'terreno'
           and table_name = 'suscripciones'
           and column_name = c.esperada
       ) as ok
from (values
  ('trial_start'), ('trial_end'), ('first_charge_at'),
  ('provider_event_at'), ('provider_event_id')
) as c(esperada);

-- 6. Las dos restricciones de 0051 quedaron con la definición nueva ---------
-- suscripciones_estado_check tiene que incluir 'prueba'.
select 'restricciones' as control,
       conname,
       pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid = 'terreno.suscripciones'::regclass
  and conname in ('suscripciones_estado_check','suscripciones_trial_fechas_check');

-- 7. Nadie quedó fuera de la restricción nueva de estado --------------------
-- Antes de 0051 los estados válidos eran activa/vencida/cancelada, un
-- subconjunto de los nuevos, así que esto tiene que dar 0 filas.
select 'estados_invalidos' as control, estado, count(*) as filas
from terreno.suscripciones
where estado not in ('prueba','activa','vencida','cancelada')
group by estado;

-- 8. La política de inserción propia de eventos_recorrido -------------------
select 'politicas' as control, polname, pg_get_expr(polwithcheck, polrelid) as con_check
from pg_policy
where polrelid = 'terreno.eventos_recorrido'::regclass;

-- 9. El schema terreno sigue expuesto a la API ------------------------------
-- Si terreno no está en la lista, la telemetría del navegador falla en
-- silencio: está envuelta en try/catch a propósito.
select 'schemas_expuestos' as control,
       unnest(setconfig) as ajuste
from pg_db_role_setting s
join pg_roles r on r.oid = s.setrole
where r.rolname = 'authenticator';

-- 10. Ninguna tabla del piloto quedó legible por la clave anónima -----------
-- Esperado: cero filas. Cualquier política de SELECT para anon o public acá
-- expondría correos de postulantes.
select 'lectura_anonima' as control,
       schemaname || '.' || tablename as tabla, policyname, roles
from pg_policies
where tablename in (
    'acequia_pilot_applications','acequia_account_requests',
    'acequia_pilot_participants','acequia_pilot_feedback','acequia_product_events')
  and cmd in ('SELECT','ALL')
  and (roles && array['anon','public']::name[]);
