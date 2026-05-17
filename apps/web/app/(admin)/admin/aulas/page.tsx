import Link from 'next/link';
import { Badge, Button } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listAllLiveSessions } from '@/lib/live';
import { LiveSessionDialog } from '@/components/admin/aulas/LiveSessionDialog';
import { CancelLiveButton } from '@/components/admin/aulas/CancelLiveButton';

export const metadata = { title: 'Aulas en vivo · Admin' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'upcoming', label: 'Próximas' },
  { key: 'past', label: 'Pasadas' },
  { key: 'all', label: 'Todas' },
] as const;

const STATUS_TONE: Record<string, 'moss' | 'clay' | 'neutral' | 'sun'> = {
  scheduled: 'sun',
  live: 'moss',
  ended: 'neutral',
  cancelled: 'clay',
};

export default async function AdminAulasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (TABS.find((t) => t.key === sp.status)?.key ?? 'upcoming') as 'upcoming' | 'past' | 'all';
  const sessions = await listAllLiveSessions(filter);

  return (
    <>
      <PageHeader
        title="Aulas en vivo"
        description="Programá clases en vivo, gestioná hosts y recordatorios."
        actions={<LiveSessionDialog />}
      />

      <nav className="flex gap-2 mb-6 border-b border-ink-950/10">
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={`/admin/aulas?status=${t.key}`}
              className={
                'px-4 py-2 text-sm border-b-2 -mb-px transition-colors ' +
                (active
                  ? 'border-moss-700 text-ink-950 font-medium'
                  : 'border-transparent text-ink-800/65 hover:text-ink-950')
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {sessions.length === 0 ? (
        <EmptyState title="Sin sesiones" description={`No hay sesiones "${filter}".`} />
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status}</Badge>
                    {s.recording_enabled ? <Badge tone="outline">Grabación</Badge> : null}
                  </div>
                  <h3 className="font-medium text-ink-950">{s.title}</h3>
                  <p className="text-xs text-ink-800/65 mt-1">
                    {new Date(s.scheduled_at).toLocaleString('es-AR')} · {s.duration_min} min ·
                    sala <code className="font-mono">{s.room}</code>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/aula/${s.id}`}>
                    <Button variant="outline" size="sm">Vista pública</Button>
                  </Link>
                  <Link href={`/api/aula/${s.id}/ical`}>
                    <Button variant="outline" size="sm">iCal</Button>
                  </Link>
                  {s.status !== 'cancelled' && s.status !== 'ended' ? (
                    <CancelLiveButton id={s.id} />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
