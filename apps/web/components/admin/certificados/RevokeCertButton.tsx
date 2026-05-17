'use client';

import { useTransition } from 'react';
import { revokeCertificateAction } from '@/lib/certificates/actions';

export function RevokeCertButton({ code }: { code: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-clay-700 underline disabled:opacity-60"
      onClick={() => {
        const reason = prompt('Motivo de la revocación:');
        if (!reason || reason.trim().length < 3) return;
        if (!confirm(`¿Revocar el certificado ${code}? Esta acción se mostrará en la página pública.`)) return;
        startTransition(async () => {
          try {
            await revokeCertificateAction({ code, reason: reason.trim() });
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
          }
        });
      }}
    >
      Revocar
    </button>
  );
}
