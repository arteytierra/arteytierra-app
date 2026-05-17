import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

interface CaptureArgs {
  source: 'route' | 'action' | 'job' | 'webhook' | 'middleware';
  route?: string;
  jobName?: string;
  error: unknown;
  userId?: string | null;
  requestId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Captura un error server-side y lo persiste para revisión.
 * Best-effort — no debe nunca relanzar.
 */
export async function captureError(args: CaptureArgs): Promise<void> {
  try {
    const err = args.error;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? (err.stack ?? null) : null;
    const admin = createSupabaseAdminClient();
    await admin.schema('app').from('server_errors').insert({
      source: args.source,
      route: args.route ?? null,
      job_name: args.jobName ?? null,
      message: message.slice(0, 1000),
      stack: stack?.slice(0, 6000) ?? null,
      user_id: args.userId ?? null,
      request_id: args.requestId ?? null,
      payload: args.payload ?? {},
    });
  } catch {
    /* silenciar — si el logger falla no rompemos el flujo */
  }
}
