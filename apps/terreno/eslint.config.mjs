import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// Misma historia que en apps/web: el script `lint` existía desde el principio
// pero no había ningún archivo de configuración, y ESLint 9 sólo lee el formato
// flat. `next lint` caía en el asistente interactivo y salía 1, así que esta app
// nunca se linteó. El criterio es el mismo que el de apps/web para que las dos
// se comporten igual.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  {
    ignores: [
      '.next/**',
      '.vercel/**',
      '.wrangler/**',
      'out/**',
      'coverage/**',
      'next-env.d.ts',
      'leaflet-rotate.d.ts',
      'public/**',
    ],
  },
  // `next/typescript` hace falta además de core-web-vitals: sin él, los
  // `eslint-disable @typescript-eslint/no-explicit-any` repartidos por lib/
  // fallan con "Definition for rule was not found".
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // En `warn` a propósito. El objetivo de este archivo es que el lint vuelva
      // a correr de verdad; ponerlo en `error` de entrada lo dejaría rojo por
      // cientos de hallazgos cosméticos y terminaríamos apagándolo otra vez.
      // Endurecer es un paso aparte.
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
];
