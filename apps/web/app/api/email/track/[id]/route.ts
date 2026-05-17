import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64',
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = raw.replace(/\.gif$/i, '').trim();

  if (UUID_RE.test(id)) {
    try {
      const admin = createSupabaseAdminClient();
      await admin.schema('app').rpc('mark_email_opened', { p_id: id });
    } catch (err) {
      console.error('[email/track] failed', err);
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
    },
  });
}
