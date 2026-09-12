-- Permisos EXECUTE de las funciones expuestas por PostgREST.
--
-- Esta migracion no introduce cambios nuevos: deja escrito el estado al que
-- llego produccion el 12/09/2026. Los advisors de Supabase marcaron que casi
-- todas las funciones de los esquemas expuestos eran ejecutables por `anon`
-- (y por PUBLIC, que es el default de Postgres). Se corrigio directo contra la
-- base, en seis pasos, sin dejar archivo. Esto es ese resultado en una pieza.
--
-- El criterio: nadie ejecuta nada salvo que haga falta. Solo tres grupos
-- quedan alcanzables desde el navegador.
--
--   1. Los formularios publicos de acequia (submit_acequia_*): los llama el
--      visitante sin sesion, por eso siguen en anon.
--   2. app.is_staff() y app.is_admin(): NO se llaman por RPC, las evaluan las
--      politicas RLS de cms.pages, cms.posts y cms.testimonials, que son del
--      tipo "status = 'published' OR app.is_staff()" y corren con el rol del
--      visitante. Sin EXECUTE la politica no devuelve falso: revienta, y el
--      sitio publico deja de mostrar contenido. Devuelven false para anon, asi
--      que no filtran nada. Esto ya se rompio una vez el 12/09; no volver a
--      revocarlas sin revisar esas politicas primero.
--   3. El perfil propio y las notificaciones: solo `authenticated`.
--
-- Se usa to_regprocedure() en vez de nombrar las funciones directo para que la
-- migracion no falle si alguna todavia no existe al momento de correrla.

do $$
declare
  fn text;
  faltantes text[] := '{}';
begin
  -- Todo lo demas: fuera de anon, de authenticated y de PUBLIC.
  foreach fn in array array[
    'app.wallet_transact(uuid, text, bigint, app.wallet_source, text, text, uuid)',
    'app.global_search(text, integer, uuid)',
    'app.recommend_for_user(uuid, integer)',
    'app.recommend_for_product(uuid, integer)',
    'app.try_acquire_job_lock(text, text)',
    'app.release_job_lock(text)',
    'app.mark_email_opened(uuid)',
    'app.mark_email_clicked(uuid)',
    'app.handle_new_user()',
    'app.bump_granted_count()',
    'app.notify_reply_accepted()',
    'app.notify_thread_reply()',
    'edu.bump_certificate_download(text)',
    'edu.bump_reports_count()',
    'edu.bump_thread_activity()',
    'edu.grant_reputation_on_accept()',
    'edu.handle_accept_reply()',
    'help.search_articles(text, integer)',
    'shop.bundle_units_in_cart(uuid, uuid[])',
    'shop.coupon_user_usage(text, uuid)',
    'shop.apply_gift_card_redemption()',
    'shop.set_review_verified()',
    'public.increment_coupon_used(text)',
    'public.refresh_product_copurchases_safe()',
    'public.increment_article_view(text)',
    'public.search_help_articles(text, integer)',
    'public.help_inc_helpful_yes(uuid)',
    'public.help_inc_helpful_no(uuid)',
    'terreno.canjear_codigo(text, uuid)',
    'terreno.purgar_cache_vencido()',
    'terreno.limite_proyectos_semilla()',
    'anteproyectos.limite_proyectos()'
  ]
  loop
    if to_regprocedure(fn) is null then
      faltantes := faltantes || fn;
    else
      execute format('revoke execute on function %s from anon, authenticated, public', fn);
    end if;
  end loop;

  -- Los formularios publicos y las dos funciones que usan las politicas RLS.
  foreach fn in array array[
    'app.is_staff()',
    'app.is_admin()',
    'public.submit_acequia_account_request(text, text, text, boolean, text, text)',
    'public.submit_acequia_pilot_application(text, text, text, text, text, text, boolean, text, text)',
    'public.submit_acequia_pilot_feedback(text, text, text, text, integer, boolean, text, text, boolean, text)',
    'public.submit_acequia_product_event(text, text, text, jsonb)'
  ]
  loop
    if to_regprocedure(fn) is null then
      faltantes := faltantes || fn;
    else
      execute format('revoke execute on function %s from public', fn);
      execute format('grant execute on function %s to anon, authenticated', fn);
    end if;
  end loop;

  -- Perfil propio y notificaciones: hace falta sesion.
  foreach fn in array array[
    'public.get_my_profile()',
    'app.mark_notification_read(uuid)',
    'app.mark_all_notifications_read()',
    'app.unread_notifications_count()'
  ]
  loop
    if to_regprocedure(fn) is null then
      faltantes := faltantes || fn;
    else
      execute format('revoke execute on function %s from anon, public', fn);
      execute format('grant execute on function %s to authenticated', fn);
    end if;
  end loop;

  if array_length(faltantes, 1) > 0 then
    raise notice 'funciones inexistentes, salteadas: %', array_to_string(faltantes, ', ');
  end if;
end $$;
