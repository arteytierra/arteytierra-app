'use client';

import { useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { toggleGiftCardActive, resendGiftCardEmail } from '@/lib/gift-cards';

export function GiftCardActions({ id, isActive }: { id: string; isActive: boolean }) {
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

  return (
    <div className="inline-flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => resendGiftCardEmail(id))}
      >
        Reenviar
      </Button>
      <Button
        size="sm"
        variant={isActive ? 'outline' : 'primary'}
        disabled={pending}
        onClick={() => run(() => toggleGiftCardActive(id, !isActive))}
      >
        {isActive ? 'Desactivar' : 'Reactivar'}
      </Button>
    </div>
  );
}
