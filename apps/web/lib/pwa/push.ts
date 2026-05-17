import 'server-only';
import webpush from 'web-push';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Web Push (VAPID).
 *
 * Setup:
 *   1) Generar par VAPID con `npx web-push generate-vapid-keys`.
 *   2) Cargar VAPID_PUBLIC_KEY (también NEXT_PUBLIC_), VAPID_PRIVATE_KEY, VAPID_SUBJECT.
 *   3) Frontend pide permiso, suscribe vía Push Manager, envía a /api/push/subscribe.
 *   4) Backend persiste subscription en `push_subscriptions`.
 *   5) Para emitir push: `sendPushToUser(userId, payload)`.
 *
 * Doc: https://web.dev/articles/push-notifications-overview
 */

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:hola@arteytierra.org';
  if (!pub || !priv) throw new Error('VAPID keys no configuradas');
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
}

interface StoredSub {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; removed: number }> {
  ensureConfigured();
  const admin = createSupabaseAdminClient();
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  let sent = 0;
  let removed = 0;

  for (const s of ((subs ?? []) as unknown) as StoredSub[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number } | null)?.statusCode;
      // 404/410 = suscripción expirada → eliminar
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('id', s.id);
        removed++;
      } else {
        console.error('[push] send failed', err);
      }
    }
  }
  return { sent, removed };
}

export async function broadcastPush(payload: PushPayload, filter?: { onlyRole?: string }) {
  ensureConfigured();
  const admin = createSupabaseAdminClient();
  let q = admin.from('push_subscriptions').select('user_id, id, endpoint, p256dh, auth');
  if (filter?.onlyRole) q = q.eq('profiles.role', filter.onlyRole);
  const { data: subs } = await q;
  const unique = new Set<string>();
  let sent = 0;
  for (const s of ((subs ?? []) as unknown) as Array<StoredSub & { user_id: string }>) {
    if (unique.has(s.user_id)) continue;
    unique.add(s.user_id);
    const r = await sendPushToUser(s.user_id, payload);
    sent += r.sent;
  }
  return { sent, total_users: unique.size };
}
