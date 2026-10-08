import type { NextConfig } from 'next';

/**
 * Id del build, que viaja al service worker (`/sw.js?v=…`) para versionar su
 * caché. Sin esto el SW reusaba un caché de nombre fijo y seguía sirviendo el
 * bundle viejo después de cada deploy.
 */
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? String(Date.now());

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const config: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  reactStrictMode: false, // Leaflet no tolera el doble-mount de Strict Mode en dev
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // El default de minimumCacheTTL son 60 segundos: una imagen que se mira
    // seguido se vuelve a transformar cada minuto, y cada transformacion se
    // cuenta contra el tope del plan. Las imagenes de esta app no cambian sin
    // un deploy, y un deploy invalida la cache igual, asi que 31 dias no
    // muestra nada viejo y baja el conteo a una transformacion por variante.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Cinco anchos en vez de los ocho del default. Cada ancho es una variante
    // mas por imagen y por formato; con dos formatos, ocho anchos son 16
    // transformaciones por imagen. Estos cinco cubren telefono, tablet,
    // notebook y pantalla grande, y el navegador elige el mas chico que sirva.
    deviceSizes: [480, 640, 828, 1200, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  transpilePackages: ['@arteytierra/config', '@arteytierra/types'],
  /**
   * El mapa Köppen de 1 km es un archivo de datos, no un import: el tracer de
   * Next no puede verlo siguiendo el código, así que hay que nombrarlo. Sin
   * esta línea la ruta funciona en local (lee del disco del repo) y en
   * producción devuelve siempre `sinDatos`, que es la peor forma de fallar
   * porque no rompe nada: simplemente se cae al Köppen calculado sin avisar.
   */
  outputFileTracingIncludes: {
    '/api/clima/koppen': ['./datos/koppen/*.tif'],
  },
  /**
   * La guía vivía en dos lados: la ruta `/guia` y un `public/guia.html`
   * estático que era el que estaba completo y el que se había quedado viejo.
   * Quedó una sola, en `/guia`. El archivo se borró, así que esta redirección
   * es lo único que sostiene los enlaces que ya se repartieron.
   */
  async redirects() {
    return [{ source: '/guia.html', destination: '/guia', permanent: true }];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
      {
        source: '/cuenta/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
      {
        source: '/bienvenida/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
      {
        source: '/mapa/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
    ];
  },
};

export default config;
