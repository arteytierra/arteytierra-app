import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import {
  requestDataExportAction,
  requestAccountDeletionAction,
  cancelPrivacyRequestAction,
} from '@/lib/privacy/actions';

export const metadata: Metadata = {
  title: 'Privacidad y datos',
  robots: { index: false, follow: false },
};

export default async function PrivacyPage() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: reqs } = await admin
    .schema('app')
    .from('privacy_requests')
    .select('id, kind, status, scheduled_for, created_at, completed_at, notes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink mb-2">Privacidad y datos</h1>
      <p className="text-mute mb-8">
        Acá podés ejercer tus derechos: descargar todo lo que tenemos sobre vos, o
        pedir la eliminación de tu cuenta.
      </p>

      <section className="rounded-lg border border-ink/10 p-5 mb-6">
        <h2 className="font-display text-lg text-ink mb-1">Descargar mis datos</h2>
        <p className="text-sm text-mute mb-4">
          Generamos un JSON con tu perfil, pedidos, inscripciones, certificados, foros,
          notificaciones y consentimientos.
        </p>
        <div className="flex gap-3">
          <a
            href="/api/privacy/export"
            className="inline-flex items-center rounded-md bg-leaf px-4 py-2 text-sm text-bone"
          >
            Descargar ahora (JSON)
          </a>
          <form action={requestDataExportAction}>
            <button className="rounded-md border border-ink/15 px-4 py-2 text-sm">
              Crear solicitud (queda registrada)
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50/30 p-5 mb-8">
        <h2 className="font-display text-lg text-ink mb-1">Eliminar mi cuenta</h2>
        <p className="text-sm text-mute mb-4">
          Solicitamos un período de espera de 30 días. Tras ese plazo se anonimizan
          tus datos personales — los pedidos pagados se conservan por obligaciones
          fiscales pero sin información identificable.
        </p>
        <form action={requestAccountDeletionAction} className="flex flex-wrap items-center gap-3">
          <input
            name="confirm"
            type="email"
            required
            placeholder={`Confirmá escribiendo ${user.email}`}
            className="flex-1 min-w-[260px] rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">
            Solicitar eliminación
          </button>
        </form>
      </section>

      <h2 className="font-display text-lg text-ink mb-3">Solicitudes</h2>
      <ul className="space-y-2">
        {((reqs ?? []) as Array<Record<string, unknown>>).map((r) => (
          <li key={r.id as string} className="rounded-md border border-ink/10 p-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-ink capitalize">{r.kind as string}</div>
              <div className="text-sm text-mute mt-0.5">
                Estado: {r.status as string} · creada {new Date(r.created_at as string).toLocaleDateString('es-AR')}
              </div>
              {r.scheduled_for ? (
                <div className="text-xs text-mute mt-1">
                  Programada para {new Date(r.scheduled_for as string).toLocaleDateString('es-AR')}
                </div>
              ) : null}
              {r.notes ? <div className="text-xs text-mute mt-1">{r.notes as string}</div> : null}
            </div>
            {(r.status as string) === 'pending' && (
              <form action={async () => { 'use server'; await cancelPrivacyRequestAction(r.id as string); }}>
                <button className="text-xs rounded border border-ink/15 px-2 py-1">Cancelar</button>
              </form>
            )}
          </li>
        ))}
        {(!reqs || reqs.length === 0) && (
          <li className="text-mute text-sm">Sin solicitudes.</li>
        )}
      </ul>
    </main>
  );
}
