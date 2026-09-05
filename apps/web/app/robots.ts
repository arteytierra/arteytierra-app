import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/og'],
        disallow: [
          '/acequia',
          '/terreno',
          '/admin',
          '/api',
          '/auth',
          '/checkout',
          '/carrito',
          '/orden/',
          '/mi-cuenta',
          '/mis-pedidos',
          '/mis-cursos',
          '/mis-reservas',
          '/mis-descargas',
          '/mis-becas',
          '/instructor',
          '/partners/dashboard',
          '/certificados',
          '/verificar/',
          '/preferencias/',
          '/*?utm_*',
          '/*?fbclid=*',
          '/*?ref=*',
          '/*?partner=*',
        ],
      },
      // Bots de IA: se permite la navegación/citación (AEO), se bloquea el
      // entrenamiento masivo de modelos con el contenido del sitio.
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
