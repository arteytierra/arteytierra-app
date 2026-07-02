import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: 'Arte y Tierra — Conception, consultation & projets' },
  description:
    'Arte y Tierra : conception écosystémique du territoire. Bioarchitecture, hydrologie régénérative, consultations en ligne et réalisations.',
  alternates: { canonical: '/fr/arte-y-tierra' },
};

const CARDS = [
  {
    eyebrow: 'Conception',
    title: 'Conception intégrale du territoire',
    body: "Bioarchitecture, hydrologie régénérative et agroécologie. Nous pensons le terrain comme un système vivant et concevons chaque couche.",
    href: '/fr/diseno',
    cta: 'Voir la conception',
  },
  {
    eyebrow: 'Consultation',
    title: 'Consultations en ligne',
    body: "Accompagnement à distance pour votre terrain : diagnostic, idées et plan d'action, étape par étape, où que vous soyez.",
    href: '/fr/asesorias',
    cta: 'Réserver une consultation',
  },
  {
    eyebrow: 'Projets',
    title: 'Réalisations',
    body: 'Plus de 40 projets dans 7 pays. Chaque territoire, une histoire différente de régénération et de construction naturelle.',
    href: '/fr/proyectos',
    cta: 'Voir les projets',
  },
];

export default function ArteYTierraFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Conception écosystémique du territoire
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-bone-50 leading-tight max-w-3xl mb-6">
              Nous concevons le territoire comme un <em>système vivant.</em>
            </h1>
            <p className="font-sans text-base md:text-lg text-bone-200 max-w-2xl leading-relaxed">
              Bioarchitecture, eau et agroécologie dans une même conception. Nous accompagnons chaque projet de l&apos;idée
              à la réalisation — à Tay Pichín ou sur votre propre terrain, partout dans le monde.
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
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Vous avez un projet en tête ?</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Commençons par votre <em>terre.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto leading-relaxed mb-8">
            Écrivez-nous et nous organiserons une première conversation sur votre terrain et vos idées.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/fr/asesorias"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Réserver une consultation →
            </Link>
            <Link
              href="/fr/contacto"
              className="inline-flex border-2 border-clay-700 text-clay-700 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-200 transition-colors"
            >
              Écrivez-nous →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
