import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: false, // Leaflet no tolera el doble-mount de Strict Mode en dev (mismo ajuste que apps/terreno)
  poweredByHeader: false,
  transpilePackages: ['@arteytierra/config', '@arteytierra/types'],
};

export default config;
