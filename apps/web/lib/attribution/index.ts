import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Vincula una orden a su attribution multi-touch (last-non-direct).
 * Llamar desde el fulfillment después de marcar la orden como paid.
 * Idempotente: upsert sobre order_id.
 */
export async function recordOrderAttribution(args: {
  orderId: string;
  userId: string | null;
  visitorId: string | null;
  amountCents: number;
  currency: string;
  partnerRef?: string | null;
  personalRef?: string | null;
}): Promise<void> {
  const admin = createSupabaseAdminClient();

  // Buscar el primer y último touch del user (preferido) o del visitor_id.
  const orQuery: string[] = [];
  if (args.userId) orQuery.push(`user_id.eq.${args.userId}`);
  if (args.visitorId) orQuery.push(`visitor_id.eq.${args.visitorId}`);
  if (orQuery.length === 0) return;

  const { data: touches } = await admin
    .schema('app')
    .from('attribution_touches')
    .select('id, source, medium, campaign, partner_ref, personal_ref, created_at')
    .or(orQuery.join(','))
    .order('created_at', { ascending: true })
    .limit(50);

  const list = (touches ?? []) as Array<{
    id: string;
    source: string | null;
    medium: string | null;
    campaign: string | null;
    partner_ref: string | null;
    personal_ref: string | null;
  }>;

  // Last non-direct = último con source distinto de null/direct
  const lastNonDirect = [...list].reverse().find((t) => t.source && t.source !== 'direct') ?? null;
  const first = list[0] ?? null;
  const last = lastNonDirect ?? list[list.length - 1] ?? null;

  await admin.schema('app').from('attribution_conversions').upsert({
    order_id: args.orderId,
    user_id: args.userId,
    visitor_id: args.visitorId,
    first_touch_id: first?.id ?? null,
    last_touch_id: last?.id ?? null,
    source: last?.source ?? null,
    medium: last?.medium ?? null,
    campaign: last?.campaign ?? null,
    partner_ref: args.partnerRef ?? last?.partner_ref ?? null,
    personal_ref: args.personalRef ?? last?.personal_ref ?? null,
    amount_cents: args.amountCents,
    currency: args.currency,
  });
}
