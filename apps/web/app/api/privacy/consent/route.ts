import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  analytics?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  policy_version?: string;
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try { body = await req.json(); } catch { /* empty */ }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const visitorId = req.cookies.get('ay_vid')?.value ?? null;

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const ua = req.headers.get('user-agent');

  const admin = createSupabaseAdminClient();
  await admin.schema('app').from('consents').insert({
    user_id: user?.id ?? null,
    visitor_id: visitorId,
    necessary: true,
    analytics: Boolean(body.analytics),
    marketing: Boolean(body.marketing),
    personalization: Boolean(body.personalization),
    policy_version: body.policy_version ?? 'v1',
    user_agent: ua,
    ip,
  });
  return NextResponse.json({ ok: true });
}
