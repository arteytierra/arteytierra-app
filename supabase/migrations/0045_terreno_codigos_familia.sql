-- ============================================================
-- Terreno: familia de códigos (exclusión mutua) + baja de las pruebas AMIGOS7
-- + dos códigos de lanzamiento.
--
--  1. `familia` en terreno.codigos: dos códigos de la misma familia son
--     mutuamente excluyentes — un usuario puede canjear a lo sumo UNO de la
--     familia, y para siempre (no sólo mientras uno está vigente).
--  2. canjear_codigo respeta la familia (además de los chequeos ya existentes).
--  3. Cancela la suscripción gratuita (manual) de quienes canjearon AMIGOS7.
--  4. Crea PRUEBA2507 (7 días) y PRUEBA2502 (2 días), familia 'lanzamiento-2026',
--     plan personal, 5 usos c/u, 1 por usuario, excluyentes entre sí.
--
-- Los códigos se guardan en MAYÚSCULAS: la RPC busca con upper(trim(...)) y el
-- formulario ya envía el input en mayúsculas.
-- ============================================================

-- ─── 1. Familia de códigos ──────────────────────────────────────────────────
ALTER TABLE terreno.codigos ADD COLUMN IF NOT EXISTS familia text;

-- ─── 2. Canje con exclusión por familia ─────────────────────────────────────
-- Reemplaza la versión de 0044 sumando el chequeo de familia. El resto de la
-- lógica (activo, cupo, no-duplicado, no pisar plan pago, alta atómica) es igual.
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

  -- Exclusión mutua por familia: a lo sumo un código de la misma familia por usuario.
  IF c.familia IS NOT NULL AND EXISTS (
    SELECT 1 FROM terreno.codigos_canjeados cc
    JOIN terreno.codigos co ON co.codigo = cc.codigo
    WHERE cc.user_id = p_user AND co.familia = c.familia
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ya activaste una prueba de esta serie.');
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

-- ─── 3. Baja de las pruebas gratuitas activadas con AMIGOS7 ──────────────────
-- Cancela sólo la suscripción MANUAL y ACTIVA de plan 'personal' (la que otorga
-- AMIGOS7). No toca planes pagos (stripe/mercadopago) ni grandfathered 'estudio':
-- quien canjeó AMIGOS7 tenía 'semilla' al hacerlo (la RPC bloquea si ya hay plan
-- activo), así que su única suscripción manual activa es esa prueba. Al cancelar,
-- getPlan vuelve a 'semilla'.
UPDATE terreno.suscripciones
SET estado = 'cancelada', updated_at = now()
WHERE provider = 'manual'
  AND estado   = 'activa'
  AND plan     = 'personal'
  AND user_id IN (SELECT user_id FROM terreno.codigos_canjeados WHERE codigo = 'AMIGOS7');

-- ─── 4. Códigos de lanzamiento (excluyentes entre sí) ────────────────────────
-- Misma familia ⇒ un usuario puede activar sólo UNO de los dos, una sola vez.
-- 5 usos totales cada uno. Plan 'personal', igual que AMIGOS7.
INSERT INTO terreno.codigos (codigo, plan, dias, usos_max, familia, nota) VALUES
  ('PRUEBA2507', 'personal', 7, 5, 'lanzamiento-2026', 'Prueba lanzamiento 7 días (excluyente con PRUEBA2502)'),
  ('PRUEBA2502', 'personal', 2, 5, 'lanzamiento-2026', 'Prueba lanzamiento 2 días (excluyente con PRUEBA2507)')
ON CONFLICT (codigo) DO NOTHING;
