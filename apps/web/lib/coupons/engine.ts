import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Motor de cupones avanzado — soporta BOGO, bundles, stacking determinista.
 *
 * Tipos:
 *   - percent       → value% sobre subtotal elegible
 *   - fixed         → value cents off (cap a subtotal elegible)
 *   - bogo          → buy_qty de buy_product_ids ⇒ get_qty de get_product_ids con get_discount_pct
 *   - bundle        → si el cart contiene todos los required_product_ids, fija el precio total
 *                     de esos productos en bundle_price_cents (por bundle-unit, ver bundle_units)
 *   - free_shipping → marca shipping=0 en el cart (no aplica descuento sobre items)
 *
 * Stacking:
 *   - Cupones no-stackables: sólo el mejor por descuento se aplica (los demás se descartan).
 *   - Cupones stackables: se aplican en orden de `priority` ASC sobre el subtotal RESTANTE
 *     (después del no-stackable elegido).
 *   - `first_order_only` y `max_uses_per_user` requieren user_id para evaluarse.
 */

export type CouponKind = 'percent' | 'fixed' | 'bogo' | 'bundle' | 'free_shipping';

export interface CouponRow {
  code: string;
  name: string | null;
  description: string | null;
  kind: CouponKind;
  value: number;
  currency: string | null;
  min_subtotal_cents: number | null;
  max_uses: number | null;
  used: number;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  stackable: boolean;
  priority: number;
  conditions: {
    product_ids?: string[];
    category_slugs?: string[];
    product_types?: string[];
    first_order_only?: boolean;
    max_uses_per_user?: number;
  };
  config: {
    // bogo
    buy_product_ids?: string[];
    buy_qty?: number;
    get_product_ids?: string[];
    get_qty?: number;
    get_discount_pct?: number;
    // bundle
    required_product_ids?: string[];
    bundle_price_cents?: number;
  };
}

export interface CartLine {
  cart_item_id: string;
  product_id: string;
  product_type: string;
  category_slugs?: string[];
  qty: number;
  unit_price_cents: number;
}

export interface ApplyContext {
  userId: string | null;
  cartId: string;
  lines: CartLine[];
  currency: string;
}

export interface AppliedCoupon {
  code: string;
  kind: CouponKind;
  discountCents: number;
  reason: string;
  freeShipping?: boolean;
}

export interface CouponResolution {
  applied: AppliedCoupon[];
  rejected: Array<{ code: string; reason: string }>;
  totalDiscountCents: number;
  freeShipping: boolean;
}

/** Filtra líneas elegibles por condiciones de un cupón. */
function eligibleLines(coupon: CouponRow, lines: CartLine[]): CartLine[] {
  const c = coupon.conditions ?? {};
  return lines.filter((l) => {
    if (c.product_ids?.length && !c.product_ids.includes(l.product_id)) return false;
    if (c.product_types?.length && !c.product_types.includes(l.product_type)) return false;
    if (c.category_slugs?.length) {
      const cats = l.category_slugs ?? [];
      if (!cats.some((cs) => c.category_slugs!.includes(cs))) return false;
    }
    return true;
  });
}

function subtotalOf(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.qty * l.unit_price_cents, 0);
}

async function checkUserConstraints(
  coupon: CouponRow,
  userId: string | null,
): Promise<string | null> {
  const c = coupon.conditions ?? {};
  if (!c.first_order_only && !c.max_uses_per_user) return null;
  if (!userId) {
    if (c.first_order_only) return 'Sólo para tu primera orden — iniciá sesión.';
    if (c.max_uses_per_user) return 'Iniciá sesión para usar este cupón.';
    return null;
  }
  const admin = createSupabaseAdminClient();
  if (c.first_order_only) {
    const { count } = await admin
      .schema('shop').from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'paid');
    if ((count ?? 0) > 0) return 'Solo válido para tu primera compra.';
  }
  if (c.max_uses_per_user) {
    const { count } = await admin
      .schema('shop').from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('code', coupon.code)
      .eq('user_id', userId);
    if ((count ?? 0) >= c.max_uses_per_user) return 'Ya usaste este cupón.';
  }
  return null;
}

/** Computa descuento individual sobre el cart (sin importar stacking todavía). */
function computeDiscount(
  coupon: CouponRow,
  lines: CartLine[],
): { discountCents: number; freeShipping: boolean; reason: string } {
  const elig = eligibleLines(coupon, lines);
  const eligSubtotal = subtotalOf(elig);
  const cartSubtotal = subtotalOf(lines);

  if (coupon.min_subtotal_cents && cartSubtotal < coupon.min_subtotal_cents) {
    return { discountCents: 0, freeShipping: false, reason: 'Subtotal mínimo no alcanzado.' };
  }

  switch (coupon.kind) {
    case 'percent': {
      if (!eligSubtotal) return { discountCents: 0, freeShipping: false, reason: 'Sin items elegibles.' };
      return {
        discountCents: Math.round(eligSubtotal * (coupon.value / 100)),
        freeShipping: false,
        reason: `-${coupon.value}% en ${elig.length} item(s)`,
      };
    }
    case 'fixed': {
      if (!eligSubtotal) return { discountCents: 0, freeShipping: false, reason: 'Sin items elegibles.' };
      return {
        discountCents: Math.min(coupon.value, eligSubtotal),
        freeShipping: false,
        reason: 'Descuento fijo',
      };
    }
    case 'free_shipping':
      return { discountCents: 0, freeShipping: true, reason: 'Envío gratis' };
    case 'bogo': {
      const cfg = coupon.config;
      const buyIds = cfg.buy_product_ids ?? [];
      const getIds = cfg.get_product_ids ?? [];
      const buyQty = cfg.buy_qty ?? 1;
      const getQty = cfg.get_qty ?? 1;
      const pct = cfg.get_discount_pct ?? 100;
      if (!buyIds.length || !getIds.length) {
        return { discountCents: 0, freeShipping: false, reason: 'BOGO mal configurado.' };
      }
      const buyUnits = lines
        .filter((l) => buyIds.includes(l.product_id))
        .reduce((s, l) => s + l.qty, 0);
      const triggers = Math.floor(buyUnits / buyQty);
      if (!triggers) return { discountCents: 0, freeShipping: false, reason: 'No alcanza umbral BOGO.' };

      // Aplica descuento sobre los productos `get` más baratos hasta cubrir triggers * getQty.
      const getLines = lines
        .filter((l) => getIds.includes(l.product_id))
        .flatMap((l) => Array(l.qty).fill(l.unit_price_cents) as number[])
        .sort((a, b) => a - b);
      const slots = Math.min(triggers * getQty, getLines.length);
      const sum = getLines.slice(0, slots).reduce((s, p) => s + p, 0);
      return {
        discountCents: Math.round(sum * (pct / 100)),
        freeShipping: false,
        reason: `BOGO ${buyQty}x${getQty} (${slots} unidades a -${pct}%)`,
      };
    }
    case 'bundle': {
      const req = coupon.config.required_product_ids ?? [];
      const bundlePrice = coupon.config.bundle_price_cents ?? 0;
      if (!req.length || !bundlePrice) {
        return { discountCents: 0, freeShipping: false, reason: 'Bundle mal configurado.' };
      }
      // Unidades de bundle = min qty entre productos requeridos.
      const counts = req.map((pid) =>
        lines.filter((l) => l.product_id === pid).reduce((s, l) => s + l.qty, 0),
      );
      const units = Math.min(...counts);
      if (units === 0) return { discountCents: 0, freeShipping: false, reason: 'Cart no contiene el bundle.' };

      // Precio normal por bundle-unit = suma de unit_price de cada producto requerido.
      const normalPerUnit = req.reduce((s, pid) => {
        const ln = lines.find((l) => l.product_id === pid);
        return s + (ln?.unit_price_cents ?? 0);
      }, 0);
      const discount = Math.max(0, (normalPerUnit - bundlePrice) * units);
      return {
        discountCents: discount,
        freeShipping: false,
        reason: `Bundle x${units} (precio fijo ${bundlePrice}c)`,
      };
    }
  }
}

/**
 * Resuelve todos los cupones en el cart con sus reglas de stacking.
 * - `requestedCodes` es la lista de cupones aplicados al cart (junction cart_coupons).
 */
export async function resolveCoupons(
  ctx: ApplyContext,
  requestedCodes: string[],
): Promise<CouponResolution> {
  if (!requestedCodes.length || ctx.lines.length === 0) {
    return { applied: [], rejected: [], totalDiscountCents: 0, freeShipping: false };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop')
    .from('coupons')
    .select(
      'code, name, description, kind, type, value, currency, min_subtotal_cents, max_uses, used, valid_from, valid_to, is_active, stackable, priority, conditions, config',
    )
    .in('code', requestedCodes);

  const rows = (data ?? []) as Array<CouponRow & { type: string }>;
  // Normaliza kind: si vino null usamos type como fallback (retro-compat).
  const coupons: CouponRow[] = rows.map((r) => ({
    ...r,
    kind: (r.kind ?? r.type) as CouponKind,
  }));

  const now = new Date();
  const rejected: Array<{ code: string; reason: string }> = [];
  const valid: CouponRow[] = [];

  for (const code of requestedCodes) {
    const c = coupons.find((x) => x.code === code);
    if (!c) {
      rejected.push({ code, reason: 'Cupón no existe.' });
      continue;
    }
    if (!c.is_active) {
      rejected.push({ code, reason: 'Cupón inactivo.' });
      continue;
    }
    if (c.valid_from && new Date(c.valid_from) > now) {
      rejected.push({ code, reason: 'Cupón aún no activo.' });
      continue;
    }
    if (c.valid_to && new Date(c.valid_to) < now) {
      rejected.push({ code, reason: 'Cupón expirado.' });
      continue;
    }
    if (c.max_uses && c.used >= c.max_uses) {
      rejected.push({ code, reason: 'Cupón agotado.' });
      continue;
    }
    if (c.currency && c.currency !== ctx.currency) {
      rejected.push({ code, reason: `Sólo válido en ${c.currency}.` });
      continue;
    }
    const userErr = await checkUserConstraints(c, ctx.userId);
    if (userErr) {
      rejected.push({ code, reason: userErr });
      continue;
    }
    valid.push(c);
  }

  // Precalcular descuentos por cupón (sin combinar).
  type Candidate = CouponRow & { _disc: number; _free: boolean; _reason: string };
  const candidates: Candidate[] = valid
    .map((c) => {
      const r = computeDiscount(c, ctx.lines);
      return { ...c, _disc: r.discountCents, _free: r.freeShipping, _reason: r.reason };
    })
    .filter((c) => c._disc > 0 || c._free);

  // Free shipping puede stackearse siempre con descuento (no conflicta sobre items).
  const freeShipCoupons = candidates.filter((c) => c.kind === 'free_shipping');
  const discountCoupons = candidates.filter((c) => c.kind !== 'free_shipping');

  // Stackables vs no-stackables.
  const stackables = discountCoupons.filter((c) => c.stackable);
  const exclusives = discountCoupons.filter((c) => !c.stackable);

  const applied: AppliedCoupon[] = [];

  // Elegir el mejor exclusivo (mayor descuento).
  let exclusiveBest: Candidate | null = null;
  if (exclusives.length) {
    exclusiveBest = exclusives.reduce((best, c) => (c._disc > best._disc ? c : best));
    applied.push({
      code: exclusiveBest.code,
      kind: exclusiveBest.kind,
      discountCents: exclusiveBest._disc,
      reason: exclusiveBest._reason,
    });
    // Los otros exclusivos van a rejected (se aplicó el mejor).
    for (const c of exclusives) {
      if (c.code !== exclusiveBest.code) {
        rejected.push({ code: c.code, reason: 'Otro cupón no-stackable aplica con mejor descuento.' });
      }
    }
  }

  // Stackables: aplicar en orden de prioridad ASC sobre subtotal restante.
  const sortedStack = stackables.sort((a, b) => a.priority - b.priority);
  let remainingSubtotal =
    subtotalOf(ctx.lines) - (exclusiveBest?._disc ?? 0);

  for (const c of sortedStack) {
    // Recalcular descuento sobre líneas — para % puro, escalamos por ratio remaining/original.
    // Más conservador: si el descuento original supera lo restante, capamos.
    const cap = Math.max(0, remainingSubtotal);
    const eff = Math.min(c._disc, cap);
    if (eff <= 0) {
      rejected.push({ code: c.code, reason: 'Sin descuento aplicable tras stacking.' });
      continue;
    }
    applied.push({ code: c.code, kind: c.kind, discountCents: eff, reason: c._reason });
    remainingSubtotal -= eff;
  }

  for (const fs of freeShipCoupons) {
    applied.push({ code: fs.code, kind: 'free_shipping', discountCents: 0, reason: fs._reason, freeShipping: true });
  }

  const totalDiscountCents = applied.reduce((s, a) => s + a.discountCents, 0);
  return {
    applied,
    rejected,
    totalDiscountCents,
    freeShipping: freeShipCoupons.length > 0,
  };
}
