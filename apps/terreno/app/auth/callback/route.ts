import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';
import { rutaInterna } from '@/lib/rutaInterna';

/**
 * Un enlace de acceso llega de dos formas y hasta ahora sólo se atendía una.
 *
 *  · `code`       — el flujo PKCE que usa el formulario de login del navegador.
 *  · `token_hash` — el enlace que viene por mail, y el que se genera desde el
 *                   servidor con la API de admin. Supabase sólo redirige a una
 *                   URL que esté en su lista de Redirect URLs, y `localhost` no
 *                   está: al pedir un enlace para desarrollo, el redirect se
 *                   reemplaza en silencio por el Site URL de producción. Con el
 *                   token verificándose acá, el enlace se puede armar a mano
 *                   apuntando a donde haga falta, sin tocar esa lista.
 *
 * No afloja nada: `verifyOtp` valida el token contra Supabase igual que el
 * intercambio del `code`, un token sirve una sola vez y vence, y el destino
 * pasa por `rutaInterna`, que no deja salir del sitio.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const next = rutaInterna(searchParams.get('next'), '/mapa');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (tokenHash) {
    const supabase = await createSupabaseServerClient();
    const tipo = searchParams.get('type') === 'recovery' ? 'recovery' : 'magiclink';
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const state = code || tokenHash ? 'enlace-vencido' : 'enlace-invalido';
  return NextResponse.redirect(new URL(`/login?estado=${state}`, origin));
}
