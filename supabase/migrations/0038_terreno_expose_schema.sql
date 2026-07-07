-- ============================================================
-- Exponer el schema `terreno` a la API de PostgREST (Supabase).
-- Sin esto, supabase-js `.schema('terreno')` falla con PGRST106
-- ("The schema must be one of the following: public, graphql_public"),
-- por lo que guardar/listar proyectos en la nube no funciona y la app
-- cae al guardado local.
--
-- Equivale a configurar la lista en Dashboard → Settings → API → Exposed schemas.
--
-- IMPORTANTE: `ALTER ROLE ... SET pgrst.db_schemas` REEMPLAZA la lista
-- completa, no agrega. Por eso enumeramos TODOS los schemas que la app
-- consume vía supabase-js `.schema(...)` (app, cms, shop, edu, book, fin,
-- help) además de `terreno`. Si se omitiera alguno, PostgREST dejaría de
-- exponerlo y se caería la web (catálogo, cursos, checkout, etc.).
--
-- Si en el futuro se agrega un schema nuevo accesible desde el cliente,
-- hay que sumarlo también a esta lista.
-- ============================================================

ALTER ROLE authenticator SET pgrst.db_schemas =
  'public, graphql_public, app, cms, shop, edu, book, fin, help, terreno';

-- Recargar la configuración de PostgREST para que tome efecto sin reiniciar.
NOTIFY pgrst, 'reload config';
