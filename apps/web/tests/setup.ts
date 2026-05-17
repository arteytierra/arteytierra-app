/**
 * Setup global para vitest.
 * Stub de `server-only` (Next.js lo enforza solo en build, en tests no aplica).
 */
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));
