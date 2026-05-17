'use client';

import { useState, useTransition } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';

/**
 * Form reusable de suscripción a newsletter.
 * Embebible inline (footer, blog sidebar) o dentro de un popup.
 */
export function NewsletterForm({
  source = 'inline',
  defaultSegments = ['newsletter'],
  compact = false,
  onSuccess,
}: {
  source?: string;
  defaultSegments?: string[];
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [segments, setSegments] = useState<string[]>(defaultSegments);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  function toggleSegment(seg: string) {
    setSegments((s) => (s.includes(seg) ? s.filter((x) => x !== seg) : [...s, seg]));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            full_name: name || null,
            segments,
            source,
            hp,
          }),
        });
        const json = (await res.json()) as { status?: string; error?: string };
        if (!res.ok) {
          setError(json.error === 'rate_limited' ? 'Demasiados intentos. Esperá unos minutos.' : 'No pudimos completar la suscripción.');
          return;
        }
        setOkMsg(
          json.status === 'already_confirmed'
            ? 'Ya estás suscripto. Actualizamos tus preferencias 🌿'
            : 'Te enviamos un email para confirmar tu suscripción. ¡Revisá tu bandeja!',
        );
        setEmail('');
        setName('');
        onSuccess?.();
      } catch {
        setError('Error de red. Probá de nuevo.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Honeypot — invisible para humanos, visible para bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        name="website"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden
      />

      {!compact && (
        <Field label="Tu nombre (opcional)">
          {(id) => (
            <Input
              id={id}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              maxLength={120}
            />
          )}
        </Field>
      )}

      <Field label="Email">
        {(id) => (
          <Input
            id={id}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@email.com"
          />
        )}
      </Field>

      {!compact && (
        <fieldset className="space-y-1.5">
          <legend className="text-xs uppercase tracking-[0.12em] text-ink-800/65">Me interesa</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'cursos', label: 'Cursos' },
              { key: 'hospedaje', label: 'Hospedaje' },
              { key: 'biocosmetica', label: 'Biocosmética' },
              { key: 'inmersiones', label: 'Inmersiones' },
              { key: 'newsletter', label: 'Novedades' },
            ].map((s) => {
              const active = segments.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleSegment(s.key)}
                  className={
                    'px-3 py-1 rounded-full text-xs border transition-colors ' +
                    (active
                      ? 'bg-moss-700 text-bone-50 border-moss-700'
                      : 'border-ink-950/15 text-ink-800/70 hover:border-ink-950/30')
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {error ? <p className="text-sm text-clay-700">{error}</p> : null}
      {okMsg ? <p className="text-sm text-moss-700">{okMsg}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Suscribirme'}
      </Button>
      <p className="text-[11px] text-ink-800/55">
        Te enviaremos un email para confirmar. Podés darte de baja cuando quieras.
      </p>
    </form>
  );
}
