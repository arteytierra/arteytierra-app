import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ruler, Mountain, Droplets, CloudRain, Layers, Trees, Bird,
  Waypoints, Sprout, Route, Lightbulb, FileText, ArrowRight, Waves,
  Globe, ShieldCheck, MonitorSmartphone, Gift, GraduationCap, Compass, Home,
} from 'lucide-react';
import { FAQ } from '@arteytierra/ui/marketing';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { PlanesTerreno } from '@/components/terreno/PlanesTerreno';
import { BarraAcequia } from '@/components/terreno/BarraAcequia';
import { REGISTRO_URL, PLANES } from '@/lib/terreno/planes';

// El "desde" sale de los planes y no de una constante escrita a mano, para que
// no se despegue del precio real cuando cambie.
const DESDE_USD = Math.min(
  ...PLANES.map(p => p.precioMensualUSD).filter((n): n is number => n !== null),
);

export const metadata: Metadata = {
  title: 'acequia — Diseño ecosistémico del territorio',
  // Bajada aprobada en el manual de marca v2 (08 · Experiencia de marca).
  // Reemplaza a la anterior, que prometía "datos globales" sin matiz: el manual
  // desautoriza afirmar que el producto funciona igual en todo el mundo.
  description:
    'Delimitá un predio y obtené una lectura preliminar de relieve, agua, clima, suelo y contexto, con fuentes y limitaciones visibles. Empezá gratis.',
  // Landing en modo privado por ahora: no la mostramos en la navegación ni la
  // indexamos. Sigue accesible por link directo para compartir en privado.
  robots: { index: false, follow: false },
  openGraph: {
    title: 'acequia — Diseño ecosistémico del territorio | Arte y Tierra',
    description:
      'Delimitá un predio y obtené una lectura preliminar de relieve, agua, clima, suelo y contexto, con fuentes y limitaciones visibles.',
    images: [{ url: '/img/acequia/og.png', width: 1200, height: 630, alt: 'acequia — Diseño ecosistémico del territorio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'acequia — Diseño ecosistémico del territorio',
    description:
      'Delimitá un predio y obtené una lectura preliminar de relieve, agua, clima, suelo y contexto, con fuentes y limitaciones visibles.',
    images: ['/img/acequia/og.png'],
  },
};

// ─── Motivo de marca: curvas de nivel de un cerro (la misma pieza que la OG) ─
// Mismo trazado que `_flyers/acequia-og/og.html`: un cerro real leído por el
// MDE, no un blanco de tiro — asimétrico, con ladera tendida al oeste y
// faldeo abrupto al este, sangrando fuera del lienzo como en una carta
// topográfica. Se repite acá para que el hero y la miniatura social sean la
// misma pieza visual. El color lo pone `currentColor` desde el wrapper.
function CerroCurvas({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 700 700" fill="none">
      <g stroke="currentColor" fill="none" strokeLinejoin="round">
        <path d="M352 22 C 520 44, 636 128, 664 268 C 690 400, 620 528, 486 604 C 372 668, 232 656, 146 578 C 62 502, 34 372, 78 254 C 122 134, 224 8, 352 22 Z" strokeWidth="1.5" opacity=".34" />
        <path d="M358 84 C 500 104, 596 178, 618 288 C 640 396, 578 496, 466 556 C 370 608, 254 596, 184 530 C 114 464, 96 358, 134 262 C 172 168, 254 70, 358 84 Z" strokeWidth="1.5" opacity=".40" />
        <path d="M366 150 C 476 168, 550 228, 566 312 C 582 392, 534 466, 448 512 C 372 552, 282 542, 226 492 C 168 440, 156 358, 188 284 C 218 214, 286 138, 366 150 Z" strokeWidth="2.4" opacity=".52" />
        <path d="M374 214 C 452 230, 502 274, 512 334 C 522 390, 490 442, 430 472 C 376 498, 314 490, 274 454 C 232 416, 224 358, 246 306 C 266 258, 316 204, 374 214 Z" strokeWidth="1.5" opacity=".44" />
        <path d="M380 278 C 428 290, 456 318, 460 354 C 464 388, 444 418, 408 434 C 374 448, 338 442, 314 420 C 290 396, 288 362, 302 332 C 316 304, 346 270, 380 278 Z" strokeWidth="1.5" opacity=".46" />
        <path d="M386 330 C 412 338, 424 354, 424 372 C 424 390, 412 404, 392 410 C 372 416, 354 410, 344 396 C 336 382, 338 364, 348 350 C 358 336, 370 326, 386 330 Z" strokeWidth="1.5" opacity=".48" />
      </g>
      <circle cx="384" cy="371" r="5.5" fill="currentColor" opacity=".85" />
    </svg>
  );
}

// ─── Motivo de marca: curvas de nivel ("cartografía viva") ───────────────────
// SVG de líneas topográficas que se repiten en tiles sin costura. El color se
// controla con `text-*` en el wrapper (currentColor) y la opacidad con /NN.
function ContourLines({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={id} width="160" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-4)">
          <path d="M0 24 Q40 6 80 24 T160 24" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 54 Q40 36 80 54 T160 54" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 84 Q40 66 80 84 T160 84" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 114 Q40 96 80 114 T160 114" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ─── Datos ──────────────────────────────────────────────────────────────────

const QUE_ES = [
  {
    n: '01',
    icon: Ruler,
    title: 'Medí tu territorio',
    desc: 'Mojones con precisión de campo, superficie, perímetro y rumbos — desde el navegador, sin instrumentos.',
  },
  {
    n: '02',
    icon: Droplets,
    title: 'Entendé tu agua',
    desc: 'Cómo escurre, dónde se capta, dónde se infiltra y se retiene. El agua como sistema vivo, no como recurso.',
  },
  {
    n: '03',
    icon: Waypoints,
    title: 'Diseñá en clave regenerativa',
    desc: 'Keyline, sistemas agroforestales, riego y pastoreo. El masterplan completo, guiado por el terreno.',
  },
];

// 12+ capacidades agrupadas en 4 bloques con narrativa: medir → agua →
// contexto → diseñar/entregar.
const CLUSTERS = [
  {
    label: 'Medición y relieve',
    items: [
      { icon: Ruler,    t: 'Superficie, perímetro y rumbos', d: 'Calculados al instante desde los mojones que marcás.' },
      { icon: Mountain, t: 'Topografía completa', d: 'Pendientes, orientaciones, curvas de nivel, relieve y vista 3D.' },
    ],
  },
  {
    label: 'Agua',
    items: [
      { icon: Droplets, t: 'Análisis hidrológico', d: 'Escurrimiento, cuenca de aporte, captación, infiltración y retención.' },
      { icon: Waves,    t: 'Represas y embalses', d: 'Ubicación, agua embalsada y eficiencia del muro.' },
      { icon: Route,    t: 'Aguadas, caminos y red de agua', d: 'Infraestructura de agua y accesos, dimensionada.' },
    ],
  },
  {
    label: 'Contexto ecosistémico',
    items: [
      { icon: CloudRain, t: 'Clima y extremos', d: 'Lluvia, temperatura, evapotranspiración, heladas y sequías.' },
      { icon: Layers,    t: 'Suelo', d: 'Textura, materia orgánica y agua útil (SoilGrids).' },
      { icon: Trees,     t: 'Cobertura del suelo', d: 'Qué crece hoy sobre el terreno, por porcentaje.' },
      { icon: Bird,      t: 'Biodiversidad del entorno', d: 'Especies registradas alrededor de tu predio (GBIF).' },
    ],
  },
  {
    label: 'Diseño y entrega',
    items: [
      { icon: Waypoints, t: 'Keyline y agroforestal', d: 'Líneas maestras y sistemas de plantación sobre el relieve.' },
      { icon: Sprout,    t: 'Riego y pastoreo', d: 'Riego por evapotranspiración (FAO-56) y pastoreo rotativo (PRV).' },
      { icon: Lightbulb, t: 'Sugerencias automáticas', d: 'Recomendaciones de diseño a partir del análisis del terreno.' },
      // El manual nombra así al entregable que genera la plataforma (nivel 2 de
      // la jerarquía): "informe técnico" prometía un documento validado, que es
      // el nivel 3 y lo firma una persona.
      { icon: FileText,  t: 'Diagnóstico preliminar', d: 'Descargable y compartible por link, con fuentes, resolución y limitaciones.' },
    ],
  },
];

const CAPTURAS = [
  { src: '/img/terreno/vista3d.webp',   alt: 'Vista 3D del relieve del terreno', cap: 'Relieve en 3D' },
  { src: '/img/terreno/reddeagua.webp', alt: 'Red de agua y escurrimiento', cap: 'Red de agua y escurrimiento' },
  { src: '/img/terreno/sectores.webp',  alt: 'Sectores de diseño sobre el mapa', cap: 'Sectores de diseño' },
];

const CONFIANZA = [
  { icon: MonitorSmartphone, t: 'Sin instalar nada', d: 'Funciona en el navegador.' },
  // El manual de marca prohíbe afirmar "funciona igual en todo el mundo": la
  // cobertura existe en todas partes, la calidad no es la misma en todas.
  { icon: Globe,             t: 'Cobertura global', d: 'Con más detalle donde hay datos nacionales.' },
  { icon: Gift,              t: 'Empezá gratis', d: 'Sin tarjeta, sin permanencia.' },
  { icon: ShieldCheck,       t: 'Tus proyectos, privados', d: 'Solo vos los ves.' },
];

// ─── Pasaporte de datos ──────────────────────────────────────────────────────
// El manual de marca v2 define la "marca de confianza": citar la fuente no es
// una nota al pie, es parte del producto. Y tipifica la evidencia —observado,
// modelado, derivado— para que se vea qué midió un tercero y qué calculó
// acequia. Cada fila de acá sale de la fuente que la app consulta de verdad;
// los nombres coinciden con los chips que se ven dentro del mapa.
const EVIDENCIA = {
  observado: { label: 'Observado', color: '#2E6B8A', ayuda: 'Medido o inventariado por una fuente identificada' },
  modelado:  { label: 'Modelado',  color: '#8A551E', ayuda: 'Resultado de un modelo o reanálisis' },
  derivado:  { label: 'Derivado',  color: '#4A6741', ayuda: 'Cálculo que hace acequia sobre las capas anteriores' },
} as const;

const FUENTES: Array<{
  dato: string;
  proveedor: string;
  resolucion: string;
  periodo: string;
  evidencia: keyof typeof EVIDENCIA;
}> = [
  { dato: 'Relieve', proveedor: 'Copernicus GLO-30 · ESA', resolucion: '30 m', periodo: 'Global', evidencia: 'observado' },
  { dato: 'Relieve de detalle', proveedor: 'USGS 3DEP · IGN Francia · MDT España · HRDEM Canadá', resolucion: 'Según país', periodo: 'Donde existe', evidencia: 'observado' },
  { dato: 'Suelo', proveedor: 'SoilGrids · ISRIC', resolucion: '250 m', periodo: 'Global', evidencia: 'modelado' },
  { dato: 'Clima e históricos', proveedor: 'Open-Meteo · reanálisis ERA5', resolucion: '~10 km', periodo: '1940 – hoy', evidencia: 'modelado' },
  { dato: 'Cobertura del suelo', proveedor: 'ESA WorldCover', resolucion: '10 m', periodo: '2021', evidencia: 'observado' },
  { dato: 'Biodiversidad', proveedor: 'GBIF', resolucion: 'Registros puntuales', periodo: 'Global', evidencia: 'observado' },
  { dato: 'Caminos y entorno', proveedor: 'OpenStreetMap', resolucion: 'Variable', periodo: 'Colaborativo', evidencia: 'observado' },
  { dato: 'Pendiente, cuenca, escurrimiento, erosión', proveedor: 'Cálculo de acequia sobre el relieve y el clima', resolucion: 'La del relieve', periodo: 'Del predio', evidencia: 'derivado' },
];

// Orden del manual: durante el MVP la comunicación se concentra en el público
// primario, que son los estudios y profesionales. Los nombres de perfiles se
// mantienen descriptivos para no competir con la nomenclatura de planes.
const PERFILES = [
  {
    icon: Compass,
    title: 'Estudios y profesionales',
    desc: 'Hacés diagnóstico, planificación o masterplans para comitentes y necesitás entregar con tu marca y en tiempo.',
  },
  {
    icon: Home,
    title: 'Familias y proyectos',
    desc: 'Tenés un campo y un sueño. Empezá por escuchar lo que el territorio ya te dice.',
  },
  {
    icon: GraduationCap,
    title: 'Escuelas y quienes enseñan',
    desc: 'Estás formándote o dando clase y querés trabajar sobre predios reales, no sobre ejemplos de manual.',
  },
];

// [TODO Jonatan] revisar respuestas de las FAQ.
const FAQS = [
  { q: '¿Qué necesito para usar acequia?', a: 'Sólo un navegador. Funciona online, sin instalar nada ni comprar instrumentos. Entrás, marcás tu terreno y empezás.' },
  { q: '¿Funciona en el celular?', a: 'Sí, podés medir y dibujar desde el celular. Para el trabajo de diseño y los informes largos se disfruta más en una pantalla grande.' },
  { q: '¿Sirve fuera de Argentina?', a: 'Sí. Las fuentes de relieve, clima, suelo y biodiversidad tienen cobertura global, así que podés analizar un predio en cualquier parte del mundo. Lo que cambia es el detalle: en Estados Unidos, Francia, España o Canadá acequia usa los modelos de elevación nacionales, que son bastante más finos que el global. Cuando una fuente no alcanza para una zona, la plataforma lo avisa.' },
  { q: '¿Qué pasa con mis datos y mis proyectos?', a: 'Son tuyos y privados. Se guardan en tu cuenta y sólo vos los ves, salvo que decidas compartir el informe por link.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, sin permanencia. Si dejás de pagar, tu cuenta vuelve al plan Semilla y conservás tu proyecto.' },
  { q: '¿Cuál es la diferencia entre los planes?', a: 'Semilla mide y dibuja, gratis. Personal desbloquea todo el análisis y el diseño para hasta 2 proyectos. Profesional ofrece lo mismo, sin límite de proyectos. Estudio agrega tu marca propia en los informes, exportación CAD y trabajo en equipo.' },
  { q: '¿Cómo se paga desde otros países?', a: 'Desde Argentina, por Mercado Pago en pesos. Desde el resto del mundo, por PayPal en USD. La página muestra la moneda según desde dónde entrás.' },
  { q: '¿Necesito saber de CAD o GIS?', a: 'No. Lo que en un software técnico lleva días de trabajo, en acequia sucede al marcar el polígono de tu terreno.' },
];

// ─── Página ──────────────────────────────────────────────────────────────────

export default async function AcequiaLanding() {
  const pais = (await headers()).get('x-vercel-ip-country') ?? undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'acequia',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: 'https://terreno.arteytierra.org',
    // Categoría comercial del manual de marca v2 (02 · Posicionamiento).
    description:
      'Plataforma de diagnóstico y diseño territorial asistido: reúne datos geoespaciales dispersos y los convierte en hallazgos, trazados e informes preliminares, con la procedencia y la incertidumbre de cada dato a la vista.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Plan Semilla gratuito',
    },
    publisher: { '@type': 'Organization', name: 'Arte y Tierra', url: 'https://arteytierra.org' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main>
        {/* ── HERO ── */}
        {/* El id lo mide BarraAcequia para saber dónde termina el hero. */}
        <section id="acequia-hero" className="relative bg-[#1A1210] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E6B8A]/25 via-[#1A1210] to-[#1A1210]" />
          <div className="absolute inset-0 text-[#2E6B8A]/15">
            <ContourLines id="contour-hero" className="h-full w-full" />
          </div>
          {/* Curvas de nivel del cerro: motivo de marca, apoyado a la derecha
              como en la miniatura social. No pide espacio propio en el
              layout — se recorta con el contenedor, así el hero sigue siendo
              texto-primero. */}
          <div
            className="absolute right-0 top-1/2 pointer-events-none"
            style={{
              // Escala con la pantalla: a tamaño fijo tapaba medio celular.
              width: 'clamp(300px, 46vw, 620px)',
              height: 'clamp(300px, 46vw, 620px)',
              transform: 'translateY(-50%) translateX(-6%)',
              color: '#7FB2CC',
              opacity: 0.5,
            }}
          >
            <CerroCurvas className="w-full h-full" />
          </div>
          {/* El hero entra completo en una pantalla al 100%: por eso los
              respiros son cortos y el titular no pasa de dos renglones. */}
          <div className="relative z-10 max-w-editorial mx-auto px-6 pt-8 pb-12 md:pt-10 md:pb-16">
            {/* Lockup: lo mismo que abre los flyers de la marca. */}
            <div className="flex items-center gap-4 mb-8 md:mb-10">
              <Image
                src="/img/acequia/logo-blanco.png"
                alt="acequia"
                width={1200}
                height={395}
                priority
                style={{ width: 'auto' }}
                className="h-11 md:h-14"
              />
              <span className="h-10 w-px bg-[#F5F0E8]/20" aria-hidden="true" />
              <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#7FB2CC] leading-snug">
                Un desarrollo de<br />Arte y Tierra
              </p>
            </div>

            {/* max-w-3xl y no 2xl: con el contenedor angosto el titular se
                partía en cuatro renglones en vez de los dos que pide el
                manual. */}
            <div className="max-w-3xl">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#7FB2CC] mb-3">
                Diseño ecosistémico del territorio
              </p>
              {/* Titular y bajada aprobados en el manual de marca v2. El titular
                  anterior ("Del terreno al masterplan") describía el recorrido
                  del producto; éste dice la idea de marca, y de paso saca del
                  encabezado la palabra del nombre viejo. */}
              {/* Tamaño fluido y no por breakpoints: con los saltos fijos el
                  titular se partía en cuatro renglones en el celular. El
                  clamp lo mantiene en los dos renglones que pide el manual
                  desde 360 px hasta pantalla grande. */}
              <h1
                className="font-display text-[#F5F0E8]"
                style={{ fontSize: 'clamp(2.125rem, 1.2rem + 3.6vw, 4.75rem)', lineHeight: 1.05 }}
              >
                Entendé el territorio<br /><em className="text-[#7FB2CC]">antes de intervenirlo.</em>
              </h1>
              <p className="mt-5 font-sans text-base md:text-lg text-[#E8D5A3]/90 max-w-lg leading-relaxed">
                Delimitá un predio y obtené una lectura preliminar de relieve, agua, clima, suelo y
                contexto, con <span className="text-[#F5F0E8]">fuentes y limitaciones visibles</span>.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href={REGISTRO_URL}
                  className="inline-flex items-center gap-2 bg-[#2E6B8A] text-[#F5F0E8] font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 shadow-lg shadow-[#2E6B8A]/25 hover:bg-[#4A6741] hover:shadow-[#2E6B8A]/10 transition-all"
                >
                  Trazar mi terreno <ArrowRight size={16} />
                </a>
                <a
                  href="#planes"
                  className="inline-flex items-center border border-[#F5F0E8]/30 text-[#F5F0E8] font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-[#F5F0E8] transition-colors"
                >
                  Ver planes
                </a>
              </div>
              {/* El precio arranca en la primera pantalla: quien lo tiene que
                  descartar por caro lo descarta acá y no después de leer todo,
                  y quien no, deja de preguntárselo mientras baja. */}
              <p className="mt-5 font-sans text-sm text-[#F5F0E8]/60">
                Gratis, sin tarjeta. Los planes pagos arrancan en{' '}
                <span className="font-mono tabular-nums text-[#7FB2CC]">USD&nbsp;{DESDE_USD}</span> al mes.
              </p>
            </div>
          </div>
        </section>

        {/* ── BANDA DE CONFIANZA ── */}
        <section className="bg-[#241a17] border-y border-[#2E6B8A]/15 px-6 py-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {CONFIANZA.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-center gap-3">
                <Icon size={22} className="text-[#7FB2CC] flex-shrink-0" />
                <div>
                  <p className="font-sans font-semibold text-sm text-[#F5F0E8] leading-tight">{t}</p>
                  <p className="font-sans text-xs text-[#F5F0E8]/60 leading-tight mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUÉ ES (recorrido 01·02·03) ── */}
        <section className="relative bg-[#F5F0E8] py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0 text-[#2E6B8A]/[0.06]">
            <ContourLines id="contour-quees" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#8A551E] mb-3">Qué es acequia</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#1A1210] leading-tight">
                Una herramienta para<br /><em>diseñar el territorio como sistema vivo.</em>
              </h2>
              <p className="mt-5 font-sans text-[#3D2010] text-lg leading-relaxed">
                El agua no es un recurso que se administra — es un sistema vivo que se puede sanar. acequia te da el mapa para empezar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {QUE_ES.map(({ n, icon: Icon, title, desc }) => (
                <div key={n} className="flex flex-col gap-4 p-8 bg-[#E8D5A3]/25 border-t-2 border-[#2E6B8A]/70 border-x border-b border-[#E8D5A3]/60">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl text-[#7FB2CC] leading-none">{n}</span>
                    <Icon size={28} className="text-[#2E6B8A]/70" />
                  </div>
                  <h3 className="font-display text-xl text-[#1A1210]">{title}</h3>
                  <p className="font-sans text-sm text-[#3D2010] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LO QUE HACE POR VOS (4 bloques) ── */}
        <section className="relative bg-[#1A1210] py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0 text-[#2E6B8A]/10">
            <ContourLines id="contour-hace" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#7FB2CC] mb-3">Lo que acequia hace por vos</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#F5F0E8] leading-tight">
                Vos marcás tu terreno.<br /><em className="text-[#7FB2CC]">acequia hace el resto.</em>
              </h2>
              <p className="mt-5 font-sans text-[#E8D5A3]/90 text-lg leading-relaxed">
                Lo que en un CAD lleva días de trabajo técnico, acá sucede al marcar el polígono.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16">
              {CLUSTERS.map(cluster => (
                <div key={cluster.label}>
                  <div className="mb-6">
                    <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-[#7FB2CC]">{cluster.label}</h3>
                    <span className="mt-2 block h-px w-10 bg-[#2E6B8A]/40" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-6">
                    {cluster.items.map(({ icon: Icon, t, d }) => (
                      <div key={t} className="flex gap-3">
                        <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-[#2E6B8A]/15 border border-[#2E6B8A]/30 flex items-center justify-center">
                          <Icon size={16} className="text-[#7FB2CC]" />
                        </div>
                        <div>
                          <h4 className="font-sans font-semibold text-sm text-[#F5F0E8] leading-tight">{t}</h4>
                          <p className="font-sans text-xs text-[#F5F0E8]/60 mt-1 leading-relaxed">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Capturas reales, con epígrafe */}
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#7FB2CC]/80 mb-6">Vélo en acción</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CAPTURAS.map(img => (
                  <figure key={img.src} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden ring-1 ring-[#2E6B8A]/20 shadow-xl shadow-[#1A1210]/40">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <figcaption className="mt-3 font-sans text-sm text-[#F5F0E8]/70">{img.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DE DÓNDE SALEN LOS NÚMEROS ── */}
        {/* La página afirmaba "con datos globales" sin decir cuáles. Nombrarlos
            con proveedor, resolución y tipo de evidencia es lo que el manual
            llama marca de confianza, y es lo único de esta landing que ningún
            competidor del rubro muestra. */}
        <section className="relative bg-[#F5F0E8] py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0 text-[#2E6B8A]/[0.06]">
            <ContourLines id="contour-fuentes" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#8A551E] mb-3">De dónde salen los números</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#1A1210] leading-tight">
                Cada dato dice quién lo midió,<br /><em>con qué resolución y hasta dónde llega.</em>
              </h2>
              <p className="mt-5 font-sans text-[#3D2010] text-lg leading-relaxed">
                Citar la fuente no es una nota al pie: es parte del producto. Dentro de acequia cada capa
                despliega su ficha, y el informe la lleva adelante.
              </p>
            </div>

            {/* Tabla en pantalla ancha, fichas apiladas en el celular: son ocho
                filas de cuatro campos, que en una grilla angosta se vuelven
                ilegibles. */}
            <div className="max-w-5xl border-t border-[#3D2010]/15">
              {/* Encabezado sólo en desktop */}
              <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto_auto] gap-6 py-3 border-b border-[#3D2010]/15">
                {['Dato', 'Fuente', 'Resolución', 'Evidencia'].map(h => (
                  <span key={h} className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#3D2010]/50">{h}</span>
                ))}
              </div>

              {FUENTES.map(f => {
                const ev = EVIDENCIA[f.evidencia];
                return (
                  <div
                    key={f.dato}
                    className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto_auto] gap-x-6 gap-y-1 py-4 border-b border-[#3D2010]/10"
                  >
                    <p className="font-sans font-semibold text-sm text-[#1A1210] leading-snug">{f.dato}</p>
                    <p className="font-sans text-sm text-[#3D2010]/80 leading-snug">{f.proveedor}</p>
                    <p className="font-mono tabular-nums text-xs text-[#3D2010]/70 md:text-right md:self-center">
                      {f.resolucion} <span className="text-[#3D2010]/40">· {f.periodo}</span>
                    </p>
                    <p className="md:self-center md:justify-self-end">
                      <span
                        title={ev.ayuda}
                        className="inline-block font-sans text-[11px] font-bold uppercase tracking-wider px-2 py-1 border"
                        style={{ color: ev.color, borderColor: `${ev.color}55`, backgroundColor: `${ev.color}0F` }}
                      >
                        {ev.label}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-4xl">
              <p className="font-sans text-sm text-[#3D2010]/75 leading-relaxed">
                <strong className="text-[#1A1210]">Observado</strong> lo midió un tercero.{' '}
                <strong className="text-[#1A1210]">Modelado</strong> es la estimación de un modelo.{' '}
                <strong className="text-[#1A1210]">Derivado</strong> lo calcula acequia sobre las capas anteriores.
              </p>
              <p className="font-sans text-sm text-[#3D2010]/75 leading-relaxed">
                La cobertura no tiene la misma calidad en todo el mundo. Cuando una fuente no alcanza para
                concluir, acequia lo dice en vez de completar el hueco.
              </p>
            </div>
          </div>
        </section>

        {/* ── PARA QUIÉN ── */}
        <section className="bg-[#E8D5A3]/20 py-20 md:py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-14 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#8A551E] mb-3">Para quién es</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#1A1210]">
                Para quien mira un terreno<br /><em>y ve posibilidades.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PERFILES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-8 bg-[#F5F0E8] border-t-2 border-[#2E6B8A]/70 border-x border-b border-[#E8D5A3]/60">
                  <div className="w-11 h-11 rounded-full bg-[#2E6B8A]/10 border border-[#2E6B8A]/25 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-[#2E6B8A]" />
                  </div>
                  <h3 className="font-display text-2xl text-[#1A1210] mb-3">{title}</h3>
                  <p className="font-sans text-sm text-[#3D2010] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANES ── */}
        <section id="planes" className="bg-[#F5F0E8] py-20 md:py-28 px-6 scroll-mt-20">
          <div className="max-w-editorial mx-auto">
            <div className="mb-6 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#8A551E] mb-3">Planes y precios</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#1A1210]">
                Empezá gratis.<br /><em>Crecé cuando el proyecto crezca.</em>
              </h2>
            </div>

            {/* Programa fundador separado de la prueba comercial. */}
            <div className="max-w-2xl mx-auto mb-12 text-center bg-[#2E6B8A]/10 border border-[#2E6B8A]/25 px-6 py-4">
              <p className="font-sans text-sm text-[#3D2010]">
                <strong className="text-[#2E6B8A]">Programa fundador:</strong> piloto cerrado de 6 a 10 participantes durante 7 días, sin costo ni tarjeta.
              </p>
            </div>

            <PlanesTerreno paisInicial={pais} />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-[#E8D5A3]/20 py-20 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#8A551E] mb-3">Preguntas frecuentes</p>
              <h2 className="font-display text-4xl text-[#1A1210]">Antes de empezar.</h2>
            </div>
            <FAQ items={FAQS} />
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section id="acequia-cta-final" className="relative bg-[#1A1210] py-20 md:py-28 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E6B8A]/20 to-[#1A1210]" />
          <div className="absolute inset-0 text-[#2E6B8A]/10">
            <ContourLines id="contour-cta" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#7FB2CC] mb-4">
              ¿Tenés un territorio esperándote?
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-[#F5F0E8] mb-6">
              Marcá tu terreno.<br /><em className="text-[#7FB2CC]">Escuchá lo que dice.</em>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={REGISTRO_URL}
                className="inline-flex items-center gap-2 bg-[#2E6B8A] text-[#F5F0E8] font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 shadow-lg shadow-[#2E6B8A]/25 hover:bg-[#4A6741] transition-all"
              >
                Trazar mi terreno, gratis <ArrowRight size={16} />
              </a>
              <Link
                href="/asesorias"
                className="inline-flex items-center border border-[#F5F0E8]/30 text-[#F5F0E8] font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-[#F5F0E8] transition-colors"
              >
                Prefiero acompañamiento humano
              </Link>
            </div>
          </div>
        </section>
      </main>
      <BarraAcequia desdeUSD={DESDE_USD} />
      <SiteFooter />
    </>
  );
}
