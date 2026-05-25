-- ============================================================
-- Terreno: análisis catastral por usuario
-- Schema separado para no contaminar los schemas principales.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS terreno;

-- ─── Proyectos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terreno.proyectos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text        NOT NULL DEFAULT 'Sin nombre',
  descripcion text,
  -- Mojones: [{id, numero, lat, lng}]
  mojones     jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- Metadatos opcionales para fases futuras
  metadatos   jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Índice por usuario para listado eficiente
CREATE INDEX IF NOT EXISTS terreno_proyectos_user_id_idx
  ON terreno.proyectos (user_id, created_at DESC);

-- RLS: cada usuario ve y modifica sólo sus proyectos
ALTER TABLE terreno.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terreno_proyectos_select" ON terreno.proyectos
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "terreno_proyectos_insert" ON terreno.proyectos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "terreno_proyectos_update" ON terreno.proyectos
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "terreno_proyectos_delete" ON terreno.proyectos
  FOR DELETE USING (user_id = auth.uid());

-- Trigger: mantener updated_at
CREATE OR REPLACE FUNCTION terreno.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER terreno_proyectos_updated_at
  BEFORE UPDATE ON terreno.proyectos
  FOR EACH ROW EXECUTE FUNCTION terreno.set_updated_at();

-- Grants al service_role y al rol anon/authenticated vía RLS
GRANT USAGE ON SCHEMA terreno TO authenticated, anon, service_role;
GRANT ALL ON terreno.proyectos TO authenticated;
GRANT ALL ON terreno.proyectos TO service_role;
