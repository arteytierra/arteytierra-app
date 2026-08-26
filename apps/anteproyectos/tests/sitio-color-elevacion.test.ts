import { describe, expect, it } from 'vitest';
import { colorElevacionRGB } from '@/lib/sitio/colorElevacion';

describe('colorElevacionRGB', () => {
  it('devuelve el extremo bajo de la rampa (azul) en el mínimo', () => {
    expect(colorElevacionRGB(0, 0, 100)).toEqual([21, 101, 192]);
  });

  it('devuelve el extremo alto de la rampa (casi blanco) en el máximo', () => {
    expect(colorElevacionRGB(100, 0, 100)).toEqual([236, 239, 241]);
  });

  it('no se rompe cuando min === max (grilla plana)', () => {
    expect(colorElevacionRGB(50, 50, 50)).toEqual([21, 101, 192]);
  });

  it('interpola linealmente entre dos paradas de la rampa', () => {
    const [r, g, b] = colorElevacionRGB(50, 0, 100);
    // t=0.5 cae exactamente en la parada amarilla (255,238,88) de RAMP_ELEV.
    expect([r, g, b]).toEqual([255, 238, 88]);
  });
});
