import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';

export const runtime = 'nodejs';

/**
 * Webhook entrante de WhatsApp Cloud API.
 *   GET  → verificación (hub.challenge)
 *   POST → eventos (mensajes, statuses)
 *
 * Verificación de firma: header X-Hub-Signature-256 con HMAC-SHA256
 * usando META_APP_SECRET sobre el body crudo.
 */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('forbidden', { status: 403 });
}

function verifySignature(raw: string, signatureHeader: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}
interface WhatsAppContact {
  wa_id: string;
  profile?: { name?: string };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('x-hub-signature-256'))) {
    return new NextResponse('invalid signature', { status: 401 });
  }
  const body = JSON.parse(raw) as { entry?: Array<{ changes?: Array<{ value?: unknown }> }> };

  const admin = createSupabaseAdminClient();
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value as {
        messages?: WhatsAppMessage[];
        contacts?: WhatsAppContact[];
        statuses?: Array<{ id: string; status: string; recipient_id: string }>;
      };

      // Mensajes entrantes
      for (const msg of value?.messages ?? []) {
        const contact = value.contacts?.find((c) => c.wa_id === msg.from);
        // Upsert contacto
        await admin.from('contacts').upsert(
          {
            phone: msg.from,
            name: contact?.profile?.name ?? null,
            source: 'whatsapp',
            tags: ['whatsapp'],
          },
          { onConflict: 'phone' },
        );

        // Persistir mensaje en CRM
        await admin.from('messages').insert({
          channel: 'whatsapp',
          direction: 'inbound',
          provider_message_id: msg.id,
          from_address: msg.from,
          body: msg.text?.body ?? `[${msg.type}]`,
          raw: msg,
        });

        // Disparar n8n para routing/respuesta automática
        void emitN8nEvent('contact-created', {
          channel: 'whatsapp',
          phone: msg.from,
          name: contact?.profile?.name,
          message: msg.text?.body,
        });
      }

      // Status updates (sent/delivered/read)
      for (const st of value?.statuses ?? []) {
        await admin
          .from('messages')
          .update({ status: st.status })
          .eq('provider_message_id', st.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
