/**
 * Genera `apps/terreno/lib/censoIndigena2020Mx.ts` desde el ITER del Censo 2020
 * congelado en `iter-mexico/iter-municipios.csv`.
 *
 *   node _research/pueblos-originarios-paises/build-censo-mexico.mjs
 *
 * Como los de Paraguay, Perú y Brasil: **no escribe nada si un total no
 * cierra.** Acá la verificación es más fuerte que en los otros tres, porque el
 * insumo trae las dos escalas y entonces se puede sumar dos veces por caminos
 * independientes: los 2.469 municipios tienen que dar la fila de su entidad, y
 * las 32 entidades tienen que dar el país. Las dos sumas dan 7.364.645
 * hablantes de lengua indígena.
 *
 * ── Qué se monta y qué no ───────────────────────────────────────────────────
 *
 * Se monta **hablantes de lengua indígena**, que es un conteo del cuestionario
 * básico: se le preguntó a toda la población, no a una muestra, y existe hasta
 * el municipio. No se monta la **autoadscripción** —las «23,2 millones» de
 * personas que se consideran indígenas—, y no por olvido: sale del cuestionario
 * ampliado, que es muestra, y el INEGI la publica redondeada. Un número
 * redondeado no se puede repartir por municipio sin inventar. La diferencia
 * entre las dos cifras es el dato más importante de este archivo y va escrita en
 * la pantalla.
 *
 * ── La licencia, que es la razón por la que esto se puede montar ────────────
 *
 * El archivo de metadatos de cada entidad del ITER declara
 * `license: https://www.inegi.org.mx/inegi/terminos.html`, y esos términos
 * dicen, textual: «Puede explotar comercialmente la información, utilizándola
 * como insumo para generar otros productos o servicios». No hace falta pedir
 * permiso. Sí hay dos obligaciones, y las dos son de la pantalla y no de este
 * script: acreditar al INEGI con la fórmula que ellos piden, y **avisarle al
 * usuario final de cualquier transformación** que se le haga a la información.
 * La suma de municipio a entidad y a país es una transformación nuestra, así que
 * la pantalla lo dice.
 *
 * ── Los cuatro municipios que no se pueden nombrar sin ambigüedad ───────────
 *
 * Oaxaca tiene dos «San Juan Mixtepec» y dos «San Pedro Mixtepec»: el ITER
 * escribe el nombre sin el distrito que los distingue. No es un detalle
 * cosmético. Los dos San Pedro Mixtepec son 1.849 hablantes sobre 47.023
 * personas (3,9 %) y 884 sobre 935 (94,5 %): acertar el equivocado es errarle
 * por veinticuatro veces. `casarNombre` no contesta cuando hay empate, así que
 * el punto cae en la respuesta de la entidad, que es más gruesa y es verdadera.
 * El script emite la lista para que la pantalla lo pueda decir y el test lo
 * pueda fijar.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ENTRADA = join(AQUI, 'iter-mexico', 'iter-municipios.csv');
const SALIDA = join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2020Mx.ts');

/**
 * Las cinco sumas nacionales que tienen que dar.
 *
 * `HABLANTES` es la cifra que el INEGI publica como resultado nacional del
 * Censo 2020 y la que llegó por el relevamiento; que la suma de los 2.469
 * municipios del ITER caiga exactamente ahí es la verificación que habilita todo
 * lo demás. `POBLACION` es la población total del censo. Las otras tres son
 * nuestra propia suma, congeladas acá para que un cambio en el insumo no pase
 * inadvertido.
 */
const PAIS = {
  POBLACION: 126_014_024,
  TRES_Y_MAS: 119_976_584,
  HABLANTES: 7_364_645,
  MONOLINGUES: 865_972,
  AFRO: 2_576_213,
};

const ENTIDADES = 32;
const MUNICIPIOS = 2469;

function morir(msg) {
  console.error('ABORTA: ' + msg);
  process.exit(1);
}

function csvFilas(txt) {
  const filas = [];
  let campo = '', fila = [], enComillas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (enComillas) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else enComillas = false; }
      else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

// ── Leer el insumo congelado ────────────────────────────────────────────────

const filas = csvFilas(readFileSync(ENTRADA, 'utf8')).filter(f => f.length > 1);
const cab = filas[0];
const ix = {};
cab.forEach((c, i) => { ix[c] = i; });

function entero(f, col, donde) {
  const v = f[ix[col]];
  if (!/^\d+$/.test(v)) morir(`${donde}: ${col} no es un entero: ${JSON.stringify(v)}`);
  return Number(v);
}

/** Las cinco magnitudes de una fila, con los nombres que usa el TypeScript. */
function magnitudes(f, donde) {
  return {
    hablantes: entero(f, 'P3YM_HLI', donde),
    monolingues: entero(f, 'P3HLINHE', donde),
    tresYMas: entero(f, 'P_3YMAS', donde),
    poblacion: entero(f, 'POBTOT', donde),
    afro: entero(f, 'POB_AFRO', donde),
  };
}

const MAGS = ['hablantes', 'monolingues', 'tresYMas', 'poblacion', 'afro'];

const entidades = new Map();   // clave de 2 dígitos → { clave, entidad, ...mags, municipios: [] }
const totalesITER = new Map(); // clave de 2 dígitos → las mags de la fila de total del ITER

for (const f of filas.slice(1)) {
  const ent = f[ix['ENTIDAD']];
  const mun = f[ix['MUN']];
  const nomEnt = f[ix['NOM_ENT']];
  const nomMun = f[ix['NOM_MUN']];
  if (!/^\d{2}$/.test(ent) || !/^\d{3}$/.test(mun)) morir('clave rara: ' + ent + '/' + mun);

  if (mun === '000') {
    if (totalesITER.has(ent)) morir('dos filas de total para la entidad ' + ent);
    totalesITER.set(ent, magnitudes(f, 'entidad ' + ent));
    entidades.set(ent, { clave: ent, entidad: nomEnt, municipios: [] });
    continue;
  }

  const e = entidades.get(ent);
  if (!e) morir('el municipio ' + ent + mun + ' aparece antes que el total de su entidad');
  const m = { clave: ent + mun, municipio: nomMun, ...magnitudes(f, 'municipio ' + ent + mun) };

  // Invariantes de contención. No son adorno: si el archivo cambiara y los
  // monolingües pasaran a contarse sobre otro universo, la pantalla diría «de
  // los N hablantes, M no hablan español» con M mayor que N.
  if (m.monolingues > m.hablantes) morir(`${m.clave}: más monolingües (${m.monolingues}) que hablantes (${m.hablantes})`);
  if (m.hablantes > m.tresYMas) morir(`${m.clave}: más hablantes que población de 3 años y más`);
  if (m.tresYMas > m.poblacion) morir(`${m.clave}: más población de 3 años y más que población total`);

  e.municipios.push(m);
}

if (entidades.size !== ENTIDADES) morir('se esperaban ' + ENTIDADES + ' entidades y hay ' + entidades.size);

// ── Primera suma: los municipios contra la fila de su entidad ───────────────

let municipios = 0;
for (const [clave, e] of entidades) {
  const esperado = totalesITER.get(clave);
  for (const k of MAGS) {
    const suma = e.municipios.reduce((t, m) => t + m[k], 0);
    if (suma !== esperado[k]) {
      morir(`${e.entidad}: los municipios suman ${suma} en ${k} y la fila de la entidad dice ${esperado[k]}`);
    }
    e[k] = esperado[k];
  }
  municipios += e.municipios.length;
}

if (municipios !== MUNICIPIOS) morir('se esperaban ' + MUNICIPIOS + ' municipios y hay ' + municipios);

// ── Segunda suma: las entidades contra el país ──────────────────────────────

const lista = [...entidades.values()].sort((a, b) => a.clave.localeCompare(b.clave));
const pais = {};
for (const k of MAGS) pais[k] = lista.reduce((t, e) => t + e[k], 0);

const ESPERADO_PAIS = {
  hablantes: PAIS.HABLANTES, monolingues: PAIS.MONOLINGUES,
  tresYMas: PAIS.TRES_Y_MAS, poblacion: PAIS.POBLACION, afro: PAIS.AFRO,
};
for (const k of MAGS) {
  if (pais[k] !== ESPERADO_PAIS[k]) morir(`el país suma ${pais[k]} en ${k} y tendría que dar ${ESPERADO_PAIS[k]}`);
}

// Y la tercera, por si acaso: los 2.469 municipios directo al país, sin pasar
// por la entidad. Es el mismo número por otro camino.
for (const k of MAGS) {
  const directo = lista.reduce((t, e) => t + e.municipios.reduce((s, m) => s + m[k], 0), 0);
  if (directo !== ESPERADO_PAIS[k]) morir(`la suma directa de municipios da ${directo} en ${k}`);
}

// ── Claves únicas y nombres ambiguos ───────────────────────────────────────

const vistas = new Set();
for (const e of lista) for (const m of e.municipios) {
  if (vistas.has(m.clave)) morir('clave repetida: ' + m.clave);
  vistas.add(m.clave);
}

/** Los nombres que se repiten DENTRO de una misma entidad: ver el encabezado. */
const ambiguos = [];
for (const e of lista) {
  const porNombre = new Map();
  for (const m of e.municipios) {
    if (!porNombre.has(m.municipio)) porNombre.set(m.municipio, []);
    porNombre.get(m.municipio).push(m.clave);
  }
  for (const [nombre, claves] of porNombre) {
    if (claves.length > 1) ambiguos.push({ entidad: e.entidad, nombre, claves });
  }
}

const sinHablantes = lista.reduce((t, e) => t + e.municipios.filter(m => m.hablantes === 0).length, 0);

// ── Escribir el TypeScript ─────────────────────────────────────────────────

const q = (s) => JSON.stringify(s);

const cuerpo = lista.map(e => {
  const muni = e.municipios
    .map(m => `    { clave: ${q(m.clave)}, municipio: ${q(m.municipio)}, hablantes: ${m.hablantes}, monolingues: ${m.monolingues}, tresYMas: ${m.tresYMas}, poblacion: ${m.poblacion}, afro: ${m.afro} },`)
    .join('\n');
  return `  {
    clave: ${q(e.clave)}, entidad: ${q(e.entidad)},
    hablantes: ${e.hablantes}, monolingues: ${e.monolingues}, tresYMas: ${e.tresYMas}, poblacion: ${e.poblacion}, afro: ${e.afro},
    municipios: [
${muni}
    ],
  },`;
}).join('\n');

const ts = `/**
 * GENERADO. No editar a mano: sale de
 * \`_research/pueblos-originarios-paises/build-censo-mexico.mjs\`, que lee el ITER
 * congelado al lado suyo y no escribe nada si una suma no cierra.
 *
 * Censo de Población y Vivienda 2020 (INEGI de México), «Principales resultados
 * por localidad» (ITER). Fecha de referencia del censo: 15 de marzo de 2020.
 *
 * **La licencia del INEGI permite todo esto sin pedir permiso.** El archivo de
 * metadatos del ITER declara como licencia los «Términos de Libre Uso de la
 * Información del INEGI», que dicen textual: «Puede explotar comercialmente la
 * información, utilizándola como insumo para generar otros productos o
 * servicios». México es, junto con Guatemala y Canadá, uno de los tres países de
 * esta capa que entra con el dato local y sin carta de nadie.
 *
 * Los términos traen dos obligaciones que son de la pantalla y no de los datos:
 * acreditar al INEGI con su fórmula —«Fuente: INEGI, nombre del producto»— y
 * **avisarle al usuario final de cualquier transformación** que se le haga a la
 * información. La única transformación acá es sumar: de municipio a entidad y de
 * entidad a país. La pantalla lo dice.
 *
 * ── Qué cuenta este número, que no es «población indígena» ──────────────────
 *
 * Cuenta **hablantes de lengua indígena de 3 años y más**: 7.364.645 personas.
 * Es el cuestionario básico, o sea toda la población y no una muestra, y por eso
 * existe hasta el municipio.
 *
 * El censo mexicano mide además la **autoadscripción**, con otra pregunta y en
 * el cuestionario ampliado, que es muestra: da alrededor de **23,2 millones**, y
 * el INEGI la publica redondeada. Son tres veces más personas. Esa cifra no está
 * en esta tabla porque una estimación muestral redondeada no se puede repartir
 * por municipio sin inventar, y tampoco se le resta nada: restarle 7.364.645 a
 * un número redondeado daría una precisión que no existe.
 *
 * Así que lo que dice esta capa en México es más angosto que en Brasil o en
 * Chile, donde el censo pregunta por identidad. Acá pregunta por lengua. Quien
 * no habla la lengua de su pueblo no está contado, y en México eso es la
 * mayoría. Va escrito en el panel y en el informe, no sólo acá.
 *
 * ── La clave es texto y no número ───────────────────────────────────────────
 *
 * La clave del INEGI tiene ceros a la izquierda —Aguascalientes es la entidad
 * \`'01'\` y su capital el municipio \`'01001'\`—, así que guardarla como número
 * perdería el cero y dejaría de casar con cualquier otra tabla del INEGI.
 *
 * ── Cero no es lo mismo que nada ────────────────────────────────────────────
 *
 * ${sinHablantes} de los ${MUNICIPIOS} municipios no tienen ningún hablante. Es una respuesta
 * del censo, no un hueco del dato: dice que en 2020 nadie declaró hablar una
 * lengua indígena ahí, y no dice que no haya pueblos originarios.
 */

/** Un municipio mexicano, con lo que el ITER trae de él. */
export interface CensoMxMunicipio {
  /** Clave del INEGI de 5 dígitos: 2 de entidad + 3 de municipio. Texto. */
  clave: string;
  municipio: string;
  /** Población de 3 años y más que habla alguna lengua indígena. */
  hablantes: number;
  /** De esos hablantes, los que además **no** hablan español. */
  monolingues: number;
  /** Población de 3 años y más: el denominador que le corresponde a \`hablantes\`. */
  tresYMas: number;
  /** Población total del municipio. No es el denominador de \`hablantes\`. */
  poblacion: number;
  /**
   * Población que se considera afromexicana o afrodescendiente.
   *
   * **No es población indígena y no se suma con \`hablantes\`.** Es otra pregunta
   * del censo y otra población; está acá porque viene en la misma fila y dejarla
   * afuera sería descartar un dato de la fuente, pero se muestra aparte y
   * rotulada. Es la misma regla que en Nicaragua, donde el total del censo
   * incluye Creole y por eso no se publica un porcentaje «indígena».
   */
  afro: number;
}

/** Una entidad federativa: 31 estados y la Ciudad de México. */
export interface CensoMxEntidad {
  /** Clave del INEGI de 2 dígitos, como texto. */
  clave: string;
  /** El nombre oficial, que a veces no es el de uso: «Michoacán de Ocampo». */
  entidad: string;
  hablantes: number;
  monolingues: number;
  tresYMas: number;
  poblacion: number;
  afro: number;
  municipios: CensoMxMunicipio[];
}

export const CENSO_MX: CensoMxEntidad[] = [
${cuerpo}
];

/** El país. Los cinco números son la suma de los ${MUNICIPIOS} municipios, verificada. */
export const CENSO_MX_PAIS = {
  hablantes: ${pais.hablantes},
  monolingues: ${pais.monolingues},
  tresYMas: ${pais.tresYMas},
  poblacion: ${pais.poblacion},
  afro: ${pais.afro},
  entidades: ${ENTIDADES},
  municipios: ${MUNICIPIOS},
  municipiosSinHablantes: ${sinHablantes},
  /** Fecha de referencia del censo, no de la publicación. */
  fechaCenso: '15 de marzo de 2020',
} as const;

/**
 * La autoadscripción, que el censo mide con otra pregunta y en otro cuestionario.
 *
 * Se guarda como texto a propósito: el INEGI la publica redondeada porque es una
 * estimación muestral, y escribirla como número invitaría a operar con ella.
 */
export const AUTOADSCRIPCION_MX = {
  aproximado: '23,2 millones',
  porQueNoEstaPorMunicipio:
    'sale del cuestionario ampliado, que es una muestra, y el INEGI la publica redondeada: ' +
    'repartir un número redondeado por municipio sería inventarlo',
} as const;

/**
 * Nombres de municipio que se repiten dentro de la misma entidad.
 *
 * El ITER los escribe igual porque omite el distrito que los distingue. Cuando
 * el geocodificador devuelve uno de estos nombres no hay forma de saber cuál es,
 * así que la respuesta baja a la entidad. Los dos San Pedro Mixtepec van del
 * 3,9 % al 94,5 % de hablantes: elegir mal no es un error chico.
 */
export const MUNICIPIOS_AMBIGUOS_MX: ReadonlyArray<{
  entidad: string; nombre: string; claves: readonly string[];
}> = [
${ambiguos.map(a => `  { entidad: ${q(a.entidad)}, nombre: ${q(a.nombre)}, claves: [${a.claves.map(q).join(', ')}] },`).join('\n')}
];
`;

writeFileSync(SALIDA, ts);
console.log(`${SALIDA}
${ENTIDADES} entidades, ${municipios} municipios.
hablantes ${pais.hablantes.toLocaleString('es-AR')} · monolingües ${pais.monolingues.toLocaleString('es-AR')} · 3 y más ${pais.tresYMas.toLocaleString('es-AR')} · población ${pais.poblacion.toLocaleString('es-AR')} · afromexicana ${pais.afro.toLocaleString('es-AR')}
${sinHablantes} municipios sin hablantes · ${ambiguos.length} nombres ambiguos: ${ambiguos.map(a => a.nombre).join(', ')}`);
