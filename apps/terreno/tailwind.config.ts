import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require('@arteytierra/config/tailwind');

/*
 * La paleta compartida sólo define los tonos ancla, pero la app referenciaba 19
 * clases inexistentes (`moss-800`, `sun-400`, `bone-300`, `water-600`…) que
 * Tailwind descarta en silencio: hovers, acentos y bordes que nunca se pintaban.
 *
 * Los tonos faltantes se interpolaron entre los ancla y viven acá, y no en
 * `packages/config`, porque ese preset también lo usa `apps/web`: completar la
 * paleta compartida haría aparecer de golpe 18 tonos nuevos en 36 archivos del
 * sitio público, sin que nadie haya revisado cómo queda.
 */
const tonosFaltantes = {
  ink:   { 200: '#DFE1DF' },
  moss:  { 50: '#DFE7D1', 200: '#BECAAA', 400: '#7E9971', 600: '#496E4C', 800: '#304A36' },
  clay:  { 50: '#F7EFE3', 400: '#C29D7F', 600: '#956948' },
  bone:  { 300: '#D8CFBC', 400: '#C2B7A0' },
  sun:   { 50: '#FAF1E1', 200: '#EFD4A2', 400: '#E1B25D', 600: '#A07A32' },
  water: { 400: '#558F98', 600: '#25545B', 700: '#1A393C', 800: '#112120' },
};

const config: Config = {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: tonosFaltantes,
    },
  },
};

export default config;
