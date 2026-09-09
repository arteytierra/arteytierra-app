-- ============================================================
-- Ver quién se postuló al piloto de Acequia.
--
-- La tabla la escribe la landing (acequia.app), no la app. Está en el proyecto
-- de Supabase que la landing tiene cargado en Vercel. Si al correr esto
-- Supabase dice "relation does not exist", estás en el proyecto equivocado.
-- ============================================================

-- ─── 1. Las postulaciones, la más nueva primero ─────────────────────────────
SELECT created_at,
       name        AS nombre,
       email       AS correo,
       profession  AS oficio,
       country_region AS region,
       property_type  AS terreno,
       motivation  AS motivacion
FROM public.acequia_pilot_applications
ORDER BY created_at DESC;

-- ─── 2. Sólo el conteo, para chequear de un vistazo ─────────────────────────
SELECT count(*) AS postulaciones FROM public.acequia_pilot_applications;

-- ─── 3. Los correos sueltos, para copiar y pegar en el mail ─────────────────
SELECT string_agg(email, ', ' ORDER BY created_at) AS para
FROM public.acequia_pilot_applications;
