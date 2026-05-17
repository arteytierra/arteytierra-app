import { NextResponse, type NextRequest } from 'next/server';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

/**
 * GET /api/n8n/abandoned-carts?hours=2&maxHours=72
 * Devuelve carritos con ítems, usuario asociado y email, que no avanzaron a checkout.
 * n8n los polea cada hora y dispara secuencia de recuperación.
 */
export async function GET(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });

  const sp = req.nextUrl.searchParams;
  const minHours = Number(sp.get('hours') ?? 2);
  const maxHours = Number(sp.get('maxHours') ?? 72);
  const now = Date.now();
  const fromTs = new Date(now - maxHours * 3600_000).toISOString();
  const toTs = new Date(now - minHours * 3600_000).toISOString();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('carts')
    .select(`
      id, user_id, currency, updated_at,
      cart_items(id, qty, unit_price_cents, products(name, slug)),
      profiles:user_id(email, full_name)
    `)
    .gte('updated_at', fromTs)
    .lte('updated_at', toTs)
    .not('user_id', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const carts = ((data ?? []) as Array<{ cart_items: unknown[] }>).filter(
    (c) => Array.isArray(c.cart_items) && c.cart_items.length > 0,
  );
  return NextResponse.json({ carts });
}
