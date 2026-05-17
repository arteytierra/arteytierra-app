/**
 * Design System "Tierra Viva" — tokens base.
 * Importado por el preset Tailwind y por componentes que necesiten valores raw.
 */

export const colors = {
  ink: {
    950: '#0F1410',
    900: '#141A16',
    800: '#1C241E',
    700: '#2A352C',
  },
  moss: {
    900: '#26392B',
    700: '#3A5A40',
    500: '#588157',
    300: '#A3B18A',
    100: '#D9E2C9',
  },
  clay: {
    900: '#3F2614',
    700: '#7A4E2D',
    500: '#B08463',
    300: '#D4B59A',
    200: '#E6D3BE',
    100: '#F3E7D6',
  },
  bone: {
    50: '#FBF8F3',
    100: '#F2EDE3',
    200: '#E8E1D2',
  },
  sun:   { 500: '#D9A441', 300: '#E8C078' },
  water: { 500: '#2F6F7A', 300: '#7AAEB6' },
  danger:  { 500: '#B23A2F' },
  success: { 500: '#3A8A4F' },
} as const;

export const fontFamily = {
  display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
} as const;

export const fontSize = {
  xs:   ['0.75rem',  { lineHeight: '1rem' }],
  sm:   ['0.875rem', { lineHeight: '1.375rem' }],
  base: ['1rem',     { lineHeight: '1.65rem' }],
  lg:   ['1.125rem', { lineHeight: '1.75rem' }],
  xl:   ['1.25rem',  { lineHeight: '1.85rem' }],
  '2xl':['1.5rem',   { lineHeight: '2rem' }],
  '3xl':['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
  '4xl':['2.5rem',   { lineHeight: '2.75rem', letterSpacing: '-0.015em' }],
  '5xl':['3.5rem',   { lineHeight: '3.75rem', letterSpacing: '-0.02em' }],
  '6xl':['4.75rem',  { lineHeight: '5rem',    letterSpacing: '-0.025em' }],
  '7xl':['6rem',     { lineHeight: '6.25rem', letterSpacing: '-0.03em' }],
} as const;

export const radius = {
  none: '0',
  sm:  '2px',
  md:  '4px',
  lg:  '8px',
  xl:  '12px',
  '2xl':'20px',
  full:'9999px',
} as const;

export const shadow = {
  paper:  '0 1px 2px rgba(15,20,16,0.04), 0 2px 6px rgba(15,20,16,0.04)',
  raised: '0 4px 16px rgba(15,20,16,0.08), 0 1px 3px rgba(15,20,16,0.06)',
  float:  '0 12px 40px rgba(15,20,16,0.12)',
} as const;

export const spacing = {
  gutter:     '1.5rem',
  section:    '6rem',
  sectionLg:  '9rem',
} as const;

export const tokens = { colors, fontFamily, fontSize, radius, shadow, spacing } as const;
