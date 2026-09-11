import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// El repo tenía `next lint` en el script pero ningún archivo de configuración:
// ESLint 9 sólo lee el formato flat, así que el comando caía en el asistente
// interactivo y terminaba en 1. En CI eso significa que el job `lint` venía
// fallando siempre — y que, de hecho, nunca se linteó nada.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  {
    ignores: [
      '.next/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.open-next/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  // `next/typescript` hace falta además de core-web-vitals: sin él, los
  // `eslint-disable @typescript-eslint/no-explicit-any` que ya hay repartidos
  // por lib/ fallan con "Definition for rule was not found".
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Todo esto queda en `warn` a propósito. La idea de este archivo es que el
      // job de CI vuelva a correr de verdad; ponerlo en `error` de entrada lo
      // dejaría rojo por ~200 hallazgos cosméticos y volveríamos al mismo lugar,
      // con el lint apagado de hecho. Endurecer es un paso aparte.
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
];
