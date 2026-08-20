import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Tests unitarios de terreno — Fase 0 de modularización.
 *
 * La lógica de dominio vive en `lib/` como funciones puras (68 de 69 archivos
 * no importan React): entra un dato, sale un dato. Esos son el blanco de estos
 * tests. Se agrupan por dominio en `tests/unit/<dominio>/` para poder correr
 * de a grupos cuando se hace mantenimiento en una sola área:
 *
 *   pnpm --filter @arteytierra/terreno test tests/unit/diseno
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**'],
      exclude: ['**/*.d.ts', '**/node_modules/**', 'lib/db/**', 'lib/auth/**'],
    },
  },
  resolve: {
    alias: {
      '@': here,
      '@arteytierra/config': path.resolve(here, '../../packages/config/src'),
      '@arteytierra/types': path.resolve(here, '../../packages/types/src'),
    },
  },
});
