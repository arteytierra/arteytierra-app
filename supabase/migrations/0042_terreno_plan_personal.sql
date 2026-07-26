-- ============================================================
-- Terreno F3: agrega el plan 'personal'.
--
-- Personal = mismas features que Diseñador, pero con tope de 2 proyectos.
-- Se amplía el CHECK del plan y se generaliza el trigger de tope de proyectos
-- (semilla = 1, personal = 2, resto = ilimitado).
-- ============================================================

ALTER TABLE terreno.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_plan_check;
ALTER TABLE terreno.suscripciones ADD CONSTRAINT suscripciones_plan_check
  CHECK (plan IN ('semilla', 'personal', 'disenador', 'estudio'));

-- Tope de proyectos generalizado. SECURITY DEFINER para leer suscripciones sin
-- depender de la RLS del que inserta. (Reemplaza la versión sólo-semilla de 0041.)
CREATE OR REPLACE FUNCTION terreno.limite_proyectos_semilla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  plan_usuario text;
  lim          integer;
  n            integer;
BEGIN
  SELECT s.plan INTO plan_usuario
  FROM terreno.suscripciones s
  WHERE s.user_id = NEW.user_id
    AND s.estado = 'activa'
    AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now());

  IF plan_usuario IS NULL THEN plan_usuario := 'semilla'; END IF;

  lim := CASE plan_usuario
           WHEN 'semilla'  THEN 1
           WHEN 'personal' THEN 2
           ELSE NULL              -- disenador / estudio: ilimitado
         END;

  IF lim IS NOT NULL THEN
    SELECT count(*) INTO n FROM terreno.proyectos WHERE user_id = NEW.user_id;
    IF n >= lim THEN
      RAISE EXCEPTION 'limite_plan: tu plan (%) incluye % proyecto(s) activo(s). Eliminá alguno o pasá a un plan superior.', plan_usuario, lim
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
