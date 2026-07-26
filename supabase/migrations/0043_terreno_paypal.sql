-- ============================================================
-- Terreno F3: PayPal como proveedor internacional.
--
-- Stripe no opera para cuentas de Argentina, así que el cobro internacional
-- (USD, recurrente) pasa a PayPal Subscriptions. Argentina sigue con Mercado Pago.
-- ============================================================

-- Ampliar el proveedor permitido en la suscripción.
ALTER TABLE terreno.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_provider_check;
ALTER TABLE terreno.suscripciones ADD CONSTRAINT suscripciones_provider_check
  CHECK (provider IN ('manual', 'stripe', 'mercadopago', 'paypal'));

-- Cache de Product/Plans de PayPal. Las suscripciones de PayPal necesitan un
-- plan_id previo; lo creamos on-demand la primera vez y lo reusamos.
CREATE TABLE IF NOT EXISTS terreno.paypal_planes (
  clave      text        PRIMARY KEY,   -- 'product' | '<plan>_<periodo>'
  ref        text        NOT NULL,      -- id de PayPal (product o plan)
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE terreno.paypal_planes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON terreno.paypal_planes TO service_role;
