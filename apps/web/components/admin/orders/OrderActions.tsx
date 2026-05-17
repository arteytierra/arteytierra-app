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
    if (!confirm('¿Reembolsar esta orden? Esta acción no es reversible.')) return;
    start(async () => {
      try {
        await refundOrder(orderId);
        setMsg('Reembolso solicitado.');
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'Error');
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
