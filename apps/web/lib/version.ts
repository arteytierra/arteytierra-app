/**
 * Qué commit está sirviendo, resuelto en tiempo de ejecución.
 *
 * El problema que esto arregla: `next.config.ts` define
 * `NEXT_PUBLIC_APP_VERSION` a partir de `VERCEL_GIT_COMMIT_SHA`, y Next inlinea
 * ese valor en el bundle **durante el build**. Pero en `turbo.json` la variable
 * vive en `globalPassThroughEnv`, o sea fuera del hash de caché de turbo: un
 * commit que no toca `apps/web` reusa el build anterior, y entonces la
 * constante inlineada sigue siendo el SHA del build viejo. El 12/09/2026
 * `/api/health` decía `1f6c946` con `52027f6` deployado, que es justamente el
 * dato que el endpoint existe para dar.
 *
 * Vercel inyecta las variables de sistema **por deployment**, así que la que se
 * lee en runtime es la del deployment vivo aunque el bundle venga de caché. Por
 * eso `version` sale del entorno de ejecución y la constante de build queda
 * como respaldo — y de paso como señal: si las dos difieren, el build se reusó.
 *
 * Recibe `process.env` entera a propósito. Leer `process.env.LO_QUE_SEA` dentro
 * de este módulo invita a que el empaquetador lo reemplace por una constante en
 * build, que es exactamente el error que se está corrigiendo; pasando el objeto
 * la lectura queda dinámica.
 */

export interface InfoVersion {
  /** SHA corto del commit que está sirviendo. `dev` fuera de Vercel. */
  version: string;
  /** SHA corto con el que se compiló el bundle. Puede ser más viejo que `version`. */
  build: string;
  /**
   * El bundle se compiló con otro commit que el del deployment: turbo o Vercel
   * reusaron un build cacheado. No es un error —es lo normal cuando el commit
   * no toca esta app— pero explica por qué `build` se queda atrás.
   */
  buildReusado: boolean;
}

const LARGO_SHA_CORTO = 7;

function corto(sha: string | undefined): string {
  const limpio = (sha ?? '').trim();
  return limpio ? limpio.slice(0, LARGO_SHA_CORTO) : '';
}

export function resolverVersion(env: Record<string, string | undefined>): InfoVersion {
  // VERCEL_GIT_COMMIT_SHA: la pone Vercel en cada deployment, también en runtime.
  // NEXT_PUBLIC_APP_VERSION: la constante que quedó inlineada en el build.
  const enRuntime = corto(env['VERCEL_GIT_COMMIT_SHA']);
  const deBuild = corto(env['NEXT_PUBLIC_APP_VERSION']);

  const version = enRuntime || deBuild || 'dev';
  const build = deBuild || version;

  return {
    version,
    build,
    // Sin dato de runtime no hay con qué comparar: no se afirma que hubo caché.
    buildReusado: Boolean(enRuntime) && Boolean(deBuild) && enRuntime !== deBuild,
  };
}
