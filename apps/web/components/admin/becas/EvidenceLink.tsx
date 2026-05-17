'use client';

import { useState, useTransition } from 'react';
import { ExternalLink } from 'lucide-react';
import { getEvidenceUrlAction } from '@/lib/scholarships/server-actions';

export function EvidenceLink({ path }: { path: string }) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);

  function open() {
    if (url) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    startTransition(async () => {
      try {
        const u = await getEvidenceUrlAction(path);
        if (u) {
          setUrl(u);
          window.open(u, '_blank', 'noopener');
        } else {
          alert('No se pudo generar el enlace');
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={open}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-950/15 bg-bone-100 px-3 py-1 text-xs hover:bg-bone-50"
    >
      <ExternalLink size={12} /> Ver evidencia
    </button>
  );
}
