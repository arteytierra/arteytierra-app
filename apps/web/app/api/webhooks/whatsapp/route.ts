import { NextResponse, after, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { generateAndSendReply, sendNonTextFallback } from '@/lib/chatbot/reply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  // Mensajes nuevos a responder — se procesan DESPUÉS de contestarle 200 a Meta.
  const toReply: Array<{ phone: string; name?: string | null; text: string; isText: boolean }> = [];

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
        const isText = msg.type === 'text' && !!msg.text?.body;

        // Upsert contacto
        await admin.schema('app').from('contacts').upsert(
          {
            phone: msg.from,
            name: contact?.profile?.name ?? null,
            source: 'whatsapp',
            tags: ['whatsapp'],
          } as never,
          { onConflict: 'phone' },
        );

        // Persistir mensaje entrante. El índice único (channel, provider_message_id)
        // hace de deduplicador: si Meta reintenta la entrega, el insert falla con
        // código 23505 y NO volvemos a responder el mismo mensaje.
        const { error: insertErr } = await admin.from('messages').insert({
          channel: 'whatsapp',
          direction: 'inbound',
          provider_message_id: msg.id,
          from_address: msg.from,
          body: msg.text?.body ?? `[${msg.type}]`,
          raw: msg as never,
        });

        if (insertErr) {
          if (insertErr.code !== '23505') console.error('[whatsapp] insert inbound', insertErr);
          continue; // duplicado (reintento de Meta) o error → no responder
        }

        // Evento CRM (best-effort, no bloquea)
        void emitN8nEvent('contact-created', {
          channel: 'whatsapp',
          phone: msg.from,
          name: contact?.profile?.name,
          message: msg.text?.body,
        });

        toReply.push({
          phone: msg.from,
          name: contact?.profile?.name,
          text: msg.text?.body ?? '',
          isText,
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

  // El bot responde después de que Meta ya recibió su 200 (no bloquea el webhook,
  // así cumplimos el requisito de responder rápido y evitamos reintentos).
  if (toReply.length > 0) {
    after(async () => {
      for (const m of toReply) {
        try {
          if (m.isText) await generateAndSendReply({ channel: 'whatsapp', to: m.phone, name: m.name, text: m.text });
          else await sendNonTextFallback({ channel: 'whatsapp', to: m.phone });
        } catch (err) {
          console.error('[whatsapp] fallo respondiendo', err);
        }
      }
    });
  }

  return NextResponse.json({ received: true });
}
