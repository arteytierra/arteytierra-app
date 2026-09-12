-- Al reembolsar una orden, el acceso al curso tiene que cerrarse.
--
-- Ya existía `shop.create_enrollments_on_paid`: cuando una orden pasa a 'paid',
-- crea las inscripciones de los cursos que incluía. No había la mitad opuesta.
-- Una orden reembolsada dejaba la inscripción viva: la persona recuperaba la
-- plata y seguía entrando al curso para siempre.
--
-- Se vence en vez de borrarse. La política RLS de edu.lessons ya pregunta
-- `expires_at IS NULL OR expires_at > now()`, así que poner la fecha en ahora
-- corta el acceso sin perder el registro de que esa inscripción existió, que es
-- lo que hace falta si después hay que discutir el reembolso.
--
-- Sólo actúa en la transición a 'refunded'. Reembolsar dos veces no cambia nada,
-- y una inscripción que ya tenía vencimiento propio conserva el suyo si era
-- anterior.

CREATE OR REPLACE FUNCTION shop.expire_enrollments_on_refund()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public' AS $$
BEGIN
  IF new.status = 'refunded' AND (old.status IS DISTINCT FROM 'refunded') THEN
    UPDATE edu.enrollments e
       SET expires_at = least(coalesce(e.expires_at, now()), now())
      FROM shop.order_items oi
     WHERE oi.order_id = new.id
       AND e.order_item_id = oi.id
       AND (e.expires_at IS NULL OR e.expires_at > now());
  END IF;
  RETURN new;
END;
$$;

-- La función la corre el trigger, no una petición HTTP. Sin esto queda expuesta
-- como RPC pública (ver 0056).
REVOKE EXECUTE ON FUNCTION shop.expire_enrollments_on_refund() FROM public;

DROP TRIGGER IF EXISTS expire_enrollments_on_refund ON shop.orders;
CREATE TRIGGER expire_enrollments_on_refund
  AFTER UPDATE OF status ON shop.orders
  FOR EACH ROW
  EXECUTE FUNCTION shop.expire_enrollments_on_refund();
