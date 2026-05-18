import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export type WebhookEvent =
  | 'order.paid'
  | 'order.refunded'
  | 'order.cancelled'
  | 'enrollment.created'
  | 'lesson.completed'
  | 'course.completed'
  | 'certificate.issued'
  | 'certificate.revoked'
  | 'reservation.confirmed'
  | 'reservation.cancelled'
  | 'scholarship.approved'
  | 'partner.commission.confirmed'
  | 'partner.commission.paid';

const RETRY_DELAYS_S = [60, 300, 1800, 7200, 28800]; // 1m, 5m, 30m, 2h, 8h
const MAX_ATTEMPTS = RETRY_DELAYS_S.length + 1;

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('base64url')}`;
}

export function signPayload(secret: string, body: string, timestamp: number): string {
  const mac = createHmac('sha256', secret);
  mac.update(`${timestamp}.${body}`);
  return `t=${timestamp},v1=${mac.digest('hex')}`;
}

export function verifySignature(args: {
  secret: string;
  body: string;
  signatureHeader: string;
  toleranceSeconds?: number;
}): boolean {
  const parts = Object.fromEntries(
    args.signatureHeader.split(',').map((kv) => kv.split('=')),
  ) as { t?: string; v1?: string };
  if (!parts.t || !parts.v1) return false;
  const ts = Number(parts.t);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > (args.toleranceSeconds ?? 300)) return false;
  const expected = createHmac('sha256', args.secret).update(`${ts}.${args.body}`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Encola entregas para todos los endpoints suscriptos al evento.
 * Best-effort: errores se loguean pero no rompen el flujo principal.
 */
export async function dispatchWebhook(event: WebhookEvent, payload: Record<string, unknown>): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const { data: endpoints } = await admin
      .schema('app')
      .from('webhook_endpoints')
      .select('id, events')
      .eq('enabled', true);

    const list = (endpoints ?? []) as Array<{ id: string; events: string[] }>;
    const eligible = list.filter((e) => e.events.includes('*') || e.events.includes(event));
    if (eligible.length === 0) return;

    const now = new Date().toISOString();
    const rows = eligible.map((e) => ({
      endpoint_id: e.id,
      event,
      payload,
      status: 'pending' as const,
      next_attempt_at: now,
    }));
    await admin.schema('app').from('webhook_deliveries').insert(rows as never);
  } catch (err) {
    console.error('[webhooks-out] dispatch failed', err);
  }
}

/**
 * Procesa el queue de deliveries pendientes/retrying con next_attempt_at <= ahora.
 * Llamar desde cron job cada 1-5 minutos.
 */
export async function processWebhookQueue(batchSize = 50): Promise<{ processed: number; failed: number }> {
  const admin = createSupabaseAdminClient();
  const { data: pending } = await admin
    .schema('app')
    .from('webhook_deliveries')
    .select('id, endpoint_id, event, payload, attempts')
    .in('status', ['pending', 'retrying'])
    .lte('next_attempt_at', new Date().toISOString())
    .order('next_attempt_at', { ascending: true })
    .limit(batchSize);

  const items = (pending ?? []) as Array<{
    id: string;
    endpoint_id: string;
    event: string;
    payload: Record<string, unknown>;
    attempts: number;
  }>;

  let processed = 0;
  let failed = 0;

  for (const d of items) {
    // Resolver endpoint actualizado
    const { data: ep } = await admin
      .schema('app')
      .from('webhook_endpoints')
      .select('url, secret, enabled, consecutive_failures')
      .eq('id', d.endpoint_id)
      .maybeSingle();
    const endpoint = ep as { url: string; secret: string; enabled: boolean; consecutive_failures: number } | null;
    if (!endpoint || !endpoint.enabled) {
      await admin
        .schema('app')
        .from('webhook_deliveries')
        .update({ status: 'dead', last_error: 'endpoint disabled or missing' })
        .eq('id', d.id);
      continue;
    }

    const ts = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ event: d.event, payload: d.payload, ts });
    const signature = signPayload(endpoint.secret, body, ts);
    const attempt = d.attempts + 1;

    let status = 0;
    let respBody = '';
    let err: string | null = null;
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(endpoint.url, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ArteYTierra-Webhooks/1.0',
          'X-AY-Event': d.event,
          'X-AY-Signature': signature,
          'X-AY-Delivery': d.id,
        },
        body,
      });
      clearTimeout(timeout);
      status = res.status;
      respBody = (await res.text().catch(() => '')).slice(0, 2000);
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }

    const ok = status >= 200 && status < 300;

    if (ok) {
      processed++;
      await admin.schema('app').from('webhook_deliveries').update({
        status: 'success',
        attempts: attempt,
        delivered_at: new Date().toISOString(),
        last_response_status: status,
        last_response_body: respBody,
        last_error: null,
      }).eq('id', d.id);
      await admin.schema('app').from('webhook_endpoints').update({
        last_success_at: new Date().toISOString(),
        consecutive_failures: 0,
      }).eq('id', d.endpoint_id);
    } else {
      failed++;
      const dead = attempt >= MAX_ATTEMPTS;
      const nextDelay = dead ? null : RETRY_DELAYS_S[Math.min(attempt - 1, RETRY_DELAYS_S.length - 1)];
      const nextAt = nextDelay ? new Date(Date.now() + nextDelay * 1000).toISOString() : null;
      await admin.schema('app').from('webhook_deliveries').update({
        status: dead ? 'dead' : 'retrying',
        attempts: attempt,
        next_attempt_at: nextAt,
        last_response_status: status || null,
        last_response_body: respBody || null,
        last_error: err,
      }).eq('id', d.id);
      await admin.schema('app').from('webhook_endpoints').update({
        last_failure_at: new Date().toISOString(),
        consecutive_failures: (endpoint.consecutive_failures ?? 0) + 1,
      }).eq('id', d.endpoint_id);

      // Auto-disable después de 20 fallos consecutivos
      if ((endpoint.consecutive_failures ?? 0) + 1 >= 20) {
        await admin.schema('app').from('webhook_endpoints').update({ enabled: false }).eq('id', d.endpoint_id);
      }
    }
  }

  return { processed, failed };
}
