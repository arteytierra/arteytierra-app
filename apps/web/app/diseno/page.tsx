import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diseño',
  description: 'Diseño regenerativo del territorio — bioarquitectura, hidrología y paisaje.',
};

export default function DisenoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Diseño</h1>
      <p className="text-lg text-ink-700 leading-relaxed">
        Diseño regenerativo del territorio: bioarquitectura, diseño hidrológico, sistemas
        agroecológicos y paisajismo. Acompañamos proyectos desde la planificación hasta
        la ejecución con foco en la resiliencia y la vida.
      </p>
    </main>
  );
}
