import { NextResponse, type NextRequest } from 'next/server';
import { trackConversion } from '@/lib/experiments';
import { limitar, ipDe, demasiadosIntentos } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Escribe conversiones sin pedir sesion. Sin tope, cualquiera puede inflar
  // el brazo que quiera de un experimento y el resultado deja de significar
  // algo. 30 por minuto es mas de lo que produce una persona navegando.
  if (!limitar(`exp:${ipDe(req)}`, 30, 60_000)) return demasiadosIntentos();

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
