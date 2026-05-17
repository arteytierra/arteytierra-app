import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landing_path?: string;
}

function clean(s: string | undefined | null): string | null {
  if (!s) return null;
  const v = String(s).trim().slice(0, 200);
  return v || null;
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try { body = (await req.json()) as Body; } catch { /* empty */ }

  // Si ningún campo significativo, no insertamos para evitar spam
  const hasAny = Boolean(body.source || body.medium || body.campaign || body.content || body.term || body.referrer);
  if (!hasAny) return NextResponse.json({ ok: true, skipped: true });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const visitorId = req.cookies.get('ay_vid')?.value ?? null;
  const partnerRef = req.cookies.get('ay_partner_ref')?.value ?? null;
  const personalRef = req.cookies.get('ay_ref')?.value ?? null;

  const admin = createSupabaseAdminClient();
  await admin.schema('app').from('attribution_touches').insert({
    user_id: user?.id ?? null,
    visitor_id: visitorId,
    source: clean(body.source),
    medium: clean(body.medium),
    campaign: clean(body.campaign),
    content: clean(body.content),
    term: clean(body.term),
    referrer: clean(body.referrer),
    landing_path: clean(body.landing_path),
    partner_ref: partnerRef,
    personal_ref: personalRef,
  });

  return NextResponse.json({ ok: true });
}
