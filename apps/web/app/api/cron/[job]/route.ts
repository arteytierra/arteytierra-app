import { NextResponse } from 'next/server';
import { runJob } from '@/lib/jobs/runner';
import { HANDLERS, type ValidJobName } from '@/lib/jobs/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint para disparar cron jobs. Llamado por Cloudflare Cron Triggers,
 * GitHub Actions schedule, o n8n.
 *
 * Auth: Bearer token vía header Authorization. Token único en CRON_SECRET.
 * Soporta GET (más simple para cron triggers) y POST.
 */

function checkAuth(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get('authorization') ?? '';
  const token = got.startsWith('Bearer ') ? got.slice(7) : '';
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function handle(req: Request, params: { job: string }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const name = params.job as ValidJobName;
  const handler = HANDLERS[name];
  if (!handler) {
    return NextResponse.json({ error: 'unknown_job' }, { status: 404 });
  }
  const res = await runJob(name, handler, 'http');
  if (res.skipped) return NextResponse.json({ skipped: true }, { status: 200 });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true, result: res.result });
}

export async function GET(req: Request, ctx: { params: Promise<{ job: string }> }) {
  return handle(req, await ctx.params);
}

export async function POST(req: Request, ctx: { params: Promise<{ job: string }> }) {
  return handle(req, await ctx.params);
}
