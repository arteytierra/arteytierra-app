'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Exportar el mapa a PNG. Captura `#print-capture-root` (título + leyenda +
 * mapa) con `html-to-image`, descartando los controles de Leaflet y lo marcado
 * como `.no-print`, y dispara la descarga nombrada por el título de captura.
 *
 * Interfaz angosta: recibe el `capturaTitulo` (nombre de archivo) y un `onError`
 * para avisar si la captura falla; el error se mantiene en un ref para no
 * recrear `handleGuardarPng` si el caller pasa una arrow inline (misma
 * memoización que antes: sólo depende de `capturaTitulo` y `guardandoPng`).
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 5). No cambia comportamiento.
 */
export function useCapturaPng(capturaTitulo: string, onError: (mensaje: string) => void) {
  const [guardandoPng, setGuardandoPng] = useState(false);

  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const handleGuardarPng = useCallback(async () => {
    // Capturamos el contenedor principal para incluir título y leyenda
    const el = document.getElementById('print-capture-root');
    if (!el || guardandoPng) return;
    setGuardandoPng(true);
    try {
      const { toPng } = await import('html-to-image');
      // Pequeño delay para asegurar que el DOM esté completamente pintado
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: false,
        filter: (node) => {
          if (!(node instanceof Element)) return true;
          if (node.classList.contains('no-print')) return false;
          if (node.classList.contains('leaflet-control-container')) return false;
          return true;
        },
        // Asegurar que los overlays con posición absoluta se rendericen correctamente
        style: {
          overflow: 'visible',
        },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${capturaTitulo || 'mapa'}-${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.png`;
      a.click();
    } catch (e) {
      onErrorRef.current('No se pudo guardar la imagen. Usá el botón "Imprimir" y guardá como PDF.');
      console.error(e);
    } finally {
      setGuardandoPng(false);
    }
  }, [capturaTitulo, guardandoPng]);

  return { guardandoPng, handleGuardarPng };
}
