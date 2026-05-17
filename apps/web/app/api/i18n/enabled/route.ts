import { NextResponse } from 'next/server';
import { enabledLocales } from '@/lib/i18n/config';

/**
 * Public endpoint que devuelve los locales habilitados — usado por el
 * `LanguageSwitcher` cuando no recibe la lista desde un server component.
 */
export async function GET() {
  return NextResponse.json(
    { locales: enabledLocales() },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
  );
}
