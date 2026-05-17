import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
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
    .from('newsletter_subscribers')
    .select('id, segments, confirmed_at, unsubscribed_at, confirm_token')
    .eq('email', parsed.email)
    .maybeSingle();

  // Si ya confirmó y no se dio de baja, mergear segmentos y avisar.
  if (existing?.confirmed_at && !existing.unsubscribed_at) {
    const merged = Array.from(new Set([...(existing.segments as string[] ?? []), ...parsed.segments]));
    await admin
      .from('newsletter_subscribers')
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
      .from('newsletter_subscribers')
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
    const { error } = await admin.from('newsletter_subscribers').insert({
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

  // Disparar email transaccional vía n8n (Postmark/Resend/etc)
  const confirmUrl = `${SITE}/newsletter/confirmar?token=${encodeURIComponent(token)}`;
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
    .from('newsletter_subscribers')
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
      .from('newsletter_subscribers')
      .update({ confirmed_at: new Date().toISOString(), confirm_token: null })
      .eq('id', sub.id);

    void emitN8nEvent('newsletter-confirmed', {
      email: sub.email,
      segments: sub.segments,
    });

    // Reflejar en CRM contacts (upsert) y marcar lifecycle subscriber
    await admin
      .from('contacts')
      .upsert(
        { email: sub.email, source: 'newsletter', lifecycle_stage: 'subscriber', tags: sub.segments ?? [] },
        { onConflict: 'email' },
      );

    log.info('newsletter.confirmed', { email: sub.email });
  }

  return { ok: true, email: sub.email as string };
}

export async function unsubscribe(token: string): Promise<boolean> {
  if (!token) return false;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .select('email')
    .single();
  if (error || !data) return false;
  void emitN8nEvent('newsletter-unsubscribed', { email: data.email });
  return true;
}
