'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

export interface Project {
  slug: string;
  name: string;
  type: string;
  meta: string;
  tags: string[];
  desc: string;
  photos: string[];
}

export function ProjectCard({ project, reverse = false }: { project: Project; reverse?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [lb, setLb] = useState<number | null>(null);

  const prev = () => setIdx(i => (i - 1 + project.photos.length) % project.photos.length);
  const next = () => setIdx(i => (i + 1) % project.photos.length);

  const lbPrev = useCallback(() => setLb(i => i === null ? null : (i - 1 + project.photos.length) % project.photos.length), [project.photos.length]);
  const lbNext = useCallback(() => setLb(i => i === null ? null : (i + 1) % project.photos.length), [project.photos.length]);

  useEffect(() => {
    if (lb === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
      if (e.key === 'Escape') setLb(null);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [lb, lbPrev, lbNext]);

  useEffect(() => {
    document.body.style.overflow = lb !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lb]);

  return (
    <>
      <article className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} overflow-hidden bg-bone-100`}>
        {/* Carousel */}
        <div className="relative md:w-3/5 aspect-[4/3] md:aspect-auto md:min-h-[500px] overflow-hidden bg-ink-950 group cursor-zoom-in"
          onClick={() => setLb(idx)}>
          <Image
            src={project.photos[idx] ?? project.photos[0]!}
            alt={`${project.name} — foto ${idx + 1}`}
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
          {project.photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-ink-950/60 text-bone-50 flex items-center justify-center text-xl hover:bg-ink-950/80 transition-colors"
                aria-label="Foto anterior"
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-ink-950/60 text-bone-50 flex items-center justify-center text-xl hover:bg-ink-950/80 transition-colors"
                aria-label="Foto siguiente"
              >›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink-950/60 text-bone-50 text-xs px-2.5 py-1">
                {idx + 1} / {project.photos.length}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center gap-4">
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">
            {project.type}
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink-950">{project.name}</h2>
          <p className="text-sm text-ink-700 font-sans">{project.meta}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs font-bold uppercase tracking-wider text-clay-700 bg-clay-100 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-base text-ink-800 font-sans leading-relaxed">{project.desc}</p>
          {project.photos.length > 1 && (
            <button
              onClick={() => setLb(0)}
              className="mt-2 self-start text-sm font-sans font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-900 transition-colors"
            >
              Ver las {project.photos.length} fotos →
            </button>
          )}
        </div>
      </article>

      {/* Lightbox */}
      {lb !== null && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/96 flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setLb(null); }}
        >
          <button
            onClick={() => setLb(null)}
            className="absolute top-4 right-5 text-bone-100 text-3xl leading-none hover:text-bone-50"
            aria-label="Cerrar"
          >✕</button>

          <button
            onClick={lbPrev}
            className="absolute left-4 text-bone-100 text-5xl leading-none hover:text-bone-50"
            aria-label="Anterior"
          >‹</button>

          <div className="relative w-full max-w-5xl px-16 py-10 h-full flex items-center justify-center">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={project.photos[lb] ?? project.photos[0]!}
                alt={`${project.name} — foto ${lb + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          </div>

          <button
            onClick={lbNext}
            className="absolute right-4 text-bone-100 text-5xl leading-none hover:text-bone-50"
            aria-label="Siguiente"
          >›</button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-bone-200 text-sm font-sans">
            {lb + 1} / {project.photos.length}
          </div>
        </div>
      )}
    </>
  );
}
