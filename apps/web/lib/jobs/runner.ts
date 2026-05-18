import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { log } from '@/lib/observability/logger';

export type JobName =
  | 'cleanup-expired-newsletter'
  | 'cleanup-pending-orders'
  | 'cart-abandonment-sweep'
  | 'reservation-reminders'
  | 'monthly-referral-payouts'
  | 'reindex-search'
  | 'live-session-reminders'
  | 'refresh-recommendations'
  | 'process-scheduled-deletions'
  | 'process-webhook-deliveries'
  | 'weekly-db-snapshot';

export type JobHandler = (admin: ReturnType<typeof createSupabaseAdminClient>) => Promise<Record<string, unknown>>;

/**
 * Ejecuta un job con lock cooperativo (vía RPC app.try_acquire_job_lock)
 * y registra la corrida en app.job_runs.
 */
export async function runJob(name: JobName, handler: JobHandler, by = 'cron'): Promise<{ ok: boolean; result?: Record<string, unknown>; error?: string; skipped?: boolean }> {
  const admin = createSupabaseAdminClient();

  // Acquire lock
  const { data: acquired, error: lockErr } = await admin.schema('app').rpc('try_acquire_job_lock', {
    p_job: name,
    p_by: by,
  });
  if (lockErr) {
    log.error('job.lock_error', { job: name, error: lockErr.message });
    return { ok: false, error: lockErr.message };
  }
  if (!acquired) {
    log.warn('job.skipped_locked', { job: name });
    return { ok: false, skipped: true };
  }

  const started = Date.now();
  const { data: run } = await admin
    .schema('app').from('job_runs')
    .insert({ job: name, status: 'running' })
    .select('id')
    .single();

  try {
    const result = await handler(admin);
    const duration = Date.now() - started;
    if (run?.id) {
      await admin.schema('app').from('job_runs').update({
        status: 'ok',
        finished_at: new Date().toISOString(),
        duration_ms: duration,
        result: result as never,
      }).eq('id', run.id);
    }
    log.info('job.ok', { job: name, durationMs: duration, ...result });
    return { ok: true, result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - started;
    if (run?.id) {
      await admin.schema('app').from('job_runs').update({
        status: 'error',
        finished_at: new Date().toISOString(),
        duration_ms: duration,
        error: msg,
      }).eq('id', run.id);
    }
    log.error('job.error', { job: name, error: msg, durationMs: duration });
    // Persist in app.server_errors for the observability dashboard
    try {
      const { captureError } = await import('@/lib/observability/capture');
      void captureError({ source: 'job', jobName: name, error: err });
    } catch { /* no-op */ }
    return { ok: false, error: msg };
  } finally {
    await admin.schema('app').rpc('release_job_lock', { p_job: name });
  }
}
