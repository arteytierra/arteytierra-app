'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { pedirReembolsoAlProveedor, marcarOrdenReembolsada } from '@/lib/commerce/refunds';
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
    .schema('shop').from('orders')
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

/**
 * Reembolsa una orden de verdad.
 *
 * Antes esto marcaba la orden como 'refunded' y emitia un evento de n8n para que
 * un workflow hiciera el reembolso. Los workflows estan apagados: la orden
 * quedaba marcada como devuelta sin que se moviera un peso. Ahora se le pide
 * primero al proveedor y la orden solo se marca si el proveedor confirma.
 */
export async function refundOrder(orderId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .schema('shop').from('orders')
    .select('id, status, provider, provider_order_id, total_cents, currency')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) throw new Error('No encontramos la orden.');
  if (order.status === 'refunded') return { ok: true, yaEstaba: true };
  if (order.status !== 'paid') throw new Error('Solo se puede reembolsar una orden pagada.');

  // Si esto tira, no se toca la orden: es exactamente lo que queremos.
  const refundId = await pedirReembolsoAlProveedor({
    orderId: order.id,
    provider: order.provider,
    totalCents: order.total_cents,
  });

  await marcarOrdenReembolsada(order.id);

  // El aviso al cliente sigue yendo por n8n, pero ya no es lo que hace el
  // reembolso: si no sale, el dinero volvio igual.
  void emitN8nEvent('order-cancelled', {
    order_id: order.id,
    refund: true,
    provider: order.provider,
    provider_order_id: order.provider_order_id,
    refund_id: refundId,
    amount_cents: order.total_cents,
    currency: order.currency,
  });

  revalidatePath(`/admin/ventas/${orderId}`);
  log.info('order.refunded', { orderId, refundId });
  return { ok: true };
}

export async function cancelOrder(orderId: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .schema('shop').from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .in('status', ['pending', 'failed']);
  if (error) throw new Error(error.message);

  void emitN8nEvent('order-cancelled', { order_id: orderId, refund: false });
  revalidatePath(`/admin/ventas/${orderId}`);
  log.info('order.cancelled', { orderId });
  return { ok: true };
}
