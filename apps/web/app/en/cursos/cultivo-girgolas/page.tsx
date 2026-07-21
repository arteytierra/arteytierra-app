import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Oyster Mushroom Cultivation — 3-Module Workshop',
  description: '3-module oyster mushroom cultivation workshop at EcoSchool Tay Pichín. Learn to grow edible mushrooms on agricultural by-products. New dates to be confirmed.',
  alternates: { canonical: '/en/cursos/cultivo-girgolas' },
};

const MODULOS = [
  {
    n: 'Module 1',
    fecha: 'To be confirmed',
    titulo: 'Introduction & substrate preparation',
    contenido: [
      'Biology and life cycle of oyster mushrooms',
      'Agricultural substrates: selection and treatment',
      'Pasteurization and inoculation techniques',
      'Contamination prevention',
    ],
  },
  {
    n: 'Module 2',
    fecha: 'To be confirmed',
    titulo: 'Production management',
    contenido: [
      'Incubation and fruiting conditions',
      'Environmental management: humidity, light, ventilation',
      'Harvesting and post-harvest',
      'Scale-up and replications',
    ],
  },
  {
    n: 'Module 3',
    fecha: 'To be confirmed',
    titulo: 'Integration & local economy',
    contenido: [
      'Spent substrate as compost',
      'Mycelium in permaculture design',
      'Local marketing and food preservation',
      'Replicable production systems',
    ],
  },
];

export default function CultivoGirgolaEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-moss-900 py-24 px-6" style={{ background: 'linear-gradient(135deg, #2D4A1E, #1A2E0E)' }}>
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-300 mb-4">
              3-Module Workshop · Dates to be confirmed · EcoSchool Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Oyster Mushroom <em>Cultivation.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Learn to grow edible mushrooms using agricultural and forest by-products. A practical, replicable and community-oriented methodology.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20the%20mushroom%20cultivation%20workshop" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Enroll →
              </a>
              <Link href="/en/cursos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                All courses →
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Why mushrooms?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              The most productive organism<br />in the <em>permaculture system.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Oyster mushrooms are one of the easiest fungi to cultivate and one of the most nutritious foods. They grow on materials that would otherwise be considered waste: straw, sawdust, cardboard, wood chips. In 3 months you can have your first harvest.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              This workshop teaches you a complete and replicable production cycle — from substrate preparation to marketing. Practical, hands-on and adapted to small-scale or community contexts.
            </p>
          </div>
        </section>

        {/* KEY DATA */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Format', value: '3 modules', sub: '1 session per module' },
              { label: 'Where?', value: 'EcoSchool Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'When?', value: 'To be confirmed', sub: 'Three Friday afternoons' },
              { label: 'Places', value: 'Limited', sub: 'Registration required' },
            ].map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-moss-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-2">{d.label}</p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MODULES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Programme</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                3 modules · <em>complete cycle.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MODULOS.map(m => (
                <div key={m.n} className="bg-ink-800 p-8">
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-500 mb-1">{m.n}</p>
                  <p className="font-sans text-xs text-bone-300/60 mb-4">{m.fecha}</p>
                  <h3 className="font-display text-xl text-bone-50 mb-4">{m.titulo}</h3>
                  <ul className="flex flex-col gap-2">
                    {m.contenido.map(c => (
                      <li key={c} className="flex items-start gap-2 font-sans text-sm text-bone-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-moss-700 flex-shrink-0 mt-1.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RATES */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Investment</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Rates.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg mb-8">
              <div className="bg-bone-100 p-8 text-center">
                <p className="font-sans text-sm text-ink-700 mb-3">Per module</p>
                <p className="font-display text-3xl text-clay-700">$60,000 ARS</p>
              </div>
              <div className="bg-clay-700 p-8 text-center">
                <p className="font-sans text-sm text-bone-200 mb-3">Full cycle (3 modules)</p>
                <p className="font-display text-3xl text-bone-50">$150,000 ARS</p>
                <p className="font-sans text-xs text-bone-200/70 mt-2">Save $30,000</p>
              </div>
            </div>
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20the%20mushroom%20cultivation%20workshop"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Enroll on WhatsApp →
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
