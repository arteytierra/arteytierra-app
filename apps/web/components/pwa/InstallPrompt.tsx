'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ay:pwa-install-dismissed';
const DISMISS_DAYS = 14;

/**
 * Banner sutil para instalar la PWA en Android/desktop.
 * Aparece sólo:
 *   - tras 30s de navegación
 *   - si el navegador emitió `beforeinstallprompt`
 *   - si el usuario no descartó hace menos de DISMISS_DAYS
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 30_000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    else dismiss();
  }

  if (!visible || !evt) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar app"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-80 z-50 rounded-2xl bg-ink-950 text-bone-50 shadow-2xl p-4 flex items-start gap-3"
    >
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-700">
        <Download size={16} />
      </div>
      <div className="flex-1">
        <p className="font-medium">Instalá Arte y Tierra</p>
        <p className="mt-1 text-sm text-bone-50/75">
          Acceso rápido a tus cursos y reservas. Sin store.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={install}
            className="rounded-full bg-clay-500 px-4 py-1.5 text-xs font-medium text-bone-50 hover:bg-clay-700"
          >
            Instalar
          </button>
          <button onClick={dismiss} className="text-xs text-bone-50/65 hover:text-bone-50 px-2">
            Ahora no
          </button>
        </div>
      </div>
      <button onClick={dismiss} aria-label="Cerrar" className="text-bone-50/55 hover:text-bone-50">
        <X size={16} />
      </button>
    </div>
  );
}
