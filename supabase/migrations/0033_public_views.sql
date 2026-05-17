-- =====================================================================
-- 0033_public_views.sql
-- Crea vistas en el schema `public` para todas las tablas y vistas
-- materializadas/no-materializadas de los schemas custom (app, shop,
-- edu, book, cms, fin, help).
--
-- Motivo:
--   El cliente supabase-js sólo puede usar schemas listados en
--   "Exposed schemas" del proyecto. En lugar de exponer 7 schemas
--   internos, exponemos vistas pass-through en `public`, manteniendo
--   los nombres de tabla idénticos.
--
-- Seguridad:
--   En PostgreSQL 15+ las vistas heredan las políticas RLS de la
--   tabla base por defecto (security_invoker behaviour). Forzamos
--   `security_invoker = on` de manera explícita en cada vista para
--   asegurar que las consultas se ejecuten con los permisos del
--   usuario que invoca y no con los del owner de la vista.
--
-- Generado automaticamente desde el contenido de las migraciones
-- 0001..0032.
-- =====================================================================

begin;

-- =====================================================================
-- Schema: app
-- =====================================================================

create or replace view public.profiles
  with (security_invoker = on)
  as select * from app.profiles;
comment on view public.profiles is 'Pass-through view of app.profiles (RLS inherited)';

create or replace view public.addresses
  with (security_invoker = on)
  as select * from app.addresses;
comment on view public.addresses is 'Pass-through view of app.addresses (RLS inherited)';

create or replace view public.contacts
  with (security_invoker = on)
  as select * from app.contacts;
comment on view public.contacts is 'Pass-through view of app.contacts (RLS inherited)';

create or replace view public.events
  with (security_invoker = on)
  as select * from app.events;
comment on view public.events is 'Pass-through view of app.events (RLS inherited)';

create or replace view public.newsletter_subscribers
  with (security_invoker = on)
  as select * from app.newsletter_subscribers;
comment on view public.newsletter_subscribers is 'Pass-through view of app.newsletter_subscribers (RLS inherited)';

create or replace view public.referral_codes
  with (security_invoker = on)
  as select * from app.referral_codes;
comment on view public.referral_codes is 'Pass-through view of app.referral_codes (RLS inherited)';

create or replace view public.referral_attributions
  with (security_invoker = on)
  as select * from app.referral_attributions;
comment on view public.referral_attributions is 'Pass-through view of app.referral_attributions (RLS inherited)';

create or replace view public.job_runs
  with (security_invoker = on)
  as select * from app.job_runs;
comment on view public.job_runs is 'Pass-through view of app.job_runs (RLS inherited)';

create or replace view public.job_locks
  with (security_invoker = on)
  as select * from app.job_locks;
comment on view public.job_locks is 'Pass-through view of app.job_locks (RLS inherited)';

create or replace view public.wallet_accounts
  with (security_invoker = on)
  as select * from app.wallet_accounts;
comment on view public.wallet_accounts is 'Pass-through view of app.wallet_accounts (RLS inherited)';

create or replace view public.wallet_entries
  with (security_invoker = on)
  as select * from app.wallet_entries;
comment on view public.wallet_entries is 'Pass-through view of app.wallet_entries (RLS inherited)';

create or replace view public.email_messages
  with (security_invoker = on)
  as select * from app.email_messages;
comment on view public.email_messages is 'Pass-through view of app.email_messages (RLS inherited)';

create or replace view public.email_preferences
  with (security_invoker = on)
  as select * from app.email_preferences;
comment on view public.email_preferences is 'Pass-through view of app.email_preferences (RLS inherited)';

create or replace view public.email_suppressions
  with (security_invoker = on)
  as select * from app.email_suppressions;
comment on view public.email_suppressions is 'Pass-through view of app.email_suppressions (RLS inherited)';

create or replace view public.notifications
  with (security_invoker = on)
  as select * from app.notifications;
comment on view public.notifications is 'Pass-through view of app.notifications (RLS inherited)';

create or replace view public.user_reputation
  with (security_invoker = on)
  as select * from app.user_reputation;
comment on view public.user_reputation is 'Pass-through view of app.user_reputation (RLS inherited)';

create or replace view public.consents
  with (security_invoker = on)
  as select * from app.consents;
comment on view public.consents is 'Pass-through view of app.consents (RLS inherited)';

create or replace view public.privacy_requests
  with (security_invoker = on)
  as select * from app.privacy_requests;
comment on view public.privacy_requests is 'Pass-through view of app.privacy_requests (RLS inherited)';

create or replace view public.scholarship_programs
  with (security_invoker = on)
  as select * from app.scholarship_programs;
comment on view public.scholarship_programs is 'Pass-through view of app.scholarship_programs (RLS inherited)';

create or replace view public.scholarship_applications
  with (security_invoker = on)
  as select * from app.scholarship_applications;
comment on view public.scholarship_applications is 'Pass-through view of app.scholarship_applications (RLS inherited)';

create or replace view public.partner_programs
  with (security_invoker = on)
  as select * from app.partner_programs;
comment on view public.partner_programs is 'Pass-through view of app.partner_programs (RLS inherited)';

create or replace view public.partners
  with (security_invoker = on)
  as select * from app.partners;
comment on view public.partners is 'Pass-through view of app.partners (RLS inherited)';

create or replace view public.partner_commissions
  with (security_invoker = on)
  as select * from app.partner_commissions;
comment on view public.partner_commissions is 'Pass-through view of app.partner_commissions (RLS inherited)';

create or replace view public.experiments
  with (security_invoker = on)
  as select * from app.experiments;
comment on view public.experiments is 'Pass-through view of app.experiments (RLS inherited)';

create or replace view public.feature_flags
  with (security_invoker = on)
  as select * from app.feature_flags;
comment on view public.feature_flags is 'Pass-through view of app.feature_flags (RLS inherited)';

create or replace view public.experiment_exposures
  with (security_invoker = on)
  as select * from app.experiment_exposures;
comment on view public.experiment_exposures is 'Pass-through view of app.experiment_exposures (RLS inherited)';

create or replace view public.experiment_conversions
  with (security_invoker = on)
  as select * from app.experiment_conversions;
comment on view public.experiment_conversions is 'Pass-through view of app.experiment_conversions (RLS inherited)';

create or replace view public.audit_log
  with (security_invoker = on)
  as select * from app.audit_log;
comment on view public.audit_log is 'Pass-through view of app.audit_log (RLS inherited)';

create or replace view public.webhook_endpoints
  with (security_invoker = on)
  as select * from app.webhook_endpoints;
comment on view public.webhook_endpoints is 'Pass-through view of app.webhook_endpoints (RLS inherited)';

create or replace view public.webhook_deliveries
  with (security_invoker = on)
  as select * from app.webhook_deliveries;
comment on view public.webhook_deliveries is 'Pass-through view of app.webhook_deliveries (RLS inherited)';

create or replace view public.attribution_touches
  with (security_invoker = on)
  as select * from app.attribution_touches;
comment on view public.attribution_touches is 'Pass-through view of app.attribution_touches (RLS inherited)';

create or replace view public.attribution_conversions
  with (security_invoker = on)
  as select * from app.attribution_conversions;
comment on view public.attribution_conversions is 'Pass-through view of app.attribution_conversions (RLS inherited)';

create or replace view public.web_vitals
  with (security_invoker = on)
  as select * from app.web_vitals;
comment on view public.web_vitals is 'Pass-through view of app.web_vitals (RLS inherited)';

create or replace view public.server_errors
  with (security_invoker = on)
  as select * from app.server_errors;
comment on view public.server_errors is 'Pass-through view of app.server_errors (RLS inherited)';

create or replace view public.db_snapshots
  with (security_invoker = on)
  as select * from app.db_snapshots;
comment on view public.db_snapshots is 'Pass-through view of app.db_snapshots (RLS inherited)';

-- Views derivadas en schema app (no son tablas pero las exponemos igual)
create or replace view public.referral_summary
  with (security_invoker = on)
  as select * from app.referral_summary;
comment on view public.referral_summary is 'Pass-through view of app.referral_summary (RLS inherited)';

create or replace view public.partner_summary
  with (security_invoker = on)
  as select * from app.partner_summary;
comment on view public.partner_summary is 'Pass-through view of app.partner_summary (RLS inherited)';

create or replace view public.attribution_summary
  with (security_invoker = on)
  as select * from app.attribution_summary;
comment on view public.attribution_summary is 'Pass-through view of app.attribution_summary (RLS inherited)';

create or replace view public.experiment_summary
  with (security_invoker = on)
  as select * from app.experiment_summary;
comment on view public.experiment_summary is 'Pass-through view of app.experiment_summary (RLS inherited)';

create or replace view public.web_vitals_p75
  with (security_invoker = on)
  as select * from app.web_vitals_p75;
comment on view public.web_vitals_p75 is 'Pass-through view of app.web_vitals_p75 (RLS inherited)';

create or replace view public.db_snapshots_summary
  with (security_invoker = on)
  as select * from app.db_snapshots_summary;
comment on view public.db_snapshots_summary is 'Pass-through view of app.db_snapshots_summary (RLS inherited)';

create or replace view public.product_copurchases
  with (security_invoker = on)
  as select * from app.product_copurchases;
comment on view public.product_copurchases is 'Pass-through view of app.product_copurchases materialized view (RLS inherited)';

-- =====================================================================
-- Schema: cms
-- =====================================================================

create or replace view public.media
  with (security_invoker = on)
  as select * from cms.media;
comment on view public.media is 'Pass-through view of cms.media (RLS inherited)';

create or replace view public.pages
  with (security_invoker = on)
  as select * from cms.pages;
comment on view public.pages is 'Pass-through view of cms.pages (RLS inherited)';

create or replace view public.posts
  with (security_invoker = on)
  as select * from cms.posts;
comment on view public.posts is 'Pass-through view of cms.posts (RLS inherited)';

create or replace view public.testimonials
  with (security_invoker = on)
  as select * from cms.testimonials;
comment on view public.testimonials is 'Pass-through view of cms.testimonials (RLS inherited)';

-- =====================================================================
-- Schema: shop
-- =====================================================================

create or replace view public.products
  with (security_invoker = on)
  as select * from shop.products;
comment on view public.products is 'Pass-through view of shop.products (RLS inherited)';

create or replace view public.prices_intl
  with (security_invoker = on)
  as select * from shop.prices_intl;
comment on view public.prices_intl is 'Pass-through view of shop.prices_intl (RLS inherited)';

create or replace view public.coupons
  with (security_invoker = on)
  as select * from shop.coupons;
comment on view public.coupons is 'Pass-through view of shop.coupons (RLS inherited)';

create or replace view public.carts
  with (security_invoker = on)
  as select * from shop.carts;
comment on view public.carts is 'Pass-through view of shop.carts (RLS inherited)';

create or replace view public.cart_items
  with (security_invoker = on)
  as select * from shop.cart_items;
comment on view public.cart_items is 'Pass-through view of shop.cart_items (RLS inherited)';

create or replace view public.orders
  with (security_invoker = on)
  as select * from shop.orders;
comment on view public.orders is 'Pass-through view of shop.orders (RLS inherited)';

create or replace view public.order_items
  with (security_invoker = on)
  as select * from shop.order_items;
comment on view public.order_items is 'Pass-through view of shop.order_items (RLS inherited)';

create or replace view public.payments
  with (security_invoker = on)
  as select * from shop.payments;
comment on view public.payments is 'Pass-through view of shop.payments (RLS inherited)';

create or replace view public.reviews
  with (security_invoker = on)
  as select * from shop.reviews;
comment on view public.reviews is 'Pass-through view of shop.reviews (RLS inherited)';

create or replace view public.gift_cards
  with (security_invoker = on)
  as select * from shop.gift_cards;
comment on view public.gift_cards is 'Pass-through view of shop.gift_cards (RLS inherited)';

create or replace view public.gift_card_redemptions
  with (security_invoker = on)
  as select * from shop.gift_card_redemptions;
comment on view public.gift_card_redemptions is 'Pass-through view of shop.gift_card_redemptions (RLS inherited)';

create or replace view public.cart_coupons
  with (security_invoker = on)
  as select * from shop.cart_coupons;
comment on view public.cart_coupons is 'Pass-through view of shop.cart_coupons (RLS inherited)';

create or replace view public.coupon_redemptions
  with (security_invoker = on)
  as select * from shop.coupon_redemptions;
comment on view public.coupon_redemptions is 'Pass-through view of shop.coupon_redemptions (RLS inherited)';

create or replace view public.review_aggregates
  with (security_invoker = on)
  as select * from shop.review_aggregates;
comment on view public.review_aggregates is 'Pass-through view of shop.review_aggregates (RLS inherited)';

-- =====================================================================
-- Schema: edu
-- =====================================================================

create or replace view public.courses
  with (security_invoker = on)
  as select * from edu.courses;
comment on view public.courses is 'Pass-through view of edu.courses (RLS inherited)';

create or replace view public.modules
  with (security_invoker = on)
  as select * from edu.modules;
comment on view public.modules is 'Pass-through view of edu.modules (RLS inherited)';

create or replace view public.lessons
  with (security_invoker = on)
  as select * from edu.lessons;
comment on view public.lessons is 'Pass-through view of edu.lessons (RLS inherited)';

create or replace view public.enrollments
  with (security_invoker = on)
  as select * from edu.enrollments;
comment on view public.enrollments is 'Pass-through view of edu.enrollments (RLS inherited)';

create or replace view public.lesson_progress
  with (security_invoker = on)
  as select * from edu.lesson_progress;
comment on view public.lesson_progress is 'Pass-through view of edu.lesson_progress (RLS inherited)';

create or replace view public.certificates
  with (security_invoker = on)
  as select * from edu.certificates;
comment on view public.certificates is 'Pass-through view of edu.certificates (RLS inherited)';

create or replace view public.threads
  with (security_invoker = on)
  as select * from edu.threads;
comment on view public.threads is 'Pass-through view of edu.threads (RLS inherited)';

create or replace view public.thread_replies
  with (security_invoker = on)
  as select * from edu.thread_replies;
comment on view public.thread_replies is 'Pass-through view of edu.thread_replies (RLS inherited)';

create or replace view public.thread_reports
  with (security_invoker = on)
  as select * from edu.thread_reports;
comment on view public.thread_reports is 'Pass-through view of edu.thread_reports (RLS inherited)';

create or replace view public.live_sessions
  with (security_invoker = on)
  as select * from edu.live_sessions;
comment on view public.live_sessions is 'Pass-through view of edu.live_sessions (RLS inherited)';

create or replace view public.live_attendance
  with (security_invoker = on)
  as select * from edu.live_attendance;
comment on view public.live_attendance is 'Pass-through view of edu.live_attendance (RLS inherited)';

create or replace view public.course_instructors
  with (security_invoker = on)
  as select * from edu.course_instructors;
comment on view public.course_instructors is 'Pass-through view of edu.course_instructors (RLS inherited)';

create or replace view public.instructor_revenue_summary
  with (security_invoker = on)
  as select * from edu.instructor_revenue_summary;
comment on view public.instructor_revenue_summary is 'Pass-through view of edu.instructor_revenue_summary (RLS inherited)';

-- =====================================================================
-- Schema: book
-- =====================================================================

create or replace view public.resources
  with (security_invoker = on)
  as select * from book.resources;
comment on view public.resources is 'Pass-through view of book.resources (RLS inherited)';

create or replace view public.availability
  with (security_invoker = on)
  as select * from book.availability;
comment on view public.availability is 'Pass-through view of book.availability (RLS inherited)';

create or replace view public.reservations
  with (security_invoker = on)
  as select * from book.reservations;
comment on view public.reservations is 'Pass-through view of book.reservations (RLS inherited)';

-- =====================================================================
-- Schema: fin
-- =====================================================================

create or replace view public.fin_accounts
  with (security_invoker = on)
  as select * from fin.accounts;
comment on view public.fin_accounts is 'Pass-through view of fin.accounts (prefix to avoid clash with auth concepts) (RLS inherited)';

create or replace view public.fin_categories
  with (security_invoker = on)
  as select * from fin.categories;
comment on view public.fin_categories is 'Pass-through view of fin.categories (prefix to avoid clash with help.categories) (RLS inherited)';

create or replace view public.fx_rates
  with (security_invoker = on)
  as select * from fin.fx_rates;
comment on view public.fx_rates is 'Pass-through view of fin.fx_rates (RLS inherited)';

create or replace view public.transactions
  with (security_invoker = on)
  as select * from fin.transactions;
comment on view public.transactions is 'Pass-through view of fin.transactions (RLS inherited)';

create or replace view public.monthly_pnl
  with (security_invoker = on)
  as select * from fin.monthly_pnl;
comment on view public.monthly_pnl is 'Pass-through view of fin.monthly_pnl (RLS inherited)';

-- =====================================================================
-- Schema: help
-- =====================================================================

create or replace view public.help_categories
  with (security_invoker = on)
  as select * from help.categories;
comment on view public.help_categories is 'Pass-through view of help.categories (prefix to avoid clash) (RLS inherited)';

create or replace view public.articles
  with (security_invoker = on)
  as select * from help.articles;
comment on view public.articles is 'Pass-through view of help.articles (RLS inherited)';

create or replace view public.article_feedback
  with (security_invoker = on)
  as select * from help.article_feedback;
comment on view public.article_feedback is 'Pass-through view of help.article_feedback (RLS inherited)';

-- =====================================================================
-- Permisos
-- =====================================================================
-- Las vistas heredan la RLS de las tablas base via security_invoker.
-- Otorgamos los grants estandar a authenticated / anon (que luego son
-- filtrados por las policies de la tabla base).

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

commit;
