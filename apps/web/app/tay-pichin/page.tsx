import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Tay Pichín — Ecoescuela y Ecohostel | Arte y Tierra',
  description: 'Tay Pichín: ecoescuela y ecohostel en San Marcos Sierras, Córdoba. Sede física de Arte y Tierra. Talleres, hospedaje en arquitectura de tierra y voluntariado.',
  alternates: { canonical: '/tay-pichin' },
};

const CAROUSEL = [
  '/img/taypichin/carousel/1.jpg',
  '/img/taypichin/carousel/2.jpg',
  '/img/taypichin/carousel/3.jpg',
  '/img/taypichin/carousel/4.jpg',
  '/img/taypichin/carousel/5.jpg',
  '/img/taypichin/carousel/6.jpg',
];

const PRINCIPIOS = [
  {
    icon: '🌧️',
    text: 'Cada gota de agua se cuida, cada gesto importa. Aplicamos diseño hidrológico: captamos aguas de lluvia, infiltramos con terrazas y zanjas, hacemos fitotratamiento de aguas grises y usamos baños secos que transforman residuos en tierra fértil.',
  },
  {
    icon: '🌱',
    text: 'Cultivamos alimentos en agroecosistemas que cooperan con el monte nativo. Producimos hongos comestibles y criamos gallinas ponedoras.',
  },
  {
    icon: '♻️',
    text: 'Separamos residuos, hacemos compost y ecoladrillos: nada se desperdicia. Regeneramos los ciclos del agua y la tierra.',
  },
];

export default function TayPichinPage() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[540px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/taypichin/carousel/1.jpg"
          alt="Tay Pichín — Ecoescuela y Ecohostel"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/35 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            San Marcos Sierras · Córdoba · Argentina
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-bone-50 leading-tight max-w-3xl mb-6">
            Tay Pichín.<br />La <em>raíz</em> de todo.
          </h1>
          <p className="font-sans text-base md:text-lg text-bone-200 max-w-2xl leading-relaxed mb-10">
            <strong className="text-bone-50">Tay Pichín Vive y Late.</strong> Un espacio donde no solo te hospedás: te reencontrás. Con vos, con la Tierra, con otras formas posibles de vivir. Dormís en construcciones de barro, comés lo que brota del monte y la huerta, nadás en una biopiscina que regenera.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#ecohostel"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
            >
              Reservar estadía →
            </a>
            <a
              href="#ecoescuela"
              className="inline-flex border border-bone-50/40 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors"
            >
              Ver cursos
            </a>
          </div>
        </div>
      </section>

      {/* MANIFESTO DARK */}
      <section className="bg-ink-950 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-2xl md:text-3xl text-bone-100 leading-relaxed">
            Tay Pichín es la <strong className="text-clay-300">sede física</strong> de Arte y Tierra.
            Ecoescuela, ecohostel y espacio de encuentro para quienes quieren{' '}
            <em>aprender haciendo.</em>
          </p>
        </div>
      </section>

      {/* PRINCIPIOS DE HABITAR */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {PRINCIPIOS.map((p, i) => (
              <div key={i} className="bg-ink-950/30 p-8">
                <div className="text-4xl mb-5">{p.icon}</div>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center font-sans text-base text-bone-200 leading-relaxed italic max-w-2xl mx-auto">
            Tay Pichín — ecoescuela y ecohostel — es un espacio donde se cultiva la conciencia del habitar diario, se aprende haciendo y se comparte desde el corazón.
          </p>
        </div>
      </section>

      {/* ECOESCUELA */}
      <section id="ecoescuela" className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">— Ecoescuela</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
              Aprendé con <em>técnica, teoría y práctica.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-8">
              Talleres, cursos y formaciones vivenciales en bioconstrucción y diseño del territorio. Aprendizaje con proyectos reales, en un espacio construido con las mismas técnicas que enseñamos. Desde talleres cortos de fin de semana hasta programas intensivos donde se atraviesan todas las etapas de una obra real de hidrología o bioconstrucción.
            </p>
            <Link
              href="/cursos"
              className="inline-flex border-2 border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              Ver cursos abiertos →
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/img/taypichin/1.jpg"
              alt="Ecoescuela Tay Pichín"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ECOHOSTEL */}
      <section id="ecohostel" className="bg-clay-900 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Galería */}
          <div className="grid grid-cols-2 gap-2">
            {CAROUSEL.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={src}
                  alt={`Ecohostel Tay Pichín — foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>

          {/* Contenido */}
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">— Ecohostel</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-6 leading-tight">
              Dormir dentro de la <em>tierra.</em>
            </h2>
            <p className="font-sans text-base text-bone-200 leading-relaxed mb-8">
              Alojamiento en arquitectura de tierra y hábitat regenerativo. Para quienes buscan descansar en un espacio vivo, construido con intención y en armonía con el entorno. Acá podés observar, aprender o participar de prácticas como bioconstrucción, agroecología, cuidado del agua y vida comunitaria.
            </p>

            {/* Badge Booking */}
            <div className="inline-flex items-center gap-3 bg-bone-50/10 px-4 py-3 mb-8">
              <div className="bg-clay-500 text-ink-950 font-sans font-black text-lg px-3 py-1 leading-none">
                7,5
              </div>
              <div>
                <p className="font-sans font-bold text-bone-100 text-sm">Booking.com</p>
                <p className="font-sans text-bone-200 text-xs">59 reseñas verificadas</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.es.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
              >
                Reservar en Booking →
              </a>
              <a
                href="https://www.airbnb.com.ar/rooms/1346556039732742474"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center border border-bone-200 text-bone-100 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-bone-50/10 transition-colors"
              >
                Reservar en Airbnb →
              </a>
              <a
                href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20reservar%20en%20Tay%20Pich%C3%ADn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center border border-bone-200/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-bone-50/10 transition-colors"
              >
                WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INMERSIÓN VIVA */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">— Inmersión Viva</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
              Inmersión <em>Viva.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed max-w-2xl mx-auto">
              Períodos formativos en prácticas permaculturales. Bioconstrucción, agroecología y organización colectiva — aprendidas en la práctica diaria. Durante tu estadía participás de procesos reales, integrándote a una forma de habitar más consciente, simple y conectada con la tierra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            {/* Proceso Inicial */}
            <div className="bg-ink-950 p-10 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-6">Proceso Inicial</p>
              <hr className="border-clay-700/40 mb-6" />
              <p className="font-sans text-sm text-bone-200 leading-relaxed mb-5">
                <strong className="text-bone-50">Camping</strong> — alimentación básica y alojamiento en zona de camping.
              </p>
              <p className="font-display text-3xl text-clay-500">$35.000 ARS<span className="text-xl"> / sem</span></p>
            </div>

            {/* Proceso Profundo */}
            <div className="bg-clay-700 p-10 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-6">Proceso Profundo</p>
              <hr className="border-clay-500/40 mb-6" />
              <p className="font-sans text-sm text-bone-200 leading-relaxed mb-5">
                <strong className="text-bone-50">Habitación compartida</strong> — alimentación básica y habitación compartida.
              </p>
              <p className="font-display text-3xl text-clay-300">$50.000 ARS<span className="text-xl"> / sem</span></p>
            </div>
          </div>

          <p className="text-center font-sans text-sm text-clay-700 font-bold tracking-wide mb-8">
            📅 El ingreso es solo los lunes.
          </p>

          <div className="text-center">
            <Link
              href="/cursos/inmersion-viva"
              className="inline-flex border-2 border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              Conocer Inmersión Viva →
            </Link>
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Ubicación</p>
              <h2 className="font-display text-4xl text-bone-50 mb-6">
                Cómo llegar a <em>Tay Pichín.</em>
              </h2>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-4">
                San Marcos Sierras, Provincia de Córdoba, Argentina.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                <li className="flex items-start gap-3 font-sans text-sm text-bone-200">
                  <span className="text-clay-500 font-bold flex-shrink-0 mt-0.5">→</span>
                  A 2 horas de la Ciudad de Córdoba
                </li>
                <li className="flex items-start gap-3 font-sans text-sm text-bone-200">
                  <span className="text-clay-500 font-bold flex-shrink-0 mt-0.5">→</span>
                  A 12 horas de Buenos Aires
                </li>
                <li className="flex items-start gap-3 font-sans text-sm text-bone-200">
                  <span className="text-clay-500 font-bold flex-shrink-0 mt-0.5">→</span>
                  Acceso por Ruta Provincial 17 · San Marcos Sierras
                </li>
              </ul>
              <a
                href="https://maps.google.com/?q=San+Marcos+Sierras+Cordoba+Argentina"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
              >
                Ver en Google Maps →
              </a>
            </div>

            {/* Mini galería */}
            <div className="grid grid-cols-2 gap-2">
              {['/img/taypichin/carousel/7.jpg', '/img/taypichin/carousel/8.jpg', '/img/taypichin/carousel/9.jpg', '/img/taypichin/2.jpg'].map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden">
                  <Image
                    src={src}
                    alt={`Tay Pichín — foto ${i + 7}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-clay-100 py-20 px-6 text-center border-t border-clay-200">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">¿Cuándo te recibimos?</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
          Talleres, hospedaje,<br /><em>Inmersión Viva.</em>
        </h2>
        <p className="font-sans text-base text-ink-700 max-w-md mx-auto leading-relaxed mb-8">
          Escribinos y coordinamos tu visita, tu estadía o tu participación en la próxima formación.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Tay%20Pich%C3%ADn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            WhatsApp →
          </a>
          <Link
            href="/cursos"
            className="inline-flex border-2 border-clay-700 text-clay-700 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-200 transition-colors"
          >
            Ver cursos →
          </Link>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
