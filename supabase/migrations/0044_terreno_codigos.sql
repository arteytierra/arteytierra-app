-- ============================================================
-- Terreno: códigos de invitación (pruebas gratis).
--
-- Un código activa un plan por N días sobre la cuenta del usuario (sin pago).
-- Como se activa sobre una cuenta, canjear exige registrarse (email + nombre) —
-- así se captura el contacto. Al vencer `vigente_hasta`, getPlan vuelve a semilla.
-- ============================================================

CREATE TABLE IF NOT EXISTS terreno.codigos (
  codigo     text        PRIMARY KEY,
  plan       text        NOT NULL CHECK (plan IN ('personal', 'disenador', 'estudio')),
  dias       integer     NOT NULL DEFAULT 7,
  usos_max   integer,                    -- null = ilimitado
  usos       integer     NOT NULL DEFAULT 0,
  activo     boolean     NOT NULL DEFAULT true,
  nota       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terreno.codigos_canjeados (
  id      bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo  text        NOT NULL REFERENCES terreno.codigos (codigo),
  user_id uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ts      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (codigo, user_id)
);

ALTER TABLE terreno.codigos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE terreno.codigos_canjeados ENABLE ROW LEVEL SECURITY;
GRANT ALL ON terreno.codigos           TO service_role;
GRANT ALL ON terreno.codigos_canjeados TO service_role;

-- Canje atómico: valida activo, cupo, no-duplicado y que no pise un plan pago;
-- activa la suscripción (provider 'manual', vence a los `dias`), registra el
-- canje e incrementa el uso. Devuelve jsonb { ok, error?, plan, dias, vigente_hasta }.
CREATE OR REPLACE FUNCTION terreno.canjear_codigo(p_codigo text, p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  c            terreno.codigos%ROWTYPE;
  plan_actual  text;
  vig          timestamptz;
BEGIN
  SELECT * INTO c FROM terreno.codigos WHERE codigo = upper(trim(p_codigo)) FOR UPDATE;
  IF NOT FOUND OR NOT c.activo THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El código no existe o no está activo.');
  END IF;
  IF c.usos_max IS NOT NULL AND c.usos >= c.usos_max THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Este código ya alcanzó su límite de usos.');
  END IF;
  IF EXISTS (SELECT 1 FROM terreno.codigos_canjeados WHERE codigo = c.codigo AND user_id = p_user) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ya usaste este código.');
  END IF;

  SELECT s.plan INTO plan_actual FROM terreno.suscripciones s
    WHERE s.user_id = p_user AND s.estado = 'activa'
      AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now());
  IF plan_actual IS NOT NULL AND plan_actual <> 'semilla' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ya tenés un plan activo.');
  END IF;

  vig := now() + (c.dias || ' days')::interval;

  INSERT INTO terreno.suscripciones (user_id, plan, estado, provider, vigente_hasta, updated_at)
  VALUES (p_user, c.plan, 'activa', 'manual', vig, now())
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan, estado = 'activa', provider = 'manual',
        vigente_hasta = EXCLUDED.vigente_hasta, updated_at = now();

  INSERT INTO terreno.codigos_canjeados (codigo, user_id) VALUES (c.codigo, p_user);
  UPDATE terreno.codigos SET usos = usos + 1 WHERE codigo = c.codigo;

  RETURN jsonb_build_object('ok', true, 'plan', c.plan, 'dias', c.dias, 'vigente_hasta', vig);
END;
$$;

GRANT EXECUTE ON FUNCTION terreno.canjear_codigo(text, uuid) TO service_role;

-- Primer código: AMIGOS7 — Personal, 7 días, 7 usos.
INSERT INTO terreno.codigos (codigo, plan, dias, usos_max, nota)
VALUES ('AMIGOS7', 'personal', 7, 7, 'Prueba gratis 7 días para amigos/testers')
ON CONFLICT (codigo) DO NOTHING;
