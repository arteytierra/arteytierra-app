'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Lightbox } from './Lightbox';
import { etiquetas, lugarYAnio, type Proyecto } from '@/lib/proyectos/datos';

/**
 * La tarjeta grande de `/proyectos`: el carrusel a un lado, el resumen al otro.
 *
 * Dos cosas cambiaron el 15/11/2026. La primera: el texto largo ya no está
 * acá, está en la ficha (`/proyectos/<slug>`), y la tarjeta muestra el
 * resumen y lleva ahí. Antes la lista era la única página que había, así que
 * tenía que contarlo todo en tres párrafos apretados al costado de una foto.
 * La segunda: la foto grande salió a `Lightbox`, que es la misma que usa la
 * galería de la ficha.
 *
 * Los datos salen de `lib/proyectos/datos.ts`. Esta tarjeta no decide nada
 * sobre un proyecto, sólo lo muestra.
 */
export function ProjectCard({ project, reverse = false }: { project: Proyecto; reverse?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [abierta, setAbierta] = useState<number | null>(null);

  const fotos = project.fotos;
  const anterior = () => setIdx((i) => (i - 1 + fotos.length) % fotos.length);
  const siguiente = () => setIdx((i) => (i + 1) % fotos.length);
  const ficha = `/proyectos/${project.slug}`;

  return (
    <>
      <article
        className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} overflow-hidden bg-bone-100`}
      >
        {/* Carrusel */}
        <div
          className="relative md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[500px] overflow-hidden bg-ink-950 group cursor-zoom-in"
          onClick={() => setAbierta(idx)}
        >
          <Image
            src={fotos[idx] ?? fotos[0]!}
            alt={`${project.nombre} — foto ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-opacity duration-500"
            priority={false}
          />
          <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/20 transition-colors flex items-end justify-end p-4">
            <span className="bg-ink-950/70 text-bone-50 text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver ampliado
            </span>
          </div>
          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  anterior();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-ink-950/60 text-bone-50 flex items-center justify-center text-xl hover:bg-ink-950/80 transition-colors"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  siguiente();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-ink-950/60 text-bone-50 flex items-center justify-center text-xl hover:bg-ink-950/80 transition-colors"
                aria-label="Foto siguiente"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink-950/60 text-bone-50 text-xs px-2.5 py-1">
                {idx + 1} / {fotos.length}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center gap-4">
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">
            {project.tipo.es}
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink-950">
            <Link href={ficha} className="hover:text-clay-700 transition-colors">
              {project.nombre}
            </Link>
          </h2>
          <p className="text-sm text-ink-700 font-sans">{lugarYAnio(project)}</p>
          <div className="flex flex-wrap gap-2">
            {etiquetas(project).map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold uppercase tracking-wider text-clay-700 bg-clay-100 px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-base text-ink-800 font-sans leading-relaxed">{project.resumen.es}</p>
          <Link
            href={ficha}
            className="mt-2 self-start font-sans text-sm font-bold uppercase tracking-widest text-clay-700 border-b-2 border-clay-300 pb-1 hover:text-clay-900 hover:border-clay-700 transition-colors"
          >
            Ver la ficha · {fotos.length} fotos →
          </Link>
        </div>
      </article>

      <Lightbox
        fotos={fotos}
        nombre={project.nombre}
        indice={abierta}
        onIndice={setAbierta}
        onCerrar={() => setAbierta(null)}
      />
    </>
  );
}
