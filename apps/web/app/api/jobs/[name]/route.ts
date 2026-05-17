import { NextResponse, type NextRequest } from 'next/server';
import { runJob, type JobName } from '@/lib/jobs/runner';
import { HANDLERS, type ValidJobName } from '@/lib/jobs/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // hasta 5min

/**
 * Endpoint para ejecutar jobs por cron externo.
 * Auth: Bearer ${CRON_SECRET} en header Authorization.
 *
 * Uso desde Cloudflare Worker:
 *   curl -X POST -H "Authorization: Bearer ${CRON_SECRET}" \
 *     https://arteytierra.org/api/jobs/cleanup-pending-orders
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!(name in HANDLERS)) {
    return NextResponse.json({ error: `job desconocido: ${name}` }, { status: 404 });
  }

  const handler = HANDLERS[name as ValidJobName];
  const result = await runJob(name as JobName, handler, 'cron-http');
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

// GET para health-check del endpoint (no ejecuta nada).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const exists = name in HANDLERS;
  return NextResponse.json({ exists, name });
}
