# Changelog — Arte y Tierra

## v1.0.0-rc — Platform feature-complete

Plataforma cubre el 100% del scope de v1. Listo para deploy a producción.

### Core commerce
- Catálogo multi-tipo (cursos, ebooks, físicos, gift cards, hospedaje, consultas, inmersiones)
- Carrito con metadata por línea (fechas para reservables)
- Checkout Stripe (USD) + Mercado Pago (ARS) con webhooks idempotentes
- Sistema de cupones avanzado: percent, fixed, BOGO, bundle, free shipping con stacking determinista
- Wallets, gift cards, atribución partner/referral, comisiones B2B

### Education
- Player de cursos con progreso por lección + certificate.issued
- Q&A threads con notificaciones realtime
- Becas con flujo de aprobación staff
- Instructor portal con revenue share y queue de Q&A

### CMS + SEO
- Blog con full-text search y i18n (ES/EN/PT)
- CommandK búsqueda global ⌘K con resultados grupados
- OG dinámicas edge con design system
- Sitemap + robots automatizados

### Operacional
- 30+ migraciones SQL versionadas
- Sistema de jobs (cron) con 11 handlers (cleanup, sweeps, snapshots, webhooks)
- Webhooks outbound HMAC-firmados con retry exponencial
- DB snapshots NDJSON a Storage con admin UI
- Audit log + observability (Core Web Vitals + server errors)
- A/B testing + feature flags con buckets deterministas
- GDPR/LGPD compliance (consent banner, export, delete con cooling-off)

### UX
- Design system "Tierra Viva" completo (28 primitivos + marketing + commerce)
- Skeleton loaders + framer-motion micro-interactions
- PWA con install prompt, share target, offline page mejorada
- Notification bell + cart counter con realtime + animados

### Centro de ayuda
- KB pública con búsqueda full-text por categoría/artículo
- Markdown editor admin con preview
- Feedback "¿esto te resultó útil?" con tracking

### Tests
- Smoke E2E (Playwright) — pública, privacidad, search, help center, carrito
- Unit tests del motor de cupones y firmado HMAC

### Stack final
- Next.js 15 (App Router, RSC, Server Actions)
- React 19 + TypeScript + TailwindCSS
- Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)
- Stripe + Mercado Pago
- Cloudflare Pages (edge runtime)
- Resend/Postmark + n8n + Mux

---

## Migración aplicada — orden

```
0001_init                       # 6 schemas, RLS, triggers base
0002_ical_external_uid          # iCal reservations
0003_messages_crm               # mensajes internos
0004_push_subscriptions         # web-push VAPID
0005_coupons_extend             # description, currency, min_subtotal
0006_search_indexes             # tsvector + unaccent
0007_reviews                    # reseñas de productos
0008_newsletter                 # subscribers + confirmations
0009_referrals                  # códigos personales
0010_jobs                       # job queue + locks
0011_gift_cards                 # ledger + redenciones
0012_wallet                     # saldo prepago
0013_live_sessions              # streaming en vivo
0014_qa_threads                 # Q&A foros por curso
0015_certificates               # emisión + revocación
0016_scholarships_partners      # becas + B2B partners
0017_i18n_fields                # jsonb i18n
0018_email_transactional        # email_messages + preferences + suppressions
0019_notifications              # in-app + triggers
0020_realtime                   # supabase_realtime publication
0021_global_search_rpc          # search_articles RPC
0022_attribution                # touches + conversions
0023_recommendations            # product_copurchases mat view
0024_instructor_portal          # course_instructors + revenue
0025_audit_log                  # acciones staff
0026_experiments                # A/B + flags
0027_privacy                    # consents + requests
0028_observability              # web_vitals + server_errors
0029_webhook_subscriptions      # outbound endpoints + deliveries
0030_coupons_advanced           # BOGO/bundles/stacking
0031_snapshots                  # db_snapshots metadata
0032_help_center                # help.articles + categories + search
```
