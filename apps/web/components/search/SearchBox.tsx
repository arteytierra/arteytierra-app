'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

export type Hit = {
  kind: 'product' | 'post' | 'course';
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
  thumb?: string | null;
  badge?: string | null;
};

export function SearchBox({
  initialQuery = '',
  autoFocus = false,
  variant = 'page',
  onPick,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  variant?: 'page' | 'palette';
  onPick?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const t = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
            signal: ctrl.signal,
          });
          if (!res.ok) return;
          const data = (await res.json()) as { hits: Hit[] };
          setHits(data.hits ?? []);
          setActive(0);
        } catch {
          /* abortado */
        }
      });
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  function go(hit: Hit) {
    onPick?.();
    router.push(hit.href);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[active]) go(hits[active]!);
      else if (q.trim().length >= 2) {
        onPick?.();
        router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      }
    }
  }

  const isPalette = variant === 'palette';

  return (
    <div className={isPalette ? '' : 'space-y-4'}>
      <div
        className={
          'flex items-center gap-3 border border-ink-950/10 bg-bone-50 ' +
          (isPalette ? 'px-4 py-3' : 'rounded-2xl px-4 py-3 shadow-soft')
        }
      >
        <Search size={18} className="text-ink-800/60 shrink-0" />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Buscar cursos, ebooks, hospedaje, posts…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-800/40"
          aria-label="Buscar"
        />
        {pending ? (
          <Loader2 size={14} className="animate-spin text-ink-800/50" />
        ) : (
          <kbd className="hidden sm:inline text-[10px] text-ink-800/50 rounded bg-bone-100 px-1.5 py-0.5 border border-ink-950/10">
            Enter
          </kbd>
        )}
      </div>

      {q.trim().length >= 2 && (
        <ul
          className={
            'overflow-hidden ' +
            (isPalette
              ? 'max-h-96 overflow-y-auto border-t border-ink-950/10'
              : 'rounded-2xl border border-ink-950/10 bg-bone-50 divide-y divide-ink-950/5')
          }
        >
          {hits.length === 0 && !pending ? (
            <li className="px-4 py-6 text-sm text-ink-800/60">
              Sin resultados para “{q}”.
            </li>
          ) : (
            hits.map((hit, i) => (
              <li key={`${hit.kind}-${hit.id}`}>
                <Link
                  href={hit.href}
                  onClick={() => onPick?.()}
                  onMouseEnter={() => setActive(i)}
                  className={
                    'flex items-center gap-3 px-4 py-3 transition-colors ' +
                    (i === active ? 'bg-bone-100' : 'hover:bg-bone-100/60')
                  }
                >
                  {hit.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hit.thumb}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-ink-950/5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-moss-100/60 border border-ink-950/5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-950 truncate">{hit.title}</p>
                    {hit.subtitle ? (
                      <p className="text-xs text-ink-800/60 truncate">{hit.subtitle}</p>
                    ) : null}
                  </div>
                  {hit.badge ? (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-ink-800/60 bg-bone-100 px-2 py-0.5 rounded-full border border-ink-950/10">
                      {hit.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
