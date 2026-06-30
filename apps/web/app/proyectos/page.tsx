import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectCard, type Project } from '@/components/proyectos/ProjectCard';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: '+40 proyectos de bioarquitectura, diseño hidrológico y paisaje en Argentina, Colombia, Perú, Bolivia, Italia y Francia.',
};

function photos(folder: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/img/proyectos/${folder}/${i + 1}.jpg`);
}

const PROJECTS: Project[] = [
  {
    slug: 'armonia',
    name: 'Proyecto Armonía',
    type: 'Bioarquitectura + Hidrología',
    meta: 'Capilla del Monte, Córdoba, Argentina · 2025',
    tags: ['Diseño + Obra', '104 m² + 37 m²', 'Liliana Gaiarín'],
    desc: 'Hogar diseñado con arquitectura bioclimática y geometría sagrada (dos rectángulos áureos y curva Fibonacci). Vista al Cerro Uritorco. Invernadero como sistema pasivo de calefacción/refrigeración, muros de adobe, 3 cubiertas vegetalizadas. Diseño hidrológico integrado: terrazas, reservorios, bosque comestible y biojardineras.',
    photos: photos('armonia', 30),
  },
  {
    slug: 'alihuen',
    name: 'Casa Alihuen',
    type: 'Bioarquitectura',
    meta: 'Santa Isabel, Córdoba, Argentina · 2024',
    tags: ['Diseño + Obra', '9 meses', 'Silvia y Alejandro'],
    desc: 'Hogar en una reserva de bosque nativo del valle de Punilla. Geometría hexagonal con espiral de Fibonacci, paneles solares, biofiltros para aguas grises y negras, techos vivos con autoriego e infiltración de aguas pluviales. Muros de adobe, revoques de barro y cal, interiores con estucos tipo tadelakt.',
    photos: [
      ...photos('alihuen', 11),
      '/img/proyectos/alihuen/12.jpg',
      '/img/proyectos/alihuen/13.png',
      '/img/proyectos/alihuen/14.png',
    ],
  },
  {
    slug: 'sol',
    name: 'Casa del Sol',
    type: 'Bioarquitectura',
    meta: 'Santa Isabel, Córdoba, Argentina · 2023',
    tags: ['Diseño + Obra', 'Susana e hijos', 'Construcción participativa'],
    desc: 'Diseñada a partir del espiral de Fibonacci. Dos plantas: PB con sala-cocina-comedor y baño en muros de adobe; PA con habitación en quincha reforzada (resistencia sísmica). Techos vivos en paraboloides hiperbólicos, ventilación cruzada y orientación estratégica. Construida con voluntariado y talleres abiertos.',
    photos: photos('sol', 23),
  },
  {
    slug: 'aurea',
    name: 'Casa Aurea',
    type: 'Bioarquitectura',
    meta: 'San Marcos Sierras, Córdoba, Argentina · 2022–2026',
    tags: ['Diseño + Obra', 'Pircas · Quincha · Cob · Paja apisonada'],
    desc: 'Vivienda de proceso largo en San Marcos Sierras. Combina pircas de piedra, quincha, cob y paja apisonada — un compendio de técnicas con tierra cruda integradas al paisaje serrano cordobés. Diseño desde cero: del análisis del sitio a las terminaciones.',
    photos: photos('aurea', 10),
  },
  {
    slug: 'chelo',
    name: 'La Casa del Chelo',
    type: 'Bioarquitectura',
    meta: 'María Juana, Santa Fé, Argentina · 2019',
    tags: ['Diseño + Obra', '9 meses', 'Marcelo Notta'],
    desc: 'El sueño del Chelo: un hogar nuevo para él y su familia. Diseñada bajo conceptos de arquitectura bioclimática, geometría sagrada (flor de la vida) y radiestesia. Solo 2 ángulos rectos pese a sus líneas rectas; orientación solar. 3 techos vivos, fitotratamiento de aguas grises y negras, termotanque solar. Construida con voluntarios y talleres.',
    photos: photos('chelo', 10),
  },
  {
    slug: 'sum-arbol-piedra',
    name: 'SUM Árbol de Piedra',
    type: 'Bioarquitectura',
    meta: 'San Marcos Sierras, Córdoba, Argentina',
    tags: ['Diseño + Obra', 'Espacio comunitario'],
    desc: 'Salón de usos múltiples construido con materiales naturales de la zona. Piedra, madera y tierra se combinan para crear un espacio comunitario integrado al paisaje serrano.',
    photos: photos('sum-arbol-piedra', 6),
  },
];

export default function ProyectosPage() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] bg-ink-950 flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/img/proyectos/portada/1.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/30 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Proyectos</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight">
            Cada proyecto,<br />
            <em>un territorio distinto.</em>
          </h1>
          <p className="mt-4 text-bone-200 font-sans text-lg max-w-xl">
            +40 proyectos realizados en Argentina, Colombia, Perú, Bolivia, Italia y Francia. Cada lugar tiene su propio lenguaje — y cada obra responde a él.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="divide-y divide-bone-200">
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.slug} project={project} reverse={i % 2 === 1} />
        ))}
      </section>

      {/* CTA */}
      <section className="bg-clay-700 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">
          ¿Te imaginás algo así en tu tierra?
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-4">
          Empezá con una <em>asesoría online.</em>
        </h2>
        <p className="text-bone-100 font-sans text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          1 hora con nuestro equipo · revisamos tu terreno, agua, ideas y posibilidades. Si después
          contratás el diseño, los USD 60 se descuentan.
        </p>
        <Link
          href="/asesorias"
          className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-800 transition-colors"
        >
          Agendar asesoría →
        </Link>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
