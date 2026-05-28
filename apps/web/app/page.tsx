import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { VideoLightbox } from '@/components/home/VideoLightbox';

export const metadata: Metadata = {
  title: 'Arte y Tierra — Diseño Ecosistémico del Territorio',
  description: 'Bioarquitectura, hidrología regenerativa y aprendizaje vivencial. Colectivo itinerante con sede en Tay Pichín, Sierras de Córdoba, Argentina.',
};

const SERVICIOS = [
  {
    num: '01',
    title: 'Bioarquitectura y diseño de hábitat',
    body: 'Construimos con tierra, madera, piedra y paja. Espacios que no interrumpen el paisaje — que forman parte de él.',
    href: '/diseno',
    img: '/img/home/lo-que-hacemos/1.jpg',
    alt: 'Bioarquitectura — construcción natural',
  },
  {
    num: '02',
    title: 'Hidrología regenerativa',
    body: 'El agua no es un recurso que se administra — es un sistema vivo que se puede sanar. Diseñamos para que vuelva a fluir.',
    href: '/diseno',
    img: '/img/home/lo-que-hacemos/2.jpg',
    alt: 'Hidrología regenerativa — diseño del agua',
  },
  {
    num: '03',
    title: 'Talleres vivenciales',
    body: 'Aprendizaje en minga. En Tay Pichín o en tu propio predio — en cualquier parte del mundo.',
    href: '/cursos',
    img: '/img/home/lo-que-hacemos/3.jpg',
    alt: 'Talleres vivenciales de bioconstrucción',
  },
];

const PROYECTOS = [
  { slug: 'armonia',          name: 'Proyecto Armonía',    type: 'Bioarquitectura + Hidrología', img: '/img/proyectos/armonia/1.jpg',          meta: 'Capilla del Monte · 2025' },
  { slug: 'alihuen',          name: 'Casa Alihuen',         type: 'Bioarquitectura',              img: '/img/proyectos/alihuen/12.jpg',         meta: 'Santa Isabel · 2024' },
  { slug: 'sol',              name: 'Casa del Sol',          type: 'Bioarquitectura',              img: '/img/proyectos/sol/1.jpg',              meta: 'Santa Isabel · 2023' },
  { slug: 'chelo',            name: 'La Casa del Chelo',     type: 'Bioarquitectura',              img: '/img/proyectos/chelo/1.jpg',            meta: 'María Juana, Santa Fé · 2019' },
  { slug: 'aurea',            name: 'Casa Aurea',            type: 'Bioarquitectura',              img: '/img/proyectos/aurea/1.jpg',            meta: 'San Marcos Sierras · 2022–2026' },
  { slug: 'sum-arbol-piedra', name: 'SUM Árbol de Piedra',   type: 'Bioarquitectura',              img: '/img/proyectos/sum-arbol-piedra/1.jpg', meta: 'Córdoba' },
];

const STATS = [
  { n: '+10k', label: 'personas impactadas' },
  { n: '+40',  label: 'proyectos realizados' },
  { n: '+150', label: 'talleres dictados' },
  { n: '7',    label: 'países' },
];

const TESTIMONIOS = [
  {
    quote: '"Llegué a Tay Pichín pensando que iba a aprender a construir. Me fui sabiendo escuchar el agua, la tierra, y a quienes la habitan."',
    author: 'Sofía',
    role: 'participante taller bioconstrucción',
  },
  {
    quote: '"La Formación Integral en Bioconstrucción me cambió la manera de mirar el habitar. No es solo técnica — es una forma de estar en el mundo."',
    author: 'Diego',
    role: 'participante Formación Integral',
  },
  {
    quote: '"Trabajar con Jonatan y el equipo fue encontrar gente que diseña desde el lugar — no desde un catálogo. Cada decisión nació del territorio."',
    author: 'Franco Colavita',
    role: 'comitente',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ── HERO ── */}
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-ink-950 flex items-end">
          <Image
            src="/img/proyectos/portada/1.jpg"
            alt="Arte y Tierra — diseño ecosistémico del territorio"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-ink-950/10" />

          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16 md:pb-24">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-5">
              Arte y Tierra · Diseño Ecosistémico del Territorio
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight max-w-3xl">
              Diseñamos el territorio<br />
              como <em>sistema vivo.</em>
            </h1>
            <p className="mt-5 text-bone-200 font-sans text-lg md:text-xl max-w-xl leading-relaxed">
              Bioarquitectura, Agroecología y Diseño Hidrológico.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/asesorias"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
              >
                Agendar asesoría
              </Link>
              <Link
                href="/proyectos"
                className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors"
              >
                Ver proyectos →
              </Link>
            </div>
          </div>
        </section>

        {/* ── MANIFIESTO ── */}
        <section className="bg-ink-950 py-24 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-display text-2xl md:text-3xl text-bone-100 leading-relaxed italic">
              Acompañamos el diseño de hábitats que expresan una forma más{' '}
              <strong className="not-italic text-clay-300">consciente, amorosa y regenerativa</strong>{' '}
              de habitar el planeta.
            </p>
            <p className="mt-8 font-sans text-bone-200 text-lg leading-relaxed">
              Tejemos vínculos entre personas, territorios y propósitos. Escuchamos el paisaje,
              el agua, quienes lo habitan y quienes sueñan construir allí una vida nueva.
            </p>
            <p className="mt-6 font-sans text-bone-200 text-base leading-relaxed">
              Trabajamos desde el paradigma del{' '}
              <strong className="text-bone-100">Sumaq Kawsay</strong> — el Buen Vivir.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="bg-clay-700 py-14 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.n}>
                <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
                <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LO QUE HACEMOS ── */}
        <section className="bg-bone-50 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-3">Lo que hacemos</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Cómo transformamos<br />el <em>territorio.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SERVICIOS.map(s => (
                <div key={s.num} className="flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-bone-200">
                    <Image
                      src={s.img}
                      alt={s.alt}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <span className="text-xs font-sans font-bold text-clay-700">{s.num}</span>
                    <h3 className="font-display text-xl text-ink-950">{s.title}</h3>
                    <p className="font-sans text-base text-ink-700 leading-relaxed">{s.body}</p>
                    <Link
                      href={s.href}
                      className="text-sm font-sans font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-900 transition-colors self-start"
                    >
                      Conocer más →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROYECTOS ── */}
        <section className="bg-ink-950 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Obra realizada</p>
                <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                  El territorio<br />como <em>obra.</em>
                </h2>
              </div>
              <Link
                href="/proyectos"
                className="text-sm font-sans font-semibold text-clay-300 hover:text-clay-100 underline underline-offset-4 transition-colors"
              >
                Ver todos los proyectos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROYECTOS.map(p => (
                <Link
                  key={p.slug}
                  href="/proyectos"
                  className="group block overflow-hidden bg-ink-800"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/20 transition-colors" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-500 mb-1">{p.type}</p>
                    <h3 className="font-display text-xl text-bone-50 group-hover:text-clay-200 transition-colors">{p.name}</h3>
                    <p className="mt-1 text-sm font-sans text-bone-200/60">{p.meta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── TAY PICHÍN ── */}
        <section className="bg-bone-100">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[400px] lg:min-h-[560px] overflow-hidden">
              <Image
                src="/img/taypichin/1.jpg"
                alt="Tay Pichín — Ecoescuela y Ecohostel en San Marcos Sierras"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700">
                Tay Pichín · San Marcos Sierras, Córdoba
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Un lugar donde<br />todo esto <em>vive.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed max-w-md">
                La sede física de Arte y Tierra. Un espacio construido con tierra, madera y piedra
                donde se enseña, se construye, se hospeda y se aprende juntos.
              </p>
              <ul className="flex flex-col gap-4">
                {[
                  { label: 'Ecoescuela', desc: 'Cursos intensivos de bioarquitectura y diseño del agua.', href: '/cursos' },
                  { label: 'Ecohostel',  desc: 'Alojamiento en arquitectura de tierra.', href: '/hospedaje' },
                  { label: 'Inmersión Viva', desc: '15 o 30 días en práctica permacultural.', href: '/cursos' },
                ].map(item => (
                  <li key={item.label} className="flex gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-clay-700 flex-shrink-0" />
                    <div>
                      <Link
                        href={item.href}
                        className="font-sans font-semibold text-ink-950 hover:text-clay-700 transition-colors"
                      >
                        {item.label} →
                      </Link>
                      <p className="text-sm font-sans text-ink-700 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/tay-pichin"
                className="mt-2 self-start inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-ink-800 transition-colors"
              >
                Conocer Tay Pichín →
              </Link>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIOS ── */}
        <section className="bg-clay-900 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 text-center mb-14">
              Lo que dicen quienes vivieron la experiencia
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIOS.map((t, i) => (
                <div key={i} className="flex flex-col gap-4 p-7 bg-clay-700/20">
                  <p className="font-display text-lg text-bone-100 leading-relaxed italic">{t.quote}</p>
                  <div className="mt-auto">
                    <span className="text-sm font-sans font-semibold text-clay-300">— {t.author}</span>
                    {t.role && (
                      <span className="text-sm font-sans text-clay-500"> · {t.role}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <VideoLightbox />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-bone-50 py-24 px-6 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-5">
            Trabajamos en cualquier parte del mundo
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            ¿Tenés un proyecto<br />en mente?
          </h2>
          <p className="font-sans text-lg text-ink-700 max-w-lg mx-auto mb-8 leading-relaxed">
            Contanos sobre tu terreno, tu idea, tu sueño. Empezá con una asesoría online — 1 hora,
            revisamos todo juntos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/asesorias"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Agendar asesoría
            </Link>
            <Link
              href="/contacto"
              className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              Escribinos
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
