'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Select, Field } from '@arteytierra/ui';
import { upsertCoupon, type CouponInput } from '@/lib/admin/coupons';

interface Props {
  coupon: (CouponInput & { used?: number }) | null;
  onClose: (updated?: CouponInput & { used: number }, originalCode?: string) => void;
}

export function CouponDialog({ coupon, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<CouponInput>(
    coupon ?? {
      code: '',
      name: '',
      description: '',
      kind: 'percent',
      amount: 10,
      currency: 'ARS',
      min_subtotal_cents: null,
      max_uses: null,
      valid_from: null,
      valid_to: null,
      is_active: true,
      stackable: false,
      priority: 100,
      conditions: {},
      config: {},
    },
  );
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);

  function close(updated?: CouponInput & { used: number }) {
    ref.current?.close();
    onClose(updated, coupon?.code);
  }

  function save() {
    start(async () => {
      setErr(null);
      try {
        const res = await upsertCoupon(coupon?.code ?? null, state);
        close({ ...state, code: res.code, used: coupon?.used ?? 0 });
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Error');
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={() => onClose()}
      className="backdrop:bg-ink-950/60 rounded-3xl p-0 w-full max-w-lg"
    >
      <div className="bg-bone-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{coupon ? 'Editar cupón' : 'Nuevo cupón'}</h2>
          <button onClick={() => close()} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código (mayúsculas)" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={state.code}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                  }))
                }
                placeholder="OTONO25"
              />
            )}
          </Field>
          <Field label="Descripción interna" className="sm:col-span-2">
            {(id) => (
              <Input
                id={id}
                value={state.description ?? ''}
                onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
              />
            )}
          </Field>
          <Field label="Tipo">
            {(id) => (
              <Select
                id={id}
                value={state.kind}
                onChange={(e) =>
                  setState((s) => ({ ...s, kind: e.target.value as CouponInput['kind'] }))
                }
              >
                <option value="percent">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
                <option value="bogo">BOGO (2x1, 3x2…)</option>
                <option value="bundle">Bundle (precio fijo combo)</option>
                <option value="free_shipping">Envío gratis</option>
              </Select>
            )}
          </Field>
          <Field label={state.kind === 'percent' ? 'Porcentaje (1-100)' : 'Monto (centavos)'}>
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                max={state.kind === 'percent' ? 100 : undefined}
                value={state.amount}
                onChange={(e) => setState((s) => ({ ...s, amount: Number(e.target.value) }))}
              />
            )}
          </Field>
          {state.kind === 'fixed' && (
            <Field label="Moneda del descuento">
              {(id) => (
                <Select
                  id={id}
                  value={state.currency ?? 'ARS'}
                  onChange={(e) =>
                    setState((s) => ({ ...s, currency: e.target.value as 'ARS' | 'USD' }))
                  }
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </Select>
              )}
            </Field>
          )}
          <Field label="Mínimo subtotal (centavos)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={state.min_subtotal_cents ?? ''}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    min_subtotal_cents: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            )}
          </Field>
          <Field label="Usos máximos (vacío = ∞)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                value={state.max_uses ?? ''}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    max_uses: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            )}
          </Field>
          <Field label="Válido desde">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                value={state.valid_from ?? ''}
                onChange={(e) =>
                  setState((s) => ({ ...s, valid_from: e.target.value || null }))
                }
              />
            )}
          </Field>
          <Field label="Válido hasta">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                value={state.valid_to ?? ''}
                onChange={(e) => setState((s) => ({ ...s, valid_to: e.target.value || null }))}
              />
            )}
          </Field>
          <Field label="Prioridad de stack (menor = primero)">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                value={state.priority ?? 100}
                onChange={(e) => setState((s) => ({ ...s, priority: Number(e.target.value) }))}
              />
            )}
          </Field>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={state.stackable ?? false}
              onChange={(e) => setState((s) => ({ ...s, stackable: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-950/25 text-moss-700"
            />
            <span className="text-sm">Stackable (combinable con otros)</span>
          </label>
          <Field label="Condiciones (JSON)" className="sm:col-span-2">
            {(id) => (
              <textarea
                id={id}
                rows={3}
                placeholder='{"product_types":["course"],"first_order_only":true,"max_uses_per_user":1}'
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-xs font-mono"
                value={JSON.stringify(state.conditions ?? {}, null, 0)}
                onChange={(e) => {
                  try {
                    const v = e.target.value.trim() === '' ? {} : JSON.parse(e.target.value);
                    setState((s) => ({ ...s, conditions: v }));
                    setErr(null);
                  } catch {
                    setErr('conditions: JSON inválido');
                  }
                }}
              />
            )}
          </Field>
          {(state.kind === 'bogo' || state.kind === 'bundle') && (
            <Field
              label={
                state.kind === 'bogo'
                  ? 'Config BOGO (JSON: buy_product_ids, buy_qty, get_product_ids, get_qty, get_discount_pct)'
                  : 'Config bundle (JSON: required_product_ids, bundle_price_cents)'
              }
              className="sm:col-span-2"
            >
              {(id) => (
                <textarea
                  id={id}
                  rows={3}
                  placeholder={
                    state.kind === 'bogo'
                      ? '{"buy_product_ids":["uuid1"],"buy_qty":1,"get_product_ids":["uuid2"],"get_qty":1,"get_discount_pct":100}'
                      : '{"required_product_ids":["uuid1","uuid2"],"bundle_price_cents":50000}'
                  }
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-xs font-mono"
                  value={JSON.stringify(state.config ?? {}, null, 0)}
                  onChange={(e) => {
                    try {
                      const v = e.target.value.trim() === '' ? {} : JSON.parse(e.target.value);
                      setState((s) => ({ ...s, config: v }));
                      setErr(null);
                    } catch {
                      setErr('config: JSON inválido');
                    }
                  }}
                />
              )}
            </Field>
          )}
          <label className="flex items-center gap-2 sm:col-span-2 mt-2">
            <input
              type="checkbox"
              checked={state.is_active}
              onChange={(e) => setState((s) => ({ ...s, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-950/25 text-moss-700"
            />
            <span className="text-sm">Activo</span>
          </label>
        </div>

        {err && <p className="mt-3 text-xs text-clay-700">✗ {err}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => close()}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
