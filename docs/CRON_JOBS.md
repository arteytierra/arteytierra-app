# Cron Jobs

Trabajos programados que corren contra `/api/cron/[job]` con `Authorization: Bearer $CRON_SECRET`.

## Jobs disponibles

| Nombre | Frecuencia recomendada | Qué hace |
|---|---|---|
| `cleanup-expired-newsletter` | diaria 03:00 | Borra suscripciones no confirmadas > 14 días. |
| `cleanup-pending-orders` | cada 6h | Marca `cancelled` órdenes `pending` > 48h. |
| `cart-abandonment-sweep` | cada 1h | Dispara `cart-abandoned` a n8n para carritos sin acción 2h–24h. |
| `reservation-reminders` | cada 1h | Envía recordatorio 24h antes de reservas confirmadas. |
| `monthly-referral-payouts` | mensual día 1, 09:00 | Aprueba comisiones `confirmed` > 30 días. |
| `reindex-search` | semanal | Métrica de health del índice full-text. |
| `live-session-reminders` | cada 15 min | Recordatorios 24h y 1h antes de clases en vivo (idempotente via `reminders_sent`). |

## Cloudflare Cron Triggers (`wrangler.toml`)

```toml
[triggers]
crons = [
  "0 3 * * *",       # cleanup-expired-newsletter
  "0 */6 * * *",     # cleanup-pending-orders
  "5 * * * *",       # cart-abandonment-sweep
  "15 * * * *",      # reservation-reminders
  "0 9 1 * *",       # monthly-referral-payouts
  "0 4 * * 0",       # reindex-search
]
```

El Worker debe mapear cada cron a un fetch:

```ts
export default {
  async scheduled(event, env, ctx) {
    const job = JOB_BY_CRON[event.cron];
    await fetch(`${env.SITE_URL}/api/cron/${job}`, {
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });
  },
};
```

## Alternativa: GitHub Actions

```yaml
name: cron
on:
  schedule:
    - cron: '0 3 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://arteytierra.org/api/cron/cleanup-expired-newsletter
```

## Lock cooperativo

Cada job toma `app.job_locks` antes de correr. Si otro intento llega dentro
del mismo período (o un lock quedó colgado <1h), responde `200 { skipped: true }`.

## Observabilidad

Toda corrida queda en `app.job_runs` con `started_at/finished_at/status/result/error`.
Para auditar: `select * from app.job_runs order by started_at desc limit 50;`
