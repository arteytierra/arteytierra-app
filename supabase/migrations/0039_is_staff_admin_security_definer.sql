-- =====================================================================
-- 0039_is_staff_admin_security_definer.sql
-- Convierte app.is_staff() y app.is_admin() en SECURITY DEFINER.
--
-- Motivo (bug de RLS confirmado en producción):
--   En 0001_init.sql estas funciones se crearon `language sql stable`
--   pero SIN security definer. Muchas policies RLS las invocan, p.ej:
--     create policy "products public" on shop.products
--       for select using (is_active or app.is_staff());
--
--   Cuando el rol anónimo evalúa esa policy, is_staff() ejecuta
--   `select 1 from app.profiles` CON LOS PERMISOS DE anon, que no tiene
--   grant sobre app.profiles  ->  ERROR "permission denied for table
--   profiles". Eso rompe la lectura anónima de TODA tabla cuyas policies
--   usen estas funciones (se detectó porque listProducts/getProductBySlug
--   devolvían vacío/404 para visitantes no logueados).
--
-- Fix de raíz:
--   Con SECURITY DEFINER el cuerpo corre con los permisos del OWNER de la
--   función (que sí puede leer app.profiles), de modo que la evaluación
--   anónima de las policies deja de fallar, sin necesidad de leer con
--   service-role en el código.
--
-- Seguridad / ausencia de escalada de privilegios:
--   * Ninguna de las dos funciones recibe parámetros: el llamador no puede
--     manipular a quién consultan.
--   * Filtran estrictamente por `id = auth.uid()`, el UID de la sesión
--     actual. Un visitante anónimo tiene auth.uid() = NULL  ->  0 filas
--     ->  devuelven false. No exponen datos de otros usuarios ni el
--     contenido de app.profiles; sólo un booleano sobre el rol propio.
--   * Se fija `search_path = ''` y el cuerpo referencia todo de forma
--     totalmente calificada (app.profiles, auth.uid()) para blindar contra
--     ataques de secuestro de search_path en funciones SECURITY DEFINER.
--     (pg_catalog se busca siempre de forma implícita, así que operadores
--      y casts resuelven sin problema.)
--
-- Idempotencia:
--   `create or replace function` es idempotente y conserva los grants
--   existentes (EXECUTE a PUBLIC, necesario para que anon evalúe las RLS).
--
-- Nota (26/08/2026): este archivo se aplicó a producción pero nunca quedó
-- commiteado al repo — se reconstruyó tal cual desde
-- supabase_migrations.schema_migrations (versión 0039) al detectar el
-- hueco al validar las migraciones nuevas de anteproyectos (A3). Contenido
-- verificado igual al que corre en la base real, no una reconstrucción
-- aproximada.
-- =====================================================================

begin;

create or replace function app.is_staff() returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

create or replace function app.is_admin() returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

commit;
