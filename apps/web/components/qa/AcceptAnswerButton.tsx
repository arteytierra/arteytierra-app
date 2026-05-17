'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { acceptReplyAction } from '@/lib/qa/actions';

export function AcceptAnswerButton(props: {
  replyId: string;
  threadId: string;
  courseSlug: string;
  alreadyAccepted: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending || props.alreadyAccepted}
      onClick={() => {
        if (!confirm('¿Marcar como respuesta aceptada?')) return;
        startTransition(async () => {
          try {
            await acceptReplyAction({
              replyId: props.replyId,
              threadId: props.threadId,
              courseSlug: props.courseSlug,
            });
            router.refresh();
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
          }
        });
      }}
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ' +
        (props.alreadyAccepted
          ? 'border-moss-700 bg-moss-700 text-bone-50 cursor-default'
          : 'border-ink-950/15 text-ink-800 hover:bg-moss-700 hover:text-bone-50 hover:border-moss-700')
      }
    >
      <Check size={12} />
      {props.alreadyAccepted ? 'Aceptada' : 'Aceptar respuesta'}
    </button>
  );
}
