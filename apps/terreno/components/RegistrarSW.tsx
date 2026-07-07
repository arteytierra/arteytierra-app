'use client';

import { useEffect } from 'react';

/** Registra el service worker (PWA offline). No renderiza nada. */
export function RegistrarSW() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const onLoad = () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* sin SW: la app sigue funcionando online */ }); };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
