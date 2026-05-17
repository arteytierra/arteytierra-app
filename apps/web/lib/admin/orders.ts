'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { log } from '@/lib/observability/logger';

/**
 * Acciones admin sobre órdenes.
 *  - resendOrderEmail: dispara evento n8n para re-emitir confirmación
 *  - refundOrder: marca status refunded y notifica (procesamiento real lo hace n8n/provider)
 *  - cancelOrder: marca status cancelled si la orden no fue pagada
 */

export async function resendOrderEmail(orderId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, status, user_id, billing')
    .eq('id', orderId)
    .single();
  if (!order) throw new Error('Orden no encontrada');
  if (order.status !== 'paid') throw new Error('Sólo se pueden reenviar emails de órdenes pagadas');

  void emitN8nEvent('order-paid', {
    order_id: order.id,
    resend: true,
    user_id: order.user_id,
  });
  log.info('order.resend_email', { orderId });
  return { ok: true };
}

export async function refundOrder(orderId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', orderId)
    .eq('status', 'paid')
    .select('id, provider, provider_order_id, total_cents, currency')
    .single();
  if (error || !order) throw new Error('No se pudo marcar como reembolsada');

  // Disparar n8n: el workflow procesa refund en Stripe/MP y notifica al cliente
  void emitN8nEvent('order-cancelled', {
    order_id: order.id,
    refund: true,
    provider: order.provider,
    provider_order_id: order.provider_order_id,
    amount_cents: order.total_cents,
    currency: order.currency,
  });

  revalidatePath(`/admin/ventas/${orderId}`);
  log.info('order.refund_requested', { orderId });
  return { ok: true };
}

export async function cancelOrder(orderId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .in('status', ['pending', 'failed']);
  if (error) throw new Error(error.message);

  void emitN8nEvent('order-cancelled', { order_id: orderId, refund: false });
  revalidatePath(`/admin/ventas/${orderId}`);
  log.info('order.cancelled', { orderId });
  return { ok: true };
}
