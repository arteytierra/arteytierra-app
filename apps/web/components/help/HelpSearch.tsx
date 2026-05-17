'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';

export function HelpSearch({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(defaultQuery);
  const [, start] = useTransition();

  // Debounce 240ms.
  useEffect(() => {
    const t = setTimeout(() => {
      const url = q.trim()
        ? `/ayuda?q=${encodeURIComponent(q.trim())}`
        : '/ayuda';
      start(() => router.replace(url));
    }, 240);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    // sync con URL externa (back/forward)
    setQ(sp.get('q') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  return (
    <div className="relative mt-6">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mute" />
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="¿Cómo descargo mi certificado? ¿Cómo cancelo una reserva?"
        className="w-full rounded-full border border-ink-950/15 bg-bone-50 pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-moss-700/40"
      />
      {q && (
        <button
          onClick={() => setQ('')}
          aria-label="Limpiar"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-ink-950"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
