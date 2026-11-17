'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Lightbox } from './Lightbox';

/**
 * Todas las fotos de una obra, en grilla, cada una ampliable.
 *
 * Son hasta treinta fotos por proyecto, así que ninguna lleva `priority`: la
 * grilla se carga sola a medida que baja. La de arriba de la ficha —la
 * portada— sí la lleva, y está en la página, no acá.
 */
export function GaleriaProyecto({
  fotos,
  nombre,
}: {
  fotos: readonly string[];
  nombre: string;
}) {
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {fotos.map((foto, i) => (
          <li key={foto}>
            <button
              type="button"
              onClick={() => setAbierta(i)}
              className="relative block w-full aspect-[4/3] overflow-hidden bg-ink-800 group cursor-zoom-in"
              aria-label={`Ampliar la foto ${i + 1} de ${fotos.length}`}
            >
              <Image
                src={foto}
                alt={`${nombre} — foto ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/20 transition-colors" />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        fotos={fotos}
        nombre={nombre}
        indice={abierta}
        onIndice={setAbierta}
        onCerrar={() => setAbierta(null)}
      />
    </>
  );
}
