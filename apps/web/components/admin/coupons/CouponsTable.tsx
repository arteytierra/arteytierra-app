'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Badge, Button, formatMoney } from '@arteytierra/ui';
import { CouponDialog } from './CouponDialog';
import { deleteCoupon, toggleCouponActive, type CouponInput } from '@/lib/admin/coupons';

interface Row {
  code: string;
  description: string | null;
  kind: 'percent' | 'fixed';
  amount: number;
  currency: string | null;
  min_subtotal_cents: number | null;
  max_uses: number | null;
  used: number;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
}

export function CouponsTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [editing, setEditing] = useState<{ open: boolean; coupon: Row | null }>({
    open: false,
    coupon: null,
  });
  const [pending, start] = useTransition();

  function openNew() {
    setEditing({ open: true, coupon: null });
  }

  function openEdit(c: Row) {
    setEditing({ open: true, coupon: c });
  }

  function close(updated?: Row, originalCode?: string) {
    setEditing({ open: false, coupon: null });
    if (!updated) return;
    setRows((rs) => {
      if (originalCode) return rs.map((r) => (r.code === originalCode ? updated : r));
      return [updated, ...rs.filter((r) => r.code !== updated.code)];
    });
  }

  function toggle(code: string, next: boolean) {
    start(async () => {
      await toggleCouponActive(code, next);
      setRows((rs) => rs.map((r) => (r.code === code ? { ...r, is_active: next } : r)));
    });
  }

  function remove(code: string) {
    if (!confirm(`¿Eliminar el cupón ${code}?`)) return;
    start(async () => {
      await deleteCoupon(code);
      setRows((rs) => rs.filter((r) => r.code !== code));
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus size={14} /> Nuevo cupón
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-200 p-10 text-center text-ink-800/55">
          Sin cupones. Creá el primero.
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Código</th>
                <th className="text-left px-5 py-3">Descuento</th>
                <th className="text-left px-5 py-3">Usos</th>
                <th className="text-left px-5 py-3">Vigencia</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.code} className="border-t border-ink-950/5">
                  <td className="px-5 py-3 font-mono">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.kind === 'percent'
                      ? `${c.amount}%`
                      : formatMoney(c.amount, (c.currency ?? 'ARS') as never)}
                  </td>
                  <td className="px-5 py-3">
                    {c.used} / {c.max_uses ?? '∞'}
                  </td>
                  <td className="px-5 py-3 text-ink-800/70">
                    {c.valid_to
                      ? `hasta ${new Date(c.valid_to).toLocaleDateString('es-AR')}`
                      : 'sin límite'}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggle(c.code, !c.is_active)} disabled={pending}>
                      <Badge tone={c.is_active ? 'moss' : 'neutral'}>
                        {c.is_active ? 'Activo' : 'Pausado'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 hover:bg-bone-100 rounded"
                        aria-label="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => remove(c.code)}
                        className="p-1.5 hover:bg-clay-100 text-clay-700 rounded"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing.open && (
        <CouponDialog
          coupon={editing.coupon}
          onClose={(updated, original) => close(updated as Row | undefined, original)}
        />
      )}
    </>
  );
}

export type { CouponInput };
