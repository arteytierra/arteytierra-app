import { NextResponse } from 'next/server';
import { enabledLocales } from '@/lib/i18n/config';

/**
 * Public endpoint que devuelve los locales habilitados — usado por el
 * `LanguageSwitcher` cuando no recibe la lista desde un server component.
 */
export async function GET() {
  // La lista solo cambia con un redeploy (env ENABLE_LOCALES), que invalida el
  // cache del CDN igual. Cacheamos agresivo para no invocar la función en cada
  // carga de página: navegador 1h, CDN 1 día, con stale-while-revalidate.
  return NextResponse.json(
    { locales: enabledLocales() },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
