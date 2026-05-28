import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

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

export const runtime = 'edge';

export const metadata: Metadata = {
  title: {
    default: 'Análisis de Terreno · Arte y Tierra',
    template: '%s · Arte y Tierra',
  },
  description:
    'Herramienta de análisis catastral para alumnos y clientes de Arte y Tierra. Trazá mojones, medí tu terreno y calculá superficie, perímetro y rumbos.',
  applicationName: 'Terreno — Arte y Tierra',
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
