'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Loader2,
  ArrowRight,
  Clock,
  GraduationCap,
  FileText,
  Package,
  MessageSquare,
  Command as CmdIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type SearchKind = 'course' | 'product' | 'post' | 'thread';

interface Hit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
  thumb?: string | null;
  badge?: string | null;
}

interface Groups {
  course: Hit[];
  product: Hit[];
  post: Hit[];
  thread: Hit[];
}

const KIND_META: Record<SearchKind, { label: string; Icon: typeof Search }> = {
  course: { label: 'Cursos', Icon: GraduationCap },
  product: { label: 'Productos', Icon: Package },
  post: { label: 'Blog', Icon: FileText },
  thread: { label: 'Foros', Icon: MessageSquare },
};

const SHORTCUTS: Array<{ label: string; href: string; group: 'nav' }> = [
  { label: 'Mis cursos', href: '/mis-cursos', group: 'nav' },
  { label: 'Mis reservas', href: '/mis-reservas', group: 'nav' },
  { label: 'Mis pedidos', href: '/mis-pedidos', group: 'nav' },
  { label: 'Mi saldo', href: '/mi-saldo', group: 'nav' },
  { label: 'Certificados', href: '/certificados', group: 'nav' },
  { label: 'Notificaciones', href: '/mi-cuenta/notificaciones', group: 'nav' },
  { label: 'Preferencias de email', href: '/preferencias/email', group: 'nav' },
];

const RECENTS_KEY = 'ay:search:recents';
const MAX_RECENTS = 6;

function readRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  if (typeof window === 'undefined') return;
  const t = term.trim();
  if (t.length < 2) return;
  try {
    const prev = readRecents().filter((r) => r.toLowerCase() !== t.toLowerCase());
    const next = [t, ...prev].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch { /* no-op */ }
}

export function CommandK() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState<Groups>({ course: [], product: [], post: [], thread: [] });
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Atajo global Cmd/Ctrl+K + evento custom desde SearchTrigger
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('ay:open-search', onOpen as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('ay:open-search', onOpen as EventListener);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setRecents(readRecents());
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQ('');
      setActive(0);
      setGroups({ course: [], product: [], post: [], thread: [] });
    }
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setGroups({ course: [], product: [], post: [], thread: [] });
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?grouped=1&q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
          credentials: 'include',
        });
        if (res.ok) {
          const data = (await res.json()) as { groups: Groups };
          setGroups(data.groups);
          setActive(0);
        }
      } catch { /* abort */ } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Flatten hits in display order for keyboard navigation
  const flat = useMemo<Hit[]>(() => {
    const order: SearchKind[] = ['course', 'product', 'post', 'thread'];
    const out: Hit[] = [];
    for (const k of order) for (const h of groups[k]) out.push(h);
    return out;
  }, [groups]);

  const showEmpty = q.trim().length >= 2 && !loading && flat.length === 0;
  const showRecents = q.trim().length < 2 && recents.length > 0;

  const onPick = useCallback((href: string, term?: string) => {
    if (term) pushRecent(term);
    setOpen(false);
    router.push(href);
  }, [router]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, flat.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flat[active];
      if (hit) onPick(hit.href, q);
      else if (q.trim().length >= 2) onPick(`/buscar?q=${encodeURIComponent(q.trim())}`, q);
    }
  }

  let flatIdx = 0;
  const order: SearchKind[] = ['course', 'product', 'post', 'thread'];

  return (
    <AnimatePresence>
    {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 backdrop-blur-sm pt-24 px-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Buscar"
    >
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-xl bg-bone shadow-2xl ring-1 ring-ink/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink/10">
          <Search className="h-5 w-5 text-mute" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Buscar cursos, posts, productos, foros…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-mute"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-ink/15 bg-ink/5 px-1.5 py-0.5 text-[11px] text-mute">
            esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {showRecents && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-mute">
                Búsquedas recientes
              </div>
              {recents.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setQ(r)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-ink/5"
                >
                  <Clock className="h-4 w-4 text-mute" />
                  <span className="flex-1">{r}</span>
                </button>
              ))}
            </div>
          )}

          {q.trim().length < 2 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-mute">
                Ir a
              </div>
              {SHORTCUTS.map((s) => (
                <button
                  key={s.href}
                  type="button"
                  onClick={() => onPick(s.href)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-ink/5"
                >
                  <ArrowRight className="h-4 w-4 text-mute" />
                  <span className="flex-1">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="px-4 py-12 text-center text-sm text-mute">
              Sin resultados para "{q}"
            </div>
          )}

          {q.trim().length >= 2 && flat.length > 0 && (
            <div>
              {order.map((k) => {
                if (groups[k].length === 0) return null;
                const { label, Icon } = KIND_META[k];
                return (
                  <div key={k} className="py-1.5">
                    <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-mute flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    {groups[k].map((hit) => {
                      const isActive = flatIdx === active;
                      const myIdx = flatIdx;
                      flatIdx++;
                      return (
                        <button
                          key={`${k}-${hit.id}`}
                          type="button"
                          onMouseEnter={() => setActive(myIdx)}
                          onClick={() => onPick(hit.href, q)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
                            isActive ? 'bg-leaf/10' : 'hover:bg-ink/5'
                          }`}
                        >
                          {hit.thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={hit.thumb} alt="" className="h-10 w-10 rounded-md object-cover flex-none" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-ink/5 flex-none flex items-center justify-center">
                              <Icon className="h-4 w-4 text-mute" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink truncate">{hit.title}</div>
                            {hit.subtitle && (
                              <div className="text-xs text-mute truncate">{hit.subtitle}</div>
                            )}
                          </div>
                          {hit.badge && (
                            <span className="text-[10px] uppercase tracking-wider text-mute bg-ink/5 rounded px-1.5 py-0.5">
                              {hit.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 px-4 py-2 text-[11px] text-mute">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-ink/5 rounded px-1">↑↓</kbd> navegar</span>
            <span><kbd className="bg-ink/5 rounded px-1">↵</kbd> ir</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <CmdIcon className="h-3 w-3" /> K
          </div>
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
