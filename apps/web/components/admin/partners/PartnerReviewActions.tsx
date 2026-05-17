'use client';

import { useState, useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { reviewPartnerAction } from '@/lib/partners/actions';

export function PartnerReviewActions({ partnerId }: { partnerId: string }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState('');

  function act(decision: 'approve' | 'reject' | 'pause' | 'ban') {
    startTransition(async () => {
      try {
        await reviewPartnerAction({ partnerId, decision, notes: notes.trim() || undefined });
        setNotes('');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
      <input
        type="text"
        placeholder="Nota interna"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 rounded-xl border border-ink-950/15 bg-bone-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-moss-700/30"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act('pause')}>Pausar</Button>
        <Button size="sm" variant="danger" disabled={pending} onClick={() => act('reject')}>Rechazar</Button>
        <Button size="sm" disabled={pending} onClick={() => act('approve')}>Aprobar</Button>
      </div>
    </div>
  );
}
