-- ============================================================
-- Terreno: planes de suscripción (entitlements) + telemetría de candados.
--
-- Fase 1 de la apertura al público. Define el plan de cada usuario y
-- registra cuándo un usuario free choca con una feature bloqueada.
--
--  · terreno.suscripciones  — el plan efectivo de cada usuario.
--  · terreno.eventos_candado — telemetría de intentos sobre features con candado.
--
-- El plan se lee SIEMPRE server-side (lib/auth/plan.ts). Sin fila ⇒ 'semilla'.
-- Sólo service_role escribe suscripciones (hoy a mano / admin; en F3 lo harán
-- los webhooks de pago de apps/web). Los usuarios sólo leen su propia fila.
-- ============================================================

-- ─── Suscripciones ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terreno.suscripciones (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  plan         text        NOT NULL DEFAULT 'semilla'
                             CHECK (plan IN ('semilla', 'disenador', 'estudio')),
  estado       text        NOT NULL DEFAULT 'activa'
                             CHECK (estado IN ('activa', 'vencida', 'cancelada')),
  periodo      text                 CHECK (periodo IN ('mensual', 'anual')),
  provider     text                 CHECK (provider IN ('manual', 'stripe', 'mercadopago')),
  provider_ref text,                              -- id de la suscripción en el proveedor
  fundador     boolean     NOT NULL DEFAULT false,
  vigente_hasta timestamptz,                       -- null = sin vencimiento (manual/estudio)
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE terreno.suscripciones ENABLE ROW LEVEL SECURITY;

-- El usuario lee sólo su propia suscripción. Nadie (salvo service_role, que
-- bypassa RLS) puede escribir: el alta/cambio de plan pasa por el server.
DROP POLICY IF EXISTS suscripciones_select_propia ON terreno.suscripciones;
CREATE POLICY suscripciones_select_propia ON terreno.suscripciones
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT ON terreno.suscripciones TO authenticated;
GRANT ALL    ON terreno.suscripciones TO service_role;

-- Grandfather: los usuarios que YA tienen proyectos en terreno son usuarios
-- reales (Jonatan, clientes, testers). Se los deja en 'estudio' para no
-- quitarles nada al encender los planes. El resto queda sin fila ⇒ 'semilla'.
INSERT INTO terreno.suscripciones (user_id, plan, estado, provider)
SELECT DISTINCT p.user_id, 'estudio', 'activa', 'manual'
FROM terreno.proyectos p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ─── Telemetría de candados ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terreno.eventos_candado (
  id       bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id  uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  feature  text        NOT NULL,      -- p.ej. 'analisis.hidrico'
  plan     text        NOT NULL,      -- plan del usuario al momento del evento
  tipo     text        NOT NULL CHECK (tipo IN ('intento', 'modal_abierto', 'cta_click')),
  ts       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS terreno_eventos_candado_feature_idx
  ON terreno.eventos_candado (feature, ts);

ALTER TABLE terreno.eventos_candado ENABLE ROW LEVEL SECURITY;

-- El usuario sólo puede INSERTAR sus propios eventos (no leer ni editar).
DROP POLICY IF EXISTS eventos_candado_insert_propio ON terreno.eventos_candado;
CREATE POLICY eventos_candado_insert_propio ON terreno.eventos_candado
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT INSERT ON terreno.eventos_candado TO authenticated;
GRANT ALL    ON terreno.eventos_candado TO service_role;

-- ─── Tope de proyectos del plan Semilla (enforcement duro) ──────────────────
-- El chequeo en el cliente da feedback inmediato, pero un usuario podría pegarle
-- directo a la tabla; este trigger lo bloquea server-side. SECURITY DEFINER para
-- poder leer suscripciones sin depender de la RLS del que inserta.
CREATE OR REPLACE FUNCTION terreno.limite_proyectos_semilla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  plan_usuario text;
  n            integer;
BEGIN
  SELECT s.plan INTO plan_usuario
  FROM terreno.suscripciones s
  WHERE s.user_id = NEW.user_id
    AND s.estado = 'activa'
    AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now());

  IF plan_usuario IS NULL THEN plan_usuario := 'semilla'; END IF;

  IF plan_usuario = 'semilla' THEN
    SELECT count(*) INTO n FROM terreno.proyectos WHERE user_id = NEW.user_id;
    IF n >= 1 THEN
      RAISE EXCEPTION 'limite_semilla: el plan Semilla incluye 1 proyecto. Eliminá el actual o pasá a Diseñador para crear más.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limite_proyectos ON terreno.proyectos;
CREATE TRIGGER trg_limite_proyectos
  BEFORE INSERT ON terreno.proyectos
  FOR EACH ROW EXECUTE FUNCTION terreno.limite_proyectos_semilla();
