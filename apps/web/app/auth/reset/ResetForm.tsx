'use client';

import { useActionState } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';
import { requestPasswordResetAction, type ActionState } from '@/lib/auth/actions';

export function ResetForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-lg bg-moss-100 text-moss-900 px-4 py-4 text-sm">
        Si tu correo está registrado, recibirás un link para cambiar tu contraseña.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Email" error={state.fieldErrors?.email} required>
        {(id) => (
          <Input id={id} name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" />
        )}
      </Field>
      {state.error && <p className="text-sm text-danger-500">{state.error}</p>}
      <Button type="submit" variant="moss" size="lg" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar link de recuperación'}
      </Button>
    </form>
  );
}
