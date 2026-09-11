# Deploy a producción — Arte y Tierra

> Este documento describía un deploy por **Cloudflare Pages** que nunca fue el
> que se usó en producción, y hablaba de migraciones "0001 → 0032". Reescrito el
> 10/09/2026 contra lo que realmente pasa.

## Cómo se publica, en una línea

**No hay que hacer nada.** Vercel tiene la integración con GitHub: apenas entra
un commit a `main`, los dos proyectos buildean y publican solos.

| Proyecto Vercel | App | Dominio |
|---|---|---|
| `jonatan-ayt/arteytierra-app-web` | `apps/web` | arteytierra.org |
| `terreno` | `apps/terreno` | app.acequia.app |

Dos cosas que hay que tener presentes:

1. **CI no es una compuerta.** `.github/workflows/ci.yml` no tiene job de deploy,
   y Vercel no mira el resultado de CI. Un commit con CI en rojo se publica
   igual. La única compuerta real es la local, antes de pushear.
2. **Un build roto no se nota mirando el sitio.** Si el build falla, Vercel
   sigue sirviendo el último bueno y la web se ve perfecta. Hay que confirmar el
   *deploy*, no el sitio (ver §5).

La landing de `acequia.app` **no** está en este repo ni en este ciclo: va por
`vercel --prod` desde su propia carpeta.

## 0. Compuerta, antes de pushear

Parado en la app que se tocó (`apps/web` o `apps/terreno`):

```bash
npx tsc --noEmit
npx next build
npx vitest run
```

Y el lint, desde la raíz:

```bash
pnpm lint
```

Los cuatro en exit 0. `vitest` no resuelve desde la raíz del repo: hay que estar
parado en la app.

> El lint recién sirve desde el 10/09/2026. Hasta ese día ninguna de las dos apps
> tenía `eslint.config.mjs`, `next lint` caía en el asistente interactivo y salía
> 1: el job `lint` de CI venía fallando en todas las corridas y en los hechos no
> se linteaba nada. Un lint verde de antes de esa fecha no prueba nada.

## 1. Supabase

Un solo proyecto: `ojlvflmqcyxdnvhbnhgp` (región us-east-1, Postgres 17).

Las migraciones viven en `supabase/migrations/` y van hasta la **0055**.
Producción está aplicada hasta la **0052**; 0053, 0054 y 0055 están escritas y
sin aplicar.

```bash
supabase link --project-ref ojlvflmqcyxdnvhbnhgp
pnpm db:push
```

**Aplicar migraciones es decisión de Jonatan, no de un agente.** Y numerar dos
archivos con el mismo prefijo rompe el orden: pasó con las dos `0053` (se
renumeró la de terreno a `0054`).

**Exposed schemas** — Settings → API. Los schemas custom tienen que estar
listados o las queries `.schema(...)` responden 404:

```
public, app, shop, edu, book, cms, fin, help, terreno, anteproyectos
```

**Auth** — Site URL `https://arteytierra.org`, redirect
`https://arteytierra.org/auth/callback`.

## 2. Variables de entorno

La plantilla es `.env.example` y sale de barrer `process.env.*` en las dos apps.
Los valores viven en Vercel, por proyecto. Nunca en el repo.

Tres banderas fallan **cerradas** — sin el valor exacto `'true'` la función
queda apagada. Es a propósito:

- `ACEQUIA_PAYMENTS_ENABLED` — cobros de acequia
- `PAYMENT_WEBHOOKS_ENABLED` — procesamiento de webhooks de pago
- `BOT_ENABLED` — el chatbot de IG/FB/Gmail

**Ojo con `BOT_ENABLED`:** hasta el 10/09/2026 fallaba *abierta* (el bot
contestaba si la variable no estaba). Se invirtió. Si el bot está en uso, hay que
poner `BOT_ENABLED=true` en Vercel o deja de responder.

Y `NEXT_PUBLIC_APP_VERSION` conviene apuntarla a `$VERCEL_GIT_COMMIT_SHA`: sin
eso, `/api/health` responde `"version":"dev"` y no se puede saber qué build está
vivo — que es justo lo que hace falta cuando se sospecha de un build roto.

## 3. Cron

Ver `docs/CRON_JOBS.md`. Resumen: doce jobs, dos schedulers
(`.github/workflows/cron.yml` para once, `apps/web/vercel.json` para
`acequia-aviso-cobro`), todos contra `/api/cron/<job>` con
`Authorization: Bearer $CRON_SECRET`.

## 4. Webhooks externos

| Provider | URL | Eventos |
|---|---|---|
| Stripe | `/api/webhooks/stripe` | `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`¹, `customer.subscription.*` |
| Mercado Pago | `/api/webhooks/mercadopago` | `payment`, `preapproval` |
| PayPal | `/api/webhooks/paypal` | `BILLING.SUBSCRIPTION.*` |
| Postmark | `/api/webhooks/postmark` | delivery, bounce, open |

Cada uno con su signing secret. Los tres de pago están además detrás de
`PAYMENT_WEBHOOKS_ENABLED`.

¹ `charge.refunded` está **registrado pero vacío** (`TODO` en la ruta): un
reembolso hoy no marca la orden, no revoca el enrollment ni devuelve stock. Se
hace a mano.

## 5. Verificar el deploy (no el sitio)

```bash
cd apps/web
npx vercel@latest ls --prod | grep -oE "https://[a-z0-9-]+\.vercel\.app"
npx vercel@latest inspect <esa-url>
```

Buscar `status ● Ready`, y que el `inspect` mencione el commit propio: si no, el
deploy que está Ready es uno anterior y el nuestro todavía no salió.

`vercel ls` por sí solo no sirve para esperar: sin terminal interactiva imprime
las URLs sin la columna de estado.

## 6. Smoke test

```bash
curl -s https://arteytierra.org/api/health          # status ok, database ok, env ok
curl -sI 'https://arteytierra.org/og?title=Test&kind=course'   # 200 image/png
curl -sI https://arteytierra.org/                   # 200
curl -sI https://arteytierra.org/tienda             # 200
curl -s  https://arteytierra.org/robots.txt
curl -s  https://arteytierra.org/sitemap.xml
```

Y si el deploy tocó cabeceras, confirmar la CSP:

```bash
curl -sI https://arteytierra.org/ | grep -i content-security-policy
```

## 7. Monitoreo

- **Uptime**: check cada 5 min a `/api/health`.
- **Errores de servidor**: `app.server_errors` → `/admin/observabilidad`.
- **Core Web Vitals**: `/admin/observabilidad` (P75 de LCP/INP/CLS).
- **Corridas de cron**: `app.job_runs`.
- **Auditoría**: `/admin/auditoria` (reembolsos, payouts, anonimizaciones).

## 8. Backup y recuperación

- `weekly-db-snapshot` (lunes 05:00 UTC) escribe NDJSON por tabla a
  `backups/{snapshot_id}/` en Supabase Storage.
- Supabase tiene PITR según plan.
- El bucket `private` (videos de cursos) no tiene réplica cross-cloud.

## 9. Rollback

Vercel guarda los deploys anteriores: se promueve uno viejo desde el dashboard
en un click. Eso vuelve atrás el código, **no la base**.

Para la base: restaurar la tabla afectada desde el último NDJSON, o PITR.
`supabase db reset --linked` es destructivo y no va contra producción.

## 10. Cumplimiento

- Bajas de cuenta: `/admin/privacidad` es la cola; quien las ejecuta es el cron
  `process-scheduled-deletions`, que es lo que respalda la promesa de
  `/privacidad`.
- Consentimiento de cookies: banner en el RootLayout, se guarda en `app.consents`.
- Toda acción de staff queda en `app.audit_log`.
