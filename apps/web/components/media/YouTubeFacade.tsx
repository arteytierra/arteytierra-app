'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

export function YouTubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // hqdefault.jpg (480×360) siempre existe; maxresdefault a veces no
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <button
      onClick={() => setPlaying(true)}
      className="absolute inset-0 w-full h-full group flex items-center justify-center bg-ink-950"
      aria-label={`Reproducir: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-clay-700 group-hover:bg-clay-900 transition-colors duration-200 shadow-xl">
        <Play size={28} className="text-bone-50 ml-1" fill="currentColor" />
      </div>
    </button>
  );
}
