/**
 * Electrificador del alambrado: cuánto equipo, cuánta tierra y cuánto alambre.
 *
 * El menú de manejos (`lib/manejos.ts`) ya dice cuántos metros de alambrado pide
 * cada opción de subdivisión. Lo que faltaba es la otra mitad de la compra: el
 * equipo que lo va a tener con corriente, y las dos cosas que lo hacen fallar
 * aunque el equipo esté bien elegido —la puesta a tierra y el alambre—.
 *
 * ── LAS FUENTES ─────────────────────────────────────────────────────────────
 * · **USDA NRCS (2015)**, «Conservation Practice General Specification — Fence
 *   (Code 382)», NRCS Texas, TX-382. Es una especificación de obra: dice el
 *   voltaje que tiene que llegar a la punta por tipo de animal, la salida mínima
 *   del equipo bajo carga, y la puesta a tierra mínima.
 * · **Kurtz, I. y Frey, P. (2005)**, «Electric Fencing for Serious Graziers»,
 *   USDA Natural Resources Conservation Service, Columbia, Missouri, 34 p. De
 *   acá sale la resistencia del alambre por calibre y el método de ensayo de la
 *   puesta a tierra. El texto dice que está hecho sobre veinte años de
 *   experiencia de personal del NRCS y de productores.
 * · **Booher, M. (2025)**, «Electric Fencing: How to Select and Install an
 *   Energizer», Virginia Cooperative Extension, SPES-689P.
 * · **Ontario Forage Council (2018)**, «Selecting an Energizer for Your Electric
 *   Fence», Field Crop News.
 *
 * ── LAS DOS FUENTES SE CONTRADICEN, Y LAS DOS TIENEN RAZÓN ──────────────────
 * Sobre lo que más plata mueve —si los hilos multiplican el equipo— dicen lo
 * contrario:
 *
 *   · Virginia: *«Installing multiple wires on a fence does not require more
 *     joules. In fact, multiple connected wires reduces resistance and improves
 *     energizer function.»*
 *   · Ontario: *«If you have a single strand fence that goes five miles, it
 *     requires much less power than a five strand fence going five miles,
 *     because the multi-strand is actually 25 miles of wire.»*
 *
 * No es que una esté equivocada: están hablando de dos cosas distintas. Virginia
 * habla de la **resistencia del conductor** —cuatro hilos unidos en las dos
 * puntas son cuatro resistencias en paralelo, o sea la cuarta parte— y Ontario
 * habla de la **fuga** —cuatro hilos son cuatro veces más aisladores, cuatro
 * veces más pasto tocando y cuatro veces más superficie por donde perder—. Cuál
 * manda depende de cuánta vegetación toque el alambre: con el alambre limpio
 * manda la resistencia y Virginia tiene razón; con el pasto encima manda la fuga
 * y la tiene Ontario.
 *
 * Por eso acequia no elige: devuelve **las dos cotas**, dice de quién es cada
 * una, y recomienda la mayor. Un equipo sobrado cuesta una vez; un equipo corto
 * se descubre con los animales afuera.
 *
 * ── LO QUE NO SE PUEDE CALCULAR, Y ES LO QUE HAY QUE MEDIR ──────────────────
 * Los joules son una **estimación**: ninguna de las cuatro fuentes publica la
 * conductancia de fuga de un aislador ni de un metro de pasto mojado, así que
 * nadie puede predecir el voltaje en la punta del alambrado. Lo que sí está
 * publicado es **cuánto voltaje tiene que haber ahí**, y eso se mide con un
 * voltímetro de 20 dólares. Es la misma asimetría que en las alturas de pastoreo:
 * la cuenta orienta la compra, la medición decide si el alambrado sirve.
 *
 * ── QUIÉN LEE ESTO ──────────────────────────────────────────────────────────
 * El panel de Pastoreo, abajo del menú de manejos. Nada de este módulo entra en
 * un cálculo físico de otro: es una lista de compra y una lista de verificación.
 */

export const FUENTE_NRCS_382 =
  'USDA NRCS (2015) — Conservation Practice General Specification: Fence (Code 382), NRCS Texas, TX-382';
export const FUENTE_KURTZ_FREY =
  'Kurtz, I. y Frey, P. (2005) — Electric Fencing for Serious Graziers, USDA NRCS, Columbia, Missouri';
export const FUENTE_BOOHER =
  'Booher, M. (2025) — Electric Fencing: How to Select and Install an Energizer, Virginia Cooperative Extension SPES-689P';
export const FUENTE_ONTARIO =
  'Ontario Forage Council (2018) — Selecting an Energizer for Your Electric Fence, Field Crop News';

/** 1 milla = 1.609,344 m. */
export const MILLA_M = 1609.344;
/** 1 pie = 0,3048 m. */
export const PIE_M = 0.3048;

// ─── El voltaje que tiene que llegar a la punta ───────────────────────────────

export interface VoltajePunta {
  id:        string;
  nombre:    string;
  volts:     number;
  /** De qué fuente sale ese número. */
  fuente:    string;
}

/**
 * Voltaje mínimo en el punto más lejano del alambrado.
 *
 * NRCS TX-382, §I.A.6: *«Joule rating high enough to provide a minimum shock at
 * the farthest point as follows: Cattle — 1600 volts; Sheep and hair goats —
 * 2000 volts; Horses, hogs and meat goats — 1200 volts.»*
 *
 * Los otros dos publicados son más exigentes y están acá para que se vea la
 * dispersión, que es real: Virginia pide *«ideally 5,000 volts for cattle and
 * 7,000 for sheep»* **sobre el alambre**, que no es lo mismo que en la punta, y
 * Ontario da bandas por especie. Cuando hay que elegir uno, acequia usa el de la
 * especificación de obra, que es el único redactado como requisito.
 */
export const VOLTAJE_PUNTA: readonly VoltajePunta[] = [
  { id: 'vacunos',        nombre: 'Vacunos',                              volts: 1600, fuente: FUENTE_NRCS_382 },
  { id: 'ovinos',         nombre: 'Ovinos y caprinos de pelo',            volts: 2000, fuente: FUENTE_NRCS_382 },
  { id: 'equinos',        nombre: 'Equinos, porcinos y caprinos de carne', volts: 1200, fuente: FUENTE_NRCS_382 },
];

export function voltajePunta(id: string): VoltajePunta {
  return VOLTAJE_PUNTA.find(v => v.id === id) ?? VOLTAJE_PUNTA[0]!;
}

/**
 * Salida mínima del equipo.
 *
 * NRCS TX-382: *«energizers should contain high voltage/low impedance short
 * pulse which can produce at least 4000 volts output, with all livestock
 * containment fences charged (on) when under maximum anticipated load»*, y más
 * abajo pide *«a 5,000 volt peak output and a pulse that is less than 300»*
 * microsegundos. Kurtz y Frey piden lo mismo: *«a low-impedance energizer with a
 * minimum 5,000-volt output»*.
 */
export const SALIDA_MIN_BAJO_CARGA_V = 4000;
export const SALIDA_MIN_PICO_V = 5000;
/** Aislador: NRCS TX-382 §I.B.3, «capable of withstanding a minimum of 10,000 volts». */
export const AISLADOR_MIN_V = 10000;

// ─── El alambre: resistencia por calibre ──────────────────────────────────────

export interface AlambreElectrico {
  id:        string;
  nombre:    string;
  /** Resistencia por km de un solo hilo (ohm/km). */
  ohm_km:    number;
  /** `true` si la fuente lo recomienda para alambrado permanente. */
  permanente: boolean;
  nota:      string;
}

/**
 * Resistencia del conductor, de la tabla de Kurtz y Frey (2005), pasada de
 * ohm/milla a ohm/km.
 *
 * La tabla publicada es: calibre 8 → 22,5 ohm/milla; 10 → 35,4; 12,5 → 56,4;
 * 14 → 87,0; 16 → 136,9. El texto la cierra con una frase que sirve de control
 * de cordura sobre la transcripción: *«16-gauge wire is 2.5 times as resistant
 * to current movement as 12.5-gauge wire»* — y 136,9 / 56,4 = 2,43. Si la
 * transcripción estuviera corrida una fila, esa división no daría 2,5.
 *
 * Y los dos valores que cambian el diseño: *«Six-strand polywire has a
 * resistance of 9,700 ohms per mile, and three-strand polywire has a resistance
 * of 16,000 ohms per mile.»*
 */
export const ALAMBRES: readonly AlambreElectrico[] = [
  { id: 'cal8',       nombre: 'Acero alta resistencia, calibre 8',   ohm_km: 22.5 / 1.609344,    permanente: true,
    nota: 'El de menor resistencia de la tabla. Se usa en tiradas largas o como conductor de bajada.' },
  { id: 'cal10',      nombre: 'Acero alta resistencia, calibre 10',  ohm_km: 35.4 / 1.609344,    permanente: true,
    nota: 'Intermedio.' },
  { id: 'cal12_5',    nombre: 'Acero alta resistencia, calibre 12,5', ohm_km: 56.4 / 1.609344,   permanente: true,
    nota: 'El que la fuente recomienda para alambrado permanente y semipermanente, con galvanizado tipo III. Es la referencia contra la que se comparan los demás.' },
  { id: 'cal14',      nombre: 'Acero alta resistencia, calibre 14',  ohm_km: 87.0 / 1.609344,    permanente: false,
    nota: 'Más fino que lo recomendado: en tiradas largas puede obligar a un equipo más grande.' },
  { id: 'cal16',      nombre: 'Acero alta resistencia, calibre 16',  ohm_km: 136.9 / 1.609344,   permanente: false,
    nota: '2,4 veces más resistente que el de 12,5. La fuente lo nombra justamente para mostrar lo que se paga por ahorrar en el alambre.' },
  { id: 'poly6',      nombre: 'Polihilo de 6 conductores',           ohm_km: 9700 / 1.609344,    permanente: false,
    nota: 'Alambrado temporario. Sirve para dividir una parcela, no para una tirada larga.' },
  { id: 'poly3',      nombre: 'Polihilo de 3 conductores',           ohm_km: 16000 / 1.609344,   permanente: false,
    nota: 'El más resistivo de todos: casi 300 veces el de 12,5. Para tramos cortos y nada más.' },
];

export function alambre(id: string): AlambreElectrico {
  return ALAMBRES.find(a => a.id === id) ?? ALAMBRES[2]!;
}

/** El alambre de referencia de la fuente, contra el que se comparan los demás. */
export const ALAMBRE_REFERENCIA = 'cal12_5';

export interface DiagnosticoConductor {
  resistencia_ohm:   number;
  /** Cuántas veces más resistente que el calibre 12,5 recomendado. */
  veces_referencia:  number;
  /** Largo total de alambre energizado (m), que es hilos × largo del cerco. */
  alambre_total_m:   number;
  advertencias:      string[];
}

/**
 * Resistencia del circuito del alambrado.
 *
 * Los hilos unidos en las dos puntas trabajan **en paralelo**, que es el punto
 * de Virginia: `R = (ohm/km × km de recorrido) / hilos`. Si no están unidos, cada
 * hilo es un circuito suelto y la resistencia es la de uno solo; `unidos` dice
 * cuál de los dos casos es, porque es una decisión de obra que cuesta dos grampas
 * y cambia el resultado por un factor igual a la cantidad de hilos.
 */
export function diagnosticoConductor(p: {
  largo_cerco_m: number; hilos: number; alambre_id?: string; unidos?: boolean;
}): DiagnosticoConductor {
  const a = alambre(p.alambre_id ?? ALAMBRE_REFERENCIA);
  const ref = alambre(ALAMBRE_REFERENCIA);
  const hilos = Math.max(1, Math.round(p.hilos));
  const km = Math.max(0, p.largo_cerco_m) / 1000;
  const unidos = p.unidos ?? true;

  const resistencia_ohm = unidos ? (a.ohm_km * km) / hilos : a.ohm_km * km;
  const advertencias: string[] = [];

  if (!a.permanente && p.largo_cerco_m > 0) {
    advertencias.push(`${a.nombre}: ${a.nota}`);
  }
  if (!unidos && hilos > 1) {
    advertencias.push(`Los ${hilos} hilos no están unidos en las puntas, así que no trabajan en paralelo: unirlos divide la resistencia por ${hilos} y no cuesta nada.`);
  }
  if (a.ohm_km > ref.ohm_km * 10 && km > 1) {
    advertencias.push(`${Math.round(a.ohm_km / ref.ohm_km)} veces la resistencia del calibre 12,5 en una tirada de ${km.toFixed(1)} km: la fuente dice textualmente que no hay que depender del polihilo en tiradas largas.`);
  }

  return {
    resistencia_ohm,
    veces_referencia: a.ohm_km / ref.ohm_km,
    alambre_total_m: hilos * Math.max(0, p.largo_cerco_m),
    advertencias,
  };
}

// ─── Los joules ───────────────────────────────────────────────────────────────

export type CargaVegetacion = 'limpio' | 'media' | 'pesada';

export interface BandaVegetacion {
  id:            CargaVegetacion;
  nombre:        string;
  /** Millas de alambre que mantiene un joule de salida. */
  millas_por_joule: number;
  textual:       string;
}

/**
 * Las bandas de Ontario (2018), en millas de alambre por joule de salida.
 *
 * *«if you have a one- or two-strand fence that is free from weeds, tall grass,
 * and branches touching it, you might get 3-6 miles/joule»* y, con el alambre
 * cargado de vegetación, *«you might only get 1 mile/joule»*. El valor
 * intermedio es el piso de la banda limpia, que es lo que la fuente publica; no
 * hay un cuarto número inventado en el medio.
 */
export const BANDAS_VEGETACION: readonly BandaVegetacion[] = [
  { id: 'limpio', nombre: 'Alambre limpio, sin pasto tocando', millas_por_joule: 6,
    textual: '«you might get 3-6 miles/joule»' },
  { id: 'media',  nombre: 'Algo de pasto en la base',          millas_por_joule: 3,
    textual: 'el piso de la banda limpia de la fuente' },
  { id: 'pesada', nombre: 'Pasto y ramas sobre el alambre',    millas_por_joule: 1,
    textual: '«you might only get 1 mile/joule»' },
];

export function bandaVegetacion(id: CargaVegetacion): BandaVegetacion {
  return BANDAS_VEGETACION.find(b => b.id === id) ?? BANDAS_VEGETACION[1]!;
}

export interface JoulesNecesarios {
  /** Cota de Virginia: un joule por milla de CERCO, los hilos no suman. */
  cota_cerco_j:   number;
  /** Cota de Ontario: millas de ALAMBRE divididas por la banda de vegetación. */
  cota_alambre_j: number;
  /** El que hay que comprar: el mayor de los dos. */
  recomendado_j:  number;
  /** Cuál de las dos cotas gobierna. */
  manda:          'cerco' | 'alambre';
  banda:          BandaVegetacion;
  explicacion:    string;
}

/**
 * Joules de salida que pide el alambrado, por las dos lecturas publicadas.
 *
 * Virginia: *«A good guideline is probably one output joule per mile of fence»*.
 * Ontario: millas de alambre —hilos × recorrido— sobre las millas por joule que
 * aguanta la vegetación.
 *
 * Es «joules de salida», no «joules almacenados», y la diferencia no es menor:
 * *«Stored joules indicate the energy stored in the energizer's capacitor before
 * discharge into the transformer. The energy delivered by the transformer is
 * measured as output joules, and it will always be less than stored joules.»*
 * Los equipos se publicitan con el número grande.
 */
export function joulesNecesarios(p: {
  largo_cerco_m: number; hilos: number; vegetacion?: CargaVegetacion;
}): JoulesNecesarios {
  const banda = bandaVegetacion(p.vegetacion ?? 'media');
  const hilos = Math.max(1, Math.round(p.hilos));
  const millas_cerco   = Math.max(0, p.largo_cerco_m) / MILLA_M;
  const millas_alambre = millas_cerco * hilos;

  const cota_cerco_j   = millas_cerco;
  const cota_alambre_j = millas_alambre / banda.millas_por_joule;
  // Empate a 'cerco': con un solo hilo y carga pesada las dos cotas dan lo
  // mismo, y ahí no es la cantidad de hilos lo que gobierna.
  const manda: 'cerco' | 'alambre' = cota_alambre_j > cota_cerco_j ? 'alambre' : 'cerco';
  const recomendado_j  = Math.max(cota_cerco_j, cota_alambre_j);

  const explicacion = manda === 'alambre'
    ? `Manda la fuga: con ${hilos} ${hilos === 1 ? 'hilo' : 'hilos'} y ${banda.nombre.toLowerCase()}, el alambre energizado son ${millas_alambre.toFixed(1)} millas y la banda publicada da ${banda.millas_por_joule} milla${banda.millas_por_joule === 1 ? '' : 's'} por joule.`
    : `Manda el recorrido: con el alambre limpio los hilos unidos no suman carga, así que gobierna la regla de un joule por milla de cerco.`;

  return { cota_cerco_j, cota_alambre_j, recomendado_j, manda, banda, explicacion };
}

// ─── La puesta a tierra ───────────────────────────────────────────────────────

/** NRCS TX-382 §I.B: mínimo tres varillas galvanizadas de 1/2" y 6 pies. */
export const VARILLAS_MINIMO = 3;
export const VARILLA_LARGO_M = 6 * PIE_M;            // 1,83 m
export const VARILLA_SEPARACION_M = 10 * PIE_M;      // 3,05 m
/** «A rule of thumb is to drive at least three feet of rod into the ground per joule of output» (Kurtz y Frey 2005). */
export const VARILLA_M_POR_JOULE = 3 * PIE_M;        // 0,91 m
/** Distancia a cualquier otra puesta a tierra: 65 pies (Kurtz y Frey; TX-382). */
export const DISTANCIA_OTRA_TIERRA_M = 65 * PIE_M;   // 19,8 m
/** Tolerancia del ensayo: la última varilla tendría que leer 0 y se tolera hasta 300 V. */
export const TIERRA_TOLERANCIA_V = 300;

export interface PuestaATierra {
  metros_varilla:   number;
  varillas:         number;
  largo_varilla_m:  number;
  separacion_m:     number;
  distancia_otra_tierra_m: number;
  /** Qué criterio fijó el total: el mínimo de obra o la regla por joule. */
  manda:            'minimo' | 'por_joule';
  ensayo:           string;
  advertencias:     string[];
}

/**
 * Cuánta varilla de puesta a tierra pide el equipo.
 *
 * Es la parte que nadie calcula y la que más alambrados eléctricos arruina: el
 * circuito se cierra por el suelo, y si el suelo no conduce el animal no siente
 * nada aunque el voltímetro en el alambre marque bien. TX-382 pone el piso —tres
 * varillas de 6 pies separadas 10— y Kurtz y Frey dan la regla que escala con el
 * equipo: al menos 3 pies de varilla por joule de salida. TX-382 la repite para
 * equipos de 14 joules o más.
 *
 * El ensayo es de ellos y es la única verificación publicada que existe: *«300
 * feet from the charger, ground out the fence to 2,000 volts or less… check the
 * voltage on the last ground rod in the system. The reading on the last ground
 * rod should be zero, but most chargers can tolerate up to 300 volts. If the
 * voltage is more than 300, add additional ground rods.»*
 */
export function puestaATierra(joules_salida: number): PuestaATierra {
  const porMinimo  = VARILLAS_MINIMO * VARILLA_LARGO_M;
  const porJoule   = Math.max(0, joules_salida) * VARILLA_M_POR_JOULE;
  const manda: 'minimo' | 'por_joule' = porJoule > porMinimo ? 'por_joule' : 'minimo';
  const metros_varilla = Math.max(porMinimo, porJoule);
  const varillas = Math.max(VARILLAS_MINIMO, Math.ceil(metros_varilla / VARILLA_LARGO_M));

  const advertencias: string[] = [
    'No mezclar metales en el sistema de tierra: el par galvanizado-cobre se come las conexiones por electrólisis. La fuente pide el mismo metal en todo el circuito.',
  ];
  if (manda === 'por_joule') {
    advertencias.push(`El equipo de ${joules_salida.toFixed(1)} J pide ${metros_varilla.toFixed(1)} m de varilla por la regla de 3 pies por joule, bastante más que el mínimo de tres varillas.`);
  }

  return {
    metros_varilla, varillas,
    largo_varilla_m: VARILLA_LARGO_M,
    separacion_m: VARILLA_SEPARACION_M,
    distancia_otra_tierra_m: DISTANCIA_OTRA_TIERRA_M,
    manda,
    ensayo: `A 90 m del equipo, poner el alambre a tierra hasta que baje a 2.000 V o menos y medir la última varilla: tendría que dar 0 y se tolera hasta ${TIERRA_TOLERANCIA_V} V. Si da más, se agregan varillas.`,
    advertencias,
  };
}

// ─── Todo junto ───────────────────────────────────────────────────────────────

export interface ResultadoElectrificador {
  joules:     JoulesNecesarios;
  tierra:     PuestaATierra;
  conductor:  DiagnosticoConductor;
  /** Voltaje que hay que ir a medir en la punta del alambrado. */
  objetivo:   VoltajePunta;
  salida_min_bajo_carga_v: number;
  /** Lo que la cuenta NO decide, dicho en una línea. */
  a_medir:    string;
  avisos:     string[];
}

/**
 * El electrificador completo: energía, tierra, conductor y el voltaje a medir.
 *
 * Los tres criterios se reportan por separado a propósito, porque se corrigen
 * con tres compras distintas: el equipo, las varillas y el alambre. El que falla
 * no se arregla con el de al lado.
 */
export function dimensionarElectrificador(p: {
  largo_cerco_m: number;
  hilos:         number;
  vegetacion?:   CargaVegetacion;
  alambre_id?:   string;
  unidos?:       boolean;
  animal_id?:    string;
}): ResultadoElectrificador {
  const joules    = joulesNecesarios(p);
  const tierra    = puestaATierra(joules.recomendado_j);
  const conductor = diagnosticoConductor(p);
  const objetivo  = voltajePunta(p.animal_id ?? 'vacunos');

  const avisos: string[] = [];
  if (joules.recomendado_j > 0 && joules.recomendado_j < 1) {
    avisos.push('El alambrado es corto: cualquier equipo del mercado alcanza en energía, así que lo que decide es la puesta a tierra.');
  }
  if (p.hilos >= 3 && (p.vegetacion ?? 'media') === 'pesada') {
    avisos.push('Con varios hilos y vegetación encima, la fuente menciona que algunos productores desconectan los hilos de abajo en la temporada de más pasto en vez de comprar más equipo.');
  }
  avisos.push(...conductor.advertencias);
  avisos.push(...tierra.advertencias);

  return {
    joules, tierra, conductor, objetivo,
    salida_min_bajo_carga_v: SALIDA_MIN_BAJO_CARGA_V,
    a_medir: `Los joules son una estimación: nadie publica la fuga de un aislador ni de un metro de pasto mojado. Lo que está publicado es cuánto voltaje tiene que haber en la punta —${objetivo.volts.toLocaleString('es-AR')} V para ${objetivo.nombre.toLowerCase()}— y eso se mide, no se calcula.`,
    avisos,
  };
}
