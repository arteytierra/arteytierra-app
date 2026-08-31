import type { NextConfig } from 'next';

/**
 * Id del build, que viaja al service worker (`/sw.js?v=…`) para versionar su
 * caché. Sin esto el SW reusaba un caché de nombre fijo y seguía sirviendo el
 * bundle viejo después de cada deploy.
 */
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? String(Date.now());

const config: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  reactStrictMode: false, // Leaflet no tolera el doble-mount de Strict Mode en dev
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
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
};

export default config;
