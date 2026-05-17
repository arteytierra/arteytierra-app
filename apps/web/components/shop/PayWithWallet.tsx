'use client';

import { useTransition } from 'react';
import { Wallet } from 'lucide-react';
import { formatMoney } from '@arteytierra/ui';
import { toggleCartUseWallet } from '@/lib/wallet';

/**
 * Switch para usar saldo de wallet en el checkout.
 * Se aplica como descuento (capped a min(balance, total)) en el server al pagarse.
 */
export function PayWithWallet({
  balanceCents,
  currency,
  enabled,
  applicableCents,
}: {
  balanceCents: number;
  currency: 'ARS' | 'USD';
  enabled: boolean;
  applicableCents: number;
}) {
  const [pending, startTransition] = useTransition();

  if (balanceCents <= 0) return null;

  return (
    <label className="flex items-start gap-3 rounded-2xl border border-ink-950/10 bg-bone-50 p-4 cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) => {
          const checked = e.target.checked;
          startTransition(async () => {
            await toggleCartUseWallet(checked);
          });
        }}
        className="mt-0.5 h-4 w-4 rounded border-ink-950/25 text-moss-700 focus:ring-moss-700/30"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-950 flex items-center gap-1.5">
          <Wallet size={14} /> Usar mi saldo
        </p>
        <p className="text-xs text-ink-800/65 mt-0.5">
          Saldo disponible: <strong>{formatMoney(balanceCents, currency)}</strong>.
          {enabled && applicableCents > 0
            ? ` Se aplicarán ${formatMoney(applicableCents, currency)} a esta compra.`
            : null}
        </p>
      </div>
    </label>
  );
}
