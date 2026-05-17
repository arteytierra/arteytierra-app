import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { listMyNotifications } from '@/lib/notifications';
import { markAllNotificationsReadAction } from '@/lib/notifications/actions';

export const metadata: Metadata = {
  title: 'Notificaciones',
  robots: { index: false, follow: false },
};

const KIND_LABELS: Record<string, string> = {
  qa_reply: 'Foro · respuesta',
  qa_accepted: 'Foro · aceptada',
  qa_mention: 'Foro · mención',
  order_paid: 'Compra confirmada',
  enrollment_created: 'Curso · inscripción',
  lesson_published: 'Curso · nueva clase',
  reservation_confirmed: 'Reserva confirmada',
  reservation_reminder: 'Reserva · recordatorio',
  certificate_issued: 'Certificado',
  scholarship_decision: 'Beca · decisión',
  partner_decision: 'Partner · decisión',
  commission_confirmed: 'Comisión confirmada',
  broadcast: 'Aviso',
};

export default async function NotificationsPage() {
  await requireUser();
  const items = await listMyNotifications({ limit: 100 });
  const unread = items.filter((i) => !i.read_at).length;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Notificaciones</h1>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="text-sm text-mute hover:text-ink">Marcar todas como leídas</button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-ink/10 p-12 text-center text-mute">
          Todo al día 🌱
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div
                className={`rounded-lg border p-4 ${
                  n.read_at ? 'border-ink/5 opacity-70' : 'border-leaf/30 bg-leaf/[0.04]'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide text-mute">
                  {KIND_LABELS[n.kind] ?? n.kind}
                </div>
                <div className="font-medium text-ink mt-0.5">{n.title}</div>
                {n.body && <div className="text-sm text-mute mt-1">{n.body}</div>}
                <div className="text-[11px] text-mute mt-1.5">
                  {new Date(n.created_at).toLocaleString('es-AR')}
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.url ? <Link href={n.url}>{inner}</Link> : inner}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
