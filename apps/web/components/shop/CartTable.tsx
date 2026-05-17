'use client';

import { useTransition } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatMoney } from '@arteytierra/ui';
import type { CartSummary } from '@/lib/commerce/cart';
import { removeFromCart, updateCartItem } from '@/lib/commerce/actions';

export function CartTable({ cart }: { cart: CartSummary }) {
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
      <table className="w-full">
        <thead className="bg-bone-100 text-xs uppercase tracking-[0.12em] text-ink-800/65">
          <tr>
            <th className="text-left px-5 py-3">Producto</th>
            <th className="text-left px-5 py-3 hidden sm:table-cell">Cantidad</th>
            <th className="text-right px-5 py-3">Total</th>
            <th className="px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((it) => {
            const editable = it.product.type === 'physical' || it.product.type === 'service';
            return (
              <tr key={it.id} className="border-t border-ink-950/5">
                <td className="px-5 py-4">
                  <p className="font-medium">{it.product.name}</p>
                  <p className="text-xs text-ink-800/55 capitalize mt-1">{it.product.type}</p>
                </td>
                <td className="px-5 py-4 hidden sm:table-cell">
                  {editable ? (
                    <div className="inline-flex items-center gap-1 rounded-full border border-ink-950/15">
                      <button
                        disabled={pending || it.qty <= 1}
                        onClick={() => start(() => updateCartItem(it.id, it.qty - 1))}
                        className="p-2 hover:bg-bone-100 rounded-l-full disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-8 text-center">{it.qty}</span>
                      <button
                        disabled={pending}
                        onClick={() => start(() => updateCartItem(it.id, it.qty + 1))}
                        className="p-2 hover:bg-bone-100 rounded-r-full"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-ink-800/65">×{it.qty}</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-medium">
                  {formatMoney(it.unit_price_cents * it.qty, cart.currency as never)}
                </td>
                <td className="pr-4 py-4 text-right">
                  <button
                    disabled={pending}
                    onClick={() => start(() => removeFromCart(it.id))}
                    className="p-2 text-ink-800/50 hover:text-danger-500"
                    aria-label="Quitar"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
