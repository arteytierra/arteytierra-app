/**
 * Tests del dominio "economía/producción" — sistemas productivos.
 * Balance hídrico productivo (FAO-56 simplificado), receptividad ganadera
 * (equivalentes vaca + Voisin) y riesgo de erosión (USLE simplificado).
 */
import { describe, it, expect } from 'vitest';
import {
  calcularBalanceProductivo,
  calcularReceptividad,
  consumoEV_kgMS_dia,
  nivelErosion,
  EM_FORRAJE,
  EV_MCAL_EM_DIA,
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

/**
 * El equivalente vaca, contra la fuente.
 *
 * Auditoría del 01/10/2026. Hasta acá el módulo tenía `consumo_ev_año = 8 * 365`
 * sin respaldo, y este archivo tenía un test que esperaba `carga_ev ≈ 85,6`: o
 * sea que fijaba el error en lugar de encontrarlo. Un test que sólo comprueba
 * que la función sigue devolviendo lo mismo que ayer no protege de nada.
 *
 * Ahora el requerimiento sale de la energía —18,54 Mcal EM/día, Cocimano, Lange
 * y Menvielle (1975), AACREA— y los kilos salen de dividir por la densidad
 * energética del forraje.
 */
describe('el equivalente vaca sale de la energía, no de una constante', () => {
  it('el requerimiento del EV es el publicado', () => {
    expect(EV_MCAL_EM_DIA).toBe(18.54);
  });

  it('reproduce los 3.650 kg MS/año que cita la bibliografía', () => {
    // La cifra más difundida para 1 EV es 3.650 kg MS/año = 10 kg/día. Eso
    // corresponde exactamente a un forraje de 18,54 / 10 = 1,854 Mcal EM/kg MS.
    expect(consumoEV_kgMS_dia(1.854)).toBeCloseTo(10.0, 2);
    expect(consumoEV_kgMS_dia(1.854) * 365).toBeCloseTo(3650, 0);
  });

  it('reproduce los 4.380 kg MS/año del forraje grosero', () => {
    // El otro número que circula: 12 kg MS/día. Es el mismo requerimiento sobre
    // un forraje de 1,545 Mcal/kg. Los dos valores publicados no se contradicen.
    expect(consumoEV_kgMS_dia(1.545) * 365).toBeCloseTo(4380, 0);
  });

  it('el forraje con menos energía pide más kilos', () => {
    expect(consumoEV_kgMS_dia(EM_FORRAJE.grosero))
      .toBeGreaterThan(consumoEV_kgMS_dia(EM_FORRAJE.natural));
    expect(consumoEV_kgMS_dia(EM_FORRAJE.natural))
      .toBeGreaterThan(consumoEV_kgMS_dia(EM_FORRAJE.calidad));
  });

  it('el 8 kg/día que había puesto era el de una pastura de calidad', () => {
    // No era un disparate: era el valor del techo del rango, aplicado a todo el
    // planeta. Este test deja escrito de dónde venía.
    expect(consumoEV_kgMS_dia(2.32)).toBeCloseTo(8.0, 1);
  });

  it('caso resuelto: pastizal natural de 5.000 kg MS/ha → 9.350 Mcal EM/ha', () => {
    // El dato publicado que ancla `EM_FORRAJE.natural`: un pastizal natural que
    // produce 5.000 kg MS/ha/año con 1,87 Mcal/kg (≈52% de digestibilidad)
    // ofrece 9.350 Mcal EM/ha.
    expect(5000 * EM_FORRAJE.natural).toBeCloseTo(9350, 0);
  });

  it('rechaza una densidad energética imposible en vez de devolver un número', () => {
    expect(consumoEV_kgMS_dia(0)).toBeNaN();
    expect(consumoEV_kgMS_dia(-1)).toBeNaN();
  });
});

describe('calcularReceptividad', () => {
  // Una vaca de cria: 1,00 EV y 50 L por dia. Es la unidad, asi que la
  // capacidad en EV y la capacidad en cabezas coinciden.
  const bovino = { ev_por_cabeza: 1, agua_l_dia: 50 };

  it('carga y agua coherentes con la producción forrajera', () => {
    const r = calcularReceptividad(100, 800, bovino); // 800 mm → 5000 kg MS/ha
    expect(r.ef_kg_ha).toBe(5000);
    // 5.000 × 100 ha × 0,50 = 250.000 kg MS cosechables.
    // 1 EV con pastizal natural = 18,54/1,87 × 365 = 3.619 kg MS/año.
    // 250.000 / 3.619 = 69,1 EV.
    expect(r.carga_ev).toBeCloseTo(69.1, 1);
    expect(r.carga_animales).toBe(69);
    expect(r.agua_l_dia).toBe(69 * 50);
    expect(r.potreros_voisin).toBe(11);      // 30/3 + 1
    expect(r.area_potrero_ha).toBeCloseTo(9.09, 2);
  });

  it('el número viejo queda dentro del rango, cerca del techo', () => {
    // Lo que importa del cambio: 85,6 EV no era una invención, era el extremo
    // optimista presentado como si fuera el valor central.
    const r = calcularReceptividad(100, 800, bovino);
    expect(r.carga_ev_min).toBeCloseTo(57.3, 1);
    expect(r.carga_ev_max).toBeCloseTo(88.7, 1);
    expect(85.6).toBeGreaterThan(r.carga_ev);
    expect(85.6).toBeLessThan(r.carga_ev_max);
  });

  it('el rango está ordenado y el central adentro', () => {
    const r = calcularReceptividad(250, 650, bovino);
    expect(r.carga_ev_min).toBeLessThan(r.carga_ev);
    expect(r.carga_ev).toBeLessThan(r.carga_ev_max);
    expect(r.carga_animales_min).toBeLessThanOrEqual(r.carga_animales);
    expect(r.carga_animales).toBeLessThanOrEqual(r.carga_animales_max);
  });

  it('se puede pasar la densidad energética del forraje', () => {
    const natural = calcularReceptividad(100, 800, bovino);
    const bueno   = calcularReceptividad(100, 800, bovino, EM_FORRAJE.calidad);
    expect(bueno.carga_ev).toBeCloseTo(natural.carga_ev_max, 1);
    expect(bueno.em_mcal_kg).toBe(EM_FORRAJE.calidad);
    expect(bueno.consumo_ev_kg_dia).toBeCloseTo(7.7, 1);
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

describe('el uso admisible ya no es 0,50 para todo el planeta', () => {
  const bovino = { ev_por_cabeza: 1, agua_l_dia: 50 };

  it('el predio húmedo no se movió: ahí es donde la regla vieja valía', () => {
    // Es la comprobación de que la corrección no es un cambio a ciegas: donde la
    // fuente dice que el 0,50 corresponde, el número sigue siendo el mismo.
    const r = calcularReceptividad(100, 800, bovino);
    expect(r.uso_admisible).toBe(0.50);
    expect(r.carga_ev).toBeCloseTo(69.1, 1);
  });

  it('el predio semiárido bajó un 40 %, que era el error', () => {
    const r = calcularReceptividad(100, 250, bovino);
    expect(r.uso_admisible).toBe(0.30);
    expect(r.banda_uso).toContain('desértico');
    // 700 kg/ha × 100 ha × 0,30 = 21.000 kg contra los 35.000 de antes.
    expect(r.carga_ev).toBeCloseTo(5.8, 1);
    expect(r.carga_ev / (35_000 / (consumoEV_kgMS_dia(EM_FORRAJE.natural) * 365))).toBeCloseTo(0.6, 2);
  });

  it('sin ajustes de paisaje lo dice, para que la pantalla no lo presente como completo', () => {
    const r = calcularReceptividad(100, 800, bovino);
    expect(r.ajustada).toBe(false);
    expect(r.ha_usadas).toBe(100);
    expect(r.factor_distribucion).toBe(1);
  });

  it('con superficie pastoreable y factor de distribución la carga baja y lo marca', () => {
    const bruto = calcularReceptividad(100, 800, bovino);
    const real  = calcularReceptividad(100, 800, bovino, EM_FORRAJE.natural, {
      ha_pastoreables: 78, factor_distribucion: 0.66,
    });
    expect(real.ajustada).toBe(true);
    expect(real.ha_usadas).toBe(78);
    expect(real.carga_ev).toBeCloseTo(bruto.carga_ev * 0.78 * 0.66, 1);
    // Y los potreros de Voisin se reparten la superficie pastoreable, no la bruta.
    expect(real.area_potrero_ha).toBeLessThan(bruto.area_potrero_ha);
  });

  it('un factor de distribución imposible se acota en 1 en vez de inflar la carga', () => {
    const r = calcularReceptividad(100, 800, bovino, EM_FORRAJE.natural, { factor_distribucion: 3 });
    expect(r.factor_distribucion).toBe(1);
  });

  it('un pastizal de anuales admite más uso que el perenne de la misma lluvia', () => {
    const perenne = calcularReceptividad(100, 500, bovino);
    const anuales = calcularReceptividad(100, 500, bovino, EM_FORRAJE.natural, { deAnuales: true });
    expect(perenne.uso_admisible).toBe(0.40);
    expect(anuales.uso_admisible).toBe(0.55);
    expect(anuales.carga_ev).toBeGreaterThan(perenne.carga_ev);
  });
});
