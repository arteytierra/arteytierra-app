-- ============================================================
-- Terreno: caché persistente de respuestas de APIs externas.
--
-- Las rutas /api/{clima,elevacion,suelo,clima-diario} consultan fuentes
-- externas lentas y con límite de tasa (NASA POWER, OpenTopoData/SRTM,
-- SoilGrids, Open-Meteo). En Vercel (runtime Node) el `caches` del edge
-- no está disponible, así que sin esto cada consulta pega de nuevo al
-- origen. Esta tabla guarda la respuesta JSON con vencimiento (TTL) y se
-- comparte entre todos los usuarios y regiones.
--
-- Acceso SÓLO vía service_role (server-side, en las rutas API). RLS activa
-- sin políticas para anon/authenticated ⇒ el cliente del navegador no la ve.
-- ============================================================

CREATE TABLE IF NOT EXISTS terreno.cache_api (
  clave      text        PRIMARY KEY,   -- p.ej. 'suelo:-30.788,-64.641'
  payload    jsonb       NOT NULL,      -- respuesta cruda de la fuente
  expira_en  timestamptz NOT NULL,      -- vencimiento (now() + TTL)
  creado_en  timestamptz NOT NULL DEFAULT now()
);

-- Índice para poder purgar vencidos eficientemente.
CREATE INDEX IF NOT EXISTS terreno_cache_api_expira_idx
  ON terreno.cache_api (expira_en);

-- RLS activa y SIN políticas: nadie salvo service_role (que la bypassa) accede.
ALTER TABLE terreno.cache_api ENABLE ROW LEVEL SECURITY;

-- Grants: sólo el service_role opera esta tabla.
GRANT ALL ON terreno.cache_api TO service_role;

-- Purga de vencidos (llamable manualmente o por cron). SECURITY DEFINER para
-- que corra con permisos del dueño del schema.
CREATE OR REPLACE FUNCTION terreno.purgar_cache_vencido()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  borrados integer;
BEGIN
  DELETE FROM terreno.cache_api WHERE expira_en < now();
  GET DIAGNOSTICS borrados = ROW_COUNT;
  RETURN borrados;
END;
$$;

GRANT EXECUTE ON FUNCTION terreno.purgar_cache_vencido() TO service_role;
