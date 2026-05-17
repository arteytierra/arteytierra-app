import Link from 'next/link';
import { Calendar, Download, Users, MapPin } from 'lucide-react';
import { Badge, Button } from '@arteytierra/ui';
import { getCurrentUser } from '@/lib/auth/session';
import { listMyReservations } from '@/lib/book/queries';

export const metadata = { title: 'Mis reservas' };

const TONE: Record<string, 'moss' | 'sun' | 'clay' | 'neutral'> = {
  confirmed: 'moss', pending: 'sun', checked_in: 'moss',
  checked_out: 'neutral', cancelled: 'clay',
};

const KIND_LABEL: Record<string, string> = {
  lodging: 'Hospedaje',
  consult: 'Asesoría',
  immersion: 'Inmersión Viva',
};

export default async function MisReservasPage() {
  const user = (await getCurrentUser())!;
  const reservations = await listMyReservations(user.id);

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-12 text-center">
        <p className="font-display text-2xl">No tenés reservas aún</p>
        <p className="mt-3 text-ink-800/65">
          Reservá hospedaje, asesorías o tu lugar en la próxima Inmersión Viva.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/hospedaje"><Button variant="moss">Ver hospedaje</Button></Link>
          <Link href="/asesorias"><Button variant="outline">Asesorías</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((r) => (
        <article key={r.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5 flex flex-wrap gap-5 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="outline">{KIND_LABEL[r.resources.kind] ?? r.resources.kind}</Badge>
              <Badge tone={TONE[r.status] ?? 'neutral'}>{r.status}</Badge>
            </div>
            <h3 className="font-display text-xl">{r.resources.products.name}</h3>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm text-ink-800/75">
              <li className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {new Date(r.starts_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> hasta {new Date(r.ends_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Users size={14} /> {r.guests} {r.guests === 1 ? 'huésped' : 'huéspedes'}
              </li>
            </ul>
            {r.notes && <p className="mt-3 text-sm text-ink-800/70">{r.notes}</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={`/api/reservations/${r.id}/ical`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-950/15 px-4 py-2 text-sm hover:bg-bone-100"
              download
            >
              <Download size={14} /> Calendario .ics
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
