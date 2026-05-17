import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**', 'app/api/**'],
      exclude: ['**/*.d.ts', '**/node_modules/**', 'lib/db/**', 'lib/edu/**'],
    },
  },
  resolve: {
    alias: {
      '@': here,
      '@arteytierra/ui': path.resolve(here, '../../packages/ui/src'),
      '@arteytierra/config': path.resolve(here, '../../packages/config/src'),
      '@arteytierra/types': path.resolve(here, '../../packages/types/src'),
    },
  },
});
