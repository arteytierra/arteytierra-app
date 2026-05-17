# Deploy a producción — Arte y Tierra

Guía operacional para subir la plataforma a Cloudflare Pages + Supabase Cloud.

## 0. Pre-flight checklist

- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm test` (unit + e2e contra build) en verde
- [ ] Variables del `.env.example` completas para el ambiente prod
- [ ] DNS de `arteytierra.org` apuntando al CDN (Cloudflare)
- [ ] Backup del WordPress viejo guardado (`/web/WPvieja/`)

## 1. Supabase Cloud — setup inicial

1. Crear proyecto en [supabase.com/dashboard](https://supabase.com/dashboard) (región: South America East — São Paulo).
2. Copiar `URL`, `anon key` y `service_role key` a vuestro `.env.production`.
3. Aplicar migraciones:
   ```bash
   supabase link --project-ref <ref>
   pnpm db:push                # corre 0001 → 0032 en orden
   ```
4. Crear bucket `backups` (privado) desde Storage UI o:
   ```sql
   insert into storage.buckets (id, name, public) values ('backups', 'backups', false);
   ```
5. **Exposed schemas** — Settings → API → "Exposed schemas":
   ```
   public, app, shop, edu, book, cms, fin, help
   ```
   Los 8 schemas custom DEBEN estar listados o las queries `.schema(...)` van a 404.

6. Habilitar **Realtime** en las tablas necesarias (ya viene de la migration 0020):
   - `app.notifications`
   - `edu.thread_replies`
   - `edu.threads`
6. Configurar **Auth**:
   - Site URL = `https://arteytierra.org`
   - Redirect URLs: `https://arteytierra.org/auth/callback`
   - Email templates → personalizar con branding (Subjects + body bilingüe)
   - Habilitar provider OAuth si va a haber (Google / Apple)

## 2. Cloudflare Pages — deploy

1. Push de la branch `main` a GitHub/GitLab.
2. En Cloudflare Pages → "Create project" → conectar repo.
3. Build settings:
   - Framework preset: **Next.js**
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `apps/web/.next`
   - Node version: `20`
4. Variables de entorno → pegar todas las del `.env.example` con valores prod.
5. Custom domain → agregar `arteytierra.org` y `www.arteytierra.org`.
6. Habilitar **Cache rules**:
   - `/_next/static/*` → cache 1 año, immutable
   - `/api/*` → no cache (bypass)
   - `/og` → cache 1 día (la imagen ya tiene `Cache-Control: max-age=31536000` del code)

## 3. Cron jobs (Cloudflare Workers o Vercel Cron)

Ver `docs/CRON_JOBS.md` para la lista completa. Para Cloudflare:

```toml
# wrangler.toml (worker que llama a /api/jobs/{name})
name = "ay-cron"
[triggers]
crons = [
  "0 3 * * *",     # cleanup-pending-orders, refresh-recommendations
  "*/30 * * * *",  # cart-abandonment-sweep, process-webhook-deliveries
  "0 9 * * 1",     # weekly-db-snapshot (lunes 9am)
  "0 4 * * *",     # process-scheduled-deletions (GDPR)
]
```

Cada cron debe enviar header `Authorization: Bearer ${CRON_SECRET}` al endpoint `/api/jobs/<name>`.

## 4. Webhooks externos

Configurar URLs en cada provider:

| Provider | URL | Eventos clave |
|---|---|---|
| Stripe | `https://arteytierra.org/api/webhooks/stripe` | `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded` |
| Mercado Pago | `https://arteytierra.org/api/webhooks/mercadopago` | `payment` |
| Resend | `https://arteytierra.org/api/email/webhook` | `email.delivered`, `email.opened`, `email.bounced` |
| Postmark | misma URL | OpenTracking + Bounce |

Cada uno con su signing secret en el `.env`.

## 5. Smoke test post-deploy

```bash
# Health
curl https://arteytierra.org/api/health
# → { "status": "ok", "checks": { ... } }

# OG image
curl -I 'https://arteytierra.org/og?title=Test&kind=course'
# → 200, content-type: image/png

# Robots y sitemap
curl https://arteytierra.org/robots.txt
curl https://arteytierra.org/sitemap.xml

# Health en mobile (PWA)
# Abrir https://arteytierra.org en Chrome mobile → debería ofrecer "Instalar"
```

## 6. Monitoring

- **Uptime**: Better Uptime / UptimeRobot apuntando a `/api/health` con check cada 5min.
- **Errores**: el log de `app.server_errors` (DB) — ver en `/admin/observabilidad`.
- **Core Web Vitals**: `/admin/observabilidad` con P75 LCP/INP/CLS.
- **Auditoría**: `/admin/auditoria` para acciones sensibles (refunds, payouts, anonimización).

## 7. Backup & DR

- **DB snapshots**: cron `weekly-db-snapshot` corre lunes 9am → NDJSON por tabla a `backups/{snapshot_id}/` en Supabase Storage.
- **Supabase tiene PITR** (point-in-time recovery) 7 días en plan Pro, 14 días en plan Team.
- **Bucket `private` (videos cursos)**: replicación manual a R2 (Cloudflare) recomendada para DR cross-cloud.

## 8. Rollback

Cloudflare Pages mantiene los últimos N deploys → un click rollback desde el dashboard.

Para rollback de DB:
- Si la migración rompió algo: `supabase db reset --linked` (⚠ destructivo) + restaurar de snapshot.
- Si fue una fila mal: restaurar la tabla afectada desde el último NDJSON snapshot.

## 9. Compliance

- GDPR/LGPD: ver `/admin/privacidad` para el queue de solicitudes (export/delete con 30d cooling-off).
- Cookie consent: el banner se monta en RootLayout y persiste en `app.consents`.
- Audit log: cualquier acción staff queda en `app.audit_log` con `severity` y `target`.
