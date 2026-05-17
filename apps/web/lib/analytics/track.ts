'use client';

/**
 * Tracker unificado · pixel cliente + CAPI server-side con deduplicación.
 *
 * Cada evento genera un `eventId` único; se envía tanto vía window.fbq
 * (si el pixel está cargado) como a /api/track con el mismo id.
 * Meta deduplica por (event_name, event_id).
 */

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : undefined;
}

interface TrackPayload {
  event: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'Subscribe';
  currency?: string;
  value?: number;
  contentIds?: string[];
  contentName?: string;
  contentType?: 'product' | 'product_group';
  email?: string;
  phone?: string;
}

export function track(p: TrackPayload) {
  const eventId = uuid();
  const url = typeof window !== 'undefined' ? window.location.href : undefined;

  // Pixel cliente (si fbq cargado)
  type Fbq = (cmd: 'track', name: string, data?: Record<string, unknown>, opts?: { eventID: string }) => void;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === 'function') {
    fbq(
      'track',
      p.event,
      {
        currency: p.currency,
        value: p.value,
        content_ids: p.contentIds,
        content_name: p.contentName,
        content_type: p.contentType,
      },
      { eventID: eventId },
    );
  }

  // CAPI server-side (mismo eventId → dedupe)
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...p,
      eventId,
      url,
      fbc: readCookie('_fbc'),
      fbp: readCookie('_fbp'),
    }),
    keepalive: true,
  }).catch(() => {});
}
