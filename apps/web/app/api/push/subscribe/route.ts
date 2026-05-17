import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: parsed.data.userAgent,
    },
    { onConflict: 'endpoint' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  const { endpoint } = await req.json().catch(() => ({ endpoint: '' }));
  if (!endpoint) return NextResponse.json({ error: 'endpoint requerido' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  await admin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);
  return NextResponse.json({ ok: true });
}
