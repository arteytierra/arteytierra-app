/**
 * Tests del dominio "economía" — estimador de carbono del suelo.
 * Conversión C→CO₂, stock por hectárea y captura anual según prácticas.
 */
import { describe, it, expect } from 'vitest';
import { C_A_CO2, stockSueloTha, calcularCarbono } from '@/lib/carbono';

describe('C_A_CO2', () => {
  it('es la relación de masas 44/12', () => {
    expect(C_A_CO2).toBeCloseTo(44 / 12, 10);
  });
});

describe('stockSueloTha', () => {
  it('SOC(t/ha) = SOC(g/kg) · densidad · prof / 10', () => {
    expect(stockSueloTha(20, 1.3, 30)).toBeCloseTo(78, 5); // 20·1.3·30/10
  });

  it('la profundidad por defecto es 30 cm', () => {
    expect(stockSueloTha(20, 1.3)).toBe(stockSueloTha(20, 1.3, 30));
  });
});

describe('calcularCarbono', () => {
  it('suma las tasas de las prácticas activas y las convierte a CO₂e', () => {
    const r = calcularCarbono(10, null, null, ['pastoreo', 'cobertura']); // 0.5 + 0.3
    // 10 ha · 0.8 tC/ha · (44/12)
    expect(r.captura_anual_tCO2e).toBeCloseTo(10 * 0.8 * (44 / 12), 5);
    expect(r.captura_10anios_tCO2e).toBeCloseTo(r.captura_anual_tCO2e * 10, 5);
    expect(r.practicas).toHaveLength(2);
    expect(r.autos_equiv_anio).toBeCloseTo(r.captura_anual_tCO2e / 4.6, 5);
  });

  it('sin datos de suelo el stock queda en null', () => {
    const r = calcularCarbono(10, null, 1.3, ['pastoreo']);
    expect(r.stock_suelo_tCO2e).toBeNull();
    expect(r.stock_suelo_tCO2e_ha).toBeNull();
  });

  it('con datos de suelo calcula el stock total y por hectárea', () => {
    const r = calcularCarbono(10, 20, 1.3, []);
    expect(r.stock_suelo_tCO2e_ha).toBeCloseTo(78 * (44 / 12), 3);
    expect(r.stock_suelo_tCO2e).toBeCloseTo(78 * (44 / 12) * 10, 2);
    expect(r.captura_anual_tCO2e).toBe(0); // sin prácticas
  });

  it('un id de práctica desconocido se ignora', () => {
    const r = calcularCarbono(10, null, null, ['inexistente']);
    expect(r.captura_anual_tCO2e).toBe(0);
    expect(r.practicas).toEqual([]);
  });
});
