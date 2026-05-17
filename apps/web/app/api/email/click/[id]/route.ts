import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

function safeRedirectTarget(raw: string | null): string {
  if (!raw) return SITE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'mailto:') {
      return SITE_URL;
    }
    return url.toString();
  } catch {
    return SITE_URL;
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const to = safeRedirectTarget(req.nextUrl.searchParams.get('to'));

  if (UUID_RE.test(id)) {
    try {
      const admin = createSupabaseAdminClient();
      await admin.schema('app').rpc('mark_email_clicked', { p_id: id });
    } catch (err) {
      console.error('[email/click] failed', err);
    }
  }
  return NextResponse.redirect(to, 302);
}
