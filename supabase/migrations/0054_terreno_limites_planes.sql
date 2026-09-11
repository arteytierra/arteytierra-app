-- Topes de proyectos por plan: Profesional y Estudio dejan de ser ilimitados.
--
-- Profesional pasa a 10 proyectos activos y Estudio a 50. Hasta ahora los dos
-- eran NULL (sin tope), que era lo que la landing vendía como "proyectos
-- ilimitados".
--
-- Este trigger es el que enforcea de verdad: el chequeo del cliente en
-- lib/proyectos.ts sólo da feedback inmediato, y alguien puede pegarle directo
-- a la tabla. Los números tienen que coincidir con LIMITE_PROYECTOS en
-- apps/terreno/lib/entitlements.ts.
--
-- Sólo afecta INSERT: a quien ya tenga más proyectos que su nuevo tope no se le
-- borra ninguno; simplemente no puede crear más hasta bajar del límite.

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
           WHEN 'semilla'   THEN 1
           WHEN 'personal'  THEN 2
           WHEN 'disenador' THEN 10
           WHEN 'estudio'   THEN 50
           ELSE NULL
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
