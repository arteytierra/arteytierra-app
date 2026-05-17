'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Sprout } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

/**
 * Popup inteligente. Triggers (cualquiera de):
 *   - Scroll > 60% del documento
 *   - 20s en página
 *   - exit-intent en desktop (mouse sale por arriba)
 *
 * Se silencia 30 días si se cierra; 90 días si se completa el form.
 * No se muestra en rutas /admin, /checkout, /auth, /carrito, /orden, /newsletter.
 */

const DISMISS_KEY = 'ay-newsletter-dismissed';
const SUBSCRIBED_KEY = 'ay-newsletter-subscribed';
const BLOCKED_PATHS = ['/admin', '/checkout', '/auth', '/carrito', '/orden', '/newsletter', '/player'];

function shouldSuppress(): boolean {
  if (typeof window === 'undefined') return true;
  const path = window.location.pathname;
  if (BLOCKED_PATHS.some((p) => path.startsWith(p))) return true;

  const subscribed = readUntil(SUBSCRIBED_KEY);
  if (subscribed && Date.now() < subscribed) return true;

  const dismissed = readUntil(DISMISS_KEY);
  if (dismissed && Date.now() < dismissed) return true;

  return false;
}

function readUntil(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeUntil(key: string, days: number) {
  try {
    localStorage.setItem(key, String(Date.now() + days * 24 * 60 * 60 * 1000));
  } catch {
    /* noop */
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);

  // Arming: esperamos un tick para evaluar suppress en cliente y registrar triggers.
  useEffect(() => {
    if (shouldSuppress()) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed || open) return;

    let openedBy: string | null = null;
    const trigger = (reason: string) => {
      if (openedBy) return;
      openedBy = reason;
      setOpen(true);
    };

    // Time trigger — 20s
    const timeId = window.setTimeout(() => trigger('time'), 20_000);

    // Scroll trigger — 60%
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (pct > 0.6) trigger('scroll');
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Exit-intent (desktop)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger('exit');
    };
    if (window.matchMedia('(min-width: 768px)').matches) {
      document.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      window.clearTimeout(timeId);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [armed, open]);

  const close = useCallback(() => {
    setOpen(false);
    writeUntil(DISMISS_KEY, 30);
  }, []);

  const onSuccess = useCallback(() => {
    writeUntil(SUBSCRIBED_KEY, 90);
    window.setTimeout(() => setOpen(false), 3000);
  }, []);

  // Cierre con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="newsletter-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-bone-50 shadow-float border border-ink-950/10 overflow-hidden animate-fade-up">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 rounded-full p-1.5 text-ink-800/60 hover:text-ink-950 hover:bg-bone-100"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-7 pb-5 border-b border-ink-950/5">
          <div className="flex items-center gap-2 text-moss-700 text-xs uppercase tracking-[0.12em] mb-2">
            <Sprout size={14} /> Newsletter Arte y Tierra
          </div>
          <h2 id="newsletter-title" className="font-display text-2xl text-ink-950">
            Sumate a la comunidad regenerativa
          </h2>
          <p className="text-sm text-ink-800/70 mt-1.5">
            Cursos, técnicas de diseño hidrológico, recetas de biocosmética y novedades
            de nuestras inmersiones — directo a tu inbox.
          </p>
        </div>

        <div className="px-6 py-5">
          <NewsletterForm source="popup" onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
