'use client';

import { useTransition } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { markLessonComplete } from '@/lib/edu/actions';

export function MarkCompleteButton({
  lessonId,
  initiallyCompleted,
}: {
  lessonId: string;
  initiallyCompleted: boolean;
}) {
  const [pending, start] = useTransition();

  if (initiallyCompleted) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-moss-300">
        <CheckCircle2 size={14} /> Marcaste como vista
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => markLessonComplete(lessonId).then(() => location.reload()))}
      className="inline-flex items-center gap-2 rounded-full border border-bone-100/20 px-5 py-2.5 text-sm hover:bg-bone-100/10 disabled:opacity-50"
    >
      <Check size={14} /> {pending ? 'Guardando…' : 'Marcar como vista'}
    </button>
  );
}
