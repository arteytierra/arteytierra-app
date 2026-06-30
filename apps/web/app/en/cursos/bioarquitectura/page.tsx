import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Bioarchitecture, Building & Territory — Intensive Workshop at Tay Pichín',
  description: '2-day intensive workshop at Tay Pichín: biobuilding on a real construction site with traditional techniques adapted to semi-arid territories. July 18–19, 2026.',
  alternates: { canonical: '/en/cursos/bioarquitectura' },
};

const CONTENIDOS = [
  'Raw earth · materials',
  'Rammed earth and cob',
  'Quincha (wattle and daub)',
  'Earth plasters',
  'Lime plasters',
  'Bioclimatic design',
];

const PROGRAMA = [
  {
    dia: 'Saturday July 18',
    actividades: 'Welcome · earth laboratory · wall techniques · rough plaster',
  },
  {
    dia: 'Sunday July 19',
    actividades: 'Bioclimatic · lime plaster · fine finishes · closing circle',
  },
];

const PRECIOS = [
  { tipo: 'No accommodation', precio: '$130,000', usd: 'USD 100' },
  { tipo: 'Camping', precio: '$145,000', usd: 'USD 112' },
  { tipo: 'Shared room', precio: '$160,000', usd: 'USD 123', featured: true },
];

export default function BioarquitecturaEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/vueltatierra/1.jpg"
            alt="Bioarchitecture and building — Intensive workshop at Tay Pichín"
            fill priority className="object-cover opacity-60" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Intensive workshop · July 18–19, 2026 · Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Bioarchitecture,<br />building & <em>territory.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              How to design and build <em>living habitats</em> in connection with the territory. Two days on a real building site, ancestral techniques and ecological design applied to semi-arid lands.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20enroll%20in%20the%20July%20Bioarchitecture%20workshop" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
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
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">An intensive experience</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Learning by building<br />on a <em>real site.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Two days of intensive experience where we will learn by integrating ancestral biobuilding techniques with contemporary ecological design principles and bioclimatic architecture adapted to semi-arid territories.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              During the gathering we will work collectively on different construction stages using earth, stone, vegetable fibres and natural materials, understanding the habitat as <em>a living organism</em> in direct relationship with the landscape, the climate and the people who inhabit it.
            </p>
            <p className="font-sans text-base font-bold text-ink-950">
              More than technical training, this proposal seeks to recover more conscious ways of inhabiting, building and connecting with the land.
            </p>
          </div>
        </section>

        {/* KEY DATA */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'When?', value: 'July 18–19', sub: 'Saturday and Sunday · 2026' },
              { label: 'Where?', value: 'EcoSchool Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'Format', value: 'Participatory intensive', sub: '40% theory · 60% hands-on building' },
              { label: 'Led by', value: 'Jonatan Palma', sub: 'Limited places' },
            ].map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-clay-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTENT + PROGRAMME */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-6">Contents</p>
              <ul className="flex flex-col gap-3">
                {CONTENIDOS.map(c => (
                  <li key={c} className="flex items-center gap-3 font-sans text-sm text-bone-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-6">Programme</p>
              <div className="flex flex-col gap-5">
                {PROGRAMA.map(p => (
                  <div key={p.dia} className="border-l-2 border-clay-700 pl-5">
                    <p className="font-sans font-bold text-sm text-bone-100 mb-1">{p.dia}</p>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{p.actividades}</p>
                  </div>
                ))}
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mb-10">
              {PRECIOS.map(p => (
                <div key={p.tipo} className={`p-8 text-center ${p.featured ? 'bg-clay-700' : 'bg-bone-100'}`}>
                  {p.featured && <span className="text-xs font-sans font-bold text-ink-950 bg-bone-50 px-2 py-1 inline-block mb-4">RECOMMENDED</span>}
                  <p className={`font-sans text-sm mb-3 ${p.featured ? 'text-bone-200' : 'text-ink-700'}`}>{p.tipo}</p>
                  <p className={`font-display text-3xl ${p.featured ? 'text-bone-50' : 'text-clay-700'}`}>{p.precio}</p>
                  <p className={`font-sans text-xs mt-2 ${p.featured ? 'text-bone-200/70' : 'text-ink-700/70'}`}>ARS · {p.usd}</p>
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-ink-700/70 italic mb-8">
              Includes: all hands-on building activities, materials and access to the Tay Pichín space.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20enroll%20in%20the%20July%20Bioarchitecture%20workshop"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Enroll on WhatsApp →
              </a>
              <Link href="/en/contacto" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
                Write to us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
