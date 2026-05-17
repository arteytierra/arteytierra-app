import type { Config } from 'tailwindcss';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from './tokens';

const preset: Partial<Config> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors,
      fontFamily,
      // @ts-expect-error tailwind types aceptan tuplas con opts
      fontSize,
      borderRadius: radius,
      boxShadow: shadow,
      spacing: {
        gutter: spacing.gutter,
        section: spacing.section,
        'section-lg': spacing.sectionLg,
      },
      maxWidth: {
        prose: '68ch',
        editorial: '1280px',
        wide: '1440px',
      },
      transitionTimingFunction: {
        organic: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' },
        },
        // Skeleton shimmer (gradient barre de izq a der).
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Toast/Sheet slide-in desde la derecha.
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slide-in-right 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default preset;
