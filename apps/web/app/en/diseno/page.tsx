import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Bioarchitecture & Territory Design',
  description: 'Bioarchitecture, regenerative hydrology and natural building. We design living habitats with earth, wood, stone and straw — in Argentina and worldwide.',
  alternates: { canonical: '/en/diseno' },
};

const SERVICIOS = [
  {
    num: '01',
    title: "Bioarchitecture & habitat design",
    tecnicas: ['Earth, wood, stone and straw', 'Bioclimatic design', 'Territorial reading'],
    body: "We listen to the territory before drawing a single line. Every structure is born from the landscape — its orientation, materials and form emerge from a deep dialogue with the place.",
    img: '/img/home/lo-que-hacemos/1.jpg',
  },
  {
    num: '02',
    title: 'Regenerative hydrology',
    tecnicas: ['Rainwater harvesting', 'Greywater phytoremediation', 'Water cycle design'],
    body: "Water design is not engineering — it's listening. We observe how water moves through the land and accompany it: slowing it, infiltrating it, cleansing it.",
    img: '/img/home/lo-que-hacemos/2.jpg',
  },
  {
    num: '03',
    title: 'Natural plastering & finishing',
    tecnicas: ['Earth plasters', 'Lime plasters', 'Tadelakt', 'Natural pigments'],
    body: "The skin of a building matters as much as its bones. We finish with materials that breathe, regulate humidity and age with beauty.",
    img: '/img/home/lo-que-hacemos/3.jpg',
  },
  {
    num: '04',
    title: 'Territorial planning',
    tecnicas: ['Permaculture design', 'Food systems', 'Productive landscape'],
    body: "A habitat is more than a house. We design integrated systems: gardens, orchards, water, animals and people — together, in productive regenerative landscape.",
    img: '/img/taypichin/carousel/3.jpg',
  },
  {
    num: '05',
    title: 'Consulting & accompaniment',
    tecnicas: ['Remote consultations', 'Technical guidance', 'Owner-builder support'],
    body: "You want to build your own home but don't know where to start. We accompany you step by step: from territorial reading to choosing materials and construction techniques.",
    img: '/img/taypichin/carousel/5.jpg',
  },
];

const MODOS = [
  {
    title: 'Complete project',
    desc: 'Full design process — from territorial reading to construction documents and on-site support.',
  },
  {
    title: 'Technical consulting',
    desc: 'Specific guidance on materials, techniques or building systems. Remote or in-person.',
  },
  {
    title: 'Accompaniment',
    desc: "You build, we advise. Ideal for self-builders who want expert support throughout the process.",
  },
  {
    title: 'Workshops & training',
    desc: 'Hands-on learning on a real building site. At Tay Pichín or on your own land.',
  },
];

export default function DisenoEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/home/lo-que-hacemos/1.jpg"
            alt="Bioarchitecture and natural construction — Arte y Tierra"
            fill priority className="object-cover opacity-70" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Design & Construction</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              We build with the <em>territory.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Bioarchitecture, regenerative hydrology and natural building. Earth, wood, stone and straw — materials that breathe with the land.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20a%20design%20project" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Tell us about your project →
              </a>
              <Link href="/en/proyectos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                See projects →
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Our approach</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Design that <em>listens</em> before it draws.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Before any sketch, we read the territory: the slope, the light, the water, the winds and the people who will inhabit the space. From that listening, a unique, rooted and alive design emerges — one that could only exist in that place and for those people.
            </p>
          </div>
        </section>

        {/* SERVICES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Services</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">What we <em>do.</em></h2>
            </div>
            <div className="flex flex-col gap-12">
              {SERVICIOS.map((s, i) => (
                <div key={s.num} className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Image src={s.img} alt={s.title} fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
                  </div>
                  <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                    <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-500 mb-4">{s.num}</p>
                    <h3 className="font-display text-3xl text-bone-50 mb-4">{s.title}</h3>
                    <ul className="flex flex-wrap gap-2 mb-5">
                      {s.tecnicas.map(t => (
                        <li key={t} className="font-sans text-xs text-clay-400 border border-clay-700/40 px-3 py-1">{t}</li>
                      ))}
                    </ul>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO WORK WITH US */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">How to work with us</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Ways to <em>collaborate.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MODOS.map(m => (
                <div key={m.title} className="bg-bone-50 p-8">
                  <h3 className="font-display text-2xl text-ink-950 mb-3">{m.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20information%20about%20a%20design%20project"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Start a conversation →
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
