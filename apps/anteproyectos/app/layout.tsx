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

export const metadata: Metadata = {
  title: {
    default: 'Anteproyectos · Arte y Tierra',
    template: '%s · Arte y Tierra',
  },
  description:
    'Generador de anteproyectos bioclimáticos: a partir del Cuaderno de Diseño Participativo y el programa de necesidades, produce 3 anteproyectos con perfiles de diseño diferenciados.',
  applicationName: 'Anteproyectos — Arte y Tierra',
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
