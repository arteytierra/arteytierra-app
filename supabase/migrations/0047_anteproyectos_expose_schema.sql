-- ============================================================
-- Exponer el schema `anteproyectos` a la API de PostgREST (Supabase).
-- Ver 0038_terreno_expose_schema.sql: `ALTER ROLE ... SET pgrst.db_schemas`
-- REEMPLAZA la lista completa, no agrega, así que hay que repetir todos los
-- schemas ya expuestos y sumar `anteproyectos`.
-- ============================================================

ALTER ROLE authenticator SET pgrst.db_schemas =
  'public, graphql_public, app, cms, shop, edu, book, fin, help, terreno, anteproyectos';
NOTIFY pgrst, 'reload config';
