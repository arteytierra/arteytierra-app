import Link from 'next/link';
import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listReportsAdmin } from '@/lib/qa';
import { ReportActions } from '@/components/admin/reportes/ReportActions';

export const metadata = { title: 'Reportes · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'open', label: 'Abiertos' },
  { key: 'dismissed', label: 'Desestimados' },
  { key: 'actioned', label: 'Aplicados' },
] as const;

type Filter = (typeof TABS)[number]['key'];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'open') as Filter;
  const items = await listReportsAdmin(filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cola de moderación"
        subtitle="Reportes sobre preguntas y respuestas en los foros de cursos."
      />

      <nav className="flex gap-2 border-b border-ink-950/10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/reportes?status=${t.key}`}
            className={
              'px-4 py-2 text-sm transition-colors -mb-px border-b-2 ' +
              (filter === t.key
                ? 'border-ink-950 text-ink-950'
                : 'border-transparent text-ink-800/65 hover:text-ink-950')
            }
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState title="Sin reportes" description={`No hay reportes ${filter === 'open' ? 'pendientes' : filter}.`} />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const row = r as {
              id: string;
              target: 'thread' | 'reply';
              thread_id: string | null;
              reply_id: string | null;
              reason: string;
              status: string;
              created_at: string;
            };
            return (
              <li key={row.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
                <div className="flex items-start gap-3 flex-wrap">
                  <Badge tone={row.target === 'thread' ? 'clay' : 'moss'}>
                    {row.target === 'thread' ? 'Pregunta' : 'Respuesta'}
                  </Badge>
                  <span className="text-xs text-ink-800/55">
                    {new Date(row.created_at).toLocaleString('es-AR')}
                  </span>
                  <code className="ml-auto text-[10px] text-ink-800/40">
                    {(row.thread_id ?? row.reply_id)?.slice(0, 8)}
                  </code>
                </div>
                <p className="mt-3 text-sm text-ink-900 whitespace-pre-wrap">{row.reason}</p>
                {filter === 'open' && <ReportActions reportId={row.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
