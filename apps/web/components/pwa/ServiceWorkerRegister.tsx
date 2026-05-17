'use client';

import { useEffect } from 'react';

/**
 * Registra el Service Worker en producción.
 * En dev se desregistra para evitar interferir con HMR.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // Asegurar limpio en dev
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.error('[sw] register failed', err));
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
