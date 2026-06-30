import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'EcoHostel Tay Pichín — Accommodation in Earth Architecture',
  description: 'Stay at EcoHostel Tay Pichín: rooms and camping built with natural materials. San Marcos Sierras, Córdoba, Argentina. Score 7.5 on Booking.com.',
  alternates: { canonical: '/en/hospedaje' },
};

const PRECIOS = [
  { tipo: 'Camping', precio: '$8,000', sub: 'ARS / night per person' },
  { tipo: 'Shared dorm', precio: '$15,000', sub: 'ARS / night per person' },
  { tipo: 'Double room', precio: '$35,000', sub: 'ARS / night for 2', featured: true },
  { tipo: 'Triple room', precio: '$45,000', sub: 'ARS / night for 3' },
  { tipo: 'Weekly camping', precio: '$45,000', sub: 'ARS / week per person' },
  { tipo: 'Weekly room', precio: '$85,000', sub: 'ARS / week per person' },
];

const AMENITIES = [
  { icon: '🍳', text: 'Shared communal kitchen' },
  { icon: '🌿', text: 'Organic vegetable garden' },
  { icon: '🔥', text: 'Wood-fired oven and grill' },
  { icon: '🚿', text: 'Hot water showers' },
  { icon: '📶', text: 'Wi-Fi in common areas' },
  { icon: '🐓', text: 'Farm animals' },
  { icon: '📚', text: 'Permaculture library' },
  { icon: '🧘', text: 'Meditation and yoga space' },
];

const RESENAS = [
  {
    text: "An experience that goes beyond accommodation. The space breathes, the food is homemade and Jonatan and the team make you feel part of something larger.",
    author: 'Marie, France',
    score: '9.2',
  },
  {
    text: "Tay Pichín changed the way I see how I want to live. The earthen walls, the garden, the people... I went back three times.",
    author: 'Lucas, Argentina',
    score: '9.5',
  },
  {
    text: "It is a truly special place. You come to rest and end up learning about permaculture and natural building without even realizing it.",
    author: 'Valentina, Colombia',
    score: '8.8',
  },
];

export default function HospedajeEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/carousel/2.jpg"
            alt="EcoHostel Tay Pichín — accommodation in earth architecture"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              EcoHostel · San Marcos Sierras · Córdoba
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Sleep inside <em>earth architecture.</em>
            </h1>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-xl leading-relaxed">
              Rooms and camping spaces built with natural materials. A living experience in permaculture surroundings.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.en.html"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Book on Booking.com →
              </a>
              <a
                href="https://www.airbnb.com.ar/rooms/1346556039732742474"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
              >
                Airbnb →
              </a>
            </div>
          </div>
        </section>

        {/* PRICES */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Rates</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Accommodation <em>options.</em></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
              {PRECIOS.map(p => (
                <div key={p.tipo} className={`p-6 ${p.featured ? 'bg-clay-700' : 'bg-bone-100'}`}>
                  <p className={`font-sans text-xs font-bold uppercase tracking-widest mb-3 ${p.featured ? 'text-clay-300' : 'text-clay-700'}`}>{p.tipo}</p>
                  <p className={`font-display text-3xl ${p.featured ? 'text-bone-50' : 'text-ink-950'}`}>{p.precio}</p>
                  <p className={`font-sans text-xs mt-1 ${p.featured ? 'text-bone-200/70' : 'text-ink-700/70'}`}>{p.sub}</p>
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-ink-700/60 italic">Rates may vary by season. Contact us to confirm availability.</p>
          </div>
        </section>

        {/* PHOTO GALLERY */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="relative aspect-square overflow-hidden">
                <Image
                  src={`/img/taypichin/carousel/${n}.jpg`}
                  alt={`Tay Pichín ${n}`}
                  fill className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:768px) 50vw,25vw"
                />
              </div>
            ))}
          </div>
        </section>

        {/* AMENITIES */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">What is included</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Amenities.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {AMENITIES.map(a => (
                <div key={a.text} className="flex items-start gap-3 bg-bone-50 p-5">
                  <span className="text-2xl flex-shrink-0">{a.icon}</span>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">What guests say</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Reviews.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RESENAS.map(r => (
                <div key={r.author} className="bg-bone-100 p-8">
                  <p className="font-display text-4xl text-clay-700 mb-4">{r.score}</p>
                  <p className="font-sans text-sm text-ink-700 italic leading-relaxed mb-5">{r.text}</p>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-ink-950">{r.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Come live <em>Tay Pichín.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Write to us to confirm availability or check current rates.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20book%20accommodation%20at%20Tay%20Pich%C3%ADn"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Write on WhatsApp →
            </a>
            <Link href="/en/tay-pichin" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              About Tay Pichín
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
