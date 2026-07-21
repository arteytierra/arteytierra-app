'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Registra el service worker (PWA offline) y avisa cuando hay una versión nueva.
 *
 * El id del build va en la query (`/sw.js?v=…`): cambia en cada deploy, así que
 * el navegador ve un script distinto, instala el SW nuevo y éste estrena caché
 * (y borra el anterior). Sin esto quedaba servido el bundle viejo.
 */
export function RegistrarSW() {
  const [hayVersionNueva, setHayVersionNueva] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const build = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev';

    const onLoad = async () => {
      try {
        // `updateViaCache: 'none'` evita que el propio script del SW se sirva
        // desde el caché HTTP y retrase la actualización.
        const reg = await navigator.serviceWorker.register(`/sw.js?v=${build}`, { updateViaCache: 'none' });
        reg.addEventListener('updatefound', () => {
          const nuevo = reg.installing;
          if (!nuevo) return;
          nuevo.addEventListener('statechange', () => {
            // Sólo es "actualización" si ya había un SW controlando la página:
            // en la primera visita no hay nada viejo que recargar.
            if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
              setHayVersionNueva(true);
            }
          });
        });
      } catch { /* sin SW: la app sigue funcionando online */ }
    };

    // Si `load` ya ocurrió (la hidratación suele llegar después en producción),
    // el listener no dispararía nunca y el SW no se registraba.
    if (document.readyState === 'complete') {
      void onLoad();
      return;
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  if (!hayVersionNueva) return null;

  return (
    <div className="fixed bottom-14 right-3 z-[9999] flex items-center gap-2 rounded-full bg-ink-900 text-bone-50 pl-3 pr-1.5 py-1.5 shadow-raised border border-bone-50/15 no-print">
      <RefreshCw className="w-3.5 h-3.5 shrink-0" />
      <span className="text-[11px]">Hay una versión nueva</span>
      <button
        onClick={() => window.location.reload()}
        className="text-[11px] font-medium rounded-full bg-sun-500 text-ink-950 px-2.5 py-1 hover:bg-sun-400 transition-colors"
      >
        Recargar
      </button>
    </div>
  );
}
