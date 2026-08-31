import 'server-only';

import { createSupabaseAdminClient } from '@/lib/db/admin';
import { askClaude, type ClaudeMessage } from '@/lib/integrations/anthropic';
import { sendWhatsappText } from '@/lib/integrations/whatsapp';
import { sendMetaMessage } from '@/lib/integrations/meta-messenger';
import { sendEmail } from '@/lib/integrations/resend';
import { BOT_SYSTEM_PROMPT } from './knowledge-base';

/**
 * Cerebro del chatbot OMNICANAL (WhatsApp, Messenger, Instagram): toma un
 * mensaje entrante, arma el historial de esa conversación, le pide a Claude una
 * respuesta, la envía por el mismo canal por el que llegó y —si es una consulta
 * de obra/diseño privado— escala al equipo por email.
 *
 * Se ejecuta DESPUÉS de responderle 200 a Meta (vía `after()` en la ruta), así
 * que su latencia no afecta el webhook. Toda falla se loguea sin romper nada.
 */

export type BotChannel = 'whatsapp' | 'messenger' | 'instagram';

const HISTORY_LIMIT = 16;
const ESCALATION_EMAIL = process.env.BOT_ESCALATION_EMAIL || 'info.arteytierra@gmail.com';

const CHANNEL_LABEL: Record<BotChannel, string> = {
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
};

type Admin = ReturnType<typeof createSupabaseAdminClient>;

interface BotDecision {
  reply: string;
  escalate?: boolean;
  reason?: string;
}

/** El identificador es un teléfono (WhatsApp) o un id de usuario (Messenger/IG). */
function normalizeId(channel: BotChannel, id: string): string {
  return channel === 'whatsapp' ? id.replace(/[^\d]/g, '') : id;
}

/** Envía el texto por el canal correcto y devuelve el id del mensaje saliente. */
async function sendByChannel(channel: BotChannel, to: string, text: string): Promise<string | undefined> {
  if (channel === 'whatsapp') {
    const res = (await sendWhatsappText(to, text)) as { messages?: Array<{ id: string }> };
    return res.messages?.[0]?.id;
  }
  const res = await sendMetaMessage({ to, text, platform: channel });
  return res.message_id;
}

/** Envía un texto y lo registra como mensaje saliente en el CRM. */
async function sendAndLog(admin: Admin, channel: BotChannel, to: string, text: string): Promise<void> {
  const providerMessageId = await sendByChannel(channel, to, text);
  await admin.from('messages').insert({
    channel,
    direction: 'outbound',
    to_address: to,
    body: text,
    status: 'sent',
    provider_message_id: providerMessageId,
  });
}

/** Respuesta cuando el mensaje entrante no es texto (imagen, audio, etc.). */
export async function sendNonTextFallback(opts: { channel: BotChannel; to: string }): Promise<void> {
  if (process.env.BOT_ENABLED === 'false') return;
  const admin = createSupabaseAdminClient();
  try {
    await sendAndLog(
      admin,
      opts.channel,
      normalizeId(opts.channel, opts.to),
      'Por ahora te puedo leer solo mensajes de texto 🙏 Contame por acá lo que necesitás y te ayudo 🌱',
    );
  } catch (err) {
    console.error('[bot] fallo enviando fallback no-texto', err);
  }
}

/** Flujo completo: piensa la respuesta con Claude, la envía y escala si aplica. */
export async function generateAndSendReply(opts: {
  channel: BotChannel;
  to: string;
  name?: string | null;
  text: string;
}): Promise<void> {
  if (process.env.BOT_ENABLED === 'false') return;

  const admin = createSupabaseAdminClient();
  const channel = opts.channel;
  const to = normalizeId(channel, opts.to);

  // 1. Historial reciente de ESTA conversación en ESTE canal (incluye el
  //    mensaje actual, ya persistido por la ruta).
  const { data: history } = await admin
    .from('messages')
    .select('direction, body, created_at')
    .eq('channel', channel)
    .or(`from_address.eq.${to},to_address.eq.${to}`)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  const messages: ClaudeMessage[] = (history ?? [])
    .slice()
    .reverse()
    .map((m) => ({
      role: m.direction === 'outbound' ? ('assistant' as const) : ('user' as const),
      content: (m.body ?? '').trim(),
    }))
    .filter((m) => m.content);

  // Garantizar que el último turno sea del usuario (el mensaje actual).
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') {
    messages.push({ role: 'user', content: opts.text });
  }

  // Prefill con "{" para forzar que Claude devuelva JSON válido.
  messages.push({ role: 'assistant', content: '{' });

  // 2. Cerebro.
  let decision: BotDecision;
  try {
    const raw = await askClaude({ system: BOT_SYSTEM_PROMPT, messages, maxTokens: 1024 });
    decision = JSON.parse('{' + raw) as BotDecision;
  } catch (err) {
    console.error('[bot] fallo generando/parseando respuesta', err);
    decision = {
      reply:
        '¡Hola! Gracias por escribir a Arte y Tierra 🌱 En un ratito te responde alguien del equipo. Si es urgente, escribinos a info.arteytierra@gmail.com 🙏',
      escalate: true,
      reason: 'fallo técnico del asistente',
    };
  }

  const replyText =
    (decision.reply || '').trim() ||
    'Gracias por tu mensaje 🌱 En breve te responde alguien del equipo.';

  // 3. Enviar + registrar.
  try {
    await sendAndLog(admin, channel, to, replyText);
  } catch (err) {
    console.error('[bot] fallo enviando respuesta', err);
    return;
  }

  // 4. Escalar a Jonatan si es obra/diseño privado.
  if (decision.escalate) {
    await escalateToTeam(admin, {
      channel,
      to,
      name: opts.name ?? null,
      text: opts.text,
      reason: decision.reason,
    });
  }
}

async function escalateToTeam(
  admin: Admin,
  opts: { channel: BotChannel; to: string; name: string | null; text: string; reason?: string },
): Promise<void> {
  const { channel, to, name, text, reason } = opts;
  const label = CHANNEL_LABEL[channel];

  // Aviso por email al equipo (best-effort).
  try {
    const responder =
      channel === 'whatsapp'
        ? `<p><a href="https://wa.me/${to}">Responder por WhatsApp →</a></p>`
        : `<p>Respondé desde la bandeja de ${label} (Meta Business Suite / la app). ID de la persona: <code>${escapeHtml(to)}</code></p>`;
    const html = `
      <h2>🔔 Consulta de obra / diseño privado por ${label}</h2>
      <p>El asistente derivó esta conversación para que la vea una persona del equipo.</p>
      <ul>
        <li><strong>De:</strong> ${escapeHtml(name || 'sin nombre')} (${escapeHtml(to)})</li>
        <li><strong>Canal:</strong> ${label}</li>
        <li><strong>Motivo:</strong> ${escapeHtml(reason || 'obra/diseño privado')}</li>
      </ul>
      <p><strong>Mensaje del cliente:</strong></p>
      <blockquote style="border-left:3px solid #7a8b5a;padding-left:12px;color:#333">${escapeHtml(text)}</blockquote>
      ${responder}
      <p style="color:#888;font-size:12px">Al cliente ya se le respondió que el equipo lo contacta a la brevedad.</p>
    `;
    await sendEmail({
      to: ESCALATION_EMAIL,
      subject: `🔔 Consulta de obra/diseño privado — ${name || to} (${label})`,
      html,
    });
  } catch (err) {
    console.error('[bot] fallo enviando email de escalado', err);
  }

  // Etiquetar el contacto como "escalado" (best-effort). Por ahora solo en
  // WhatsApp: los contactos de Messenger/Instagram todavía no se cargan al CRM.
  if (channel !== 'whatsapp') return;
  try {
    const { data: contact } = await admin
      .schema('app')
      .from('contacts')
      .select('id, tags')
      .eq('phone', to)
      .limit(1)
      .maybeSingle();
    if (contact) {
      const tags = Array.from(
        new Set([...(((contact as { tags?: string[] }).tags) ?? []), 'whatsapp', 'escalado']),
      );
      await admin.schema('app').from('contacts').update({ tags } as never).eq('id', (contact as { id: string }).id);
    }
  } catch (err) {
    console.error('[bot] no se pudo etiquetar el contacto', err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
