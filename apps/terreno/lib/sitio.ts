/**
 * Dónde vive acequia, en un solo lugar.
 *
 * Existe por una trampa concreta: `NEXT_PUBLIC_SITE_URL` NO sirve para esto.
 * En este proyecto esa variable es el origen propio para CORS (ver
 * `lib/http.ts`) y en desarrollo vale `http://localhost:3001`. Un `robots.txt`
 * o un `sitemap.xml` armados con ella publicarían direcciones de localhost en
 * cuanto alguien corra un build fuera de Vercel — y un sitemap equivocado no
 * se nota: Google lo acepta, lo intenta y descarta el sitio en silencio.
 *
 * Así que la dirección canónica sale de `NEXT_PUBLIC_ACEQUIA_APP_HOST`, que ya
 * está cargada en el proyecto de Vercel (la usa la marca de agua del informe),
 * con `app.acequia.app` como valor por defecto. Mismo contrato que
 * `apps/web/lib/terreno/app-url.ts` del otro lado.
 *
 * Se limpia el valor por la razón de siempre: Vercel inyecta a veces un BOM o
 * comillas en las env vars, y un host con un carácter invisible adentro produce
 * una URL que parece bien escrita y no resuelve.
 */

function limpiarEnv(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

export const ACEQUIA_APP_HOST =
  limpiarEnv(process.env.NEXT_PUBLIC_ACEQUIA_APP_HOST) || 'app.acequia.app';

export const ACEQUIA_APP_URL = `https://${ACEQUIA_APP_HOST}`;

/**
 * Las rutas públicas de acequia: las que un buscador puede leer y las únicas
 * que entran al sitemap.
 *
 * La app es una aplicación detrás de login, así que esta lista es corta a
 * propósito y cada entrada está acá porque alguien la puede necesitar ANTES de
 * tener cuenta. `/` no está: redirige a `/login` o a `/mapa` según la sesión, y
 * una redirección no es una página que se indexe.
 *
 * `RUTAS_PRIVADAS` es el complemento, y es lo que `robots.ts` bloquea. Las dos
 * listas juntas tienen que cubrir todas las rutas de `app/`: hay un test que lo
 * verifica recorriendo el directorio, para que una ruta nueva no quede sin
 * decisión. Agregar una pantalla y olvidarse de esto es exactamente cómo se
 * filtra una pantalla de cuenta a un buscador.
 */
export const RUTAS_PUBLICAS = [
  { path: '/guia',       prioridad: 0.9, frecuencia: 'monthly' as const },
  { path: '/registro',   prioridad: 0.6, frecuencia: 'monthly' as const },
  { path: '/terminos',   prioridad: 0.3, frecuencia: 'yearly'  as const },
  { path: '/privacidad', prioridad: 0.3, frecuencia: 'yearly'  as const },
];

/** Lo que no se indexa: la aplicación, la cuenta, el cobro y los informes. */
export const RUTAS_PRIVADAS = [
  '/api',
  '/auth',
  '/bienvenida',
  '/canjear',
  '/cuenta',
  '/informe',
  '/login',
  '/mapa',
  '/suscribir',
];
