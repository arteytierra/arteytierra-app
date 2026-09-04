'use client';

import { useState } from 'react';
import { NewsletterForm } from './NewsletterForm';

/**
 * Bloque de suscripción al newsletter para mostrar DESPUÉS de completar un
 * formulario de inscripción. Reutilizable en cualquier estado de éxito.
 * Pre-rellena el email/nombre que la persona ya cargó en la inscripción.
 */
export function PostSignupNewsletter({
  email = '',
  name = '',
  source = 'inscripcion',
  segments = ['cursos', 'newsletter'],
  titulo = '¿Querés recibir nuestras novedades?',
  texto = 'Te avisamos de próximos cursos, talleres e inmersiones. Sin spam, podés darte de baja cuando quieras.',
}: {
  email?: string;
  name?: string;
  source?: string;
  segments?: string[];
  titulo?: string;
  texto?: string;
}) {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <div className="mt-5 bg-bone-50 border border-bone-200 p-6">
      <p className="font-display text-lg text-ink-950 mb-1">{titulo}</p>
      <p className="font-sans text-sm text-ink-700 leading-relaxed mb-4">{texto}</p>
      <NewsletterForm
        source={source}
        defaultSegments={segments}
        compact
        defaultEmail={email}
        defaultName={name}
        onSuccess={() => setDone(true)}
      />
    </div>
  );
}
