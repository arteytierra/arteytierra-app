/**
 * Montaje de la entrega sudamericana a apps/terreno/lib.
 *
 * Escribe dos archivos generados —lib/ecorregionesSudamerica.ts y
 * lib/biomasRegionalesSudamerica.ts— y deja en _tmp-bloque-12.txt el bloque de
 * los ECO_ID que siguen perteneciendo a las 12 fichas de lib/contexto.ts, que
 * se pega a mano en el bloque SUDAMERICA de lib/ecorregiones.ts.
 *
 * Uso:  node _research/ecosistemas-saberes-sudamerica/montar-sudamerica.mjs .
 *
 * Respeta los ECO_ID ya reservados por los paquetes de América y Europa: si la
 * entrega mandara uno de ellos a otra ficha, corta con error en vez de pisarlo.
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.argv[2];
const PAQ = path.join(RAIZ, '_research/ecosistemas-saberes-sudamerica/fase-1-ecologia');
const LIB = path.join(RAIZ, 'apps/terreno/lib');

const map = JSON.parse(fs.readFileSync(path.join(PAQ, 'mapeo-eco-id-final-auditoria.json'), 'utf8'));
const fichas = JSON.parse(fs.readFileSync(path.join(PAQ, 'fichas-ecologicas-nuevas.json'), 'utf8'));
const resolve = JSON.parse(fs.readFileSync(path.join(RAIZ, '_research/ecosistemas-saberes-sudamerica/insumos/resolve-sudamerica-bbox-2026-09-03.json'), 'utf8'));

// ECO_NAME oficial por ECO_ID, para los comentarios.
const NOMBRE = {};
const feats = resolve.features ?? resolve;
for (const f of feats) {
  const a = f.attributes ?? f.properties ?? f;
  if (a.ECO_ID != null) NOMBRE[a.ECO_ID] = a.ECO_NAME;
}

const BASE_12 = new Set(['selva_paranaense', 'yungas', 'sabana_cerrado', 'chaco_seco', 'espinal',
  'pampa', 'monte', 'puna_altoandino', 'desierto_costero', 'estepa_patagonica',
  'bosque_andino_patagonico', 'mediterraneo']);
// El id `selva_tropical` se renombra en el montaje: después de la partición
// sólo cubre el Alto Paraná.
const RENOMBRES = { selva_tropical: 'selva_paranaense' };
const rid = (id) => RENOMBRES[id] ?? id;

// ECO_ID ya reservados por los paquetes anteriores: no se tocan.
const leerMapa = (archivo) => {
  const src = fs.readFileSync(path.join(LIB, archivo), 'utf8');
  const out = {};
  for (const m of src.matchAll(/^\s*(\d+): '([a-z0-9_]+)',?/gm)) out[m[1]] = m[2];
  return out;
};
const reservados = { ...leerMapa('ecorregionesAmerica.ts'), ...leerMapa('ecorregionesEuropa.ts') };

const base = {};   // ECO_ID → una de las 12 fichas de contexto.ts
const nuevos = {}; // ECO_ID → ficha regional sudamericana nueva
for (const [eco, fichaBruta] of Object.entries(map)) {
  if (eco === '0') continue;                       // Rock and Ice: deuda global aparte
  const ficha = rid(fichaBruta);
  if (reservados[eco]) {
    if (reservados[eco] !== ficha) throw new Error(`ECO_ID ${eco} reservado como ${reservados[eco]} y la entrega lo manda a ${ficha}`);
    continue;
  }
  (BASE_12.has(ficha) ? base : nuevos)[eco] = ficha;
}

const BS = String.fromCharCode(92);
const q = (s) => "'" + String(s).split(BS).join(BS+BS).split(String.fromCharCode(39)).join(BS+String.fromCharCode(39)) + "'";
const num = (a) => a.sort((x, y) => Number(x) - Number(y));

// ── ecorregionesSudamerica.ts ────────────────────────────────────────────────
const porFicha = {};
for (const [eco, f] of Object.entries(nuevos)) (porFicha[f] ??= []).push(eco);

let ecoTs = `/**
 * Ecorregiones RESOLVE de Sudamérica → fichas regionales sudamericanas.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-sudamerica/
 * fase-1-ecologia/mapeo-eco-id-final-auditoria.json. Acá van sólo los ECO_ID
 * cuyo dueño es una de las 47 fichas nuevas; los que siguen apuntando a las 12
 * fichas de lib/contexto.ts quedan en el bloque SUDAMERICA de ecorregiones.ts.
 *
 * Cada ECO_ID fue verificado contra el FeatureServer de RESOLVE por consulta de
 * envolvente, no inferido por parecido de nombre ni por rango numérico. Los
 * nombres de los comentarios son los ECO_NAME que publica RESOLVE.
 */

export const ECO_ID_SUDAMERICA_NUEVAS: Record<number, string> = {
`;
for (const ficha of Object.keys(porFicha).sort()) {
  const nom = fichas.find(f => rid(f.id) === ficha)?.nombre ?? ficha;
  ecoTs += `  // ${nom}\n`;
  for (const eco of num(porFicha[ficha])) {
    ecoTs += `  ${eco}: ${q(ficha)},`.padEnd(46) + (NOMBRE[eco] ? `// ${NOMBRE[eco]}` : '') + '\n';
  }
  ecoTs += '\n';
}
ecoTs = ecoTs.replace(/\n$/, '') + '};\n';
fs.writeFileSync(path.join(LIB, 'ecorregionesSudamerica.ts'), ecoTs);

// ── biomasRegionalesSudamerica.ts ────────────────────────────────────────────
const nuevas = fichas.filter(f => !BASE_12.has(rid(f.id))).sort((a, b) => a.id.localeCompare(b.id));

const lista = (arr, ind) => arr.length === 0 ? '[]'
  : '[\n' + arr.map(x => `${ind}  ${q(x)},`).join('\n') + `\n${ind}]`;

let bioTs = `/**
 * Fichas regionales de Sudamérica.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-sudamerica/
 * fase-1-ecologia/fichas-ecologicas-nuevas.json. No editar a mano: se regenera
 * desde el paquete de investigación, que es donde vive la trazabilidad (fuentes,
 * ECO_ID verificados por consulta espacial y nivel de confianza por ficha).
 *
 * Antes de este montaje, adentro de Sudamérica mandaban 12 fichas escritas para
 * la Argentina y una heurística Köppen: la Caatinga, el Chaco húmedo, el
 * Pantanal, los páramos, el Chocó y los valles secos interandinos caían al bioma
 * global o —peor— a la ficha argentina más parecida. Estas 47 fichas son las
 * dueñas propias de ese territorio.
 *
 * \`saberes\` va vacío a propósito en todas, igual que en los otros dos bloques
 * generados. Los saberes sudamericanos son subnacionales y necesitan geometría
 * propia con procedencia y licencia; viven en la fase 2 del paquete y todavía no
 * hay tipo ni capa para montarlos.
 */

import type { BiomaFicha } from './biomaTipos';

export const BIOMAS_REGIONALES_SUDAMERICA: Record<string, BiomaFicha> = {
`;
for (const f of nuevas) {
  const m = f._meta;
  bioTs += `  // ${(m.paises ?? []).join(', ')} · confianza ${m.confianza}\n`;
  bioTs += `  ${rid(f.id)}: {\n`;
  bioTs += `    id: ${q(rid(f.id))},\n`;
  bioTs += `    nombre: ${q(f.nombre)},\n`;
  bioTs += `    emoji: ${q(f.emoji)},\n`;
  bioTs += `    color: ${q(f.color)},\n`;
  bioTs += `    resumen: ${q(f.resumen)},\n`;
  bioTs += `    vegetacion: ${q(f.vegetacion)},\n`;
  bioTs += `    fauna: ${q(f.fauna)},\n`;
  bioTs += `    suelos: ${q(f.suelos)},\n`;
  bioTs += `    saberes: [],\n`;
  bioTs += `    especies: ${lista(f.especies, '    ')},\n`;
  bioTs += `    fuentes: [\n`;
  for (const s of f.fuentes) bioTs += `      { label: ${q(s.label)}, url: ${q(s.url)} },\n`;
  bioTs += `    ],\n  },\n`;
}
bioTs += '};\n';
fs.writeFileSync(path.join(LIB, 'biomasRegionalesSudamerica.ts'), bioTs);

// ── el bloque de las 12, para pegar en ecorregiones.ts ───────────────────────
const porBase = {};
for (const [eco, f] of Object.entries(base)) (porBase[f] ??= []).push(eco);
let baseTxt = '';
for (const ficha of Object.keys(porBase).sort()) {
  for (const eco of num(porBase[ficha])) {
    baseTxt += `  ${eco}: ${q(ficha)},`.padEnd(32) + (NOMBRE[eco] ? `// ${NOMBRE[eco]}` : '') + '\n';
  }
}
fs.writeFileSync(path.join(RAIZ, '_tmp-bloque-12.txt'), baseTxt);

console.log('ECO_ID a fichas nuevas:', Object.keys(nuevos).length);
console.log('ECO_ID a las 12 de contexto:', Object.keys(base).length);
console.log('fichas nuevas:', nuevas.length);
