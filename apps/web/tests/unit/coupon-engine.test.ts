/**
 * Tests del motor de cupones — pura matemática, sin DB.
 * Mockeamos createSupabaseAdminClient para devolver coupons inline.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

// Mock dinámico — cada test setea las filas con `currentCoupons`.
let currentCoupons: unknown[] = [];

vi.mock('@/lib/db/admin', () => ({
  createSupabaseAdminClient: () => ({
    // .schema('shop').from('orders') / .schema('shop').from('coupon_redemptions') → para checkUserConstraints
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ count: 0, error: null }),
          count: 0,
          error: null,
        }),
      }),
    }),
    schema: (_s: string) => ({
      from: () => ({
        select: () => ({
          in: () => ({ data: currentCoupons, error: null }),
        }),
      }),
    }),
  }),
}));

import { resolveCoupons } from '@/lib/coupons/engine';

const baseLines = [
  { cart_item_id: 'a', product_id: 'p1', product_type: 'course', qty: 1, unit_price_cents: 50_000 },
  { cart_item_id: 'b', product_id: 'p2', product_type: 'ebook',  qty: 2, unit_price_cents: 10_000 },
];
const ctx = { userId: null, cartId: 'cart-1', lines: baseLines, currency: 'ARS' };

function couponRow(overrides: Record<string, unknown>) {
  return {
    code: 'X',
    kind: 'percent',
    type: 'percent',
    value: 10,
    is_active: true,
    stackable: false,
    priority: 100,
    conditions: {},
    config: {},
    max_uses: null,
    used: 0,
    valid_from: null,
    valid_to: null,
    min_subtotal_cents: null,
    currency: null,
    ...overrides,
  };
}

describe('coupon engine', () => {
  beforeEach(() => {
    currentCoupons = [];
  });

  it('percent: 10% sobre subtotal elegible', async () => {
    currentCoupons = [couponRow({ code: 'DESC10', value: 10 })];
    const r = await resolveCoupons(ctx, ['DESC10']);
    expect(r.totalDiscountCents).toBe(7_000); // 70_000 * 0.1
    expect(r.applied).toHaveLength(1);
  });

  it('fixed: capa al subtotal elegible', async () => {
    currentCoupons = [couponRow({ code: 'BIG', kind: 'fixed', type: 'fixed', value: 999_999_999 })];
    const r = await resolveCoupons(ctx, ['BIG']);
    expect(r.totalDiscountCents).toBe(70_000);
  });

  it('no-stackable: elige el mejor', async () => {
    currentCoupons = [
      couponRow({ code: 'A', value: 5 }),
      couponRow({ code: 'B', value: 20 }),
    ];
    const r = await resolveCoupons(ctx, ['A', 'B']);
    expect(r.applied[0]?.code).toBe('B');
    expect(r.rejected.find((x) => x.code === 'A')).toBeTruthy();
  });

  it('expirado: rechaza', async () => {
    currentCoupons = [couponRow({ code: 'OLD', valid_to: '2020-01-01T00:00:00Z' })];
    const r = await resolveCoupons(ctx, ['OLD']);
    expect(r.totalDiscountCents).toBe(0);
    expect(r.rejected[0]?.reason).toMatch(/expir/i);
  });

  it('moneda distinta: rechaza', async () => {
    currentCoupons = [couponRow({ code: 'USD', currency: 'USD' })];
    const r = await resolveCoupons(ctx, ['USD']);
    expect(r.totalDiscountCents).toBe(0);
  });

  it('stacking: dos stackables se suman por priority', async () => {
    currentCoupons = [
      couponRow({ code: 'S1', value: 10, stackable: true, priority: 1 }),
      couponRow({ code: 'S2', value: 10, stackable: true, priority: 2 }),
    ];
    const r = await resolveCoupons(ctx, ['S1', 'S2']);
    expect(r.applied).toHaveLength(2);
    expect(r.totalDiscountCents).toBeGreaterThan(0);
  });

  it('free_shipping: marca flag', async () => {
    currentCoupons = [couponRow({ code: 'SHIP', kind: 'free_shipping', value: 0 })];
    const r = await resolveCoupons(ctx, ['SHIP']);
    expect(r.freeShipping).toBe(true);
  });
});
