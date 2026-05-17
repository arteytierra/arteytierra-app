import { NextResponse, type NextRequest } from 'next/server';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

/**
 * GET /api/n8n/orders?status=paid&from=2026-05-01&to=2026-05-31&limit=100
 * Consumido por n8n para reportes, sincronización con CRM externo, etc.
 */
export async function GET(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status');
  const from = sp.get('from');
  const to = sp.get('to');
  const limit = Math.min(Number(sp.get('limit') ?? 100), 500);

  const admin = createSupabaseAdminClient();
  let q = admin
    .from('orders')
    .select('id, status, currency, total_cents, created_at, paid_at, user_id, contact_id, billing')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) q = q.eq('status', status);
  if (from) q = q.gte('created_at', from);
  if (to) q = q.lte('created_at', to);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}
