import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { OficioApplyForm } from '@/components/cursos/OficioApplyForm';

export const metadata: Metadata = {
  title: 'Voluntariado de oficio · Beca completa — Inmersión Viva',
  description: 'Aportá tu oficio (electricidad, plomería, herrería, carpintería, comunicación...) a la construcción de la ecoescuela Tay Pichín y accedé a una beca completa para la Inmersión Viva.',
  alternates: { canonical: '/cursos/inmersion-viva/oficio' },
};

const EJEMPLOS = [
  'Electricidad', 'Plomería', 'Herrería', 'Carpintería', 'Comunicación / community management',
  'Diseño gráfico', 'Fotografía y video', 'Nutrición', 'Salud y primeros auxilios', 'Mecánica',
];

export default function OficioPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Beca completa · Inmersión Viva
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Aportá tu <em>oficio.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-xl mx-auto leading-relaxed">
              Si tenés un oficio y querés ponerlo al servicio de la construcción de la ecoescuela, podés acceder a una beca completa para vivir la Inmersión Viva — sin costo de aporte, a cambio del servicio que brindás.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {EJEMPLOS.map(e => (
                <span key={e} className="text-xs font-sans text-clay-200 bg-clay-700/20 border border-clay-700/40 px-3 py-1.5">
                  {e}
                </span>
              ))}
            </div>
            <p className="mt-4 font-sans text-xs text-bone-200/60 italic">
              Estos son ejemplos — si tu oficio no está en la lista, contanos igual.
            </p>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="bg-bone-50 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-8 text-center">Cómo funciona</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="font-display text-3xl text-clay-700 mb-2">1</div>
                <h3 className="font-sans font-bold text-sm text-ink-950 mb-1">Postulás</h3>
                <p className="font-sans text-xs text-ink-700 leading-relaxed">Completás el formulario contándonos tu oficio y mostrándonos tu trabajo.</p>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-clay-700 mb-2">2</div>
                <h3 className="font-sans font-bold text-sm text-ink-950 mb-1">Entrevista</h3>
                <p className="font-sans text-xs text-ink-700 leading-relaxed">Si tu oficio encaja con lo que necesitamos, coordinamos una videollamada.</p>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-clay-700 mb-2">3</div>
                <h3 className="font-sans font-bold text-sm text-ink-950 mb-1">Beca completa</h3>
                <p className="font-sans text-xs text-ink-700 leading-relaxed">Confirmado el intercambio, vivís la Inmersión Viva sin costo de aporte.</p>
              </div>
            </div>
            <p className="mt-10 text-center font-sans text-sm text-ink-700 max-w-lg mx-auto leading-relaxed">
              La participación mínima para esta modalidad es de <strong>4 semanas</strong> — el tiempo que necesita un oficio para integrarse de verdad a la obra.
            </p>
          </div>
        </section>

        {/* FORMULARIO */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Postulación</p>
              <h2 className="font-display text-3xl text-bone-50">Contanos tu <em>oficio.</em></h2>
            </div>
            <OficioApplyForm />
          </div>
        </section>

        {/* VOLVER */}
        <section className="bg-bone-100 py-10 px-6 text-center">
          <Link href="/cursos/inmersion-viva" className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors">
            ← Volver a la Inmersión Viva
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
