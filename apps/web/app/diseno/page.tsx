import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Diseño — Arte y Tierra',
  description: 'Diseño ecosistémico del territorio: bioarquitectura, hidrología regenerativa, producción agroecológica, paisajismo funcional y estrategia regenerativa. +40 proyectos en 7 países.',
};

const SERVICIOS = [
  {
    num: '01',
    title: 'Manejo del agua',
    body: 'El agua es el primer diseño. Trazamos caminos para que el agua camine despacio: zanjas de infiltración, curvas de nivel, represas, biofiltros y cosecha de lluvia. La tierra que recibe agua bien gestionada se transforma.',
    tecnicas: ['Zanjas de infiltración', 'Curvas de nivel', 'Represas y aguadas', 'Biofiltros y humedales', 'Cosecha de aguas pluviales', 'Manejo de cañadones'],
  },
  {
    num: '02',
    title: 'Vivienda y hábitat',
    body: 'Espacios que responden al territorio, al clima y a quienes los habitan. Diseñamos con geometría sagrada, materiales naturales y sistemas pasivos. Cada hogar es una obra única, irrepetible.',
    tecnicas: ['Adobe y tapial', 'Quincha y cob', 'Piedra y pirca', 'Paja apisonada', 'Techos vivos', 'Geometría bioclimática'],
  },
  {
    num: '03',
    title: 'Producción agroecológica',
    body: 'La comida surge del diseño del suelo. Integramos sistemas de producción que alimentan a quienes habitan y regeneran la tierra al mismo tiempo: bosques comestibles, huertas de zona 1, jardines medicinales.',
    tecnicas: ['Bosques comestibles', 'Huertas de zona 1', 'Jardines medicinales', 'Compostaje y lombricultura', 'Integración animal', 'Diseño de zonas'],
  },
  {
    num: '04',
    title: 'Paisajismo funcional',
    body: 'El paisaje no es decoración — es función. Diseñamos con plantas nativas e introducidas, buscando belleza, sombra, alimento, abrigo y biodiversidad. El diseño visible del territorio invisible.',
    tecnicas: ['Plantas nativas', 'Cortinas vivas', 'Setos multifunción', 'Corredores de biodiversidad', 'Revegetación de cuencas', 'Diseño de borde'],
  },
  {
    num: '05',
    title: 'Estrategia regenerativa integral',
    body: 'Cuando el proyecto supera lo edilicio. Diseñamos sistemas completos de habitar: energía, agua, alimento, residuos, comunidad. Una visión del predio como ecosistema con inteligencia propia.',
    tecnicas: ['Diagnóstico territorial', 'Plan maestro', 'Ciclos de materia', 'Energía renovable', 'Residuos como recurso', 'Estrategia comunitaria'],
  },
];

const MODOS = [
  {
    id: 'solo-diseno',
    title: 'Solo diseño',
    desc: 'Recibís los planos, memorias y especificaciones para construir con tu equipo o en etapas. Incluye acompañamiento técnico durante la obra.',
    ideal: 'Ideal si tenés equipo propio o querés construir en autoconstrucción.',
    starred: false,
  },
  {
    id: 'diseno-obra',
    title: 'Diseño + obra',
    desc: 'Nos encargamos de todo: diagnóstico, diseño, gestión de materiales y ejecución. Nuestro equipo está en el lugar durante todo el proceso.',
    ideal: 'La opción más completa. Recomendada para proyectos de mayor escala.',
    starred: true,
  },
  {
    id: 'solo-obra',
    title: 'Solo obra',
    desc: 'Ya tenés el diseño y querés que nuestro equipo lo ejecute con técnicas de bioconstrucción. Evaluamos compatibilidad antes de aceptar.',
    ideal: 'Ideal si el diseño fue realizado por otro profesional afín.',
    starred: false,
  },
  {
    id: 'consultoria',
    title: 'Consultoría puntual',
    desc: 'Una o varias sesiones técnicas para resolver preguntas específicas: materiales, sistemas de agua, orientación, estructura. Incluye informe escrito.',
    ideal: 'Ideal para proyectos en curso que necesitan orientación técnica puntual.',
    starred: false,
  },
];

const PROCESO = [
  {
    n: '01',
    title: 'Diagnóstico',
    desc: 'Escuchamos el lugar antes de dibujarlo. Analizamos el agua, el suelo, el clima, la vegetación, los sueños y las limitaciones. El diagnóstico es ya parte del diseño.',
  },
  {
    n: '02',
    title: 'Diseño',
    desc: 'Geometría, materiales, sistemas. Creamos un proyecto que responde a ese lugar y a esas personas, con toda la documentación técnica necesaria para construirlo.',
  },
  {
    n: '03',
    title: 'Implementación',
    desc: 'Acompañamos la construcción: desde la selección de materiales locales hasta los detalles de terminación. El territorio toma forma.',
  },
];

const TECNICAS = [
  'Adobe', 'Tapial', 'Quincha', 'Cob', 'Piedra pirca', 'Paja apisonada',
  'Techos vivos', 'Geometría sagrada', 'Zanjas de infiltración', 'Biofiltros',
  'Represas', 'Bosques comestibles', 'Tadelakt', 'Estucos naturales',
];

export default function DisenoPage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative h-[65vh] min-h-[440px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/servicios/1.png"
          alt="Arte y Tierra — diseño del territorio"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Diseño y servicios</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
            El valor de tu tierra<br />
            depende de cómo<br />
            <em>la diseñes.</em>
          </h1>
        </div>
      </section>

      {/* BANDA ASESORIA */}
      <section className="bg-clay-700 py-5 px-6">
        <div className="max-w-editorial mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-bone-50 text-sm">
            <strong>¿Todavía no sabés por dónde empezar?</strong> Una asesoría online (USD 60) te da claridad en 1 hora — y se descuenta si después contratás el diseño.
          </p>
          <Link
            href="/asesorias"
            className="whitespace-nowrap bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3 hover:bg-ink-800 transition-colors flex-shrink-0"
          >
            Agendar asesoría →
          </Link>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">El problema</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6">
              Muchos proyectos<br />nacen sin escuchar<br /><em>el territorio.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-4">
              Un cañadón mal manejado pierde 30 cm de suelo por año. Una casa mal orientada consume 3 veces más energía. Un diseño que ignora el agua convierte la tierra en un problema en lugar de un recurso.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              La diferencia entre un predio que prospera y uno que lucha no suele ser el presupuesto. Es el orden de las decisiones y la calidad de la escucha inicial.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/img/servicios/2.png"
              alt="Diagnóstico territorial — Arte y Tierra"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* TRABAJAMOS DISTINTO */}
      <section className="bg-ink-950 py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-5">Nuestra propuesta</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8">
            Trabajamos distinto.
          </h2>
          <p className="font-display text-2xl text-bone-200 italic leading-relaxed mb-8">
            &ldquo;No imponemos una forma sobre el territorio — aprendemos su forma y la acompañamos.&rdquo;
          </p>
          <p className="font-sans text-bone-200 text-base leading-relaxed">
            Cada proyecto empieza con una escucha profunda del lugar: el agua, el suelo, el clima, la vegetación, la historia. Diseñamos con geometría sagrada, materiales naturales del lugar y sistemas que funcionan sin necesidad de energía externa.
          </p>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-bone-100 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-14">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Áreas de trabajo</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">
              Cinco sistemas,<br />
              <em>un territorio.</em>
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-bone-200">
            {SERVICIOS.map(s => (
              <div key={s.num} className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-xs font-sans font-bold text-clay-500 uppercase tracking-widest">{s.num}</span>
                    <h3 className="font-display text-2xl md:text-3xl text-ink-950">{s.title}</h3>
                  </div>
                  <p className="font-sans text-base text-ink-700 leading-relaxed">{s.body}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.tecnicas.map(t => (
                    <span key={t} className="text-xs font-sans font-semibold uppercase tracking-wider text-clay-700 bg-clay-100 border border-clay-200 px-3 py-1.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODOS DE CONTRATACIÓN */}
      <section className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">¿Cómo trabajamos?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">
              Cuatro formas<br />de <em>contratarnos.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MODOS.map(m => (
              <div key={m.id} className={`p-8 flex flex-col gap-4 ${m.starred ? 'bg-clay-700' : 'bg-bone-100 border border-bone-200'}`}>
                {m.starred && (
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">Más elegido</span>
                )}
                <h3 className={`font-display text-2xl ${m.starred ? 'text-bone-50' : 'text-ink-950'}`}>{m.title}</h3>
                <p className={`font-sans text-base leading-relaxed ${m.starred ? 'text-clay-100' : 'text-ink-700'}`}>{m.desc}</p>
                <p className={`font-sans text-sm mt-auto ${m.starred ? 'text-clay-200' : 'text-clay-700'}`}>{m.ideal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-ink-950 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-14">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-3">El proceso</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              De la escucha<br />a la <em>obra.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESO.map(p => (
              <div key={p.n} className="flex flex-col gap-4 p-8 border border-ink-700">
                <span className="font-display text-5xl text-clay-700">{p.n}</span>
                <h3 className="font-display text-2xl text-bone-50">{p.title}</h3>
                <p className="font-sans text-base text-bone-200 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉCNICAS */}
      <section className="bg-bone-50 py-16 px-6 border-y border-bone-200">
        <div className="max-w-editorial mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-6 text-center">
            Técnicas que dominamos
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {TECNICAS.map(t => (
              <span key={t} className="text-sm font-sans font-semibold uppercase tracking-wider text-clay-800 bg-bone-100 border border-clay-200 px-4 py-2">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ALCANCE */}
      <section className="bg-bone-100 py-16 px-6">
        <div className="max-w-editorial mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Alcance internacional</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink-950 mb-4">
            Trabajamos en cualquier<br />parte del <em>mundo.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-xl mx-auto">
            Proyectos realizados en Argentina · Colombia · Perú · Bolivia · Ecuador · Italia · Francia
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-clay-700 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">
          El primer paso es conocer tu tierra
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
          Empezá con una<br /><em>asesoría online.</em>
        </h2>
        <p className="font-sans text-bone-100 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          1 hora con nuestro equipo. Revisamos tu terreno, tu agua, tus ideas y posibilidades.
          Si después contratás el diseño, los USD 60 se descuentan.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/asesorias"
            className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-800 transition-colors"
          >
            Agendar asesoría →
          </Link>
          <Link
            href="/proyectos"
            className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
          >
            Ver proyectos
          </Link>
        </div>
      </section>
    </main>
  );
}
