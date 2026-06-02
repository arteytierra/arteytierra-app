import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fmtIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data: r } = await admin
    .schema('book').from('reservations')
    .select(`
      id, starts_at, ends_at, status, guests, notes, ical_uid, user_id,
      resources(kind, products(name))
    `)
    .eq('id', id)
    .single();

  if (!r || r.user_id !== user.id) {
    return new NextResponse('Not found', { status: 404 });
  }

  const product = (r as never as { resources: { products: { name: string } } }).resources.products;
  const summary = `Arte y Tierra · ${product.name}`;
  const uid = r.ical_uid ?? `${r.id}@arteytierra.org`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arte y Tierra//Reservas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmtIcsDate(r.starts_at)}`,
    `DTEND:${fmtIcsDate(r.ends_at)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(`Huéspedes: ${r.guests}${r.notes ? `\n${r.notes}` : ''}`)}`,
    `STATUS:${r.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="reserva-${r.id.slice(0, 8)}.ics"`,
    },
  });
}
