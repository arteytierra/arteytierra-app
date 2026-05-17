'use client';

import { useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { cancelLiveSessionAction } from '@/lib/live/actions';

export function CancelLiveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (!confirm('¿Cancelar esta sesión? Los inscriptos verán el cambio.')) return;
        startTransition(async () => {
          try {
            await cancelLiveSessionAction(id);
            window.location.reload();
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
          }
        });
      }}
    >
      Cancelar
    </Button>
  );
}
