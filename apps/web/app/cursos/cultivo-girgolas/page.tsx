import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CarouselGirgolas } from '@/components/cursos/CarouselGirgolas';

export const metadata: Metadata = {
  title: 'Cultivo de Gírgolas — Arte y Tierra',
  description: 'Tres encuentros presenciales en Tay Pichín para aprender todo el proceso del cultivo de hongos: micelio, sustrato e incubación, cosecha y escalado. FUNGO × Arte y Tierra.',
  alternates: { canonical: '/cursos/cultivo-girgolas' },
};

const MODULOS = [
  {
    num: 'I',
    fecha: '11 jul · 2026',
    dia: 'Sábado',
    title: 'Biología del hongo y producción de micelio',
    nota: 'Para curiosos, principiantes y quienes quieren meterse en el lado más de laboratorio del cultivo.',
    accent: 'border-clay-500',
    items: [
      'Funcionamiento del hongo y ciclo de vida',
      'Qué es el micelio y por qué es la clave',
      'Tipos de inóculo, grano y esterilización',
      'Prevención y manejo de contaminaciones',
      'Práctica: inoculación de frascos con grano',
    ],
  },
  {
    num: 'II',
    fecha: '1 ago · 2026',
    dia: 'Sábado',
    title: 'Sustrato, inoculación e incubación',
    nota: 'Pensado para quienes quieren producir en casa sin montar un laboratorio.',
    accent: 'border-moss-600',
    items: [
      'Tipos de sustrato y preparación',
      'Pasteurización y esterilización simple',
      'Inoculación sin laboratorio',
      'Condiciones de incubación',
      'Práctica: preparación y siembra de bolsas',
    ],
  },
  {
    num: 'III',
    fecha: '22 ago · 2026',
    dia: 'Sábado',
    title: 'Fructificación, cosecha y escalado',
    nota: 'Para quienes quieren escalar la producción o emprender con hongos.',
    accent: 'border-ink-400',
    items: [
      'Desencadenantes de la fructificación',
      'Condiciones de temperatura y humedad',
      'Cosecha en el momento justo',
      'Conservación y uso culinario',
      'Práctica: mantenimiento del cultivo y primeras cosechas',
    ],
  },
];

export default function CultivoGirgolesPage() {
  return (
    <main>

      {/* HERO */}
      <section className="relative h-[65vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/cursos/cultivo-girgolas/1.jpg"
          alt="Cultivo de Gírgolas — FUNGO × Tay Pichín"
          fill priority className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/cursos" className="text-xs font-sans text-clay-300 hover:text-bone-100 uppercase tracking-widest">
              Cursos
            </Link>
            <span className="text-clay-500 text-xs">›</span>
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 bg-clay-700/60 px-2.5 py-1">
              Taller modular · FUNGO × Tay Pichín
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            Cultivo de <em>Gírgolas.</em>
          </h1>
          <p className="mt-4 text-bone-200 font-sans text-lg max-w-xl leading-relaxed">
            Tres encuentros para recorrer todo el proceso: desde entender cómo vive y crece un hongo hasta llegar a la cosecha. Sumate al ciclo completo o elegí el módulo que más te resuene.
          </p>
          <p className="mt-3 text-clay-300 font-sans text-sm font-semibold">
            11 jul · 1 ago · 22 ago 2026 · Ecoescuela Tay Pichín · San Marcos Sierras
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#inscribirme"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
              Inscribirme →
            </a>
            <a href="#programa"
              className="inline-flex border border-bone-50/40 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors">
              Ver programa
            </a>
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="bg-clay-700 py-6 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Fechas',    val: '11 jul · 1 ago · 22 ago 2026' },
            { label: 'Lugar',     val: 'Tay Pichín · San Marcos Sierras' },
            { label: 'Modalidad', val: 'Presencial · módulos independientes' },
            { label: 'Facilita',  val: 'FUNGO · Co-organiza Arte y Tierra' },
          ].map(d => (
            <div key={d.label}>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-1">{d.label}</p>
              <p className="font-sans text-sm font-semibold text-bone-50">{d.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-5">El taller</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8">
            Del micelio<br /><em>a la cosecha.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 leading-relaxed mb-4">
            Un taller intensivo, práctico y con los pies en la tierra para quienes se acercan por primera vez al mundo de los hongos — o para quienes quieren ir un paso más allá en su producción.
          </p>
          <p className="font-sans text-base text-ink-700 leading-relaxed">
            El formato modular permite sumarse al ciclo completo o elegir el encuentro que más resuene con cada interés: laboratorio, autoproducción doméstica o emprendimiento. Cada módulo es una unidad cerrada e independiente.
          </p>
        </div>
      </section>

      {/* PROGRAMA */}
      <section id="programa" className="bg-ink-950 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-16 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Contenidos</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              El <em>programa.</em>
            </h2>
            <p className="mt-4 font-sans text-bone-100 text-base max-w-xl mx-auto">
              Tres sábados, tres mundos dentro del mismo organismo vivo. Podés venir a uno, dos o los tres.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {MODULOS.map(mod => (
              <div key={mod.num} className={`grid grid-cols-1 md:grid-cols-[180px_1fr] overflow-hidden bg-ink-900 border-l-4 ${mod.accent}`}>
                {/* Fecha / Número lateral */}
                <div className="bg-ink-800 flex flex-col items-center justify-center p-8 text-center gap-2">
                  <span className="font-display text-6xl text-clay-300 leading-none">{mod.num}</span>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-bone-50 mt-3">{mod.fecha}</p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-bone-300">{mod.dia}</p>
                </div>
                {/* Contenido */}
                <div className="p-8">
                  <h3 className="font-display text-2xl md:text-3xl text-bone-50 mb-4 leading-snug">{mod.title}</h3>
                  {/* Nota — para quién es este módulo */}
                  <div className="bg-clay-700/30 border-l-2 border-clay-400 pl-4 py-2 mb-6">
                    <p className="font-sans text-sm text-clay-200 italic leading-relaxed">{mod.nota}</p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mod.items.map(item => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="text-clay-300 mt-0.5 flex-shrink-0 font-bold text-base leading-tight">·</span>
                        <span className="font-sans text-sm text-bone-100 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARRUSEL */}
      <CarouselGirgolas />

      {/* FACILITADOR */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Quién te acompaña</p>
            <h2 className="font-display text-4xl text-ink-950">El <em>facilitador.</em></h2>
          </div>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-0 bg-bone-50 overflow-hidden">
            <div className="relative w-full sm:w-52 aspect-square sm:aspect-auto sm:min-h-[300px] flex-shrink-0 overflow-hidden">
              <Image
                src="/img/cursos/cultivo-girgolas/Emmanuel.jpeg"
                alt="Emmanuel Ciancio Manzoni"
                fill className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, 208px"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center gap-3">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">Cultivador · Productor de micelio</p>
              <h3 className="font-display text-2xl text-ink-950">Emmanuel Ciancio Manzoni</h3>
              <p className="font-sans text-sm text-ink-700 leading-relaxed">
                Hace más de 9 años, su interés por el reino fungi cambió el rumbo de su vida. Lo que empezó como una curiosidad se convirtió en vocación: cultivar, aprender y compartir todo lo que los hongos tienen para ofrecer. Productor de micelio, extractos y kits de cultivo, acompaña a quienes sienten que hay algo fascinante detrás de estos organismos y quieren dar sus primeros pasos. Su objetivo es acercar el mundo de los hongos adaptógenos y comestibles a la vida cotidiana, de forma práctica, accesible y con la misma pasión con la que empezó.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="inscribirme" className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Inversión</p>
            <h2 className="font-display text-4xl text-ink-950">Cómo <em>sumarte.</em></h2>
            <p className="mt-4 font-sans text-ink-700 text-base max-w-lg mx-auto">
              Cada módulo es una unidad cerrada e independiente — podés sumarte en cualquier momento del ciclo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-bone-100 border border-bone-200 p-8 flex flex-col gap-4">
              <h3 className="font-display text-xl text-ink-950">Módulo suelto</h3>
              <div className="font-display text-3xl text-ink-950">Consultanos</div>
              <ul className="flex flex-col gap-2 mt-1 flex-1">
                {['Un encuentro presencial', 'Materiales incluidos', 'Práctica con insumos reales'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs font-sans text-ink-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-clay-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20Taller%20de%20Cultivo%20de%20G%C3%ADrgolas"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex justify-center bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-900 transition-colors">
                Consultar →
              </a>
            </div>
            <div className="bg-clay-700 p-8 flex flex-col gap-4">
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">Recomendado</span>
              <h3 className="font-display text-xl text-bone-50">Ciclo completo · 3 módulos</h3>
              <div className="font-display text-3xl text-bone-50">Consultanos</div>
              <ul className="flex flex-col gap-2 mt-1 flex-1">
                {['Los 3 encuentros presenciales', 'Materiales incluidos', 'Precio especial ciclo completo'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs font-sans text-clay-100">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-clay-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20al%20ciclo%20completo%20de%20Cultivo%20de%20G%C3%ADrgolas"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex justify-center bg-bone-50 text-clay-900 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-bone-200 transition-colors">
                Inscribirme al ciclo →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-clay-100 border-t border-clay-200 py-16 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">¿Venís desde lejos?</p>
        <h2 className="font-display text-3xl text-ink-950 mb-4">
          Quedáte en <em>Tay Pichín.</em>
        </h2>
        <p className="font-sans text-ink-700 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          El taller se desarrolla en la Ecoescuela. Podés hospedarte ahí mismo y vivir la experiencia completa.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20Taller%20de%20Cultivo%20de%20G%C3%ADrgolas"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors">
            WhatsApp →
          </a>
          <Link href="/hospedaje"
            className="inline-flex border border-clay-700 text-clay-700 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-clay-200 transition-colors">
            Ver Tay Pichín →
          </Link>
        </div>
      </section>

    </main>
  );
}
