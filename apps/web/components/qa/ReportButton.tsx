'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { reportAction } from '@/lib/qa/actions';

export function ReportButton(props: {
  target: 'thread' | 'reply';
  threadId?: string;
  replyId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onClick() {
    if (done) return;
    const reason = prompt('Motivo del reporte (mínimo 3 caracteres):');
    if (!reason || reason.trim().length < 3) return;
    startTransition(async () => {
      try {
        await reportAction({
          target: props.target,
          threadId: props.threadId,
          replyId: props.replyId,
          reason: reason.trim(),
        });
        setDone(true);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || done}
      className="inline-flex items-center gap-1 text-xs text-ink-800/60 hover:text-clay-700 disabled:opacity-60"
      title="Reportar"
    >
      <Flag size={12} />
      {done ? 'Reportado' : 'Reportar'}
    </button>
  );
}
