import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectCard } from '@/components/proyectos/ProjectCard';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { professionalServiceJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { PROYECTOS } from '@/lib/proyectos/datos';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: '+40 proyectos de bioarquitectura, diseño hidrológico y paisaje en Argentina, Colombia, Perú, Bolivia, Italia y Francia.',
};

export default function ProyectosPage() {
  return (
    <>
      <SiteHeader />
      <JsonLd
        data={[
          professionalServiceJsonLd({
            path: '/proyectos',
            name: 'Arte y Tierra — Proyectos de bioarquitectura y diseño hidrológico ejecutados',
            description:
              'Más de 40 proyectos de diseño y ejecución en bioarquitectura, hidrología regenerativa y agroecología, realizados en Argentina, Colombia, Perú, Bolivia, Ecuador, Italia y Francia.',
            serviceTypes: ['Bioarquitectura', 'Diseño hidrológico', 'Sistemas agroecológicos'],
          }),
          breadcrumbJsonLd([
            { name: 'Inicio', url: '/' },
            { name: 'Arte y Tierra', url: '/arte-y-tierra' },
            { name: 'Proyectos', url: '/proyectos' },
          ]),
        ]}
      />
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
        {PROYECTOS.map((project, i) => (
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
