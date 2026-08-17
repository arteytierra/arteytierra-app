import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { waLink, WHATSAPP_PRINCIPAL, WHATSAPP_ALQUIMIA } from '@/lib/contact';
import { JsonLd } from '@/components/seo/JsonLd';
import { coursesItemListJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';
import { YouTubeFacade } from '@/components/media/YouTubeFacade';
import { getCoursesForLanding, getProductCover } from '@/lib/commerce/products';

export const revalidate = 60;

const META_TITLE = 'Ecoescuela';
const META_DESC =
  'Cursos y formaciones de bioarquitectura, diseño hidrológico, permacultura y biocosmética. Presenciales en Tay Pichín y online desde cualquier parte del mundo.';

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  alternates: { canonical: '/cursos' },
  ...buildSocial({
    title: META_TITLE,
    description: META_DESC,
    url: '/cursos',
    ogKind: 'course',
    ogEyebrow: 'Ecoescuela · Tay Pichín',
  }),
};

/* ─── Tipos ──────────────────────────────────────────── */

type Dato = { label: string; val: string };

interface Curso {
  slug: string;
  badge: string;
  name: string;
  tag: string;
  desc: string;
  img: string;
  datos?: Dato[];
  contenidos?: string[];
  precio: string;
  precioNote: string;
  href: string;
  whatsapp: string;
  tentativo?: boolean;
}

type TodoItem = {
  slug: string;
  name: string;
  tag: string;
  img: string;
  badge: string;
  tentativo: boolean;
  online: boolean;
};

type ProximoItem = {
  slug: string;
  name: string;
  badge: string;
  desc: string;
  img: string;
  whatsapp: string;
};

/* ─── Datos estáticos de fallback ────────────────────── */

const FALLBACK_TODOS: TodoItem[] = [
  { slug: 'formacion-construccion-natural', name: 'Formación Integral en Construcción Natural', tag: '21 sep – 30 nov · 3 cupos + 2 con experiencia', img: '/img/cursos/bioarquitectura/1.jpg', badge: 'Presencial · 2 meses', tentativo: false, online: false },
  { slug: 'mi-tierra-mi-casa',           name: 'Mi Tierra, Mi Casa',           tag: 'Disponible ahora',         img: '/img/cursos/mitierramicasa/1.jpg',      badge: 'Online',         tentativo: false, online: true  },
  { slug: 'tadelakt',                     name: 'Tadelakt Online',               tag: 'Disponible ahora',         img: '/img/cursos/tadelakt/0.jpg',            badge: 'Online',         tentativo: false, online: true  },
  { slug: 'cultivo-girgolas',             name: 'Cultivo de Gírgolas',           tag: 'Próximamente',             img: '/img/cursos/cultivo-girgolas/1.jpg',    badge: 'Sin fecha',      tentativo: true,  online: false },
  { slug: 'alquimia-natural',             name: 'Alquimia Natural',              tag: 'Inicia sáb. 13 jun · Tay Pichín', img: '/img/biocosmetica/productos-todos.jpg', badge: 'Ciclo mensual',  tentativo: false, online: false },
  { slug: 'bioarquitectura',              name: 'Bioarquitectura',               tag: '5–6 dic 2026',             img: '/img/proyectos/alihuen/5.jpg',          badge: 'Presencial',     tentativo: false, online: false },
  { slug: 'inmersion-viva',               name: 'Inmersión Viva',                tag: 'Mínimo 2 semanas',         img: '/img/taypichin/carousel/5.jpg',         badge: 'Inmersión',      tentativo: false, online: false },
  { slug: 'vuelta-a-la-tierra',           name: 'La Vuelta a la Tierra',         tag: 'Marzo 2027 · Online',      img: '/img/cursos/vueltatierra/7.jpg',        badge: 'Online en vivo', tentativo: false, online: true  },
  { slug: 'diseno-ecosistemico-del-agua', name: 'Diseño Ecosistémico del Agua',  tag: 'Próximamente',             img: '/img/cursos/vueltatierra/3.jpg',        badge: 'Sin fecha',      tentativo: true,  online: false },
  { slug: 'biopiscinas',                  name: 'Biopiscinas',                   tag: 'Próximamente',             img: '/img/taypichin/carousel/5.jpg',         badge: 'Sin fecha',      tentativo: true,  online: false },
  { slug: 'revoques-naturales',           name: 'Revoques Naturales',            tag: 'Próximamente',             img: '/img/cursos/bioarquitectura/1.jpg',     badge: 'Sin fecha',      tentativo: true,  online: false },
];

const FALLBACK_CURSOS: Curso[] = [
  {
    slug: 'formacion-construccion-natural', badge: 'Formación intensiva · 2 meses', name: 'Formación Integral en Construcción Natural',
    tag: '21 de septiembre al 30 de noviembre 2026 · San Marcos Sierras · 3 cupos + 2 con experiencia (50% dto)',
    desc: 'Dos meses viviendo una obra real de principio a fin: construimos una cabaña completa de los cimientos al techo. Estructura de madera, adobe y quincha, techos vivos, revoques de barro y cal, biofiltros y cosecha de lluvia.',
    img: '/img/cursos/bioarquitectura/1.jpg',
    datos: [{ label: 'Cuándo', val: '21 sep – 30 nov 2026 · 2 meses (10 semanas)' }, { label: 'Lugar', val: 'San Marcos Sierras · Hospedaje en Tay Pichín' }, { label: 'Modalidad', val: 'Obra real diaria + teoría + acompañamiento' }, { label: 'Cupos', val: '3 regulares + 2 con 50% dto (experiencia previa)' }],
    contenidos: ['Cimientos y contrapisos', 'Estructura en madera', 'Adobe y quincha alivianada', 'Techos vivos y de chapa', 'Revoques de barro y cal', 'Biofiltros y cosecha de lluvia', 'Instalación de servicios y fin de obra'],
    precio: '$2.000.000 ARS · USD 1.400', precioNote: 'Precio único, todo incluido (hospedaje + alimentación). Se reserva con seña del 50%. 2 cupos con 50% de descuento para personas con experiencia previa.',
    href: '/cursos/formacion-construccion-natural', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero postularme a la Formación Integral en Construcción Natural (arranca el 21 de septiembre)'),
  },
  {
    slug: 'mi-tierra-mi-casa', badge: 'Online · Acceso ilimitado', name: 'Mi Tierra, Mi Casa',
    tag: 'Disponible · Empezás cuando querés',
    desc: 'Formación en bioconstrucción a tu ritmo. 4 módulos y 18 clases que recorren todas las etapas de una obra natural — de los cimientos al criterio.',
    img: '/img/cursos/mitierramicasa/1.jpg',
    datos: [{ label: 'Formato', val: 'Video clases grabadas · acceso ilimitado' }, { label: 'Contenido', val: '4 módulos · 18 clases' }, { label: 'Duración', val: 'A tu ritmo · sin vencimiento' }, { label: 'Facilita', val: 'Jonatan Palma' }],
    contenidos: ['Introducción y materiales', 'Cimientos y estructuras', 'Muros: quincha, cob, paja', 'Revoques gruesos y finos', 'Pinturas y relieves', 'Biocosmética del hábitat'],
    precio: 'USD 80', precioNote: 'Pago único · acceso permanente.',
    href: '/cursos/mi-tierra-mi-casa', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero inscribirme a Mi Tierra, Mi Casa'),
  },
  {
    slug: 'tadelakt', badge: 'Online · Acceso ilimitado', name: 'Tadelakt Online',
    tag: 'Disponible · Empezás cuando querés',
    desc: 'El arte marroquí del enlucido en cal: el acabado impermeable, brillante y vivo que transforma baños, cocinas y cualquier superficie en una pieza única.',
    img: '/img/cursos/tadelakt/0.jpg',
    precio: '$90.000', precioNote: 'Pago único · 3 módulos · acceso permanente.',
    href: '/cursos/tadelakt', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero inscribirme al curso de Tadelakt Online'),
  },
  {
    slug: 'alquimia-natural', badge: 'Ciclo mensual · Presencial', name: 'Alquimia Natural y Limpieza Consciente',
    tag: 'Inicia sáb. 13 jun · 3er sábado de cada mes · Tay Pichín',
    desc: 'Ocho encuentros presenciales para transformar ingredientes simples y nobles en soluciones de higiene que respetan tu salud, el agua y la tierra.',
    img: '/img/biocosmetica/productos-todos.jpg',
    datos: [{ label: 'Frecuencia', val: 'Tercer sábado de cada mes' }, { label: 'Lugar', val: 'Ecoescuela Tay Pichín, San Marcos Sierras' }, { label: 'Modalidad', val: '8 encuentros o módulos sueltos' }, { label: 'Cupos', val: 'Limitados' }],
    contenidos: ['Jabonería de rescate (aceite reciclado)', 'Cítricos y desengrasantes naturales', 'Botiquín de limpieza', 'Alquimia sólida efervescente', 'Alquimia capilar', 'Desodorantes sin tóxicos', 'Dentífrico natural', 'Jabón de cuidado corporal'],
    precio: '$30.000 – $200.000', precioNote: 'Encuentro suelto · módulo (4 enc.) · ciclo completo (8 enc.)',
    href: '/cursos/alquimia-natural', whatsapp: waLink(WHATSAPP_ALQUIMIA, 'Hola, quiero info del ciclo de Alquimia Natural'),
  },
  {
    slug: 'bioarquitectura', badge: 'Intensivo presencial', name: 'Bioarquitectura, Construcción y Territorio',
    tag: '5 y 6 de diciembre 2026 · Tay Pichín',
    desc: 'Dos días de obra real para aprender técnicas ancestrales de bioconstrucción integradas con diseño bioclimático y ecológico. 40% teoría, 60% práctica.',
    img: '/img/proyectos/alihuen/5.jpg',
    datos: [{ label: 'Fechas', val: '5 y 6 de diciembre · 2026' }, { label: 'Lugar', val: 'Ecoescuela Tay Pichín, San Marcos Sierras' }, { label: 'Modalidad', val: '40% teoría · 60% práctica en obra' }, { label: 'Facilita', val: 'Jonatan Palma' }],
    contenidos: ['Construcción con tierra', 'Diseño bioclimático', 'Quincha, cob y pirca', 'Revoques de tierra y cal', 'Techos vivos', 'Pigmentos naturales', 'Construcción colectiva'],
    precio: '$130.000 – $160.000', precioNote: 'Sin hospedaje / camping / habitación compartida. Incluye materiales + alimentación.',
    href: '/cursos/bioarquitectura', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero inscribirme al Curso de Bioarquitectura (5 y 6 diciembre)'),
  },
  {
    slug: 'vuelta-a-la-tierra', badge: 'Online en vivo · 7 semanas', name: 'La Vuelta a la Tierra',
    tag: 'A partir de marzo 2027 · Online en vivo',
    desc: 'En 7 semanas te llevás los planos de tu vivienda y el masterplan de tu predio listos para empezar a construir. Con criterio técnico, sin gastar de más, y entendiendo el por qué.',
    img: '/img/cursos/vueltatierra/7.jpg',
    datos: [{ label: 'Inicio', val: 'A partir de marzo 2027' }, { label: 'Formato', val: 'Clases en vivo · quedan grabadas' }, { label: 'Dedicación', val: '4 a 6 hs semanales' }, { label: 'Facilitan', val: 'Jonatan Palma + Fabricio Manzoni' }],
    contenidos: ['Análisis climático y topográfico', 'Permacultura e hidrología', 'Diseño de masterplan', 'Bioarquitectura', 'Materiales y sistemas constructivos', 'Tecnologías apropiadas', 'Anteproyecto de vivienda'],
    precio: 'Desde $350.000', precioNote: 'En 4 pagos: $50k + 3 × $100k. Cupos limitados.',
    href: '/cursos/vuelta-a-la-tierra', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info de La Vuelta a la Tierra (marzo 2027)'),
  },
];

const FALLBACK_PROXIMOS: ProximoItem[] = [
  { slug: 'cultivo-girgolas',             badge: 'Taller modular · Presencial', name: 'Cultivo de Gírgolas', desc: 'Tres encuentros independientes para aprender todo el proceso: biología del hongo, producción casera y escala productiva. FUNGO × Tay Pichín. Nuevas fechas a confirmar.', img: '/img/cursos/cultivo-girgolas/1.jpg', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info del Taller de Cultivo de Gírgolas y sus próximas fechas') },
  { slug: 'diseno-ecosistemico-del-agua', badge: 'Taller presencial', name: 'Diseño Ecosistémico del Agua', desc: 'Hidrología regenerativa aplicada al territorio. Zanjas de infiltración, captación de lluvia, humedales y cuencas vivas. Lectura del paisaje e intervención con criterio ecosistémico.', img: '/img/cursos/vueltatierra/3.jpg', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero anotarme para el taller de Diseño Ecosistémico del Agua') },
  { slug: 'biopiscinas',                  badge: 'Taller presencial', name: 'Biopiscinas',                   desc: 'Diseño y construcción de piscinas naturales que se autorregulan sin químicos. Sistemas biológicos de filtración, plantas acuáticas y equilibrio ecológico para nadar en agua viva.', img: '/img/taypichin/carousel/5.jpg', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero anotarme para el taller de Biopiscinas') },
  { slug: 'revoques-naturales',           badge: 'Taller presencial', name: 'Revoques Naturales',            desc: 'Del barro a la cal: técnicas de revoques con materiales nobles, texturas vivas y acabados que respiran. Revoques gruesos, finos, yeso, enjarre y pinturas naturales.', img: '/img/cursos/bioarquitectura/1.jpg', whatsapp: waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero anotarme para el taller de Revoques Naturales') },
];

/* ─── Testimonios (completar con contenido real) ─────── */

const TESTIMONIOS: Array<{ name: string; course: string; quote: string }> = [];

/* ─── Components ─────────────────────────────────────── */

function GridCard({ c, idx }: { c: TodoItem; idx: number }) {
  const inner = (
    <>
      <div className="relative aspect-video overflow-hidden">
        <Image src={c.img} alt={c.name} fill priority={idx < 8}
          className={`object-cover transition-transform duration-300 group-hover:scale-105${c.tentativo ? ' grayscale opacity-60' : ''}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {c.online && <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-moss-700 text-bone-50 px-2 py-0.5">Online</span>}
          {c.tentativo && <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-clay-500 text-bone-50 px-2 py-0.5">Próx.</span>}
        </div>
      </div>
      <div className="px-3 py-2.5 bg-ink-800 border-t border-ink-700">
        <p className="font-sans text-sm font-bold text-bone-50 leading-tight line-clamp-1">{c.name}</p>
        <p className="font-sans text-xs text-bone-100 leading-tight mt-1 line-clamp-1">{c.tag}</p>
      </div>
    </>
  );
  const cls = 'group overflow-hidden bg-ink-800 w-full block';
  if (c.tentativo) return <a href="#proximamente" className={cls}>{inner}</a>;
  return <Link href={`/cursos/${c.slug}`} className={cls}>{inner}</Link>;
}

function CourseCard({ c, reverse }: { c: Curso; reverse?: boolean }) {
  return (
    <article className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} bg-bone-100 overflow-hidden`}>
      <div className="relative md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden bg-ink-950 flex-shrink-0">
        <Image src={c.img} alt={c.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute top-4 left-4">
          <span className="bg-clay-700 text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5">{c.badge}</span>
        </div>
      </div>
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-5">
        <div>
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-2">{c.tag}</p>
          <h3 className="font-display text-2xl md:text-3xl text-ink-950">{c.name}</h3>
        </div>
        <p className="font-sans text-base text-ink-700 leading-relaxed">{c.desc}</p>
        {c.datos && (
          <div className="grid grid-cols-2 gap-2">
            {c.datos.map(d => (
              <div key={d.label} className="bg-bone-50 px-3 py-2.5 border-l-2 border-clay-400">
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-600 mb-0.5">{d.label}</p>
                <p className="text-xs font-sans text-ink-800 leading-snug">{d.val}</p>
              </div>
            ))}
          </div>
        )}
        {c.contenidos && (
          <div className="flex flex-wrap gap-1.5">
            {c.contenidos.map(t => (
              <span key={t} className="text-xs font-sans text-clay-700 bg-clay-50 border border-clay-200 px-2.5 py-1">{t}</span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3 pt-2 border-t border-bone-200">
          <div>
            <span className="font-display text-2xl text-ink-950">{c.precio}</span>
            <p className="text-xs font-sans text-ink-500 mt-0.5">{c.precioNote}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={c.href} className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-900 transition-colors">
              Inscribirme →
            </Link>
            <a href={c.whatsapp} target="_blank" rel="noopener noreferrer"
              className="inline-flex border border-clay-400 text-clay-700 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-50 transition-colors">
              Consultar
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */

export default async function CursosPage() {
  // Intentar cargar desde DB; si falla o devuelve vacío, usar fallback estático
  let todos = FALLBACK_TODOS;
  let cursos = FALLBACK_CURSOS;
  let proximos = FALLBACK_PROXIMOS;
  let inmersionWa = waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info de la Inmersión Viva');

  try {
    const { activos, inmersion, proximos: dbProximos } = await getCoursesForLanding();
    if (activos.length > 0) {
      todos = [...activos, ...(inmersion ? [inmersion] : []), ...dbProximos].map(p => ({
        slug: p.slug,
        name: p.name,
        tag: p.landing_meta.tag,
        img: getProductCover(p as never) ?? '/img/cursos/cursos/1.jpg',
        badge: p.landing_meta.badge,
        tentativo: !p.is_active,
        online: p.landing_meta.badge.toLowerCase().includes('online'),
      }));
      cursos = activos.map(p => {
        const lm = p.landing_meta;
        return {
          slug: p.slug, badge: lm.badge, name: p.name, tag: lm.tag,
          desc: p.subtitle ?? '', img: getProductCover(p as never) ?? '/img/cursos/cursos/1.jpg',
          datos: lm.datos, contenidos: lm.contenidos,
          precio: lm.precio_display ?? '', precioNote: lm.precio_note ?? '',
          href: `/cursos/${p.slug}`,
          whatsapp: waLink(lm.whatsapp_numero ?? WHATSAPP_PRINCIPAL, lm.whatsapp_msg),
        };
      });
      proximos = dbProximos.map(p => ({
        slug: p.slug, name: p.name, badge: p.landing_meta.badge,
        desc: p.subtitle ?? '',
        img: getProductCover(p as never) ?? '/img/cursos/cursos/1.jpg',
        whatsapp: waLink(p.landing_meta.whatsapp_numero ?? WHATSAPP_PRINCIPAL, p.landing_meta.whatsapp_msg),
      }));
      if (inmersion) inmersionWa = waLink(inmersion.landing_meta.whatsapp_numero ?? WHATSAPP_PRINCIPAL, inmersion.landing_meta.whatsapp_msg);
    }
  } catch (e) {
    console.error('[CursosPage] DB fallback activado:', e);
  }

  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
        <Image src="/img/cursos/cursos/1.jpg" alt="Ecoescuela Arte y Tierra — Tay Pichín" fill priority className="object-cover" sizes="100vw" />
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

      {/* GRILLA RÁPIDA */}
      <section className="bg-ink-900 py-8 px-6 border-b border-ink-700">
        <div className="max-w-editorial mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-5 text-center">Todas las formaciones</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {todos.map((c, idx) => <GridCard key={c.slug} c={c} idx={idx} />)}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-5">El enfoque</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8">El conocimiento<br />vuelve a las <em>manos.</em></h2>
          <p className="font-sans text-bone-100 text-base leading-relaxed mb-4">
            Cada formación parte de una premisa: el aprendizaje verdadero ocurre en la práctica. Trabajamos sobre obras reales, en territorio vivo, con materiales del lugar y técnicas que tienen siglos de sabiduría detrás.
          </p>
          <p className="font-sans text-bone-200 text-base leading-relaxed">
            Formaciones presenciales en Tay Pichín (San Marcos Sierras, Córdoba) y cursos online en vivo para quienes aprenden desde cualquier parte del mundo.
          </p>
        </div>
      </section>

      {/* CURSOS PRINCIPALES */}
      <section className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto mb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Formaciones · 2026</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950">Todos los<br /><em>cursos.</em></h2>
          <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
            Presenciales en Tay Pichín, online en vivo y a tu ritmo. Elegí la formación que más resuena con tu camino.
          </p>
        </div>
        <div className="max-w-editorial mx-auto flex flex-col divide-y divide-bone-200">
          {cursos.map((c, i) => <CourseCard key={c.slug} c={c} reverse={i % 2 === 1} />)}
        </div>
      </section>

      {/* INMERSIÓN VIVA */}
      <section className="bg-ink-950">
        <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[600px] overflow-hidden">
            <Image src="/img/taypichin/carousel/5.jpg" alt="Inmersión Viva — Tay Pichín" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute top-4 left-4">
              <span className="bg-moss-700 text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5">Inmersión · Desde 2 semanas</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">Experiencia completa</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">Inmersión <em>Viva.</em></h2>
            <p className="font-sans text-bone-50 text-base leading-relaxed">
              Períodos formativos desde 2 semanas en Tay Pichín. Bioconstrucción, agroecología y organización colectiva aprendidas en la práctica diaria — integradas al trabajo, la convivencia y la vida en territorio.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏗', t: 'Bioconstrucción',   d: 'Obra real con tierra y materiales naturales' },
                { icon: '🌱', t: 'Agroecología',       d: 'Huerta, suelo y sistemas vivos' },
                { icon: '💧', t: 'Diseño hidrológico', d: 'Lectura del paisaje y el agua' },
                { icon: '🤝', t: 'Comunidad',          d: 'Círculos de la palabra y organización' },
              ].map(item => (
                <div key={item.t} className="p-4 bg-ink-800 border border-ink-600">
                  <div className="text-lg mb-1"><span aria-hidden="true">{item.icon}</span></div>
                  <p className="font-sans font-semibold text-sm text-bone-50">{item.t}</p>
                  <p className="font-sans text-xs text-bone-200 mt-0.5 leading-snug">{item.d}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/cursos/inmersion-viva" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors">
                Inscribirme →
              </Link>
              <a href={inmersionWa} target="_blank" rel="noopener noreferrer"
                className="inline-flex border border-bone-500/40 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:border-bone-200 transition-colors">
                Consultar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SIN FECHA CONFIRMADA */}
      <section id="proximamente" className="bg-bone-50 py-20 px-6 border-t border-bone-200">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Próximamente</p>
            <h2 className="font-display text-4xl text-ink-950">En preparación —<br /><em>anotate antes.</em></h2>
            <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
              Estas formaciones no tienen fecha confirmada aún. Dejanos tu nombre y te avisamos apenas abramos inscripción.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {proximos.map(t => (
              <div key={t.slug} className="bg-bone-100 overflow-hidden border border-bone-200">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={t.img} alt={t.name} fill className="object-cover grayscale opacity-80"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest bg-bone-50 text-clay-700 px-2.5 py-1">{t.badge}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ink-950 mb-2">{t.name}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed mb-5">{t.desc}</p>
                  <a href={t.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-clay-900 transition-colors">
                    Anotarme →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-clay-700 py-14 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ n: '+150', label: 'talleres dictados' }, { n: '+10k', label: 'personas formadas' }, { n: '7', label: 'países' }, { n: '15+', label: 'años de experiencia' }].map(s => (
            <div key={s.n}>
              <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
              <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO TESTIMONIOS */}
      <section className="bg-ink-950 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Lo que dicen quienes pasaron por acá</p>
            <h2 className="font-display text-3xl text-bone-50">Voces de la <em>comunidad.</em></h2>
          </div>
          <div className="relative aspect-video bg-ink-800 overflow-hidden">
            <YouTubeFacade videoId="dSqscHL4pF8" title="Testimonios de participantes — Arte y Tierra" />
          </div>
          {TESTIMONIOS.length > 0 && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIOS.map(t => (
                <blockquote key={t.name} className="bg-ink-800 p-6 flex flex-col gap-4 border border-ink-700">
                  <p className="font-sans text-bone-100 text-sm leading-relaxed">"{t.quote}"</p>
                  <footer className="mt-auto pt-4 border-t border-ink-700">
                    <cite className="not-italic">
                      <span className="font-sans font-semibold text-bone-50 text-sm">{t.name}</span>
                      <span className="font-sans text-xs text-bone-400 ml-2">· {t.course}</span>
                    </cite>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bone-50 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">¿No sabés qué curso es para vos?</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">Hablemos antes<br />de <em>decidir.</em></h2>
        <p className="font-sans text-ink-700 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          Una asesoría de 30 minutos sin costo para ayudarte a elegir el camino que más se alinea con lo que buscás.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href={waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info sobre los cursos')} target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
            WhatsApp →
          </a>
          <Link href="/asesorias" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
            Agendar asesoría
          </Link>
        </div>
      </section>
      </main>
      <SiteFooter />

      <JsonLd data={[coursesItemListJsonLd({ courses: cursos.map(c => ({ slug: c.slug, name: c.name, description: c.desc, img: c.img })) })]} />
    </>
  );
}
