import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Projects — Arte y Tierra',
  description: 'Portfolio of bioarchitecture, regenerative hydrology and natural building projects by Arte y Tierra. From Argentina to Europe.',
  alternates: { canonical: '/en/proyectos' },
};

const PROYECTOS = [
  {
    slug: 'armonia',
    name: 'Proyecto Armonía',
    type: 'Bioarchitecture + Hydrology',
    img: '/img/proyectos/armonia/1.jpg',
    meta: 'Capilla del Monte · 2025',
    desc: 'Integral design of a regenerative habitat: earthen architecture, water harvesting system and productive agroecological design.',
  },
  {
    slug: 'alihuen',
    name: 'Casa Alihuen',
    type: 'Bioarchitecture',
    img: '/img/proyectos/alihuen/12.jpg',
    meta: 'Santa Isabel · 2024',
    desc: 'House in earth and stone with bioclimatic design adapted to the semi-arid climate of Córdoba. Owner-builder accompaniment.',
  },
  {
    slug: 'sol',
    name: 'Casa del Sol',
    type: 'Bioarchitecture',
    img: '/img/proyectos/sol/1.jpg',
    meta: 'Santa Isabel · 2023',
    desc: 'Solar-passive house with natural earth plasters, rainwater harvesting and dry toilets integrated into the landscape.',
  },
  {
    slug: 'chelo',
    name: 'La Casa del Chelo',
    type: 'Bioarchitecture',
    img: '/img/proyectos/chelo/1.jpg',
    meta: 'María Juana, Santa Fé · 2019',
    desc: 'Rural house built with adobe and quincha. Community workshop with 40 participants from 5 provinces.',
  },
  {
    slug: 'aurea',
    name: 'Casa Aurea',
    type: 'Bioarchitecture',
    img: '/img/proyectos/aurea/1.jpg',
    meta: 'San Marcos Sierras · 2022–2026',
    desc: "Long-term owner-builder project: cob, stone and earth plaster. Design integrated into Tay Pichín's productive landscape.",
  },
  {
    slug: 'sum-arbol-piedra',
    name: 'SUM Árbol de Piedra',
    type: 'Bioarchitecture',
    img: '/img/proyectos/sum-arbol-piedra/1.jpg',
    meta: 'Córdoba',
    desc: 'Community multipurpose space built with stone and earth. Collective construction with active community participation.',
  },
];

const PAISES = ['AR', 'FR', 'CO', 'PE', 'BO', 'IT', 'EC'];
const PAISES_FULL = ['Argentina', 'France', 'Colombia', 'Peru', 'Bolivia', 'Italy', 'Ecuador'];

export default function ProyectosEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Portfolio</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Projects rooted in <em>the territory.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Each project is unique — born from the place, the climate, the materials available and the people who inhabit it. No catalogue, no copy-paste.
            </p>
          </div>
        </section>

        {/* PROJECTS GRID */}
        <section className="bg-bone-50 py-16 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {PROYECTOS.map(p => (
                <Link key={p.slug} href={`/proyectos/${p.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden mb-5">
                    <Image
                      src={p.img} alt={p.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width:768px) 100vw,50vw"
                    />
                  </div>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-2">{p.type}</p>
                  <h2 className="font-display text-2xl text-ink-950 mb-1">{p.name}</h2>
                  <p className="font-sans text-xs text-ink-700/60 mb-3">{p.meta}</p>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* COUNTRIES */}
        <section className="bg-clay-700 py-16 px-6">
          <div className="max-w-editorial mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Where we have built</p>
            <h2 className="font-display text-4xl text-bone-50 mb-8">
              7 <em>countries.</em>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {PAISES_FULL.map((p, i) => (
                <span key={p} className="font-sans text-sm font-bold uppercase tracking-widest text-bone-100 border border-bone-50/30 px-5 py-3">
                  {PAISES[i]} · {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Your project <em>is next.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Share your vision, your land and your questions. We design from listening.
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
