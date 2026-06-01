import { cache } from 'react';
import { headers, cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  type Locale,
  detectLocaleFromPath,
  enabledLocales,
} from './config';
import { es, type Dict } from './dictionaries/es';
import { en } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import { pt } from './dictionaries/pt';

const DICTS: Record<Locale, Dict> = { es, en, fr, pt };

export type { Dict, Locale };

/**
 * Detecta el locale activo durante la request.
 * Cacheado por request (React cache).
 *
 * Prioridad:
 *  1. Prefijo en URL (`/en`, `/pt`).
 *  2. Cookie `NEXT_LOCALE`.
 *  3. Header `Accept-Language`.
 *  4. Default `es`.
 *
 * Sólo devuelve un locale que esté en `enabledLocales()`.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const enabled = new Set<Locale>(enabledLocales());
  const h = await headers();
  const pathname = h.get('x-pathname') ?? h.get('x-invoke-path') ?? '/';

  const fromPath = detectLocaleFromPath(pathname);
  if (fromPath !== DEFAULT_LOCALE && enabled.has(fromPath)) return fromPath;

  const c = await cookies();
  const cookieLocale = c.get('NEXT_LOCALE')?.value as Locale | undefined;
  if (cookieLocale && enabled.has(cookieLocale)) return cookieLocale;

  const al = h.get('accept-language') ?? '';
  for (const seg of al.split(',')) {
    const tag = seg.split(';')[0]?.trim().slice(0, 2).toLowerCase() as Locale | undefined;
    if (tag && enabled.has(tag)) return tag;
  }
  return DEFAULT_LOCALE;
});

export async function getDict(locale?: Locale): Promise<Dict> {
  const l = locale ?? (await getLocale());
  return DICTS[l] ?? DICTS[DEFAULT_LOCALE];
}

/** Helper sincrónico para client components: recibe locale y devuelve dict. */
export function dict(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}
