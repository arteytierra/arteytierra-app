import { NextResponse } from 'next/server';
import { subscribeToNewsletter, subscribeSchema } from '@/lib/newsletter';
import { log } from '@/lib/observability/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate-limit naive en memoria por IP (best-effort; en producción usar KV/Redis)
const RATE = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (RATE.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  RATE.set(ip, arr);
  return false;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const userAgent = req.headers.get('user-agent');

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await subscribeToNewsletter(parsed.data, { ip, userAgent });
    return NextResponse.json(result);
  } catch (err) {
    log.error('newsletter.subscribe_error', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
