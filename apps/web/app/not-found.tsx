import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[65vh] bg-bone-50 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-5">
            Error 404
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-ink-950 mb-6 leading-tight">
            Esta página<br /><em>no existe.</em>
          </h1>
          <p className="font-sans text-ink-700 text-base leading-relaxed mb-10 max-w-sm mx-auto">
            El contenido que buscás se movió o todavía no está disponible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/cursos"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors"
            >
              Ver todos los cursos
            </Link>
            <Link
              href="/"
              className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
