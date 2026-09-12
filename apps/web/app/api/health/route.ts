import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { resolverVersion } from '@/lib/version';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health check.
 * Usado por uptime checks (Better Uptime, UptimeRobot, n8n).
 *
 * Devuelve 200 con detalle si todo OK; 503 si alguna dependencia falla.
 *
 * `version` sale del entorno de ejecución, no de una constante de build: ver
 * `lib/version.ts` para por qué eso importa (un build reusado de caché mentía
 * sobre qué commit estaba vivo, que es el único dato que este endpoint aporta
 * y que no se puede conseguir de otro modo sin cruzar timestamps a mano).
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};
  const start = Date.now();

  // DB check (count rápido en una tabla pública sin RLS para el service_role)
  try {
    const dbStart = Date.now();
    const admin = createSupabaseAdminClient();
    const { error } = await admin.schema('shop').from('products').select('id', { count: 'exact', head: true });
    checks.database = error
      ? { ok: false, error: error.message }
      : { ok: true, ms: Date.now() - dbStart };
  } catch (e) {
    checks.database = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Variables críticas
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'MP_ACCESS_TOKEN',
  ];
  const missing = requiredEnv.filter((k) => !process.env[k]);
  checks.env = missing.length === 0
    ? { ok: true }
    : { ok: false, error: `missing: ${missing.join(', ')}` };

  const allOk = Object.values(checks).every((c) => c.ok);
  const { version, build, buildReusado } = resolverVersion(process.env);
  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      checks,
      total_ms: Date.now() - start,
      /** Commit del deployment vivo. */
      version,
      /** Commit con el que se compiló el bundle: más viejo si el build se reusó. */
      build,
      build_reusado: buildReusado,
    },
    { status: allOk ? 200 : 503 },
  );
}
