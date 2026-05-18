'use client';

import { useState } from 'react';
import { createWebhookEndpointAction } from '@/lib/webhooks-out/actions';

const EVENTS = [
  'order.paid', 'order.refunded', 'order.cancelled',
  'enrollment.created', 'lesson.completed', 'course.completed',
  'certificate.issued', 'certificate.revoked',
  'reservation.confirmed', 'reservation.cancelled',
  'scholarship.approved',
  'partner.commission.confirmed', 'partner.commission.paid',
];

export function WebhookForm({ admin = false }: { admin?: boolean }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      const res = await createWebhookEndpointAction(formData);
      if (res.ok) setSecret(res.secret ?? null);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border border-ink/10 bg-bone p-5">
      <div>
        <label className="block text-sm text-mute mb-1">Etiqueta</label>
        <input name="label" required maxLength={80} className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-mute mb-1">URL del endpoint</label>
        <input
          name="url"
          type="url"
          required
          placeholder="https://tu-app.com/webhooks/ay"
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm font-mono"
        />
      </div>
      <div>
        <label className="block text-sm text-mute mb-1">Eventos</label>
        <select
          name="events"
          multiple
          defaultValue={['*']}
          className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm min-h-[120px]"
        >
          <option value="*">* (todos)</option>
          {EVENTS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <p className="text-xs text-mute mt-1">Cmd/Ctrl+click para seleccionar varios.</p>
      </div>
      {admin && (
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="admin" /> Endpoint global (no atado a usuario)
        </label>
      )}
      <button disabled={pending} className="rounded-md bg-leaf px-5 py-2 text-sm text-bone disabled:opacity-50">
        {pending ? 'Creando…' : 'Crear endpoint'}
      </button>

      {secret && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          <div className="font-medium text-ink mb-1">Endpoint creado · guardá tu secret ahora:</div>
          <code className="font-mono text-xs break-all">{secret}</code>
          <div className="text-xs text-mute mt-2">
            No volveremos a mostrarlo. Si lo perdés, podés rotarlo desde la lista.
          </div>
        </div>
      )}
    </form>
  );
}
