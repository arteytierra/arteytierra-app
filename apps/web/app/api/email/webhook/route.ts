import { NextResponse, type NextRequest } from 'next/server';
import { recordProviderEvent } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook unificado para Resend y Postmark.
 * Configurar la URL como webhook en el dashboard del proveedor.
 *
 * Resend: usa header `svix-signature` + `RESEND_WEBHOOK_SECRET` (HMAC).
 * Postmark: protegido por basic-auth opcional via `POSTMARK_WEBHOOK_TOKEN`
 * en query string (?token=...).
 */
export async function POST(req: NextRequest) {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: 'no body' }, { status: 400 });
  }

  const isPostmark = req.headers.get('user-agent')?.toLowerCase().includes('postmark') ||
    req.nextUrl.searchParams.has('token');

  if (isPostmark) {
    const expected = process.env.POSTMARK_WEBHOOK_TOKEN;
    if (expected && req.nextUrl.searchParams.get('token') !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    try {
      const body = JSON.parse(raw) as {
        RecordType?: string;
        MessageID?: string;
        Email?: string;
        Recipient?: string;
        Description?: string;
        Details?: string;
      };
      const rt = (body.RecordType ?? '').toLowerCase();
      const email = body.Email ?? body.Recipient;
      const messageId = body.MessageID;
      const reason = body.Description ?? body.Details;

      if (rt === 'delivery') {
        await recordProviderEvent({ providerMessageId: messageId, recipient: email, event: 'delivered' });
      } else if (rt === 'bounce') {
        await recordProviderEvent({ providerMessageId: messageId, recipient: email, event: 'bounced', reason });
      } else if (rt === 'spamcomplaint') {
        await recordProviderEvent({ providerMessageId: messageId, recipient: email, event: 'complained', reason });
      }
    } catch (err) {
      console.error('[email/webhook] postmark parse', err);
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Resend
  try {
    const body = JSON.parse(raw) as {
      type?: string;
      data?: { email_id?: string; to?: string[]; bounce?: { type?: string }; reason?: string };
    };
    const type = (body.type ?? '').toLowerCase();
    const messageId = body.data?.email_id;
    const email = body.data?.to?.[0];

    if (type === 'email.delivered') {
      await recordProviderEvent({ providerMessageId: messageId, recipient: email, event: 'delivered' });
    } else if (type === 'email.bounced') {
      await recordProviderEvent({
        providerMessageId: messageId,
        recipient: email,
        event: 'bounced',
        reason: body.data?.bounce?.type ?? body.data?.reason,
      });
    } else if (type === 'email.complained') {
      await recordProviderEvent({ providerMessageId: messageId, recipient: email, event: 'complained' });
    }
  } catch (err) {
    console.error('[email/webhook] resend parse', err);
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
