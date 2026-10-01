import type { MetadataRoute } from 'next';
import { ACEQUIA_APP_URL, RUTAS_PRIVADAS } from '@/lib/sitio';

/**
 * `robots.txt` de acequia.
 *
 * Hasta el 01/10/2026 este archivo no existía, y la consecuencia no era que la
 * app estuviera cerrada a los buscadores: era que nadie les había dicho nada.
 * Sin `robots.txt` un crawler recorre lo que encuentra —incluidas las pantallas
 * de cuenta y los informes compartidos por token— y no sabe que existe la guía,
 * que desde el 30/09/2026 es pública, estática y la mejor página de entrada que
 * tiene el producto.
 *
 * La política es la misma que `apps/web/app/robots.ts`: se permite que los bots
 * de IA naveguen y citen (eso es tráfico), se bloquea el entrenamiento masivo
 * con el contenido.
 *
 * `/informe` se bloquea por una razón distinta de las otras. Esos informes son
 * públicos a propósito —el dueño del proyecto los comparte con un link— pero
 * son el predio de otra persona, con su ubicación y su superficie. Que sean
 * accesibles con el link no significa que deban quedar en el índice de Google.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: RUTAS_PRIVADAS,
      },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'ClaudeBot', allow: '/', disallow: RUTAS_PRIVADAS },
      { userAgent: 'PerplexityBot', allow: '/', disallow: RUTAS_PRIVADAS },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: RUTAS_PRIVADAS },
      { userAgent: 'anthropic-ai', allow: '/', disallow: RUTAS_PRIVADAS },
    ],
    sitemap: `${ACEQUIA_APP_URL}/sitemap.xml`,
    host: ACEQUIA_APP_URL,
  };
}
