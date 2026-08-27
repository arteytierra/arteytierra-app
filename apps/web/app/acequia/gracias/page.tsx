import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Gracias — acequia',
  robots: { index: false },
};

export default function GraciasAcequia() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] flex items-center justify-center bg-[#F5F0E8] px-6 py-24">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#2E6B8A]/12 border border-[#2E6B8A]/25 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#2E6B8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <Image
            src="/img/acequia/logo-color.png"
            alt="acequia"
            width={1200}
            height={395}
            style={{ width: 'auto' }}
            className="h-8 mx-auto mb-5"
          />
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#C17F3A] mb-3">Suscripción</p>
          <h1 className="font-display text-4xl text-[#1A1210] mb-4">¡Gracias!</h1>
          <p className="font-sans text-[#3D2010] leading-relaxed mb-8">
            Estamos confirmando tu pago. Apenas se acredite, tu plan queda activo automáticamente
            —puede tardar unos minutos. Ya podés volver a acequia; si todavía ves algún candado,
            recargá la página en un rato.
          </p>
          <a
            href="https://terreno.arteytierra.org/mapa"
            className="inline-flex items-center gap-2 bg-[#1A1210] text-[#F5F0E8] font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-[#4A6741] transition-colors"
          >
            Volver a acequia
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
