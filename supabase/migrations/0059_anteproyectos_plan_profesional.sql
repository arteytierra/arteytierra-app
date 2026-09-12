-- anteproyectos usa el mismo vocabulario de planes que acequia.
--
-- El esquema se creo copiando el patron de terreno.suscripciones, con el nombre
-- interno viejo ('disenador'). La 0057 lo renombro en terreno; si esto se queda
-- atras, el dia que se escriba la app de anteproyectos van a convivir dos
-- vocabularios en la misma base. La app todavia no existe y la tabla no tiene
-- ninguna fila, asi que este es el momento mas barato para alinearla.
--
-- De paso, el mismo ELSE fail-open que tenia terreno: el CASE devolvia NULL
-- —"sin tope"— para el plan 'estudio' y, de yapa, para cualquier plan que no
-- estuviera contemplado. Ahora los cuatro planes tienen un numero y el default
-- es el mas chico.

UPDATE anteproyectos.suscripciones SET plan = 'profesional' WHERE plan = 'disenador';

ALTER TABLE anteproyectos.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_plan_check;
ALTER TABLE anteproyectos.suscripciones ADD  CONSTRAINT suscripciones_plan_check
  CHECK (plan = ANY (ARRAY['semilla'::text, 'profesional'::text, 'estudio'::text]));

CREATE OR REPLACE FUNCTION anteproyectos.limite_proyectos()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  plan_actual text;
  limite int;
  actuales int;
BEGIN
  SELECT s.plan INTO plan_actual
  FROM anteproyectos.suscripciones s
  WHERE s.user_id = NEW.user_id AND s.estado = 'activa'
    AND (s.vigente_hasta IS NULL OR s.vigente_hasta > now());

  limite := CASE COALESCE(plan_actual, 'semilla')
    WHEN 'semilla'     THEN 2
    WHEN 'profesional' THEN 10
    WHEN 'estudio'     THEN 50
    ELSE 2
  END;

  SELECT count(*) INTO actuales FROM anteproyectos.proyectos WHERE user_id = NEW.user_id;
  IF actuales >= limite THEN
    RAISE EXCEPTION 'Límite de proyectos alcanzado para el plan actual (%).', COALESCE(plan_actual, 'semilla');
  END IF;

  RETURN NEW;
END;
$fn$;

REVOKE EXECUTE ON FUNCTION anteproyectos.limite_proyectos() FROM public, anon, authenticated;
