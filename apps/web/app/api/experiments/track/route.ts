import { NextResponse, type NextRequest } from 'next/server';
import { trackConversion } from '@/lib/experiments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { experiment?: string; metric?: string; value_cents?: number; metadata?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (!body.experiment || !body.metric) return NextResponse.json({ ok: false }, { status: 400 });
  await trackConversion({
    experimentKey: body.experiment,
    metric: body.metric,
    valueCents: body.value_cents,
    metadata: body.metadata,
  });
  return NextResponse.json({ ok: true });
}
