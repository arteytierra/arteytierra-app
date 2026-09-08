-- Acequia: la columna que le faltó a la 0051 tal como se aplicó el 08/09/2026.
--
-- La 0051 se aplicó desde una copia que todavía no traía `aviso_cobro_at`, así que
-- el cron del aviso de 24 h no tenía dónde anotar que ya avisó. Va aparte porque
-- 0051 ya está aplicada y no se reescribe una migración que ya corrió.

BEGIN;

ALTER TABLE terreno.suscripciones
  ADD COLUMN IF NOT EXISTS aviso_cobro_at timestamptz;

COMMENT ON COLUMN terreno.suscripciones.aviso_cobro_at IS
  'Cuándo se envió el aviso de 24 h antes del primer cobro. Null = todavía no se envió.';

COMMIT;
