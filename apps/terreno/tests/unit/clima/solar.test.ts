/**
 * Tests del dominio "clima" — análisis solar (astronómico, sólo desde latitud).
 * Horas de luz, orientación/ángulo óptimo de panel y estacionalidad por hemisferio.
 */
import { describe, it, expect } from 'vitest';
import { calcularSolar } from '@/lib/solar';

describe('calcularSolar', () => {
  it('en el ecuador hay ~12 h de luz todos los meses', () => {
    const s = calcularSolar(0, 0);
    for (const m of s.meses) expect(m.horas_luz).toBeCloseTo(12, 1);
    expect(s.meses).toHaveLength(12);
  });

  it('en el hemisferio sur los paneles apuntan al Norte', () => {
    const s = calcularSolar(-31.4, -64.2);
    expect(s.orientacion_optima).toBe('Norte');
    expect(s.angulo_optimo_panel).toBe(43); // round(|−31.4| + 12)
  });

  it('en el hemisferio norte apuntan al Sur', () => {
    expect(calcularSolar(40, -3).orientacion_optima).toBe('Sur');
  });

  it('en el sur, diciembre (verano) tiene más luz que junio (invierno)', () => {
    const s = calcularSolar(-31.4, -64.2);
    expect(s.meses[11]!.horas_luz).toBeGreaterThan(s.meses[5]!.horas_luz);
    expect(s.horas_luz_max).toBeGreaterThan(s.horas_luz_min);
  });

  it('los índices de meses extremos de radiación son válidos', () => {
    const s = calcularSolar(-31.4, -64.2);
    expect(s.mes_max_radiacion).toBeGreaterThanOrEqual(0);
    expect(s.mes_max_radiacion).toBeLessThan(12);
    expect(s.mes_min_radiacion).not.toBe(s.mes_max_radiacion);
    // La elevación solar al mediodía nunca es negativa.
    for (const m of s.meses) expect(m.elev_solar_noon).toBeGreaterThanOrEqual(0);
  });
});
