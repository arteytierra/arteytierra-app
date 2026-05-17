import type { Config } from 'tailwindcss';
import preset from '@arteytierra/config/tailwind';

const config: Config = {
  presets: [preset as Config],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/**/src/**/*.{ts,tsx}',
  ],
};

export default config;
