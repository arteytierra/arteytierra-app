import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { sendMetaEvent } from '@/lib/integrations/meta-capi';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const schema = z.object({
  event: z.enum(['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'Subscribe']),
  eventId: z.string().optional(),
  url: z.string().url().optional(),
  // Custom data
  currency: z.string().optional(),
  value: z.number().optional(),
  contentIds: z.array(z.string()).optional(),
  contentName: z.string().optional(),
  contentType: z.enum(['product', 'product_group']).optional(),
  // Cookies fbc/fbp leídas en cliente
  fbc: z.string().optional(),
  fbp: z.string().optional(),
  // Opcional para Lead/Subscribe
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const d = parsed.data;

  const user = await getCurrentUser();
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || undefined;
  const ua = req.headers.get('user-agent') ?? undefined;

  await sendMetaEvent({
    eventName: d.event,
    eventId: d.eventId,
    eventSourceUrl: d.url,
    userData: {
      email: d.email ?? user?.email,
      phone: d.phone,
      externalId: user?.id,
      clientIp: ip,
      clientUserAgent: ua,
      fbc: d.fbc,
      fbp: d.fbp,
      country: 'AR',
    },
    customData: {
      currency: d.currency,
      value: d.value,
      contentIds: d.contentIds,
      contentName: d.contentName,
      contentType: d.contentType,
    },
  });

  return NextResponse.json({ ok: true });
}
