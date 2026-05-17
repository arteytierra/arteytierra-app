# n8n Workflows · Arte y Tierra

Workflows exportados listos para importar en una instancia n8n self-hosted (o n8n.cloud).

## Setup

1. **Credenciales / variables de entorno en n8n:**

   ```
   SITE_URL=https://arteytierra.org
   N8N_INTERNAL_TOKEN=<token compartido con la app>
   WHATSAPP_PHONE_ID=<Meta WhatsApp Cloud API phone id>
   WHATSAPP_TOKEN=<Meta token>
   AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/...
   BOOKING_ICAL_URL=https://admin.booking.com/hotel/hoteladmin/ical.html?...
   LODGING_RESOURCE_ID=<uuid de book.resources>
   ```

   Y en `apps/web/.env.local`:

   ```
   N8N_WEBHOOK_URL=https://n8n.tu-dominio.com/webhook
   N8N_WEBHOOK_TOKEN=<bearer para webhooks salientes>
   N8N_INTERNAL_TOKEN=<mismo token que arriba>
   ```

2. **Importar workflows:**
   - Settings → Import from File → cada `.json` de esta carpeta.
   - Configurar credenciales (SMTP, HTTP Header Auth con el bearer).
   - Activar cada workflow.

## Workflows incluidos

| #   | Archivo                          | Trigger                                  | Propósito                                                  |
| --- | -------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| 01  | `01-post-purchase.json`          | Webhook `order-paid` (emitido por la app) | Email confirmación + WhatsApp + tag CRM                    |
| 02  | `02-abandoned-cart.json`         | Cron horario                             | Recupera carritos abandonados 2-4h → email                 |
| 03  | `03-newsletter-welcome.json`     | Webhook `newsletter-subscribed`          | Secuencia bienvenida (2 emails)                            |
| 04  | `04-reservation-reminder.json`   | Cron cada 6h                             | Recordatorio 48h antes de llegada                          |
| 05  | `05-ical-sync.json`              | Cron cada 30min                          | Sync iCal Airbnb/Booking → tabla `availability` (blocked) |

## Eventos emitidos por la app

La app dispara eventos vía `emitN8nEvent(event, payload)` (ver `lib/integrations/n8n.ts`):

- `order-paid` · cuando el webhook de pago marca la orden pagada
- `order-pending` · checkout creado, esperando pago
- `order-cancelled` · cancelación manual
- `cart-abandoned` · (poleo, no push)
- `enrollment-created` · inscripción a curso confirmada
- `lesson-completed` · alumno completa lección
- `course-completed` · al emitir certificado
- `reservation-confirmed` / `reservation-cancelled`
- `contact-created` · alta CRM
- `newsletter-subscribed`
- `review-submitted`

Estructura del payload (siempre):

```json
{ "event": "order-paid", "ts": "2026-05-13T...", "payload": { ... } }
```

## Endpoints internos (para que n8n consulte la app)

Todos requieren `Authorization: Bearer ${N8N_INTERNAL_TOKEN}`.

- `GET  /api/n8n/orders?status=paid&from=&to=&limit=`
- `GET  /api/n8n/contacts?limit=`
- `POST /api/n8n/contacts` — upsert por email
- `GET  /api/n8n/abandoned-carts?hours=2&maxHours=72`
- `GET  /api/n8n/reservations?upcomingDays=14&status=confirmed`
- `POST /api/n8n/availability/block` — bloquea slot desde iCal externo

## Notas

- Los workflows son intencionalmente simples — se complementan, no reemplazan, la lógica transaccional (que vive en la app y SQL triggers).
- Para WhatsApp Cloud API hay que tener plantillas aprobadas por Meta (ej: `order_confirmation`).
- El parse iCal del workflow 05 maneja `DTSTART` simple (date y datetime); si el feed usa timezones VTIMEZONE complejos, considerá refactor a un nodo Code con `ical.js`.
