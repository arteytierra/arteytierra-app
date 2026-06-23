import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import type { BuyerCurrency } from './geo';

/**
 * Precio de un producto en la moneda objetivo.
 * - Si la moneda base ya es la objetivo → precio base.
 * - Si hay fila en shop.prices_intl para esa moneda → ese monto.
 * - Si no → fallback al precio base en su moneda original (nunca bloquea).
 */
export async function priceForCurrency(opts: {
  productId: string;
  baseCurrency: string;
  basePriceCents: number;
  target: BuyerCurrency;
}): Promise<{ amountCents: number; currency: string }> {
  if (opts.baseCurrency === opts.target) {
    return { amountCents: opts.basePriceCents, currency: opts.target };
  }
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('prices_intl')
    .select('amount_cents')
    .eq('product_id', opts.productId)
    .eq('currency', opts.target)
    .limit(1)
    .maybeSingle();
  if (data) return { amountCents: (data as { amount_cents: number }).amount_cents, currency: opts.target };
  return { amountCents: opts.basePriceCents, currency: opts.baseCurrency };
}

/**
 * Superpone el precio en la moneda del comprador (para mostrar en vitrinas).
 * Solo cambia los productos que tienen un precio cargado en `prices_intl` para
 * esa moneda; el resto queda en su moneda base. Una sola query batch.
 */
export async function overlayDisplayPrices<
  T extends { id: string; base_price_cents: number; compare_at_cents: number | null; currency: string },
>(rows: T[], target: BuyerCurrency): Promise<T[]> {
  const need = rows.filter((r) => r.currency !== target).map((r) => r.id);
  if (need.length === 0) return rows;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('prices_intl')
    .select('product_id, amount_cents')
    .eq('currency', target)
    .in('product_id', need);

  const map = new Map(
    (data ?? []).map((d) => [(d as { product_id: string }).product_id, (d as { amount_cents: number }).amount_cents]),
  );
  if (map.size === 0) return rows;

  return rows.map((r) =>
    map.has(r.id)
      ? { ...r, base_price_cents: map.get(r.id)!, currency: target, compare_at_cents: null }
      : r,
  );
}
