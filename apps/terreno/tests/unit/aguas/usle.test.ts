/**
 * USLE aplicada (H4). Las fórmulas son de referencia publicada y traen sus
 * propias verificaciones internas:
 *   · la parcela unitaria (22.13 m al 9 %) tiene que dar LS = 1 exacto;
 *   · las dos ramas de Renard & Freimund tienen que empalmar en 850 mm.
 * Si alguna de esas dos falla, la fórmula está mal transcrita.
 */
import { describe, it, expect } from 'vitest';
import {
  erosividadR, erodabilidadK, factorLS, perdidaSuelo, lecturaPerdida,
  materiaOrganicaPct, TOLERANCIA_T_HA, LAMBDA_MAX_M,
} from '@/lib/usle';

describe('erosividadR', () => {
  it('las dos ramas empalman en 850 mm', () => {
    // No cierran al decimal —los coeficientes vienen redondeados de la
    // publicación— pero sí dentro del 1 %. Si alguno estuviera mal
    // transcrito, el salto sería de otro orden.
    const a = erosividadR(849.9), b = erosividadR(850.1);
    expect(Math.abs(a - b) / a).toBeLessThan(0.01);
  });

  it('más lluvia, más erosividad', () => {
    expect(erosividadR(1200)).toBeGreaterThan(erosividadR(800));
    expect(erosividadR(800)).toBeGreaterThan(erosividadR(400));
  });

  it('sin lluvia no hay erosividad', () => {
    expect(erosividadR(0)).toBe(0);
    expect(erosividadR(-5)).toBe(0);
  });

  it('cae en el orden de magnitud que se observa en clima templado', () => {
    const r = erosividadR(900);
    expect(r).toBeGreaterThan(1000);
    expect(r).toBeLessThan(8000);
  });
});

describe('erodabilidadK', () => {
  it('el limo es lo más erodable y la arena lo menos', () => {
    expect(erodabilidadK('Limoso')).toBeGreaterThan(erodabilidadK('Franco'));
    expect(erodabilidadK('Arenoso')).toBeLessThan(erodabilidadK('Franco'));
  });

  it('una textura desconocida cae en el franco, que es el término medio', () => {
    expect(erodabilidadK('Regolito marciano')).toBe(erodabilidadK('Franco'));
    expect(erodabilidadK(null)).toBe(erodabilidadK('Franco'));
  });

  it('más materia orgánica, menos erodable', () => {
    const base = erodabilidadK('Franco-limoso');
    expect(erodabilidadK('Franco-limoso', 4)).toBeLessThan(base);
    expect(erodabilidadK('Franco-limoso', 0.5)).toBeGreaterThan(base);
  });

  it('la corrección por materia orgánica está acotada: no extrapola', () => {
    const base = erodabilidadK('Franco');
    // Un suelo turboso no deja de erosionar: el piso corta en ×0.75.
    expect(erodabilidadK('Franco', 50)).toBeCloseTo(base * 0.75, 6);
    for (const mo of [0.01, 0.5, 2, 6, 20, 50]) {
      const f = erodabilidadK('Franco', mo) / base;
      expect(f).toBeGreaterThanOrEqual(0.75);
      expect(f).toBeLessThanOrEqual(1.3);
    }
  });

  it('materiaOrganicaPct convierte g/kg de carbono a % de MO', () => {
    expect(materiaOrganicaPct(20)).toBeCloseTo(3.448, 3);
  });
});

describe('factorLS', () => {
  it('la parcela unitaria de la USLE da LS = 1', () => {
    expect(factorLS(9, 22.13)).toBeCloseTo(1, 2);
  });

  it('más pendiente y más ladera, más LS', () => {
    expect(factorLS(20, 50)).toBeGreaterThan(factorLS(9, 50));
    expect(factorLS(9, 100)).toBeGreaterThan(factorLS(9, 50));
  });

  it('la longitud de ladera se recorta: arriba de ahí ya es otro proceso', () => {
    expect(factorLS(9, 5000)).toBeCloseTo(factorLS(9, LAMBDA_MAX_M), 6);
  });

  it('un llano no erosiona por laminar', () => {
    expect(factorLS(0, 100)).toBeLessThan(0.2);
  });
});

describe('perdidaSuelo', () => {
  const ENTRADA = {
    precipAnual_mm: 900,
    clase_textura: 'Franco-limoso',
    carbonoOrg_g_kg: 15,
    usle_c: 0.04,     // pastizal medio
  };

  it('devuelve banda, no número puntual: son cinco aproximaciones multiplicadas', () => {
    const p = perdidaSuelo(ENTRADA, 12, 80);
    expect(p.min_t_ha).toBeCloseTo(p.t_ha_anio / 2, 1);
    expect(p.max_t_ha).toBeCloseTo(p.t_ha_anio * 2, 1);
  });

  it('la misma ladera con el suelo desnudo pierde muchísimo más que bajo pastura', () => {
    const pastura = perdidaSuelo(ENTRADA, 12, 80);
    const desnudo = perdidaSuelo({ ...ENTRADA, usle_c: 1 }, 12, 80);
    expect(desnudo.t_ha_anio).toBeGreaterThan(pastura.t_ha_anio * 20);
  });

  it('compara contra la tolerancia del suelo', () => {
    const p = perdidaSuelo(ENTRADA, 12, 80);
    expect(p.veces_tolerancia).toBeCloseTo(p.t_ha_anio / TOLERANCIA_T_HA, 1);
  });

  it('sin cobertura viva la pérdida se dispara, y la lectura lo dice', () => {
    const p = perdidaSuelo({ ...ENTRADA, usle_c: 1 }, 25, 150);
    expect(p.veces_tolerancia).toBeGreaterThan(10);
    expect(lecturaPerdida(p)).toContain('crítico');
  });

  it('bajo monte cerrado en pendiente suave queda debajo de la tolerancia', () => {
    const p = perdidaSuelo({ ...ENTRADA, usle_c: 0.004 }, 4, 40);
    expect(p.veces_tolerancia).toBeLessThan(1);
    expect(lecturaPerdida(p)).toContain('tolerancia');
  });

  it('expone los factores para poder discutir el número', () => {
    const p = perdidaSuelo(ENTRADA, 12, 80);
    expect(p.R).toBeGreaterThan(0);
    expect(p.K).toBeGreaterThan(0);
    expect(p.LS).toBeGreaterThan(0);
    expect(p.C).toBe(0.04);
  });
});
