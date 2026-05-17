import { NextResponse } from 'next/server';
import { globalSearch, groupedSearch } from '@/lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  const grouped = url.searchParams.get('grouped') === '1';
  const limitParam = Number(url.searchParams.get('limit') ?? 12);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 24) : 12;

  if (q.trim().length < 2) {
    return NextResponse.json(
      grouped ? { groups: { course: [], product: [], post: [], thread: [] } } : { hits: [] },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (grouped) {
    const groups = await groupedSearch(q, limit);
    return NextResponse.json(
      { groups },
      // Private porque incluye threads filtrados por user
      { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60' } },
    );
  }

  const hits = await globalSearch(q, limit);
  return NextResponse.json(
    { hits },
    { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=60' } },
  );
}
