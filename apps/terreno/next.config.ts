import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: false, // Leaflet no tolera el doble-mount de Strict Mode en dev
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['leaflet', 'react-leaflet', '@turf/turf', 'lucide-react'],
  },
  webpack: (config) => {
    // IDs determinísticas por hash de ruta — evita que módulos del framework
    // de Next.js queden fuera del RSC manifest al agregar nuevos archivos
    config.optimization = { ...config.optimization, moduleIds: 'deterministic' };
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  transpilePackages: ['@arteytierra/config', '@arteytierra/types'],
};

export default config;
