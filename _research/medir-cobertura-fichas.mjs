/**
 * Cobertura de fichas ecológicas contra las 846 ecorregiones de RESOLVE.
 *
 * Se corre desde la raíz del repo:  node _research/medir-cobertura-fichas.mjs
 *
 * POR QUÉ EXISTE, HABIENDO YA UN SCRIPT DE COBERTURA
 *
 * `enumerar-cobertura-resolve.mjs` le pregunta al FeatureServer de RESOLVE qué
 * ecorregiones intersecan una caja, y es el que vale para auditar el alcance de
 * un paquete. Pero pide red, tarda, y responde por envolvente.
 *
 * Éste responde otra pregunta —cuántas de las 846 tienen ficha y cuáles no, por
 * reino y por bioma— y la responde **sin red**, cruzando los mapas `ECO_ID_*`
 * de `lib/ecorregiones*.ts` contra `resolve-eco-id-bioma-2026-09-07.json`. Es el
 * número que va a un recuento, y se puede correr en cualquier momento sin
 * depender de que el servicio esté arriba.
 *
 * No escribe nada: lee las tablas por texto e imprime.
 */
import { readFileSync, readdirSync } from 'node:fs';

const LIB = 'apps/terreno/lib/';
const resolve = JSON.parse(readFileSync('_research/resolve-eco-id-bioma-2026-09-07.json', 'utf8'));

const tablas = readdirSync(LIB).filter(f => /^ecorregiones.*\.ts$/.test(f));
const cubiertos = new Set();
for (const t of tablas) {
  const src = readFileSync(LIB + t, 'utf8');
  // Sólo dentro de los Record<number, string>, y sin comentarios.
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const m of sinComentarios.matchAll(/^\s*(\d{1,3})\s*:\s*'/gm)) cubiertos.add(Number(m[1]));
}

const porReino = new Map();
let total = 0;
const sinFicha = [];
for (const [id, e] of Object.entries(resolve)) {
  const n = Number(id);
  if (e.realm === 'N/A') continue;
  total++;
  const k = e.realm;
  if (!porReino.has(k)) porReino.set(k, { con: 0, tot: 0 });
  const r = porReino.get(k);
  r.tot++;
  if (cubiertos.has(n)) r.con++;
  else sinFicha.push({ id: n, nombre: e.nombre, bioma: e.biomaNombre, realm: e.realm });
}

console.log('tablas leidas:', tablas.join(', '));
console.log('ECO_ID mapeados en lib/:', cubiertos.size);
console.log('\n| Reino | Con ficha | Total |');
let con = 0;
for (const [k, v] of [...porReino].sort((a, b) => b[1].tot - a[1].tot)) {
  console.log(`| ${k} | ${v.con} | ${v.tot} |`);
  con += v.con;
}
console.log(`| TOTAL | ${con} | ${total} |`);

const porBioma = new Map();
for (const s of sinFicha) porBioma.set(s.bioma, (porBioma.get(s.bioma) ?? 0) + 1);
console.log('\nSin ficha por bioma:');
for (const [k, v] of [...porBioma].sort((a, b) => b[1] - a[1])) console.log(`  ${v}  ${k}`);
