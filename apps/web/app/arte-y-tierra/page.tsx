import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: 'Arte y Tierra — Diseño, asesorías y proyectos' },
  description:
    'Arte y Tierra: diseño ecosistémico del territorio. Bioarquitectura, hidrología regenerativa, asesorías online y obras realizadas.',
  alternates: { canonical: '/arte-y-tierra' },
};

const CARDS = [
  {
    eyebrow: 'Diseño',
    title: 'Diseño integral del territorio',
    body: 'Bioarquitectura, hidrología regenerativa y agroecología. Pensamos el predio como un sistema vivo y diseñamos cada capa.',
    href: '/diseno',
    cta: 'Ver diseño',
  },
  {
    eyebrow: 'Asesorías',
    title: 'Asesorías online',
    body: 'Acompañamiento a distancia para tu predio: diagnóstico, ideas y plan de acción, paso a paso desde donde estés.',
    href: '/asesorias',
    cta: 'Agendar asesoría',
  },
  {
    eyebrow: 'Proyectos',
    title: 'Obras realizadas',
    body: 'Más de 40 proyectos en 7 países. Cada territorio, una historia distinta de regeneración y bioconstrucción.',
    href: '/proyectos',
    cta: 'Ver proyectos',
  },
];

export default function ArteYTierraPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Diseño ecosistémico del territorio
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-bone-50 leading-tight max-w-3xl mb-6">
              Diseñamos el territorio como un <em>sistema vivo.</em>
            </h1>
            <p className="font-sans text-base md:text-lg text-bone-200 max-w-2xl leading-relaxed">
              Bioarquitectura, agua y agroecología en un mismo diseño. Acompañamos cada proyecto desde la idea hasta la obra —
              en Tay Pichín o en tu propio predio, en cualquier parte del mundo.
            </p>
          </div>
        </section>

        {/* CARDS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group flex flex-col bg-white border border-ink-950/10 p-8 hover:border-ink-950/30 transition-colors"
              >
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">— {c.eyebrow}</p>
                <h2 className="font-display text-2xl md:text-3xl text-ink-950 mb-4 leading-tight">{c.title}</h2>
                <p className="font-sans text-sm text-ink-700 leading-relaxed mb-8 flex-1">{c.body}</p>
                <span className="font-sans font-bold text-sm uppercase tracking-widest text-clay-700 group-hover:text-clay-900 transition-colors">
                  {c.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-clay-100 py-20 px-6 text-center border-t border-clay-200">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">¿Tenés un proyecto en mente?</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Empecemos por tu <em>tierra.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto leading-relaxed mb-8">
            Escribinos y coordinamos una primera conversación sobre tu predio y tus ideas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/asesorias"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Agendar asesoría →
            </Link>
            <Link
              href="/contacto"
              className="inline-flex border-2 border-clay-700 text-clay-700 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-200 transition-colors"
            >
              Escribinos →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
