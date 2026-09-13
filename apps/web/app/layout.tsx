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
import { CommandK } from '@/components/search/CommandK';
import { AttributionBeacon } from '@/components/analytics/AttributionBeacon';
import { ConsentBanner } from '@/components/privacy/ConsentBanner';
import { ScriptArranque } from '@/components/site/ScriptArranque';

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
    images: [{ url: '/img/home/lo-que-hacemos/1.jpg', width: 1600, height: 894, alt: 'Arte y Tierra — diseño ecosistémico del territorio' }],
  },
  twitter: { card: 'summary_large_image', images: ['/img/home/lo-que-hacemos/1.jpg'] },
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

/**
 * El layout no lee `headers()` ni `cookies()` a propósito: cualquiera de las dos
 * marca la request como dinámica y arrastra a las 161 rutas del sitio con ella.
 * El idioma lo ajusta `ScriptArranque` a partir de la URL, antes de pintar.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <ScriptArranque />
        <SiteProviders>{children}</SiteProviders>
        <JsonLd data={[ORG_JSONLD, WEBSITE_JSONLD]} />
        <Pixels />
        <ServiceWorkerRegister />
        <InstallPrompt />
        <OnlineIndicator />
        <WebVitals />
        <CommandK />
        <AttributionBeacon />
        <ConsentBanner />
      </body>
    </html>
  );
}
