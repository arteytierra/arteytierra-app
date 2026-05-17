'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@arteytierra/ui';
import { useCartUI } from '@/components/shop/CartProvider';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

const ITEMS_BY_LOCALE: Record<Locale, Array<{ label: string; href: string }>> = {
  es: [
    { label: 'Nosotros',       href: '/nosotros' },
    { label: 'Proyectos',      href: '/proyectos' },
    { label: 'Cursos',         href: '/cursos' },
    { label: 'Inmersión Viva', href: '/inmersion-viva' },
    { label: 'Hospedaje',      href: '/hospedaje' },
    { label: 'Blog',           href: '/blog' },
  ],
  en: [
    { label: 'About',     href: '/en/nosotros' },
    { label: 'Projects',  href: '/en/proyectos' },
    { label: 'Courses',   href: '/en/cursos' },
    { label: 'Immersion', href: '/en/inmersion-viva' },
    { label: 'Stay',      href: '/en/hospedaje' },
    { label: 'Journal',   href: '/en/blog' },
  ],
  pt: [
    { label: 'Sobre',     href: '/pt/nosotros' },
    { label: 'Projetos',  href: '/pt/proyectos' },
    { label: 'Cursos',    href: '/pt/cursos' },
    { label: 'Imersão',   href: '/pt/inmersion-viva' },
    { label: 'Hospedagem',href: '/pt/hospedaje' },
    { label: 'Diário',    href: '/pt/blog' },
  ],
};

const CTA_BY_LOCALE: Record<Locale, { label: string; href: string }> = {
  es: { label: 'Inscribirme', href: '/cursos' },
  en: { label: 'Enroll',      href: '/en/cursos' },
  pt: { label: 'Inscrever',   href: '/pt/cursos' },
};

export function SiteHeader({
  locale,
  enabledLocales,
  userId,
}: {
  locale?: Locale;
  enabledLocales?: Locale[];
  userId?: string | null;
} = {}) {
  const { show } = useCartUI();
  const [count, setCount] = useState(0);
  const [resolvedLocale, setResolvedLocale] = useState<Locale>(locale ?? DEFAULT_LOCALE);
  const [enabled, setEnabled] = useState<Locale[]>(enabledLocales ?? [DEFAULT_LOCALE]);

  useEffect(() => {
    fetch('/api/cart')
      .then((r) => r.json())
      .then((c) => setCount(c.itemCount ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (locale && enabledLocales) return;
    // Fallback client-side: leer cookie NEXT_LOCALE + asumir ES + locales activos via /api/i18n
    const ck = document.cookie.split('; ').find((c) => c.startsWith('NEXT_LOCALE='));
    const fromCookie = ck?.split('=')[1] as Locale | undefined;
    const pathLocale = window.location.pathname.split('/')[1];
    const fromPath = pathLocale === 'en' || pathLocale === 'pt' ? (pathLocale as Locale) : undefined;
    setResolvedLocale(fromPath ?? fromCookie ?? DEFAULT_LOCALE);
    // En cliente no podemos leer env — pedimos vía endpoint liviano
    fetch('/api/i18n/enabled')
      .then((r) => r.json())
      .then((d: { locales?: Locale[] }) => {
        if (d.locales?.length) setEnabled(d.locales);
      })
      .catch(() => {});
  }, [locale, enabledLocales]);

  const items = ITEMS_BY_LOCALE[resolvedLocale] ?? ITEMS_BY_LOCALE.es;
  const cta = CTA_BY_LOCALE[resolvedLocale] ?? CTA_BY_LOCALE.es;

  return (
    <Header
      brand="Arte y Tierra"
      items={items}
      cta={cta}
      cartCount={count}
      onCartClick={show}
      extras={
        <span className="inline-flex items-center gap-2">
          <LanguageSwitcher current={resolvedLocale} enabled={enabled} />
          <NotificationBell userId={userId ?? null} />
          <SearchTrigger />
        </span>
      }
      LinkComponent={Link}
    />
  );
}
