import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Workshops & Courses — Bioarchitecture & Permaculture',
  description: 'Workshops in bioarchitecture, natural alchemy, mushroom cultivation and regenerative hydrology. In-person at Tay Pichín and online. San Marcos Sierras, Córdoba.',
  alternates: { canonical: '/en/cursos' },
};

const CALENDARIO = [
  { fecha: 'Aug 16', titulo: 'Natural Alchemy — Session 4', tipo: 'Workshop', color: 'bg-clay-900' },
  { fecha: 'Sep 20', titulo: 'Natural Alchemy — Session 5', tipo: 'Workshop', color: 'bg-clay-900' },
  { fecha: 'Oct 18', titulo: 'Natural Alchemy — Session 6', tipo: 'Workshop', color: 'bg-clay-900' },
  { fecha: 'Dec 5–6', titulo: 'Bioarchitecture & Territory — Intensive', tipo: 'Intensive', color: 'bg-clay-700' },
  { fecha: 'TBC', titulo: 'Mushroom Cultivation — 3 modules', tipo: 'Workshop', color: 'bg-moss-700' },
  { fecha: 'Year-round', titulo: 'Living Immersion (weekly stays)', tipo: 'Immersion', color: 'bg-ink-800' },
];

const DESTACADOS = [
  {
    title: 'Bioarchitecture & Territory',
    subtitle: 'Dec 5–6, 2026 · Tay Pichín',
    desc: '2-day intensive on natural construction techniques: raw earth, cob, quincha, earth and lime plasters.',
    href: '/en/cursos/bioarquitectura',
    img: '/img/cursos/vueltatierra/1.jpg',
  },
  {
    title: 'Mushroom Cultivation',
    subtitle: '3-module cycle · Dates TBC',
    desc: 'Grow edible mushrooms on agricultural and forest by-products. Practical, replicable methodology.',
    href: '/en/cursos/cultivo-girgolas',
    img: '/img/cursos/girgolas/1.jpg',
  },
  {
    title: 'Natural Alchemy',
    subtitle: '3rd Saturday of the month',
    desc: 'Transform daily toxicity into sustainable solutions: natural soaps, deodorants and household products.',
    href: '/en/cursos/alquimia-natural',
    img: '/img/cursos/alquimia/1.jpg',
  },
];

export default function CursosEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Workshops & Courses</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Learning by <em>doing.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Hands-on workshops in bioarchitecture, natural alchemy and agroecology — at Tay Pichín and online. Every course is a living experience on a real building or productive site.
            </p>
          </div>
        </section>

        {/* CALENDAR */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">2026 calendar</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Upcoming <em>activities.</em></h2>
            </div>
            <div className="flex flex-col divide-y divide-bone-200">
              {CALENDARIO.map((item, i) => (
                <div key={i} className="flex items-center gap-6 py-4">
                  <div className="w-20 flex-shrink-0">
                    <p className="font-sans text-xs font-bold text-clay-700">{item.fecha}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                  <div className="flex-1">
                    <p className="font-sans text-sm font-bold text-ink-950">{item.titulo}</p>
                  </div>
                  <span className={`font-sans text-xs font-bold uppercase tracking-widest text-bone-50 px-3 py-1 ${item.color}`}>
                    {item.tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED COURSES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Featured</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">Next <em>workshops.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DESTACADOS.map(c => (
                <Link key={c.title} href={c.href} className="group block bg-ink-800 hover:bg-ink-700 transition-colors">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={c.img} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw,33vw" />
                  </div>
                  <div className="p-6">
                    <p className="font-sans text-xs text-clay-400 mb-2">{c.subtitle}</p>
                    <h3 className="font-display text-xl text-bone-50 mb-3">{c.title}</h3>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{c.desc}</p>
                    <p className="mt-4 font-sans text-xs font-bold uppercase tracking-widest text-clay-500">More info →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ONLINE COURSES */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Online · Lifetime access</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
                Mi Tierra,<br /><em>Mi Casa.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
                4-module online course in natural construction — 18 video lessons, community access and live video calls. Learn biobuilding at your own pace, from anywhere in the world.
              </p>
              <div className="flex items-center gap-6 mb-6">
                <span className="font-display text-3xl text-clay-700">USD 80</span>
                <span className="font-sans text-sm text-ink-700/70">· Lifetime access · Payment in 3 instalments available</span>
              </div>
              <Link href="/en/cursos/mi-tierra-mi-casa" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Learn more →
              </Link>
            </div>
            <div className="relative aspect-video overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/Fak9xHjoivQ"
                title="Mi Tierra Mi Casa — promotional video"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* VIDEO TESTIMONIALS */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">What participants say</p>
              <h2 className="font-display text-3xl text-bone-50">Voices from the <em>community.</em></h2>
              <p className="mt-2 font-sans text-sm text-bone-300/70 italic">(in Spanish)</p>
            </div>
            <div className="relative aspect-video bg-ink-800 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/dSqscHL4pF8"
                title="Participant testimonials — Arte y Tierra"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* LIVING IMMERSION */}
        <section className="bg-clay-700 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src="/img/taypichin/carousel/5.jpg" alt="Living Immersion — Tay Pichín" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Year-round</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-6 leading-tight">
                Living <em>Immersion.</em>
              </h2>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-6">
                Stay a minimum of 2 weeks — up to several months — at Tay Pichín and be part of the daily life: building, growing food, managing water and living in community.
              </p>
              <Link href="/en/cursos/inmersion-viva" className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-bone-100 transition-colors">
                Learn more →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
