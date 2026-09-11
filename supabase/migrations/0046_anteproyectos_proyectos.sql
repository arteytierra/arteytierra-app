-- ============================================================
-- Anteproyectos: proyectos por usuario (Fase A3, ver
-- apps/anteproyectos/PLAN-DOS-PISTAS.md). Reemplaza el almacén de un
-- archivo JSON por proyecto (apps/anteproyectos/lib/proyectos/almacen.ts)
-- por persistencia real en Postgres, mismo patrón que `terreno.proyectos`.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS anteproyectos;
-- ─── Proyectos ───────────────────────────────────────────────
-- El id es un slug legible (idDesdeNombre en lib/proyectos/tipos.ts), no un
-- uuid: es el que se usa en la URL de /api/proyectos/[id]. Se guarda el
-- ENUNCIADO del proyecto (sitio, programa, parámetros, cuaderno leído) en
-- `datos`, no los anteproyectos generados — al abrir se regenera todo con
-- el motor actual. `nombre` y `guardado_en` se desnormalizan como columnas
-- para poder listar y ordenar sin desempaquetar el jsonb.
CREATE TABLE IF NOT EXISTS anteproyectos.proyectos (
  id          text        NOT NULL,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text        NOT NULL,
  datos       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS anteproyectos_proyectos_user_id_idx
  ON anteproyectos.proyectos (user_id, updated_at DESC);
ALTER TABLE anteproyectos.proyectos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anteproyectos_proyectos_select" ON anteproyectos.proyectos
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "anteproyectos_proyectos_insert" ON anteproyectos.proyectos
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "anteproyectos_proyectos_update" ON anteproyectos.proyectos
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "anteproyectos_proyectos_delete" ON anteproyectos.proyectos
  FOR DELETE USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION anteproyectos.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER anteproyectos_proyectos_updated_at
  BEFORE UPDATE ON anteproyectos.proyectos
  FOR EACH ROW EXECUTE FUNCTION anteproyectos.set_updated_at();
GRANT USAGE ON SCHEMA anteproyectos TO authenticated, anon, service_role;
GRANT ALL ON anteproyectos.proyectos TO authenticated;
GRANT ALL ON anteproyectos.proyectos TO service_role;
-- ─── Suscripciones ───────────────────────────────────────────
-- Mismo patrón que `terreno.suscripciones`: fuente de verdad del plan
-- efectivo, leída server-side (lib/auth/plan.ts). Sin fila ⇒ plan 'semilla'.
CREATE TABLE IF NOT EXISTS anteproyectos.suscripciones (
  user_id       uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          text        NOT NULL DEFAULT 'semilla' CHECK (plan IN ('semilla', 'disenador', 'estudio')),
  estado        text        NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'vencida', 'cancelada')),
  periodo       text,
  provider      text,
  provider_ref  text,
  vigente_hasta timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE anteproyectos.suscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anteproyectos_suscripciones_select" ON anteproyectos.suscripciones
  FOR SELECT USING (user_id = auth.uid());
-- Sin política de insert/update/delete: sólo service_role escribe (altas y
-- cambios de plan pasan por el backend de pagos, no por el cliente).
CREATE TRIGGER anteproyectos_suscripciones_updated_at
  BEFORE UPDATE ON anteproyectos.suscripciones
  FOR EACH ROW EXECUTE FUNCTION anteproyectos.set_updated_at();
GRANT ALL ON anteproyectos.suscripciones TO service_role;
GRANT SELECT ON anteproyectos.suscripciones TO authenticated;
-- ─── Límite de proyectos por plan (enforcement duro, no sólo client-side) ──
CREATE OR REPLACE FUNCTION anteproyectos.limite_proyectos()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  plan_actual text;
  limite int;
  actuales int;
BEGIN
  SELECT s.plan INTO plan_actual
  FROM anteproyectos.suscripciones s
  WHERE s.user_id = NEW.user_id AND s.estado = 'activa'
    AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now());

  limite := CASE COALESCE(plan_actual, 'semilla')
    WHEN 'semilla' THEN 2
    WHEN 'disenador' THEN 10
    ELSE NULL -- estudio: sin tope
  END;

  IF limite IS NOT NULL THEN
    SELECT count(*) INTO actuales FROM anteproyectos.proyectos WHERE user_id = NEW.user_id;
    IF actuales >= limite THEN
      RAISE EXCEPTION 'Límite de proyectos alcanzado para el plan actual (%).', COALESCE(plan_actual, 'semilla');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER anteproyectos_proyectos_limite
  BEFORE INSERT ON anteproyectos.proyectos
  FOR EACH ROW EXECUTE FUNCTION anteproyectos.limite_proyectos();
