'use client';

import { useTransition } from 'react';
import { Button } from '@arteytierra/ui';
import { moderateReportAction } from '@/lib/qa/actions';

export function ReportActions({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();

  function act(decision: 'dismiss' | 'hide' | 'delete') {
    if (decision !== 'dismiss' && !confirm(decision === 'delete' ? '¿Eliminar definitivamente?' : '¿Ocultar este contenido?')) return;
    startTransition(async () => {
      try {
        await moderateReportAction({ reportId, decision });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act('dismiss')}>
        Desestimar
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act('hide')}>
        Ocultar
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => act('delete')}>
        Eliminar
      </Button>
    </div>
  );
}
