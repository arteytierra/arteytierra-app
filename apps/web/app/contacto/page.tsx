import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponete en contacto con Arte y Tierra.',
};

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Contacto</h1>
      <p className="text-lg text-ink-700 leading-relaxed mb-8">
        ¿Tenés un proyecto en mente, querés saber más sobre nuestros programas o simplemente
        decir hola? Escribinos.
      </p>
      <a
        href="mailto:info@arteytierra.org"
        className="inline-flex rounded-full bg-ink-950 px-6 py-3 text-sm text-bone-50 hover:bg-moss-700 transition-colors"
      >
        info@arteytierra.org
      </a>
    </main>
  );
}
