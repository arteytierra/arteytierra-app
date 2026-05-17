import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { adminAnonymizeUserAction } from '@/lib/privacy/actions';

export const metadata = { title: 'Solicitudes de privacidad' };

export default async function AdminPrivacyPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: reqs } = await admin
    .schema('app')
    .from('privacy_requests')
    .select('id, user_id, kind, status, scheduled_for, created_at, notes')
    .order('created_at', { ascending: false })
    .limit(200);

  const now = Date.now();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Solicitudes de privacidad</h1>
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-bone-50 text-left">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Programada</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {((reqs ?? []) as Array<Record<string, unknown>>).map((r) => {
              const scheduled = r.scheduled_for ? new Date(r.scheduled_for as string).getTime() : null;
              const ready = (r.kind as string) === 'delete'
                && (r.status as string) === 'pending'
                && scheduled !== null
                && scheduled <= now;
              return (
                <tr key={r.id as string} className="border-t border-ink/5">
                  <td className="px-3 py-2 text-mute">{new Date(r.created_at as string).toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2 font-mono text-xs">{(r.user_id as string).slice(0, 8)}</td>
                  <td className="px-3 py-2 capitalize">{r.kind as string}</td>
                  <td className="px-3 py-2">{r.status as string}</td>
                  <td className="px-3 py-2 text-mute">
                    {r.scheduled_for ? new Date(r.scheduled_for as string).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {ready && (
                      <form action={async () => { 'use server'; await adminAnonymizeUserAction(r.user_id as string, r.id as string); }}>
                        <button className="rounded bg-red-600 px-3 py-1 text-xs text-white">Anonimizar</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {(!reqs || reqs.length === 0) && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-mute">Sin solicitudes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
