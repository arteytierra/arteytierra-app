import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { adminClient } from '@/lib/db/admin';

export const runtime = 'nodejs';

/** Canjea un código de invitación sobre la cuenta del usuario logueado. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Iniciá sesión.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const codigo = String(body.codigo ?? '').trim();
  if (!codigo) return NextResponse.json({ ok: false, error: 'Ingresá un código.' }, { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient() as any)
      .schema('terreno')
      .rpc('canjear_codigo', { p_codigo: codigo, p_user: user.id });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[canjear]', err);
    return NextResponse.json({ ok: false, error: 'No pudimos validar el código.' }, { status: 500 });
  }
}
