import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';
import { rutaInterna } from '@/lib/rutaInterna';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = rutaInterna(searchParams.get('next'), '/mapa');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const state = code ? 'enlace-vencido' : 'enlace-invalido';
  return NextResponse.redirect(new URL(`/login?estado=${state}`, origin));
}
