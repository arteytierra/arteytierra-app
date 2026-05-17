import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health check.
 * Usado por uptime checks (Better Uptime, UptimeRobot, n8n).
 *
 * Devuelve 200 con detalle si todo OK; 503 si alguna dependencia falla.
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};
  const start = Date.now();

  // DB check (count rápido en una tabla pública sin RLS para el service_role)
  try {
    const dbStart = Date.now();
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('products').select('id', { count: 'exact', head: true });
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
  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      checks,
      total_ms: Date.now() - start,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    },
    { status: allOk ? 200 : 503 },
  );
}
