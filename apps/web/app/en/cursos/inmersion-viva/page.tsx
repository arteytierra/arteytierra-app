import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Living Immersion — Tay Pichín',
  description: 'Living Immersion at Tay Pichín: our take on volunteering. Biobuilding, agroecology and collective organization on the territory. San Marcos Sierras, Córdoba.',
  alternates: { canonical: '/en/cursos/inmersion-viva' },
};

const AREAS = [
  {
    icon: '🏗',
    title: 'Biobuilding',
    items: ['Raw earth techniques', 'Reading and using local materials', 'Construction criteria on a real building site', 'Natural plasters and finishes'],
  },
  {
    icon: '🌱',
    title: 'Agroecology',
    items: ['Garden and living systems management', 'Soil, compost and bio-inputs', 'Plant-animal integration', 'Food forest and zone 1'],
  },
  {
    icon: '🌿',
    title: 'Biocosmetics',
    items: ['Harvesting and drying medicinal plants', 'Oil and alcohol macerations', 'Handmade mother tinctures', 'Ointments, creams and natural preparations'],
  },
  {
    icon: '💧',
    title: 'Hydrological design',
    items: ['Reading the landscape', 'Water, climate and topography', 'Introduction to hydrological design', 'Watershed observation'],
  },
  {
    icon: '🎓',
    title: 'Course participation',
    items: ['Free access to workshops held at the ecoschool during your stay', 'Participation as part of the courses\' logistics team', 'Learning from inside the pedagogical organization'],
  },
  {
    icon: '🤝',
    title: 'Community life',
    items: ['Talking circles', 'Assemblies and collective decision-making', 'Managing collective living', 'Daily life at the ecoschool'],
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
              🌿 Educational volunteering · From 2 weeks
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Living <em>Immersion.</em>
            </h1>
            <p className="mt-3 font-display text-xl text-clay-300 italic">
              Our take on volunteering.
            </p>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              You're not here to work — you're here to learn a craft alongside the people who carry it every day.
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
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-4">
              At Tay Pichín there's no checklist of chores: there are skilled instructors sharing knowledge that has passed from hand to hand since humans first discovered clay. Biobuilding, agroecology, collective organization — all learned by doing, woven into the ecoschool's daily life.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              A project that hasn't stopped since November 2020, heir to a tradition of itinerant volunteering that Arte y Tierra has sustained since 2014 across Argentina, Colombia, Ecuador, France, Italy and Peru.
            </p>
            <Link href="/en/nosotros" className="inline-flex items-center gap-1.5 mt-6 font-sans text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors">
              Learn about our history and journey →
            </Link>
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
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Your contribution</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                It <em>drives us to keep doing this work.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
                It's not payment for work: it's what sustains an educational project open 365 days a year — it covers your food and the space's running costs while you're with us.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
              <div className="bg-ink-950 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Camping area</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Full meals</strong> and a camping spot at Tay Pichín.
                </p>
                <p className="font-display text-3xl text-clay-700">$40,000 ARS / week</p>
              </div>
              <div className="bg-clay-900 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">Shared room</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Full meals</strong> and a shared room at Tay Pichín.
                </p>
                <p className="font-display text-3xl text-clay-700">$80,000 ARS / week</p>
              </div>
            </div>
            <div className="bg-clay-700/10 border border-clay-700/30 p-6 max-w-2xl mb-8">
              <p className="font-sans text-sm font-bold text-clay-700 mb-2">📅 Arrivals on Mondays only.</p>
              <p className="font-sans text-sm text-ink-700">Minimum 2 weeks. Possible to extend to a month or more depending on availability.</p>
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
