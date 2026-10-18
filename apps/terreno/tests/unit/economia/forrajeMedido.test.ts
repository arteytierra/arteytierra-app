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
  TIPOS_SIN_DESCONTAR, CURVA_DOSEL_MANITOU, forrajeManitouLbAcre,
  fraccionPorDoselManitou, FRACCION_COMIBLE, fraccionComible, paresComibles,
  UTILIZACION_GLENCOE, utilizacionAparente, fraccionDelOfrecido,
} from '@/lib/forrajeMedido';
import { bandaUso } from '@/lib/modulacion';
import { calcularReceptividad } from '@/lib/produccion';
import { BIOMAS_RESOLVE } from '@/lib/ecorregiones';
import { nppMiami } from '@/lib/miamiModel';

/** La escalera sin tocarla: `prodForrajera` es privada, pero sale por acá. */
const escalera = (lluvia_mm: number) =>
  calcularReceptividad(1, lluvia_mm, { ev_por_cabeza: 1, agua_l_dia: 50 }).ef_kg_ha;

/**
 * Buscar por sitio y no por índice.
 *
 * `medicionesDeBioma(x)[0]` funcionaba mientras cada bioma tenía una sola
 * medición. El pastizal templado ya tiene tres, así que un lote nuevo podía
 * cambiar en silencio de cuál habla un test que creía hablar de Dakota.
 */
const sitio = (parte: string) => {
  const m = FORRAJE_MEDIDO.find(x => x.sitio.includes(parte));
  if (!m) throw new Error(`no hay medición cuyo sitio diga «${parte}»`);
  return m;
};

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
    const dakota = sitio('MLRA 53B');
    const puna = sitio('Puno');
    expect(dakota.lluvia_mm_max!).toBeLessThan(puna.lluvia_mm_max!);
    expect(dakota.kg_ms_ha_anio_min).toBeGreaterThan(puna.kg_ms_ha_anio_max);
  });

  it('los biomas donde más pastorea gente siguen sin medición', () => {
    // La sabana tropical: el lote 02 trajo una de la Caatinga, que es
    // BIOME_NUM 2 y no 7, y además su URL pide login. El lote 04 trajo dos más,
    // Serengeti y Kruger, las dos con el bioma 7 bien verificado y las dos de
    // biomasa EN PIE: un promedio de lecturas mensuales con disco de pastura y
    // el mayor cuadrante cosechado de 50 × 50 cm de un trabajo de método.
    //
    // Y el lote 05 cerró el tema por un motivo mejor: la savana NO está sin
    // medir. Nylsvley y el Parque Nacional de Nairobi tienen series mensuales
    // de años en la base del ORNL, y para el MISMO sitio hay varias cifras
    // publicadas de producción aérea que difieren por un factor 7,6 según el
    // algoritmo. La ficha de Nylsvley avisa que su propio 76 g/m²/año «may have
    // substantially underestimated productivity». Montar cualquiera de las dos
    // sería imprimir un número plausible y equivocado en el bioma donde cae la
    // mayoría de los predios ganaderos. El módulo lo explica entero.
    // El lote 13 agrego un tercer motivo y una segunda confirmacion del
    // patron: Glencoe (INIA Uruguay) es bioma 7 verificado, abierto, con
    // coordenada de estacion y consumo individual medido con TiO2, y tampoco
    // entra, porque publica stock en pie antes y despues de un pastoreo de
    // cinco dias y no produccion anual, y porque el fosforo del suelo se
    // mantuvo en 10 ppm por fertilizacion. Con Towoomba van dos de dos: toda
    // medicion de sabana que llego hasta aca resulto ser un ensayo agronomico.
    expect(medicionesDeBioma('resolve_sabana_tropical')).toHaveLength(0);
    // Y lo que Glencoe deja, que no es una produccion, esta montado aparte.
    expect(UTILIZACION_GLENCOE.BIOMA).toBe('resolve_sabana_tropical');
    expect(FORRAJE_MEDIDO.some(m => m.sitio.includes('Glencoe'))).toBe(false);
    // El pastizal inundable: el lote 03 trajo un valor MODELADO del delta del
    // Tana que incluye raíces y material muerto, con el texto detrás de un
    // muro y sin la cifra en el resumen público. El lote 04 trajo el Pantanal
    // de la Nhecolândia, que es bioma 9 de verdad y está abierto, pero publica
    // disponibilidad por fecha —523 kg/ha en febrero de 2010, 1.698 en
    // noviembre de 2008— y no una producción. El lote 05 trajo el Pantanal
    // norte, que SÍ mide productividad neta mes por mes, pero publica tasas
    // diarias y no un total anual, y sus autores declaran que el año medido fue
    // atípico. Cuando entre una medición de cualquiera de los dos, este test
    // cambia.
    expect(medicionesDeBioma('resolve_pastizal_inundable')).toHaveLength(0);
  });
});

/**
 * El Delta del Paraná, que es la entrada que más le discute a la escalera.
 *
 * No por el tamaño del error: por el hecho de que **la misma cosecha admite dos
 * lecturas legítimas y la escalera acierta con una y falla con la otra**, sin
 * que nada diga cuál es. Eso no se arregla calibrando.
 */
describe('el Delta del Paraná: la misma cosecha, dos cifras', () => {
  const delta = () => sitio('Baradero');

  it('monta como MS forrajera, que no es la MS herbácea total', () => {
    const d = delta();
    expect(d.tipo).toBe('ms_forrajera');
    // Y aun así entra, porque no trae descontado el uso admisible: lo que la
    // excluye de `oferta_aprovechable` es que nadie le aplicó un porcentaje.
    expect(TIPOS_SIN_DESCONTAR).toContain(d.tipo);
    // «producciones forrajeras desde los 8200 kg MS*ha-1» en la conclusión;
    // 6.700 es la cosecha de verano del tratamiento sin cortes y 8.250 la
    // acumulada del de cortes bimestrales.
    expect(d.kg_ms_ha_anio_min).toBe(6700);
    expect(d.kg_ms_ha_anio_max).toBe(8250);
    // La tesis publica una sola media anual, así que el rango de lluvia no se
    // ensancha de prepo: 1.055,6 mm redondeado.
    expect(d.lluvia_mm_min).toBe(1056);
    expect(d.lluvia_mm_max).toBe(1056);
  });

  it('la total es de 1,36 a 1,70 veces la forrajera en el mismo muestreo', () => {
    // 11.200 a 11.400 kg/ha de MS total contra 6.700 a 8.250 de forrajera. El
    // resto son las no forrajeras —el abrojo grande, sobre todo— y la MS
    // muerta. Si alguien toma la total por forraje, sobreestima hasta un 70 %.
    const TOTAL_MIN = 11200, TOTAL_MAX = 11400;
    const d = delta();
    expect(TOTAL_MIN / d.kg_ms_ha_anio_max).toBeCloseTo(1.36, 2);
    expect(TOTAL_MAX / d.kg_ms_ha_anio_min).toBeCloseTo(1.70, 2);
    // Y el texto de la entrada tiene que decir la total, porque es el número
    // con el que alguien se va a cruzar al abrir la tesis.
    expect(d.que_cuenta).toMatch(/11\.200 a 11\.400/);
  });

  it('la escalera acierta contra la forrajera y se queda 1,6× corta contra la total', () => {
    const d = delta();
    const e = escalera(d.lluvia_mm_min!);
    expect(e).toBe(7000);                      // el escalón de ≥ 900 mm
    // Contra la fracción forrajera cae adentro del rango medido: es la primera
    // vez que la escalera no se pasa ni se queda corta.
    expect(e).toBeGreaterThanOrEqual(d.kg_ms_ha_anio_min);
    expect(e).toBeLessThanOrEqual(d.kg_ms_ha_anio_max);
    // Contra la herbácea total, el mismo 7.000 se queda corto 1,6 veces.
    expect(11200 / e).toBeGreaterThan(1.5);
  });

  it('dentro de un mismo bioma la escalera tendría que dar dos números distintos', () => {
    // Dakota y el Delta son los dos `resolve_pastizal_templado`. Con 2,8 veces
    // la lluvia, el Delta produce de 2,2 a 3,1 veces más. La escalera, que sólo
    // mira la lluvia, acá va bien; el problema es que en Texas y en el
    // altiplano la misma pendiente la hace fallar 2 a 11 veces. Un número por
    // bioma tampoco alcanza: el bioma 8 ya tiene dos sitios que no se parecen.
    const dakota = sitio('MLRA 53B'), d = delta();
    expect(medicionesDeBioma('resolve_pastizal_templado').length).toBeGreaterThanOrEqual(3);
    expect(d.lluvia_mm_min! / dakota.lluvia_mm_max!).toBeGreaterThan(2);
    expect(d.kg_ms_ha_anio_min / dakota.kg_ms_ha_anio_max).toBeGreaterThan(2);
  });

  it('es una cifra de primavera a otoño, y lo dice donde deja de valer', () => {
    // Doce meses no son: el invierno queda afuera y al final del de 2013 el
    // albardón estuvo 40 días bajo agua. Si esto se usa como anual, se usa de
    // más, y la advertencia tiene que estar en el campo que se lee.
    const d = delta();
    expect(d.donde_deja_de_valer).toMatch(/primavera a otoño/);
    expect(d.donde_deja_de_valer).toMatch(/40 días/);
    // Y la limitación que nadie puede recalcular: el área del aro no está en
    // la tesis, así que la conversión a kg/ha se toma como viene.
    expect(d.metodo).toMatch(/área del aro/);
  });
});

describe('Montecillo: el desierto entra, y el rango es el del algoritmo', () => {
  const m = sitio('Montecillo');

  it('es la primera medición del bioma 13', () => {
    const b13 = medicionesDeBioma('resolve_desierto_matorral_xerofilo');
    expect(b13).toHaveLength(1);
    expect(b13[0]?.sitio).toBe(m.sitio);
  });

  it('es materia seca aérea sin descontar, y tiene las dos medias publicadas', () => {
    expect(m.tipo).toBe('ms_herbacea_total');
    expect(TIPOS_SIN_DESCONTAR).toContain(m.tipo);
    expect(m.lluvia_mm_min).toBe(580);
    expect(m.lluvia_mm_max).toBe(580);
    expect(m.temp_media_c_anual).toBe(15.1);
  });

  it('el rango son las tres cifras publicadas: 609, 669 y 1.063 g/m²/año', () => {
    expect(m.kg_ms_ha_anio_min).toBe(gM2AKgHa(609));
    expect(m.kg_ms_ha_anio_max).toBe(gM2AKgHa(1063));
    // El típico es el del trabajo primario, 669,2, y NO el punto medio.
    expect(m.kg_ms_ha_anio_tipico).toBe(Math.round(gM2AKgHa(669.2)));
    expect(m.kg_ms_ha_anio_max / m.kg_ms_ha_anio_min).toBeCloseTo(1.75, 2);
  });

  it('la dispersión de algoritmo es del dato aéreo y NO del total', () => {
    // Las tres fuentes de la ficha: ANPP 669/609/1.063 y TNPP 1.676/1.783/1.741.
    // El total coincide dentro de un 6 % mientras la parte aérea se mueve un
    // 75 %. Los algoritmos no discuten cuánto se produce: discuten DÓNDE, y lo
    // que acequia necesita —la parte de arriba— es justo la que no se sostiene.
    const anpp = [669, 609, 1063];
    const tnpp = [1676, 1783, 1741];
    const span = (xs: number[]) => Math.max(...xs) / Math.min(...xs);
    expect(span(anpp)).toBeCloseTo(1.75, 2);
    expect(span(tnpp)).toBeLessThan(1.07);
    expect(span(anpp)).toBeGreaterThan(span(tnpp) * 1.5);
  });

  it('el Miami Model lee 1,75 veces bajo en ese pastizal, y acá queda fijado', () => {
    const r = nppMiami(m.lluvia_mm_min ?? 0, m.temp_media_c_anual ?? 0);
    expect(r?.npp_ms_g_m2_anio).toBeCloseTo(958.9, 1);
    expect(1676 / (r?.npp_ms_g_m2_anio ?? 1)).toBeCloseTo(1.75, 2);
  });

  it('declara el incendio y el fuego intencional del régimen', () => {
    expect(m.donde_deja_de_valer).toMatch(/incendio accidental de febrero de 1986/);
    expect(m.donde_deja_de_valer).toMatch(/INTENCIONAL/);
    expect(m.que_cuenta).toMatch(/subterránea es de 1\.007/);
  });
});

describe('Różańsko: seis algoritmos sobre las mismas cosechas', () => {
  const m = sitio('Różańsko');

  it('es la primera medición del bioma 4 y el primer sotobosque', () => {
    expect(medicionesDeBioma('resolve_bosque_templado_caducifolio_mixto')).toHaveLength(1);
    expect(m.tipo).toBe('ms_sotobosque');
    expect(TIPOS_SIN_DESCONTAR).toContain('ms_sotobosque');
  });

  it('el rango va del método 1 en 2010 al método 6 en 2011', () => {
    expect(m.kg_ms_ha_anio_min).toBe(Math.round(gM2AKgHa(37.835)));
    expect(m.kg_ms_ha_anio_max).toBe(Math.round(gM2AKgHa(93.958)));
    // La fuente compara los seis y no elige: no hay típico.
    expect(m.kg_ms_ha_anio_tipico).toBeNull();
  });

  it('el algoritmo mueve el resultado más que el año', () => {
    // Tabla 3 del artículo, g/m²/año: los seis métodos para 2010 y 2011.
    const metodos: ReadonlyArray<readonly [number, number]> = [
      [37.835, 41.027], [50.249, 58.261], [59.783, 72.594],
      [52.680, 72.654], [52.105, 68.611], [74.307, 93.958],
    ];
    const porAnio2010 = metodos.map(x => x[0]);
    const porAlgoritmo = Math.max(...porAnio2010) / Math.min(...porAnio2010);
    const porAnio = Math.max(...metodos.map(x => x[1] / x[0]));
    expect(porAlgoritmo).toBeCloseTo(1.96, 2);
    expect(porAnio).toBeCloseTo(1.38, 2);
    expect(porAlgoritmo).toBeGreaterThan(porAnio);
  });

  it('el método del máximo de biomasa en pie subestima la mitad', () => {
    // 1 − 37,835/74,307 = 49 % en 2010 y 1 − 41,027/93,958 = 56 % en 2011: la
    // fuente lo resume como «50 % a 52 %» y el orden es el que importa.
    expect(1 - 37.835 / 74.307).toBeGreaterThan(0.45);
    expect(1 - 41.027 / 93.958).toBeGreaterThan(0.45);
    expect(m.donde_deja_de_valer).toMatch(/SUBESTIMA/);
  });

  it('declara que la mitad del año lo aporta una efímera de primavera', () => {
    expect(m.estacionalidad).toMatch(/Anemone nemorosa/);
    expect(m.estacionalidad).toMatch(/mitad del pasto del año pasa en abril/);
  });
});

describe('el transecto de Oregón: el dosel, medido contra su propio rodal', () => {
  const cascade = sitio('Cascade Head');
  const warings = sitio('Waring');

  it('abren los biomas 5 y 8 con sotobosque, no con pastizal', () => {
    // Tres en el bioma 5 desde el lote 11: Cascade Head y las dos mitades de
    // Manitou, que son el mismo bosque contado bajo dosel y en las aberturas.
    expect(medicionesDeBioma('resolve_bosque_coniferas_templado')).toHaveLength(3);
    expect(cascade.tipo).toBe('ms_sotobosque');
    expect(warings.tipo).toBe('ms_sotobosque');
    // Waring's Woods cae en el bioma 8 por la coordenada que la ficha publica:
    // la sabana de robles del valle Willamette, ECO_ID 403.
    expect(warings.bioma).toBe('resolve_pastizal_templado');
  });

  it('la capa herbácea es el 0,4 % y el 2,5 % de la NPP del rodal', () => {
    // Las cuatro cifras salen de la misma tabla de la ficha OTTER.
    expect(warings.kg_ms_ha_anio_tipico).toBe(gM2AKgHa(6));
    expect(cascade.kg_ms_ha_anio_tipico).toBe(gM2AKgHa(41));
    expect(6 / 1540).toBeCloseTo(0.0039, 4);
    expect(41 / 1630).toBeCloseTo(0.0252, 4);
  });

  it('lo que explica el salto es la cobertura herbácea, no el clima', () => {
    // 35,2 % contra 4,9 % de cobertura dan 41 contra 6 g/m²/año: las dos
    // razones son casi la misma, y los dos sitios están en el mismo transecto.
    expect((41 / 6) / (35.2 / 4.9)).toBeCloseTo(0.95, 2);
    expect(warings.que_cuenta).toMatch(/4,9 % contra 35,2 %/);
  });

  it('en el mismo bioma que la pradera de Dakota, y 44 veces menos', () => {
    const dakota = sitio('Dakota');
    expect(dakota.bioma).toBe(warings.bioma);
    const factor = (dakota.kg_ms_ha_anio_min + dakota.kg_ms_ha_anio_max) / 2 / warings.kg_ms_ha_anio_max;
    expect(factor).toBeGreaterThan(40);
    expect(warings.donde_deja_de_valer).toMatch(/NO se puede usar como la producción del bioma 8/);
  });

  it('no inventa la lluvia que la ficha no publica por sitio', () => {
    for (const x of [cascade, warings]) {
      expect(x.lluvia_mm_min).toBeNull();
      expect(x.lluvia_mm_max).toBeNull();
    }
    // La única media anual que la ficha da por punto es la temperatura, que
    // varía con la altura: 11,2 °C en el valle interior.
    expect(warings.temp_media_c_anual).toBe(11.2);
    expect(cascade.temp_media_c_anual).toBeNull();
  });
});

describe('el inventario, después de los lotes 06, 07 y 08', () => {
  it('son catorce sitios en siete de los quince biomas', () => {
    expect(FORRAJE_MEDIDO).toHaveLength(14);
    const biomas = new Set(FORRAJE_MEDIDO.map(m => m.bioma));
    expect(biomas.size).toBe(7);
    expect(Object.keys(BIOMAS_RESOLVE)).toHaveLength(15);
  });

  it('cuatro de los catorce son sotobosque, y hay que poder contarlos', () => {
    // Son tres mediciones de abajo de un dosel cerrado, y no se pueden leer
    // como la producción de su bioma: dos de ellas abren un bioma nuevo y la
    // tercera cae en el bioma de la pradera de Dakota produciendo 44× menos.
    const sotobosque = FORRAJE_MEDIDO.filter(m => m.tipo === 'ms_sotobosque');
    expect(sotobosque).toHaveLength(4);
    expect(sotobosque.every(m => TIPOS_SIN_DESCONTAR.includes(m.tipo))).toBe(true);
  });

  it('toda medición con temperatura publicada se puede contrastar', () => {
    const conTemp = FORRAJE_MEDIDO.filter(m => m.temp_media_c_anual !== null);
    expect(conTemp.length).toBeGreaterThanOrEqual(2);
    for (const m of conTemp) {
      if (m.lluvia_mm_min === null) continue;
      expect(nppMiami(m.lluvia_mm_min, m.temp_media_c_anual ?? 0)).not.toBeNull();
    }
  });
});

describe('lote 11 — la curva de dosel de Manitou, verificada por ajuste', () => {
  /** Cuadrados mínimos sobre los pares, para no creerle a la transcripción. */
  function recta(pares: ReadonlyArray<readonly [number, number]>) {
    const n = pares.length;
    const mx = pares.reduce((s, [x]) => s + x, 0) / n;
    const my = pares.reduce((s, [, y]) => s + y, 0) / n;
    const sxy = pares.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
    const sxx = pares.reduce((s, [x]) => s + (x - mx) ** 2, 0);
    const b = sxy / sxx;
    const a = my - b * mx;
    const syy = pares.reduce((s, [, y]) => s + (y - my) ** 2, 0);
    const ssr = pares.reduce((s, [x, y]) => s + (y - (a + b * x)) ** 2, 0);
    return { a, b, r2: 1 - ssr / syy, sd_resid: Math.sqrt(ssr / (n - 2)), se_media: Math.sqrt(ssr / (n - 2) / n) };
  }

  const pares = CURVA_DOSEL_MANITOU.PARES_AGOSTO_1972;
  const ago72 = CURVA_DOSEL_MANITOU.ECUACIONES[2]!;
  const ago73 = CURVA_DOSEL_MANITOU.ECUACIONES[3]!;

  it('los catorce pares devuelven la ecuación publicada', () => {
    // Esto es el caso resuelto de la literatura, y además la única forma de
    // verificar los pares: el PDF de la tesis no se puede abrir desde acá, así
    // que lo que se comprueba es que los pares y la ecuación sean la misma cosa.
    expect(pares).toHaveLength(14);
    const f = recta(pares);
    expect(f.a).toBeCloseTo(529.4, 1);
    expect(f.b).toBeCloseTo(-6.1, 1);
    expect(ago72.fecha).toBe('agosto 1972');
    expect(ago72.a).toBe(529.4);
    expect(ago72.b).toBe(-6.1);
    expect(f.r2).toBeCloseTo(0.80, 2);
  });

  it('el «SE» publicado no es la dispersión de los residuos', () => {
    // 22,5 lb/acre publicado contra 80,2 de desvío residual. El 22,5 coincide
    // con el error estándar de la media, 21,4. Leerlo como ruido de la
    // predicción lo subestima 3,6 veces.
    const f = recta(pares);
    expect(f.sd_resid).toBeCloseTo(80.2, 0);
    expect(f.se_media).toBeCloseTo(21.4, 0);
    expect(ago72.se_publicado).toBe(22.5);
    expect(f.sd_resid / ago72.se_publicado).toBeGreaterThan(3.5);
  });

  it('la pendiente relativa es la misma en los dos años, y el nivel no', () => {
    // El hallazgo que hace la curva usable: 1973 produjo 2,10 veces lo de 1972
    // —la tesis lo advierte— y la forma de la relación no se movió.
    const rel72 = Math.abs(ago72.b) / ago72.a;
    const rel73 = Math.abs(ago73.b) / ago73.a;
    expect(Math.abs(rel72 - rel73) / rel72).toBeLessThan(0.005);
    expect(ago73.a / ago72.a).toBeCloseTo(2.10, 2);
    // Y el dosel al que la recta llega a cero: 86,8 % contra 87,0 %.
    expect(ago72.a / Math.abs(ago72.b)).toBeCloseTo(86.8, 1);
    expect(ago73.a / Math.abs(ago73.b)).toBeCloseTo(87.0, 1);
  });

  it('las tres cosechas de 1972 son una meseta, no un día', () => {
    // Junio, julio y agosto dan casi la misma recta: el pico de este sitio dura
    // tres meses, lo cual es lo que permite llamarle peak standing crop.
    const [jun, jul] = CURVA_DOSEL_MANITOU.ECUACIONES;
    expect(jun?.fecha).toBe('junio 1972');
    expect(jul?.fecha).toBe('julio 1972');
    for (const e of [jun, jul]) {
      expect(Math.abs((e?.a ?? 0) - ago72.a) / ago72.a).toBeLessThan(0.02);
    }
  });

  it('la fracción por dosel devuelve null fuera del gradiente medido', () => {
    // 0 a 78 % es lo que midió; más allá la recta sólo extrapola.
    expect(fraccionPorDoselManitou(-1)).toBeNull();
    expect(fraccionPorDoselManitou(79)).toBeNull();
    expect(fraccionPorDoselManitou(0)).toBe(1);
    expect(fraccionPorDoselManitou(50)).toBeCloseTo(0.424, 3);
    // A 78 %, el extremo medido, queda un 10 % de lo de la abertura.
    expect(fraccionPorDoselManitou(78)).toBeCloseTo(0.101, 3);
  });

  it('evalúa la recta en lb/acre y reproduce las parcelas sin dosel', () => {
    expect(forrajeManitouLbAcre(ago72, 0)).toBeCloseTo(529.4, 1);
    // Las tres aberturas medidas: 465, 474 y 587, con media 508,7.
    const aberturas = pares.filter(([x]) => x === 0).map(([, y]) => y);
    expect(aberturas).toHaveLength(3);
    const media = aberturas.reduce((s, y) => s + y, 0) / 3;
    expect(Math.abs(media - forrajeManitouLbAcre(ago72, 0)) / media).toBeLessThan(0.05);
  });

  it('el mismo bosque, el mismo día: las aberturas dan 13 veces el dosel', () => {
    // Es el argumento más limpio que tiene acequia de que la clase de cobertura
    // importa y el clima no lo explica: mismo suelo, misma lluvia, mismo método.
    const dosel = sitio('bajo dosel de ponderosa');
    const abiertas = sitio('aberturas naturales');
    expect(dosel.clase_wc).toBe(10);
    expect(abiertas.clase_wc).toBe(30);
    expect(dosel.bioma).toBe(abiertas.bioma);
    expect(dosel.lluvia_mm_min).toBe(abiertas.lluvia_mm_min);
    expect(dosel.temp_media_c_anual).toBe(abiertas.temp_media_c_anual);
    expect(abiertas.kg_ms_ha_anio_min / dosel.kg_ms_ha_anio_min).toBeCloseTo(13.4, 1);
    expect(abiertas.kg_ms_ha_anio_max / dosel.kg_ms_ha_anio_min).toBeCloseTo(16.9, 1);
  });

  it('la conversión de lb/acre a kg/ha es la de las dos entradas', () => {
    // 35 y 449 lb/acre bajo dosel; 465 y 587 en las aberturas.
    expect(lbAcreAKgHa(35)).toBe(39);
    expect(lbAcreAKgHa(449)).toBe(503);
    expect(lbAcreAKgHa(465)).toBe(521);
    expect(lbAcreAKgHa(587)).toBe(658);
  });

  it('con la lluvia publicada, el dosel mueve el forraje del 0,6 % al 9 % de la NPP', () => {
    // 396 mm y 5 °C: la lluvia limita, y por eso el contraste no es sensible a
    // la temperatura aproximada que trae de otra publicación.
    const m = nppMiami(396, 5);
    expect(m).not.toBeNull();
    expect(m?.limitante).toBe('lluvia');
    const total = m?.npp_ms_kg_ha_anio ?? 0;
    expect(total).toBeCloseTo(6933, -2);
    const dosel = sitio('bajo dosel de ponderosa');
    const abiertas = sitio('aberturas naturales');
    expect((dosel.kg_ms_ha_anio_min / total) * 100).toBeCloseTo(0.56, 2);
    expect((abiertas.kg_ms_ha_anio_max / total) * 100).toBeCloseTo(9.49, 1);
    // Un factor 17 entre las dos puntas del mismo bosque, con el mismo clima
    // adentro del modelo: el dosel mueve más que cualquier variable climática.
    expect(abiertas.kg_ms_ha_anio_max / dosel.kg_ms_ha_anio_min).toBeGreaterThan(16);
  });
});

describe('lote 13 — la fraccion comible, y los dos denominadores del mismo sitio', () => {
  it('el unico par del mismo muestreo da 0,639, y los dos textuales del articulo', () => {
    const buenos = paresComibles();
    expect(buenos).toHaveLength(1);
    const p = buenos[0]!;
    // Las dos cifras estan textuales en el cuerpo del articulo: «MS viva total
    // en verano entre S (10533 kg ha-1) y C (2237 kg ha-1)» y «una sola cosecha
    // efectuada en verano (6733 kg ha-1)».
    expect(p.forrajera).toBe(6733);
    expect(p.total).toBe(10533);
    expect(fraccionComible(p)).toBeCloseTo(0.6392, 4);
  });

  it('los pares que mezclan unidades temporales abren un abanico de 0,588 a 0,737', () => {
    const malos = FRACCION_COMIBLE.filter(p => !p.mismo_muestreo);
    expect(malos).toHaveLength(2);
    const cocientes = malos.map(fraccionComible).sort((a, b) => a - b);
    expect(cocientes[0]).toBeCloseTo(0.5877, 4);   // 6700 / 11400
    expect(cocientes[1]).toBeCloseTo(0.7366, 4);   // 8250 / 11200
    // El ancho del abanico no es variabilidad ecologica: es un flujo dividido
    // por un stock y una cosecha de verano dividida por un total de tres
    // estaciones. Y lo peor del caso: el par bueno cae ADENTRO, asi que el
    // error no se nota mirando el resultado.
    const bueno = fraccionComible(paresComibles()[0]!);
    expect(bueno).toBeGreaterThan(cocientes[0]!);
    expect(bueno).toBeLessThan(cocientes[1]!);
    // Un 25 % de ancho relativo entre las dos puntas del mismo sitio y el
    // mismo anio, por aritmetica y no por campo.
    expect(cocientes[1]! / cocientes[0]!).toBeCloseTo(1.253, 3);
  });

  it('el denominador del mismo muestreo es menor que el del periodo, porque no tiene lo muerto', () => {
    const bueno = paresComibles()[0]!;
    const delPeriodo = FRACCION_COMIBLE.filter(p => !p.mismo_muestreo).map(p => p.total);
    for (const t of delPeriodo) expect(t).toBeGreaterThan(bueno.total);
    // La ficha del Delta en forrajeMedido.ts decia 11.200 «del mismo
    // muestreo». No lo era. La diferencia con 10.533 son unos 700 a 900 kg/ha
    // de materia seca muerta mas el resto del periodo.
    expect(Math.min(...delPeriodo) - bueno.total).toBeGreaterThan(600);
  });
});

describe('lote 13 — Glencoe: la fraccion que se saca la decide el animal, no el pasto', () => {
  const ng   = UTILIZACION_GLENCOE.TRATAMIENTOS[0];
  const ngl  = UTILIZACION_GLENCOE.TRATAMIENTOS[1];

  it('las dos utilizaciones aparentes salen de la Tabla 2 y dan 30,0 y 21,3 %', () => {
    expect(ng.masa_pre_kg_ha - ng.masa_pos_kg_ha).toBe(416);
    expect(ngl.masa_pre_kg_ha - ngl.masa_pos_kg_ha).toBe(506);
    expect(utilizacionAparente(ng)).toBeCloseTo(0.2999, 4);
    expect(utilizacionAparente(ngl)).toBeCloseTo(0.2133, 4);
  });

  it('1,71 veces mas pasto parado da 0,71 veces la fraccion removida', () => {
    const masa = ngl.masa_pre_kg_ha / ng.masa_pre_kg_ha;
    expect(masa).toBeCloseTo(1.710, 3);
    const frac = utilizacionAparente(ngl) / utilizacionAparente(ng);
    expect(frac).toBeCloseTo(0.711, 3);
    // El producto de los dos es la razon de las desapariciones absolutas, y
    // esta mucho mas cerca de 1 que cualquiera de los dos factores: el animal
    // se llevo casi lo mismo de los dos potreros.
    expect(masa * frac).toBeCloseTo(1.216, 3);
  });

  it('las dos desapariciones son indistinguibles con el error de la propia fuente', () => {
    // SEM publicado de cada masa: 112 kg/ha. El de una diferencia de dos
    // medias independientes es ese por raiz de dos.
    const inc = UTILIZACION_GLENCOE.SEM_MASA_KG_HA * Math.SQRT2;
    expect(inc).toBeCloseTo(158.4, 1);
    const a = ng.masa_pre_kg_ha - ng.masa_pos_kg_ha;
    const b = ngl.masa_pre_kg_ha - ngl.masa_pos_kg_ha;
    // Los intervalos se superponen por completo: 258-574 contra 348-664.
    expect(a + inc).toBeGreaterThan(b - inc);
    expect(b - inc).toBeLessThan(a);
    // Y el consumo medido con marcador dice lo mismo por otro camino: 6,35
    // contra 6,67 kg MS/animal/dia, que la fuente publica con p = 0,314.
    expect(ngl.consumo_kg_animal_dia / ng.consumo_kg_animal_dia).toBeCloseTo(1.050, 3);
  });

  it('lo comido sobre lo ofrecido da 0,508 en los dos, con 1,71 veces de diferencia de pasto', () => {
    expect(fraccionDelOfrecido(ng)).toBeCloseTo(0.508, 3);
    expect(fraccionDelOfrecido(ngl)).toBeCloseTo(0.508, 3);
    // Tres decimales iguales en dos pastizales que difieren 1,71 veces en masa.
    const brecha = Math.abs(fraccionDelOfrecido(ng) - fraccionDelOfrecido(ngl));
    expect(brecha).toBeLessThan(0.001);
  });

  it('la utilizacion de Glencoe NO se parece a la banda de uso, y es a proposito', () => {
    // Guardia de una sola direccion, como el Miami Model. Las dos cifras de
    // Glencoe quedan por DEBAJO del piso de la banda humeda de Holechek, y eso
    // no la refuta: son fracciones de stock en pie en cinco dias contra una
    // fraccion del crecimiento de la temporada. Si alguien baja BANDAS_USO
    // apoyandose en esto, este test es el que tiene que leer primero.
    const humeda = bandaUso(1350);
    expect(humeda.id).toBe('humedo');
    expect(humeda.inicial).toBe(0.50);
    expect(utilizacionAparente(ng)).toBeLessThan(humeda.min);
    expect(utilizacionAparente(ngl)).toBeLessThan(humeda.min);
    // Lo que si cae sobre el 0,50: el cociente adimensional comparable. No
    // es igual, es 0,508, y la distancia relativa al coeficiente de Holechek
    // es del 1,6 %. Se afirma asi y no con toBeCloseTo, que a dos decimales
    // pediria 0,005 y a uno dejaria pasar cualquier cosa entre 0,45 y 0,55.
    const brechaHolechek = Math.abs(fraccionDelOfrecido(ng) - humeda.inicial) / humeda.inicial;
    expect(brechaHolechek).toBeLessThan(0.02);
  });

  it('la lluvia de Glencoe deja condicionada la afirmacion del lote 12', () => {
    // 1.300 a 1.400 mm de lluvia MEDIA: mas que el 1.119 del sitio de secano
    // mas humedo del archivo, y tanto como el riego de la alfalfa de Curaco.
    // La afirmacion del lote 12 sobrevive solo porque Glencoe es fertilizado.
    expect(UTILIZACION_GLENCOE.LLUVIA_MM_MIN).toBe(1300);
    const lluviaMaxSecano = Math.max(
      ...FORRAJE_MEDIDO.filter(m => m.insumos === 'secano').map(m => m.lluvia_mm_max ?? 0),
    );
    expect(lluviaMaxSecano).toBe(1119);
    expect(lluviaMaxSecano).toBeLessThan(UTILIZACION_GLENCOE.LLUVIA_MM_MIN);
  });
});
