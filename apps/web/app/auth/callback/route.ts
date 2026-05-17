import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/server';

export const runtime = 'nodejs';

function safeNext(next: string | null): string {
  if (!next) return '/mi-cuenta';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/mi-cuenta';
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));
  const error = url.searchParams.get('error_description') ?? url.searchParams.get('error');

  if (error) {
    const back = new URL('/auth/login', url.origin);
    back.searchParams.set('message', error);
    return NextResponse.redirect(back);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      const back = new URL('/auth/login', url.origin);
      back.searchParams.set('message', 'No pudimos completar el ingreso. Probá de nuevo.');
      return NextResponse.redirect(back);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
