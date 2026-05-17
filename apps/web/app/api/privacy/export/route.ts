import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { buildUserDataExport } from '@/lib/privacy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requireUser();
  const data = await buildUserDataExport(user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="arteytierra-export-${user.id.slice(0, 8)}.json"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
