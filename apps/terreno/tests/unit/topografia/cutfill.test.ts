/**
 * Tests del dominio "topografía" — cut & fill de represas.
 * Rango de elevación dentro del polígono, volumen embalsado a un nivel dado y
 * dimensionamiento de la sección trapezoidal del muro.
 */
import { describe, it, expect } from 'vitest';
import { rangoElevacionPoligono, calcularEmbalse, dimensionarMuro } from '@/lib/cutfill';
import { grillaDesdeFn, poligonoQueEnvuelve, BBOX_DEFECTO } from './_grilla';

// Pendiente uniforme: elevación = fila (0..10).
const g = grillaDesdeFn(11, 11, (r) => r, BBOX_DEFECTO);
const poly = poligonoQueEnvuelve(BBOX_DEFECTO);

describe('rangoElevacionPoligono', () => {
  it('devuelve min/max/celdas del terreno dentro del polígono', () => {
    const r = rangoElevacionPoligono(g, poly)!;
    expect(r).not.toBeNull();
    expect(r.min).toBe(0);
    expect(r.max).toBe(10);
    expect(r.celdas).toBe(121);
  });

  it('un polígono que no contiene celdas devuelve null', () => {
    const fuera = [
      { lat: 10, lng: 10 }, { lat: 10, lng: 10.001 },
      { lat: 10.001, lng: 10.001 }, { lat: 10.001, lng: 10 },
    ];
    expect(rangoElevacionPoligono(g, fuera)).toBeNull();
  });
});

describe('calcularEmbalse', () => {
  it('inunda las celdas por debajo del nivel de agua', () => {
    const r = calcularEmbalse(g, poly, 4)!;
    expect(r).not.toBeNull();
    expect(r.nivelAgua_m).toBe(4);
    expect(r.elev_min).toBe(0);
    expect(r.elev_max).toBe(10);
    expect(r.prof_max_m).toBeCloseTo(4, 1);   // nivel − fondo
    expect(r.volumen_m3).toBeGreaterThan(0);
    expect(r.area_inundada_m2).toBeGreaterThan(0);
    expect(r.prof_media_m).toBeGreaterThan(0);
    expect(r.prof_media_m).toBeLessThanOrEqual(r.prof_max_m);
  });

  it('sin nivel explícito usa el 60% del desnivel interno', () => {
    const r = calcularEmbalse(g, poly)!;
    expect(r.nivelAgua_m).toBeCloseTo(6, 1); // 0 + (10−0)·0.6
  });

  it('un nivel por debajo del fondo no embalsa nada → null', () => {
    expect(calcularEmbalse(g, poly, -5)).toBeNull();
  });
});

describe('dimensionarMuro', () => {
  it('sección trapezoidal con valores de referencia', () => {
    const m = dimensionarMuro({
      profMax_m: 3, revancha_m: 0.5, anchoCorona_m: 3,
      taludInterno: 3, taludExterno: 2, longitud_m: 50,
    });
    expect(m.alto_m).toBeCloseTo(3.5, 5);          // prof + revancha
    expect(m.anchoBase_m).toBeCloseTo(20.5, 1);    // 3 + 3.5·(3+2)
    expect(m.seccion_m2).toBeCloseTo(41.1, 1);     // (3+20.5)/2 · 3.5
    expect(m.volumenTierra_m3).toBe(2056);         // round(41.125 · 50)
    expect(m.anguloInterno_deg).toBe(18);          // atan2(1,3)
    expect(m.anguloExterno_deg).toBe(27);          // atan2(1,2)
  });

  it('alto mínimo de 0.1 m aunque profundidad y revancha sean 0', () => {
    const m = dimensionarMuro({
      profMax_m: 0, revancha_m: 0, anchoCorona_m: 2,
      taludInterno: 2, taludExterno: 2, longitud_m: 10,
    });
    expect(m.alto_m).toBeGreaterThanOrEqual(0.1);
  });
});
