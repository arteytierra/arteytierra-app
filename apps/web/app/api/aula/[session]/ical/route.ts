import { NextResponse } from 'next/server';
import { buildIcalForSession, getLiveSession } from '@/lib/live';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export async function GET(_req: Request, ctx: { params: Promise<{ session: string }> }) {
  const { session: id } = await ctx.params;
  const session = await getLiveSession(id);
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ics = buildIcalForSession(session, SITE);
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="aula-${id.slice(0, 8)}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
