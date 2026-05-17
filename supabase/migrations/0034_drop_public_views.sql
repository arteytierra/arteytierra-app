-- =====================================================================
-- 0034_drop_public_views.sql
-- Revierte 0033_public_views.sql: dropea TODAS las vistas pass-through
-- creadas en `public`.
--
-- Motivo:
--   Las vistas pass-through (CREATE VIEW public.X AS SELECT * FROM schema.X)
--   hacen que PostgreSQL infiera todas las columnas como nullable, lo que
--   rompe los tipos generados por `supabase gen types`. Esto generó >300
--   errores TS en apps/web por nullability falsa.
--
-- Estrategia nueva:
--   Exponer los schemas custom (app, shop, edu, book, cms, fin, help)
--   directamente en la API de Supabase (Dashboard → Settings → API →
--   Exposed schemas) y usar `.schema('nombre')` en el código cliente.
--
-- Seguridad:
--   No afecta RLS. Las tablas originales en app/shop/edu/book/cms/fin/help
--   conservan sus policies. Sólo se eliminan accesos via public.X.
--
-- Idempotencia:
--   Todas las views se dropean con IF EXISTS para que la migración pueda
--   correr varias veces sin error.
-- =====================================================================

begin;

-- Schema: app
drop view if exists public.profiles cascade;
drop view if exists public.addresses cascade;
drop view if exists public.contacts cascade;
drop view if exists public.events cascade;
drop view if exists public.newsletter_subscribers cascade;
drop view if exists public.referral_codes cascade;
drop view if exists public.referral_attributions cascade;
drop view if exists public.job_runs cascade;
drop view if exists public.job_locks cascade;
drop view if exists public.wallet_accounts cascade;
drop view if exists public.wallet_entries cascade;
drop view if exists public.email_messages cascade;
drop view if exists public.email_preferences cascade;
drop view if exists public.email_suppressions cascade;
drop view if exists public.notifications cascade;
drop view if exists public.user_reputation cascade;
drop view if exists public.consents cascade;
drop view if exists public.privacy_requests cascade;
drop view if exists public.scholarship_programs cascade;
drop view if exists public.scholarship_applications cascade;
drop view if exists public.partner_programs cascade;
drop view if exists public.partners cascade;
drop view if exists public.partner_commissions cascade;
drop view if exists public.experiments cascade;
drop view if exists public.feature_flags cascade;
drop view if exists public.experiment_exposures cascade;
drop view if exists public.experiment_conversions cascade;
drop view if exists public.audit_log cascade;
drop view if exists public.webhook_endpoints cascade;
drop view if exists public.webhook_deliveries cascade;
drop view if exists public.attribution_touches cascade;
drop view if exists public.attribution_conversions cascade;
drop view if exists public.web_vitals cascade;
drop view if exists public.server_errors cascade;
drop view if exists public.db_snapshots cascade;
drop view if exists public.referral_summary cascade;
drop view if exists public.partner_summary cascade;
drop view if exists public.attribution_summary cascade;
drop view if exists public.experiment_summary cascade;
drop view if exists public.web_vitals_p75 cascade;
drop view if exists public.db_snapshots_summary cascade;
drop view if exists public.product_copurchases cascade;

-- Schema: cms
drop view if exists public.media cascade;
drop view if exists public.pages cascade;
drop view if exists public.posts cascade;
drop view if exists public.testimonials cascade;

-- Schema: shop
drop view if exists public.products cascade;
drop view if exists public.prices_intl cascade;
drop view if exists public.coupons cascade;
drop view if exists public.carts cascade;
drop view if exists public.cart_items cascade;
drop view if exists public.orders cascade;
drop view if exists public.order_items cascade;
drop view if exists public.payments cascade;
drop view if exists public.reviews cascade;
drop view if exists public.gift_cards cascade;
drop view if exists public.gift_card_redemptions cascade;
drop view if exists public.cart_coupons cascade;
drop view if exists public.coupon_redemptions cascade;
drop view if exists public.review_aggregates cascade;

-- Schema: edu
drop view if exists public.courses cascade;
drop view if exists public.modules cascade;
drop view if exists public.lessons cascade;
drop view if exists public.enrollments cascade;
drop view if exists public.lesson_progress cascade;
drop view if exists public.certificates cascade;
drop view if exists public.threads cascade;
drop view if exists public.thread_replies cascade;
drop view if exists public.thread_reports cascade;
drop view if exists public.live_sessions cascade;
drop view if exists public.live_attendance cascade;
drop view if exists public.course_instructors cascade;
drop view if exists public.instructor_revenue_summary cascade;

-- Schema: book
drop view if exists public.resources cascade;
drop view if exists public.availability cascade;
drop view if exists public.reservations cascade;

-- Schema: fin
drop view if exists public.fin_accounts cascade;
drop view if exists public.fin_categories cascade;
drop view if exists public.fx_rates cascade;
drop view if exists public.transactions cascade;
drop view if exists public.monthly_pnl cascade;

-- Schema: help
drop view if exists public.help_categories cascade;
drop view if exists public.articles cascade;
drop view if exists public.article_feedback cascade;

commit;
