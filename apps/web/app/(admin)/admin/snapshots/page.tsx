import { requireStaff } from '@/lib/auth/session';
import { listSnapshots, listSnapshotFiles } from '@/lib/snapshots';
import { runSnapshotAction } from '@/lib/snapshots/actions';
import { SnapshotFileDownload } from '@/components/admin/SnapshotFileDownload';

export const metadata = { title: 'Snapshots de DB' };

export default async function AdminSnapshotsPage() {
  await requireStaff();
  const snapshots = await listSnapshots(30);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Snapshots de DB</h1>
          <p className="text-sm text-mute mt-1">
            Exportaciones NDJSON por tabla a Storage. Útiles para backup, compliance o migrar a otro stack.
          </p>
        </div>
        <form action={runSnapshotAction}>
          <button
            type="submit"
            className="rounded-md bg-leaf text-bone px-4 py-2 text-sm hover:opacity-90"
          >
            Crear snapshot ahora
          </button>
        </form>
      </header>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-bone-50">
        <table className="w-full text-sm">
          <thead className="text-left bg-bone-100">
            <tr>
              <th className="px-3 py-2">Cuándo</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Tablas</th>
              <th className="px-3 py-2 text-right">Filas</th>
              <th className="px-3 py-2 text-right">Tamaño</th>
              <th className="px-3 py-2 text-right">Duración</th>
              <th className="px-3 py-2">Archivos</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((s) => {
              const rowCounts = (s.row_counts ?? {}) as Record<string, number>;
              const totalRows = Object.values(rowCounts).reduce((a, b) => a + b, 0);
              const sizeMb = (Number(s.total_bytes ?? 0) / 1024 / 1024).toFixed(2);
              return (
                <tr key={s.id} className="border-t border-ink/5">
                  <td className="px-3 py-2 whitespace-nowrap text-mute">
                    {new Date(s.started_at).toLocaleString('es-AR')}
                  </td>
                  <td className="px-3 py-2 text-xs">{s.kind}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={s.status as string} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{(s.tables ?? []).length}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{totalRows.toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{sizeMb} MB</td>
                  <td className="px-3 py-2 text-right tabular-nums text-mute">
                    {s.duration_s ? `${s.duration_s}s` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {s.status === 'completed' ? (
                      <SnapshotFiles snapshotId={s.id as string} />
                    ) : s.error ? (
                      <span className="text-xs text-red-700 truncate max-w-[200px] inline-block">{s.error}</span>
                    ) : (
                      <span className="text-xs text-mute">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {snapshots.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-12 text-center text-mute">Aún no hay snapshots. Crea el primero.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: 'bg-amber-100 text-amber-800',
    completed: 'bg-leaf/15 text-leaf',
    failed: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-xs rounded px-2 py-0.5 ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

async function SnapshotFiles({ snapshotId }: { snapshotId: string }) {
  const files = await listSnapshotFiles(snapshotId);
  if (files.length === 0) return <span className="text-xs text-mute">—</span>;
  return <SnapshotFileDownload snapshotId={snapshotId} files={files} />;
}
