-- Acequia: estructura preparada para prueba comercial e idempotencia de webhooks.
-- IMPORTANTE: este archivo se deja sin aplicar hasta completar sandbox y revisión legal.

BEGIN;

ALTER TABLE terreno.suscripciones
  ADD COLUMN IF NOT EXISTS trial_start timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end timestamptz,
  ADD COLUMN IF NOT EXISTS first_charge_at timestamptz,
  ADD COLUMN IF NOT EXISTS provider_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS provider_event_id text;

ALTER TABLE terreno.suscripciones
  DROP CONSTRAINT IF EXISTS suscripciones_estado_check;

ALTER TABLE terreno.suscripciones
  ADD CONSTRAINT suscripciones_estado_check
  CHECK (estado IN ('prueba', 'activa', 'vencida', 'cancelada'));

ALTER TABLE terreno.suscripciones
  DROP CONSTRAINT IF EXISTS suscripciones_trial_fechas_check;

ALTER TABLE terreno.suscripciones
  ADD CONSTRAINT suscripciones_trial_fechas_check
  CHECK (
    (estado <> 'prueba')
    OR (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end > trial_start)
  );

CREATE TABLE IF NOT EXISTS terreno.suscripcion_eventos_proveedor (
  provider text NOT NULL CHECK (provider IN ('stripe', 'mercadopago', 'paypal')),
  event_id text NOT NULL,
  provider_ref text,
  event_type text NOT NULL,
  event_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,
  payload_hash text,
  PRIMARY KEY (provider, event_id)
);

CREATE INDEX IF NOT EXISTS suscripcion_eventos_provider_ref_idx
  ON terreno.suscripcion_eventos_proveedor (provider, provider_ref, event_at DESC);

ALTER TABLE terreno.suscripcion_eventos_proveedor ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON terreno.suscripcion_eventos_proveedor FROM PUBLIC, anon, authenticated;
GRANT ALL ON terreno.suscripcion_eventos_proveedor TO service_role;

CREATE OR REPLACE FUNCTION terreno.limite_proyectos_semilla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = terreno, public AS $$
DECLARE
  plan_usuario text;
  n integer;
BEGIN
  SELECT s.plan INTO plan_usuario
  FROM terreno.suscripciones s
  WHERE s.user_id = NEW.user_id
    AND s.estado IN ('prueba', 'activa')
    AND (
      (s.estado = 'prueba' AND s.trial_end > now())
      OR
      (s.estado = 'activa' AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now()))
    );

  IF plan_usuario IS NULL THEN plan_usuario := 'semilla'; END IF;

  IF plan_usuario = 'semilla' THEN
    SELECT count(*) INTO n FROM terreno.proyectos WHERE user_id = NEW.user_id;
    IF n >= 1 THEN
      RAISE EXCEPTION 'limite_semilla: el plan Semilla incluye 1 proyecto. Eliminá el actual o pasá a Personal para crear más.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
