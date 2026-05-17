'use client';

import { useRef, useState, useTransition } from 'react';
import { Button, Field, Input, Select } from '@arteytierra/ui';
import { adminAdjustWallet } from '@/lib/wallet';

export function AdjustWalletDialog() {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const userId = String(formData.get('user_id') ?? '');
    const currency = String(formData.get('currency') ?? 'ARS') as 'ARS' | 'USD';
    const amount = Number(formData.get('amount') ?? 0);
    const description = String(formData.get('description') ?? '');
    const amountCents = Math.round(amount * 100);

    if (!userId || !amountCents || !description.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    startTransition(async () => {
      try {
        await adminAdjustWallet({ userId, currency, amountCents, description });
        ref.current?.close();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>Ajustar saldo</Button>
      <dialog
        ref={ref}
        className="rounded-2xl backdrop:bg-ink-950/50 backdrop:backdrop-blur-sm p-0 max-w-md w-full"
      >
        <form action={onSubmit} className="p-6 space-y-4">
          <h3 className="font-display text-xl text-ink-950">Ajuste manual de wallet</h3>

          <Field label="User ID (UUID)">
            {(id) => <Input id={id} name="user_id" required placeholder="uuid del usuario" />}
          </Field>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Field label="Importe" hint="Negativo para débito (ej: -1500)">
              {(id) => <Input id={id} name="amount" type="number" step="0.01" required />}
            </Field>
            <Field label="Moneda">
              {(id) => (
                <Select id={id} name="currency" defaultValue="ARS">
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </Select>
              )}
            </Field>
          </div>

          <Field label="Motivo">
            {(id) => <Input id={id} name="description" required placeholder="Recompensa por…" />}
          </Field>

          {error ? <p className="text-sm text-clay-700">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => ref.current?.close()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Aplicando…' : 'Aplicar ajuste'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
