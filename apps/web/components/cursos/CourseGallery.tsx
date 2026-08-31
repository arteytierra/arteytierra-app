'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  alt: string;
}

/** Carrusel de fotos del curso: una imagen grande a la vez, con flechas, contador y avance automático. */
export function CourseGallery({ images, alt }: Props) {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  const goTo = useCallback(
    (i: number) => setIdx(((i % images.length) + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [images.length]);

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    pausedRef.current = true;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    pausedRef.current = false;
    const touch = e.changedTouches[0];
    if (startX === null || !touch) return;
    const delta = touch.clientX - startX;
    const threshold = 40; // px mínimos para contar como swipe, no como tap
    if (delta > threshold) goTo(idx - 1);
    else if (delta < -threshold) goTo(idx + 1);
  }

  if (images.length === 0) return null;

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div
        className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-ink-950 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${alt} — foto ${i + 1}`}
            fill
            className={`object-cover transition-opacity duration-700 ease-organic ${
              i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            sizes="(max-width: 768px) 100vw, 896px"
            priority={i === 0}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => goTo(idx - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ink-950/50 text-bone-50 backdrop-blur-sm hover:bg-clay-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => goTo(idx + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ink-950/50 text-bone-50 backdrop-blur-sm hover:bg-clay-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-ink-950/50 text-bone-50 text-xs font-sans font-semibold backdrop-blur-sm">
              {idx + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la foto ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'w-7 bg-clay-500' : 'w-1.5 bg-clay-500/30 hover:bg-clay-500/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
