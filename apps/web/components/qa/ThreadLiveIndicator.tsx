'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio } from 'lucide-react';
import { useThreadLive } from '@/lib/realtime/useThreadLive';

/**
 * Indicador "en vivo" para un hilo Q&A.
 * Cuando llegan nuevas respuestas remotas, muestra un banner con CTA
 * para refrescar la página y verlas. No re-renderiza el server tree solo.
 */
export function ThreadLiveIndicator({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(0);

  useThreadLive(threadId, (c) => {
    if (c.type === 'INSERT') setPending((n) => n + 1);
    if (c.type === 'UPDATE' && c.reply.is_accepted) router.refresh();
  });

  if (pending === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-mute">
        <Radio className="h-3.5 w-3.5 text-leaf animate-pulse" />
        En vivo
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setPending(0);
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full bg-leaf px-3 py-1 text-xs font-medium text-bone"
    >
      <Radio className="h-3.5 w-3.5 animate-pulse" />
      {pending} {pending === 1 ? 'nueva respuesta' : 'nuevas respuestas'} · ver
    </button>
  );
}
