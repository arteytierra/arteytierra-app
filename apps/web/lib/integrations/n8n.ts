import 'server-only';

/**
 * Cliente tipado para disparar webhooks salientes hacia n8n.
 * No bloquea: errores se loguean pero no rompen el flujo principal.
 *
 * Convención de rutas en n8n:
 *   POST {N8N_WEBHOOK_URL}/{event}
 * con header `Authorization: Bearer {N8N_WEBHOOK_TOKEN}`.
 */

type N8nEvent =
  | 'order-paid'
  | 'order-pending'
  | 'order-cancelled'
  | 'cart-abandoned'
  | 'enrollment-created'
  | 'lesson-completed'
  | 'course-completed'
  | 'reservation-confirmed'
  | 'reservation-cancelled'
  | 'contact-created'
  | 'newsletter-subscribed'
  | 'newsletter-double-optin'
  | 'newsletter-confirmed'
  | 'newsletter-unsubscribed'
  | 'gift-card-issued'
  | 'gift-card-redeemed'
  | 'live-reminder'
  | 'review-submitted'
  | 'qa-question-asked'
  | 'qa-answered'
  | 'certificate-issued'
  | 'certificate-revoked'
  | 'scholarship-applied'
  | 'scholarship-approved'
  | 'scholarship-rejected'
  | 'partner-applied'
  | 'partner-decision';

export async function emitN8nEvent<T extends Record<string, unknown>>(
  event: N8nEvent,
  payload: T,
): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  const token = process.env.N8N_WEBHOOK_TOKEN;
  if (!url) return;

  try {
    await fetch(`${url}/${event}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ event, ts: new Date().toISOString(), payload }),
      // best-effort, no esperamos respuesta
      keepalive: true,
    });
  } catch (err) {
    console.error('[n8n] emit failed', event, err);
  }
}

/**
 * Verifica token entrante para endpoints internos consumidos por n8n.
 * Usar con `Authorization: Bearer {N8N_INTERNAL_TOKEN}`.
 */
export function verifyN8nInbound(req: Request): boolean {
  const expected = process.env.N8N_INTERNAL_TOKEN;
  if (!expected) return false;
  const got = req.headers.get('authorization') ?? '';
  const token = got.startsWith('Bearer ') ? got.slice(7) : '';
  if (token.length !== expected.length) return false;
  // comparación constante en tiempo
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
