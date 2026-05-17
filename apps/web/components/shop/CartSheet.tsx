'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Sheet, Button, formatMoney } from '@arteytierra/ui';
import { useCartUI } from './CartProvider';
import { removeFromCart, updateCartItem } from '@/lib/commerce/actions';
import type { CartSummary } from '@/lib/commerce/cart';

export function CartSheet() {
  const { open, hide } = useCartUI();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    fetch('/api/cart').then((r) => r.json()).then(setCart);
  }, [open]);

  function refresh() {
    fetch('/api/cart').then((r) => r.json()).then(setCart);
  }

  return (
    <Sheet open={open} onClose={hide} title="Tu carrito" side="right">
      {!cart ? (
        <p className="text-sm text-ink-800/60">Cargando…</p>
      ) : cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-display text-2xl">Tu carrito está vacío</p>
          <p className="mt-2 text-ink-800/65">Descubrí cursos, ebooks y oficios.</p>
          <Link href="/cursos" onClick={hide}>
            <Button variant="moss" size="lg" className="mt-6">Ver cursos</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <ul className="flex-1 divide-y divide-ink-950/10 -mx-6">
            {cart.items.map((it) => (
              <li key={it.id} className="flex gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{it.product.name}</p>
                  <p className="text-xs text-ink-800/55 capitalize mt-0.5">{it.product.type}</p>
                  <p className="mt-2 font-medium">
                    {formatMoney(it.unit_price_cents * it.qty, cart.currency as never)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => start(async () => { await removeFromCart(it.id); refresh(); })}
                    className="text-ink-800/50 hover:text-danger-500"
                    aria-label="Quitar"
                  >
                    <Trash2 size={14} />
                  </button>

                  {(it.product.type === 'physical' || it.product.type === 'service') && (
                    <div className="flex items-center gap-1 rounded-full border border-ink-950/15">
                      <button
                        onClick={() => start(async () => { await updateCartItem(it.id, it.qty - 1); refresh(); })}
                        disabled={pending || it.qty <= 1}
                        className="p-1.5 hover:bg-bone-100 rounded-l-full"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-6 text-center">{it.qty}</span>
                      <button
                        onClick={() => start(async () => { await updateCartItem(it.id, it.qty + 1); refresh(); })}
                        disabled={pending}
                        className="p-1.5 hover:bg-bone-100 rounded-r-full"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-ink-950/10 -mx-6 px-6 pt-6 mt-auto space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-800/70">Subtotal</span>
              <span>{formatMoney(cart.subtotalCents, cart.currency as never)}</span>
            </div>
            {cart.discountCents > 0 && (
              <div className="flex justify-between text-moss-700">
                <span>Descuento {cart.couponCode && `(${cart.couponCode})`}</span>
                <span>−{formatMoney(cart.discountCents, cart.currency as never)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-xl pt-2">
              <span>Total</span>
              <span>{formatMoney(cart.totalCents, cart.currency as never)}</span>
            </div>

            <Link href="/checkout" onClick={hide}>
              <Button variant="moss" size="lg" className="w-full mt-4">
                Ir al checkout
              </Button>
            </Link>
            <Link href="/carrito" onClick={hide}>
              <Button variant="ghost" size="md" className="w-full">
                Ver carrito completo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}
