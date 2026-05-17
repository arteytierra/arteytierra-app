import { NextResponse, type NextRequest } from 'next/server';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

/**
 * GET /api/n8n/reservations?upcomingDays=14&status=confirmed
 * Para n8n: recordatorios pre-llegada, sync con calendarios externos.
 */
export async function GET(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });

  const sp = req.nextUrl.searchParams;
  const days = Number(sp.get('upcomingDays') ?? 14);
  const status = sp.get('status') ?? 'confirmed';

  const from = new Date().toISOString();
  const to = new Date(Date.now() + days * 86_400_000).toISOString();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('reservations')
    .select(`
      id, starts_at, ends_at, status, guests, notes, ical_uid, user_id,
      resources(kind, products(name, slug)),
      profiles:user_id(email, full_name, phone)
    `)
    .eq('status', status)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .order('starts_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reservations: data ?? [] });
}
