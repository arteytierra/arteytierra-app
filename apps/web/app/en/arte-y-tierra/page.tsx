import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: 'Arte y Tierra — Design, consulting & projects' },
  description:
    'Arte y Tierra: ecosystemic design of the territory. Bioarchitecture, regenerative hydrology, online consulting and completed works.',
  alternates: { canonical: '/en/arte-y-tierra' },
};

const CARDS = [
  {
    eyebrow: 'Design',
    title: 'Integral territory design',
    body: 'Bioarchitecture, regenerative hydrology and agroecology. We think of the land as a living system and design every layer.',
    href: '/en/diseno',
    cta: 'See design',
  },
  {
    eyebrow: 'Consulting',
    title: 'Online consulting',
    body: 'Remote guidance for your land: diagnosis, ideas and an action plan, step by step from wherever you are.',
    href: '/en/asesorias',
    cta: 'Book a consultation',
  },
  {
    eyebrow: 'Projects',
    title: 'Completed works',
    body: 'More than 40 projects in 7 countries. Each territory, a different story of regeneration and natural building.',
    href: '/en/proyectos',
    cta: 'See projects',
  },
];

export default function ArteYTierraEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Ecosystemic design of the territory
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-bone-50 leading-tight max-w-3xl mb-6">
              We design the territory as a <em>living system.</em>
            </h1>
            <p className="font-sans text-base md:text-lg text-bone-200 max-w-2xl leading-relaxed">
              Bioarchitecture, water and agroecology in a single design. We accompany every project from the idea to the
              built work — at Tay Pichín or on your own land, anywhere in the world.
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
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Have a project in mind?</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Let&apos;s start with your <em>land.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto leading-relaxed mb-8">
            Write to us and we&apos;ll set up a first conversation about your land and your ideas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/en/asesorias"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Book a consultation →
            </Link>
            <Link
              href="/en/contacto"
              className="inline-flex border-2 border-clay-700 text-clay-700 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-200 transition-colors"
            >
              Write to us →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
