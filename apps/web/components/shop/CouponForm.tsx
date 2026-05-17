'use client';

import { useState, useTransition } from 'react';
import { Button, Input, useToast } from '@arteytierra/ui';
import {
  applyCouponToCart,
  removeCouponFromCart,
} from '@/lib/coupons/actions';
import type { AppliedCoupon } from '@/lib/coupons/engine';

export function CouponForm({
  appliedCoupons,
  rejectedCoupons,
}: {
  appliedCoupons: AppliedCoupon[];
  rejectedCoupons: Array<{ code: string; reason: string }>;
}) {
  const [code, setCode] = useState('');
  const [pending, start] = useTransition();
  const { toast } = useToast();

  return (
    <div className="mt-6 space-y-2">
      {appliedCoupons.map((c) => (
        <div
          key={c.code}
          className="flex items-center gap-2 rounded-lg bg-moss-100 px-3 py-2 text-sm"
        >
          <span className="font-medium text-moss-900">{c.code}</span>
          <span className="text-moss-900/70 text-xs">{c.reason}</span>
          {c.discountCents > 0 && (
            <span className="ml-2 text-xs tabular-nums">
              -{(c.discountCents / 100).toFixed(2)}
            </span>
          )}
          {c.freeShipping && (
            <span className="ml-2 text-xs bg-leaf/15 text-leaf rounded px-1.5 py-0.5">
              envío gratis
            </span>
          )}
          <button
            onClick={() =>
              start(async () => {
                const res = await removeCouponFromCart(c.code);
                if (res.error) toast('error', res.error);
              })
            }
            className="ml-auto text-xs text-moss-900/70 hover:text-moss-900 underline"
            disabled={pending}
          >
            Quitar
          </button>
        </div>
      ))}

      {rejectedCoupons.map((r) => (
        <div
          key={r.code}
          className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900"
        >
          <span className="font-mono font-medium">{r.code}</span>
          <span className="text-amber-900/80">— {r.reason}</span>
        </div>
      ))}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!code.trim()) return;
          start(async () => {
            const res = await applyCouponToCart(code.trim());
            if (res.error) toast('error', res.error);
            else if (res.warning) toast('info', res.warning);
            else toast('success', 'Cupón aplicado');
            setCode('');
          });
        }}
      >
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Agregar otro cupón"
          className="uppercase"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? '…' : 'Aplicar'}
        </Button>
      </form>
    </div>
  );
}
