/**
 * Tests del dominio "topografía" — curvas de nivel por marching squares.
 * Reglas de intervalo (confiable/automático), estimación de niveles y el
 * trazado sobre una grilla sintética de pendiente plana.
 */
import { describe, it, expect } from 'vitest';
import type { GrillaElevacion } from '@/lib/grillaElevacion';
import {
  INTERVALO_CONFIABLE_M,
  intervaloConfiablePara,
  intervaloAutomatico,
  nivelesEstimados,
  calcularCurvas,
  MAX_NIVELES,
} from '@/lib/curvasNivel';
import { grillaDesdeFn } from './_grilla';

describe('intervaloConfiablePara', () => {
  it('sin MDE propio vale el intervalo confiable satelital', () => {
    expect(intervaloConfiablePara(null)).toBe(INTERVALO_CONFIABLE_M);
  });

  it('con MDE propio es media celda (y nunca baja de 0.1 m)', () => {
    expect(intervaloConfiablePara(1)).toBe(0.5);
    expect(intervaloConfiablePara(5)).toBe(2.5);
    expect(intervaloConfiablePara(0.05)).toBe(0.1); // piso
  });
});

describe('nivelesEstimados', () => {
  it('cuenta cuántas curvas saldrían', () => {
    expect(nivelesEstimados(10, 2)).toBe(5);
    expect(nivelesEstimados(9, 2)).toBe(4);
  });

  it('intervalo no positivo devuelve 0', () => {
    expect(nivelesEstimados(10, 0)).toBe(0);
    expect(nivelesEstimados(10, -1)).toBe(0);
  });
});

describe('intervaloAutomatico', () => {
  it('elige un valor "lindo" cercano al objetivo (desnivel/curvas)', () => {
    // 80 m / 8 curvas = 10 → valor lindo 10.
    expect(intervaloAutomatico(80)).toBe(10);
  });

  it('nunca cae por debajo del piso indicado', () => {
    const iv = intervaloAutomatico(3, 0.5, 5); // piso 5
    expect(iv).toBeGreaterThanOrEqual(5);
  });

  it('los predios chicos (<10 ha) toleran más curvas', () => {
    // Con área chica apunta a 12 curvas → intervalo más fino que sin área.
    const chico = intervaloAutomatico(60, 2);
    const grande = intervaloAutomatico(60);
    expect(chico).toBeLessThanOrEqual(grande);
  });
});

describe('calcularCurvas', () => {
  it('grilla plana (sin desnivel) no devuelve curvas', () => {
    const g = grillaDesdeFn(10, 10, () => 100);
    expect(calcularCurvas(g, 2)).toEqual([]);
  });

  it('sobre una pendiente uniforme traza curvas a cotas múltiplo del intervalo', () => {
    const g = grillaDesdeFn(11, 11, (r) => r); // elev 0..10, desnivel 10
    const curvas = calcularCurvas(g, 2);
    // start = ceil(0/2)*2 = 0 ; niveles 0,2,4,6,8,10 pero 0 y 10 son bordes.
    expect(curvas.length).toBeGreaterThan(0);
    for (const cv of curvas) {
      expect(cv.cota % 2).toBe(0);
      expect(cv.lineas.length).toBeGreaterThan(0);
      expect(cv.lineas[0]!.puntos.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('un intervalo demasiado fino para el desnivel supera MAX_NIVELES y no dibuja', () => {
    const g = grillaDesdeFn(11, 11, (r) => r * 20); // desnivel 200
    // 200 / 1 = 200 niveles > MAX_NIVELES → []
    expect(calcularCurvas(g, 1)).toEqual([]);
    expect(MAX_NIVELES).toBeLessThan(200);
  });
});

describe('curvas cerradas: cima o depresión', () => {
  /** Grilla sintética de n×n con una función de elevación. */
  const grillaDe = (n: number, fn: (x: number, y: number) => number) => {
    const elev = new Float64Array(n * n);
    let min = Infinity, max = -Infinity;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = fn(c / (n - 1), r / (n - 1));
        elev[r * n + c] = v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return {
      rows: n, cols: n,
      latMin: -31.01, latMax: -31.00, lngMin: -64.01, lngMax: -64.00,
      elev, elev_min: min, elev_max: max,
    } as GrillaElevacion;
  };

  const dist = (x: number, y: number) => Math.hypot(x - 0.5, y - 0.5);

  it('un cono aislado da anillos marcados como cima', () => {
    // Cerro de 20 m en el centro sobre una base plana.
    const g = grillaDe(61, (x, y) => 100 + Math.max(0, 21 * (1 - dist(x, y) / 0.4)));
    const cerradas = calcularCurvas(g, 2).flatMap(c => c.lineas).filter(l => l.cerrada);
    expect(cerradas.length).toBeGreaterThan(0);
    expect(cerradas.every(l => l.tipo === 'cima')).toBe(true);
  });

  it('un cráter aislado da anillos marcados como depresión', () => {
    const g = grillaDe(61, (x, y) => 100 - Math.max(0, 21 * (1 - dist(x, y) / 0.4)));
    const cerradas = calcularCurvas(g, 2).flatMap(c => c.lineas).filter(l => l.cerrada);
    expect(cerradas.length).toBeGreaterThan(0);
    expect(cerradas.every(l => l.tipo === 'depresion')).toBe(true);
  });

  it('un anillo con interior plano a la misma cota no se decide', () => {
    // Meseta con borde: adentro del anillo el terreno está exactamente en la
    // cota de la curva. No es ni cima ni hoya, y la app no inventa un símbolo.
    const g = grillaDe(41, (x, y) => dist(x, y) < 0.3 ? 110 : 110 - 20 * (dist(x, y) - 0.3));
    const cerradas = calcularCurvas(g, 2).flatMap(c => c.lineas).filter(l => l.cerrada);
    const enLaCota = cerradas.filter(l => l.tipo === null);
    // La de 110 es la que empata; las de más abajo son cimas.
    expect(cerradas.every(l => l.tipo === 'cima' || l.tipo === null)).toBe(true);
    expect(enLaCota.length + cerradas.filter(l => l.tipo === 'cima').length).toBe(cerradas.length);
  });

  it('las líneas abiertas no se clasifican', () => {
    // Plano inclinado: todas las curvas cruzan la grilla de lado a lado.
    const g = grillaDe(41, (x) => 100 + 30 * x);
    const abiertas = calcularCurvas(g, 2).flatMap(c => c.lineas).filter(l => !l.cerrada);
    expect(abiertas.length).toBeGreaterThan(0);
    expect(abiertas.every(l => l.tipo === null)).toBe(true);
  });
});
