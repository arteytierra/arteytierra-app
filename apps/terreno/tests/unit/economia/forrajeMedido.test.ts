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
  FORRAJE_MEDIDO, LB_ACRE_A_KG_HA, lbAcreAKgHa, gM2AKgHa, medicionesDeBioma,
  TIPOS_SIN_DESCONTAR,
} from '@/lib/forrajeMedido';
import { calcularReceptividad } from '@/lib/produccion';
import { BIOMAS_RESOLVE } from '@/lib/ecorregiones';

/** La escalera sin tocarla: `prodForrajera` es privada, pero sale por acá. */
const escalera = (lluvia_mm: number) =>
  calcularReceptividad(1, lluvia_mm, { ev_por_cabeza: 1, agua_l_dia: 50 }).ef_kg_ha;

describe('las conversiones de unidad', () => {
  it('lb/acre es la exacta, no la redondeada', () => {
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

  it('g/m2 es un factor 10 exacto y así sale la tundra', () => {
    // 10.000 m2/ha ÷ 1.000 g/kg. Sin redondeo de por medio.
    expect(gM2AKgHa(35)).toBe(350);
    expect(gM2AKgHa(96)).toBe(960);
    // Y la fitomasa total de los dos sitios de Alaska, para tenerla a mano:
    expect(gM2AKgHa(7401)).toBe(74010);
    expect(gM2AKgHa(7567)).toBe(75670);
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
      if (m.lluvia_mm_min !== null && m.lluvia_mm_max !== null) {
        expect(m.lluvia_mm_min, m.sitio).toBeLessThanOrEqual(m.lluvia_mm_max);
      }
      if (m.kg_ms_ha_anio_tipico !== null) {
        expect(m.kg_ms_ha_anio_tipico, m.sitio).toBeGreaterThanOrEqual(m.kg_ms_ha_anio_min);
        expect(m.kg_ms_ha_anio_tipico, m.sitio).toBeLessThanOrEqual(m.kg_ms_ha_anio_max);
      }
    }
  });

  it('ninguna trae descontado el uso admisible, que se descuenta río abajo', () => {
    // `oferta_aprovechable` y `receptividad` ya lo traen descontado y `bandaUso`
    // lo volvería a descontar. Mientras no exista esa distinción río abajo, acá
    // no entra ninguna de las dos. Por eso la Caatinga del lote 02 —que venía
    // como `oferta_aprovechable`— no habría entrado ni con el bioma correcto.
    for (const m of FORRAJE_MEDIDO) expect(TIPOS_SIN_DESCONTAR, m.sitio).toContain(m.tipo);
  });

  it('la lluvia va con la cifra, o se declara que la fuente no la publica', () => {
    for (const m of FORRAJE_MEDIDO) {
      // Las dos juntas o ninguna: media lluvia no es un rango de validez.
      expect(m.lluvia_mm_min === null, m.sitio).toBe(m.lluvia_mm_max === null);
      if (m.lluvia_mm_min !== null) expect(m.lluvia_mm_min, m.sitio).toBeGreaterThan(0);
      expect(m.donde_deja_de_valer.length, m.sitio).toBeGreaterThan(40);
      expect(m.estacionalidad.length, m.sitio).toBeGreaterThan(40);
      expect(m.que_cuenta.length, m.sitio).toBeGreaterThan(40);
      expect(m.fuente.url, m.sitio).toMatch(/^https:\/\//);
    }
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

  it('Lesbos: el rango va de 300 a 5.800 y el techo es una ex-chacra', () => {
    const [lesbos] = medicionesDeBioma('resolve_mediterraneo');
    expect(lesbos).toBeDefined();
    expect(lesbos!.kg_ms_ha_anio_min).toBe(300);
    expect(lesbos!.kg_ms_ha_anio_max).toBe(5800);
    // La lluvia es la de las dos temporadas MEDIDAS (353,6 y 797,3 mm) y no la
    // normal del lugar (415 mm, o 464,6 en la estación de Sigri), porque es
    // donde la cifra se tomó.
    expect(lesbos!.lluvia_mm_min).toBe(354);
    expect(lesbos!.lluvia_mm_max).toBe(797);
    expect(lesbos!.donde_deja_de_valer).toMatch(/415 mm/);
    // Y el techo no se puede usar como «el mediterráneo rinde 5.800»: hay que
    // poder leer en el propio dato que eso es una ex-chacra plana.
    expect(lesbos!.que_cuenta + lesbos!.donde_deja_de_valer).toMatch(/chacra/i);
  });

  it('la tundra: producción aérea vascular, con la lluvia sin publicar', () => {
    const [tundra] = medicionesDeBioma('resolve_tundra');
    expect(tundra).toBeDefined();
    // 35 a 96 g/m2/año de plantas vasculares aéreas.
    expect(tundra!.kg_ms_ha_anio_min).toBe(gM2AKgHa(35));
    expect(tundra!.kg_ms_ha_anio_max).toBe(gM2AKgHa(96));
    // La fuente no publica lluvia y se queda en null: rellenarla con la
    // climatología de otro servicio ataría la cifra a un número que su propio
    // trabajo nunca midió.
    expect(tundra!.lluvia_mm_min).toBeNull();
    expect(tundra!.lluvia_mm_max).toBeNull();
    // Y la cifra EXCLUYE musgos y líquenes, que en tundra son forraje de
    // invierno: 28 a 116 g/m2 de musgo es más que las vasculares en el extremo.
    expect(gM2AKgHa(116)).toBeGreaterThan(tundra!.kg_ms_ha_anio_max);
    expect(tundra!.que_cuenta).toMatch(/musgo/i);
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

  it('en Lesbos el rango medido es más ancho que la escalera entera', () => {
    const lesbos = medicionesDeBioma('resolve_mediterraneo')[0]!;
    // Con la lluvia de las dos temporadas, la escalera se mueve de 1.500 a
    // 5.000: todo su recorrido útil. Lo medido en la misma localidad, el mismo
    // año y a pocos kilómetros va de 300 a 5.800, o sea que la variación DENTRO
    // de un paraje es mayor que la que la escalera reparte en todo el planeta.
    expect(escalera(lesbos.lluvia_mm_min!)).toBe(1500);
    expect(escalera(lesbos.lluvia_mm_max!)).toBe(5000);
    const anchoEscalera = 5000 - 1500;
    const anchoMedido = lesbos.kg_ms_ha_anio_max - lesbos.kg_ms_ha_anio_min;
    expect(anchoMedido).toBeGreaterThan(anchoEscalera);
    // Y el piso medido está 5 veces por debajo del escalón que le toca.
    expect(escalera(lesbos.lluvia_mm_min!) / lesbos.kg_ms_ha_anio_min).toBe(5);
  });

  it('para la tundra la escalera no tiene ningún escalón lo bastante bajo', () => {
    const tundra = medicionesDeBioma('resolve_tundra')[0]!;
    // El escalón más bajo de todos, el de menos de 300 mm, es 700 kg/ha/año.
    const piso = escalera(100);
    expect(piso).toBe(700);
    // Y el piso medido en tundra es la mitad de eso. Con lo cual no existe
    // lluvia alguna que haga que la escalera devuelva lo que se mide en tundra:
    // el problema no es el valor de la lluvia, es que la lluvia no alcanza.
    expect(tundra.kg_ms_ha_anio_min).toBeLessThan(piso);
  });

  it('y por eso el problema no es el nivel sino la forma', () => {
    // Con MENOS lluvia que el altiplano, Dakota produce MÁS: 381-508 mm contra
    // 410-1.119, y 2.643-3.063 contra 626-1.958. Una función de una sola
    // variable no puede dar las dos cosas bien, se la calibre como se la
    // calibre. Lo que falta es el frío, el largo de la estación y el suelo.
    const dakota = medicionesDeBioma('resolve_pastizal_templado')[0]!;
    const puna = medicionesDeBioma('resolve_montano')[0]!;
    expect(dakota.lluvia_mm_max!).toBeLessThan(puna.lluvia_mm_max!);
    expect(dakota.kg_ms_ha_anio_min).toBeGreaterThan(puna.kg_ms_ha_anio_max);
  });

  it('los biomas donde más pastorea gente siguen sin medición', () => {
    // La sabana tropical: el lote 02 trajo una de la Caatinga, que es
    // BIOME_NUM 2 y no 7, y además su URL pide login.
    expect(medicionesDeBioma('resolve_sabana_tropical')).toHaveLength(0);
    // El pastizal inundable: el lote 03 trajo un valor MODELADO del delta del
    // Tana que incluye raíces y material muerto, con el texto detrás de un
    // muro y sin la cifra en el resumen público. Cuando entre una medición de
    // cualquiera de los dos, este test cambia.
    expect(medicionesDeBioma('resolve_pastizal_inundable')).toHaveLength(0);
  });
});
