import { describe, expect, it } from 'vitest';
import { calcularMetricas, centroide, type Mojon } from '@/lib/sitio/geometria';

// Cuadrado ~100 x 100 m cerca del ecuador (1 grado ≈ 111.32 km).
const LADO_M = 100;
const LADO_DEG = LADO_M / 111_320;
const CUADRADO: Mojon[] = [
  { numero: 1, lat: 0, lng: 0 },
  { numero: 2, lat: 0, lng: LADO_DEG },
  { numero: 3, lat: LADO_DEG, lng: LADO_DEG },
  { numero: 4, lat: LADO_DEG, lng: 0 },
];

describe('calcularMetricas', () => {
  it('devuelve null con menos de 3 mojones', () => {
    expect(calcularMetricas([{ numero: 1, lat: 0, lng: 0 }])).toBeNull();
  });

  it('calcula área y perímetro de un cuadrado geodésico ~100x100m', () => {
    const m = calcularMetricas(CUADRADO);
    expect(m).not.toBeNull();
    expect(m!.area_m2).toBeGreaterThan(9_000);
    expect(m!.area_m2).toBeLessThan(11_000);
    expect(m!.perimetro_m).toBeGreaterThan(390);
    expect(m!.perimetro_m).toBeLessThan(410);
    expect(m!.linderos).toHaveLength(4);
  });

  it('cada lindero conecta mojones consecutivos, cerrando el polígono', () => {
    const m = calcularMetricas(CUADRADO)!;
    expect(m.linderos.map(l => [l.desde, l.hasta])).toEqual([
      [1, 2], [2, 3], [3, 4], [4, 1],
    ]);
  });

  it('el azimut del lindero este (1→2) es ~90° (rumbo al este)', () => {
    const m = calcularMetricas(CUADRADO)!;
    const l = m.linderos[0]!;
    expect(l.azimut_deg).toBeGreaterThan(85);
    expect(l.azimut_deg).toBeLessThan(95);
    expect(l.rumbo).toContain('E');
  });

  it('el azimut del lindero norte (2→3) es ~0° (rumbo al norte)', () => {
    const m = calcularMetricas(CUADRADO)!;
    const l = m.linderos[1]!;
    expect(l.azimut_deg < 5 || l.azimut_deg > 355).toBe(true);
  });
});

describe('centroide', () => {
  it('devuelve null sin mojones', () => {
    expect(centroide([])).toBeNull();
  });

  it('promedia lat/lng de los mojones', () => {
    const c = centroide(CUADRADO)!;
    expect(c.lat).toBeCloseTo(LADO_DEG / 2, 6);
    expect(c.lng).toBeCloseTo(LADO_DEG / 2, 6);
  });
});
