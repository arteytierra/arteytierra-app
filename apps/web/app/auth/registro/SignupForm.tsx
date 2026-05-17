'use client';

import { useActionState } from 'react';
import { Button, Field, Input, Checkbox } from '@arteytierra/ui';
import { signupAction, type ActionState } from '@/lib/auth/actions';

export function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signupAction, {});

  if (state.ok) {
    return (
      <div className="rounded-lg bg-moss-100 text-moss-900 px-4 py-4 text-sm">
        Te enviamos un correo para confirmar tu cuenta.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Nombre completo" error={state.fieldErrors?.fullName} required>
        {(id) => (
          <Input id={id} name="fullName" autoComplete="name" placeholder="Tu nombre" required />
        )}
      </Field>

      <Field label="Email" error={state.fieldErrors?.email} required>
        {(id) => (
          <Input id={id} name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        )}
      </Field>

      <Field
        label="Contraseña"
        hint="Mínimo 8 caracteres."
        error={state.fieldErrors?.password}
        required
      >
        {(id) => (
          <Input id={id} name="password" type="password" autoComplete="new-password" required />
        )}
      </Field>

      <label className="flex items-start gap-2 text-sm text-ink-800/80">
        <Checkbox name="marketingConsent" className="mt-0.5" />
        <span>Quiero recibir aprendizajes, cartas y novedades por correo.</span>
      </label>

      {state.error && <p className="text-sm text-danger-500">{state.error}</p>}

      <Button type="submit" variant="moss" size="lg" disabled={pending}>
        {pending ? 'Creando…' : 'Crear cuenta'}
      </Button>

      <p className="text-xs text-ink-800/60">
        Al registrarte aceptás los términos y la política de privacidad.
      </p>
    </form>
  );
}
