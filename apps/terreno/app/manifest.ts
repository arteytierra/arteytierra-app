import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'acequia · Diseño ecosistémico del territorio',
    short_name: 'acequia',
    description: 'Análisis catastral, clima, topografía y diseño de predios. Funciona offline.',
    start_url: '/mapa',
    display: 'standalone',
    background_color: '#FBF8F3',
    theme_color: '#3A5A40',
    orientation: 'any',
    icons: [
      { src: '/logo-ayt.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo-ayt.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo-ayt.png', sizes: 'any',     type: 'image/png', purpose: 'maskable' },
    ],
  };
}
