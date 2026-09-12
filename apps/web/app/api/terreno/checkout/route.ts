import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { crearPreapprovalMp, esPlanPago, esPeriodo, esProveedorPago, pagosAcequiaHabilitados, puedePagarAcequia } from '@/lib/terreno/suscripciones';
import { crearSubscripcionPaypal } from '@/lib/terreno/paypal';
import { corsAcequia, esOrigenAcequia } from '@/lib/terreno/cors';

export const runtime = 'nodejs';

/**
 * Inicia el checkout de una suscripción de Terreno.
 *
 * Lo llama la app terreno (terreno.arteytierra.org), donde el usuario está
 * logueado, pasando su access token de Supabase (Bearer). Como es el mismo
 * proyecto, el token se valida acá para obtener el user_id/email. Devuelve la
 * URL de pago (PayPal para USD, Mercado Pago para ARS). El webhook asigna el plan.
 */

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsAcequia(req.headers.get('origin'), 'POST, OPTIONS') });
}

export async function POST(req: NextRequest) {
  const headers = corsAcequia(req.headers.get('origin'), 'POST, OPTIONS');
  const origin = req.headers.get('origin');

  // Un solo interruptor manda acá. ACEQUIA_TRIAL_ENABLED decide si el alta lleva
  // 3 días de prueba, no si se puede cobrar: exigirlo también dejaría el checkout
  // en 503 para siempre, porque esa variable vive en otro proyecto de Vercel.
  if (!pagosAcequiaHabilitados()) {
    return NextResponse.json({ error: 'Los pagos todavía no están habilitados.' }, { status: 503, headers });
  }

  if (origin && !esOrigenAcequia(origin)) {
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

  // Modo ensayo: durante la prueba de cobro real sólo cobran los correos de la
  // lista. La respuesta es la misma que con los pagos apagados a propósito: quien
  // no está en la lista no tiene por qué enterarse de que hay un ensayo en curso.
  if (!puedePagarAcequia(user.email ?? '')) {
    return NextResponse.json({ error: 'Los pagos todavía no están habilitados.' }, { status: 503, headers });
  }

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

  const siteUrl = process.env.NEXT_PUBLIC_ACEQUIA_SITE_URL ?? 'https://acequia.app';
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
