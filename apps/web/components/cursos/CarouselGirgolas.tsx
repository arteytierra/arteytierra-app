'use client';

import { useState } from 'react';
import Image from 'next/image';

const FOTOS = [
  { src: '/img/cursos/cultivo-girgolas/1.jpg',    alt: 'Gírgolas frescas — Tay Pichín' },
  { src: '/img/cursos/cultivo-girgolas/2.jpg',    alt: 'Cultivo de hongos' },
  { src: '/img/cursos/cultivo-girgolas/3.jpg',    alt: 'Producción artesanal de micelio' },
  { src: '/img/cursos/cultivo-girgolas/FLYER.png', alt: 'Flyer — Taller de cultivo de gírgolas' },
  { src: '/img/taypichin/carousel/5.jpg',         alt: 'Ecoescuela Tay Pichín' },
];

export function CarouselGirgolas() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + FOTOS.length) % FOTOS.length);
  const next = () => setIdx(i => (i + 1) % FOTOS.length);

  return (
    <section className="bg-ink-950 py-12 px-0">
      <div className="max-w-editorial mx-auto px-6 mb-5">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 text-center">
          Galería del taller
        </p>
      </div>

      {/* Imagen principal */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
        {FOTOS.map((f, i) => (
          <div
            key={f.src}
            className={`absolute inset-0 transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <Image src={f.src} alt={f.alt} fill className="object-cover" sizes="100vw" />
          </div>
        ))}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-ink-950/70 text-bone-50 text-2xl flex items-center justify-center hover:bg-ink-950 transition-colors z-10"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-ink-950/70 text-bone-50 text-2xl flex items-center justify-center hover:bg-ink-950 transition-colors z-10"
        >
          ›
        </button>
        {/* Contador */}
        <div className="absolute bottom-3 right-4 bg-ink-950/60 text-bone-200 font-sans text-xs px-2 py-1">
          {idx + 1} / {FOTOS.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 px-6 max-w-editorial mx-auto overflow-x-auto pb-1">
        {FOTOS.map((f, i) => (
          <button
            key={f.src}
            onClick={() => setIdx(i)}
            aria-label={`Foto ${i + 1}`}
            className={`relative flex-shrink-0 w-20 h-14 overflow-hidden border-2 transition-colors ${
              i === idx ? 'border-clay-400' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image src={f.src} alt={f.alt} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </section>
  );
}
