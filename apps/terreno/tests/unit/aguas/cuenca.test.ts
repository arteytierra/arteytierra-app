/**
 * Tests del dominio "aguas" — hidrología de cuenca.
 * Fórmulas clásicas con valores de referencia conocidos: SCS-CN (escurrimiento),
 * Kirpich (tiempo de concentración) y el coef. de escorrentía anual del embalse.
 */
import { describe, it, expect } from 'vitest';
import {
  escurrimientoSCS,
  tcKirpich,
  coefEscorrentiaAnual,
  analizarCuenca,
  type Cuenca,
} from '@/lib/cuenca';

describe('escurrimientoSCS (método SCS-CN)', () => {
  it('CN fuera de rango (0 o 100) devuelve toda la precipitación', () => {
    expect(escurrimientoSCS(50, 100)).toBe(50);
    expect(escurrimientoSCS(50, 0)).toBe(50);
  });

  it('valor de referencia: P=100 mm, CN=80 → ~50.5 mm', () => {
    // S = 25400/80 − 254 = 63.5 ; Ia = 12.7 ; Q = (100−Ia)²/(100−Ia+S)
    expect(escurrimientoSCS(100, 80)).toBeCloseTo(50.54, 1);
  });

  it('si la lluvia no supera la abstracción inicial, no hay escurrimiento', () => {
    // CN=80 → Ia = 12.7 mm ; una lluvia de 10 mm no escurre
    expect(escurrimientoSCS(10, 80)).toBe(0);
  });

  it('el escurrimiento nunca supera la precipitación', () => {
    for (const cn of [40, 60, 80, 95]) {
      const q = escurrimientoSCS(100, cn);
      expect(q).toBeGreaterThanOrEqual(0);
      expect(q).toBeLessThanOrEqual(100);
    }
  });

  it('a mayor CN, mayor escurrimiento (para la misma lluvia)', () => {
    expect(escurrimientoSCS(80, 90)).toBeGreaterThan(escurrimientoSCS(80, 70));
  });
});

describe('tcKirpich (tiempo de concentración)', () => {
  it('entradas no positivas devuelven 0', () => {
    expect(tcKirpich(0, 0.05)).toBe(0);
    expect(tcKirpich(1000, 0)).toBe(0);
  });

  it('valor de referencia: L=1000 m, S=0.05 → ~12.6 min', () => {
    expect(tcKirpich(1000, 0.05)).toBeCloseTo(12.6, 1);
  });

  it('recorrido más largo → mayor tc; pendiente más empinada → menor tc', () => {
    expect(tcKirpich(2000, 0.05)).toBeGreaterThan(tcKirpich(1000, 0.05));
    expect(tcKirpich(1000, 0.10)).toBeLessThan(tcKirpich(1000, 0.05));
  });
});

describe('coefEscorrentiaAnual', () => {
  it('modula la base del grupo por la cobertura y redondea a 2 decimales', () => {
    // A (0.08) × monte_bueno (0.6) = 0.048 → 0.05
    expect(coefEscorrentiaAnual('A', 'monte_bueno')).toBeCloseTo(0.05, 2);
    // B (0.13) × pastura_regular (1.0) = 0.13
    expect(coefEscorrentiaAnual('B', 'pastura_regular')).toBeCloseTo(0.13, 2);
  });

  it('clampa el máximo a 0.6 (D × urbano se pasaría de largo)', () => {
    expect(coefEscorrentiaAnual('D', 'urbano')).toBe(0.6);
  });

  it('cobertura desconocida usa factor 1 (sólo la base del grupo)', () => {
    expect(coefEscorrentiaAnual('B', 'no_existe')).toBeCloseTo(0.13, 2);
  });

  it('siempre queda dentro de [0.03, 0.6]', () => {
    for (const g of ['A', 'B', 'C', 'D'] as const)
      for (const cob of ['monte_bueno', 'pastura_regular', 'barbecho', 'urbano', 'x']) {
        const c = coefEscorrentiaAnual(g, cob);
        expect(c).toBeGreaterThanOrEqual(0.03);
        expect(c).toBeLessThanOrEqual(0.6);
      }
  });
});

describe('analizarCuenca (integración)', () => {
  const cuenca: Cuenca = {
    celdas: [], poligono: [],
    area_m2: 100_000, area_ha: 10, area_km2: 0.1,
    long_flujo_m: 1000, pendiente_m_m: 0.05,
    elev_salida: 100, elev_max: 150, outlet: { lat: -34, lng: -58 },
  };

  it('encadena escurrimiento → volumen → caudal pico → vertedero de forma coherente', () => {
    const r = analizarCuenca(cuenca, 80, 100);
    // volumen = (Q/1000) · área ; con Q≈50.5 mm y 100.000 m² → ~5050 m³
    expect(r.volumen_m3).toBeGreaterThan(4500);
    expect(r.volumen_m3).toBeLessThan(5600);
    expect(r.tc_min).toBeCloseTo(12.6, 0);
    expect(r.caudal_pico_m3s).toBeGreaterThan(0);
    expect(r.vertedero_m).toBeGreaterThan(0);
    expect(r.head_vertedero_m).toBe(0.3);
  });

  it('más lluvia produce más volumen y más caudal pico', () => {
    const seca = analizarCuenca(cuenca, 80, 60);
    const humeda = analizarCuenca(cuenca, 80, 140);
    expect(humeda.volumen_m3).toBeGreaterThan(seca.volumen_m3);
    expect(humeda.caudal_pico_m3s).toBeGreaterThan(seca.caudal_pico_m3s);
  });
});
