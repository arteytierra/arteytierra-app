import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';
import { rutaInterna } from '@/lib/rutaInterna';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Sin validar, `next=//sitio-externo.com` se resolvía contra `origin` como un
  // host ajeno: el enlace de vuelta del login llevaba afuera del sitio en el
  // instante posterior a autenticarse.
  const next = rutaInterna(searchParams.get('next'));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin));
}
