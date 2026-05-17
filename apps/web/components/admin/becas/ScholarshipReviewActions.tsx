'use client';

import { useState, useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { reviewScholarshipAction } from '@/lib/scholarships/actions';

export function ScholarshipReviewActions({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState('');

  function act(decision: 'approve' | 'reject' | 'in_review') {
    if (decision === 'reject' && !notes.trim()) {
      if (!confirm('¿Rechazar sin nota? Recomendamos dejar un motivo.')) return;
    }
    startTransition(async () => {
      try {
        await reviewScholarshipAction({ applicationId, decision, notes: notes.trim() || undefined });
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
        placeholder="Nota (opcional, visible al alumno)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 rounded-xl border border-ink-950/15 bg-bone-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-moss-700/30"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act('in_review')}>
          En revisión
        </Button>
        <Button size="sm" variant="danger" disabled={pending} onClick={() => act('reject')}>
          Rechazar
        </Button>
        <Button size="sm" disabled={pending} onClick={() => act('approve')}>
          Aprobar + emitir cupón
        </Button>
      </div>
    </div>
  );
}
