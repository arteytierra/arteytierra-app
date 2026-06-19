import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendEmail } from '@/lib/integrations/resend';
import { log } from '@/lib/observability/logger';

/**
 * Newsletter — double opt-in.
 * Flujo:
 *  1. POST /api/newsletter/subscribe → insert con confirm_token, dispara email vía n8n.
 *  2. Usuario abre /newsletter/confirmar?token=… → setea confirmed_at.
 *  3. n8n recibe `newsletter-confirmed` y agrega a la lista del proveedor (MailerLite/etc).
 *  4. Si nunca confirma en 7 días: n8n job de cleanup.
 *
 * Segmentación: array `segments` (cursos, hospedaje, ebooks, newsletter genérico…).
 * Re-suscribir con segmentos nuevos hace merge (union) y rerre-envía confirmación
 * si todavía no confirmó.
 */

export const subscribeSchema = z.object({
  email: z.string().email().toLowerCase(),
  full_name: z.string().max(120).optional().nullable(),
  segments: z.array(z.string().max(40)).max(8).default([]),
  source: z.string().max(40).optional().nullable(),
  // Honeypot — bots tienden a llenarlo
  hp: z.string().max(0).optional().or(z.literal('')).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

function generateToken(): string {
  // 32 bytes → 43 chars url-safe
  return crypto.randomBytes(32).toString('base64url');
}

export interface SubscribeResult {
  status: 'sent' | 'already_confirmed' | 'resent';
}

export async function subscribeToNewsletter(
  input: SubscribeInput,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<SubscribeResult> {
  const parsed = subscribeSchema.parse(input);
  if (parsed.hp) {
    // honeypot completado → bot. Fingimos éxito para no dar pistas.
    log.warn('newsletter.bot_detected', { email: parsed.email });
    return { status: 'sent' };
  }
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .schema('app').from('newsletter_subscribers')
    .select('id, segments, confirmed_at, unsubscribed_at, confirm_token')
    .eq('email', parsed.email)
    .maybeSingle();

  // Si ya confirmó y no se dio de baja, mergear segmentos y avisar.
  if (existing?.confirmed_at && !existing.unsubscribed_at) {
    const merged = Array.from(new Set([...(existing.segments as string[] ?? []), ...parsed.segments]));
    await admin
      .schema('app').from('newsletter_subscribers')
      .update({ segments: merged })
      .eq('id', existing.id);
    return { status: 'already_confirmed' };
  }

  const token = existing?.confirm_token ?? generateToken();
  const segments = Array.from(
    new Set([...(existing?.segments as string[] ?? []), ...parsed.segments, 'newsletter']),
  );

  if (existing) {
    await admin
      .schema('app').from('newsletter_subscribers')
      .update({
        full_name: parsed.full_name ?? null,
        segments,
        source: parsed.source ?? null,
        confirm_token: token,
        unsubscribed_at: null,
        ip: meta.ip ?? null,
        user_agent: meta.userAgent ?? null,
      })
      .eq('id', existing.id);
  } else {
    const { error } = await admin.schema('app').from('newsletter_subscribers').insert({
      email: parsed.email,
      full_name: parsed.full_name ?? null,
      segments,
      source: parsed.source ?? null,
      confirm_token: token,
      ip: meta.ip ?? null,
      user_agent: meta.userAgent ?? null,
    });
    if (error) throw new Error(error.message);
  }

  const confirmUrl = `${SITE}/newsletter/confirmar?token=${encodeURIComponent(token)}`;

  // Enviar email de confirmación directo vía Resend
  void sendEmail({
    to: parsed.email,
    subject: 'Confirmá tu suscripción — Arte y Tierra',
    html: doubleOptInHtml({ name: parsed.full_name ?? undefined, confirmUrl }),
  });

  // También notificar a n8n si está configurado (para automatizaciones futuras)
  void emitN8nEvent('newsletter-double-optin', {
    email: parsed.email,
    full_name: parsed.full_name,
    confirm_url: confirmUrl,
    segments,
    source: parsed.source,
  });

  log.info('newsletter.subscribe_requested', { email: parsed.email, segments });
  return { status: existing ? 'resent' : 'sent' };
}

export async function confirmSubscription(token: string): Promise<
  | { ok: true; email: string }
  | { ok: false; reason: 'invalid' | 'expired' }
> {
  if (!token || token.length < 16) return { ok: false, reason: 'invalid' };
  const admin = createSupabaseAdminClient();

  const { data: sub } = await admin
    .schema('app').from('newsletter_subscribers')
    .select('id, email, confirmed_at, segments, created_at')
    .eq('confirm_token', token)
    .maybeSingle();

  if (!sub) return { ok: false, reason: 'invalid' };

  // Si ya estaba confirmado, devolvemos ok igual (idempotencia)
  if (!sub.confirmed_at) {
    // Expiración: 14 días
    const created = new Date(sub.created_at as string).getTime();
    if (Date.now() - created > 14 * 24 * 60 * 60 * 1000) {
      return { ok: false, reason: 'expired' };
    }

    await admin
      .schema('app').from('newsletter_subscribers')
      .update({ confirmed_at: new Date().toISOString(), confirm_token: null })
      .eq('id', sub.id);

    void emitN8nEvent('newsletter-confirmed', {
      email: sub.email,
      segments: sub.segments,
    });

    // Reflejar en CRM contacts (upsert) y marcar lifecycle subscriber
    await admin
      .schema('app').from('contacts')
      .upsert(
        { email: sub.email, source: 'newsletter', lifecycle_stage: 'subscriber', tags: sub.segments ?? [] },
        { onConflict: 'email' },
      );

    log.info('newsletter.confirmed', { email: sub.email });
  }

  return { ok: true, email: sub.email as string };
}

function doubleOptInHtml({ name, confirmUrl }: { name?: string; confirmUrl: string }): string {
  const greeting = name ? `Hola ${name.split(' ')[0]},` : 'Hola,';
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FDFAF5;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#2D2416;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#E8DCC8;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Arte y Tierra</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#4A3F35;">${greeting}</p>
            <h1 style="margin:0 0 20px;font-size:22px;color:#2D2416;font-weight:normal;line-height:1.3;">
              Confirmá tu suscripción a la comunidad regenerativa
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:#4A3F35;line-height:1.7;">
              Hacé clic en el botón para empezar a recibir aprendizajes, cartas y novedades sobre cursos, inmersiones y diseño hidrológico.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#7A5230;border-radius:6px;">
                  <a href="${confirmUrl}"
                     style="display:block;padding:14px 32px;color:#FDFAF5;text-decoration:none;font-size:15px;font-family:Georgia,serif;">
                    Confirmar suscripción →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#9E9289;line-height:1.6;">
              Si no pediste esto, ignorá este mensaje. El link vence en 14 días.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #E8DCC8;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9E9289;">Arte y Tierra · Córdoba, Argentina</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function unsubscribe(token: string): Promise<boolean> {
  if (!token) return false;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('app').from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .select('email')
    .single();
  if (error || !data) return false;
  void emitN8nEvent('newsletter-unsubscribed', { email: data.email });
  return true;
}
