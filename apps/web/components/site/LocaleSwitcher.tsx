'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  ALL_LOCALES,
  LOCALE_LABELS,
  type Locale,
  pathWithLocale,
  detectLocaleFromPath,
} from '@/lib/i18n/config';

/**
 * Selector de idioma. Cambia path y persiste cookie NEXT_LOCALE.
 * Si un locale está deshabilitado server-side, el middleware redirige al default.
 */
export function LocaleSwitcher({ enabledLocales }: { enabledLocales: Locale[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = detectLocaleFromPath(pathname);

  function switchTo(loc: Locale) {
    document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(pathWithLocale(pathname, loc));
  }

  if (enabledLocales.length <= 1) return null;

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-800/70">
      <Globe size={14} />
      <select
        value={current}
        onChange={(e) => switchTo(e.target.value as Locale)}
        className="bg-transparent border-0 focus:outline-none cursor-pointer"
        aria-label="Idioma"
      >
        {ALL_LOCALES.filter((l) => enabledLocales.includes(l)).map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
