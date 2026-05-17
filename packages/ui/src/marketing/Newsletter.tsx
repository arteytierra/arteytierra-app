'use client';

import { useState } from 'react';
import { cn } from '../utils/cn';
import { Eyebrow } from '../primitives/Eyebrow';

interface NewsletterProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  onSubmit?: (email: string) => Promise<void> | void;
  className?: string;
}

export function Newsletter({
  eyebrow = 'Newsletter',
  title = 'Cartas desde el monte',
  description = 'Una vez al mes: oficios, semillas y aprendizajes desde el territorio.',
  onSubmit,
  className,
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <section className={cn('rounded-2xl bg-bone-100 p-8 md:p-12', className)}>
      <div className="max-w-2xl mx-auto text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="display-3 mt-4">{title}</h3>
        <p className="mt-4 text-ink-800/75">{description}</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email || !onSubmit) return;
            try {
              setState('loading');
              await onSubmit(email);
              setState('success');
              setEmail('');
            } catch {
              setState('error');
            }
          }}
          className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-ink-950/15 bg-bone-50 px-5 py-3 text-sm focus:outline-none focus:border-moss-700"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="rounded-full bg-ink-950 px-6 py-3 text-sm text-bone-50 hover:bg-moss-700 transition-colors disabled:opacity-50"
          >
            {state === 'loading' ? 'Enviando…' : 'Suscribirme'}
          </button>
        </form>

        {state === 'success' && (
          <p className="mt-4 text-sm text-moss-700">Listo. Te llegará la próxima carta.</p>
        )}
        {state === 'error' && (
          <p className="mt-4 text-sm text-danger-500">Algo falló. Probá de nuevo.</p>
        )}
      </div>
    </section>
  );
}
