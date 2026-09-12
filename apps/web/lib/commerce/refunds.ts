import 'server-only';
import { getStripe } from '@/lib/commerce/stripe';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Reembolsos.
 *
 * Antes, "reembolsar" desde el panel escribía `status = 'refunded'` en la orden
 * y emitía un evento de n8n para que algún workflow hiciera el reembolso de
 * verdad. Los workflows de n8n están apagados, así que el botón dejaba la orden
 * marcada como devuelta sin que se moviera un peso: el registro decía una cosa
 * y la cuenta bancaria de la persona, otra. Eso es peor que no tener el botón.
 *
 * Acá el orden es al revés y no se negocia: **primero se le pide el reembolso al
 * proveedor, y recién si el proveedor lo confirma se marca la orden**. Si el
 * proveedor falla, la orden queda como estaba y quien opera ve el error.
 */

export class ReembolsoNoAutomatico extends Error {}

/** Busca el id de pago que guardó el webhook al cobrar. */
async function idDePago(orderId: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('payments')
    .select('provider_payment_id, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { provider_payment_id?: string } | null)?.provider_payment_id ?? null;
}

/**
 * Pide el reembolso al proveedor. Devuelve el id del reembolso.
 *
 * Mercado Pago no está automatizado: se lanza `ReembolsoNoAutomatico` para que
 * quien opera lo haga desde el panel de MP. Preferimos decirlo antes que dejar
 * la orden marcada como devuelta sin haber devuelto nada.
 */
export async function pedirReembolsoAlProveedor(opts: {
  orderId: string;
  provider: string | null;
  totalCents: number;
}): Promise<string> {
  if (opts.provider !== 'stripe') {
    throw new ReembolsoNoAutomatico(
      `Los reembolsos de ${opts.provider ?? 'este proveedor'} todavía se hacen a mano desde su panel. ` +
      'Hacelo ahí y volvé a marcar la orden cuando el reembolso esté confirmado.',
    );
  }

  const paymentIntent = await idDePago(opts.orderId);
  if (!paymentIntent) {
    throw new Error(
      'No encontramos el pago de Stripe asociado a esta orden. Revisá el panel de Stripe antes de marcarla.',
    );
  }

  const stripe = getStripe();
  const refund = await stripe.refunds.create(
    { payment_intent: paymentIntent, reason: 'requested_by_customer' },
    // Si alguien hace doble clic, Stripe devuelve el mismo reembolso en vez de
    // cobrar dos veces la devolución.
    { idempotencyKey: `refund:${opts.orderId}` },
  );

  if (refund.status === 'failed' || refund.status === 'canceled') {
    throw new Error(`Stripe rechazó el reembolso (estado: ${refund.status}). La orden queda sin cambios.`);
  }
  return refund.id;
}

/**
 * Marca la orden como reembolsada. El trigger `expire_enrollments_on_refund`
 * (migración 0060) se encarga de cerrar el acceso a los cursos que incluía.
 *
 * Idempotente: si ya estaba en 'refunded' no hace nada y no es un error, porque
 * el webhook de Stripe y el botón del panel pueden llegar los dos.
 */
export async function marcarOrdenReembolsada(orderId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('orders')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('id', orderId)
    .neq('status', 'refunded')
    .select('id')
    .maybeSingle();
  return Boolean(data);
}

/** Encuentra la orden a partir del id de pago que manda el webhook. */
export async function ordenDePago(providerPaymentId: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('payments')
    .select('order_id')
    .eq('provider_payment_id', providerPaymentId)
    .maybeSingle();
  return (data as { order_id?: string } | null)?.order_id ?? null;
}
