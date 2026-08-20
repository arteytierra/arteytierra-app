/**
 * Tests del dominio "topografía" — utilidades de la grilla densa de elevación.
 * Remuestreo, lectura por nodo más cercano, grilla desde el shader y coherencia
 * de las tablas de atribución de fuentes de relieve.
 */
import { describe, it, expect } from 'vitest';
import {
  remuestrearGrilla,
  elevEnGrilla,
  grillaDesdeShader,
  ETIQUETA_RELIEVE,
  CREDITO_RELIEVE,
} from '@/lib/grillaElevacion';
import { grillaDesdeFn, BBOX_DEFECTO } from './_grilla';

describe('remuestrearGrilla', () => {
  it('una grilla más chica que maxLado se devuelve intacta', () => {
    const g = grillaDesdeFn(10, 10, (r) => r);
    expect(remuestrearGrilla(g, 50)).toBe(g); // misma referencia
  });

  it('baja una grilla grande por debajo de maxLado por lado', () => {
    const g = grillaDesdeFn(100, 100, (r, c) => r + c);
    const rm = remuestrearGrilla(g, 40);
    expect(rm.rows).toBeLessThanOrEqual(40);
    expect(rm.cols).toBeLessThanOrEqual(40);
    expect(rm).not.toBe(g);
    // Conserva el encuadre geográfico.
    expect(rm.latMin).toBe(g.latMin);
    expect(rm.lngMax).toBe(g.lngMax);
    // Los extremos de elevación siguen dentro del rango original.
    expect(rm.elev_min).toBeGreaterThanOrEqual(g.elev_min);
    expect(rm.elev_max).toBeLessThanOrEqual(g.elev_max);
  });
});

describe('elevEnGrilla', () => {
  const g = grillaDesdeFn(11, 11, (r) => r, BBOX_DEFECTO); // elev = fila (0..10)

  it('lee el nodo más cercano', () => {
    // Esquina latMin (fila 0) → elevación 0.
    expect(elevEnGrilla(g, BBOX_DEFECTO.latMin, BBOX_DEFECTO.lngMin)).toBe(0);
    // Esquina latMax (última fila) → elevación 10.
    expect(elevEnGrilla(g, BBOX_DEFECTO.latMax, BBOX_DEFECTO.lngMax)).toBe(10);
  });

  it('un punto fuera del bbox devuelve NaN', () => {
    expect(elevEnGrilla(g, BBOX_DEFECTO.latMin - 1, BBOX_DEFECTO.lngMin)).toBeNaN();
    expect(elevEnGrilla(g, BBOX_DEFECTO.latMin, BBOX_DEFECTO.lngMax + 1)).toBeNaN();
  });
});

describe('grillaDesdeShader', () => {
  it('reconstruye una grilla a partir de las celdas del shader', () => {
    const celdas = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        celdas.push({
          row, col,
          latMin: -30.01 + row * 0.001, latMax: -30.01 + row * 0.001 + 0.001,
          lngMin: -64.01 + col * 0.001, lngMax: -64.01 + col * 0.001 + 0.001,
          elevation: row * 10 + col,
        });
      }
    }
    const g = grillaDesdeShader({ celdas, elev_min: 0, elev_max: 22 })!;
    expect(g).not.toBeNull();
    expect(g.rows).toBe(3);
    expect(g.cols).toBe(3);
    expect(g.elev[0 * 3 + 0]).toBe(0);
    expect(g.elev[2 * 3 + 2]).toBe(22);
  });

  it('menos de 2×2 celdas devuelve null', () => {
    const una = [{ row: 0, col: 0, latMin: -30, latMax: -29.999, lngMin: -64, lngMax: -63.999, elevation: 5 }];
    expect(grillaDesdeShader({ celdas: una, elev_min: 5, elev_max: 5 })).toBeNull();
    expect(grillaDesdeShader({ celdas: [], elev_min: 0, elev_max: 0 })).toBeNull();
  });
});

describe('tablas de atribución de relieve', () => {
  it('ETIQUETA y CREDITO cubren exactamente las mismas fuentes', () => {
    expect(Object.keys(ETIQUETA_RELIEVE).sort()).toEqual(Object.keys(CREDITO_RELIEVE).sort());
  });

  it('ninguna etiqueta ni crédito queda vacío', () => {
    for (const v of Object.values(ETIQUETA_RELIEVE)) expect(v.length).toBeGreaterThan(0);
    for (const v of Object.values(CREDITO_RELIEVE)) expect(v.length).toBeGreaterThan(0);
  });
});
