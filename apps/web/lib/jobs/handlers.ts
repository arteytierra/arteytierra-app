import 'server-only';
import type { JobHandler } from './runner';
import { emitN8nEvent } from '@/lib/integrations/n8n';

/**
 * Job handlers concretos. Cada uno recibe el admin client y devuelve métricas.
 */

// 1. Limpia suscripciones de newsletter no confirmadas con más de 14 días.
export const cleanupExpiredNewsletter: JobHandler = async (admin) => {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .schema('app').from('newsletter_subscribers')
    .delete({ count: 'exact' })
    .is('confirmed_at', null)
    .lt('created_at', cutoff);
  if (error) throw new Error(error.message);
  return { deleted: count ?? 0 };
};

// 2. Cancela órdenes en estado `pending` con más de 48 horas (paywall provider expiró).
export const cleanupPendingOrders: JobHandler = async (admin) => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .schema('shop').from('orders')
    .update({ status: 'cancelled' }, { count: 'exact' })
    .eq('status', 'pending')
    .lt('created_at', cutoff);
  if (error) throw new Error(error.message);
  return { cancelled: count ?? 0 };
};

// 3. Detecta carritos abandonados: con items, sin orden creada, última actualización
//    entre 2h y 24h atrás. Dispara n8n para enviar email de recovery (idempotencia
//    via flag `abandoned_notified_at` en cart).
export const cartAbandonmentSweep: JobHandler = async (admin) => {
  const minAge = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const maxAge = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: carts } = await admin
    .schema('shop').from('carts')
    .select('id, user_id, updated_at, abandoned_email_sent_at')
    .gte('updated_at', minAge)
    .lte('updated_at', maxAge)
    .is('abandoned_email_sent_at', null)
    .not('user_id', 'is', null)
    .limit(200);

  let dispatched = 0;
  for (const cart of (carts ?? []) as Array<{ id: string; user_id: string | null }>) {
    const { count } = await admin
      .schema('shop').from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('cart_id', cart.id);
    if ((count ?? 0) === 0) continue;

    void emitN8nEvent('cart-abandoned', {
      cart_id: cart.id,
      user_id: cart.user_id,
    });
    await admin
      .schema('shop').from('carts')
      .update({ abandoned_email_sent_at: new Date().toISOString() })
      .eq('id', cart.id);
    dispatched++;
  }

  return { scanned: carts?.length ?? 0, dispatched };
};

// 4. Manda recordatorios de reservas a 24h del check-in / sesión. Idempotente.
export const reservationReminders: JobHandler = async (admin) => {
  const from = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .schema('book').from('reservations')
    .select('id, user_id, resource_id, starts_at, reminder_sent_at, status')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('starts_at', from)
    .lte('starts_at', to);

  let sent = 0;
  for (const r of (data ?? []) as Array<{ id: string; user_id: string | null; resource_id: string; starts_at: string }>) {
    void emitN8nEvent('reservation-confirmed', {
      reservation_id: r.id,
      user_id: r.user_id,
      resource_id: r.resource_id,
      starts_at: r.starts_at,
      reminder: true,
    });
    await admin
      .schema('book').from('reservations')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', r.id);
    sent++;
  }
  return { scanned: data?.length ?? 0, sent };
};

// 5. Liquidación mensual de referidos: marca como "paid" todas las attributions
//    `confirmed` de más de 30 días con orden todavía pagada (no refunded).
export const monthlyReferralPayouts: JobHandler = async (admin) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: ready } = await admin
    .schema('app').from('referral_attributions')
    .select('id, order_id, code, commission_cents')
    .eq('status', 'confirmed')
    .lt('created_at', cutoff)
    .limit(500);

  let approved = 0;
  for (const a of (ready ?? []) as Array<{ id: string; order_id: string | null; code: string; commission_cents: number }>) {
    // Verificar que la orden siga en `paid` (no refunded)
    if (a.order_id) {
      const { data: order } = await admin
        .schema('shop').from('orders')
        .select('status')
        .eq('id', a.order_id)
        .single();
      if (order?.status !== 'paid') continue;
    }
    await admin
      .schema('app').from('referral_attributions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', a.id);
    approved++;
  }
  return { scanned: ready?.length ?? 0, paid: approved };
};

// 6. Refresca search vectors (no-op si tsvector es generated; útil para futuras
//    columnas calculadas custom). Por ahora, log de salud.
export const reindexSearch: JobHandler = async (admin) => {
  const [{ count: products }, { count: posts }] = await Promise.all([
    admin.schema('shop').from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin.schema('cms').from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  return { products: products ?? 0, posts: posts ?? 0 };
};

// 7. Recordatorios de clases en vivo a 24h y a 1h del inicio. Idempotente
//    via flag por bucket en `reminders_sent` jsonb.
export const liveSessionReminders: JobHandler = async (admin) => {
  const now = Date.now();
  const buckets: Array<{ key: '24h' | '1h'; min: number; max: number }> = [
    { key: '24h', min: 23 * 60 + 30, max: 24 * 60 + 30 }, // 23.5h - 24.5h
    { key: '1h',  min: 45,           max: 75 },           // 45min - 75min
  ];

  let sent = 0;
  for (const b of buckets) {
    const from = new Date(now + b.min * 60_000).toISOString();
    const to = new Date(now + b.max * 60_000).toISOString();
    const { data } = await admin
      .schema('edu').from('live_sessions')
      .select('id, course_id, title, scheduled_at, reminders_sent')
      .eq('status', 'scheduled')
      .gte('scheduled_at', from)
      .lte('scheduled_at', to);

    for (const s of (data ?? []) as Array<{ id: string; course_id: string | null; title: string; scheduled_at: string; reminders_sent: Record<string, boolean> | null }>) {
      if ((s.reminders_sent ?? {})[b.key]) continue;
      void emitN8nEvent('live-reminder', {
        session_id: s.id,
        course_id: s.course_id,
        title: s.title,
        scheduled_at: s.scheduled_at,
        bucket: b.key,
      });
      await admin
        .schema('edu').from('live_sessions')
        .update({ reminders_sent: { ...(s.reminders_sent ?? {}), [b.key]: true } })
        .eq('id', s.id);
      sent++;
    }
  }
  return { sent };
};

async function processScheduledDeletions() {
  const { createSupabaseAdminClient } = await import('@/lib/db/admin');
  const { anonymizeUser } = await import('@/lib/privacy');
  const admin = createSupabaseAdminClient();
  const { data: due } = await admin
    .schema('app')
    .from('privacy_requests')
    .select('id, user_id')
    .eq('kind', 'delete')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(100);
  let processed = 0;
  for (const r of ((due ?? []) as Array<{ id: string; user_id: string }>)) {
    try {
      await anonymizeUser(r.user_id);
      await admin
        .schema('app')
        .from('privacy_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: 'Auto-anonymized after cooling-off period',
        })
        .eq('id', r.id);
      processed++;
    } catch (err) {
      console.error('[privacy] anonymize failed', r.user_id, err);
    }
  }
  return { processed };
}

async function weeklyDbSnapshot() {
  const { runSnapshot } = await import('@/lib/snapshots');
  return await runSnapshot({ kind: 'full' });
}

async function processWebhookDeliveries() {
  const { processWebhookQueue } = await import('@/lib/webhooks-out');
  return await processWebhookQueue(100);
}

async function refreshRecommendations() {
  const { createSupabaseAdminClient } = await import('@/lib/db/admin');
  const admin = createSupabaseAdminClient();
  // REFRESH MATERIALIZED VIEW CONCURRENTLY si hay unique index — el migration lo crea
  const { error } = await admin.rpc('refresh_product_copurchases_safe').then((r) => r, () => ({ error: null as never }));
  if (error) console.warn('[recs] refresh failed', error);
  return { ok: true };
}

export const HANDLERS = {
  'cleanup-expired-newsletter': cleanupExpiredNewsletter,
  'cleanup-pending-orders': cleanupPendingOrders,
  'cart-abandonment-sweep': cartAbandonmentSweep,
  'reservation-reminders': reservationReminders,
  'monthly-referral-payouts': monthlyReferralPayouts,
  'reindex-search': reindexSearch,
  'live-session-reminders': liveSessionReminders,
  'refresh-recommendations': refreshRecommendations,
  'process-scheduled-deletions': processScheduledDeletions,
  'process-webhook-deliveries': processWebhookDeliveries,
  'weekly-db-snapshot': weeklyDbSnapshot,
} as const;

export type ValidJobName = keyof typeof HANDLERS;
