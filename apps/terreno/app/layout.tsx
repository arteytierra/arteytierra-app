import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { RegistrarSW } from '@/components/RegistrarSW';

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

export const metadata: Metadata = {
  title: {
    default: 'acequia · Diseño ecosistémico del territorio',
    template: '%s · Arte y Tierra',
  },
  description:
    'acequia — diseño ecosistémico del territorio. Trazá tu predio, leé por dónde corre el agua y ordená el territorio: clima, relieve, hidrología y master plan. Un desarrollo de Arte y Tierra.',
  applicationName: 'acequia',
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}<RegistrarSW /></body>
    </html>
  );
}
