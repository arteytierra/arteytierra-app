'use client';

import { useActionState } from 'react';
import { Button, Field, Input } from '@arteytierra/ui';
import { updatePasswordAction, type ActionState } from '@/lib/auth/actions';

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePasswordAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nueva contraseña" hint="Mínimo 8 caracteres." error={state.fieldErrors?.password} required>
        {(id) => (
          <Input id={id} name="password" type="password" autoComplete="new-password" required />
        )}
      </Field>
      {state.error && <p className="text-sm text-danger-500">{state.error}</p>}
      <Button type="submit" variant="moss" size="lg" disabled={pending}>
        {pending ? 'Guardando…' : 'Actualizar contraseña'}
      </Button>
    </form>
  );
}
