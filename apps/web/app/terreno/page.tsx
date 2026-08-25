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
import { REGISTRO_URL, FUNDADORES_CUPO } from '@/lib/terreno/planes';

export const metadata: Metadata = {
  title: 'Terreno — Del terreno al masterplan',
  description:
    'Topografía, análisis de agua, suelo, clima, represas, contexto ecosistémico y diseño Keyline — todo a partir de marcar tu predio, sin CAD ni GIS y con datos globales. Empezá gratis.',
  // Landing en modo privado por ahora: no la mostramos en la navegación ni la
  // indexamos. Sigue accesible por link directo para compartir en privado.
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Terreno — Del terreno al masterplan | Arte y Tierra',
    description:
      'Marcá tu predio y Terreno hace el resto: topografía, agua, suelo, clima, represas y diseño regenerativo en un solo lugar.',
    images: [{ url: '/img/terreno/og.png', width: 1200, height: 630, alt: 'Terreno — Del terreno al masterplan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terreno — Del terreno al masterplan',
    description:
      'Topografía, agua, suelo, clima, represas y diseño Keyline — al marcar tu predio, sin CAD ni GIS.',
    images: ['/img/terreno/og.png'],
  },
};

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
      { icon: FileText,  t: 'Informe técnico', d: 'Descargable y compartible por link, con todo el estudio.' },
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
  { icon: Globe,             t: 'Datos globales', d: 'Sirve en cualquier parte del mundo.' },
  { icon: Gift,              t: 'Empezá gratis', d: 'Sin tarjeta, sin permanencia.' },
  { icon: ShieldCheck,       t: 'Tus proyectos, privados', d: 'Solo vos los ves.' },
];

const PERFILES = [
  {
    icon: GraduationCap,
    title: 'Practicantes',
    desc: 'Estás aprendiendo permacultura o querés entender tu propio terreno, a tu ritmo.',
  },
  {
    icon: Compass,
    title: 'Diseñadores y profesionales',
    desc: 'Hacés masterplans para comitentes y necesitás entregar con tu marca y en tiempo.',
  },
  {
    icon: Home,
    title: 'Familias y proyectos',
    desc: 'Tenés un campo y un sueño. Empezá por escuchar lo que el territorio ya te dice.',
  },
];

// [TODO Jonatan] revisar respuestas de las FAQ.
const FAQS = [
  { q: '¿Qué necesito para usar Terreno?', a: 'Sólo un navegador. Funciona online, sin instalar nada ni comprar instrumentos. Entrás, marcás tu terreno y empezás.' },
  { q: '¿Funciona en el celular?', a: 'Sí, podés medir y dibujar desde el celular. Para el trabajo de diseño y los informes largos se disfruta más en una pantalla grande.' },
  { q: '¿Sirve fuera de Argentina?', a: 'Sí. Los datos de elevación, clima, suelo y biodiversidad son globales, así que Terreno funciona en cualquier parte del mundo.' },
  { q: '¿Qué pasa con mis datos y mis proyectos?', a: 'Son tuyos y privados. Se guardan en tu cuenta y sólo vos los ves, salvo que decidas compartir el informe por link.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, sin permanencia. Si dejás de pagar, tu cuenta vuelve al plan Semilla y conservás tu proyecto.' },
  { q: '¿Cuál es la diferencia entre los planes?', a: 'Semilla mide y dibuja, gratis. Personal desbloquea todo el análisis y el diseño para hasta 2 proyectos. Diseñador es lo mismo, sin límite de proyectos. Estudio agrega tu marca propia en los informes, exportación CAD y trabajo en equipo.' },
  { q: '¿Cómo se paga desde otros países?', a: 'Desde Argentina, por Mercado Pago en pesos. Desde el resto del mundo, por PayPal en USD. La página muestra la moneda según desde dónde entrás.' },
  { q: '¿Necesito saber de CAD o GIS?', a: 'No. Lo que en un software técnico lleva días de trabajo, en Terreno sucede al marcar el polígono de tu terreno.' },
];

// ─── Página ──────────────────────────────────────────────────────────────────

export default async function TerrenoLanding() {
  const pais = (await headers()).get('x-vercel-ip-country') ?? undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Terreno',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: 'https://terreno.arteytierra.org',
    description:
      'Plataforma de análisis y diseño territorial regenerativo: catastro, topografía, análisis hidrológico y masterplan de permacultura online.',
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
        <section className="relative bg-ink-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-water-500/25 via-ink-950 to-ink-950" />
          <div className="absolute inset-0 text-water-500/15">
            <ContourLines id="contour-hero" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300 mb-4">
                Terreno · Diseño territorial regenerativo
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-[1.05]">
                Del terreno<br /><em className="text-water-300">al masterplan.</em>
              </h1>
              <p className="mt-6 font-sans text-lg text-bone-200 max-w-lg leading-relaxed">
                Topografía, análisis de agua, suelo, clima, represas, contexto ecosistémico y Keyline.
                Todo a partir de marcar tu predio — <span className="text-bone-50">sin CAD ni GIS</span> y con datos globales.
                Empezá gratis.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={REGISTRO_URL}
                  className="inline-flex items-center gap-2 bg-water-500 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 shadow-lg shadow-water-500/25 hover:bg-moss-700 hover:shadow-water-500/10 transition-all"
                >
                  Empezá gratis <ArrowRight size={16} />
                </a>
                <a
                  href="#planes"
                  className="inline-flex items-center border border-bone-50/30 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
                >
                  Ver planes
                </a>
              </div>
            </div>
            <div className="relative">
              {/* Glow turquesa detrás de la captura */}
              <div className="absolute -inset-4 bg-water-500/20 blur-3xl rounded-full" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden ring-1 ring-water-500/30 shadow-2xl shadow-ink-950/60">
                <Image
                  src="/img/terreno/topografia.webp"
                  alt="Análisis topográfico de un terreno en Terreno"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── BANDA DE CONFIANZA ── */}
        <section className="bg-ink-900 border-y border-water-500/15 px-6 py-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {CONFIANZA.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-center gap-3">
                <Icon size={22} className="text-water-300 flex-shrink-0" />
                <div>
                  <p className="font-sans font-semibold text-sm text-bone-50 leading-tight">{t}</p>
                  <p className="font-sans text-xs text-bone-200/60 leading-tight mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUÉ ES (recorrido 01·02·03) ── */}
        <section className="relative bg-bone-50 py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0 text-water-500/[0.06]">
            <ContourLines id="contour-quees" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Qué es Terreno</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 leading-tight">
                Una herramienta para<br /><em>diseñar el territorio como sistema vivo.</em>
              </h2>
              <p className="mt-5 font-sans text-ink-700 text-lg leading-relaxed">
                El agua no es un recurso que se administra — es un sistema vivo que se puede sanar. Terreno te da el mapa para empezar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {QUE_ES.map(({ n, icon: Icon, title, desc }) => (
                <div key={n} className="flex flex-col gap-4 p-8 bg-bone-100 border-t-2 border-water-500/70 border-x border-b border-bone-200">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl text-water-300 leading-none">{n}</span>
                    <Icon size={28} className="text-water-500/70" />
                  </div>
                  <h3 className="font-display text-xl text-ink-950">{title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LO QUE HACE POR VOS (4 bloques) ── */}
        <section className="relative bg-ink-950 py-20 md:py-28 px-6 overflow-hidden">
          <div className="absolute inset-0 text-water-500/10">
            <ContourLines id="contour-hace" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-editorial mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300 mb-3">Lo que Terreno hace por vos</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
                Vos marcás tu terreno.<br /><em className="text-water-300">Terreno hace el resto.</em>
              </h2>
              <p className="mt-5 font-sans text-bone-200 text-lg leading-relaxed">
                Lo que en un CAD lleva días de trabajo técnico, acá sucede al marcar el polígono.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16">
              {CLUSTERS.map(cluster => (
                <div key={cluster.label}>
                  <div className="mb-6">
                    <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-water-300">{cluster.label}</h3>
                    <span className="mt-2 block h-px w-10 bg-water-500/40" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-6">
                    {cluster.items.map(({ icon: Icon, t, d }) => (
                      <div key={t} className="flex gap-3">
                        <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-water-500/15 border border-water-500/30 flex items-center justify-center">
                          <Icon size={16} className="text-water-300" />
                        </div>
                        <div>
                          <h4 className="font-sans font-semibold text-sm text-bone-50 leading-tight">{t}</h4>
                          <p className="font-sans text-xs text-bone-200/60 mt-1 leading-relaxed">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Capturas reales, con epígrafe */}
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300/80 mb-6">Vélo en acción</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CAPTURAS.map(img => (
                  <figure key={img.src} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden ring-1 ring-water-500/20 shadow-xl shadow-ink-950/40">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <figcaption className="mt-3 font-sans text-sm text-bone-200/70">{img.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUIÉN ── */}
        <section className="bg-bone-100 py-20 md:py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-14 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Para quién es</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Para quien mira un terreno<br /><em>y ve posibilidades.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PERFILES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-8 bg-bone-50 border-t-2 border-water-500/70 border-x border-b border-bone-200">
                  <div className="w-11 h-11 rounded-full bg-water-500/10 border border-water-500/25 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-water-500" />
                  </div>
                  <h3 className="font-display text-2xl text-ink-950 mb-3">{title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANES ── */}
        <section id="planes" className="bg-bone-50 py-20 md:py-28 px-6 scroll-mt-20">
          <div className="max-w-editorial mx-auto">
            <div className="mb-6 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Planes y precios</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Empezá gratis.<br /><em>Crecé cuando el proyecto crezca.</em>
              </h2>
            </div>

            {/* Banner Fundadores — TODO: mecánica exacta */}
            <div className="max-w-2xl mx-auto mb-12 text-center bg-water-500/10 border border-water-500/25 px-6 py-4">
              <p className="font-sans text-sm text-ink-800">
                <strong className="text-water-500">Miembros Fundadores:</strong> los primeros {FUNDADORES_CUPO} conservan 50% de descuento de por vida.
              </p>
            </div>

            <PlanesTerreno paisInicial={pais} />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-bone-100 py-20 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Preguntas frecuentes</p>
              <h2 className="font-display text-4xl text-ink-950">Antes de empezar.</h2>
            </div>
            <FAQ items={FAQS} />
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="relative bg-ink-950 py-20 md:py-28 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-water-500/20 to-ink-950" />
          <div className="absolute inset-0 text-water-500/10">
            <ContourLines id="contour-cta" className="h-full w-full" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300 mb-4">
              ¿Tenés un territorio esperándote?
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-6">
              Marcá tu terreno.<br /><em className="text-water-300">Escuchá lo que dice.</em>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={REGISTRO_URL}
                className="inline-flex items-center gap-2 bg-water-500 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 shadow-lg shadow-water-500/25 hover:bg-moss-700 transition-all"
              >
                Empezá gratis con Semilla <ArrowRight size={16} />
              </a>
              <Link
                href="/asesorias"
                className="inline-flex items-center border border-bone-50/30 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
              >
                Prefiero acompañamiento humano
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
