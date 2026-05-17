'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createReply } from '@/lib/edu/community';

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, action, pending] = useActionState(createReply, {} as { ok?: boolean; error?: string });
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="rounded-2xl border border-bone-100/15 bg-bone-100/5 p-5">
      <input type="hidden" name="threadId" value={threadId} />
      <textarea
        name="body"
        required
        placeholder="Sumá tu respuesta…"
        className="w-full bg-transparent text-sm focus:outline-none placeholder:text-bone-100/40 resize-none"
        rows={3}
      />
      <div className="mt-2 flex items-center justify-between">
        {state.error && <p className="text-xs text-danger-500">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-full bg-moss-700 text-bone-50 px-5 py-2 text-sm hover:bg-moss-900 disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Responder'}
        </button>
      </div>
    </form>
  );
}
