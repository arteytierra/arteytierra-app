-- Las dos columnas que el código de cobro escribe y la base no tiene, y el
-- estado 'prueba' que el trigger de topes había perdido.
--
-- Esto es lo que faltaba para poder prender el cobro. Ninguna de las dos cosas
-- se nota hoy —nadie está en prueba y la baja no se usó todavía— y las dos
-- fallan en el primer alta real.
--
-- 1. `cancel_at_period_end` y `cancelled_at`. El commit 34b60c8 escribió la
--    lógica de baja ("cancela en el proveedor y conserva el acceso hasta que
--    venza el período pago") y dejó la migración sin escribir: hoy
--    `apps/web/lib/terreno/fulfillment-suscripcion.ts` las manda en el upsert
--    del alta, en la renovación y en la baja, y `leerSuscripcionTerreno` las
--    pide en el select. PostgREST rechaza la consulta entera con 42703 cuando
--    una columna del select no existe, así que hoy:
--      · `GET /api/terreno/suscripcion` responde 500 (hace throw del error);
--      · la página "Mi cuenta" de la app muestra plan Semilla a quien paga
--        (`leerSuscripcionActual` ignora el error y se queda con data = null);
--      · con el cobro prendido, el webhook del alta habría fallado DESPUÉS de
--        que el proveedor cobró. Eso es lo que cuesta plata: el proveedor
--        reintenta, todos los reintentos fallan igual, y queda alguien que
--        pagó sin plan.
--    `NOT NULL DEFAULT false` en la primera porque el código la lee como
--    booleano (`Boolean(...)`, `?? false`) y un NULL ahí se leería como "no se
--    da de baja", que es la respuesta correcta por casualidad y no por diseño.
--
-- 2. El trigger de topes volvió a ignorar la prueba. La 0051 contemplaba
--    `estado IN ('prueba','activa')`; la 0057, al renombrar la función y
--    arreglarle el `ELSE NULL`, la reescribió mirando sólo `estado = 'activa'`.
--    Con `ACEQUIA_TRIAL_ENABLED=true`, alguien en prueba de Profesional
--    recibiría el plan completo del lado del servidor (`planEfectivo` en
--    `lib/auth/plan.ts` sí mira `trial_end`) y el tope de Semilla —un proyecto—
--    del lado de la base. Falla cerrada, así que no cuesta plata, pero rompe
--    exactamente lo que la prueba promete.
--    La condición de abajo es el espejo de `planEfectivo`: prueba vale mientras
--    `trial_end` esté en el futuro; activa, mientras `vigente_hasta` lo esté o
--    sea NULL.
--
-- Los topes por plan no cambian. Siguen siendo el espejo de LIMITE_PROYECTOS en
-- `apps/terreno/lib/entitlements.ts`, que se lee de
-- `packages/config/src/acequia.ts`, y el test de
-- `apps/terreno/tests/unit/planes/catalogo.test.ts` compara este SQL contra
-- esos números.


ALTER TABLE terreno.suscripciones
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

COMMENT ON COLUMN terreno.suscripciones.cancel_at_period_end IS
  'La renovación ya se canceló en el proveedor pero el período pago sigue corriendo. El acceso vive hasta vigente_hasta.';
COMMENT ON COLUMN terreno.suscripciones.cancelled_at IS
  'Cuándo se pidió la baja. Queda escrito aunque el acceso siga vigente hasta el fin del período.';

CREATE OR REPLACE FUNCTION terreno.limite_proyectos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE
  plan_usuario text;
  lim          integer;
  n            integer;
BEGIN
  -- Espejo de planEfectivo() en apps/terreno/lib/auth/plan.ts. Una suscripción
  -- en prueba vale mientras trial_end esté en el futuro; una activa, mientras
  -- vigente_hasta lo esté o sea NULL. Cualquier otro estado no da plan.
  SELECT s.plan INTO plan_usuario
  FROM terreno.suscripciones s
  WHERE s.user_id = NEW.user_id
    AND (
      (s.estado = 'prueba' AND s.trial_end IS NOT NULL AND s.trial_end > now())
      OR
      (s.estado = 'activa' AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now()))
    );

  IF plan_usuario IS NULL THEN plan_usuario := 'semilla'; END IF;

  lim := CASE plan_usuario
           WHEN 'semilla'     THEN 1
           WHEN 'personal'    THEN 2
           WHEN 'profesional' THEN 10
           WHEN 'estudio'     THEN 10
           ELSE 1
         END;

  SELECT count(*) INTO n FROM terreno.proyectos WHERE user_id = NEW.user_id;
  IF n >= lim THEN
    RAISE EXCEPTION 'limite_plan: tu plan (%) incluye % proyecto(s) activo(s). Eliminá alguno o pasá a un plan superior.', plan_usuario, lim
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- La corre el trigger, nunca una petición HTTP (ver 0056).
REVOKE EXECUTE ON FUNCTION terreno.limite_proyectos() FROM anon, authenticated, public;

