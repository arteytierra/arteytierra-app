import { NextResponse, after, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { generateAndSendReply, sendNonTextFallback, type BotChannel } from '@/lib/chatbot/reply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook entrante de Messenger e Instagram (Meta Messenger Platform).
 *   GET  → verificación (hub.challenge)
 *   POST → eventos de mensajería
 *
 * Un mismo webhook atiende los dos canales: se distinguen por `object`
 * ("page" = Messenger, "instagram" = Instagram). Ambos entregan los mensajes
 * bajo `entry[].messaging[]`.
 *
 * Verificación de firma: header X-Hub-Signature-256 con HMAC-SHA256 usando
 * META_APP_SECRET sobre el body crudo (el mismo secreto de la app de WhatsApp).
 */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN && challenge) {
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

interface MetaMessaging {
  sender?: { id: string };
  recipient?: { id: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: unknown[];
  };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('x-hub-signature-256'))) {
    return new NextResponse('invalid signature', { status: 401 });
  }

  const body = JSON.parse(raw) as {
    object?: string;
    entry?: Array<{ id?: string; messaging?: MetaMessaging[] }>;
  };

  // "instagram" = Instagram Direct; cualquier otra cosa (page) = Messenger.
  const channel: BotChannel = body.object === 'instagram' ? 'instagram' : 'messenger';

  const admin = createSupabaseAdminClient();

  // Mensajes nuevos a responder — se procesan DESPUÉS de contestarle 200 a Meta.
  const toReply: Array<{ to: string; text: string; isText: boolean }> = [];

  for (const entry of body.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const msg = ev.message;
      if (!msg) continue; // delivery / read / postback → no es un mensaje a responder
      if (msg.is_echo) continue; // eco de NUESTRO propio envío → ignorar (evita bucle)

      const senderId = ev.sender?.id;
      if (!senderId) continue;

      const isText = typeof msg.text === 'string' && msg.text.trim().length > 0;

      // Persistir mensaje entrante. El índice único (channel, provider_message_id)
      // deduplica: si Meta reintenta la entrega, el insert falla con 23505 y NO
      // volvemos a responder el mismo mensaje.
      const { error: insertErr } = await admin.from('messages').insert({
        channel,
        direction: 'inbound',
        provider_message_id: msg.mid,
        from_address: senderId,
        body: msg.text ?? '[no-texto]',
        raw: ev as never,
      });

      if (insertErr) {
        if (insertErr.code !== '23505') console.error('[meta] insert inbound', insertErr);
        continue; // duplicado (reintento de Meta) o error → no responder
      }

      // Evento CRM (best-effort, no bloquea)
      void emitN8nEvent('contact-created', {
        channel,
        externalId: senderId,
        message: msg.text ?? null,
      });

      toReply.push({ to: senderId, text: msg.text ?? '', isText });
    }
  }

  // El bot responde después de que Meta ya recibió su 200 (no bloquea el webhook).
  if (toReply.length > 0) {
    after(async () => {
      for (const m of toReply) {
        try {
          if (m.isText) await generateAndSendReply({ channel, to: m.to, text: m.text });
          else await sendNonTextFallback({ channel, to: m.to });
        } catch (err) {
          console.error('[meta] fallo respondiendo', err);
        }
      }
    });
  }

  return NextResponse.json({ received: true });
}
