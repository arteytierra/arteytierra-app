import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/og'],
        disallow: [
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
      // Bots de IA: bloqueo selectivo (configurable según política editorial)
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'PerplexityBot', disallow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
