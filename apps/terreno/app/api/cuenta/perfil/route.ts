import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';
export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Tu sesión venció. Volvé a ingresar.' }, { status: 401 });
  let raw: unknown; try { raw = await request.json(); } catch { return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const fullName = typeof (raw as { fullName?: unknown })?.fullName === 'string' ? (raw as { fullName: string }).fullName.trim() : '';
  if (fullName.length < 2 || fullName.length > 120) return NextResponse.json({ error: 'Ingresá un nombre de entre 2 y 120 caracteres.' }, { status: 400 });
  const { error } = await supabase.schema('app').from('profiles').update({ full_name: fullName }).eq('id', user.id);
  if (error) { console.error('[account_profile_update]', error.message); return NextResponse.json({ error: 'No pudimos guardar el nombre. Probá nuevamente.' }, { status: 503 }); }
  return NextResponse.json({ ok: true });
}
