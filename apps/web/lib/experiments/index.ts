import 'server-only';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Hash determinístico 0..99 a partir de subjectId + salt (experiment key o flag key).
 * Permite asignar variants estables sin guardar nada.
 */
function bucket(subjectId: string, salt: string): number {
  const h = createHash('sha256').update(`${salt}|${subjectId}`).digest();
  // primer uint32 → 0..2^32-1 → mod 100
  const n = h.readUInt32BE(0);
  return n % 100;
}

async function getSubjectId(): Promise<{ id: string; isUser: boolean }> {
  const user = await getCurrentUser();
  if (user) return { id: user.id, isUser: true };
  const c = await cookies();
  const vid = c.get('ay_vid')?.value;
  return { id: vid ?? 'anon', isUser: false };
}

export interface Experiment {
  key: string;
  status: string;
  variants: string[];
  weights: number[] | null;
  rollout_pct: number;
}

const CACHE_TTL_MS = 30_000;
type Cache<T> = { value: T; expires: number };
let expCache: Cache<Map<string, Experiment>> | null = null;
let flagCache: Cache<Map<string, { enabled: boolean; rollout_pct: number; overrides: Record<string, unknown> }>> | null = null;

async function loadExperiments(): Promise<Map<string, Experiment>> {
  if (expCache && expCache.expires > Date.now()) return expCache.value;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app')
    .from('experiments')
    .select('key, status, variants, weights, rollout_pct')
    .eq('status', 'running');
  const map = new Map<string, Experiment>();
  for (const r of (data ?? []) as Experiment[]) map.set(r.key, r);
  expCache = { value: map, expires: Date.now() + CACHE_TTL_MS };
  return map;
}

async function loadFlags() {
  if (flagCache && flagCache.expires > Date.now()) return flagCache.value;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app')
    .from('feature_flags')
    .select('key, enabled, rollout_pct, overrides');
  const map = new Map<string, { enabled: boolean; rollout_pct: number; overrides: Record<string, unknown> }>();
  for (const r of (data ?? []) as Array<{ key: string; enabled: boolean; rollout_pct: number; overrides: Record<string, unknown> }>) {
    map.set(r.key, r);
  }
  flagCache = { value: map, expires: Date.now() + CACHE_TTL_MS };
  return map;
}

function pickVariant(exp: Experiment, subjectBucket: number): string {
  // Si rollout < 100 y el subject quedó fuera, devolver el primer variant (control).
  const rollout = exp.rollout_pct ?? 100;
  if (subjectBucket >= rollout) return exp.variants[0] ?? 'control';

  const within = subjectBucket / rollout; // 0..1
  if (!exp.weights || exp.weights.length !== exp.variants.length) {
    // pesos uniformes
    const idx = Math.min(Math.floor(within * exp.variants.length), exp.variants.length - 1);
    return exp.variants[idx]!;
  }
  const total = exp.weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  for (let i = 0; i < exp.variants.length; i++) {
    acc += (exp.weights[i] ?? 0) / total;
    if (within < acc) return exp.variants[i]!;
  }
  return exp.variants[exp.variants.length - 1]!;
}

/**
 * Devuelve el variant asignado a un experimento (o `null` si no está running).
 * Registra exposure de forma idempotente (PK = experiment_key + subject_id).
 */
export async function getVariant(key: string): Promise<string | null> {
  const map = await loadExperiments();
  const exp = map.get(key);
  if (!exp) return null;
  const subject = await getSubjectId();
  const b = bucket(subject.id, exp.key);
  const variant = pickVariant(exp, b);

  // Exposure best-effort (no bloquea)
  const admin = createSupabaseAdminClient();
  void admin.schema('app').from('experiment_exposures').upsert(
    { experiment_key: exp.key, subject_id: subject.id, variant },
    { onConflict: 'experiment_key,subject_id', ignoreDuplicates: true },
  );

  return variant;
}

export async function isFlagEnabled(key: string): Promise<boolean> {
  const flags = await loadFlags();
  const f = flags.get(key);
  if (!f) return false;
  const user = await getCurrentUser();

  // Overrides explícitos
  const overrides = f.overrides ?? {};
  const users = (overrides as { users?: string[] }).users ?? [];
  const roles = (overrides as { roles?: string[] }).roles ?? [];
  if (user) {
    if (users.includes(user.id)) return true;
    if (user.role && roles.includes(user.role)) return true;
  }

  if (!f.enabled) return false;
  if (f.rollout_pct >= 100) return true;
  if (f.rollout_pct <= 0) return false;

  const subject = await getSubjectId();
  return bucket(subject.id, key) < f.rollout_pct;
}

/**
 * Registra una conversión asociada al experiment + metric.
 * Best-effort. Útil llamar desde fulfillment / signup / lesson_completed.
 */
export async function trackConversion(args: {
  experimentKey: string;
  metric: string;
  valueCents?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const subject = await getSubjectId();
  // Resolver variant actual del subject
  const { data: exposure } = await admin
    .schema('app')
    .from('experiment_exposures')
    .select('variant')
    .eq('experiment_key', args.experimentKey)
    .eq('subject_id', subject.id)
    .maybeSingle();
  await admin.schema('app').from('experiment_conversions').insert({
    experiment_key: args.experimentKey,
    subject_id: subject.id,
    variant: (exposure as { variant?: string } | null)?.variant ?? null,
    metric: args.metric,
    value_cents: args.valueCents ?? null,
    metadata: args.metadata ?? {},
  });
}
