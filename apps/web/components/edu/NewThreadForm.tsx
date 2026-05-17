'use client';

import { useActionState } from 'react';
import { createThread } from '@/lib/edu/community';

export function NewThreadForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState(createThread, {} as { ok?: boolean; error?: string });

  return (
    <form action={action} className="rounded-2xl border border-bone-100/15 bg-bone-100/5 p-5">
      <input type="hidden" name="courseId" value={courseId} />
      <input
        name="title"
        required
        placeholder="¿Sobre qué querés hablar?"
        className="w-full bg-transparent border-b border-bone-100/15 px-0 py-2 text-base focus:outline-none focus:border-moss-300 placeholder:text-bone-100/40"
      />
      <textarea
        name="body"
        placeholder="Opcional: contá un poco más…"
        className="mt-4 w-full bg-transparent text-sm focus:outline-none placeholder:text-bone-100/40 resize-none"
        rows={3}
      />
      <div className="mt-3 flex items-center justify-between">
        {state.error && <p className="text-xs text-danger-500">{state.error}</p>}
        {state.ok && <p className="text-xs text-moss-300">Publicado.</p>}
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-full bg-moss-700 text-bone-50 px-5 py-2 text-sm hover:bg-moss-900 disabled:opacity-50"
        >
          {pending ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}
