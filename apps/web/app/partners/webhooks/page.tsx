import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { WebhookForm } from '@/components/webhooks/WebhookForm';
import {
  toggleWebhookEndpointAction,
  deleteWebhookEndpointAction,
  rotateWebhookSecretAction,
} from '@/lib/webhooks-out/actions';

export const metadata: Metadata = { title: 'Mis webhooks', robots: { index: false } };

export default async function PartnerWebhooksPage() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: endpoints } = await admin
    .schema('app')
    .from('webhook_endpoints')
    .select('id, label, url, events, enabled, last_success_at, last_failure_at, consecutive_failures, created_at')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink mb-2">Webhooks</h1>
      <p className="text-mute mb-8">
        Recibí eventos del sistema en tu propio endpoint. Cada request viene firmado con HMAC-SHA256
        en el header <code>X-AY-Signature</code> (formato Stripe: <code>t=…,v1=…</code>).
      </p>

      <section className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Mis endpoints</h2>
        <ul className="space-y-3">
          {((endpoints ?? []) as Array<Record<string, unknown>>).map((e) => (
            <li key={e.id as string} className="rounded-lg border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-ink">{e.label as string}</div>
                  <div className="text-xs text-mute font-mono truncate">{e.url as string}</div>
                  <div className="text-xs text-mute mt-1">
                    Eventos: {(e.events as string[]).join(', ')}
                  </div>
                  <div className="text-xs text-mute mt-1">
                    {e.enabled ? '✓ activo' : '✗ deshabilitado'} ·{' '}
                    {Number(e.consecutive_failures ?? 0) > 0
                      ? `${e.consecutive_failures} fallos consecutivos`
                      : 'sin fallos recientes'}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <form action={async () => { 'use server'; await toggleWebhookEndpointAction(e.id as string); }}>
                    <button className="text-xs rounded border border-ink/15 px-2 py-1">
                      {e.enabled ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                  <form action={async () => { 'use server'; await rotateWebhookSecretAction(e.id as string); }}>
                    <button className="text-xs rounded border border-ink/15 px-2 py-1">Rotar secret</button>
                  </form>
                  <form action={async () => { 'use server'; await deleteWebhookEndpointAction(e.id as string); }}>
                    <button className="text-xs rounded border border-red-300 text-red-700 px-2 py-1">Borrar</button>
                  </form>
                </div>
              </div>
            </li>
          ))}
          {(!endpoints || endpoints.length === 0) && (
            <li className="text-mute text-sm">Todavía no tenés endpoints.</li>
          )}
        </ul>
      </section>

      <h2 className="font-display text-lg text-ink mb-3">Crear endpoint</h2>
      <WebhookForm />

      <section className="mt-10 rounded-lg border border-ink/10 bg-bone-50 p-5 text-sm text-mute">
        <h3 className="font-medium text-ink mb-2">Verificación HMAC (ejemplo Node)</h3>
        <pre className="font-mono text-xs whitespace-pre-wrap">
{`import { createHmac, timingSafeEqual } from 'crypto';

function verify(secret, body, header) {
  const [tPart, vPart] = header.split(',');
  const t = Number(tPart.replace('t=', ''));
  const sig = vPart.replace('v1=', '');
  if (Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = createHmac('sha256', secret)
    .update(\`\${t}.\${body}\`).digest('hex');
  return timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(sig, 'hex'),
  );
}`}
        </pre>
      </section>
    </main>
  );
}
