import 'server-only';
import crypto from 'node:crypto';

/**
 * Meta Conversions API (CAPI) — tracking server-side.
 *
 * Ventajas sobre el pixel cliente:
 *   - Sobrevive a iOS 14.5+/ITP/adblockers (señal completa).
 *   - Permite deduplicar con `event_id` cuando el pixel también dispara.
 *   - Cumple GDPR/LGPD si se hashean PII antes de enviar.
 *
 * Doc: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

type EventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Subscribe';

interface UserData {
  email?: string;
  phone?: string;
  externalId?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbc?: string; // _fbc cookie
  fbp?: string; // _fbp cookie
  city?: string;
  country?: string;
}

interface CustomData {
  currency?: string;
  value?: number; // unidades, no centavos
  contentIds?: string[];
  contentName?: string;
  contentType?: 'product' | 'product_group';
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  numItems?: number;
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

function hashUserData(u: UserData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  if (u.email) out.em = [sha256(u.email)];
  if (u.phone) out.ph = [sha256(u.phone.replace(/\D/g, ''))];
  if (u.externalId) out.external_id = [sha256(u.externalId)];
  if (u.city) out.ct = [sha256(u.city)];
  if (u.country) out.country = [sha256(u.country)];
  if (u.clientIp) out.client_ip_address = u.clientIp;
  if (u.clientUserAgent) out.client_user_agent = u.clientUserAgent;
  if (u.fbc) out.fbc = u.fbc;
  if (u.fbp) out.fbp = u.fbp;
  return out;
}

export async function sendMetaEvent(opts: {
  eventName: EventName;
  eventId?: string; // mismo que el pixel para deduplicar
  eventSourceUrl?: string;
  userData: UserData;
  customData?: CustomData;
}): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  if (!pixelId || !accessToken) return;

  const payload = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId ?? crypto.randomUUID(),
        event_source_url: opts.eventSourceUrl,
        action_source: 'website',
        user_data: hashUserData(opts.userData),
        custom_data: opts.customData
          ? {
              currency: opts.customData.currency,
              value: opts.customData.value,
              content_ids: opts.customData.contentIds,
              content_name: opts.customData.contentName,
              content_type: opts.customData.contentType,
              contents: opts.customData.contents,
              num_items: opts.customData.numItems,
            }
          : undefined,
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) console.error('[Meta CAPI]', res.status, await res.text());
  } catch (err) {
    console.error('[Meta CAPI] failed', err);
  }
}
