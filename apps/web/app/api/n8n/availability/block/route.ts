import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

const schema = z.object({
  resourceId: z.string().uuid(),
  externalUid: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  source: z.string().optional(), // 'airbnb' | 'booking'
});

/** Parsea formato iCal DTSTART (YYYYMMDD o YYYYMMDDTHHMMSSZ) a ISO. */
function icalToIso(s: string): string {
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00Z`;
  }
  if (/^\d{8}T\d{6}Z?$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
  }
  return s;
}

export async function POST(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const startsAt = icalToIso(parsed.data.startsAt);
  const endsAt = icalToIso(parsed.data.endsAt);

  const admin = createSupabaseAdminClient();
  // Idempotencia: ¿ya existe bloqueo con este external_uid?
  const { data: existing } = await admin
    .schema('book').from('availability')
    .select('id')
    .eq('resource_id', parsed.data.resourceId)
    .eq('external_uid', parsed.data.externalUid)
    .maybeSingle();

  if (existing) {
    await admin
      .schema('book').from('availability')
      .update({ starts_at: startsAt, ends_at: endsAt, status: 'blocked' })
      .eq('id', existing.id);
    return NextResponse.json({ id: existing.id, updated: true });
  }

  const { data, error } = await admin
    .schema('book').from('availability')
    .insert({
      resource_id: parsed.data.resourceId,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'blocked',
      external_uid: parsed.data.externalUid,
      source: parsed.data.source ?? 'ical',
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, created: true });
}
