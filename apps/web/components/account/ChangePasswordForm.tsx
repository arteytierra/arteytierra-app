'use client';

import { useActionState } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';
import { changePasswordAction, type ActionState } from '@/lib/auth/actions';

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePasswordAction, {});

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-moss-300 bg-moss-100 p-6">
        <p className="font-display text-lg text-ink-950">Contraseña actualizada ✓</p>
        <p className="mt-1 text-sm text-ink-800/70">
          Tu nueva contraseña ya está activa. La vas a usar la próxima vez que inicies sesión.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 max-w-sm">
      <Field
        label="Nueva contraseña"
        hint="Mínimo 8 caracteres."
        error={state.fieldErrors?.password}
        required
      >
        {(id) => (
          <Input id={id} name="password" type="password" autoComplete="new-password" required />
        )}
      </Field>
      <Field
        label="Repetir contraseña"
        error={state.fieldErrors?.confirm}
        required
      >
        {(id) => (
          <Input id={id} name="confirm" type="password" autoComplete="new-password" required />
        )}
      </Field>
      {state.error && <p className="text-sm text-danger-500">{state.error}</p>}
      <Button type="submit" variant="moss" size="lg" disabled={pending}>
        {pending ? 'Guardando…' : 'Actualizar contraseña'}
      </Button>
    </form>
  );
}
