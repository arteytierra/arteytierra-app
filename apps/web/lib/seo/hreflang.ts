const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

/**
 * Hreflang · preparado para EN/PT.
 *
 * Convención: idioma por subpath `/en/...` `/pt/...`, español como default (root).
 * Cuando se active i18n, se setea `ENABLE_LOCALES=en,pt` y este helper devuelve
 * los `alternates.languages` automáticamente.
 *
 * Doc: https://developers.google.com/search/docs/specialty/international/localized-versions
 */

const ENABLED = (process.env.ENABLE_LOCALES ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean) as Array<'en' | 'pt'>;

export function languagesFor(path: string): Record<string, string> | undefined {
  if (ENABLED.length === 0) return undefined;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const out: Record<string, string> = {
    'es-AR': `${SITE}${clean}`,
    'x-default': `${SITE}${clean}`,
  };
  for (const loc of ENABLED) {
    out[loc] = `${SITE}/${loc}${clean === '/' ? '' : clean}`;
  }
  return out;
}

/** Para `generateMetadata`: devuelve el objeto alternates.languages si hay locales. */
export function alternatesFor(path: string) {
  const languages = languagesFor(path);
  if (!languages) return undefined;
  return { languages };
}
