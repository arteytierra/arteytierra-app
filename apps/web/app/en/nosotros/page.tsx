import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Arte y Tierra is an itinerant collective of bioarchitects, designers and educators working from Tay Pichín, Sierras de Córdoba. We design from the territory.',
  alternates: { canonical: '/en/nosotros' },
};

const VALORES = [
  {
    n: '01',
    title: 'Territory as teacher',
    body: 'Every design decision begins with listening — to the land, the water, the wind, the people.',
  },
  {
    n: '02',
    title: 'Building as community act',
    body: 'Construction is not an individual task. We work collectively, sharing knowledge and resources.',
  },
  {
    n: '03',
    title: 'Living materials',
    body: 'Earth, stone, wood, straw and lime. Materials that breathe, regulate and return to the land.',
  },
  {
    n: '04',
    title: 'Regenerative cycles',
    body: 'Water, soil, food and energy as interconnected systems. We design for abundance, not extraction.',
  },
];

const PAISES = ['Argentina', 'France', 'Colombia', 'Peru', 'Bolivia', 'Italy', 'Ecuador'];

export default function NosotrosEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/nosotros/1.jpg"
            alt="Arte y Tierra team"
            fill priority className="object-cover opacity-70" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">About us</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              We design from <em>the place.</em>
            </h1>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-xl leading-relaxed">
              An itinerant collective of bioarchitects, designers and educators. We design, build, teach and learn — from the territory.
            </p>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Who we are</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              An itinerant <em>collective.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Arte y Tierra is an itinerant collective of bioarchitects, permaculture designers, educators and builders. We are based at Tay Pichín, our living territory in the Sierras de Córdoba, Argentina — but our work extends to wherever there are people who want to build in harmony with the land.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              We work from the paradigm of Sumaq Kawsay — the Good Life — integrating ancestral wisdom with contemporary design tools. Our approach is holistic: we listen before designing, we design before building, we build with and for the community.
            </p>
          </div>
        </section>

        {/* JONATAN */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src="/img/nosotros/jonatan.jpg" alt="Jonatan Palma — Arte y Tierra" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Founder</p>
              <h2 className="font-display text-4xl text-bone-50 mb-2">Jonatan Palma</h2>
              <p className="font-sans text-sm text-clay-300 italic mb-6">Bioarchitect · Permaculture Designer · Educator</p>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-4">
                Born in the city, called by the land. Jonatan studied architecture and then undertook a long journey through natural building, permaculture and sustainable design — learning by doing on real building sites across Latin America and Europe.
              </p>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-4">
                He co-founded Tay Pichín as a living laboratory: a space where the community learns, builds and inhabits — integrating bioarchitecture, agroecology and water design.
              </p>
              <p className="font-sans text-base text-bone-200 leading-relaxed">
                He has given training and workshops in 7 countries, touching the lives of over 10,000 people through direct and online education.
              </p>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">What guides us</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Our <em>values.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALORES.map(v => (
                <div key={v.n} className="bg-bone-50 p-8">
                  <p className="font-display text-3xl text-clay-700 mb-4">{v.n}</p>
                  <h3 className="font-display text-2xl text-ink-950 mb-3">{v.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-clay-700 py-14 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: '+10k', label: 'people reached' },
              { n: '+40',  label: 'projects built' },
              { n: '+150', label: 'workshops given' },
              { n: '7',    label: 'countries' },
            ].map(s => (
              <div key={s.n}>
                <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
                <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COUNTRIES */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Where we have worked</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10">
              7 <em>countries.</em>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {PAISES.map(p => (
                <span key={p} className="font-sans text-sm font-bold uppercase tracking-widest text-ink-700 border border-ink-700 px-5 py-3">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* VIDEO MAMM */}
        <section className="bg-bone-100 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Talks & lectures</p>
              <h2 className="font-display text-3xl text-ink-950 mb-2">MAMM Medellín — <em>territory as teacher.</em></h2>
              <p className="font-sans text-sm text-ink-700/70 italic">Museum of Modern Art · Medellín, Colombia · (in Spanish)</p>
            </div>
            <div className="relative aspect-video bg-ink-950 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/o2iHQNweKr8"
                title="Jonatan Palma at MAMM Medellín"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* VIDEO INTERVIEW */}
        <section className="bg-bone-50 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Who we are</p>
              <h2 className="font-display text-3xl text-ink-950">A conversation about <em>inhabiting the earth.</em></h2>
              <p className="mt-2 font-sans text-sm text-ink-700/70 italic">(in Spanish)</p>
            </div>
            <div className="relative aspect-video bg-ink-950 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/EYS4kz0ZPYE?start=809"
                title="Interview with Jonatan Palma — Arte y Tierra"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Come <em>build with us.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Share your project or come live the experience at Tay Pichín.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/en/contacto" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
              Write to us →
            </Link>
            <Link href="/en/tay-pichin" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              Discover Tay Pichín
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
