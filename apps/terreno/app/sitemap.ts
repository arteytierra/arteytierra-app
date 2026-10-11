import type { MetadataRoute } from 'next';
import { ACEQUIA_APP_URL, RUTAS_PUBLICAS } from '@/lib/sitio';

/**
 * `sitemap.xml` de acequia.
 *
 * Son cuatro direcciones y no hay nada dinámico que agregar: la app vive detrás
 * de login y los proyectos son de cada usuario. La lista sale de
 * `RUTAS_PUBLICAS` en `lib/sitio.ts`, que es la misma que `robots.ts` usa para
 * decidir el complemento, así que no puede haber una ruta que el sitemap
 * anuncie y robots bloquee.
 *
 * `lastModified` es la fecha del build y no la de cada página. Es honesto: un
 * deploy es cuando el contenido pudo cambiar, porque la guía se compila con la
 * app. Poner `new Date()` en cada request no serviría: `revalidate` lo congela
 * igual, y una fecha que se mueve sola todos los días le enseña al crawler a
 * no creerle.
 */
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return RUTAS_PUBLICAS.map(r => ({
    url: `${ACEQUIA_APP_URL}${r.path}`,
    lastModified: ahora,
    changeFrequency: r.frecuencia,
    priority: r.prioridad,
  }));
}
