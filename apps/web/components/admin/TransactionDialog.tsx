'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Button, Field, Input, Select, Textarea, Dialog } from '@arteytierra/ui';
import { createTransaction, type FinanceState } from '@/lib/admin/finance-actions';

interface Props {
  accounts: Array<{ id: string; name: string; currency: string }>;
  categories: Array<{ id: string; name: string; type: 'income' | 'expense' }>;
}

export function TransactionDialog({ accounts, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [state, action, pending] = useActionState<FinanceState, FormData>(createTransaction, {});

  const visibleCategories = useMemo(
    () => categories.filter((c) => (type === 'transfer' ? false : c.type === type)),
    [categories, type],
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva transacción</Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva transacción" className="max-w-xl">
        <form action={action} encType="multipart/form-data" className="flex flex-col gap-4">
          {/* Tabs tipo */}
          <div className="flex gap-1 p-1 rounded-full bg-bone-100">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <label
                key={t}
                className={
                  'flex-1 text-center text-sm px-3 py-2 rounded-full cursor-pointer transition-colors ' +
                  (type === t ? 'bg-ink-950 text-bone-50' : 'text-ink-800 hover:bg-bone-50')
                }
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  className="sr-only"
                  checked={type === t}
                  onChange={() => setType(t)}
                />
                {t === 'expense' ? 'Gasto' : t === 'income' ? 'Ingreso' : 'Transferencia'}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha" required>
              {(id) => (
                <Input
                  id={id}
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              )}
            </Field>
            <Field label="Monto" error={state.fieldErrors?.amount} required>
              {(id) => (
                <Input id={id} type="number" step="0.01" min="0" name="amount" placeholder="0.00" required />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cuenta" required>
              {(id) => (
                <Select id={id} name="account_id" required defaultValue="">
                  <option value="" disabled>Elegí…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Moneda" required>
              {(id) => (
                <Select id={id} name="currency" defaultValue="ARS">
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                </Select>
              )}
            </Field>
          </div>

          {type !== 'transfer' && (
            <Field label="Categoría">
              {(id) => (
                <Select id={id} name="category_id" defaultValue="">
                  <option value="">— Sin categoría —</option>
                  {visibleCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              )}
            </Field>
          )}

          <Field label="Descripción">
            {(id) => <Textarea id={id} name="description" placeholder="Concepto, proveedor, notas…" />}
          </Field>

          <Field label="Proyecto" hint="Opcional. Útil para agrupar por obra/cliente.">
            {(id) => <Input id={id} name="project" placeholder="ej: Cabaña del Monte" />}
          </Field>

          <Field label="Comprobante" hint="PDF, JPG o PNG (máx 10MB)">
            {(id) => (
              <Input
                id={id}
                type="file"
                name="attachment"
                accept=".pdf,image/*"
                className="file:mr-3 file:rounded-md file:border-0 file:bg-bone-100 file:px-3 file:py-1.5 file:text-sm"
              />
            )}
          </Field>

          {state.error && <p className="text-sm text-danger-500">{state.error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="moss" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar transacción'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
