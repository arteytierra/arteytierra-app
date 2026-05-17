'use client';

import { useState, useTransition } from 'react';
import { Gift, X } from 'lucide-react';
import { Button, Input } from '@arteytierra/ui';
import { applyGiftCardToCart, removeGiftCardFromCart } from '@/lib/gift-cards';

/**
 * Campo para canjear gift card en /carrito o /checkout.
 * El descuento real se aplica en fulfillment al pagarse la orden.
 */
export function GiftCardField({ applied }: { applied: string | null }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await applyGiftCardToCart(code);
        if (!res.ok) {
          setError(
            res.reason === 'expired'
              ? 'La tarjeta venció.'
              : res.reason === 'inactive'
                ? 'Tarjeta inactiva.'
                : res.reason === 'empty'
                  ? 'La tarjeta no tiene saldo.'
                  : res.reason === 'login_required'
                    ? 'Iniciá sesión para canjear.'
                    : 'No encontramos esa tarjeta.',
          );
          return;
        }
        setCode('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  if (applied) {
    return (
      <div className="rounded-2xl border border-moss-700/30 bg-moss-100/40 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-moss-800" />
          <span className="text-sm">
            Gift card <strong className="font-mono">{applied}</strong> aplicada
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await removeGiftCardFromCart();
            })
          }
          disabled={pending}
          aria-label="Quitar gift card"
          className="rounded-full p-1.5 hover:bg-moss-100"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onApply} className="space-y-2">
      <label className="text-xs uppercase tracking-[0.12em] text-ink-800/60 flex items-center gap-1.5">
        <Gift size={12} /> ¿Tenés gift card?
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CÓDIGO DE LA TARJETA"
          maxLength={20}
          className="font-mono"
        />
        <Button type="submit" disabled={pending || code.length < 12} variant="outline">
          {pending ? '…' : 'Aplicar'}
        </Button>
      </div>
      {error ? <p className="text-xs text-clay-700">{error}</p> : null}
    </form>
  );
}
