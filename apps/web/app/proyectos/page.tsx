import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Conocé los proyectos de diseño regenerativo y bioarquitectura de Arte y Tierra.',
};

export default function ProyectosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Proyectos</h1>
      <p className="text-lg text-ink-700 leading-relaxed">
        Diseño regenerativo, bioarquitectura e intervenciones de paisaje. Próximamente compartimos
        nuestra cartera de proyectos.
      </p>
    </main>
  );
}
