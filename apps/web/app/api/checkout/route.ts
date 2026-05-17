import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { startCheckout } from '@/lib/commerce/checkout';

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
