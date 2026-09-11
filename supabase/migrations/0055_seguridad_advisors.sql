-- Los avisos de seguridad que venía marcando el linter de Supabase.
--
-- Tres cosas, de más grave a menos:
--
-- 1. Tres vistas con SECURITY DEFINER. Una vista definer corre con los permisos
--    de quien la creó, no de quien la consulta, así que saltea RLS. La peor es
--    `app.referral_summary`: `anon` tiene SELECT sobre ella, o sea que cualquiera
--    con la anon key podía leer las comisiones de todos los referidores.
--    `fin.monthly_pnl` es parecida: cualquier usuario logueado podía leer el P&L
--    entero, aunque la RLS de `fin.transactions` diga `app.is_staff()`.
--
-- 2. Dieciséis funciones con search_path mutable. Sin `search_path` fijo, quien
--    pueda crear objetos en un schema que esté antes en el path puede hacer que
--    la función llame a *su* versión de una función o tabla. En las que son
--    SECURITY DEFINER (los triggers de shop, entre ellos `decrement_stock` y
--    `create_enrollments_on_paid`) eso corre como el dueño.
--
-- 3. pg_trgm, unaccent y citext viven en `public`. Eso NO se toca acá: ver el
--    bloque comentado al final.
--
-- Verificado contra la base antes de escribirla: las tres vistas se pueden pasar
-- a invoker sin romper nada, porque los permisos ya alcanzan.
--   - `shop.review_aggregates` la lee `anon`, y `shop.reviews` ya tiene la
--     política "reviews public read approved" + SELECT para anon.
--   - `app.referral_summary` la lee `lib/referrals/index.ts` con el cliente
--     service_role, que no pasa por RLS.
--   - `fin.monthly_pnl` la lee `lib/admin/finance.ts` con la sesión del usuario;
--     `authenticated` ya tiene SELECT sobre `fin.transactions` y la RLS deja
--     pasar a staff. Es justamente el punto: después de esto, un usuario que no
--     sea staff ve la vista vacía en vez del P&L.
--
-- Después de aplicarla, mirar tres pantallas: /admin/finanzas (P&L con 6 meses),
-- la ficha de un producto con reseñas (promedio y cantidad), y el panel de
-- referidos de un usuario que tenga conversiones.

begin;

-- ---------------------------------------------------------------------------
-- 1. Vistas: de definer a invoker
-- ---------------------------------------------------------------------------

alter view fin.monthly_pnl        set (security_invoker = true);
alter view shop.review_aggregates set (security_invoker = true);
alter view app.referral_summary   set (security_invoker = true);

-- `anon` no tiene por qué leer el resumen de comisiones de nadie: la app lo lee
-- con service_role.
revoke select on app.referral_summary from anon;

-- ---------------------------------------------------------------------------
-- 2. search_path fijo en las funciones que lo tenían mutable
-- ---------------------------------------------------------------------------
--
-- Se hace con un loop sobre pg_proc en vez de escribir dieciséis `alter function`
-- a mano porque varias están sobrecargadas (`public.immutable_unaccent` aparece
-- dos veces) y `ALTER FUNCTION` necesita la firma exacta. `p.oid::regprocedure`
-- la arma sola.
--
-- El path elegido es `pg_catalog, public`: deja de ser mutable pero conserva el
-- comportamiento de hoy, porque varias de estas funciones llaman a cosas que
-- viven en `public` (unaccent, los operadores de pg_trgm, el tipo citext).

do $$
declare
  f record;
  objetivo text[] := array[
    'app.set_updated_at',
    'app.i18n_text',
    'anteproyectos.set_updated_at',
    'anteproyectos.limite_proyectos',
    'public.immutable_unaccent',
    'public.immutable_array_to_string',
    'public.link_message_contact',
    'public.refresh_product_copurchases_safe',
    'shop.sync_order_to_finance',
    'shop.decrement_stock',
    'shop.create_enrollments_on_paid',
    'terreno.set_updated_at',
    'terreno.canjear_codigo',
    'terreno.purgar_cache_vencido',
    'terreno.limite_proyectos_semilla'
  ];
begin
  for f in
    select p.oid::regprocedure as firma
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname || '.' || p.proname = any (objetivo)
      -- sólo las que todavía no lo tienen fijado
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}')) as c
        where c like 'search_path=%'
      )
  loop
    execute format('alter function %s set search_path = pg_catalog, public', f.firma);
    raise notice 'search_path fijado en %', f.firma;
  end loop;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- 3. Extensiones en public — NO se mueven acá, a propósito
-- ---------------------------------------------------------------------------
--
-- El linter pide sacar pg_trgm, unaccent y citext de `public`. Es un WARN
-- cosmético y moverlas sí puede romper cosas:
--
--   - los índices GIN construidos con `gin_trgm_ops` referencian la familia de
--     operadores por schema; moverla los deja sin usar hasta un REINDEX;
--   - las columnas declaradas `citext` guardan el tipo por OID, pero cualquier
--     cast escrito a mano (`::citext`) deja de resolver si `public` sale del path;
--   - `public.immutable_unaccent` llama a `unaccent` sin calificar, y arriba
--     acabamos de fijarle el search_path a `pg_catalog, public`.
--
-- Si algún día se hace, va en su propia migración, con ventana y REINDEX, y
-- agregando el schema nuevo al search_path del rol. Queda escrito acá para que
-- el próximo que lea el aviso del linter sepa que no es un olvido:
--
--   create schema if not exists extensions;
--   alter extension pg_trgm  set schema extensions;
--   alter extension unaccent set schema extensions;
--   alter extension citext   set schema extensions;
--   alter role authenticator set search_path = public, extensions;
--   reindex database postgres;  -- los GIN de trigramas
--
-- Y el schema `respaldo_20260908` (respaldo de suscripciones del 08/09) tampoco
-- se dropea acá: eso lo decide Jonatan.
