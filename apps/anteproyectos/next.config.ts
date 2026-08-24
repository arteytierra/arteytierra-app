import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@arteytierra/config', '@arteytierra/types'],
};

export default config;
