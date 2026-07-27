'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/lib/notifications/actions';
import { useNotificationsLive } from '@/lib/realtime/useNotificationsLive';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

interface NotifItem {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

const KIND_LABELS: Record<string, string> = {
  qa_reply: 'Foro',
  qa_accepted: 'Foro',
  qa_mention: 'Foro',
  order_paid: 'Compra',
  enrollment_created: 'Curso',
  lesson_published: 'Curso',
  reservation_confirmed: 'Reserva',
  reservation_reminder: 'Reserva',
  certificate_issued: 'Certificado',
  scholarship_decision: 'Beca',
  partner_decision: 'Partner',
  commission_confirmed: 'Comisión',
  broadcast: 'Aviso',
};

export function NotificationBell({ userId: userIdProp }: { userId?: string | null } = {}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [userId, setUserId] = useState<string | null>(userIdProp ?? null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Resolver userId desde sesión browser si no vino por prop
  useEffect(() => {
    if (userIdProp) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [userIdProp]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=20', { credentials: 'include' });
      if (res.ok) {
        const json = (await res.json()) as { items: NotifItem[]; unread: number };
        setItems(json.items ?? []);
        setUnread(json.unread ?? 0);
      } else if (res.status === 401) {
        setItems([]);
        setUnread(0);
      }
    } finally {
      setLoading(false);
    }
  }

  // Poll cada 60s como fallback; realtime hace el push instantáneo.
  // Solo si hay sesión: un visitante anónimo no tiene notificaciones, así que
  // no consultamos /api/notifications (ahorra invocaciones/CPU en Vercel).
  useEffect(() => {
    if (!userId) return;
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [userId]);

  // Realtime: nuevas notificaciones llegan vía Supabase Realtime
  useNotificationsLive(userId, (n) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === n.id)) return prev;
      return [
        {
          id: n.id,
          kind: n.kind,
          title: n.title,
          body: n.body,
          url: n.url,
          read_at: n.read_at,
          created_at: n.created_at,
        },
        ...prev,
      ].slice(0, 30);
    });
    if (!n.read_at) setUnread((u) => u + 1);

    // Toast nativo del navegador si el panel está cerrado y hay permiso
    if (!open && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(n.title, { body: n.body ?? undefined, tag: n.kind });
        }
      } catch { /* no-op */ }
    }
  });

  useEffect(() => {
    if (open && userId) load();
  }, [open, userId]);

  // Cerrar al click afuera
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  function onItemClick(item: NotifItem) {
    if (!item.read_at) {
      startTransition(() => {
        markNotificationReadAction(item.id).catch(() => {});
      });
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, read_at: new Date().toISOString() } : p)));
      setUnread((u) => Math.max(0, u - 1));
    }
    if (item.url) {
      window.location.href = item.url;
    }
  }

  function onMarkAll() {
    startTransition(() => {
      markAllNotificationsReadAction().catch(() => {});
    });
    setItems((prev) => prev.map((p) => ({ ...p, read_at: p.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5 text-ink" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-leaf px-1 text-[10px] font-bold text-bone tabular-nums"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 z-50 mt-2 w-[360px] max-h-[480px] overflow-auto rounded-lg border border-ink/10 bg-bone shadow-xl origin-top-right">
          <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-bone px-4 py-2.5">
            <div className="font-medium text-ink">Notificaciones</div>
            {unread > 0 && (
              <button
                onClick={onMarkAll}
                className="inline-flex items-center gap-1 text-xs text-mute hover:text-ink"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div className="p-6 text-center text-sm text-mute">Cargando…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-mute">Todo al día 🌱</div>
          ) : (
            <ul>
              {items.map((it) => (
                <li
                  key={it.id}
                  onClick={() => onItemClick(it)}
                  className={`cursor-pointer border-b border-ink/5 px-4 py-3 hover:bg-ink/[0.03] ${
                    it.read_at ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!it.read_at && <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-leaf" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-mute">
                        {KIND_LABELS[it.kind] ?? it.kind}
                      </div>
                      <div className="font-medium text-ink leading-tight">{it.title}</div>
                      {it.body && <div className="text-sm text-mute mt-0.5 line-clamp-2">{it.body}</div>}
                      <div className="text-[11px] text-mute mt-1">
                        {new Date(it.created_at).toLocaleString('es-AR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                    {it.read_at && <Check className="mt-1 h-3.5 w-3.5 text-mute" />}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="sticky bottom-0 border-t border-ink/10 bg-bone px-4 py-2 text-center">
            <a href="/mi-cuenta/notificaciones" className="text-xs text-mute hover:text-ink">
              Ver todas
            </a>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
