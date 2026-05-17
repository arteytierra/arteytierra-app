'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  ALL_LOCALES,
  LOCALE_LABELS,
  pathWithLocale,
  stripLocaleFromPath,
  type Locale,
} from '@/lib/i18n/config';

/**
 * Selector minimal. Setea cookie via `/api/i18n` y navega al equivalente
 * en otro locale (mismo path con prefijo).
 *
 * `enabled` viene del server porque `enabledLocales()` lee env.
 */
export function LanguageSwitcher({
  current,
  enabled,
}: {
  current: Locale;
  enabled: Locale[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  function change(locale: Locale) {
    if (locale === current) return;
    startTransition(async () => {
      try {
        await fetch('/api/i18n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale }),
        });
      } catch {
        /* sigue igual */
      }
      const target = pathWithLocale(stripLocaleFromPath(pathname), locale);
      router.push(target);
      router.refresh();
    });
  }

  // Si sólo hay un locale activado, no mostramos nada.
  if (enabled.length <= 1) return null;
  const visible = ALL_LOCALES.filter((l) => enabled.includes(l));

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink-950/15 bg-bone-50 px-1.5 py-1 text-xs">
      <Globe size={12} className="text-ink-800/60 ml-1.5" />
      {visible.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => change(l)}
          aria-label={`Cambiar idioma a ${LOCALE_LABELS[l]}`}
          aria-current={l === current ? 'true' : undefined}
          className={
            'rounded-full px-2 py-0.5 uppercase tracking-wide transition-colors ' +
            (l === current
              ? 'bg-ink-950 text-bone-50'
              : 'text-ink-800/65 hover:bg-bone-100')
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
