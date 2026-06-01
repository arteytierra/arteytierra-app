import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Living Immersion — Tay Pichín | Arte y Tierra',
  description: 'Living Immersion at Tay Pichín: training periods in permaculture practices, biobuilding and agroecology on the territory. San Marcos Sierras, Córdoba.',
  alternates: { canonical: '/en/cursos/inmersion-viva' },
};

const AREAS = [
  {
    icon: '🏗',
    title: 'Biobuilding',
    items: ['Raw earth techniques', 'Reading and using local materials', 'Construction criteria on a real building site'],
  },
  {
    icon: '🌱',
    title: 'Agroecology',
    items: ['Garden and living systems management', 'Soil, compost and bio-inputs', 'Animal integration and productive cycles'],
  },
  {
    icon: '💧',
    title: 'Water management',
    items: ['Rainwater harvesting', 'Greywater phytoremediation', 'Observation and reading of the water cycle'],
  },
  {
    icon: '🤝',
    title: 'Community life',
    items: ['Collective decision-making', 'Community economy', 'Conviviality and daily organization'],
  },
];

export default function InmersionVivaEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/carousel/5.jpg"
            alt="Living Immersion — Tay Pichín"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              🌿 Living Immersion · Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Living <em>Immersion.</em>
            </h1>
            <p className="mt-3 font-display text-xl text-clay-300 italic">
              Training periods in permaculture practices.
            </p>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Biobuilding, agroecology and collective organization — learned through daily practice, integrated into work, conviviality and life on the territory.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20the%20Living%20Immersion" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Request a place →
              </a>
              <Link href="/en/tay-pichin" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Learn more about Tay Pichín →
              </Link>
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Approach</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              We learn by <em>doing,</em><br />sharing and supporting<br />each other.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Living Immersion is a process where biobuilding, agroecology and collective organization are learned through daily practice — integrated into work, conviviality and life on the territory. Learning happens in a living space where construction, production and daily life are part of the same system. During your stay, you participate in real processes and integrate a more conscious, simple way of inhabiting that is connected to the earth.
            </p>
          </div>
        </section>

        {/* WHAT YOU WILL LEARN */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Applied training</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                What will you <em>learn?</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AREAS.map(a => (
                <div key={a.title} className="bg-ink-800 p-8">
                  <div className="text-3xl mb-4">{a.icon}</div>
                  <h3 className="font-display text-2xl text-bone-50 mb-4">{a.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {a.items.map(item => (
                      <li key={item} className="flex items-start gap-3 font-sans text-sm text-bone-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODALITIES */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Modalities & rates</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">How to <em>participate.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
              <div className="bg-ink-950 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Initial Process</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Camping</strong> — basic meals and camping area accommodation.
                </p>
                <p className="font-display text-3xl text-clay-700">$35,000 ARS / week</p>
              </div>
              <div className="bg-clay-900 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">Deep Process</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Shared room</strong> — basic meals and shared room.
                </p>
                <p className="font-display text-3xl text-clay-700">$50,000 ARS / week</p>
              </div>
            </div>
            <div className="bg-clay-700/10 border border-clay-700/30 p-6 max-w-2xl mb-8">
              <p className="font-sans text-sm font-bold text-clay-700 mb-2">📅 Arrivals on Mondays only.</p>
              <p className="font-sans text-sm text-ink-700">Minimum 1 week. Possible to extend to a month or more depending on availability.</p>
            </div>
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20the%20Living%20Immersion"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Request a place on WhatsApp →
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Join <em>Tay Pichín.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Write to us with your desired dates, your experience and what brings you here.
          </p>
          <Link href="/en/contacto" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
            Write to us →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
