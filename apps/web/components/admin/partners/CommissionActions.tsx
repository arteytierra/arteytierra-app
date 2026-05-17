'use client';

import { useTransition } from 'react';
import { confirmPartnerCommissionAction, payoutPartnerCommissionAction } from '@/lib/partners/actions';

export function CommissionActions({
  commissionId,
  status,
}: {
  commissionId: string;
  status: 'pending' | 'confirmed';
}) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      try {
        await confirmPartnerCommissionAction({ commissionId, mark: 'confirm' });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  function reverse() {
    if (!window.confirm('¿Revertir esta comisión?')) return;
    startTransition(async () => {
      try {
        await confirmPartnerCommissionAction({ commissionId, mark: 'reverse' });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  function payout() {
    const ref = prompt('Referencia de pago (transferencia, transacción ID):');
    if (!ref || ref.trim().length < 3) return;
    startTransition(async () => {
      try {
        await payoutPartnerCommissionAction({ commissionId, payoutRef: ref.trim() });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    });
  }

  return (
    <div className="inline-flex gap-2">
      {status === 'pending' && (
        <>
          <button onClick={onConfirm} disabled={pending} className="text-xs underline disabled:opacity-60">
            Confirmar
          </button>
          <button onClick={reverse} disabled={pending} className="text-xs underline text-clay-700 disabled:opacity-60">
            Revertir
          </button>
        </>
      )}
      {status === 'confirmed' && (
        <button onClick={payout} disabled={pending} className="text-xs underline disabled:opacity-60">
          Marcar pagada
        </button>
      )}
    </div>
  );
}
