-- 0056 — Cerrar las funciones SECURITY DEFINER que quedaron abiertas al público.
--
-- El linter de Supabase marcó 38 funciones `SECURITY DEFINER` alcanzables desde
-- `/rest/v1/rpc/...` con la clave anónima. No es teórico: `authenticator` expone
-- once esquemas (public, app, cms, shop, edu, book, fin, help, terreno,
-- anteproyectos, graphql_public), así que cualquiera con la anon key —que es
-- pública por diseño, viaja en el bundle del navegador— podía invocarlas, y al
-- ser DEFINER corrían con los permisos del dueño, salteando RLS.
--
-- Las peores:
--   app.wallet_transact          movía saldo de la billetera de cualquier usuario
--   terreno.canjear_codigo       canjeaba códigos de invitación sobre cualquier cuenta
--   public.increment_coupon_used quemaba el cupo de un cupón sin comprar nada
--   app.global_search            recibe p_user: devolvía resultados privados de otro
--   app.try_acquire_job_lock     permitía trabar los crons del sitio
--
-- **El permiso no venía de `anon`: venía de `PUBLIC`.** Postgres, al crear una
-- función, le da EXECUTE a PUBLIC salvo que se le diga lo contrario, y `anon`
-- lo hereda. Revocarle a `anon` no hace absolutamente nada mientras el `=X/`
-- siga en la ACL. Por eso acá se revoca a PUBLIC y se vuelve a conceder, una
-- por una, sólo a quien la necesita.
--
-- Antes de revocar se verificó quién llama a cada una: todas las del bloque 1 se
-- invocan con el cliente `admin` (service_role), que tiene GRANT explícito y no
-- se ve afectado. Las de trigger nunca se llamaron por RPC: las dispara Postgres.
--
-- Las cuatro `submit_acequia_*` no se tocan: son la entrada de los formularios
-- públicos de la landing, que las llama con la clave anónima, y ya estaban bien
-- hechas (GRANT explícito a anon, sin `=X/` de PUBLIC). Son el modelo a copiar.

-- --------------------------------------------------------------------------
-- 1) Sólo el servidor.
-- --------------------------------------------------------------------------
revoke execute on function app.wallet_transact(uuid, text, bigint, app.wallet_source, text, text, uuid) from public;
revoke execute on function app.global_search(text, integer, uuid)      from public;
revoke execute on function app.recommend_for_user(uuid, integer)       from public;
revoke execute on function app.recommend_for_product(uuid, integer)    from public;
revoke execute on function app.try_acquire_job_lock(text, text)        from public;
revoke execute on function app.release_job_lock(text)                  from public;
revoke execute on function app.mark_email_opened(uuid)                 from public;
revoke execute on function app.mark_email_clicked(uuid)                from public;
revoke execute on function edu.bump_certificate_download(text)         from public;
revoke execute on function help.search_articles(text, integer)         from public;
revoke execute on function shop.bundle_units_in_cart(uuid, uuid[])     from public;
revoke execute on function shop.coupon_user_usage(text, uuid)          from public;
revoke execute on function public.increment_coupon_used(text)          from public;
revoke execute on function public.refresh_product_copurchases_safe()   from public;
revoke execute on function public.increment_article_view(text)         from public;
revoke execute on function public.search_help_articles(text, integer)  from public;
revoke execute on function public.help_inc_helpful_yes(uuid)           from public;
revoke execute on function public.help_inc_helpful_no(uuid)            from public;
revoke execute on function terreno.canjear_codigo(text, uuid)          from public;
revoke execute on function terreno.purgar_cache_vencido()              from public;

-- --------------------------------------------------------------------------
-- 2) Funciones de trigger. Las llama Postgres, nunca una petición HTTP.
-- --------------------------------------------------------------------------
revoke execute on function app.handle_new_user()                       from public;
revoke execute on function app.bump_granted_count()                    from public;
revoke execute on function app.notify_reply_accepted()                 from public;
revoke execute on function app.notify_thread_reply()                   from public;
revoke execute on function edu.bump_reports_count()                    from public;
revoke execute on function edu.bump_thread_activity()                  from public;
revoke execute on function edu.grant_reputation_on_accept()            from public;
revoke execute on function edu.handle_accept_reply()                   from public;
revoke execute on function shop.apply_gift_card_redemption()           from public;
revoke execute on function shop.set_review_verified()                  from public;
revoke execute on function terreno.limite_proyectos_semilla()          from public;
revoke execute on function anteproyectos.limite_proyectos()            from public;

-- --------------------------------------------------------------------------
-- 3) Necesitan sesión. Se va el anónimo; el usuario logueado, que es quien las
--    llama desde la app, queda con GRANT propio en vez de heredarlo de PUBLIC.
-- --------------------------------------------------------------------------
revoke execute on function public.get_my_profile()                     from public;
grant  execute on function public.get_my_profile()                     to authenticated;

revoke execute on function app.mark_notification_read(uuid)            from public;
grant  execute on function app.mark_notification_read(uuid)            to authenticated;

revoke execute on function app.mark_all_notifications_read()           from public;
grant  execute on function app.mark_all_notifications_read()           to authenticated;

revoke execute on function app.unread_notifications_count()            from public;
grant  execute on function app.unread_notifications_count()            to authenticated;


-- Estas tres, además del `=X/` de PUBLIC, tenían un GRANT explícito a `anon`
-- puesto por una migración vieja. Revocar PUBLIC no lo alcanza: hay que sacarlo
-- aparte. Ninguna devuelve nada útil sin sesión, pero no tienen por qué estar
-- abiertas.
revoke execute on function public.get_my_profile() from anon;

-- --------------------------------------------------------------------------
-- 4) Lo que NO se toca, y por que.
--
-- app.is_staff() y app.is_admin() siguen abiertas a anon a proposito. No son
-- una RPC que alguien quiera llamar: las evaluan las politicas RLS con el rol
-- de quien consulta. cms.pages, cms.posts y cms.testimonials tienen politicas
-- del tipo "status = 'published' OR app.is_staff()" con rol {public}, o sea que
-- corren para el visitante anonimo del sitio publico. Sin EXECUTE la politica
-- no devuelve falso: revienta con permission denied, y la pagina deja de
-- mostrar lo publicado. Devuelven false para anon, asi que no filtran nada.
--
-- Se verifico que ninguna de las funciones revocadas arriba aparezca dentro de
-- la expresion de una politica RLS. Es el mismo error esperando en otra puerta.
