-- =====================================================================
-- 0035_grants_service_role.sql
-- Da grants completos al rol service_role en los schemas custom.
--
-- Motivo:
--   En 0001_init.sql se otorgaron grants para anon y authenticated, pero
--   no para service_role. Como dropeamos las vistas pass-through en
--   public (0034) y ahora el código accede directamente via
--   supabase.schema('shop').from('products'), el cliente admin
--   (service_role) recibe 403 al consultar shop.*, edu.*, etc.
--
--   service_role salta RLS pero igualmente requiere GRANT USAGE en el
--   schema y GRANT SELECT/INSERT/UPDATE/DELETE en las tablas.
--
-- Idempotencia:
--   GRANT es idempotente: aplicar dos veces no rompe nada.
-- =====================================================================

begin;

-- Schemas (usage)
grant usage on schema app, cms, shop, edu, book, fin, help to service_role;

-- Tablas existentes
grant select, insert, update, delete on all tables in schema app  to service_role;
grant select, insert, update, delete on all tables in schema cms  to service_role;
grant select, insert, update, delete on all tables in schema shop to service_role;
grant select, insert, update, delete on all tables in schema edu  to service_role;
grant select, insert, update, delete on all tables in schema book to service_role;
grant select, insert, update, delete on all tables in schema fin  to service_role;
grant select, insert, update, delete on all tables in schema help to service_role;

-- Secuencias (para que pueda usar defaults nextval())
grant usage, select on all sequences in schema app  to service_role;
grant usage, select on all sequences in schema cms  to service_role;
grant usage, select on all sequences in schema shop to service_role;
grant usage, select on all sequences in schema edu  to service_role;
grant usage, select on all sequences in schema book to service_role;
grant usage, select on all sequences in schema fin  to service_role;
grant usage, select on all sequences in schema help to service_role;

-- Funciones (RPCs invocables por service_role)
grant execute on all functions in schema app  to service_role;
grant execute on all functions in schema shop to service_role;
grant execute on all functions in schema edu  to service_role;
grant execute on all functions in schema book to service_role;
grant execute on all functions in schema cms  to service_role;
grant execute on all functions in schema fin  to service_role;
grant execute on all functions in schema help to service_role;

-- Default privileges (tablas/secuencias/funciones futuras)
alter default privileges in schema app  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema cms  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema shop grant select, insert, update, delete on tables to service_role;
alter default privileges in schema edu  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema book grant select, insert, update, delete on tables to service_role;
alter default privileges in schema fin  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema help grant select, insert, update, delete on tables to service_role;

alter default privileges in schema app  grant usage, select on sequences to service_role;
alter default privileges in schema cms  grant usage, select on sequences to service_role;
alter default privileges in schema shop grant usage, select on sequences to service_role;
alter default privileges in schema edu  grant usage, select on sequences to service_role;
alter default privileges in schema book grant usage, select on sequences to service_role;
alter default privileges in schema fin  grant usage, select on sequences to service_role;
alter default privileges in schema help grant usage, select on sequences to service_role;

alter default privileges in schema app  grant execute on functions to service_role;
alter default privileges in schema cms  grant execute on functions to service_role;
alter default privileges in schema shop grant execute on functions to service_role;
alter default privileges in schema edu  grant execute on functions to service_role;
alter default privileges in schema book grant execute on functions to service_role;
alter default privileges in schema fin  grant execute on functions to service_role;
alter default privileges in schema help grant execute on functions to service_role;

-- Forzar refresh del schema cache de PostgREST
notify pgrst, 'reload schema';

commit;
