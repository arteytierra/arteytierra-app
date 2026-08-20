/**
 * Tests del dominio "economía/producción" — sistemas productivos.
 * Balance hídrico productivo (FAO-56 simplificado), receptividad ganadera
 * (equivalentes vaca + Voisin) y riesgo de erosión (USLE simplificado).
 */
import { describe, it, expect } from 'vitest';
import {
  calcularBalanceProductivo,
  calcularReceptividad,
  nivelErosion,
  TIPOS_ANIMAL,
  CULTIVOS_KC,
} from '@/lib/produccion';
import type { MesDato } from '@/lib/clima';

function doceMeses(precip_mm: number, etp_mm: number): MesDato[] {
  return Array.from({ length: 12 }, (_, i) => ({
    mes: `M${i + 1}`, precip_mm, tmax_c: 25, tmin_c: 10, tmean_c: 17,
    etp_mm, balance_mm: precip_mm - etp_mm, viento_ms: 2,
  }));
}

describe('calcularBalanceProductivo', () => {
  const zapallo = CULTIVOS_KC.find(c => c.id === 'zapallo')!; // kc 1.00

  it('déficit = ETc − precip mes a mes; reservorio acumula el volumen', () => {
    const r = calcularBalanceProductivo(doceMeses(10, 100), zapallo, 5);
    // ETc = 100 · 1.00 = 100 ; déficit = 90 ; los 12 meses en déficit.
    expect(r.meses[0]!.etc_mm).toBeCloseTo(100, 1);
    expect(r.meses[0]!.deficit_mm).toBeCloseTo(90, 1);
    expect(r.meses_deficit).toBe(12);
    expect(r.meses_exceso).toBe(0);
    expect(r.deficit_anual_mm).toBeCloseTo(1080, 0);
    expect(r.reservorio_m3).toBeGreaterThan(0);
  });

  it('con lluvia de sobra no hay déficit', () => {
    const r = calcularBalanceProductivo(doceMeses(200, 100), zapallo, 5);
    expect(r.meses_deficit).toBe(0);
    expect(r.deficit_anual_mm).toBe(0);
    expect(r.meses_exceso).toBe(12);
  });
});

describe('calcularReceptividad', () => {
  const bovino = TIPOS_ANIMAL.find(t => t.id === 'bovino')!; // ev 1, agua 50 L/día

  it('carga y agua coherentes con la producción forrajera', () => {
    const r = calcularReceptividad(100, 800, bovino); // 800 mm → 5000 kg MS/ha
    expect(r.ef_kg_ha).toBe(5000);
    expect(r.carga_ev).toBeCloseTo(85.6, 1);
    expect(r.carga_animales).toBe(85);
    expect(r.agua_l_dia).toBe(85 * 50);
    expect(r.potreros_voisin).toBe(11);      // 30/3 + 1
    expect(r.area_potrero_ha).toBeCloseTo(9.09, 2);
  });

  it('más lluvia no reduce la receptividad', () => {
    const seco = calcularReceptividad(100, 250, bovino);
    const humedo = calcularReceptividad(100, 1000, bovino);
    expect(humedo.carga_ev).toBeGreaterThan(seco.carga_ev);
  });
});

describe('nivelErosion', () => {
  it('terreno llano → riesgo bajo', () => {
    const e = nivelErosion(0, 500);
    expect(e.nivel).toBe('bajo');
    expect(e.score).toBeGreaterThanOrEqual(0);
  });

  it('el score queda acotado a 0–100 y crece con la pendiente', () => {
    const suave = nivelErosion(5, 800);
    const fuerte = nivelErosion(45, 800);
    expect(fuerte.score).toBeGreaterThan(suave.score);
    expect(fuerte.score).toBeLessThanOrEqual(100);
    expect(['bajo', 'moderado', 'alto', 'muy_alto']).toContain(fuerte.nivel);
  });
});
