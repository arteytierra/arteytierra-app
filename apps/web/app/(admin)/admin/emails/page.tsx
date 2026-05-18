import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata = { title: 'Emails enviados' };

const STATUS_COLOR: Record<string, string> = {
  queued: 'bg-gray-200 text-gray-700',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  opened: 'bg-emerald-100 text-emerald-800',
  clicked: 'bg-teal-100 text-teal-900',
  bounced: 'bg-orange-100 text-orange-800',
  complained: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  suppressed: 'bg-yellow-100 text-yellow-800',
};

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const admin = createSupabaseAdminClient();

  let q = admin
    .schema('app')
    .from('email_messages')
    .select('id, recipient, template, category, subject, status, sent_at, opened_at, clicked_at, created_at, open_count, click_count, error')
    .order('created_at', { ascending: false })
    .limit(200);

  if (sp.status) q = q.eq('status', sp.status as never);
  if (sp.q) q = q.ilike('recipient', `%${sp.q}%`);

  const { data: rows } = await q;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Emails enviados</h1>

      <form method="get" className="mb-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="buscar por email"
          className="rounded-md border border-ink/15 px-3 py-1.5 text-sm"
        />
        <select name="status" defaultValue={sp.status ?? ''} className="rounded-md border border-ink/15 px-3 py-1.5 text-sm">
          <option value="">Todos los estados</option>
          {Object.keys(STATUS_COLOR).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-md bg-leaf px-4 py-1.5 text-sm text-bone">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-bone/50 text-left">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Destinatario</th>
              <th className="px-3 py-2">Template</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Open / Click</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const row = r as never as {
                id: string; recipient: string; template: string; category: string;
                status: string; created_at: string; open_count: number; click_count: number;
                error: string | null;
              };
              return (
                <tr key={row.id} className="border-t border-ink/5">
                  <td className="px-3 py-2 text-mute">{new Date(row.created_at).toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2">{row.recipient}</td>
                  <td className="px-3 py-2 text-mute">{row.template}</td>
                  <td className="px-3 py-2 text-mute">{row.category}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLOR[row.status] ?? 'bg-gray-100'}`}>
                      {row.status}
                    </span>
                    {row.error && <div className="text-xs text-red-600 mt-1 truncate max-w-[280px]">{row.error}</div>}
                  </td>
                  <td className="px-3 py-2 text-mute tabular-nums">
                    {row.open_count} / {row.click_count}
                  </td>
                </tr>
              );
            })}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin mensajes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
