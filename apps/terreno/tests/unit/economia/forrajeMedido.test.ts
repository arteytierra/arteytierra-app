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
  FRACCION_HERBACEA_DEL_SITIO, fraccionHerbacea,
  SERIE_CPER, ECUACION_FORRAJE_A_ANPP, anppDeForraje,
  MODELO_REGIONAL_SALA_1988, MODELO_LARGO_PLAZO_CPER, anppDelModelo, cruceDeModelos,
} from '@/lib/forrajeMedido';
import { bandaDeClase } from '@/lib/cobertura';
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
    // El lote 13 agrego un tercer motivo: Glencoe (INIA Uruguay) es bioma 7
    // verificado, abierto, con coordenada de estacion y consumo individual
    // medido con TiO2, y tampoco entro, porque publica stock en pie antes y
    // despues de un pastoreo de cinco dias y no produccion anual, y porque el
    // fosforo del suelo se mantuvo en 10 ppm por fertilizacion.
    //
    // EL LOTE 14 CERRO ESTE AGUJERO, al quinto intento: la sabana de
    // Trachypogon de Calabozo, bioma 7 (`ECO_ID` 572, Llanos), entra con 3.750
    // kg MS/ha/anio de produccion AEREA. Entro donde las otras no porque es un
    // flujo anual y no una masa en pie. Lo que sigue vacio es el bioma 9.
    expect(medicionesDeBioma('resolve_sabana_tropical')).toHaveLength(1);
    expect(medicionesDeBioma('resolve_sabana_tropical')[0]!.sitio)
      .toMatch(/Calabozo/);
    // Y lo que Glencoe deja, que no es una produccion, sigue montado aparte y
    // sigue sin entrar al archivo: una cosa no reemplazo a la otra.
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

  it('la total del MISMO muestreo es 1,56 veces la forrajera, y no 1,36 a 1,70', () => {
    // Esta prueba estaba mal y pasaba, que es la peor combinación. El lote 13
    // encontró que el 11.200-11.400 es el total del PERÍODO de tres estaciones
    // e incluye materia seca muerta; lo corrigió en la ficha del Delta y dejó
    // sin tocar el título de este test, su comentario y la tabla del
    // encabezado del módulo. Lo arregló el lote 14 buscando todas las
    // apariciones en vez de la que tenía a la vista.
    //
    // El par del mismo muestreo es 10.533 de MS viva total contra 6.733 de MS
    // viva forrajera, los dos textuales en el cuerpo del artículo: 1,564 veces,
    // que es 1 / 0,639.
    const par = paresComibles()[0]!;
    expect(par.total / par.forrajera).toBeCloseTo(1.564, 3);
    expect(1 / fraccionComible(par)).toBeCloseTo(par.total / par.forrajera, 6);
    // El cociente contra el total del período da 1,36 a 1,70 y NO significa
    // nada: numerador y denominador no cubren el mismo tiempo.
    const DEL_PERIODO_MIN = 11200, DEL_PERIODO_MAX = 11400;
    const d = delta();
    expect(DEL_PERIODO_MIN / d.kg_ms_ha_anio_max).toBeCloseTo(1.36, 2);
    expect(DEL_PERIODO_MAX / d.kg_ms_ha_anio_min).toBeCloseTo(1.70, 2);
    // Y la ficha tiene que nombrar las dos cosas: la del mismo muestreo, porque
    // es la que vale, y la del período, porque es la que alguien se va a cruzar
    // al abrir la tesis.
    expect(d.que_cuenta).toMatch(/10\.533/);
    expect(d.que_cuenta).toMatch(/11\.200 a 11\.400/);
    expect(d.que_cuenta).toMatch(/período/);
  });

  it('la escalera acierta contra la forrajera y se queda 1,5× corta contra la total', () => {
    const d = delta();
    const e = escalera(d.lluvia_mm_min!);
    expect(e).toBe(7000);                      // el escalón de ≥ 900 mm
    // Contra la fracción forrajera cae adentro del rango medido: es la primera
    // vez que la escalera no se pasa ni se queda corta.
    expect(e).toBeGreaterThanOrEqual(d.kg_ms_ha_anio_min);
    expect(e).toBeLessThanOrEqual(d.kg_ms_ha_anio_max);
    // Contra la herbácea viva total del MISMO muestreo —10.533 y no 11.200—, el
    // mismo 7.000 se queda corto 1,5 veces. La corrección es chica en el número
    // y grande en el significado: 10.533 es comparable con 6.733 y 11.200 no.
    const total = paresComibles()[0]!.total;
    expect(total).toBe(10533);
    expect(total / e).toBeCloseTo(1.505, 3);
    expect(total / e).toBeGreaterThan(1.5);
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
  it('son diecisiete sitios en ocho de los quince biomas', () => {
    expect(FORRAJE_MEDIDO).toHaveLength(17);
    const biomas = new Set(FORRAJE_MEDIDO.map(m => m.bioma));
    expect(biomas.size).toBe(8);
    expect(Object.keys(BIOMAS_RESOLVE)).toHaveLength(15);
    // El octavo es el bioma 7, que lo abrió el lote 14 después de cuatro lotes
    // de intentos. Siguen vacíos siete, entre ellos el pastizal inundable.
    expect(biomas.has('resolve_sabana_tropical')).toBe(true);
  });

  it('toda medición declara su coordenada o declara que no la tiene', () => {
    // El campo lo agregó el lote 14 porque `clase_wc` decide una banda y no se
    // guardaba de dónde había salido. Las catorce anteriores quedan en `null`:
    // eso no las invalida, marca cuáles no se pueden auditar sin volver a la
    // fuente. Lo que no se admite es inventar una.
    const conCoord = FORRAJE_MEDIDO.filter(m => m.coordenada !== null);
    expect(conCoord).toHaveLength(3);
    for (const m of conCoord) {
      // Hemisferio explícito: una coordenada sin N/S/E/W no se puede verificar,
      // y el signo es exactamente lo que se equivoca al consultar un servicio.
      expect(m.coordenada).toMatch(/[NS],/);
      expect(m.coordenada).toMatch(/[EW]/);
    }
    // Las tres tienen el píxel consultado, y el criterio de estabilidad del
    // lote 14 reparte: dos quedaron en clase 30 porque la clase no cambia entre
    // 500 m, 2 km y 5 km, y Río Mayo en `null` porque sí cambia.
    expect(conCoord.filter(m => m.clase_wc === null)).toHaveLength(1);
    expect(conCoord.filter(m => m.clase_wc === 30)).toHaveLength(2);
  });

  it('cuatro de los diecisiete son sotobosque, y hay que poder contarlos', () => {
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

describe('lote 14 — el bioma 7 entra, y las dos coordenadas eran de un pueblo', () => {
  const calabozo = () => sitio('Calabozo');
  const rioMayo  = () => sitio('Río Mayo');

  it('Calabozo monta la producción AÉREA y no el total con raíces', () => {
    const c = calabozo();
    // 375 g MS/m²/año aéreos. La ficha publica también 307 bajo tierra y 682 de
    // total, y el 682 es el número que anda citado por ahí: confundirlos infla
    // el forraje 1,82 veces.
    expect(c.kg_ms_ha_anio_min).toBe(gM2AKgHa(375));
    expect(c.kg_ms_ha_anio_max).toBe(3750);
    expect(gM2AKgHa(375) + gM2AKgHa(307)).toBe(gM2AKgHa(682));
    expect(gM2AKgHa(682) / c.kg_ms_ha_anio_min).toBeCloseTo(1.819, 3);
    expect(c.tipo).toBe('npp_herbacea');
    expect(TIPOS_SIN_DESCONTAR).toContain(c.tipo);
  });

  it('Calabozo entra como `desconocido` y por eso no toca ninguna banda', () => {
    const c = calabozo();
    // La ficha dice que en ese trabajo se midió el efecto del riego en la
    // estación seca y no dice qué le pasó a esta parcela. `secano` sería una
    // afirmación que la fuente no hace.
    expect(c.insumos).toBe('desconocido');
    // Su clase es la 30, declarada, y aun así la banda de la 30 no la cuenta.
    expect(c.clase_wc).toBe(30);
    const b = bandaDeClase(30);
    expect(b?.sitios).toBe(7);
    expect(b?.kg_ms_ha_anio_min).toBe(350);
    expect(b?.kg_ms_ha_anio_max).toBe(10630);
  });

  it('la lluvia de Calabozo deja la afirmación del lote 12 en un hilo', () => {
    const c = calabozo();
    // 1.257 mm de media 1968-1986. Es MÁS que el 1.119 del sitio de secano más
    // húmedo del archivo, así que si algún día se confirma que esta parcela no
    // se regó, la afirmación del lote 12 —el riego de Curacó supera la lluvia de
    // todo sitio de secano— se cae, porque el riego son 1.300 y el margen 43 mm.
    expect(c.lluvia_mm_min).toBe(1257);
    const lluviaMaxSecano = Math.max(
      ...FORRAJE_MEDIDO.filter(m => m.insumos === 'secano' && m.lluvia_mm_max !== null)
        .map(m => m.lluvia_mm_max ?? 0),
    );
    expect(lluviaMaxSecano).toBe(1119);
    expect(c.lluvia_mm_min!).toBeGreaterThan(lluviaMaxSecano);
    expect(1300 - c.lluvia_mm_min!).toBe(43);
    // La versión que no depende de ningún tecnicismo, y la que le importa al
    // cálculo: el riego supera la lluvia de todo sitio que ENTRE a una banda.
    const enBandas = FORRAJE_MEDIDO.filter(
      m => m.insumos === 'secano' && m.clase_wc !== null && m.lluvia_mm_max !== null,
    );
    for (const m of enBandas) expect(m.lluvia_mm_max!).toBeLessThan(1300);
  });

  it('Calabozo no trae temperatura, y es la trampa de las fichas del ORNL', () => {
    // «mean annual minimum-maximum temperatures of 22.0-36.0 C»: son la mínima
    // y la máxima, no la media anual. Promediarlas daría 29 °C y sería el mismo
    // error que acequia ya cometió con las máximas de POWER.
    expect(calabozo().temp_media_c_anual).toBeNull();
  });

  it('Río Mayo NO alimenta la banda del arbustal, y ése era el objetivo', () => {
    const r = rioMayo();
    // 12 % de cobertura de arbustos en el campo; 9,4 / 6,5 / 3,1 % de píxeles de
    // clase 20 a 500 m, 2 km y 5 km. Lo que un agrónomo llama estepa arbustiva,
    // el satélite lo llama pastizal. La clase queda en `null` porque tampoco es
    // estable: 74 % pastizal a 500 m y 40 % a 5 km, donde lo pasa el desnudo.
    expect(r.clase_wc).toBeNull();
    const b = bandaDeClase(20);
    expect(b?.sitios).toBe(1);
    expect(b?.kg_ms_ha_anio_min).toBe(300);
    expect(b?.kg_ms_ha_anio_max).toBe(5800);
    // Y el único sitio de esa banda sigue siendo Lesbos, que no tiene coordenada
    // publicada: su clase sale del 76 % de cobertura que declara el trabajo.
    expect(sitio('Lesbos').clase_wc).toBe(20);
    expect(sitio('Lesbos').coordenada).toBeNull();
  });

  it('Río Mayo es el sitio más seco, y el lote 15 obligó a decir «sitio»', () => {
    const r = rioMayo();
    expect(r.lluvia_mm_min).toBe(191);
    expect(r.lluvia_que_es).toBe('anio_medido');
    // Este test decía «el primer sitio debajo de 300 mm» y se cayó en cuanto
    // entró el CPER, que tiene un mínimo de 107 mm. No se cayó por un error de
    // dato: el 107 es UN AÑO SECO de una serie de cincuenta en un campo cuya
    // media es 321 mm, que no es un sitio seco. De ahí salió `lluvia_que_es`.
    const deSitio = FORRAJE_MEDIDO.filter(
      m => m !== r && m.lluvia_mm_min !== null
        && (m.lluvia_que_es === 'anio_medido' || m.lluvia_que_es === 'normal_publicada'),
    );
    expect(Math.min(...deSitio.map(m => m.lluvia_mm_min ?? 0))).toBe(354);
    expect(354 / r.lluvia_mm_min!).toBeGreaterThan(1.8);
    // Y el CPER queda afuera de esa comparación por lo que es, no por la cifra.
    expect(sitio('Central Plains').lluvia_que_es).toBe('rango_de_anios');
  });

  it('ninguna entrada mezcla agua de riego con lluvia sin decirlo', () => {
    // La alfalfa de Curacó tiene 1.300 mm en el campo de lluvia y NO es lluvia:
    // es el riego por melgas. Estaba dicho en un comentario, que es invisible
    // para cualquier cálculo. Ahora está en un campo.
    const riego = FORRAJE_MEDIDO.filter(m => m.lluvia_que_es === 'agua_de_riego');
    expect(riego).toHaveLength(1);
    expect(riego[0]!.lluvia_mm_min).toBe(1300);
    expect(riego[0]!.insumos).toBe('riego');
    // Y el campo es `null` exactamente cuando la lluvia es `null`.
    for (const m of FORRAJE_MEDIDO) {
      expect(m.lluvia_que_es === null).toBe(m.lluvia_mm_min === null);
    }
    // Nada de lo que sea agua de riego puede entrar a un modelo de lluvia.
    for (const m of FORRAJE_MEDIDO) {
      if (m.lluvia_que_es !== 'agua_de_riego') continue;
      expect(m.temp_media_c_anual).toBeNull();   // así no lo toma el contraste
    }
  });

  it('el primer escalón de la escalera recibe su primera medición', () => {
    const r = rioMayo();
    const e = escalera(r.lluvia_mm_min!);
    expect(e).toBe(700);                       // el escalón de < 300 mm
    // Se pasa 1,32 veces contra la capa de gramíneas. Es el mejor resultado de
    // la escalera en todo el archivo: en el altiplano se pasa once veces.
    expect(e / r.kg_ms_ha_anio_min).toBeCloseTo(1.321, 3);
    expect(e).toBeGreaterThan(r.kg_ms_ha_anio_max);
    // Contra todo lo aéreo, arbustos incluidos, se queda corta: 790.
    const aereoTotal = gM2AKgHa(79);
    expect(aereoTotal).toBe(790);
    expect(e / aereoTotal).toBeCloseTo(0.886, 3);
  });

  it('y aun así el escalón está mal, por la forma y no por la altura', () => {
    // Cuatro años más del mismo sitio, con el método de pico: 21 a 75 g/m²/año
    // con lluvias de 55 a 167 mm. Los cinco años caen en el MISMO escalón.
    const OTROS_ANIOS = [21, 75] as const;     // g MS/m²/año, ANPP total
    const LLUVIAS     = [55, 167] as const;    // mm
    for (const ll of LLUVIAS) expect(escalera(ll)).toBe(700);
    expect(escalera(191)).toBe(700);
    // Un factor 3,6 de producción adentro de un tramo que devuelve una constante.
    expect(OTROS_ANIOS[1] / OTROS_ANIOS[0]).toBeCloseTo(3.571, 3);
    // Y la escalera no puede ser asimétrica: es monótona creciente, así que no
    // puede bajar con la sequía sin subir con la lluvia de más, que es lo que
    // los autores observaron. Eso no se arregla moviendo un escalón.
    const tramo = [0, 100, 191, 299].map(escalera);
    expect(new Set(tramo).size).toBe(1);
  });

  it('Río Mayo da el cuarto punto de la fracción herbácea, y el primero abierto', () => {
    const rm = FRACCION_HERBACEA_DEL_SITIO.find(f => f.sitio.includes('Río Mayo'))!;
    expect(FRACCION_HERBACEA_DEL_SITIO).toHaveLength(4);
    expect(rm.herbacea).toBe(53);
    expect(rm.aerea_total).toBe(79);
    expect(rm.unidad).toBe('g_ms_m2_anio');
    // 0,671, y el trabajo lo publica además en palabras: «two thirds of
    // production were accounted for by perennial grasses and one third by
    // shrubs». El cociente coincide con la frase a dos decimales.
    expect(fraccionHerbacea(rm)).toBeCloseTo(0.671, 3);
    expect(Math.abs(fraccionHerbacea(rm) - 2 / 3)).toBeLessThan(0.005);
    // Las dos cifras del par cierran con la medición montada y con el arbusto.
    expect(gM2AKgHa(rm.herbacea)).toBe(rioMayo().kg_ms_ha_anio_min);
    expect(rm.aerea_total - rm.herbacea).toBe(26);
    // Y no mueve las puntas del factor 236: cae adentro.
    const todas = FRACCION_HERBACEA_DEL_SITIO.map(fraccionHerbacea);
    expect(fraccionHerbacea(rm)).toBeGreaterThan(Math.min(...todas));
    expect(fraccionHerbacea(rm)).toBeLessThan(Math.max(...todas));
  });
});

describe('lote 15 — cincuenta años del mismo campo, y lo que le hacen a la escalera', () => {
  const cper = () => sitio('Central Plains');

  /** Cuadrados mínimos, para no creerle a la transcripción de cien cifras. */
  function recta(pares: ReadonlyArray<readonly [number, number]>) {
    const n = pares.length;
    const sx  = pares.reduce((a, p) => a + p[0], 0);
    const sy  = pares.reduce((a, p) => a + p[1], 0);
    const sxy = pares.reduce((a, p) => a + p[0] * p[1], 0);
    const sxx = pares.reduce((a, p) => a + p[0] * p[0], 0);
    const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const a = (sy - b * sx) / n;
    const my = sy / n;
    const sst = pares.reduce((acc, p) => acc + (p[1] - my) ** 2, 0);
    const sse = pares.reduce((acc, p) => acc + (p[1] - (a + b * p[0])) ** 2, 0);
    return { a, b, r2: 1 - sse / sst };
  }

  it('la serie tiene los cincuenta años que se midieron, sin 1940 ni 1980', () => {
    expect(SERIE_CPER).toHaveLength(50);
    const anios = SERIE_CPER.map(f => f.anio);
    expect(Math.min(...anios)).toBe(1939);
    expect(Math.max(...anios)).toBe(1990);
    expect(anios).not.toContain(1940);
    expect(anios).not.toContain(1980);
    // 52 años de calendario menos los dos sin muestreo.
    expect(Math.max(...anios) - Math.min(...anios) + 1 - 2).toBe(SERIE_CPER.length);
    // Y el número de ubicaciones, que es la advertencia del trabajo hecha dato.
    expect(Math.min(...SERIE_CPER.map(f => f.ubicaciones))).toBe(3);
    expect(Math.max(...SERIE_CPER.map(f => f.ubicaciones))).toBe(35);
  });

  it('las cien cifras reproducen la ecuación 2 publicada, y ésa es la verificación', () => {
    // «Forage Production = 13 + 0.172(Annual Precipitation)», F = 30,83;
    // gl = 1,48; P < 0,001; r² = 0,39. Si alguien toca un año de la serie, los
    // coeficientes dejan de caer acá: es el caso resuelto de la literatura que
    // pide `skills/motor-de-calculo`, con cien números defendidos por dos.
    const aj = recta(SERIE_CPER.map(f => [f.lluvia_mm, f.forraje_aire_seco] as const));
    expect(aj.a).toBeCloseTo(13, 0);
    expect(aj.b).toBeCloseTo(0.172, 3);
    expect(aj.r2).toBeCloseTo(0.39, 2);
    // Los grados de libertad publicados confirman el n: gl = 1,48 son 50 años.
    expect(SERIE_CPER.length - 2).toBe(48);
  });

  it('la lluvia anual explica el 39 %, que es el resultado incómodo', () => {
    const aj = recta(SERIE_CPER.map(f => [f.lluvia_mm, f.forraje_aire_seco] as const));
    // Un solo sitio, un solo método, medio siglo: el 61 % no lo explica la lluvia
    // del año. El trabajo nombra dos culpables, el tamaño de los eventos y el
    // retardo, y el segundo está probado abajo.
    expect(aj.r2).toBeLessThan(0.45);
    expect(aj.r2).toBeGreaterThan(0.35);
  });

  it('el retardo está en los datos: después de la sequía, llover normal no alcanza', () => {
    const anio = (a: number) => SERIE_CPER.find(f => f.anio === a)!;
    const mediaProd = SERIE_CPER.reduce((s, f) => s + f.forraje_aire_seco, 0) / 50;
    const mediaLluvia = SERIE_CPER.reduce((s, f) => s + f.lluvia_mm, 0) / 50;
    expect(mediaProd).toBeCloseTo(68.5, 1);
    for (const [seco, siguiente] of [[1954, 1955], [1964, 1965]] as const) {
      // El año seco fue seco de verdad: menos del 60 % de la media.
      expect(anio(seco).lluvia_mm).toBeLessThan(mediaLluvia * 0.6);
      // Y al siguiente llovió normal o más…
      expect(anio(siguiente).lluvia_mm).toBeGreaterThan(mediaLluvia);
      // …y la producción siguió bien abajo de la media. Eso no lo puede dar una
      // función de la lluvia de este año: le falta el estado del anterior.
      expect(anio(siguiente).forraje_aire_seco).toBeLessThan(mediaProd * 0.75);
    }
  });

  it('la asimetría que el lote 14 dejó escrita NO se replica, y el test la cierra', () => {
    // Guardia contra mi propio texto. Río Mayo sugería que la sequía baja la
    // producción y la lluvia de más no la sube. Con cincuenta años la respuesta
    // es simétrica, así que la asimetría no es una propiedad de la producción.
    const m = SERIE_CPER.reduce((s, f) => s + f.lluvia_mm, 0) / 50;
    const prodMedia = SERIE_CPER.reduce((s, f) => s + f.forraje_aire_seco, 0) / 50;
    const prom = (g: readonly { forraje_aire_seco: number }[]) =>
      g.reduce((s, f) => s + f.forraje_aire_seco, 0) / g.length;
    const secos   = SERIE_CPER.filter(f => f.lluvia_mm < m * 0.85);
    const humedos = SERIE_CPER.filter(f => f.lluvia_mm > m * 1.15);
    const caida = (prodMedia - prom(secos)) / prodMedia;
    const suba  = (prom(humedos) - prodMedia) / prodMedia;
    expect(caida).toBeCloseTo(0.30, 2);
    expect(suba).toBeCloseTo(0.30, 2);
    // Simétrico a menos de dos puntos porcentuales: no hay techo en los húmedos.
    expect(Math.abs(caida - suba)).toBeLessThan(0.02);
  });

  it('las dos rectas publicadas difieren 4,6 veces en pendiente', () => {
    // Figura 2: «Regional model ANPP = -34 + 0.60(Ann. Precipitation). Long-term
    // model ANPP = 56 + 0.13(Ann. Precipitation)».
    expect(MODELO_REGIONAL_SALA_1988.pendiente).toBe(0.60);
    expect(MODELO_LARGO_PLAZO_CPER.pendiente).toBe(0.13);
    expect(MODELO_REGIONAL_SALA_1988.pendiente / MODELO_LARGO_PLAZO_CPER.pendiente)
      .toBeCloseTo(4.615, 3);
    // Y se cruzan a unos 192 mm: abajo el espacial lee bajo, arriba lee alto.
    const cruce = cruceDeModelos(MODELO_REGIONAL_SALA_1988, MODELO_LARGO_PLAZO_CPER);
    expect(cruce).toBeCloseTo(191.5, 1);
    expect(anppDelModelo(MODELO_REGIONAL_SALA_1988, cruce))
      .toBeCloseTo(anppDelModelo(MODELO_LARGO_PLAZO_CPER, cruce), 6);
    // De los diecisiete sitios, el único debajo de esa cota es Río Mayo.
    const debajo = FORRAJE_MEDIDO.filter(
      m2 => m2.lluvia_mm_min !== null && m2.lluvia_mm_min < cruce,
    );
    expect(debajo).toHaveLength(2);        // Río Mayo (191) y el CPER (107 de mínimo)
    expect(debajo.some(m2 => m2.sitio.includes('Río Mayo'))).toBe(true);
  });

  it('a la lluvia máxima del sitio el modelo regional se pasa 2,3 veces', () => {
    const PMAX = 588;                      // 1967, el año más húmedo de la serie
    expect(Math.max(...SERIE_CPER.map(f => f.lluvia_mm))).toBe(PMAX);
    const reg = anppDelModelo(MODELO_REGIONAL_SALA_1988, PMAX);
    const lar = anppDelModelo(MODELO_LARGO_PLAZO_CPER, PMAX);
    // El artículo lo reporta como «300 vs. 130 g/m²», leído de la figura.
    expect(reg).toBeCloseTo(319, 0);
    expect(lar).toBeCloseTo(132, 0);
    expect(reg / lar).toBeCloseTo(2.41, 2);
    // Y por el otro camino, desde la ecuación 2 más la ecuación 1, da el 130
    // publicado: dos derivaciones independientes del mismo número.
    const porEc2 = anppDeForraje(13 + 0.172 * PMAX);
    expect(porEc2).toBeCloseTo(133, 0);
    expect(Math.abs(porEc2 - lar)).toBeLessThan(2);
  });

  it('la escalera ES el modelo regional, con los mismos 588 mm', () => {
    const PMAX = 588;
    // 3.000 kg MS/ha son 300 g/m², que es el número que el artículo publica como
    // la predicción regional significativamente demasiado alta para este campo.
    expect(escalera(PMAX)).toBe(3000);
    expect(escalera(PMAX) / 10).toBe(300);
    const reg = anppDelModelo(MODELO_REGIONAL_SALA_1988, PMAX);
    expect(Math.abs(escalera(PMAX) / 10 - reg) / reg).toBeLessThan(0.07);
    // Contra el campo real, la escalera se pasa más del doble.
    const lar = anppDelModelo(MODELO_LARGO_PLAZO_CPER, PMAX);
    expect(escalera(PMAX) / 10 / lar).toBeGreaterThan(2.2);
  });

  it('sobre los cincuenta años la escalera se pasa en 35, con mediana 1,27', () => {
    const razones = SERIE_CPER
      .map(f => escalera(f.lluvia_mm) / (anppDeForraje(f.forraje_aire_seco) * 10))
      .sort((x, y) => x - y);
    expect(razones.filter(r => r > 1)).toHaveLength(35);
    expect(razones[Math.floor(razones.length / 2)]).toBeCloseTo(1.27, 2);
    expect(razones[razones.length - 1]).toBeCloseTo(2.62, 2);
    expect(razones[0]).toBeCloseTo(0.68, 2);
  });

  it('la conversión aire-seco a estufa no es un factor, y por eso cambia la forma', () => {
    expect(ECUACION_FORRAJE_A_ANPP.ORDENADA).toBe(46);
    expect(ECUACION_FORRAJE_A_ANPP.PENDIENTE).toBe(0.76);
    // El trabajo la declara como su supuesto principal, y la ajustó flojo.
    expect(ECUACION_FORRAJE_A_ANPP.R2).toBe(0.28);
    expect(ECUACION_FORRAJE_A_ANPP.ANIOS_DEL_AJUSTE).toBe(14);
    const flaco = Math.min(...SERIE_CPER.map(f => f.forraje_aire_seco));
    const gordo = Math.max(...SERIE_CPER.map(f => f.forraje_aire_seco));
    expect(flaco).toBe(22);                // 1954
    expect(gordo).toBe(128);               // 1981
    // El cociente entre las dos columnas se mueve 2,5 veces de punta a punta: no
    // es un cambio de escala, es un cambio de forma de la propia serie.
    expect(anppDeForraje(flaco) / flaco).toBeCloseTo(2.85, 2);
    expect(anppDeForraje(gordo) / gordo).toBeCloseTo(1.12, 2);
    expect((anppDeForraje(flaco) / flaco) / (anppDeForraje(gordo) / gordo))
      .toBeGreaterThan(2.5);
  });

  it('la entrada montada usa la columna de estufa y declara su clase estable', () => {
    const c = cper();
    // 62 y 143 g/m² son las puntas de la columna ANPP_OD de la Tabla 1, y 97 su
    // media publicada. La columna de forraje daría 220, 1.280 y 660: aire-seco.
    expect(c.kg_ms_ha_anio_min).toBe(620);
    expect(c.kg_ms_ha_anio_max).toBe(1430);
    expect(c.kg_ms_ha_anio_tipico).toBe(970);
    // La derivación no cierra al kilo, y el motivo está en la fuente: la columna
    // de ANPP se calculó sobre las medias de forraje SIN redondear, así que 1954
    // sale 62 donde la ecuación sobre el 22 redondeado da 62,7, y 1943 sale 140
    // donde da 139,5. Montamos lo publicado y toleramos el gramo.
    expect(Math.abs(anppDeForraje(22) * 10 - c.kg_ms_ha_anio_min)).toBeLessThan(10);
    expect(Math.abs(anppDeForraje(128) * 10 - c.kg_ms_ha_anio_max)).toBeLessThan(10);
    // Clase 30 con el píxel al 100 % en las tres ventanas, y bioma 8 verificado
    // contra RESOLVE (`ECO_ID` 402, Western shortgrass prairie).
    expect(c.clase_wc).toBe(30);
    expect(c.bioma).toBe('resolve_pastizal_templado');
    // Y afuera de la banda, porque la fuente no dice nada de insumos. Acá ser
    // estricto no cuesta: 620-1.430 cae adentro de la banda de la clase 30.
    expect(c.insumos).toBe('desconocido');
    const b = bandaDeClase(30);
    expect(b?.sitios).toBe(7);
    expect(c.kg_ms_ha_anio_min).toBeGreaterThan(b!.kg_ms_ha_anio_min);
    expect(c.kg_ms_ha_anio_max).toBeLessThan(b!.kg_ms_ha_anio_max);
  });

  it('el CPER trae temperatura media anual de verdad, y eso habilita el contraste', () => {
    const c = cper();
    // «Annual temperature averaged 8.6 ± 0.6 °C»: es una media anual, no la
    // mínima y la máxima de Calabozo.
    expect(c.temp_media_c_anual).toBe(8.6);
    expect(nppMiami(c.lluvia_mm_min!, c.temp_media_c_anual!)).not.toBeNull();
  });

  it('el único rango de lluvia que es del mismo punto en años distintos', () => {
    const c = cper();
    expect(c.lluvia_mm_min).toBe(107);
    expect(c.lluvia_mm_max).toBe(588);
    expect(Math.min(...SERIE_CPER.map(f => f.lluvia_mm))).toBe(c.lluvia_mm_min);
    expect(Math.max(...SERIE_CPER.map(f => f.lluvia_mm))).toBe(c.lluvia_mm_max);
    // Escribí «el rango más ancho del archivo» y era falso: Puno tiene 709 mm de
    // ancho contra los 481 del CPER. Pero el de Puno son DOS ESTACIONES separadas
    // por 400 m de altura, y éste es el mismo punto en cincuenta años. Eso es lo
    // que importa y es lo que el test afirma ahora.
    const ancho = (m2: { lluvia_mm_max: number | null; lluvia_mm_min: number | null }) =>
      (m2.lluvia_mm_max ?? 0) - (m2.lluvia_mm_min ?? 0);
    expect(ancho(c)).toBe(481);
    expect(ancho(sitio('Chuquibambilla'))).toBe(709);
    expect(sitio('Chuquibambilla').lluvia_que_es).toBe('rango_de_sitios');
    const deAnios = FORRAJE_MEDIDO.filter(m2 => m2.lluvia_que_es === 'rango_de_anios');
    expect(deAnios).toHaveLength(1);
    expect(deAnios[0]!.sitio).toMatch(/Central Plains/);
    // Y la escalera cruza tres de sus cinco escalones adentro de un solo sitio.
    const escalones = new Set(SERIE_CPER.map(f => escalera(f.lluvia_mm)));
    expect(escalones.size).toBe(3);
  });
});
