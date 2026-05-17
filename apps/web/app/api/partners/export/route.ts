import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();

  // Resolver partner del user
  const { data: partner } = await admin
    .schema('app')
    .from('partners')
    .select('id, ref_code')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: 'not-a-partner' }, { status: 403 });

  const { data: rows } = await admin
    .schema('app')
    .from('partner_commissions')
    .select('order_id, amount_cents, commission_pct, currency, status, created_at, payout_ref')
    .eq('partner_id', (partner as { id: string }).id)
    .order('created_at', { ascending: false });

  const headers = ['order_id', 'amount_cents', 'commission_pct', 'currency', 'status', 'created_at', 'payout_ref'];
  const lines = [headers.join(',')];
  for (const r of (rows ?? []) as Record<string, unknown>[]) {
    lines.push(headers.map((h) => csvEscape(r[h])).join(','));
  }
  const csv = lines.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="comisiones-${(partner as { ref_code: string }).ref_code}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
