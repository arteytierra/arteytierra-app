/**
 * Tests del dominio "aguas" — precipitación efectiva del balance de riego.
 * Método USDA-SCS simplificado (por tramos).
 */
import { describe, it, expect } from 'vitest';
import { precipEfectiva } from '@/lib/riego';

describe('precipEfectiva (USDA-SCS)', () => {
  it('lluvia nula o negativa da 0', () => {
    expect(precipEfectiva(0)).toBe(0);
    expect(precipEfectiva(-5)).toBe(0);
  });

  it('tramo bajo (≤250 mm): valores de referencia', () => {
    // p·(125 − 0.2p)/125
    expect(precipEfectiva(50)).toBeCloseTo(46, 1);   // 50·115/125 = 46
    expect(precipEfectiva(100)).toBeCloseTo(84, 1);  // 100·105/125 = 84
  });

  it('tramo alto (>250 mm): 125 + 0.1p', () => {
    expect(precipEfectiva(300)).toBeCloseTo(155, 1); // 125 + 30
  });

  it('nunca devuelve más que la lluvia caída', () => {
    for (const p of [10, 50, 100, 200, 300, 500]) {
      expect(precipEfectiva(p)).toBeLessThanOrEqual(p);
    }
  });
});
