'use client';

import { useActionState, useState } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';
import { loginAction, magicLinkAction, type ActionState } from '@/lib/auth/actions';

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [state, action, pending] = useActionState<ActionState, FormData>(
    mode === 'password' ? loginAction : magicLinkAction,
    {},
  );

  if (mode === 'magic' && state.ok) {
    return (
      <div className="rounded-lg bg-moss-100 text-moss-900 px-4 py-4 text-sm">
        Te enviamos un link para ingresar. Revisá tu correo.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" error={state.fieldErrors?.email} required>
        {(id) => (
          <Input
            id={id}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
          />
        )}
      </Field>

      {mode === 'password' && (
        <Field label="Contraseña" error={state.fieldErrors?.password} required>
          {(id) => (
            <Input
              id={id}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          )}
        </Field>
      )}

      {state.error && <p className="text-sm text-danger-500">{state.error}</p>}

      <Button type="submit" variant="moss" size="lg" disabled={pending}>
        {pending ? 'Ingresando…' : mode === 'password' ? 'Ingresar' : 'Enviarme un link'}
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
        className="text-xs text-ink-800/70 hover:text-moss-700 underline-offset-4 hover:underline self-start"
      >
        {mode === 'password' ? 'Usar magic link en su lugar' : 'Usar contraseña en su lugar'}
      </button>
    </form>
  );
}
