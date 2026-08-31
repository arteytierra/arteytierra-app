import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { crearPreapprovalMp, esPlanPago, esPeriodo, esProveedorPago } from '@/lib/terreno/suscripciones';
import { crearSubscripcionPaypal } from '@/lib/terreno/paypal';

export const runtime = 'nodejs';

/**
 * Inicia el checkout de una suscripción de Terreno.
 *
 * Lo llama la app terreno (terreno.arteytierra.org), donde el usuario está
 * logueado, pasando su access token de Supabase (Bearer). Como es el mismo
 * proyecto, el token se valida acá para obtener el user_id/email. Devuelve la
 * URL de pago (PayPal para USD, Mercado Pago para ARS). El webhook asigna el plan.
 */

const ORIGENES = new Set([
  'https://terreno.arteytierra.org',
  'https://app.acequia.app',
  'http://localhost:3001',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    ...(origin && ORIGENES.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
  };
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get('origin'));
  const origin = req.headers.get('origin');

  if (origin && !ORIGENES.has(origin)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403, headers });
  }

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401, headers });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401, headers });

  const body = await req.json().catch(() => ({}));
  const plan = String(body.plan ?? '');
  const periodo = String(body.periodo ?? '');
  const provider = String(body.provider ?? '');
  if (!esPlanPago(plan) || !esPeriodo(periodo)) {
    return NextResponse.json({ error: 'Plan o período inválido' }, { status: 400, headers });
  }
  if (!esProveedorPago(provider)) {
    return NextResponse.json({ error: 'Proveedor de pago inválido' }, { status: 400, headers });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
  const email = user.email ?? '';

  try {
    const url = provider === 'mercadopago'
      ? await crearPreapprovalMp({ plan, periodo, userId: user.id, email, siteUrl })
      : await crearSubscripcionPaypal({ plan, periodo, userId: user.id, email, siteUrl });
    if (!url) throw new Error('sin URL de checkout');
    return NextResponse.json({ url }, { headers });
  } catch (err) {
    console.error('[terreno checkout]', err);
    return NextResponse.json({ error: 'No pudimos iniciar el pago' }, { status: 500, headers });
  }
}
