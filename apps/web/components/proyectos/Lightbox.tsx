'use client';

import Image from 'next/image';
import { useCallback, useEffect } from 'react';

/**
 * La foto grande, sobre el resto de la página.
 *
 * Estaba escrita adentro de `ProjectCard` y la ficha de cada proyecto
 * necesitaba la misma cosa, así que se sacó acá. Lo que hay que acordarse al
 * tocarla son las dos cosas que no se ven:
 *
 *  - **El `overflow` del body se restituye en el cleanup**, no en el `else`.
 *    Si el componente se desmonta con la foto abierta —navegar con el teclado
 *    mientras está abierta, por ejemplo— el body queda trabado y la página
 *    entera deja de poder scrollear.
 *  - **Escape cierra y las flechas pasan de foto** mientras está abierta. El
 *    listener va en `document` y se saca al cerrar, porque si queda puesto
 *    las flechas siguen cambiando una foto que no está en pantalla.
 */
export function Lightbox({
  fotos,
  nombre,
  indice,
  onIndice,
  onCerrar,
}: {
  fotos: readonly string[];
  nombre: string;
  /** `null` = cerrada. */
  indice: number | null;
  onIndice: (i: number) => void;
  onCerrar: () => void;
}) {
  const total = fotos.length;

  const anterior = useCallback(() => {
    if (indice === null) return;
    onIndice((indice - 1 + total) % total);
  }, [indice, total, onIndice]);

  const siguiente = useCallback(() => {
    if (indice === null) return;
    onIndice((indice + 1) % total);
  }, [indice, total, onIndice]);

  useEffect(() => {
    if (indice === null) return;
    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  }, [indice, anterior, siguiente, onCerrar]);

  useEffect(() => {
    if (indice === null) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [indice]);

  if (indice === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-950/96 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${nombre} — foto ${indice + 1} de ${total}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <button
        onClick={onCerrar}
        className="absolute top-4 right-5 text-bone-100 text-3xl leading-none hover:text-bone-50"
        aria-label="Cerrar"
      >
        ✕
      </button>

      {total > 1 && (
        <button
          onClick={anterior}
          className="absolute left-4 text-bone-100 text-5xl leading-none hover:text-bone-50"
          aria-label="Anterior"
        >
          ‹
        </button>
      )}

      <div className="relative w-full max-w-5xl px-16 py-10 h-full flex items-center justify-center">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={fotos[indice] ?? fotos[0]!}
            alt={`${nombre} — foto ${indice + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>
      </div>

      {total > 1 && (
        <button
          onClick={siguiente}
          className="absolute right-4 text-bone-100 text-5xl leading-none hover:text-bone-50"
          aria-label="Siguiente"
        >
          ›
        </button>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-bone-200 text-sm font-sans">
        {indice + 1} / {total}
      </div>
    </div>
  );
}
