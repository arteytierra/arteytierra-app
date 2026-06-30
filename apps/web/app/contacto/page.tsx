import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContactForm } from '@/components/contacto/ContactForm';
import { FaqAccordion } from '@/components/contacto/FaqAccordion';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribinos sobre tu terreno, tu idea o tu proyecto. Trabajamos en Argentina, Colombia y toda Latinoamérica.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[55vh] min-h-[380px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/contactanos/DSC_2792.jpg"
          alt="Contacto Arte y Tierra"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Contacto</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight mx-auto max-w-2xl">
            Empecemos<br />la <em>conversación.</em>
          </h1>
          <p className="mt-5 font-sans text-base text-bone-200 max-w-lg mx-auto leading-relaxed">
            Contanos sobre tu terreno, tu idea, tu sueño. Trabajamos en cualquier parte del mundo.
          </p>
        </div>
      </section>

      {/* FORMULARIO + CONTACTO DIRECTO */}
      <section className="bg-clay-900 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* FORM */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* CONTACTO DIRECTO */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-5">Contacto directo</p>
              <div className="flex flex-col gap-4">
                <a href="mailto:info.arteytierra@gmail.com"
                  className="flex items-center gap-3 font-sans text-sm text-bone-200 hover:text-bone-50 transition-colors">
                  <span className="w-8 h-8 bg-clay-700/40 flex items-center justify-center text-clay-300 flex-shrink-0 text-base">✉</span>
                  info.arteytierra@gmail.com
                </a>
                <a href="https://wa.me/5493549431594" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 font-sans text-sm text-bone-200 hover:text-bone-50 transition-colors">
                  <span className="w-8 h-8 bg-clay-700/40 flex items-center justify-center text-clay-300 flex-shrink-0 text-base">✆</span>
                  +54 9 3549 431594
                </a>
                <a href="https://instagram.com/arteytierrabioconstruccion" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 font-sans text-sm text-bone-200 hover:text-bone-50 transition-colors">
                  <span className="w-8 h-8 bg-clay-700/40 flex items-center justify-center text-clay-300 flex-shrink-0 text-base">☞</span>
                  @arteytierrabioconstruccion
                </a>
              </div>
            </div>

            <div className="bg-clay-700/20 border border-clay-700/40 p-6">
              <p className="font-sans font-bold text-sm text-bone-100 mb-2">Sede física</p>
              <p className="font-sans text-sm text-bone-200 leading-relaxed">
                Tay Pichín · Ecoescuela y Ecohostel<br />
                San Marcos Sierras, Córdoba<br />
                Argentina
              </p>
              <Link href="/tay-pichin"
                className="mt-4 inline-flex text-xs font-sans font-bold uppercase tracking-widest text-clay-300 hover:text-bone-50 transition-colors">
                Ver cómo llegar →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">Preguntas frecuentes</p>
          <h2 className="font-display text-4xl text-ink-950 mb-12">
            Antes de <em>escribirnos.</em>
          </h2>
          <FaqAccordion />
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
