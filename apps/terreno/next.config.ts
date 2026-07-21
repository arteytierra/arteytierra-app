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
};

export default config;
