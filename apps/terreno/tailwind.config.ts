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
 *
 * El 23/09/2026 volvieron a aparecer 19 clases muertas: los ocho usos del
 * extremo claro de `water` —al que le habían completado el lado oscuro y no el
 * claro—, un `text-water-900` en el cartel de "recuperar acceso", que es el
 * único que se veía desde afuera, y nueve más en `sun`, `ink` y `clay`,
 * incluido un `hover:border-ink-400` que nunca prendía.
 *
 * Contarlas a mano es lo que falla: la primera medición se comió seis de las
 * diez de `water` porque el patrón matcheaba `water-50` adentro de
 * `water-500`. Ahora las cuenta `tests/unit/estetica/paleta.test.ts`, que
 * recorre los mismos archivos que `content` y falla con archivo y línea. Si
 * agregás un tono acá, ese test es el que dice si alguien lo estaba usando.
 */
const tonosFaltantes = {
  ink:   { 200: '#DFE1DF', 300: '#BBBFBB', 400: '#979C97' },
  moss:  { 50: '#DFE7D1', 200: '#BECAAA', 400: '#7E9971', 600: '#496E4C', 800: '#304A36' },
  clay:  { 50: '#F7EFE3', 400: '#C29D7F', 600: '#956948', 800: '#5D3A21' },
  bone:  { 300: '#D8CFBC', 400: '#C2B7A0' },
  sun:   { 50: '#FAF1E1', 100: '#F5E3C2', 200: '#EFD4A2', 400: '#E1B25D', 600: '#A07A32', 700: '#675023' },
  water: { 50: '#EDF4F5', 100: '#D3E4E7', 200: '#AFCED3', 400: '#558F98', 600: '#25545B', 700: '#1A393C', 800: '#112120' },
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
