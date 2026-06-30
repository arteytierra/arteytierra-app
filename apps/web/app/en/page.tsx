import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: 'Arte y Tierra — Ecosystemic Territory Design' },
  description: 'Bioarchitecture, regenerative hydrology and experiential learning. Itinerant collective based in Tay Pichín, Sierras de Córdoba, Argentina.',
  alternates: { canonical: '/en' },
};

const SERVICIOS = [
  {
    num: '01',
    title: "Bioarchitecture & habitat design",
    body: "We build with earth, wood, stone and straw. Spaces that don't interrupt the landscape — they belong to it.",
    href: '/en/diseno',
    img: '/img/home/lo-que-hacemos/1.jpg',
    alt: 'Bioarchitecture — natural construction',
  },
  {
    num: '02',
    title: 'Regenerative hydrology',
    body: "Water isn't a resource to manage — it's a living system we can care for. We design so it starts flowing again.",
    href: '/en/diseno',
    img: '/img/home/lo-que-hacemos/2.jpg',
    alt: "Regenerative hydrology — water design",
  },
  {
    num: '03',
    title: 'Experiential workshops',
    body: 'Learning on a collective building site. At Tay Pichín or on your own land — anywhere in the world.',
    href: '/en/cursos',
    img: '/img/home/lo-que-hacemos/3.jpg',
    alt: 'Experiential biobuilding workshops',
  },
];

const PROYECTOS = [
  { slug: 'armonia',          name: 'Proyecto Armonía',    type: 'Bioarchitecture + Hydrology', img: '/img/proyectos/armonia/1.jpg',          meta: 'Capilla del Monte · 2025' },
  { slug: 'alihuen',          name: 'Casa Alihuen',         type: 'Bioarchitecture',              img: '/img/proyectos/alihuen/12.jpg',         meta: 'Santa Isabel · 2024' },
  { slug: 'sol',              name: 'Casa del Sol',          type: 'Bioarchitecture',              img: '/img/proyectos/sol/1.jpg',              meta: 'Santa Isabel · 2023' },
  { slug: 'chelo',            name: 'La Casa del Chelo',     type: 'Bioarchitecture',              img: '/img/proyectos/chelo/1.jpg',            meta: 'María Juana, Santa Fé · 2019' },
  { slug: 'aurea',            name: 'Casa Aurea',            type: 'Bioarchitecture',              img: '/img/proyectos/aurea/1.jpg',            meta: 'San Marcos Sierras · 2022–2026' },
  { slug: 'sum-arbol-piedra', name: 'SUM Árbol de Piedra',   type: 'Bioarchitecture',              img: '/img/proyectos/sum-arbol-piedra/1.jpg', meta: 'Córdoba' },
];

const STATS = [
  { n: '+10k', label: 'people reached' },
  { n: '+40',  label: 'projects built' },
  { n: '+150', label: 'workshops given' },
  { n: '7',    label: 'countries' },
];

const TESTIMONIOS = [
  {
    quote: "« I arrived at Tay Pichín thinking I'd learn to build. I left knowing how to listen to the water, the land and those who live in it. »",
    author: 'Sofía',
    role: 'biobuilding workshop participant',
  },
  {
    quote: "« The training changed the way I look at dwelling. It's not just technique — it's a way of being in the world. »",
    author: 'Diego',
    role: 'integral training participant',
  },
  {
    quote: "« Working with Jonatan and the team means finding people who design from the place — not from a catalogue. Every decision was born from the territory. »",
    author: 'Franco Colavita',
    role: 'client',
  },
];

export default function EnHomePage() {
  return (
    <>
      <SiteHeader locale="en" />

      <main>
        {/* HERO */}
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-ink-950 flex items-end">
          <Image
            src="/img/proyectos/portada/1.jpg"
            alt="Arte y Tierra — ecosystemic territory design"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-ink-950/10" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16 md:pb-24">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-5">
              Arte y Tierra · Ecosystemic Territory Design
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight max-w-3xl">
              We design territory<br />
              as a <em>living system.</em>
            </h1>
            <p className="mt-5 text-bone-200 font-sans text-lg md:text-xl max-w-xl leading-relaxed">
              Bioarchitecture, Agroecology and Hydrological Design.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/en/asesorias" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Book a consultation
              </Link>
              <Link href="/en/proyectos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors">
                See projects →
              </Link>
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="bg-ink-950 py-24 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-display text-2xl md:text-3xl text-bone-100 leading-relaxed italic">
              We support the design of habitats that express a more{' '}
              <strong className="not-italic text-clay-300">conscious, loving and regenerative</strong>{' '}
              way of inhabiting the planet.
            </p>
            <p className="mt-8 font-sans text-bone-200 text-lg leading-relaxed">
              We weave connections between people, territories and intentions. We listen to the landscape,
              the water, those who inhabit it and those who dream of building a new life there.
            </p>
            <p className="mt-6 font-sans text-bone-200 text-base leading-relaxed">
              We work from the paradigm of{' '}
              <strong className="text-bone-100">Sumaq Kawsay</strong> — the Good Life.
            </p>
          </div>
        </section>

        {/* STATS */}
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

        {/* WHAT WE DO */}
        <section className="bg-bone-50 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-3">What we do</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                How we transform<br />the <em>territory.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SERVICIOS.map(s => (
                <div key={s.num} className="flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden mb-6">
                    <Image src={s.img} alt={s.alt} fill className="object-cover" sizes="(max-width:768px) 100vw,33vw" />
                  </div>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-3">{s.num}</p>
                  <h3 className="font-display text-2xl text-ink-950 mb-3">{s.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed mb-5 flex-1">{s.body}</p>
                  <Link href={s.href} className="font-sans text-sm font-bold uppercase tracking-widest text-clay-700 hover:text-clay-900 transition-colors">
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="bg-ink-950 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Portfolio</p>
                <h2 className="font-display text-4xl md:text-5xl text-bone-50">Our <em>projects.</em></h2>
              </div>
              <Link href="/en/proyectos" className="font-sans text-sm font-bold uppercase tracking-widest text-clay-500 hover:text-bone-50 transition-colors">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PROYECTOS.map(p => (
                <Link key={p.slug} href={`/proyectos/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden mb-3">
                    <Image src={p.img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 50vw,33vw" />
                  </div>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-500 mb-1">{p.type}</p>
                  <p className="font-display text-base text-bone-100">{p.name}</p>
                  <p className="font-sans text-xs text-bone-300/60">{p.meta}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TAY PICHÍN */}
        <section className="bg-bone-100 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src="/img/taypichin/carousel/1.jpg" alt="Tay Pichín — Permaculture EcoSchool" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Tay Pichín</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
                A living <em>territory.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed max-w-md">
                The physical home of Arte y Tierra. A space built with earth, wood and stone where we teach,
                build, host and learn together.
              </p>
              <ul className="flex flex-col gap-4 mt-6">
                {[
                  { label: 'EcoSchool', desc: "Intensive bioarchitecture and water design workshops.", href: '/en/cursos' },
                  { label: 'EcoHostel', desc: 'Accommodation in earth architecture.', href: '/en/hospedaje' },
                  { label: 'Living Immersion', desc: '15 or 30 days in permaculture practice.', href: '/en/cursos' },
                ].map(item => (
                  <li key={item.label} className="flex gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-clay-700 flex-shrink-0" />
                    <div>
                      <Link href={item.href} className="font-sans font-semibold text-ink-950 hover:text-clay-700 transition-colors">
                        {item.label} →
                      </Link>
                      <p className="font-sans text-sm text-ink-700">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/en/tay-pichin" className="mt-8 inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Discover Tay Pichín →
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Testimonials</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">What they <em>say.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIOS.map(t => (
                <div key={t.author} className="flex flex-col">
                  <p className="font-display text-lg text-ink-950 italic leading-relaxed flex-1">{t.quote}</p>
                  <div className="mt-6 pt-6 border-t border-ink-200">
                    <p className="font-sans font-bold text-sm text-ink-950">{t.author}</p>
                    <p className="font-sans text-xs text-ink-700/70">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-clay-700 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Let&apos;s work <em>together.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Share your project with us. We design from the place, listening to the territory and the people who inhabit it.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/en/contacto" className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors">
              Write to us →
            </Link>
            <Link href="/en/asesorias" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              Book a consultation
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
