/**
 * Las mediciones de forraje publicadas, y el contraste contra la escalera.
 *
 * Este archivo hace dos cosas distintas y conviene no mezclarlas:
 *
 * 1. **Defiende los números contra su fuente.** Cada cifra montada vuelve a
 *    derivarse acá de lo que la publicación dice textualmente, con su
 *    conversión a la vista. Es el «caso resuelto de la literatura» que pide
 *    `skills/motor-de-calculo`: si alguien toca un número de `forrajeMedido.ts`
 *    sin volver a la fuente, esto no cierra.
 * 2. **Deja escrito el tamaño del error de `prodForrajera`.** No es un test de
 *    regresión: es la lápida de la escalera. Cuando se reemplace, estos
 *    expects tienen que cambiar, y cambiarlos será parte de ese trabajo.
 */
import { describe, it, expect } from 'vitest';
import {
  FORRAJE_MEDIDO, LB_ACRE_A_KG_HA, lbAcreAKgHa, medicionesDeBioma,
} from '@/lib/forrajeMedido';
import { calcularReceptividad } from '@/lib/produccion';
import { BIOMAS_RESOLVE } from '@/lib/ecorregiones';

/** La escalera sin tocarla: `prodForrajera` es privada, pero sale por acá. */
const escalera = (lluvia_mm: number) =>
  calcularReceptividad(1, lluvia_mm, { ev_por_cabeza: 1, agua_l_dia: 50 }).ef_kg_ha;

describe('la conversión de lb/acre', () => {
  it('es la exacta, no la redondeada', () => {
    // 0,45359237 kg / 0,40468564224 ha. El 1,12 de memoria se equivoca en 8 kg
    // cada 1.000, que sobre 3.000 kg/ha son 24 kg: poco. El 1,2 que a veces se
    // ve por ahí se equivoca en 240.
    expect(LB_ACRE_A_KG_HA).toBeCloseTo(1.120851, 6);
  });

  it('reproduce las cifras publicadas por el NRCS', () => {
    expect(lbAcreAKgHa(2733)).toBe(3063);   // comunidad de referencia, MLRA 53B
    expect(lbAcreAKgHa(2358)).toBe(2643);   // estado de pasto corto, MLRA 53B
    expect(lbAcreAKgHa(680 + 56)).toBe(825);      // gramíneas + hierbas, piso
    expect(lbAcreAKgHa(2125 + 175)).toBe(2578);   // gramíneas + hierbas, techo
    expect(lbAcreAKgHa(1700 + 140)).toBe(2062);   // el valor representativo
  });
});

describe('cada medición cierra contra su fuente', () => {
  it('los biomas existen y están escritos con el id canónico', () => {
    const ids = new Set(Object.values(BIOMAS_RESOLVE).map(b => b.id));
    for (const m of FORRAJE_MEDIDO) expect(ids, m.sitio).toContain(m.bioma);
  });

  it('el rango nunca está dado vuelta y el típico cae adentro', () => {
    for (const m of FORRAJE_MEDIDO) {
      expect(m.kg_ms_ha_anio_min, m.sitio).toBeLessThanOrEqual(m.kg_ms_ha_anio_max);
      expect(m.lluvia_mm_min, m.sitio).toBeLessThanOrEqual(m.lluvia_mm_max);
      if (m.kg_ms_ha_anio_tipico !== null) {
        expect(m.kg_ms_ha_anio_tipico, m.sitio).toBeGreaterThanOrEqual(m.kg_ms_ha_anio_min);
        expect(m.kg_ms_ha_anio_tipico, m.sitio).toBeLessThanOrEqual(m.kg_ms_ha_anio_max);
      }
    }
  });

  it('ninguna dice ser lo que no es', () => {
    // `oferta_aprovechable` ya trae descontado el uso admisible y `bandaUso` lo
    // volvería a descontar. Mientras no exista esa distinción río abajo, acá no
    // entra ninguna: las tres que hay son materia seca sin descontar.
    for (const m of FORRAJE_MEDIDO) expect(m.tipo, m.sitio).toBe('ms_herbacea_total');
  });

  it('el altiplano de Puno: biomasa anual, no la que está parada', () => {
    const [puna] = medicionesDeBioma('resolve_montano');
    expect(puna).toBeDefined();
    // Tabla 2: 626,4 · 1.237,0 · 1.340,8 · 1.957,7 kg MS/ha para Kheña,
    // Chilliguar, Yurac ichu y Phorke.
    expect(puna!.kg_ms_ha_anio_min).toBe(626);
    expect(puna!.kg_ms_ha_anio_max).toBe(1958);
    // Y cierran contra la Tabla 3, que publica la biomasa TOTAL en pie y el
    // porcentaje anual de cada comunidad. Esto es lo que separa una producción
    // anual de un stock acumulado, y es la trampa de todo pajonal perenne.
    expect(Math.round(2554.10 * 0.4846)).toBe(1238);  // Festuca dolichophylla
    expect(Math.round(3185.20 * 0.6146)).toBe(1958);  // Calamagrostis antoniana
    expect(Math.round(3972.23 * 0.3375)).toBe(1341);  // Festuca dichoclada
    expect(Math.round(1483.70 * 0.4220)).toBe(626);   // Calamagrostis amoena
  });

  it('el rango de lluvia va con la cifra, porque es donde vale', () => {
    for (const m of FORRAJE_MEDIDO) {
      expect(m.lluvia_mm_min, m.sitio).toBeGreaterThan(0);
      expect(m.donde_deja_de_valer.length, m.sitio).toBeGreaterThan(40);
      expect(m.estacionalidad.length, m.sitio).toBeGreaterThan(40);
      expect(m.fuente.url, m.sitio).toMatch(/^https:\/\//);
    }
  });
});

describe('la escalera de prodForrajera, medida contra lo que hay publicado', () => {
  it('en el norte de las Grandes Llanuras acierta', () => {
    // 381 a 508 mm, medido 2.643 a 3.063 kg MS/ha/año.
    expect(escalera(450)).toBe(1500);   // se queda corta
    expect(escalera(508)).toBe(3000);   // y acá da en el blanco
  });

  it('en el Edwards Plateau se pasa entre dos y cuatro veces', () => {
    // 508 a 762 mm, medido 825 a 2.578, representativo 2.062.
    expect(escalera(600)).toBe(3000);
    expect(escalera(760)).toBe(5000);
    expect(escalera(760) / 825).toBeGreaterThan(6);   // contra el piso del sitio
    expect(escalera(600) / 2062).toBeGreaterThan(1.4); // contra el representativo
  });

  it('en el altiplano a 3.900 m se pasa hasta once veces', () => {
    // 410 a 1.119 mm, medido 626 a 1.958 kg MS/ha/año.
    expect(escalera(1100)).toBe(7000);
    expect(escalera(1100) / 626).toBeGreaterThan(11);
    expect(escalera(1100) / 1958).toBeGreaterThan(3.5);
  });

  it('y por eso el problema no es el nivel sino la forma', () => {
    // Con MENOS lluvia que el altiplano, Dakota produce MÁS: 381-508 mm contra
    // 410-1.119, y 2.643-3.063 contra 626-1.958. Una función de una sola
    // variable no puede dar las dos cosas bien, se la calibre como se la
    // calibre. Lo que falta es el frío, el largo de la estación y el suelo.
    const dakota = medicionesDeBioma('resolve_pastizal_templado')[0]!;
    const puna = medicionesDeBioma('resolve_montano')[0]!;
    expect(dakota.lluvia_mm_max).toBeLessThan(puna.lluvia_mm_max);
    expect(dakota.kg_ms_ha_anio_min).toBeGreaterThan(puna.kg_ms_ha_anio_max);
  });

  it('la sabana tropical, que es donde pastorea casi todo el mundo, sigue sin medición', () => {
    // El lote 02 trajo una de la Caatinga, que es BIOME_NUM 2 y no 7, y además
    // su URL pide login. Cuando entre una de sabana, este test cambia.
    expect(medicionesDeBioma('resolve_sabana_tropical')).toHaveLength(0);
  });
});
