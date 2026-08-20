/**
 * Tests del dominio "aguas" — balance hídrico anual de la represa.
 * Simulación de llenado/vaciado mes a mes y demanda mensual.
 */
import { describe, it, expect } from 'vitest';
import { simularRepresaAnual, demandaMensual, type ParamsRepresa } from '@/lib/represa';

function meses(precip_mm: number, etp_mm: number) {
  return Array.from({ length: 12 }, () => ({ precip_mm, etp_mm }));
}

const base: ParamsRepresa = {
  capacidad_m3: 1000,
  area_espejo_m2: 500,
  cuencaArea_m2: 100_000,
  coefEscorrentia: 0.2,
  meses: meses(50, 40),
  demanda_m3_mes: 100,
  infiltracion_mm_dia: 1,
};

describe('simularRepresaAnual', () => {
  it('devuelve null con capacidad no válida o meses ≠ 12', () => {
    expect(simularRepresaAnual({ ...base, capacidad_m3: 0 })).toBeNull();
    expect(simularRepresaAnual({ ...base, meses: meses(50, 40).slice(0, 11) })).toBeNull();
  });

  it('el volumen se mantiene dentro de [0, capacidad] en todos los meses', () => {
    const r = simularRepresaAnual(base)!;
    expect(r.meses).toHaveLength(12);
    for (const m of r.meses) {
      expect(m.volumen_m3).toBeGreaterThanOrEqual(0);
      expect(m.volumen_m3).toBeLessThanOrEqual(base.capacidad_m3);
    }
  });

  it('con demanda mínima y buen aporte, aguanta el año (confiabilidad 100%)', () => {
    const r = simularRepresaAnual({
      ...base, demanda_m3_mes: 10, meses: meses(120, 20), infiltracion_mm_dia: 0,
    })!;
    expect(r.aguanta).toBe(true);
    expect(r.meses_deficit).toBe(0);
    expect(r.confiabilidad_pct).toBe(100);
    expect(r.derrame_anual_m3).toBeGreaterThan(0); // rebalsa: llega llena
  });

  it('con demanda excesiva entra en déficit y no aguanta', () => {
    const r = simularRepresaAnual({
      ...base, demanda_m3_mes: 5000, meses: meses(10, 120),
    })!;
    expect(r.aguanta).toBe(false);
    expect(r.meses_deficit).toBeGreaterThan(0);
    expect(r.confiabilidad_pct).toBeLessThan(100);
    expect(r.volumen_min_m3).toBe(0);
  });

  it('la confiabilidad es coherente con los meses de déficit', () => {
    const r = simularRepresaAnual(base)!;
    expect(r.confiabilidad_pct).toBe(Math.round(((12 - r.meses_deficit) / 12) * 100));
  });
});

describe('demandaMensual', () => {
  it('suma bebida de hacienda (30 días) + riego', () => {
    // 100 cabezas × 50 L/día × 30 / 1000 = 150 m³ ; + 10 riego = 160
    expect(demandaMensual(100, 50, 10)).toBeCloseTo(160, 1);
  });

  it('sin hacienda ni riego es 0', () => {
    expect(demandaMensual(0, 50, 0)).toBe(0);
  });
});
