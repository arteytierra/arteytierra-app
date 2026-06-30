import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Tay Pichín — Permaculture EcoSchool & EcoHostel',
  description: 'Tay Pichín is the living territory of Arte y Tierra: permaculture ecoschool, earthen architecture ecohostel and experiential workshops. San Marcos Sierras, Córdoba, Argentina.',
  alternates: { canonical: '/en/tay-pichin' },
};

export default function TayPichinEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-ink-950 flex items-end">
          <Image
            src="/img/taypichin/carousel/1.jpg"
            alt="Tay Pichín — Permaculture EcoSchool"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16 md:pb-24">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-5">
              San Marcos Sierras · Córdoba · Argentina
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight max-w-3xl">
              Tay <em>Pichín.</em>
            </h1>
            <p className="mt-5 text-bone-200 font-sans text-lg md:text-xl max-w-xl leading-relaxed">
              A living territory. EcoSchool, EcoHostel and space for learning through practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/en/cursos" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Upcoming workshops →
              </Link>
              <Link href="/en/hospedaje" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors">
                Stay with us →
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">What is Tay Pichín?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              A place where <em>life teaches.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Tay Pichín is the physical home of Arte y Tierra — a living, productive and educational space. Located in the Sierras of Córdoba, it is a territory built with earth, wood and stone where we teach, build, host and learn together.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              It is at once an experiential learning space, a regenerative demonstration site, a place to stay and a community. Everything that happens here is part of the same system: construction, food production, water management and daily life.
            </p>
          </div>
        </section>

        {/* HOW WE LIVE */}
        <section className="bg-clay-900 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🌧️',
                  text: "Every drop of water is cared for. We apply hydrological design: rainwater harvesting, infiltration through terraces and swales, greywater phytoremediation and dry toilets.",
                },
                {
                  icon: '🌱',
                  text: 'We grow food in agroecosystems that cooperate with the native forest. We produce edible mushrooms and raise laying hens.',
                },
                {
                  icon: '♻️',
                  text: "We sort waste, make compost and eco-bricks: nothing is lost. We regenerate water and soil cycles.",
                },
              ].map((item, i) => (
                <div key={i} className="p-8 bg-clay-700/20 text-center">
                  <div className="text-4xl mb-5">{item.icon}</div>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center font-display text-lg text-bone-100 italic max-w-2xl mx-auto leading-relaxed">
              A space where we cultivate the consciousness of daily inhabiting — learning by doing and sharing from the heart.
            </p>
          </div>
        </section>

        {/* ECOSCHOOL */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src="/img/taypichin/carousel/3.jpg" alt="EcoSchool Tay Pichín" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">EcoSchool</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
                Learning by <em>building.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
                The EcoSchool is the educational heart of Tay Pichín. Intensive workshops in bioarchitecture, water design and agroecology — on a real building site, with real materials, in a real living context.
              </p>
              <Link href="/en/cursos" className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                See upcoming workshops →
              </Link>
            </div>
          </div>
        </section>

        {/* ECOHOSTEL */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">EcoHostel</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-6 leading-tight">
                Sleeping in <em>earth architecture.</em>
              </h2>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-4">
                Rooms and camping areas built with earth, wood and natural materials. A living, breathing space where you experience the difference between concrete and a wall that breathes.
              </p>
              <p className="font-sans text-sm text-bone-300/70 mb-2">Score 7.5 · Booking.com</p>
              <div className="flex flex-wrap gap-4 mt-6">
                <a
                  href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.en.html"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
                >
                  Book on Booking.com →
                </a>
                <a
                  href="https://www.airbnb.com.ar/rooms/1346556039732742474"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex border border-bone-50/40 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors"
                >
                  Airbnb →
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden order-1 md:order-2">
              <Image src="/img/taypichin/carousel/2.jpg" alt="EcoHostel Tay Pichín" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
          </div>
        </section>

        {/* LIVING IMMERSION */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src="/img/taypichin/carousel/5.jpg" alt="Living Immersion at Tay Pichín" fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Living Immersion</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
                Live and learn <em>from within.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed mb-4">
                Stay 1 week, 15 or 30 days at Tay Pichín and participate in the daily life of the territory: building, growing, cooking and learning together.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Camping', price: '$35,000 ARS/week' },
                  { label: 'Shared room', price: '$50,000 ARS/week' },
                ].map(p => (
                  <div key={p.label} className="bg-bone-50 p-5">
                    <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-2">{p.label}</p>
                    <p className="font-display text-xl text-ink-950">{p.price}</p>
                  </div>
                ))}
              </div>
              <Link href="/en/cursos/inmersion-viva" className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Learn more →
              </Link>
            </div>
          </div>
        </section>

        {/* VIDEO BARROFEST */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Events · Barrofest</p>
              <h2 className="font-display text-3xl text-bone-50">A natural building <em>festival.</em></h2>
              <p className="mt-2 font-sans text-sm text-bone-300/70">Mini-documentary of the first Barrofest at Tay Pichín. (in Spanish)</p>
            </div>
            <div className="relative aspect-video bg-ink-800 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/Kk8TfOtih2s"
                title="Barrofest — natural building festival at Tay Pichín"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">How to get here</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            San Marcos <em>Sierras.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Located in San Marcos Sierras, Córdoba Province, Argentina. 3 hours from Córdoba Capital by bus or car.
          </p>
          <a
            href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20visit%20Tay%20Pich%C3%ADn"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            Write to us on WhatsApp →
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
