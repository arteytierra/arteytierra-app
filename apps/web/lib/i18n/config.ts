/**
 * i18n config · Arte y Tierra
 *
 * Estrategia:
 *  - Default locale `es` en root path (sin prefijo).
 *  - Locales adicionales `en` / `pt` bajo `/en` / `/pt`.
 *  - Detección por:
 *      1. Prefijo de URL (más específico)
 *      2. Cookie `NEXT_LOCALE`
 *      3. Accept-Language header (fallback)
 *  - Configurable via `ENABLE_LOCALES=en,pt` para activar/desactivar sin redeploy.
 */

export const DEFAULT_LOCALE = 'es' as const;
export const ALL_LOCALES = ['es', 'en', 'pt'] as const;
export type Locale = (typeof ALL_LOCALES)[number];

export const enabledLocales = (): Locale[] => {
  const extras = (process.env.ENABLE_LOCALES ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is 'en' | 'pt' => s === 'en' || s === 'pt');
  return [DEFAULT_LOCALE, ...extras];
};

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

export const LOCALE_NATIVE_TAGS: Record<Locale, string> = {
  es: 'es-AR',
  en: 'en-US',
  pt: 'pt-BR',
};

export function detectLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'pt') return seg;
  return DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'pt') return pathname.slice(3) || '/';
  return pathname;
}

export function pathWithLocale(pathname: string, locale: Locale): string {
  const clean = stripLocaleFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '' : clean}`;
}
