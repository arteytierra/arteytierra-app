# Cron Jobs

Doce trabajos programados. Todos entran por `/api/cron/<job>` con
`Authorization: Bearer $CRON_SECRET`, y todos pasan por el mismo despachador
(`apps/web/lib/jobs/handlers.ts`, mapa `HANDLERS`).

Hay **dos schedulers**, y conviene saber por qué:

| Scheduler | Qué dispara | Por qué |
|---|---|---|
| `.github/workflows/cron.yml` (GitHub Actions) | los 11 primeros | Son gratis y no consumen invocaciones de Vercel. |
| `apps/web/vercel.json` → `crons` | `acequia-aviso-cobro` | Toca plata (avisa del primer cobro), así que corre en la misma infra que la app: si Actions está caído, este no se saltea en silencio. |

Si agregás un handler nuevo a `HANDLERS` **y no lo agregás a uno de esos dos
archivos, nunca corre.** Pasó: cuatro jobs (`process-webhook-deliveries`,
`process-scheduled-deletions`, `weekly-db-snapshot`, `refresh-recommendations`)
estuvieron meses escritos y sin scheduler. Se arreglaron en `6e6318d`.

## Los doce

| Job | Cuándo | Qué hace |
|---|---|---|
| `cleanup-expired-newsletter` | diaria 03:00 UTC | Borra suscripciones no confirmadas de más de 14 días. |
| `cleanup-pending-orders` | cada 6 h | Marca `cancelled` las órdenes `pending` de más de 48 h. |
| `cart-abandonment-sweep` | cada 1 h (min. 5) | Dispara `cart-abandoned` a n8n para carritos sin acción entre 2 h y 24 h. |
| `reservation-reminders` | cada 1 h (min. 15) | Recordatorio 24 h antes de una reserva confirmada. |
| `monthly-referral-payouts` | día 1, 09:00 UTC | Aprueba las comisiones `confirmed` de más de 30 días. |
| `reindex-search` | domingos 04:00 UTC | Métrica de salud del índice full-text. |
| `live-session-reminders` | cada 15 min | Avisos 24 h y 1 h antes de una clase en vivo. Idempotente por `reminders_sent`. |
| `process-webhook-deliveries` | cada 10 min | Vacía la cola de webhooks salientes (`lib/webhooks-out`), hasta 100 por corrida. |
| `process-scheduled-deletions` | diaria 02:30 UTC | **Ejecuta los borrados de cuenta que promete `/privacidad`**: anonimiza a quien pidió baja y ya cumplió el período de arrepentimiento. Hasta 100 por corrida. |
| `weekly-db-snapshot` | lunes 05:00 UTC | Snapshot completo al bucket `backups`. |
| `refresh-recommendations` | diaria 04:40 UTC | `refresh materialized view` de las co-compras que alimentan "quien compró esto…". |
| `acequia-aviso-cobro` | diaria 13:00 UTC | Avisa "en ~24 h se hace el primer cobro" a quien está en prueba. Ventana de 12–36 h antes de `trial_end` porque el cron corre una vez por día; con una ventana más angosta, media prueba caería entre dos corridas. No reenvía: `aviso_cobro_at`. |

## Cómo se agrega un job

1. Escribir el handler en `apps/web/lib/jobs/handlers.ts` y sumarlo al mapa `HANDLERS`.
2. Agregar el `cron:` **y** el job de `curl` en `.github/workflows/cron.yml`
   (o la entrada en `apps/web/vercel.json` si toca plata).
3. Documentarlo en la tabla de acá arriba.

El paso 2 es el que se olvida.

## Correr uno a mano

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  https://arteytierra.org/api/cron/reindex-search
```

## Lock cooperativo

Cada job toma `app.job_locks` antes de correr. Si llega otro intento dentro del
mismo período —o si un lock quedó colgado menos de 1 h— responde
`200 { skipped: true }`. O sea: una corrida duplicada no hace daño, pero
tampoco avisa fuerte. Para saber si algo realmente corrió, mirar `app.job_runs`.

## Observabilidad

Toda corrida queda en `app.job_runs` con `started_at / finished_at / status /
result / error`:

```sql
select job, status, started_at, finished_at, error
from app.job_runs
order by started_at desc
limit 50;
```

Un job que no aparece nunca en esa tabla es un job que no tiene scheduler.
