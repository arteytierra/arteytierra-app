import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import type { Locale } from '@/lib/i18n/config';
import { renderTemplate, type TemplateName, type TemplateVars } from './templates';
import { wrapHtml, wrapText, type WrapMeta } from './wrap';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
const FROM = process.env.EMAIL_FROM ?? 'Arte y Tierra <hola@arteytierra.org>';
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? 'hola@arteytierra.org';

export type EmailCategory =
  | 'transactional'
  | 'orders'
  | 'courses'
  | 'reservations'
  | 'marketing'
  | 'community';

interface SendArgs<T extends TemplateName> {
  to: string;
  userId?: string | null;
  template: T;
  vars: TemplateVars[T];
  locale?: Locale;
  category?: EmailCategory;
  /** Saltar la verificación de preferencias/suppressions. Solo para transactional crítico. */
  force?: boolean;
}

/**
 * Envía un email transaccional con tracking automático.
 * - Inserta row en app.email_messages antes de enviar.
 * - Reescribe URLs en HTML/text con tracking pixel + click redirect.
 * - Respeta app.email_preferences y app.email_suppressions.
 * - No throw: errores se loguean y se persisten en `error`.
 */
export async function sendTransactional<T extends TemplateName>(
  args: SendArgs<T>,
): Promise<{ id: string | null; status: 'sent' | 'suppressed' | 'failed' }> {
  const admin = createSupabaseAdminClient();
  const recipient = args.to.trim().toLowerCase();
  const category = args.category ?? 'transactional';
  const locale: Locale = args.locale ?? 'es';

  // 1. Check suppression list (excepto transactional crítico forzado)
  if (!args.force) {
    const { data: supp } = await admin
      .schema('app')
      .from('email_suppressions')
      .select('reason, category')
      .eq('email', recipient)
      .or(`category.is.null,category.eq.${category}`)
      .limit(1)
      .maybeSingle();
    if (supp) {
      return { id: null, status: 'suppressed' };
    }

    // 2. Check user preferences si tenemos user_id y la categoría no es transactional
    if (args.userId && category !== 'transactional') {
      const { data: prefs } = await admin
        .schema('app')
        .from('email_preferences')
        .select('orders, courses, reservations, marketing, community')
        .eq('user_id', args.userId)
        .maybeSingle();
      const wants = prefs ? (prefs as Record<string, boolean>)[category] : true;
      if (wants === false) return { id: null, status: 'suppressed' };
    }
  }

  // 3. Render template
  const rendered = renderTemplate(args.template, args.vars, locale);

  // 4. Persist message
  const { data: row, error: insErr } = await admin
    .schema('app')
    .from('email_messages')
    .insert({
      user_id: args.userId ?? null,
      recipient,
      category,
      template: args.template,
      locale,
      subject: rendered.subject,
      payload: args.vars as Record<string, unknown>,
      status: 'queued',
    })
    .select('id')
    .single();

  if (insErr || !row) {
    console.error('[email] insert failed', insErr);
    return { id: null, status: 'failed' };
  }

  const id = row.id as string;
  const meta: WrapMeta = {
    messageId: id,
    siteUrl: SITE_URL,
    locale,
    category,
    recipient,
  };

  const html = wrapHtml(rendered.html, meta);
  const text = wrapText(rendered.text, meta);

  // 5. Send via provider
  try {
    const providerResult = await sendViaProvider({
      to: recipient,
      subject: rendered.subject,
      html,
      text,
    });
    await admin
      .schema('app')
      .from('email_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: providerResult.provider,
        provider_message_id: providerResult.id,
      })
      .eq('id', id);
    return { id, status: 'sent' };
  } catch (err) {
    console.error('[email] send failed', err);
    await admin
      .schema('app')
      .from('email_messages')
      .update({ status: 'failed', error: String(err) })
      .eq('id', id);
    return { id, status: 'failed' };
  }
}

interface SendPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface ProviderResult {
  provider: 'resend' | 'postmark' | 'noop';
  id: string | null;
}

async function sendViaProvider(p: SendPayload): Promise<ProviderResult> {
  const resendKey = process.env.RESEND_API_KEY;
  const postmarkKey = process.env.POSTMARK_API_KEY;

  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [p.to],
        reply_to: REPLY_TO,
        subject: p.subject,
        html: p.html,
        text: p.text,
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as { id?: string };
    return { provider: 'resend', id: body.id ?? null };
  }

  if (postmarkKey) {
    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Postmark-Server-Token': postmarkKey,
      },
      body: JSON.stringify({
        From: FROM,
        To: p.to,
        ReplyTo: REPLY_TO,
        Subject: p.subject,
        HtmlBody: p.html,
        TextBody: p.text,
        MessageStream: 'outbound',
      }),
    });
    if (!res.ok) throw new Error(`postmark ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as { MessageID?: string };
    return { provider: 'postmark', id: body.MessageID ?? null };
  }

  // No provider configurado: log y noop (útil en dev)
  console.warn('[email] no provider configured — would have sent:', p.subject, '→', p.to);
  return { provider: 'noop', id: null };
}

/** Helper para webhooks de proveedores. Marca bounce o complaint. */
export async function recordProviderEvent(args: {
  providerMessageId?: string;
  recipient?: string;
  event: 'delivered' | 'bounced' | 'complained';
  reason?: string;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {};

  if (args.event === 'delivered') {
    updates.status = 'delivered';
    updates.delivered_at = now;
  } else if (args.event === 'bounced') {
    updates.status = 'bounced';
    updates.bounced_at = now;
    updates.error = args.reason ?? 'bounced';
  } else {
    updates.status = 'complained';
    updates.complained_at = now;
    updates.error = args.reason ?? 'complaint';
  }

  let query = admin.schema('app').from('email_messages').update(updates);
  if (args.providerMessageId) {
    query = query.eq('provider_message_id', args.providerMessageId);
  } else if (args.recipient) {
    query = query.eq('recipient', args.recipient.toLowerCase()).order('created_at', { ascending: false }).limit(1);
  } else {
    return;
  }
  await query;

  // Hard bounce o complaint → agregar a suppression list
  if ((args.event === 'bounced' || args.event === 'complained') && args.recipient) {
    await admin.schema('app').from('email_suppressions').upsert({
      email: args.recipient.toLowerCase(),
      reason: args.event === 'bounced' ? 'bounced' : 'complaint',
      category: null,
    });
  }
}
