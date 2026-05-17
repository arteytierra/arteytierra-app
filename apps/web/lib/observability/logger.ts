/**
 * Logger estructurado JSON (compatible con Cloudflare Logpush, Datadog, etc).
 *
 * Uso:
 *   import { log } from '@/lib/observability/logger';
 *   log.info('order.paid', { orderId, amount });
 *   log.error('webhook.invalid', { provider, err: e.message });
 *
 * Cada llamada emite una línea JSON con timestamp, level, msg, context y request_id si está disponible.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

interface LogContext extends Record<string, unknown> {
  request_id?: string;
}

function emit(level: Level, msg: string, ctx?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(ctx ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (msg: string, ctx?: LogContext) =>
    process.env.NODE_ENV !== 'production' && emit('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit('error', msg, ctx),
};

/** Mide duración de una promesa y la registra. */
export async function timed<T>(
  msg: string,
  fn: () => Promise<T>,
  ctx?: LogContext,
): Promise<T> {
  const start = Date.now();
  try {
    const out = await fn();
    log.info(msg, { ...ctx, ms: Date.now() - start, ok: true });
    return out;
  } catch (e) {
    log.error(msg, {
      ...ctx,
      ms: Date.now() - start,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}
