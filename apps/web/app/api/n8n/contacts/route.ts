import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

const upsertSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** GET — listar contactos recientes para n8n */
export async function GET(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 500);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('app').from('contacts')
    .select('id, email, name, phone, tags, source, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data ?? [] });
}

/** POST — upsert por email (suscripción newsletter desde n8n / formularios externos) */
export async function POST(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('app').from('contacts')
    .upsert(
      {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        phone: parsed.data.phone,
        tags: parsed.data.tags ?? [],
        source: parsed.data.source ?? 'n8n',
        metadata: (parsed.data.metadata ?? {}) as never,
      } as never,
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
