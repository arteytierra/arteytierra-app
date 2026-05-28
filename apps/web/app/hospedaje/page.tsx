import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Ecohostel Tay Pichín — Hospedaje en San Marcos Sierras',
  description: 'Dormí en una casa de tierra viva. Habitaciones compartidas y privadas en plena naturaleza serrana. Reservá por Booking, Airbnb o directamente con nosotros.',
  alternates: { canonical: '/hospedaje' },
};

const AIRBNB_URL = 'https://www.airbnb.com.ar/rooms/1346556039732742474';
const BOOKING_URL = 'https://www.booking.com/hotel/ar/ecohostel-tay-pichin.es-ar.html';
const WA_URL = 'https://wa.me/5493549431594?text=Hola%21%20Quiero%20consultar%20por%20hospedaje%20en%20Tay%20Pichín.';

const PRECIOS = [
  { tipo: 'Cama en dormitorio compartido', precio: '$17.000', detalle: 'por noche · mixto', icon: '◈' },
  { tipo: 'Habitación privada · 1 persona', precio: '$35.000', detalle: 'por noche', icon: '◉' },
  { tipo: 'Habitación privada · 2 personas', precio: '$45.000', detalle: 'por noche', icon: '◉' },
  { tipo: 'Habitación privada · 3 personas', precio: '$55.000', detalle: 'por noche', icon: '◉' },
  { tipo: 'Habitación privada · 4 personas', precio: '$65.000', detalle: 'por noche', icon: '◉' },
  { tipo: 'Alquiler mensual · hab. compartida', precio: '$200.000', detalle: 'por mes', icon: '◈' },
];

const GALERIA = [
  { src: '/img/taypichin/carousel/6.jpg',  alt: 'Salón comedor — Ecohostel Tay Pichín',        span: 'col-span-2 row-span-2' },
  { src: '/img/taypichin/carousel/8.jpg',  alt: 'Habitación con cama doble y litera',          span: 'col-span-1 row-span-1' },
  { src: '/img/taypichin/carousel/10.jpg', alt: 'Habitación con literas y piso de piedra',      span: 'col-span-1 row-span-1' },
  { src: '/img/taypichin/carousel/9.jpg',  alt: 'Cocina compartida — ventana circular verde',   span: 'col-span-1 row-span-2' },
  { src: '/img/taypichin/carousel/7.jpg',  alt: 'Living con mural y sillones',                  span: 'col-span-1 row-span-1' },
  { src: '/img/taypichin/carousel/11.jpg', alt: 'Desayuno en la galería exterior',              span: 'col-span-1 row-span-1' },
  { src: '/img/taypichin/carousel/4.jpg',  alt: 'Estanque de biofiltración y jardín',           span: 'col-span-1 row-span-1' },
];

const AMENITIES = [
  { label: 'Cocina equipada compartida', desc: 'Gas, heladera, utensilios. Podés cocinar libremente.' },
  { label: 'Desayuno al aire libre', desc: 'Con productos de la huerta y el gallinero del predio.' },
  { label: 'Ecopiscina natural', desc: 'Estanque de biofiltración integrado al jardín.' },
  { label: 'Agua caliente solar', desc: 'Termotanque solar y biofiltro de aguas grises.' },
  { label: 'Baño seco', desc: 'Sistema de compostaje sin químicos. Un paso más en autonomía.' },
  { label: 'WiFi', desc: 'Conexión disponible en los espacios comunes.' },
  { label: 'Huerta y jardín', desc: 'Rodeado de naturaleza, frutas y plantas medicinales.' },
  { label: 'Espacios comunes con mural', desc: 'Living, salón-comedor y galería exterior con vistas.' },
];

const RESENAS = [
  {
    plataforma: 'Google',
    autor: 'Marian Encinar',
    pais: 'España',
    puntos: 5,
    texto: 'Un lugar ideal para hospedarse si lo que buscas es tranquilidad y un ambiente agradable. El proyecto es muy interesante, se nota mucho que está hecho con cariño. Cocina totalmente equipada, ecopiscina y varios rincones en los que se está muy a gusto. Mi pareja y yo nos quedamos 9 días y se nos hicieron cortos. Sin duda repetiremos.',
    highlight: 'Vista increíble · Tranquilo · Buen precio',
  },
  {
    plataforma: 'Booking',
    autor: 'Pía',
    pais: 'Alemania',
    puntos: 10,
    texto: 'El lugar es muy encantador. Tiene unas vistas hermosas, es muy verde y todo pensado con el bienestar de la tierra en mente. Joni y la voluntariada son muy amables y me sentí como en casa.',
    highlight: 'Habitación Triple · 1 noche · abril 2026',
  },
  {
    plataforma: 'Airbnb',
    autor: 'Sergio',
    pais: 'Argentina',
    puntos: 5,
    texto: 'Un lugar hermoso y tranquilo. Jonatan y sus colaboradores espectaculares. Ojalá todos copiáramos sus formas de cuidar el ambiente y reciclar. Nunca había usado baño seco y me adapté sin problema. Pasé muy bien, muy agradecido por la experiencia.',
    highlight: 'Estadía de algunas noches · julio 2025',
  },
  {
    plataforma: 'Booking',
    autor: 'Diego',
    pais: 'Argentina',
    puntos: 10,
    texto: 'Me gustó mucho la tranquilidad que hay en el hostel y la buena atención que tienen. Hay muchos espacios para descansar y relajarte en contacto con la naturaleza. Me encanta su acción ecológica respecto al manejo de las aguas, tratamiento de residuos, compostaje y construcciones naturales.',
    highlight: 'Habitación Compartida · 1 noche · mayo 2026',
  },
  {
    plataforma: 'Google',
    autor: 'Melusina Magicg',
    pais: '',
    puntos: 5,
    texto: 'Hermoso espacio para disfrutar y aprender sobre permacultura, bioconstrucción y nuevas pautas para vivir mejor en relación con la naturaleza.',
    highlight: 'Habitaciones 5/5 · Servicio 5/5 · Ubicación 5/5',
  },
  {
    plataforma: 'Airbnb',
    autor: 'Malu',
    pais: 'Argentina',
    puntos: 5,
    texto: 'Un lugar maravilloso. Con una ubicación espectacular en la naturaleza, pero cerca del centro de la ciudad. Inmediatamente me sentí a gusto. Un lugar encantador donde se reúne gente excelente.',
    highlight: 'Estadía de una noche',
  },
];

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  const normalized = max === 10 ? Math.round(n / 2) : n;
  return (
    <span className="text-sun-500 text-sm tracking-tight">
      {'★'.repeat(normalized)}{'☆'.repeat(5 - normalized)}
    </span>
  );
}

export default function HospedajePage() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/taypichin/carousel/6.jpg"
          alt="Salón del Ecohostel Tay Pichín — San Marcos Sierras"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            Ecohostel · San Marcos Sierras, Córdoba
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
            Dormís en una<br /><em>casa de tierra viva.</em>
          </h1>
          <p className="mt-5 font-sans text-base text-bone-200 max-w-xl leading-relaxed">
            Habitaciones construidas con adobe, piedra y madera. Jardín con ecopiscina natural, huerta, animales y silencio serrano.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
            >
              Reservar en Booking →
            </a>
            <a
              href={AIRBNB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors"
            >
              Ver en Airbnb →
            </a>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="bg-ink-950 py-3 px-3">
        <div className="max-w-wide mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            { src: '/img/taypichin/carousel/6.jpg',  alt: 'Salón comedor — Ecohostel Tay Pichín' },
            { src: '/img/taypichin/carousel/8.jpg',  alt: 'Habitación con cama doble y litera' },
            { src: '/img/taypichin/carousel/9.jpg',  alt: 'Cocina compartida — ventana circular' },
            { src: '/img/taypichin/carousel/10.jpg', alt: 'Habitación con literas y piso de piedra' },
            { src: '/img/taypichin/carousel/7.jpg',  alt: 'Living con mural y sillones' },
            { src: '/img/taypichin/carousel/11.jpg', alt: 'Desayuno en la galería exterior' },
            { src: '/img/taypichin/carousel/4.jpg',  alt: 'Estanque de biofiltración y jardín' },
            { src: '/img/taypichin/carousel/12.jpg', alt: 'Exterior de Tay Pichín' },
            { src: '/img/taypichin/carousel/13.jpg', alt: 'Espacio exterior serrano' },
            { src: '/img/taypichin/carousel/3.jpg',  alt: 'Vista del predio serrano' },
            { src: '/img/taypichin/carousel/5.jpg',  alt: 'Obra y naturaleza — Tay Pichín' },
            { src: '/img/taypichin/carousel/2.jpg',  alt: 'Galería exterior con sillones' },
          ].map((img) => (
            <div key={img.src} className="relative aspect-square overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* TAY PICHÍN — LA RAÍZ */}
      <section className="bg-ink-950 py-24 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">
              San Marcos Sierras · Córdoba · Argentina
            </p>
            <h2 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight mb-8">
              Tay Pichín.<br /><em>La raíz de todo.</em>
            </h2>
            <p className="font-sans text-bone-200 text-lg leading-relaxed mb-6">
              Tay Pichín vive y late. Un espacio donde no solo te hospedás: te reencontrás. Con vos, con la Tierra, con otras formas posibles de vivir.
            </p>
            <p className="font-sans text-bone-100 text-base leading-relaxed mb-8">
              Dormís en construcciones de barro, comés lo que brota del monte y la huerta, nadás en una biopiscina que regenera. Tay Pichín es la sede física de Arte y Tierra — ecoescuela, ecohostel y espacio de encuentro para quienes quieren aprender haciendo.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Puntaje 9.7/10 en Booking', '★★★★★ en Airbnb', '★★★★★ en Google'].map(b => (
                <span key={b} className="text-xs font-sans font-bold text-clay-200 bg-clay-800/50 border border-clay-600 px-4 py-2 uppercase tracking-wider">
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🌧️', title: 'Agua regenerada', desc: 'Captamos lluvias, infiltramos con zanjas, tratamos aguas grises con fitofiltros y usamos baños secos que transforman residuos en tierra fértil.' },
              { icon: '🌱', title: 'Alimento propio', desc: 'Cultivamos en agroecosistemas que cooperan con el monte nativo. Producimos hongos comestibles y criamos gallinas ponedoras.' },
              { icon: '♻️', title: 'Cero residuos', desc: 'Separamos, compostamos y hacemos ecoladrillos. Nada se desperdicia. Regeneramos los ciclos del agua y la tierra.' },
              { icon: '🏗️', title: 'Bioconstrucción', desc: 'Adobe, quincha, piedra serrana y madera. Cada estructura fue diseñada con bioclimática y geometría sagrada.' },
            ].map(item => (
              <div key={item.title} className="p-5 bg-ink-800 border border-ink-700">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="font-sans font-bold text-sm text-bone-50 mb-2">{item.title}</h4>
                <p className="font-sans text-xs text-bone-200 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIPCIÓN */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">
            El lugar
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
            No es un hotel.<br /><em>Es un ecosistema.</em>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Tay Pichín es la sede física de Arte y Tierra — una ecoescuela y ecohostel construido con tierra, adobe, piedra y madera serrana en las afueras de San Marcos Sierras. Cada rincón fue diseñado con geometría sagrada, bioclimática y manejo del agua.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Cuando te hospedás acá no solo dormís bien — te conectás con un lugar vivo: la huerta produce el desayuno, el estanque filtra las aguas, los murales en barro cuentan historias, y el silencio de las sierras se escucha de noche.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Tay Pichín — eco escuela y eco hostel — es un espacio donde se cultiva la conciencia del habitar diario, se aprende haciendo y se comparte desde el corazón.
            </p>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Tarifas</p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Precios<br /><em>transparentes.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {PRECIOS.map(p => (
              <div key={p.tipo} className="bg-bone-50 border border-bone-200 p-6 flex flex-col gap-3">
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700">{p.icon} {p.detalle}</p>
                <p className="font-sans text-sm text-ink-700 leading-snug">{p.tipo}</p>
                <p className="font-display text-3xl text-ink-950 mt-auto">{p.precio} <span className="text-sm font-sans text-ink-700">ARS</span></p>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-ink-700/70 leading-relaxed">
            Precios en pesos argentinos. Para reservas directas consultanos por WhatsApp. Los precios en Booking y Airbnb pueden variar según fecha y disponibilidad.
          </p>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Incluye</p>
            <h2 className="font-display text-4xl text-bone-50 leading-tight">
              Todo lo que<br /><em>necesitás.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {AMENITIES.map(a => (
              <div key={a.label} className="border-t border-clay-700 pt-5">
                <h4 className="font-sans font-bold text-sm text-bone-100 mb-2">{a.label}</h4>
                <p className="font-sans text-xs text-bone-200 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESERVAR */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 mb-4">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Reservas</p>
            <h2 className="font-display text-4xl text-bone-50 leading-tight">
              Elegí cómo <em>reservar.</em>
            </h2>
          </div>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between bg-[#003580] text-white p-7 hover:opacity-90 transition-opacity"
          >
            <div>
              <p className="font-sans font-bold text-lg mb-2">Booking.com</p>
              <p className="font-sans text-sm opacity-80 leading-relaxed">Reserva inmediata, cancelación flexible según tarifa. Puntaje 9.7/10.</p>
            </div>
            <span className="mt-6 font-sans font-bold text-sm uppercase tracking-widest">Reservar →</span>
          </a>
          <a
            href={AIRBNB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between bg-[#FF5A5F] text-white p-7 hover:opacity-90 transition-opacity"
          >
            <div>
              <p className="font-sans font-bold text-lg mb-2">Airbnb</p>
              <p className="font-sans text-sm opacity-80 leading-relaxed">Reserva con garantía Airbnb. 5 estrellas de huéspedes verificados.</p>
            </div>
            <span className="mt-6 font-sans font-bold text-sm uppercase tracking-widest">Reservar →</span>
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between bg-clay-900 text-bone-50 p-7 hover:bg-ink-950 transition-colors"
          >
            <div>
              <p className="font-sans font-bold text-lg mb-2">Directo por WhatsApp</p>
              <p className="font-sans text-sm text-bone-200 leading-relaxed">Sin intermediarios. Consultá disponibilidad y coordinamos.</p>
            </div>
            <span className="mt-6 font-sans font-bold text-sm uppercase tracking-widest text-clay-300">Escribirnos →</span>
          </a>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Reseñas reales</p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Lo que dicen<br />quienes <em>estuvieron.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESENAS.map((r) => (
              <div key={`${r.autor}-${r.plataforma}`} className="flex flex-col bg-bone-100 border border-bone-200 p-6 gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-sans font-bold text-sm text-ink-950">{r.autor}</p>
                    {r.pais && <p className="font-sans text-xs text-ink-700 mt-0.5">{r.pais}</p>}
                  </div>
                  <span className="text-xs font-sans font-bold text-clay-700 bg-clay-100 border border-clay-200 px-2 py-1 flex-shrink-0 whitespace-nowrap">
                    {r.plataforma}
                  </span>
                </div>
                <Stars n={r.puntos} max={r.plataforma === 'Booking' ? 10 : 5} />
                <p className="font-sans text-sm text-ink-700 leading-relaxed flex-1">
                  &ldquo;{r.texto}&rdquo;
                </p>
                <p className="font-sans text-xs text-clay-700 mt-auto">{r.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="bg-clay-900 py-16 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Cómo llegar</p>
            <h2 className="font-display text-4xl text-bone-50 mb-5 leading-tight">
              San Marcos Sierras,<br /><em>Córdoba.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
              Estamos en el Barrio La Loma, a 4 cuadras de la plaza principal de San Marcos Sierras. A 150 km de la ciudad de Córdoba, en plena sierra chica.
            </p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              El acceso final tiene una subida de algunos metros. No hay transporte público hasta la puerta — lo más fácil es llegar en auto, remis o coordinar traslado con nosotros.
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex font-sans font-bold text-sm text-clay-300 uppercase tracking-widest hover:text-bone-50 transition-colors"
            >
              Consultar cómo llegar →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { src: '/img/taypichin/carousel/4.jpg',  alt: 'Estanque de biofiltración' },
              { src: '/img/taypichin/carousel/11.jpg', alt: 'Desayuno exterior' },
              { src: '/img/taypichin/carousel/3.jpg',  alt: 'Jardín y casita' },
              { src: '/img/taypichin/carousel/7.jpg',  alt: 'Living con mural' },
            ].map(img => (
              <div key={img.src} className="relative aspect-square overflow-hidden">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bone-50 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
          También podés explorar
        </p>
        <h2 className="font-display text-4xl text-ink-950 mb-5">
          Más que un hospedaje,<br /><em>una experiencia.</em>
        </h2>
        <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
          Si querés quedarte más tiempo, participar en la ecoescuela o hacer una inmersión vivencial, escribinos.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/cursos"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            Ver cursos →
          </Link>
          <Link
            href="/tay-pichin"
            className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
          >
            Conocer Tay Pichín →
          </Link>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
