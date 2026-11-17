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
export const ALL_LOCALES = ['es', 'en', 'fr', 'pt'] as const;
export type Locale = (typeof ALL_LOCALES)[number];

export const enabledLocales = (): Locale[] => {
  const extras = (process.env.ENABLE_LOCALES ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is 'en' | 'fr' | 'pt' => s === 'en' || s === 'fr' || s === 'pt');
  return [DEFAULT_LOCALE, ...extras];
};

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
};

export const LOCALE_NATIVE_TAGS: Record<Locale, string> = {
  es: 'es-AR',
  en: 'en-US',
  fr: 'fr-FR',
  pt: 'pt-BR',
};

export function detectLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'fr' || seg === 'pt') return seg;
  return DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'fr' || seg === 'pt') return pathname.slice(seg.length + 1) || '/';
  return pathname;
}

export function pathWithLocale(pathname: string, locale: Locale): string {
  const clean = stripLocaleFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/**
 * Las rutas que existen traducidas, tal cual están en `app/en` y `app/fr`.
 *
 * El sitio en castellano tiene cuarenta y pico de rutas; en inglés y en francés
 * hay diecinueve. No es una lista de deseos: es el inventario de los
 * `page.tsx` que existen, y **si se traduce una página nueva hay que sumarla
 * acá** o el selector de idioma va a seguir mandando a la portada.
 */
export const RUTAS_TRADUCIDAS: readonly string[] = [
  '/',
  '/arte-y-tierra',
  '/asesorias',
  '/becas',
  '/biocosmetica',
  '/blog',
  '/contacto',
  '/cursos',
  '/cursos/alquimia-natural',
  '/cursos/bioarquitectura',
  '/cursos/cultivo-girgolas',
  '/cursos/inmersion-viva',
  '/cursos/mi-tierra-mi-casa',
  '/diseno',
  '/ebooks',
  '/hospedaje',
  '/nosotros',
  '/proyectos',
  '/tay-pichin',
  '/tienda',
];

/**
 * A dónde lleva el selector de idioma.
 *
 * No es `pathWithLocale` a secas, y la diferencia importa el día que se
 * encienden los idiomas: el carrito, el checkout, el aula, la búsqueda, la
 * ficha de un producto y cada post del blog **no tienen versión en inglés ni en
 * francés**, así que pegarles el prefijo devuelve un 404. Un 404 por apretar
 * «EN» es peor que leer esa página en castellano.
 *
 * Entonces: si la ruta está traducida se va a su equivalente; si no, a la
 * portada de ese idioma, que es contenido y no un error. Al volver al
 * castellano no hace falta ninguna cautela, porque ahí está el sitio entero.
 *
 * `pathWithLocale` se deja como está —pura— porque la usa el `hreflang`, donde
 * degradar a la portada sería declarar una alternativa que no es la misma
 * página.
 */
export function rutaParaCambiarDeIdioma(pathname: string, locale: Locale): string {
  const clean = stripLocaleFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return clean;
  const sinBarra = clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean;
  return RUTAS_TRADUCIDAS.includes(sinBarra) ? pathWithLocale(sinBarra, locale) : `/${locale}`;
}
