import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ecoescuela — Arte y Tierra',
  description: 'Cursos y formaciones de bioarquitectura, diseño hidrológico, permacultura y biocosmética. Presenciales en Tay Pichín y online desde cualquier parte del mundo.',
};

/* ─── Course data ────────────────────────────────── */

const PRESENCIALES = [
  {
    slug: 'bioarquitectura',
    badge: 'Intensivo presencial',
    name: 'Bioarquitectura, Construcción y Territorio',
    tag: '18 y 19 de julio 2026 · Tay Pichín',
    desc: 'Dos días de obra real para aprender técnicas ancestrales de bioconstrucción integradas con diseño bioclimático y ecológico. 40% teoría, 60% práctica.',
    img: '/img/cursos/bioarquitectura/1.jpg',
    datos: [
      { label: 'Fechas', val: '18 y 19 de julio · 2026' },
      { label: 'Lugar', val: 'Ecoescuela Tay Pichín, San Marcos Sierras' },
      { label: 'Modalidad', val: '40% teoría · 60% práctica en obra' },
      { label: 'Facilita', val: 'Jonatan Palma' },
    ],
    contenidos: ['Construcción con tierra', 'Diseño bioclimático', 'Quincha, cob y pirca', 'Revoques de tierra y cal', 'Techos vivos', 'Pigmentos naturales', 'Construcción colectiva'],
    precio: 'USD 100–123',
    precioNote: 'Sin hospedaje / camping / habitación. Incluye materiales + alimentación.',
    href: '/cursos/bioarquitectura',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20al%20Curso%20de%20Bioarquitectura%20(18%20y%2019%20julio)',
  },
  {
    slug: 'cultivo-girgolas',
    badge: 'Taller modular',
    name: 'Cultivo de Gírgolas',
    tag: '11/7 · 1/8 · 22/8 · 2026 · Tay Pichín',
    desc: 'Tres encuentros independientes para aprender todo el proceso: biología del hongo, producción casera y escala productiva. FUNGO × Tay Pichín.',
    img: '/img/cursos/cultivo-girgolas/1.jpg',
    datos: [
      { label: 'Fechas', val: '11 jul · 1 ago · 22 ago 2026' },
      { label: 'Lugar', val: 'Ecoescuela Tay Pichín, San Marcos Sierras' },
      { label: 'Modalidad', val: 'Presencial · módulos independientes' },
      { label: 'Facilita', val: 'FUNGO × Arte y Tierra' },
    ],
    contenidos: ['Biología del hongo y ciclo de vida', 'Producción de micelio e inoculación', 'Sustrato e incubación', 'Autoproducción doméstica', 'Cosecha y conservación'],
    precio: 'Módulo suelto o ciclo completo',
    precioNote: 'Podés tomar uno, dos o los tres encuentros.',
    href: '/cursos/cultivo-girgolas',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20al%20Taller%20de%20Cultivo%20de%20G%C3%ADrgolas',
  },
  {
    slug: 'alquimia-natural',
    badge: 'Ciclo mensual',
    name: 'Alquimia Natural y Limpieza Consciente',
    tag: '3er sábado de cada mes · Mayo–Dic 2026 · Tay Pichín',
    desc: 'Ocho encuentros presenciales para transformar ingredientes simples y nobles en soluciones de higiene que respetan tu salud y el planeta.',
    img: '/img/taypichin/carousel/3.jpg',
    datos: [
      { label: 'Frecuencia', val: 'Tercer sábado de cada mes' },
      { label: 'Lugar', val: 'Ecoescuela Tay Pichín, San Marcos Sierras' },
      { label: 'Modalidad', val: '8 encuentros o módulos sueltos' },
      { label: 'Cupos', val: 'Limitados' },
    ],
    contenidos: ['Jabón con aceite usado', 'Shampú y acondicionador naturales', 'Desodorantes corporales', 'Limpiadores multiuso', 'Dentífrico y enjuague', 'Cosmética básica natural'],
    precio: 'Ciclo completo o sueltos',
    precioNote: 'Consultanos para valores según modalidad.',
    href: '/cursos/alquimia-natural',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20ciclo%20de%20Alquimia%20Natural',
  },
];

const ONLINE = [
  {
    slug: 'vuelta-a-la-tierra',
    badge: '7 semanas · Online en vivo',
    name: 'La Vuelta a la Tierra',
    tag: 'Inicia 12 de octubre 2026',
    desc: 'En 7 semanas te llevás los planos de tu vivienda y el masterplan de tu predio listos para empezar a construir. Bioarquitectura + Permacultura + Diseño Hidrológico.',
    img: '/img/cursos/vueltatierra/7.jpg',
    datos: [
      { label: 'Inicio', val: 'Lunes 12 de octubre 2026' },
      { label: 'Duración', val: '7 semanas · 2 clases en vivo por semana' },
      { label: 'Dedicación', val: '4–6 hs semanales' },
      { label: 'Facilitan', val: 'Jonatan Palma + Fabricio Manzoni' },
    ],
    contenidos: ['Lectura del terreno', 'Diseño de masterplan', 'Implantación bioclimática', 'Sistemas constructivos', 'Manejo del agua', 'Tecnologías apropiadas', 'Autonomía proyectual'],
    precio: 'Consultar',
    precioNote: 'Inscripciones abiertas · cupos limitados.',
    href: '/cursos/vuelta-a-la-tierra',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20de%20La%20Vuelta%20a%20la%20Tierra',
  },
  {
    slug: 'mi-tierra-mi-casa',
    badge: 'Online · Acceso ilimitado',
    name: 'Mi Tierra, Mi Casa',
    tag: 'Disponible · Empezás cuando querés',
    desc: 'Formación en bioconstrucción a tu ritmo. 4 módulos y 18 clases que recorren todas las etapas de una obra natural — de los cimientos al criterio.',
    img: '/img/cursos/mitierramicasa/1.jpg',
    datos: [
      { label: 'Formato', val: 'Video clases grabadas · acceso ilimitado' },
      { label: 'Contenido', val: '4 módulos · 18 clases' },
      { label: 'Duración', val: 'A tu ritmo · sin vencimiento' },
      { label: 'Facilita', val: 'Jonatan Palma' },
    ],
    contenidos: ['Introducción y materiales', 'Cimientos y estructuras', 'Muros: quincha, cob, paja', 'Revoques gruesos y finos', 'Pinturas y relieves', 'Biocosmética del hábitat'],
    precio: 'USD 80',
    precioNote: 'Pago único · acceso permanente.',
    href: '/cursos/mi-tierra-mi-casa',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20a%20Mi%20Tierra%2C%20Mi%20Casa',
  },
  {
    slug: 'tadelakt',
    badge: 'Online en vivo · 3 sesiones',
    name: 'Tadelakt Online',
    tag: 'Próxima edición por confirmar',
    desc: 'El arte marroquí del enlucido en cal: el acabado impermeable, brillante y vivo que transforma baños, cocinas y cualquier superficie en una pieza única.',
    img: '/img/cursos/tadelakt/0.jpg',
    datos: [
      { label: 'Formato', val: '3 sesiones Zoom en vivo · grabadas' },
      { label: 'Duración', val: '3–4 hs por sesión' },
      { label: 'Modalidad', val: '100% online · desde donde estés' },
      { label: 'Facilita', val: 'Jonatan Palma' },
    ],
    contenidos: ['Historia y química de la cal', 'Lectura y preparación del soporte', 'Mortero base y aplicación', 'Manejo de tiempos de fragüe', 'Pulido y bruñido con piedra', 'Pigmentación y sellado'],
    precio: '$90.000 ARS',
    precioNote: 'Incluye grabaciones y material de apoyo.',
    href: '/cursos/tadelakt',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20curso%20de%20Tadelakt%20Online',
  },
];

/* ─── Component ──────────────────────────────────── */

function CourseCard({ c, reverse }: { c: typeof PRESENCIALES[0]; reverse?: boolean }) {
  return (
    <article className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} bg-bone-100 overflow-hidden`}>
      {/* Image */}
      <div className="relative md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[460px] overflow-hidden bg-ink-950 flex-shrink-0">
        <Image
          src={c.img}
          alt={c.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-clay-700 text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5">
            {c.badge}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-5">
        <div>
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-2">{c.tag}</p>
          <h3 className="font-display text-2xl md:text-3xl text-ink-950">{c.name}</h3>
        </div>
        <p className="font-sans text-base text-ink-700 leading-relaxed">{c.desc}</p>

        {/* Datos */}
        <div className="grid grid-cols-2 gap-2">
          {c.datos.map(d => (
            <div key={d.label} className="bg-bone-50 px-3 py-2.5 border-l-2 border-clay-400">
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-600 mb-0.5">{d.label}</p>
              <p className="text-xs font-sans text-ink-800 leading-snug">{d.val}</p>
            </div>
          ))}
        </div>

        {/* Contenidos */}
        <div className="flex flex-wrap gap-1.5">
          {c.contenidos.map(t => (
            <span key={t} className="text-xs font-sans text-clay-700 bg-clay-50 border border-clay-200 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>

        {/* Precio + CTA */}
        <div className="flex flex-col gap-3 pt-2 border-t border-bone-200">
          <div>
            <span className="font-display text-2xl text-ink-950">{c.precio}</span>
            <p className="text-xs font-sans text-ink-500 mt-0.5">{c.precioNote}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={c.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-900 transition-colors"
            >
              Inscribirme →
            </a>
            <Link
              href={c.href}
              className="inline-flex border border-clay-400 text-clay-700 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-50 transition-colors"
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CursosPage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/cursos/cursos/1.jpg"
          alt="Ecoescuela Arte y Tierra — Tay Pichín"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Ecoescuela · Tay Pichín</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
            Aprender haciendo<br />en un <em>espacio vivo.</em>
          </h1>
          <p className="mt-4 text-bone-200 font-sans text-lg max-w-lg">
            Cursos presenciales, online y formaciones intensivas sobre bioconstrucción, diseño del territorio y soberanía personal.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-5">El enfoque</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8">
            El conocimiento<br />vuelve a las <em>manos.</em>
          </h2>
          <p className="font-sans text-bone-300 text-base leading-relaxed mb-4">
            Cada formación parte de una premisa: el aprendizaje verdadero ocurre en la práctica. Trabajamos sobre obras reales, en territorio vivo, con materiales del lugar y técnicas que tienen siglos de sabiduría detrás.
          </p>
          <p className="font-sans text-bone-400 text-base leading-relaxed">
            Formaciones presenciales en Tay Pichín (San Marcos Sierras, Córdoba) y cursos online en vivo para quienes aprenden desde cualquier parte del mundo.
          </p>
        </div>
      </section>

      {/* PRESENCIALES */}
      <section className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto mb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">En Tay Pichín · 2026</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950">
            Formaciones<br /><em>presenciales.</em>
          </h2>
          <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
            San Marcos Sierras, Córdoba. Aprendizaje en obra real, rodeados de naturaleza, en comunidad.
          </p>
        </div>
        <div className="max-w-editorial mx-auto flex flex-col divide-y divide-bone-200">
          {PRESENCIALES.map((c, i) => (
            <CourseCard key={c.slug} c={c} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* INMERSIÓN VIVA */}
      <section className="bg-ink-950">
        <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[600px] overflow-hidden">
            <Image
              src="/img/taypichin/carousel/5.jpg"
              alt="Inmersión Viva — Tay Pichín"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-moss-700 text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5">
                Inmersión · 15 o 30 días
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-400">Experiencia completa</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              Inmersión <em>Viva.</em>
            </h2>
            <p className="font-sans text-bone-300 text-base leading-relaxed">
              Períodos formativos de 15 o 30 días en Tay Pichín. Bioconstrucción, agroecología y organización colectiva aprendidas en la práctica diaria — integradas al trabajo, la convivencia y la vida en territorio.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏗', t: 'Bioconstrucción', d: 'Obra real con tierra y materiales naturales' },
                { icon: '🌱', t: 'Agroecología', d: 'Huerta, suelo y sistemas vivos' },
                { icon: '💧', t: 'Diseño hidrológico', d: 'Lectura del paisaje y el agua' },
                { icon: '🤝', t: 'Comunidad', d: 'Círculos de la palabra y organización' },
              ].map(item => (
                <div key={item.t} className="p-4 bg-ink-800/60 border border-ink-600">
                  <div className="text-lg mb-1">{item.icon}</div>
                  <p className="font-sans font-semibold text-sm text-bone-100">{item.t}</p>
                  <p className="font-sans text-xs text-ink-400 mt-0.5 leading-snug">{item.d}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20de%20la%20Inmersi%C3%B3n%20Viva"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors"
              >
                Consultar →
              </a>
              <Link
                href="/cursos/inmersion-viva"
                className="inline-flex border border-bone-500/40 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:border-bone-200 transition-colors"
              >
                Ver la experiencia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ONLINE */}
      <section className="bg-bone-100 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto mb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Desde donde estés</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950">
            Formaciones<br /><em>online.</em>
          </h2>
          <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
            En vivo o a tu ritmo. Clases grabadas, comunidad de práctica y acompañamiento del equipo.
          </p>
        </div>
        <div className="max-w-editorial mx-auto flex flex-col divide-y divide-bone-200">
          {ONLINE.map((c, i) => (
            <CourseCard key={c.slug} c={c} reverse={i % 2 === 0} />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-clay-700 py-14 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '+150', label: 'talleres dictados' },
            { n: '+10k', label: 'personas formadas' },
            { n: '7', label: 'países' },
            { n: '15+', label: 'años de experiencia' },
          ].map(s => (
            <div key={s.n}>
              <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
              <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bone-50 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
          ¿No sabés qué curso es para vos?
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
          Hablemos antes<br />de <em>decidir.</em>
        </h2>
        <p className="font-sans text-ink-700 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          Una asesoría de 30 minutos sin costo para ayudarte a elegir el camino que más se alinea con lo que buscás.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20sobre%20los%20cursos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            WhatsApp →
          </a>
          <Link
            href="/asesorias"
            className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
          >
            Agendar asesoría
          </Link>
        </div>
      </section>
    </main>
  );
}
