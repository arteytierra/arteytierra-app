-- Las funciones de trigger tambien eran ejecutables por cualquiera.
--
-- La 0056 dejo ordenados los permisos de las funciones que se llaman como RPC,
-- pero quedaron afuera las de trigger, que nunca se nombraron en ninguna de las
-- correcciones. Siguen con el EXECUTE por defecto de Postgres, que es PUBLIC.
--
-- El riesgo es bajo —una funcion de trigger invocada suelta no encuentra NEW y
-- falla— pero no es cero: `shop.sync_order_to_finance` y `shop.decrement_stock`
-- tocan pedidos y stock, y "falla" no es lo mismo que "no se puede llamar".
-- Ademas los advisors las van a seguir marcando mientras esten abiertas, y un
-- tablero de seguridad con ruido cronico deja de leerse.
--
-- app.i18n_text no es de trigger: devuelve text y se podia llamar de verdad. Se
-- verifico que no la use ninguna vista, ninguna politica RLS ni ningun llamado
-- del cliente antes de cerrarla. Esa verificacion importa: revocar a ciegas una
-- funcion que evalua una politica RLS ya tiro abajo el sitio publico una vez
-- (ver el comentario de app.is_staff en la 0056).

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'app.set_updated_at()',
    'app.i18n_text(jsonb, text, text[])',
    'terreno.set_updated_at()',
    'anteproyectos.set_updated_at()',
    'shop.create_enrollments_on_paid()',
    'shop.decrement_stock()',
    'shop.sync_order_to_finance()',
    'public.link_message_contact()'
  ]
  loop
    if to_regprocedure(fn) is not null then
      execute format('revoke execute on function %s from public, anon, authenticated', fn);
    end if;
  end loop;
end $$;
