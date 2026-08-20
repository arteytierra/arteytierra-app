/**
 * Tests del dominio "clima" — clasificaciones y transformaciones puras derivadas
 * de las medias mensuales (no tocan la API de NASA POWER).
 * Aridez (UNEP), Köppen-Geiger, calibración de precipitación, centroide y URL.
 */
import { describe, it, expect } from 'vitest';
import {
  clasificarAridez,
  clasificarKoppen,
  aplicarCalibracionPrecip,
  centroide,
  weatherSparkURL,
  type MesDato,
  type DatosClima,
} from '@/lib/clima';

/** 12 meses uniformes con la temperatura y lluvia indicadas. */
function doceMeses(tmean_c: number, precip_mm: number, etp_mm = 0): MesDato[] {
  return Array.from({ length: 12 }, (_, i) => ({
    mes: `M${i + 1}`,
    precip_mm,
    tmax_c: tmean_c + 6,
    tmin_c: tmean_c - 6,
    tmean_c,
    etp_mm,
    balance_mm: precip_mm - etp_mm,
    viento_ms: 2,
  }));
}

describe('clasificarAridez', () => {
  it('P/ETP ubica la clase UNEP', () => {
    expect(clasificarAridez(200, 1000).clase).toBe('Semiárido'); // 0.2
    expect(clasificarAridez(800, 1000).clase).toBe('Subhúmedo'); // 0.8
    expect(clasificarAridez(1500, 1000).clase).toBe('Húmedo');   // 1.5
  });

  it('ETP nula da valor 0 (hiperárido) sin romper', () => {
    const a = clasificarAridez(500, 0);
    expect(a.valor).toBe(0);
    expect(a.clase).toBe('Hiperárido');
  });
});

describe('clasificarKoppen', () => {
  it('cálido y muy seco → desierto cálido BWh', () => {
    const k = clasificarKoppen(-30, doceMeses(25, 5)); // 60 mm/año
    expect(k.codigo).toBe('BWh');
    expect(k.grupo).toBe('Árido');
  });

  it('cálido todo el año y lluvioso → selva tropical Af', () => {
    const k = clasificarKoppen(-5, doceMeses(26, 200)); // 2400 mm/año, Tcold≥18
    expect(k.codigo).toBe('Af');
    expect(k.grupo).toBe('Tropical');
  });
});

describe('aplicarCalibracionPrecip', () => {
  const base = {
    lat: -31, lng: -64,
    precip_anual_mm: 600,
    etp_anual_mm: 480,
    meses: doceMeses(18, 50, 40), // 600 mm/año, etp 40/mes
    fuente: 'NASA POWER',
  } as DatosClima;

  it('sin calibración devuelve el mismo objeto', () => {
    expect(aplicarCalibracionPrecip(base, null)).toBe(base);
  });

  it('modo anual reescala la curva al total conocido', () => {
    const r = aplicarCalibracionPrecip(base, { modo: 'anual', anual_mm: 1200, origen: 'manual' });
    expect(r.precip_anual_mm).toBeCloseTo(1200, 0);
    expect(r.meses[0]!.precip_mm).toBeCloseTo(100, 1); // 50 × 2
    expect(r.meses[0]!.balance_mm).toBeCloseTo(60, 1); // 100 − 40
    expect(r.calibracion?.origen).toBe('manual');
  });

  it('modo mensual fija los 12 valores tal cual', () => {
    const mensual = Array.from({ length: 12 }, (_, i) => (i + 1) * 10); // 10..120
    const r = aplicarCalibracionPrecip(base, { modo: 'mensual', mensual_mm: mensual });
    expect(r.meses.map(m => m.precip_mm)).toEqual(mensual);
    expect(r.precip_anual_mm).toBe(mensual.reduce((s, v) => s + v, 0));
  });
});

describe('centroide', () => {
  it('promedia lat/lng', () => {
    const c = centroide([{ lat: 0, lng: 0 }, { lat: 10, lng: 20 }]);
    expect(c.lat).toBe(5);
    expect(c.lng).toBe(10);
  });

  it('lista vacía cae a un centro por defecto (Córdoba)', () => {
    const c = centroide([]);
    expect(c.lat).toBeCloseTo(-30.8, 1);
    expect(c.lng).toBeCloseTo(-64.7, 1);
  });
});

describe('weatherSparkURL', () => {
  it('incrusta las coordenadas', () => {
    const u = weatherSparkURL(-31.42, -64.18);
    expect(u).toContain('-31.42');
    expect(u).toContain('-64.18');
  });
});
