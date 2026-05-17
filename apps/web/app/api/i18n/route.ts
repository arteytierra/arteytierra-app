import { NextResponse } from 'next/server';
import { ALL_LOCALES, type Locale } from '@/lib/i18n/config';

/**
 * POST /api/i18n  body: { locale: 'es'|'en'|'pt', redirect?: string }
 * Setea la cookie NEXT_LOCALE por 1 año.
 */
export async function POST(req: Request) {
  let body: { locale?: string; redirect?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* allow empty */
  }
  const locale = body.locale?.toLowerCase() as Locale | undefined;
  if (!locale || !(ALL_LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json({ ok: false, error: 'invalid_locale' }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set('NEXT_LOCALE', locale, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
  return res;
}
