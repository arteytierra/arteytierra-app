import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { adminClient } from '@/lib/db/admin';
import { limitar } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Canjea un código de invitación sobre la cuenta del usuario logueado. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Iniciá sesión.' }, { status: 401 });

  // Frena la enumeración de códigos por fuerza bruta (los códigos son de baja
  // entropía). 8 intentos/min por usuario: suficiente para un par de typos.
  if (!limitar(`canjear:${user.id}`, 8, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Demasiados intentos. Esperá un momento y probá de nuevo.' }, { status: 429 });
  }

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
