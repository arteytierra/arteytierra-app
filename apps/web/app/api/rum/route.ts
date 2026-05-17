import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { log } from '@/lib/observability/logger';

export const runtime = 'nodejs';

const ALLOWED = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB', 'FID']);

interface Body {
  name?: string;
  value?: number;
  rating?: string;
  navigationType?: string;
  url?: string;
}

/**
 * Endpoint RUM. Persiste cada métrica en app.web_vitals con sampling
 * (1 de cada N para no saturar la DB en alto tráfico).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body.name || !ALLOWED.has(body.name) || typeof body.value !== 'number') {
      return new NextResponse(null, { status: 204 });
    }
    const sampleRate = Number(process.env.RUM_SAMPLE_RATE ?? '1');
    if (Math.random() > 1 / Math.max(sampleRate, 1)) {
      return new NextResponse(null, { status: 204 });
    }

    const visitorId = req.cookies.get('ay_vid')?.value ?? null;
    let path: string | null = null;
    try { if (body.url) path = new URL(body.url).pathname; } catch { /* no-op */ }

    const admin = createSupabaseAdminClient();
    await admin.schema('app').from('web_vitals').insert({
      metric: body.name,
      value: body.value,
      rating: body.rating ?? null,
      navigation_type: body.navigationType ?? null,
      path,
      visitor_id: visitorId,
      user_agent: req.headers.get('user-agent'),
    });

    log.info('rum.metric', { name: body.name, value: body.value, rating: body.rating, path });
  } catch {
    /* swallow */
  }
  return new NextResponse(null, { status: 204 });
}
