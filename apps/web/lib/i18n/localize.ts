import type { Locale } from './config';
import { DEFAULT_LOCALE } from './config';

/**
 * Helpers para extraer campos i18n con fallback en cascada:
 *   1. locale solicitado
 *   2. inglés (si fue agregado)
 *   3. español (default / valor de la columna canónica)
 */

export type I18nMap = Record<string, string | null | undefined>;

export function pickI18n(
  i18n: I18nMap | null | undefined,
  locale: Locale,
  fallback: string | null | undefined,
): string {
  if (!i18n || locale === DEFAULT_LOCALE) return fallback ?? '';
  const direct = i18n[locale];
  if (direct && direct.trim()) return direct;
  // Cascada: si pidió pt y no hay, probamos en, luego fallback.
  if (locale !== 'en') {
    const fr = locale !== 'fr' ? i18n.fr : undefined;
    if (fr && typeof fr === 'string' && fr.trim()) return fr;
    const en = i18n.en;
    if (en && en.trim()) return en;
  }
  return fallback ?? '';
}

/**
 * Aplica i18n a un objeto con campos `<field>` + `<field>_i18n`. Útil para
 * proyecciones de productos, posts, etc. Modifica en lugar (devuelve el mismo
 * objeto tipado con los campos resueltos).
 */
export function localizeRow<T extends Record<string, unknown>>(
  row: T,
  locale: Locale,
  fields: ReadonlyArray<keyof T & string>,
): T {
  if (locale === DEFAULT_LOCALE) return row;
  const out = { ...row };
  for (const f of fields) {
    const i18nKey = `${f}_i18n` as keyof T & string;
    const map = out[i18nKey] as I18nMap | undefined;
    if (map && typeof map === 'object') {
      const localized = pickI18n(map, locale, out[f] as string | null | undefined);
      if (localized) (out as Record<string, unknown>)[f] = localized;
    }
  }
  return out;
}

/**
 * Versión array.
 */
export function localizeRows<T extends Record<string, unknown>>(
  rows: T[],
  locale: Locale,
  fields: ReadonlyArray<keyof T & string>,
): T[] {
  if (locale === DEFAULT_LOCALE) return rows;
  return rows.map((r) => localizeRow(r, locale, fields));
}

/**
 * Devuelve un slug localizado si existe en `slug_i18n.<locale>`. Si no, el slug
 * canónico. Útil para construir URLs por idioma.
 */
export function localizedSlug(
  row: { slug: string; slug_i18n?: I18nMap | null },
  locale: Locale,
): string {
  if (locale === DEFAULT_LOCALE) return row.slug;
  const map = row.slug_i18n;
  if (map && typeof map === 'object') {
    const v = map[locale];
    if (v && /^[a-z0-9-]+$/.test(v)) return v;
  }
  return row.slug;
}
