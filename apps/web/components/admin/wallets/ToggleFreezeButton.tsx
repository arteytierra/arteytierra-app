'use client';

import { useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { setWalletFrozen } from '@/lib/wallet';

export function ToggleFreezeButton({ id, frozen }: { id: string; frozen: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await setWalletFrozen(id, !frozen);
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
          }
        });
      }}
    >
      {frozen ? 'Descongelar' : 'Congelar'}
    </Button>
  );
}
