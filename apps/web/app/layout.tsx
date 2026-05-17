import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { SiteProviders } from '@/components/site/SiteProviders';
import { Pixels } from '@/components/analytics/Pixels';
import { JsonLd } from '@/components/seo/JsonLd';
import { ORG_JSONLD, WEBSITE_JSONLD } from '@/lib/seo/jsonld';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OnlineIndicator } from '@/components/pwa/OnlineIndicator';
import { WebVitals } from '@/components/observability/WebVitals';
import { NewsletterPopup } from '@/components/newsletter/NewsletterPopup';
import { CommandK } from '@/components/search/CommandK';
import { AttributionBeacon } from '@/components/analytics/AttributionBeacon';
import { ConsentBanner } from '@/components/privacy/ConsentBanner';
import { getLocale } from '@/lib/i18n';
import { LOCALE_NATIVE_TAGS } from '@/lib/i18n/config';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Arte y Tierra — Educación regenerativa y diseño del territorio',
    template: '%s · Arte y Tierra',
  },
  description:
    'Bioarquitectura, diseño hidrológico, agroecología y educación regenerativa. Cursos, asesorías, hospedaje y comunidad.',
  applicationName: 'Arte y Tierra',
  authors: [{ name: 'Arte y Tierra' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Arte y Tierra',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/',
    languages:
      (process.env.ENABLE_LOCALES ?? '').length > 0
        ? {
            'es-AR': SITE_URL,
            ...Object.fromEntries(
              (process.env.ENABLE_LOCALES ?? '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((loc) => [loc, `${SITE_URL}/${loc}`]),
            ),
            'x-default': SITE_URL,
          }
        : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF8F3' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F1410' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const tag = LOCALE_NATIVE_TAGS[locale] ?? 'es-AR';
  return (
    <html lang={tag} className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <SiteProviders>{children}</SiteProviders>
        <JsonLd data={[ORG_JSONLD, WEBSITE_JSONLD]} />
        <Pixels />
        <ServiceWorkerRegister />
        <InstallPrompt />
        <OnlineIndicator />
        <WebVitals />
        <NewsletterPopup />
        <CommandK />
        <AttributionBeacon />
        <ConsentBanner />
      </body>
    </html>
  );
}
