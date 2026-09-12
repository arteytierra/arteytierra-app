'use client';

import { useTransition, useState } from 'react';
import { Mail, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { resendOrderEmail, refundOrder, cancelOrder } from '@/lib/admin/orders';

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function resend() {
    start(async () => {
      try {
        await resendOrderEmail(orderId);
        setMsg('Mail reenviado.');
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Error');
      }
    });
  }

  function refund() {
    // El texto dice lo que va a pasar de verdad: hasta hoy decia 'Reembolso
    // solicitado' y no se solicitaba nada, porque el workflow que lo iba a
    // hacer esta apagado.
    if (!confirm('Se le va a pedir el reembolso al proveedor y se le devuelve el dinero a la persona. No se puede deshacer. ¿Seguimos?')) return;
    start(async () => {
      try {
        const r = await refundOrder(orderId);
        setMsg(r?.yaEstaba ? 'Ya estaba reembolsada.' : 'Reembolsada. El dinero volvió por el mismo medio de pago.');
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'No se pudo reembolsar. La orden queda como estaba.');
      }
    });
  }

  function cancel() {
    if (!confirm('¿Cancelar esta orden?')) return;
    start(async () => {
      try {
        await cancelOrder(orderId);
        setMsg('Orden cancelada.');
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Error');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'paid' && (
        <Button variant="outline" size="sm" onClick={resend} disabled={pending}>
          <Mail size={14} /> Reenviar email
        </Button>
      )}
      {status === 'paid' && (
        <Button variant="outline" size="sm" onClick={refund} disabled={pending}>
          <RefreshCw size={14} /> Reembolsar
        </Button>
      )}
      {status !== 'cancelled' && status !== 'paid' && (
        <Button variant="danger" size="sm" onClick={cancel} disabled={pending}>
          <XCircle size={14} /> Cancelar
        </Button>
      )}
      {msg && <span className="text-xs text-ink-800/70">{msg}</span>}
    </div>
  );
}
