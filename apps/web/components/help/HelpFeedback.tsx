'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { submitHelpFeedbackAction } from '@/lib/help/actions';

export function HelpFeedback({ articleId }: { articleId: string }) {
  const [done, setDone] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [pending, start] = useTransition();
  const [showComment, setShowComment] = useState(false);

  function submit(helpful: boolean) {
    start(async () => {
      await submitHelpFeedbackAction({ articleId, helpful, comment: comment || undefined });
      setDone(helpful);
      if (!helpful) setShowComment(true);
    });
  }

  if (done !== null && !showComment) {
    return (
      <div className="mt-12 rounded-xl bg-leaf/10 text-leaf p-4 text-sm flex items-center gap-2">
        <Check size={16} /> Gracias por tu feedback.
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-xl border border-ink-950/10 bg-bone-50 p-5">
      <h3 className="font-medium text-ink-950">¿Te resultó útil este artículo?</h3>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => submit(true)}
          disabled={pending || done !== null}
          className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm hover:bg-bone-100 disabled:opacity-50"
        >
          <ThumbsUp size={14} /> Sí
        </button>
        <button
          onClick={() => submit(false)}
          disabled={pending || done !== null}
          className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm hover:bg-bone-100 disabled:opacity-50"
        >
          <ThumbsDown size={14} /> No
        </button>
      </div>

      {showComment && (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              if (comment.trim()) {
                await submitHelpFeedbackAction({ articleId, helpful: false, comment });
              }
              setShowComment(false);
            });
          }}
        >
          <label className="block text-sm text-mute">¿Qué te faltó? (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-ink-950/15 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-ink-950 text-bone-50 px-4 py-1.5 text-sm hover:bg-moss-700 disabled:opacity-50"
          >
            {pending ? '…' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  );
}
