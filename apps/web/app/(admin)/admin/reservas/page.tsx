import { Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseServerClient } from '@/lib/db/server';

export const metadata = { title: 'Reservas · Admin' };

const TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  confirmed: 'moss', pending: 'sun', checked_in: 'moss',
  checked_out: 'neutral', cancelled: 'clay',
};

export default async function ReservasAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .schema('book').from('reservations')
    .select('id, starts_at, ends_at, guests, status, notes')
    .order('starts_at', { ascending: true })
    .limit(200);

  return (
    <>
      <PageHeader title="Reservas" description="Hospedaje, asesorías e inmersiones." />

      {!data || data.length === 0 ? (
        <EmptyState
          title="Sin reservas registradas"
          description="Al confirmar una reserva la verás acá. También se sincroniza con iCal de Airbnb/Booking."
        />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Llegada</th>
                <th className="text-left px-5 py-3">Salida</th>
                <th className="text-left px-5 py-3">Huéspedes</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3">{new Date(r.starts_at).toLocaleString('es-AR')}</td>
                  <td className="px-5 py-3">{new Date(r.ends_at).toLocaleString('es-AR')}</td>
                  <td className="px-5 py-3">{r.guests}</td>
                  <td className="px-5 py-3"><Badge tone={TONE[r.status] ?? 'neutral'}>{r.status}</Badge></td>
                  <td className="px-5 py-3 text-ink-800/70 max-w-[40ch] truncate">{r.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
