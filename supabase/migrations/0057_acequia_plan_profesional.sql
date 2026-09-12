-- El plan "Profesional" se llamaba `disenador` puertas adentro, y Estudio pasa
-- a ser cinco cuentas de diez proyectos en vez de una de cincuenta.
--
-- 1. Renombre. El identificador publico y el interno eran distintos desde el
--    principio ('profesional' afuera, 'disenador' adentro) y eso obligaba a
--    traducir en cada borde: checkout, webhooks de Mercado Pago y PayPal,
--    codigos de canje, informes. Al momento de correr esto ninguna fila de
--    terreno.suscripciones ni de terreno.codigos usaba 'disenador', asi que el
--    renombre no mueve datos; el UPDATE queda igual por si alguna entra entre
--    el deploy y esta migracion.
--
-- 2. Topes. Estudio baja de 50 proyectos a 10, porque lo que se vende son cinco
--    cuentas de diez y no una sola cuenta con cincuenta. El tope de cuentas no
--    se aplica todavia: hoy no existe la nocion de equipo en la base, cada
--    cuenta es independiente. Ver el informe que acompaña este cambio.
--
-- 3. El CASE tenia ELSE NULL, y NULL aca significaba "sin tope". Un plan con un
--    nombre que el CASE no contemplara —justamente lo que produce un renombre a
--    medias— dejaba crear proyectos sin limite. Ahora el default es el tope mas
--    chico.
--
-- 4. De paso la funcion deja de llamarse `limite_proyectos_semilla`: no tiene
--    nada que ver con el plan Semilla, aplica a todos.

-- 1. Datos y constraints.
UPDATE terreno.suscripciones SET plan = 'profesional' WHERE plan = 'disenador';
UPDATE terreno.codigos       SET plan = 'profesional' WHERE plan = 'disenador';

ALTER TABLE terreno.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_plan_check;
ALTER TABLE terreno.suscripciones ADD  CONSTRAINT suscripciones_plan_check
  CHECK (plan = ANY (ARRAY['semilla'::text, 'personal'::text, 'profesional'::text, 'estudio'::text]));

ALTER TABLE terreno.codigos DROP CONSTRAINT IF EXISTS codigos_plan_check;
ALTER TABLE terreno.codigos ADD  CONSTRAINT codigos_plan_check
  CHECK (plan = ANY (ARRAY['personal'::text, 'profesional'::text, 'estudio'::text]));

-- 2. La funcion, con el nombre nuevo.
CREATE OR REPLACE FUNCTION terreno.limite_proyectos()
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

  -- Espejo de LIMITE_PROYECTOS en apps/terreno/lib/entitlements.ts, que a su vez
  -- se lee de packages/config/src/acequia.ts. Hay un test que compara este SQL
  -- contra esos numeros.
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

REVOKE EXECUTE ON FUNCTION terreno.limite_proyectos() FROM anon, authenticated, public;

-- 3. Mover el trigger y dar de baja el nombre viejo.
DROP TRIGGER IF EXISTS trg_limite_proyectos ON terreno.proyectos;
CREATE TRIGGER trg_limite_proyectos
  BEFORE INSERT ON terreno.proyectos
  FOR EACH ROW EXECUTE FUNCTION terreno.limite_proyectos();

DROP FUNCTION IF EXISTS terreno.limite_proyectos_semilla();
