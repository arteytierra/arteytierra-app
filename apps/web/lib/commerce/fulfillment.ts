import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendMetaEvent } from '@/lib/integrations/meta-capi';
import { attributeOrderPaid } from '@/lib/referrals';
import { attributePartnerForOrder } from '@/lib/partners';
import { issueGiftCardForOrderItem, consumeGiftCardForOrder } from '@/lib/gift-cards';
import { walletTransact } from '@/lib/wallet';
import { sendTransactional } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { recordOrderAttribution } from '@/lib/attribution';
import { cookies } from 'next/headers';

/**
 * Marca una orden como pagada e idempotentemente dispara fulfillment.
 * Los triggers SQL ya manejan:
 *   - inserción de fin.transactions (sync_order_to_finance)
 *   - decremento de stock (decrement_stock)
 *   - creación de enrollments si hay user_id (create_enrollments_on_paid)
 *
 * Esta función agrega lo que SQL no puede:
 *   - registrar payment crudo
 *   - notificar a n8n (post-venta, WhatsApp, email)
 *   - retornar resumen para webhook
 */
export async function markOrderPaid(opts: {
  orderId: string;
  provider: 'stripe' | 'mercadopago';
  providerPaymentId: string;
  amountCents: number;
  currency: string;
  raw: unknown;
}) {
  const admin = createSupabaseAdminClient();

  // Idempotencia: si ya existe el payment con este provider_payment_id, salir
  const { data: existingPayment } = await admin
    .from('payments')
    .select('id')
    .eq('provider', opts.provider)
    .eq('provider_payment_id', opts.providerPaymentId)
    .maybeSingle();

  if (existingPayment) return { idempotent: true };

  // Insertar payment
  await admin.from('payments').insert({
    order_id: opts.orderId,
    provider: opts.provider,
    provider_payment_id: opts.providerPaymentId,
    amount_cents: opts.amountCents,
    currency: opts.currency,
    status: 'succeeded',
    raw: opts.raw,
  });

  // Marcar orden como paid (dispara triggers de DB)
  const { data: order } = await admin
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', opts.orderId)
    .neq('status', 'paid')
    .select('id, user_id, currency, total_cents, subtotal_cents, billing, contact_id')
    .maybeSingle();

  if (!order) return { idempotent: true };

  // Vaciar carrito asociado (si el user_id tiene carrito)
  if ((order as never as { user_id: string | null }).user_id) {
    await admin.rpc('clear_user_cart', { p_user: order.user_id }).then(() => {}).catch(async () => {
      const { data: cart } = await admin
        .from('carts')
        .select('id')
        .eq('user_id', order.user_id!)
        .maybeSingle();
      if (cart) {
        await admin.from('cart_items').delete().eq('cart_id', cart.id);
        await admin.from('carts').update({ coupon_code: null }).eq('id', cart.id);
      }
    });
  }

  // Crear reservas para órdenes con productos reservables (lodging/consult/immersion)
  await fulfillReservations(opts.orderId);

  // Registrar redenciones de cupones (motor avanzado). Incrementa `used` y
  // persiste fila en shop.coupon_redemptions para constraints per-user.
  await recordCouponRedemptions(opts.orderId);

  // Emitir gift cards si la orden incluye items tipo 'gift_card'.
  await issueGiftCardsForOrder(opts.orderId);

  // Consumir gift card aplicada en el cart (si la había).
  await redeemCartGiftCardForOrder(opts.orderId);

  // Consumir saldo de wallet si la orden vino con `billing.wallet_amount_cents`.
  await consumeWalletForOrder(opts.orderId);

  // Atribuir referido si la orden vino con un ?ref=CODE persistido en billing.
  const billingAny = (order as never as { billing: Record<string, unknown> | null }).billing;
  const refCode = (billingAny?.referral_code as string | undefined) ?? null;
  const subtotal = (order as never as { subtotal_cents: number | null }).subtotal_cents ?? opts.amountCents;
  void attributeOrderPaid({
    orderId: opts.orderId,
    userId: (order as never as { user_id: string | null }).user_id,
    subtotalCents: subtotal,
    currency: opts.currency,
    refCode,
  });

  // Atribuir partner B2B (ledger separado). El partner_ref_code se persiste
  // en billing al snapshotearlo en checkout (cookie ay_partner_ref).
  const partnerRef = (billingAny?.partner_ref_code as string | undefined) ?? null;
  if (partnerRef) {
    void attributePartnerForOrder({
      orderId: opts.orderId,
      refCode: partnerRef,
      amountCents: subtotal,
      currency: opts.currency,
      buyerUserId: (order as never as { user_id: string | null }).user_id,
    }).catch((err) => console.error('[partner] attribute failed', err));
  }

  // Attribution snapshot (last-non-direct) — best-effort
  {
    const buyerUserId = (order as never as { user_id: string | null }).user_id;
    try {
      const cks = await cookies();
      const vid = cks.get('ay_vid')?.value ?? null;
      void recordOrderAttribution({
        orderId: opts.orderId,
        userId: buyerUserId,
        visitorId: vid,
        amountCents: opts.amountCents,
        currency: opts.currency,
        partnerRef: partnerRef ?? null,
        personalRef: refCode ?? null,
      });
    } catch {
      /* cookies() puede fallar fuera de request context — best-effort */
    }
  }

  // Notificación in-app + push al comprador
  {
    const buyerUserId = (order as never as { user_id: string | null }).user_id;
    if (buyerUserId) {
      void createNotification({
        userId: buyerUserId,
        kind: 'order_paid',
        title: 'Pago confirmado',
        body: `Pedido ${opts.orderId.slice(0, 8)} confirmado.`,
        url: `/mis-pedidos`,
        data: { order_id: opts.orderId },
        push: true,
      });
    }
  }

  // Email de confirmación (best-effort)
  {
    const buyerEmail = (billingAny?.email as string | undefined) ?? null;
    const buyerName = (billingAny?.first_name as string | undefined) ?? (billingAny?.name as string | undefined) ?? '';
    const buyerLocale = (billingAny?.locale as 'es' | 'en' | 'pt' | undefined) ?? 'es';
    if (buyerEmail) {
      const total = ((order as never as { total_cents: number }).total_cents ?? opts.amountCents) / 100;
      const totalLabel = new Intl.NumberFormat(buyerLocale === 'es' ? 'es-AR' : buyerLocale, {
        style: 'currency',
        currency: opts.currency,
      }).format(total);
      void sendTransactional({
        to: buyerEmail,
        userId: (order as never as { user_id: string | null }).user_id,
        template: 'order-paid',
        category: 'transactional',
        force: true,
        locale: buyerLocale,
        vars: {
          name: buyerName || 'Hola',
          orderId: opts.orderId.slice(0, 8),
          totalLabel,
          url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/mis-pedidos`,
        },
      });
    }
  }

  // Notificar a n8n (best-effort, no bloquea)
  // Outbound webhooks
  {
    const { dispatchWebhook } = await import('@/lib/webhooks-out');
    void dispatchWebhook('order.paid', {
      order_id: opts.orderId,
      amount_cents: opts.amountCents,
      currency: opts.currency,
      provider: opts.provider,
      user_id: (order as never as { user_id: string | null }).user_id,
      partner_ref: partnerRef ?? null,
    });
  }

  void emitN8nEvent('order-paid', {
    order_id: opts.orderId,
    provider: opts.provider,
    amount_cents: opts.amountCents,
    currency: opts.currency,
    user_id: (order as never as { user_id: string | null }).user_id,
  });

  // Meta CAPI · Purchase (event_id = order.id para dedupe con pixel client en /success)
  const billing = (order as never as { billing: { email?: string; phone?: string } | null }).billing;
  void sendMetaEvent({
    eventName: 'Purchase',
    eventId: opts.orderId,
    userData: {
      email: billing?.email,
      phone: billing?.phone,
      externalId: (order as never as { user_id: string | null }).user_id ?? undefined,
      country: 'AR',
    },
    customData: {
      currency: opts.currency,
      value: opts.amountCents / 100,
    },
  });

  return { idempotent: false };
}

/**
 * Registra redenciones de cupones aplicados a la orden.
 * Lee `order.billing.applied_coupons` (snapshot del stack) e inserta filas en
 * shop.coupon_redemptions + incrementa shop.coupons.used. Idempotente: si ya
 * existe una redención para (code, order_id) la salta.
 */
async function recordCouponRedemptions(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, billing, coupon_code')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return;

  const billing = (order as never as { billing: Record<string, unknown> | null }).billing ?? {};
  const stack = (billing.applied_coupons as Array<{ code: string; discount_cents: number }> | undefined) ?? [];

  // Fallback: si no hay stack pero hay coupon_code legacy, registrar al menos eso.
  const legacy = (order as never as { coupon_code: string | null }).coupon_code;
  if (stack.length === 0 && legacy) {
    stack.push({ code: legacy, discount_cents: 0 });
  }
  if (stack.length === 0) return;

  const userId = (order as never as { user_id: string | null }).user_id;
  for (const c of stack) {
    // Dedupe (code, order_id) — usamos select previo dado que no hay unique constraint.
    const { data: existing } = await admin
      .schema('shop')
      .from('coupon_redemptions')
      .select('id')
      .eq('code', c.code)
      .eq('order_id', orderId)
      .maybeSingle();
    if (existing) continue;
    await admin.schema('shop').from('coupon_redemptions').insert({
      code: c.code,
      user_id: userId,
      order_id: orderId,
      discount_cents: c.discount_cents,
    });
    // Incrementar contador `used`.
    await admin.rpc('increment_coupon_used', { p_code: c.code }).then(() => {}).catch(async () => {
      // Fallback si no existe el RPC: read-modify-write best-effort.
      const { data: row } = await admin
        .schema('shop')
        .from('coupons')
        .select('used')
        .eq('code', c.code)
        .maybeSingle();
      await admin.schema('shop').from('coupons')
        .update({ used: ((row?.used as number | undefined) ?? 0) + 1 })
        .eq('code', c.code);
    });
  }
}

/**
 * Lee los order_items de tipo lodging/consult/immersion y crea reservaciones
 * confirmadas. Idempotente: si ya existe una reserva para esa order_item, no inserta.
 */
async function fulfillReservations(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, billing')
    .eq('id', orderId)
    .single();
  if (!order) return;

  const { data: items } = await admin
    .from('order_items')
    .select('id, product_id, product_type, metadata, name_snapshot')
    .eq('order_id', orderId)
    .in('product_type', ['lodging', 'consult', 'immersion']);

  for (const it of (items ?? []) as never as Array<{
    id: string; product_id: string; product_type: string;
    metadata: Record<string, unknown> | null; name_snapshot: string;
  }>) {
    const meta = it.metadata ?? {};
    const startsAt = meta.startsAt as string | undefined;
    const endsAt = meta.endsAt as string | undefined;
    const guests = (meta.guests as number | undefined) ?? 1;
    if (!startsAt || !endsAt) continue;

    // Buscar resource asociado al producto
    const { data: resource } = await admin
      .from('resources')
      .select('id')
      .eq('product_id', it.product_id)
      .maybeSingle();
    if (!resource) continue;

    // Idempotencia: ¿ya hay una reserva de esta order?
    const { data: existing } = await admin
      .from('reservations')
      .select('id')
      .eq('order_id', orderId)
      .eq('resource_id', resource.id)
      .maybeSingle();
    if (existing) continue;

    const icalUid = `${orderId}-${it.id}@arteytierra.org`;

    await admin.from('reservations').insert({
      resource_id: resource.id,
      order_id: orderId,
      user_id: order.user_id,
      starts_at: startsAt,
      ends_at: endsAt,
      guests,
      status: 'confirmed',
      ical_uid: icalUid,
    });

    // Marcar slot como booked si existe uno
    await admin
      .from('availability')
      .update({ status: 'booked' })
      .eq('resource_id', resource.id)
      .gte('starts_at', startsAt)
      .lte('ends_at', endsAt)
      .eq('status', 'open');
  }
}

/**
 * Emite gift cards por cada order_item de tipo 'gift_card'.
 * Idempotente: issueGiftCardForOrderItem busca duplicados por (issued_order_id, initial_cents).
 */
async function issueGiftCardsForOrder(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, currency, billing')
    .eq('id', orderId)
    .single();
  if (!order) return;

  const { data: items } = await admin
    .from('order_items')
    .select('id, metadata, unit_price_cents, qty, name_snapshot')
    .eq('order_id', orderId)
    .eq('product_type', 'gift_card');

  const billing = (order as never as { billing: Record<string, unknown> | null }).billing ?? {};
  for (const it of (items ?? []) as Array<{
    id: string; metadata: Record<string, unknown> | null; unit_price_cents: number; qty: number;
  }>) {
    const meta = it.metadata ?? {};
    const recipientEmail = (meta.recipient_email as string) ?? (billing.email as string | undefined) ?? null;
    const recipientName = (meta.recipient_name as string) ?? null;
    const message = (meta.message as string) ?? null;
    const expiresAt = (meta.expires_at as string) ?? null;
    for (let i = 0; i < it.qty; i++) {
      try {
        await issueGiftCardForOrderItem({
          orderId,
          issuerUserId: (order as never as { user_id: string | null }).user_id,
          amountCents: it.unit_price_cents,
          currency: (order as never as { currency: string }).currency,
          recipientEmail,
          recipientName,
          message,
          expiresAt,
        });
      } catch {
        /* idempotente — ignorar duplicados */
      }
    }
  }
}

/**
 * Si la orden vino con `billing.gift_card_code`, la consume contra el subtotal.
 */
async function redeemCartGiftCardForOrder(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, total_cents, billing')
    .eq('id', orderId)
    .single();
  if (!order) return;
  const billing = (order as never as { billing: Record<string, unknown> | null }).billing;
  const code = (billing?.gift_card_code as string | undefined) ?? null;
  if (!code) return;
  await consumeGiftCardForOrder({
    orderId,
    cartId: null,
    code,
    amountCents: (order as never as { total_cents: number }).total_cents,
    userId: (order as never as { user_id: string | null }).user_id,
  });
}

/**
 * Si la orden vino con `billing.wallet_amount_cents` > 0, descuenta saldo
 * del usuario y deja un entry en el ledger. Idempotente: chequea source+ref.
 */
async function consumeWalletForOrder(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, currency, billing')
    .eq('id', orderId)
    .single();
  if (!order) return;
  const userId = (order as never as { user_id: string | null }).user_id;
  if (!userId) return;
  const billing = (order as never as { billing: Record<string, unknown> | null }).billing;
  const amount = Number(billing?.wallet_amount_cents ?? 0);
  if (!amount || amount <= 0) return;

  // Idempotencia
  const { data: existing } = await admin
    .from('wallet_entries')
    .select('id')
    .eq('source', 'order_payment')
    .eq('ref_id', orderId)
    .maybeSingle();
  if (existing) return;

  try {
    await walletTransact({
      userId,
      currency: (order as never as { currency: 'ARS' | 'USD' }).currency,
      amountCents: -amount,
      source: 'order_payment',
      refId: orderId,
      description: `Pago de orden ${orderId.slice(0, 8)}`,
    });
  } catch {
    /* insuficiente o error — no bloquea fulfillment */
  }
}

/**
 * Devuelve signed URLs por 7 días para los ebooks comprados en una orden.
 */
export async function getEbookDownloadUrls(orderId: string) {
  const admin = createSupabaseAdminClient();
  const { data: items } = await admin
    .from('order_items')
    .select('product_id, name_snapshot, products(attributes)')
    .eq('order_id', orderId)
    .eq('product_type', 'ebook');

  const urls: Array<{ name: string; url: string }> = [];
  for (const it of (items ?? []) as never as Array<{
    name_snapshot: string; products: { attributes: Record<string, unknown> | null } | null
  }>) {
    const path = it.products?.attributes?.['ebook_path'] as string | undefined;
    if (!path) continue;
    const { data: signed } = await admin.storage
      .from('ebooks')
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signed?.signedUrl) urls.push({ name: it.name_snapshot, url: signed.signedUrl });
  }
  return urls;
}
