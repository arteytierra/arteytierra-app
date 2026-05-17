import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arte y Tierra · Educación regenerativa',
    short_name: 'Arte y Tierra',
    description:
      'Cursos, hospedaje, inmersiones y ebooks de bioarquitectura, agroecología y diseño hidrológico.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF8F3',
    theme_color: '#3A5A40',
    lang: 'es-AR',
    categories: ['education', 'lifestyle', 'shopping'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Share target: permite recibir contenido compartido desde otras apps
    // (e.g. "Compartir → Arte y Tierra" desde un PDF o un link).
    share_target: {
      action: '/buscar',
      method: 'GET',
      params: { title: 'q', text: 'q', url: 'q' },
    },
    // Capa de protocolo para deep-links `web+ayt://curso/<slug>`.
    protocol_handlers: [
      { protocol: 'web+ayt', url: '/?p=%s' },
    ],
    shortcuts: [
      {
        name: 'Mis cursos',
        short_name: 'Cursos',
        description: 'Continuar aprendizaje',
        url: '/mis-cursos',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Mis reservas',
        short_name: 'Reservas',
        url: '/mis-reservas',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Cursos abiertos',
        short_name: 'Catálogo',
        url: '/cursos',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
