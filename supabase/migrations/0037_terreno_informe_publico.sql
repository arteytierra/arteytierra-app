-- Añade soporte para informes públicos compartibles en proyectos de terreno.
-- informe_token: UUID único para la URL de sharing (generado automáticamente).
-- informe_publico: flag para habilitar acceso anónimo al informe.

ALTER TABLE terreno.proyectos
  ADD COLUMN IF NOT EXISTS informe_publico  boolean   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS informe_token    uuid      NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS metadatos        jsonb;

-- Índice único para lookups por token (ruta pública /informe/[token])
CREATE UNIQUE INDEX IF NOT EXISTS terreno_proyectos_informe_token_idx
  ON terreno.proyectos(informe_token);

-- Política de lectura pública: cualquier visitante puede ver informes marcados como públicos
DROP POLICY IF EXISTS "Informe público legible" ON terreno.proyectos;
CREATE POLICY "Informe público legible"
  ON terreno.proyectos
  FOR SELECT
  USING (informe_publico = true);
