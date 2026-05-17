import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge, Button } from '@arteytierra/ui';
import { getJoinPayload, getLiveSession, isSessionJoinable } from '@/lib/live';
import { requireUser } from '@/lib/auth/session';
import { JitsiEmbed } from '@/components/live/JitsiEmbed';
import { PresenceList } from '@/components/live/PresenceList';

export const metadata = { title: 'Aula en vivo', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AulaPage({ params }: { params: Promise<{ session: string }> }) {
  const { session: sessionId } = await params;
  const me = await requireUser(`/aula/${sessionId}`);

  const session = await getLiveSession(sessionId);
  if (!session) notFound();

  const joinable = isSessionJoinable(session);
  const start = new Date(session.scheduled_at);

  if (!joinable) {
    return (
      <main className="min-h-screen bg-bone-100">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center space-y-6">
          <Badge tone={session.status === 'cancelled' ? 'clay' : 'neutral'}>
            {session.status === 'cancelled' ? 'Cancelada' : session.status === 'ended' ? 'Finalizada' : 'Próximamente'}
          </Badge>
          <h1 className="font-display text-3xl text-ink-950">{session.title}</h1>
          {session.description ? (
            <p className="text-ink-800/75">{session.description}</p>
          ) : null}
          <p className="text-sm text-ink-800/70">
            {start.toLocaleString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {session.duration_min} min
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href={`/api/aula/${session.id}/ical`}>
              <Button variant="outline" size="sm">Agregar al calendario</Button>
            </Link>
            <Link href={session.course_id ? `/mis-cursos` : '/'}>
              <Button size="sm">Volver</Button>
            </Link>
          </div>
          {session.recording_url ? (
            <p className="text-sm pt-4">
              <Link href={session.recording_url} className="text-moss-700 hover:underline">
                Ver grabación →
              </Link>
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  const join = await getJoinPayload(session.id);
  if (!join.ok) {
    if (join.reason === 'login_required') redirect(`/auth/login?next=/aula/${session.id}`);
    if (join.reason === 'not_enrolled') {
      return (
        <main className="min-h-screen bg-bone-100">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center space-y-4">
            <h1 className="font-display text-3xl text-ink-950">No estás inscripto</h1>
            <p className="text-ink-800/70">Necesitás estar inscripto al curso para acceder a esta clase.</p>
            <Link href="/cursos"><Button>Ver cursos</Button></Link>
          </div>
        </main>
      );
    }
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink-950 text-bone-50">
      <header className="px-6 py-4 border-b border-bone-50/10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-lg truncate">{session.title}</h1>
          <p className="text-xs text-bone-50/60">
            En vivo · {session.duration_min} min · {join.isHost ? 'Sos host' : 'Asistente'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PresenceList
            channelKey={`aula:${session.id}`}
            me={{ user_id: me.id, name: me.fullName ?? 'Asistente' }}
          />
          <Link href={session.course_id ? '/mis-cursos' : '/'} className="text-sm hover:underline">
            Salir
          </Link>
        </div>
      </header>

      <JitsiEmbed url={join.url} />
    </main>
  );
}
