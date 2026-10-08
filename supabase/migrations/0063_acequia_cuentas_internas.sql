-- Las cuentas internas de Arte y Tierra no tienen tope de proyectos.
--
-- La columna `fundador` existe desde la 0041 y hasta hoy no la leía nadie: ni el
-- trigger, ni `planEfectivo()`, ni el cliente. Era una etiqueta sin efecto.
--
-- Ahora es el permiso de las cuentas internas —las que usamos para probar la app
-- y para los proyectos del estudio—, que necesitan crear proyectos sin chocar
-- con el tope del plan. `info.arteytierra@gmail.com` ya estaba exactamente en 10
-- de 10 cuando se escribió esto, así que el próximo proyecto suyo habría fallado.
--
-- Por qué sirve como permiso y no como agujero: la RLS de `terreno.suscripciones`
-- sólo deja SELECT de la propia fila a `authenticated`, y el INSERT/UPDATE está
-- reservado a `service_role`. Nadie puede ponerse `fundador = true` a sí mismo.
-- Además se exige `provider = 'manual'`: un alta que venga de un webhook de pago
-- no puede quedar sin tope ni por error de mapeo.
--
-- No es un plan nuevo y no toca el catálogo: los precios y los topes de
-- `packages/config/src/acequia.ts` quedan igual, el CASE de abajo repite los
-- mismos números y el test de `tests/unit/planes/catalogo.test.ts` los sigue
-- comparando contra este archivo. Lo único que cambia es que una fila marcada a
-- mano como interna se saltea la comparación.

COMMENT ON COLUMN terreno.suscripciones.fundador IS
  'Cuenta interna de Arte y Tierra: plan sin vencimiento y sin tope de proyectos. Sólo la escribe service_role, y sólo vale con provider = manual.';

CREATE OR REPLACE FUNCTION terreno.limite_proyectos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE
  plan_usuario text;
  interna      boolean;
  lim          integer;
  n            integer;
BEGIN
  -- Espejo de planEfectivo() en apps/terreno/lib/auth/plan.ts. Una suscripción
  -- en prueba vale mientras trial_end esté en el futuro; una activa, mientras
  -- vigente_hasta lo esté o sea NULL. Cualquier otro estado no da plan.
  SELECT s.plan, (s.fundador AND s.provider = 'manual')
    INTO plan_usuario, interna
  FROM terreno.suscripciones s
  WHERE s.user_id = NEW.user_id
    AND (
      (s.estado = 'prueba' AND s.trial_end IS NOT NULL AND s.trial_end > now())
      OR
      (s.estado = 'activa' AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now()))
    );

  -- Cuenta interna: sin tope. Espejo de esCuentaInterna() en lib/auth/plan.ts.
  IF COALESCE(interna, false) THEN
    RETURN NEW;
  END IF;

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
