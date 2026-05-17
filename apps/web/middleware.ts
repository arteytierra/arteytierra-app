import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = [
  '/mi-cuenta',
  '/mis-cursos',
  '/mis-reservas',
  '/mis-descargas',
  '/mis-pedidos',
  '/mis-referidos',
  '/mi-saldo',
  '/mis-becas',
  '/partners/dashboard',
  '/partners/webhooks',
  '/instructor',
  '/certificados',
  '/auth/nueva-password',
];

const STAFF_PREFIXES = ['/admin'];

const LOCALES = ['en', 'pt'] as const;
const ENABLED_LOCALES = new Set(
  (process.env.ENABLE_LOCALES ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is 'en' | 'pt' => s === 'en' || s === 'pt'),
);

export async function middleware(request: NextRequest) {
  // Propagar pathname al server vía header (consumido por getLocale)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // Captura de código de referido: ?ref=CODE → cookie ay_ref por 30 días.
  // First-touch attribution (no sobreescribimos si ya existe cookie).
  const refParam = request.nextUrl.searchParams.get('ref');
  if (refParam && !request.cookies.get('ay_ref')) {
    const cleaned = refParam.trim().toUpperCase();
    if (/^[A-Z0-9_-]{3,32}$/.test(cleaned)) {
      response.cookies.set('ay_ref', cleaned, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
  }

  // Partner ref code: ?partner=CODE → cookie ay_partner_ref 90 días.
  // No solapa con ay_ref personal — ambos pueden coexistir.
  const partnerParam = request.nextUrl.searchParams.get('partner');
  if (partnerParam && !request.cookies.get('ay_partner_ref')) {
    const cleaned = partnerParam.trim().toUpperCase();
    if (/^[A-Z0-9_-]{4,32}$/.test(cleaned)) {
      response.cookies.set('ay_partner_ref', cleaned, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60,
        path: '/',
      });
    }
  }

  // UTM tracking: persistir cada parámetro en cookie 90 días para atribución.
  // Marcamos last-touch sobreescribiendo, y first-touch solo si no existe.
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const utmCookieMax = 90 * 24 * 60 * 60;
  let utmTouched = false;
  for (const f of utmFields) {
    const raw = request.nextUrl.searchParams.get(f);
    if (!raw) continue;
    const cleaned = raw.trim().slice(0, 80);
    if (!cleaned) continue;
    utmTouched = true;
    response.cookies.set(`ay_${f}`, cleaned, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: utmCookieMax,
      path: '/',
    });
    // First-touch: solo si no existe
    if (!request.cookies.get(`ay_first_${f}`)) {
      response.cookies.set(`ay_first_${f}`, cleaned, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: utmCookieMax,
        path: '/',
      });
    }
  }

  // Visitor anónimo: cookie ay_vid 1 año
  if (!request.cookies.get('ay_vid')) {
    const vid = crypto.randomUUID();
    response.cookies.set('ay_vid', vid, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  }

  // Si hay un touch UTM, marcar last-touch landing por header para que el RSC pueda registrarlo
  if (utmTouched) {
    requestHeaders.set('x-ay-utm-touched', '1');
  }

  // Locale: si la ruta empieza con un locale deshabilitado, redirigir a default.
  // Si está habilitado, marcamos para rewrite al final del middleware (después
  // de auth) — así no perdemos los cookies que pueda setear supabase.
  const firstSeg = request.nextUrl.pathname.split('/')[1];

  // Auto-redirect en primera visita a la home raíz cuando hay locales habilitados.
  // Si Accept-Language sugiere en/pt y el usuario no fijó NEXT_LOCALE, redirigimos.
  if (
    request.nextUrl.pathname === '/' &&
    !request.cookies.get('NEXT_LOCALE') &&
    ENABLED_LOCALES.size > 0
  ) {
    const al = request.headers.get('accept-language') ?? '';
    const top = al.split(',')[0]?.split(';')[0]?.trim().slice(0, 2).toLowerCase();
    if ((top === 'en' || top === 'pt') && ENABLED_LOCALES.has(top)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${top}`;
      return NextResponse.redirect(url, 307);
    }
  }

  let rewriteToPath: string | null = null;
  if (firstSeg && (LOCALES as readonly string[]).includes(firstSeg)) {
    if (!ENABLED_LOCALES.has(firstSeg as 'en' | 'pt')) {
      const url = request.nextUrl.clone();
      url.pathname = request.nextUrl.pathname.slice(3) || '/';
      return NextResponse.redirect(url);
    }
    rewriteToPath = request.nextUrl.pathname.slice(3) || '/';
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() refresca el token y propaga las cookies via setAll
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isStaffOnly = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if ((isProtected || isStaffOnly) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isStaffOnly && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    const role = profile?.role;
    if (role !== 'admin' && role !== 'staff') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Si está logueado y entra a /auth/login o /auth/registro, redirigir
  if (user && (pathname === '/auth/login' || pathname === '/auth/registro')) {
    const next = request.nextUrl.searchParams.get('next') ?? '/mi-cuenta';
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Aplicar rewrite final si la ruta tenía prefijo de locale (e.g. /en/...).
  if (rewriteToPath) {
    const url = request.nextUrl.clone();
    url.pathname = rewriteToPath;
    const r = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    response.cookies.getAll().forEach((c) => r.cookies.set(c.name, c.value, c));
    return r;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
  ],
};
