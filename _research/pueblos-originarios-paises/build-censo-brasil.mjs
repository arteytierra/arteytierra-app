/**
 * Genera `apps/terreno/lib/censoIndigena2022Br.ts` desde los cinco JSON de la
 * API SIDRA congelados en `sidra-brasil/`.
 *
 * Como los de Paraguay y Perú: no escribe nada si un total no cierra. El
 * criterio es que la tabla montada tiene que reproducir exactamente los dos
 * números que el IBGE publica como oficiales —1.694.836 indígenas sobre
 * 203.080.756 habitantes— sumando desde abajo, por estado y por municipio.
 *
 *   node _research/pueblos-originarios-paises/build-censo-brasil.mjs
 *
 * ── Cómo se bajaron los insumos ──────────────────────────────────────────────
 *
 *   t9718.json      /values/t/9718/n1/all/v/350/p/all/c1714/all/c2661/32776
 *   t9718_uf.json   idem con n3 (los 27 estados, los cuatro quesitos)
 *   t9718_mun.json  idem con n6 y c1714/60024 (sólo el Total, 5.570 municipios)
 *   pob_uf.json     /values/t/4709/n3/all/v/93/p/last 1
 *   pob_mun.json    idem con n6
 *
 * ── La trampa del guion ──────────────────────────────────────────────────────
 *
 * SIDRA escribe `-` donde el valor es **cero verdadero**, no donde falta el
 * dato (para eso usa `..` y `...`). Son 737 municipios sin ninguna persona
 * indígena. Leerlos como "sin dato" y saltearlos habría hecho que la suma no
 * cerrara; leerlos como cero es lo correcto y hace que cierre exacto. El script
 * distingue los tres símbolos y aborta si aparece uno de los de dato faltante.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SIDRA = join(AQUI, 'sidra-brasil');
const SALIDA = join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2022Br.ts');

const IND_PAIS = 1_694_836;
const POB_PAIS = 203_080_756;

function morir(msg) {
  console.error('ABORTA: ' + msg);
  process.exit(1);
}

function leer(nombre) {
  const filas = JSON.parse(readFileSync(join(SIDRA, nombre), 'utf8'));
  return filas.slice(1); // la fila 0 son los rótulos de las columnas
}

/** El valor de una celda de SIDRA, distinguiendo cero de dato faltante. */
function valor(v, donde) {
  if (v === '-') return 0;              // cero verdadero
  if (v === '..' || v === '...' || v === 'X') morir('dato no disponible en ' + donde + ': "' + v + '"');
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) morir('valor raro en ' + donde + ': "' + v + '"');
  return n;
}

// ── Nacional ─────────────────────────────────────────────────────────────────

const nacional = {};
for (const r of leer('t9718.json')) nacional[r.D4N] = valor(r.V, 'nacional/' + r.D4N);

if (nacional['Total'] !== IND_PAIS) morir('el total nacional no es ' + IND_PAIS);
const suma2 = nacional['Cor ou raça indígena'] + nacional['Se considera indígena'];
if (suma2 !== IND_PAIS) morir('los dos quesitos no suman el total: ' + suma2);

// ── Estados ──────────────────────────────────────────────────────────────────

/** "Alta Floresta D'Oeste - RO" → ["Alta Floresta D'Oeste", "RO"] */
function partirNombre(s) {
  const i = s.lastIndexOf(' - ');
  if (i < 0) morir('nombre de municipio sin sigla: ' + s);
  return [s.slice(0, i), s.slice(i + 3)];
}

const estados = new Map(); // código UF → registro
for (const r of leer('t9718_uf.json')) {
  const cod = Number(r.D1C);
  if (!estados.has(cod)) {
    estados.set(cod, { codigo: cod, estado: r.D1N, sigla: null, indigena: 0, corRaca: 0, seConsidera: 0, poblacion: 0, municipios: [] });
  }
  const e = estados.get(cod);
  const v = valor(r.V, 'uf ' + r.D1N + '/' + r.D4N);
  if (r.D4N === 'Total') e.indigena = v;
  if (r.D4N === 'Cor ou raça indígena') e.corRaca = v;
  if (r.D4N === 'Se considera indígena') e.seConsidera = v;
}
if (estados.size !== 27) morir('esperaba 27 estados, encontré ' + estados.size);

for (const r of leer('pob_uf.json')) {
  const e = estados.get(Number(r.D1C));
  if (!e) morir('población de un estado que no está en el censo indígena: ' + r.D1N);
  e.poblacion = valor(r.V, 'población uf ' + r.D1N);
}

// ── Municipios ───────────────────────────────────────────────────────────────

const municipios = new Map(); // código → registro
for (const r of leer('t9718_mun.json')) {
  const cod = Number(r.D1C);
  const [nombre, sigla] = partirNombre(r.D1N);
  municipios.set(cod, { codigo: cod, municipio: nombre, sigla, indigena: valor(r.V, 'mun ' + r.D1N), poblacion: 0 });
}
if (municipios.size !== 5570) morir('esperaba 5.570 municipios, encontré ' + municipios.size);

for (const r of leer('pob_mun.json')) {
  const m = municipios.get(Number(r.D1C));
  if (!m) morir('población de un municipio ausente del censo indígena: ' + r.D1N);
  m.poblacion = valor(r.V, 'población mun ' + r.D1N);
}
for (const m of municipios.values()) {
  if (m.poblacion === 0) morir('municipio sin población: ' + m.municipio);
  if (m.indigena > m.poblacion) morir('más indígenas que habitantes en ' + m.municipio);
}

// Colgar cada municipio de su estado. Los dos primeros dígitos del código IBGE
// de 7 son el código de la unidad federativa; no hace falta otro cruce.
for (const m of municipios.values()) {
  const e = estados.get(Math.floor(m.codigo / 100_000));
  if (!e) morir('municipio sin estado: ' + m.municipio + ' (' + m.codigo + ')');
  if (e.sigla === null) e.sigla = m.sigla;
  else if (e.sigla !== m.sigla) morir('dos siglas para el estado ' + e.estado + ': ' + e.sigla + ' y ' + m.sigla);
  e.municipios.push(m);
}

// ── Los cierres, que son el punto del script ─────────────────────────────────

const sumaEstadosInd = [...estados.values()].reduce((a, e) => a + e.indigena, 0);
const sumaEstadosPob = [...estados.values()].reduce((a, e) => a + e.poblacion, 0);
if (sumaEstadosInd !== IND_PAIS) morir('los estados suman ' + sumaEstadosInd + ' indígenas, no ' + IND_PAIS);
if (sumaEstadosPob !== POB_PAIS) morir('los estados suman ' + sumaEstadosPob + ' habitantes, no ' + POB_PAIS);

for (const e of estados.values()) {
  const i = e.municipios.reduce((a, m) => a + m.indigena, 0);
  const p = e.municipios.reduce((a, m) => a + m.poblacion, 0);
  if (i !== e.indigena) morir('en ' + e.estado + ' los municipios suman ' + i + ' indígenas y el estado dice ' + e.indigena);
  if (p !== e.poblacion) morir('en ' + e.estado + ' los municipios suman ' + p + ' habitantes y el estado dice ' + e.poblacion);
  if (e.corRaca + e.seConsidera !== e.indigena) morir('en ' + e.estado + ' los dos quesitos no suman el total');
}

console.log('cierra todo:');
console.log('  nacional      ' + IND_PAIS.toLocaleString('es-AR') + ' indígenas / ' + POB_PAIS.toLocaleString('es-AR') + ' habitantes');
console.log('  27 estados    suman exactamente lo mismo');
console.log('  5.570 municipios suman exactamente su estado, uno por uno');
console.log('  los quesitos "cor ou raça" y "se considera" suman el total en los 27');

// ── Escribir ─────────────────────────────────────────────────────────────────

const ordenados = [...estados.values()].sort((a, b) => a.codigo - b.codigo);
for (const e of ordenados) e.municipios.sort((a, b) => a.codigo - b.codigo);

const txt = (s) => JSON.stringify(s);

const filas = ordenados.map(e => {
  const muni = e.municipios
    .map(m => `    { codigo: ${m.codigo}, municipio: ${txt(m.municipio)}, indigena: ${m.indigena}, poblacion: ${m.poblacion} },`)
    .join('\n');
  return `  {
    codigo: ${e.codigo}, estado: ${txt(e.estado)}, sigla: ${txt(e.sigla)},
    indigena: ${e.indigena}, corRaca: ${e.corRaca}, seConsidera: ${e.seConsidera}, poblacion: ${e.poblacion},
    municipios: [
${muni}
    ],
  },`;
}).join('\n');

const cabecera = `/**
 * GENERADO. No editar a mano: sale de
 * \`_research/pueblos-originarios-paises/build-censo-brasil.mjs\`, que lee los
 * cinco JSON de la API SIDRA congelados al lado suyo y no escribe nada si un
 * total no cierra.
 *
 * Censo Demográfico 2022 (IBGE de Brasil). Los números son los de la API SIDRA,
 * tabla 9718 para la población indígena y tabla 4709 para la población
 * residente, que es el denominador.
 *
 * El IBGE no adjunta una licencia estándar a cada archivo, pero los resultados
 * del Censo se encuadran en su política de datos abiertos: se pueden usar
 * citando la fuente. Se usan citando al IBGE y al Censo Demográfico 2022.
 *
 * **El registro de FUNAI no está acá y no es un olvido.** Las tierras indígenas
 * y las aldeas las publica la FUNAI, no el IBGE, y el pie de su sitio es
 * CC BY-ND 3.0: «sin derivadas». Montar esa capa en la app es exactamente
 * hacer una obra derivada, así que queda afuera hasta que haya una autorización
 * escrita. Es el mismo motivo por el que Chile, Paraguay y Perú entran sólo con
 * el censo, y cada uno por una razón distinta.
 *
 * ── Tres cosas que hay que saber para leer estos números ────────────────────
 *
 *   1. **El total tiene dos componentes que el IBGE publica separados.** De los
 *      1.694.836, hay 1.227.642 que declararon *cor ou raça indígena* en la
 *      pregunta general, y 467.194 que **no** la declararon pero contestaron
 *      que sí se consideran indígenas. Esa segunda pregunta sólo se hizo dentro
 *      de tierras indígenas y localidades indígenas: no se le preguntó al país
 *      entero. Por eso \`seConsidera\` está concentrado en los estados con
 *      tierras demarcadas y no se puede leer como si fuera comparable entre
 *      estados.
 *
 *   2. **Cada persona pudo declarar hasta dos etnias.** Esta tabla cuenta
 *      personas, no etnias, así que acá no hay doble conteo. Pero si algún día
 *      se monta el desagregado por pueblo, los rótulos NO se suman como si
 *      fueran personas únicas.
 *
 *   3. **El denominador es la población residente del Censo 2022**, los
 *      203.080.756. Es el mismo universo que el numerador, así que el
 *      porcentaje es directo y no hace falta aclarar un recorte de edad como en
 *      Perú.
 *
 * ── El municipio, no el estado ──────────────────────────────────────────────
 *
 * Brasil es grande y el estado no dice nada de un predio: Amazonas tiene
 * 490.935 personas indígenas repartidas en 1,5 millones de km². El nivel útil
 * es el municipio, que en Brasil incluye la ciudad sede y toda su zona rural, y
 * es lo que el geocodificador devuelve en \`city\`/\`town\`. Son 5.570 y 737 de
 * ellos no tienen ninguna persona indígena: eso también es una respuesta.
 */
`;

const cuerpo = `
/** Un municipio brasileño con su población indígena y su población total. */
export interface CensoBrMunicipio {
  /** Código IBGE de 7 dígitos. Los dos primeros son la unidad federativa. */
  codigo: number;
  municipio: string;
  indigena: number;
  poblacion: number;
}

/** Una unidad federativa: 26 estados y el Distrito Federal. */
export interface CensoBrEstado {
  codigo: number;
  estado: string;
  /** La sigla de dos letras (SP, AM, RS), que es como se nombran en Brasil. */
  sigla: string;
  indigena: number;
  /** Los que declararon «cor ou raça indígena» en la pregunta general. */
  corRaca: number;
  /** Los que no la declararon y dijeron considerarse indígenas. Sólo se
   *  preguntó dentro de tierras y localidades indígenas: ver el encabezado. */
  seConsidera: number;
  poblacion: number;
  municipios: CensoBrMunicipio[];
}

export const CENSO_BR: CensoBrEstado[] = [
${filas}
];

export const CENSO_BR_PAIS = {
  indigena: ${IND_PAIS},
  corRaca: ${nacional['Cor ou raça indígena']},
  seConsidera: ${nacional['Se considera indígena']},
  poblacion: ${POB_PAIS},
  estados: ${ordenados.length},
  municipios: ${municipios.size},
  /** Municipios donde el censo no contó ninguna persona indígena. */
  municipiosSinIndigenas: ${[...municipios.values()].filter(m => m.indigena === 0).length},
} as const;
`;

writeFileSync(SALIDA, cabecera + cuerpo);
console.log('escrito: apps/terreno/lib/censoIndigena2022Br.ts');
