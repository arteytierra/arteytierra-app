import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyN8nInbound } from '@/lib/integrations/n8n';
import { sendPushToUser, broadcastPush } from '@/lib/pwa/push';

export const runtime = 'nodejs';

const schema = z.object({
  userId: z.string().uuid().optional(),
  broadcast: z.boolean().optional(),
  onlyRole: z.string().optional(),
  payload: z.object({
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(500),
    url: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    tag: z.string().optional(),
  }),
});

/**
 * Disparador interno de push. Autenticado con N8N_INTERNAL_TOKEN.
 * Usado por n8n (post-lección, recordatorios) y server actions internas.
 */
export async function POST(req: NextRequest) {
  if (!verifyN8nInbound(req)) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  if (parsed.data.broadcast) {
    const r = await broadcastPush(parsed.data.payload, { onlyRole: parsed.data.onlyRole });
    return NextResponse.json(r);
  }

  if (!parsed.data.userId) {
    return NextResponse.json({ error: 'userId requerido si no es broadcast' }, { status: 400 });
  }

  const r = await sendPushToUser(parsed.data.userId, parsed.data.payload);
  return NextResponse.json(r);
}
