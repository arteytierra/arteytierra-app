import { requireStaff } from '@/lib/auth/session';
import { listAudit, type AuditSeverity } from '@/lib/audit';

export const metadata = { title: 'Auditoría' };

const SEVERITY_COLOR: Record<AuditSeverity, string> = {
  info: 'bg-ink/5 text-mute',
  warning: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; severity?: AuditSeverity; kind?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const rows = await listAudit({
    limit: 200,
    action: sp.action,
    severity: sp.severity,
    targetKind: sp.kind,
  });

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Auditoría</h1>

      <form method="get" className="mb-6 flex flex-wrap gap-2 text-sm">
        <input
          name="action"
          defaultValue={sp.action ?? ''}
          placeholder="acción (ej. order.refund)"
          className="rounded border border-ink/15 px-3 py-1.5"
        />
        <input
          name="kind"
          defaultValue={sp.kind ?? ''}
          placeholder="kind (order, certificate…)"
          className="rounded border border-ink/15 px-3 py-1.5"
        />
        <select name="severity" defaultValue={sp.severity ?? ''} className="rounded border border-ink/15 px-2 py-1.5">
          <option value="">Todas</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>
        <button className="rounded bg-leaf px-4 py-1.5 text-bone">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-bone-50 text-left">
            <tr>
              <th className="px-3 py-2">Cuándo</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Acción</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Severidad</th>
              <th className="px-3 py-2">Payload</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ink/5 align-top">
                <td className="px-3 py-2 text-mute whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString('es-AR')}
                </td>
                <td className="px-3 py-2 text-mute">
                  {r.actor_user_id ? r.actor_user_id.slice(0, 8) : 'system'}
                  {r.actor_role && <span className="ml-1 text-[10px]">[{r.actor_role}]</span>}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                <td className="px-3 py-2 text-mute">
                  {r.target_kind ? `${r.target_kind}/${r.target_id?.slice(0, 8) ?? ''}` : '—'}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${SEVERITY_COLOR[r.severity]}`}>
                    {r.severity}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-[10px] text-mute max-w-[280px] truncate">
                  {Object.keys(r.payload).length > 0 ? JSON.stringify(r.payload) : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin entradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
