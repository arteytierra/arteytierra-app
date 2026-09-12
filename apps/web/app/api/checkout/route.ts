import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { startCheckout } from '@/lib/commerce/checkout';
import { limitar, ipDe, demasiadosIntentos } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  provider: z.enum(['stripe', 'mercadopago']),
  billing: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  // Es el unico endpoint publico que le habla a Stripe y a Mercado Pago. Cada
  // llamada crea una sesion de pago del lado del proveedor, asi que sin tope
  // alguien puede generarlas de a miles: ensucia el panel de ventas, consume
  // cuota de la API y deja un rastro imposible de leer cuando haya que buscar
  // un cobro real. 10 por minuto alcanza de sobra para una compra con reintentos.
  if (!limitar(`checkout:${ipDe(request)}`, 10, 60_000)) return demasiadosIntentos();

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    const result = await startCheckout(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'No pudimos iniciar el checkout' },
      { status: 400 },
    );
  }
}
