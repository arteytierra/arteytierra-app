'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface Item { label: string; href: string }

export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: Item[];
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => it.label.toLowerCase().includes(term));
  }, [items, q]);

  // ⌘K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open ? onClose() : window.dispatchEvent(new CustomEvent('open-palette'));
      }
      if (open && e.key === 'Escape') onClose();
      if (open && e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      }
      if (open && e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (open && e.key === 'Enter' && filtered[active]) {
        router.push(filtered[active]!.href);
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, filtered, active, router]);

  useEffect(() => {
    if (!open) {
      setQ('');
      setActive(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-bone-50 shadow-float border border-ink-950/10 overflow-hidden animate-fade-up">
        <div className="flex items-center gap-3 border-b border-ink-950/10 px-4 py-3">
          <Search size={16} className="text-ink-800/60" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            placeholder="Buscar páginas, productos, alumnos…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] text-ink-800/50 rounded bg-bone-100 px-1.5 py-0.5">ESC</kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-800/60">Sin resultados.</li>
          ) : (
            filtered.map((it, i) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  className={
                    'flex items-center justify-between px-4 py-2.5 text-sm ' +
                    (i === active ? 'bg-bone-100 text-ink-950' : 'text-ink-800')
                  }
                >
                  <span>{it.label}</span>
                  <span className="text-xs text-ink-800/40">{it.href}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
