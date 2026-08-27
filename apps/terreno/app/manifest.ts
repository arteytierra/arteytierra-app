import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'acequia · Diseño ecosistémico del territorio',
    short_name: 'acequia',
    description: 'Análisis catastral, clima, topografía y diseño de predios. Funciona offline.',
    start_url: '/mapa',
    display: 'standalone',
    background_color: '#FBF8F3',
    // Azul agua de la marca. El ícono es el cuadrado de fondo oscuro (#1A1210),
    // que es el que pide el paquete de marca para app icon.
    theme_color: '#2E6B8A',
    orientation: 'any',
    icons: [
      { src: '/marca/app-icon-512.png',  sizes: '512x512',   type: 'image/png', purpose: 'any' },
      { src: '/marca/app-icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      { src: '/marca/app-icon-512.png',  sizes: '512x512',   type: 'image/png', purpose: 'maskable' },
    ],
  };
}
