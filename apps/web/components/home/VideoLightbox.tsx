'use client';

import { useState } from 'react';
import Image from 'next/image';

const VIDEOS = [
  { id: 'tj0cO4OC2lw', name: 'Sofía' },
  { id: 'p-ckc6jbu9k', name: 'Diego' },
  { id: 'hL37TaUY9qE', name: 'Franco Colavita' },
];

export function VideoLightbox() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {VIDEOS.map(v => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className="relative aspect-video overflow-hidden group focus:outline-none"
            aria-label={`Ver testimonio de ${v.name}`}
          >
            <Image
              src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
              alt={`Testimonio ${v.name}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-ink-950/40 group-hover:bg-ink-950/20 transition-colors flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bone-50/90 flex items-center justify-center shadow-float">
                <svg className="w-5 h-5 text-ink-950 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="text-bone-50 text-sm font-sans font-semibold">{v.name}</span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/95 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setActive(null); }}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-4 right-5 text-bone-100 text-3xl leading-none hover:text-bone-50"
            aria-label="Cerrar"
          >✕</button>
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${active}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
