import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cancelarPreapprovalMp } from '@/lib/terreno/suscripciones';
import { cancelarSubscripcionPaypal } from '@/lib/terreno/paypal';
import { leerSuscripcionTerreno, cancelarSuscripcionTerreno } from '@/lib/terreno/fulfillment-suscripcion';
import { corsAcequia } from '@/lib/terreno/cors';

export const runtime = 'nodejs';

/**
 * Estado y baja de la suscripción, para la página "Mi cuenta" de la app.
 *
 * GET  → qué plan tiene, en qué estado y hasta cuándo.
 * DELETE → da de baja la renovación EN EL PROVEEDOR, no sólo en nuestra base.
 *
 * Cancelar de un lado solo es lo peor que puede pasar: si sólo tocáramos la
 * base, Mercado Pago o PayPal seguirían cobrando todos los meses a alguien que
 * ya no tiene acceso. Por eso el proveedor va primero y, si falla, no se toca
 * nada local y el usuario ve un error.
 */

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsAcequia(req.headers.get('origin'), 'GET, DELETE, OPTIONS') });
}

async function usuarioDe(req: NextRequest): Promise<{ id: string } | null> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user ? { id: user.id } : null;
}

export async function GET(req: NextRequest) {
  const headers = corsAcequia(req.headers.get('origin'), 'GET, DELETE, OPTIONS');
  const user = await usuarioDe(req);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401, headers });

  try {
    const s = await leerSuscripcionTerreno(user.id);
    if (!s) return NextResponse.json({ plan: 'semilla', estado: 'sin_suscripcion' }, { headers });
    return NextResponse.json({
      plan: s.plan,
      estado: s.estado,
      periodo: s.periodo,
      provider: s.provider,
      vigenteHasta: s.vigente_hasta,
      finDePrueba: s.trial_end,
      seDaDeBajaAlFinal: s.cancel_at_period_end ?? false,
    }, { headers });
  } catch (err) {
    console.error('[terreno suscripcion GET]', err);
    return NextResponse.json({ error: 'No pudimos leer tu suscripción' }, { status: 500, headers });
  }
}

export async function DELETE(req: NextRequest) {
  const headers = corsAcequia(req.headers.get('origin'), 'GET, DELETE, OPTIONS');
  const user = await usuarioDe(req);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401, headers });

  let s;
  try {
    s = await leerSuscripcionTerreno(user.id);
  } catch (err) {
    console.error('[terreno suscripcion DELETE lectura]', err);
    return NextResponse.json({ error: 'No pudimos leer tu suscripción' }, { status: 500, headers });
  }

  if (!s || s.estado === 'cancelada') {
    return NextResponse.json({ ok: true, yaEstaba: true }, { headers });
  }

  // Primero el proveedor. Si esto falla, no tocamos la base: es preferible que el
  // usuario reintente a dejarlo sin acceso y con el cobro andando.
  try {
    if (s.provider === 'mercadopago' && s.provider_ref) {
      await cancelarPreapprovalMp(s.provider_ref);
    } else if (s.provider === 'paypal' && s.provider_ref) {
      await cancelarSubscripcionPaypal(s.provider_ref);
    }
  } catch (err) {
    console.error('[terreno suscripcion DELETE proveedor]', err);
    return NextResponse.json(
      { error: 'No pudimos cancelar la renovación con el medio de pago. Probá de nuevo en un rato.' },
      { status: 502, headers },
    );
  }

  try {
    // Manda el correo de cancelación y, si ya había un período pago en curso,
    // conserva el acceso hasta que venza en lugar de cortarlo de golpe.
    await cancelarSuscripcionTerreno({ userId: user.id });
  } catch (err) {
    console.error('[terreno suscripcion DELETE base]', err);
    return NextResponse.json(
      { error: 'Cancelamos la renovación, pero no pudimos actualizar tu cuenta. Escribinos.' },
      { status: 500, headers },
    );
  }

  return NextResponse.json({
    ok: true,
    // Cancelar durante la prueba nunca cobró nada; conviene decirlo en pantalla.
    enPrueba: s.estado === 'prueba',
    accesoHasta: s.estado === 'activa' ? s.vigente_hasta : null,
  }, { headers });
}
