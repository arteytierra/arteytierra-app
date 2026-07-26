import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Gracias — Terreno',
  robots: { index: false },
};

export default function GraciasTerreno() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] flex items-center justify-center bg-bone-50 px-6 py-24">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-water-500/12 border border-water-500/25 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-water-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Suscripción</p>
          <h1 className="font-display text-4xl text-ink-950 mb-4">¡Gracias!</h1>
          <p className="font-sans text-ink-700 leading-relaxed mb-8">
            Estamos confirmando tu pago. Apenas se acredite, tu plan queda activo automáticamente
            —puede tardar unos minutos. Ya podés volver a Terreno; si todavía ves algún candado,
            recargá la página en un rato.
          </p>
          <a
            href="https://terreno.arteytierra.org/mapa"
            className="inline-flex items-center gap-2 bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-moss-700 transition-colors"
          >
            Volver a Terreno
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
