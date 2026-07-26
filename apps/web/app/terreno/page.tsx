import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ruler, Mountain, Droplets, CloudRain, Layers, Trees, Bird,
  Waypoints, Sprout, Route, Lightbulb, FileText, ArrowRight,
} from 'lucide-react';
import { FAQ } from '@arteytierra/ui/marketing';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { PlanesTerreno } from '@/components/terreno/PlanesTerreno';
import { REGISTRO_URL } from '@/lib/terreno/planes';

export const metadata: Metadata = {
  title: 'Terreno — Plataforma de diseño territorial regenerativo',
  description:
    'Análisis hidrológico, topografía y masterplan de permacultura online. Marcá tu terreno y Terreno calcula superficie, agua, relieve, suelo y diseño Keyline. Empezá gratis.',
  openGraph: {
    title: 'Terreno — Plataforma de diseño territorial regenerativo | Arte y Tierra',
    description:
      'Marcá tu terreno y Terreno hace el resto: catastro, topografía, agua y diseño regenerativo en un solo lugar.',
    images: ['/img/terreno/topografia.webp'], // TODO: imagen Open Graph propia 1200×630
  },
};

// ─── Datos ──────────────────────────────────────────────────────────────────

const QUE_ES = [
  {
    n: '01',
    title: 'Medí tu territorio',
    desc: 'Mojones con precisión de campo, superficie, perímetro y rumbos — desde el navegador, sin instrumentos.',
  },
  {
    n: '02',
    title: 'Entendé tu agua',
    desc: 'Cómo escurre, dónde se capta, dónde se infiltra y se retiene. El agua como sistema vivo, no como recurso.',
  },
  {
    n: '03',
    title: 'Diseñá en clave regenerativa',
    desc: 'Keyline, sistemas agroforestales, riego y pastoreo. El masterplan completo, guiado por el terreno.',
  },
];

const AUTOMATICO = [
  { icon: Ruler,     t: 'Superficie, perímetro y rumbos', d: 'Calculados al instante desde los mojones que marcás.' },
  { icon: Mountain,  t: 'Topografía completa', d: 'Pendientes, orientaciones, curvas de nivel, relieve y vista 3D.' },
  { icon: Droplets,  t: 'Análisis hidrológico', d: 'Escurrimiento, zonas de captación, cuenca, infiltración y retención.' },
  { icon: CloudRain, t: 'Clima y extremos', d: 'Lluvia, temperatura, evapotranspiración, heladas y sequías.' },
  { icon: Layers,    t: 'Suelo', d: 'Textura, materia orgánica y agua útil (SoilGrids).' },
  { icon: Trees,     t: 'Cobertura del suelo', d: 'Qué crece hoy sobre el terreno, por porcentaje.' },
  { icon: Bird,      t: 'Biodiversidad del entorno', d: 'Especies registradas alrededor de tu predio (GBIF).' },
  { icon: Waypoints, t: 'Diseño Keyline y agroforestal', d: 'Líneas maestras y sistemas de plantación sobre el relieve.' },
  { icon: Sprout,    t: 'Riego y pastoreo', d: 'Riego por evapotranspiración (FAO-56) y pastoreo rotativo (PRV).' },
  { icon: Route,     t: 'Aguadas, caminos y red de agua', d: 'Infraestructura de agua y accesos, dimensionada.' },
  { icon: Lightbulb, t: 'Sugerencias automáticas', d: 'Recomendaciones de diseño a partir del análisis del terreno.' },
  { icon: FileText,  t: 'Informe técnico', d: 'Descargable y compartible por link, con todo el estudio.' },
];

const PERFILES = [
  {
    title: 'Practicantes',
    desc: 'Estás aprendiendo permacultura o querés entender tu propio terreno, a tu ritmo.',
  },
  {
    title: 'Diseñadores y profesionales',
    desc: 'Hacés masterplans para comitentes y necesitás entregar con tu marca y en tiempo.',
  },
  {
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
  { q: '¿Cuál es la diferencia entre los planes?', a: 'Semilla mide y dibuja, gratis. Diseñador desbloquea todo el análisis y las herramientas de diseño. Estudio agrega tu marca propia en los informes, exportación CAD y trabajo en equipo.' },
  { q: '¿Cómo se paga desde otros países?', a: 'En Argentina, por Mercado Pago en pesos. En el resto del mundo, con tarjeta internacional. Los precios están en USD y se convierten al cambio del día.' },
  { q: '¿Necesito saber de CAD o GIS?', a: 'No. Lo que en un software técnico lleva días de trabajo, en Terreno sucede al marcar el polígono de tu terreno.' },
];

// ─── Página ──────────────────────────────────────────────────────────────────

export default function TerrenoLanding() {
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
          <div className="relative z-10 max-w-editorial mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300 mb-4">
                Terreno · Plataforma de diseño territorial
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-[1.05]">
                El territorio<br />te habla.<br />
                <em className="text-water-300">Terreno lo traduce.</em>
              </h1>
              <p className="mt-6 font-sans text-lg text-bone-200 max-w-md leading-relaxed">
                Análisis y diseño territorial regenerativo: catastro, topografía, agua y diseño, en un solo lugar.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={REGISTRO_URL}
                  className="inline-flex items-center gap-2 bg-water-500 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-moss-700 transition-colors"
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
            <div className="relative aspect-[4/3] overflow-hidden border border-bone-50/10 shadow-2xl shadow-ink-950/50">
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
        </section>

        {/* ── QUÉ ES ── */}
        <section className="bg-bone-50 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
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
              {QUE_ES.map(item => (
                <div key={item.n} className="flex flex-col gap-4 p-8 bg-bone-100 border border-bone-200">
                  <span className="font-display text-5xl text-water-300">{item.n}</span>
                  <h3 className="font-display text-xl text-ink-950">{item.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LO QUE HACE POR VOS ── */}
        <section className="bg-ink-950 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-water-300 mb-3">Lo que Terreno hace por vos</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
                Vos marcás tu terreno.<br /><em className="text-water-300">Terreno hace el resto.</em>
              </h2>
              <p className="mt-5 font-sans text-bone-200 text-lg leading-relaxed">
                Lo que en un CAD lleva días de trabajo técnico, acá sucede al marcar el polígono.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mb-16">
              {AUTOMATICO.map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-water-500/15 border border-water-500/30 flex items-center justify-center">
                    <Icon size={18} className="text-water-300" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-bone-50">{t}</h3>
                    <p className="font-sans text-sm text-bone-200/70 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Capturas reales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { src: '/img/terreno/vista3d.webp', alt: 'Vista 3D del relieve del terreno' },
                { src: '/img/terreno/reddeagua.webp', alt: 'Red de agua y escurrimiento' },
                { src: '/img/terreno/sectores.webp', alt: 'Sectores de diseño sobre el mapa' },
              ].map(img => (
                <div key={img.src} className="relative aspect-[4/3] overflow-hidden border border-bone-50/10">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              ))}
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
              {PERFILES.map(p => (
                <div key={p.title} className="p-8 bg-bone-50 border border-bone-200">
                  <h3 className="font-display text-2xl text-ink-950 mb-3">{p.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.desc}</p>
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
                <strong className="text-water-500">Miembros Fundadores:</strong> los primeros 100 conservan 50% de descuento de por vida.
              </p>
            </div>

            <PlanesTerreno />
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
                className="inline-flex items-center gap-2 bg-water-500 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-moss-700 transition-colors"
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
