import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Somos Arte y Tierra — un proyecto de diseño regenerativo, educación viva y hospedaje en conexión con la naturaleza.',
};

export default function NosotrosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Nosotros</h1>
      <p className="text-lg text-ink-700 leading-relaxed">
        Somos Arte y Tierra — un proyecto de diseño regenerativo, educación viva y hospedaje
        en conexión con la naturaleza. Trabajamos desde la bioarquitectura, el diseño hidrológico
        y la agroecología para crear territorios que nutran la vida.
      </p>
    </main>
  );
}
