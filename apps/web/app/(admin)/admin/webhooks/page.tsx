import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { WebhookForm } from '@/components/webhooks/WebhookForm';
import { redeliverWebhookAction, toggleWebhookEndpointAction } from '@/lib/webhooks-out/actions';

export const metadata = { title: 'Webhooks' };

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  success: 'bg-leaf/10 text-leaf',
  retrying: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  dead: 'bg-red-200 text-red-900',
};

export default async function AdminWebhooksPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const [{ data: endpoints }, { data: deliveries }] = await Promise.all([
    admin.schema('app').from('webhook_endpoints')
      .select('id, label, url, events, enabled, owner_user_id, consecutive_failures, last_success_at, last_failure_at')
      .order('created_at', { ascending: false })
      .limit(100),
    admin.schema('app').from('webhook_deliveries')
      .select('id, endpoint_id, event, status, attempts, last_response_status, last_error, created_at, delivered_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Webhooks outbound</h1>

      <section className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Endpoints</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Eventos</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {((endpoints ?? []) as Array<Record<string, unknown>>).map((e) => (
                <tr key={e.id as string} className="border-t border-ink/5">
                  <td className="px-3 py-2 font-medium">{e.label as string}</td>
                  <td className="px-3 py-2 font-mono text-xs text-mute truncate max-w-[260px]">{e.url as string}</td>
                  <td className="px-3 py-2 text-xs text-mute">
                    {e.owner_user_id ? (e.owner_user_id as string).slice(0, 8) : 'global'}
                  </td>
                  <td className="px-3 py-2 text-xs">{(e.events as string[]).join(', ')}</td>
                  <td className="px-3 py-2">
                    {e.enabled ? (
                      <span className="text-xs rounded bg-leaf/10 text-leaf px-2 py-0.5">activo</span>
                    ) : (
                      <span className="text-xs rounded bg-red-100 text-red-800 px-2 py-0.5">inactivo</span>
                    )}
                    {Number(e.consecutive_failures ?? 0) > 0 && (
                      <span className="ml-1 text-[10px] text-amber-700">·{String(e.consecutive_failures)} fallos</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <form action={async () => { 'use server'; await toggleWebhookEndpointAction(e.id as string); }}>
                      <button className="text-xs rounded border border-ink/15 px-2 py-1">
                        {e.enabled ? 'Pausar' : 'Reactivar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!endpoints || endpoints.length === 0) && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin endpoints.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-lg text-ink mb-3">Crear endpoint global</h2>
        <WebhookForm admin />
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-3">Últimas entregas</h2>
        <div className="overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-bone-50 text-left">
              <tr>
                <th className="px-3 py-2">Cuándo</th>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Intentos</th>
                <th className="px-3 py-2">HTTP</th>
                <th className="px-3 py-2">Error</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {((deliveries ?? []) as Array<Record<string, unknown>>).map((d) => (
                <tr key={d.id as string} className="border-t border-ink/5">
                  <td className="px-3 py-2 text-mute whitespace-nowrap">
                    {new Date(d.created_at as string).toLocaleString('es-AR')}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{d.event as string}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs rounded px-2 py-0.5 ${STATUS_COLOR[d.status as string]}`}>
                      {d.status as string}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{d.attempts as number}</td>
                  <td className="px-3 py-2 text-mute">{(d.last_response_status ?? '—') as number | string}</td>
                  <td className="px-3 py-2 text-mute text-xs truncate max-w-[240px]">
                    {(d.last_error ?? '') as string}
                  </td>
                  <td className="px-3 py-2">
                    {(d.status === 'failed' || d.status === 'dead' || d.status === 'retrying') && (
                      <form action={async () => { 'use server'; await redeliverWebhookAction(d.id as string); }}>
                        <button className="text-xs rounded border border-ink/15 px-2 py-1">Re-enviar</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {(!deliveries || deliveries.length === 0) && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-mute">Sin entregas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
