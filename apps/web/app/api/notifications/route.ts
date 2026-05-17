import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [], unread: 0 }, { status: 401 });

  const onlyUnread = req.nextUrl.searchParams.get('unread') === '1';
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '20'), 50);

  let q = supabase
    .schema('app')
    .from('notifications')
    .select('id, kind, title, body, url, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (onlyUnread) q = q.is('read_at', null);
  const { data: items } = await q;

  const { count } = await supabase
    .schema('app')
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  return NextResponse.json(
    { items: items ?? [], unread: count ?? 0 },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
