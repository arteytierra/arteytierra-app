'use client';

import { useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { markAttributionPaid, reverseAttribution } from '@/lib/referrals';

export function AttributionActions({
  id,
  status,
}: {
  id: string;
  status: 'pending' | 'confirmed' | 'paid' | 'reversed';
}) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  if (status === 'paid' || status === 'reversed') {
    return <span className="text-xs text-ink-800/50">—</span>;
  }

  return (
    <div className="inline-flex gap-2">
      {status === 'confirmed' && (
        <Button size="sm" disabled={pending} onClick={() => run(() => markAttributionPaid(id))}>
          Liquidar
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (confirm('¿Revertir esta atribución?')) run(() => reverseAttribution(id));
        }}
      >
        Revertir
      </Button>
    </div>
  );
}
