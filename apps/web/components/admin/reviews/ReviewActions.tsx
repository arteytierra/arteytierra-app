'use client';

import { useTransition } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { moderateReview, deleteReview } from '@/lib/reviews';

export function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
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

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {status !== 'approved' && (
        <Button size="sm" onClick={() => run(() => moderateReview(id, 'approved'))} disabled={pending}>
          <Check size={14} /> Aprobar
        </Button>
      )}
      {status !== 'rejected' && (
        <Button variant="outline" size="sm" onClick={() => run(() => moderateReview(id, 'rejected'))} disabled={pending}>
          <X size={14} /> Rechazar
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          if (confirm('¿Eliminar esta reseña?')) run(() => deleteReview(id));
        }}
        disabled={pending}
      >
        <Trash2 size={14} /> Eliminar
      </Button>
    </div>
  );
}
