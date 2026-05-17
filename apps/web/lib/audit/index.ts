import 'server-only';
import { headers } from 'next/headers';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export type AuditSeverity = 'info' | 'warning' | 'critical';

interface AuditArgs {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;                 // dotted: domain.verb (e.g. order.refund)
  targetKind?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown>;
  severity?: AuditSeverity;
}

/**
 * Persiste una entrada de auditoría. Best-effort: nunca rompe el flujo principal.
 * Lee ip + user-agent del request actual cuando está disponible.
 */
export async function recordAudit(args: AuditArgs): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    let ip: string | null = null;
    let ua: string | null = null;
    try {
      const h = await headers();
      ip = (h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null);
      ua = h.get('user-agent');
    } catch {
      /* fuera de request context */
    }
    await admin.schema('app').from('audit_log').insert({
      actor_user_id: args.actorUserId ?? null,
      actor_role: args.actorRole ?? null,
      action: args.action,
      target_kind: args.targetKind ?? null,
      target_id: args.targetId ?? null,
      payload: args.payload ?? {},
      severity: args.severity ?? 'info',
      ip,
      user_agent: ua,
    });
  } catch (err) {
    console.error('[audit] failed', err);
  }
}

export interface AuditRow {
  id: number;
  actor_user_id: string | null;
  actor_role: string | null;
  action: string;
  target_kind: string | null;
  target_id: string | null;
  payload: Record<string, unknown>;
  severity: AuditSeverity;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export async function listAudit(opts: {
  limit?: number;
  action?: string;
  severity?: AuditSeverity;
  targetKind?: string;
  targetId?: string;
} = {}): Promise<AuditRow[]> {
  const admin = createSupabaseAdminClient();
  let q = admin
    .schema('app')
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.action) q = q.eq('action', opts.action);
  if (opts.severity) q = q.eq('severity', opts.severity);
  if (opts.targetKind) q = q.eq('target_kind', opts.targetKind);
  if (opts.targetId) q = q.eq('target_id', opts.targetId);
  const { data } = await q;
  return (data ?? []) as never as AuditRow[];
}
