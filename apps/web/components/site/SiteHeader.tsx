'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@arteytierra/ui';
import { useCartUI } from '@/components/shop/CartProvider';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

const ITEMS_BY_LOCALE: Record<Locale, Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>> = {
  es: [
    {
      label: 'Arte y Tierra', href: '/arte-y-tierra',
      children: [
        { label: 'Diseño',      href: '/diseno' },
        { label: 'Asesorías',  href: '/asesorias' },
        { label: 'Proyectos',  href: '/proyectos' },
      ],
    },
    {
      label: 'Tay Pichín', href: '/tay-pichin',
      children: [
        { label: 'Eco Escuela', href: '/cursos' },
        { label: 'Eco Hostel',  href: '/hospedaje' },
      ],
    },
    {
      label: 'Nuestra Tienda', href: '/tienda',
      children: [
        { label: 'Biocosmetica', href: '/biocosmetica' },
        { label: 'Manuales',     href: '/ebooks' },
      ],
    },
    {
      label: 'Conocenos', href: '/nosotros',
      children: [
        { label: 'Nosotros',  href: '/nosotros' },
        { label: 'Blog',      href: '/blog' },
        { label: 'Contacto',  href: '/contacto' },
      ],
    },
  ],
  en: [
    {
      label: 'Arte y Tierra', href: '/en/arte-y-tierra',
      children: [
        { label: 'Design',     href: '/en/diseno' },
        { label: 'Consulting', href: '/en/asesorias' },
        { label: 'Projects',   href: '/en/proyectos' },
      ],
    },
    {
      label: 'Tay Pichín', href: '/en/tay-pichin',
      children: [
        { label: 'Eco School', href: '/en/cursos' },
        { label: 'Eco Hostel', href: '/en/hospedaje' },
      ],
    },
    {
      label: 'Our Store', href: '/en/tienda',
      children: [
        { label: 'Biocosmetics', href: '/en/biocosmetica' },
        { label: 'Manuals',      href: '/en/ebooks' },
      ],
    },
    {
      label: 'About', href: '/en/nosotros',
      children: [
        { label: 'About us', href: '/en/nosotros' },
        { label: 'Journal',  href: '/en/blog' },
        { label: 'Contact',  href: '/en/contacto' },
      ],
    },
  ],
  fr: [
    {
      label: 'Arte y Tierra', href: '/fr/arte-y-tierra',
      children: [
        { label: 'Services',     href: '/fr/diseno' },
        { label: 'Consultation', href: '/fr/asesorias' },
        { label: 'Projets',      href: '/fr/proyectos' },
      ],
    },
    {
      label: 'Tay Pichín', href: '/fr/tay-pichin',
      children: [
        { label: 'Éco-École',  href: '/fr/cursos' },
        { label: 'Éco-Hostel', href: '/fr/hospedaje' },
      ],
    },
    {
      label: 'Notre Boutique', href: '/fr/tienda',
      children: [
        { label: 'Biocosmétique', href: '/fr/biocosmetica' },
        { label: 'Manuels',       href: '/fr/ebooks' },
      ],
    },
    {
      label: 'À propos', href: '/fr/nosotros',
      children: [
        { label: 'À propos',  href: '/fr/nosotros' },
        { label: 'Journal',   href: '/fr/blog' },
        { label: 'Contact',   href: '/fr/contacto' },
      ],
    },
  ],
  pt: [
    {
      label: 'Arte y Tierra', href: '/pt/arte-y-tierra',
      children: [
        { label: 'Design',      href: '/pt/diseno' },
        { label: 'Consultoria', href: '/pt/asesorias' },
        { label: 'Projetos',    href: '/pt/proyectos' },
      ],
    },
    {
      label: 'Tay Pichín', href: '/pt/tay-pichin',
      children: [
        { label: 'Eco Escola', href: '/pt/cursos' },
        { label: 'Eco Hostel', href: '/pt/hospedaje' },
      ],
    },
    {
      label: 'Nossa Loja', href: '/pt/tienda',
      children: [
        { label: 'Biocosméticos', href: '/pt/biocosmetica' },
        { label: 'Manuais',       href: '/pt/ebooks' },
      ],
    },
    {
      label: 'Sobre', href: '/pt/nosotros',
      children: [
        { label: 'Sobre nós', href: '/pt/nosotros' },
        { label: 'Diário',    href: '/pt/blog' },
        { label: 'Contato',   href: '/pt/contacto' },
      ],
    },
  ],
};

const CTA_BY_LOCALE: Record<Locale, { label: string; href: string }> = {
  es: { label: 'Ingresar', href: '/auth/login' },
  en: { label: 'Sign in',  href: '/auth/login' },
  fr: { label: 'Connexion', href: '/auth/login' },
  pt: { label: 'Entrar',   href: '/auth/login' },
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
      brand={
        <span className="flex items-center gap-2.5">
          <Image src="/img/logos/ayt-arbol-negro.png" alt="Arte y Tierra" width={34} height={34} className="h-8 w-8 object-contain flex-shrink-0" />
          <span className="flex flex-col leading-none gap-0.5">
            <span className="font-display text-[15px] tracking-tight text-ink-950 leading-none">Arte y Tierra</span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-clay-700 leading-none">Diseño Ecosistémico</span>
          </span>
        </span>
      }
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
