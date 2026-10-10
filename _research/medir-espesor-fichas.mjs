/**
 * Espesor de cada ficha ecológica: especies, fuentes propias y largo de `suelos`.
 *
 * Se corre desde la raíz del repo:  node _research/medir-espesor-fichas.mjs
 *
 * POR QUÉ MIDE LAS FUENTES COMO LAS MIDE
 *
 * Contar `fuentes` no alcanza, y ésa es la trampa que este script existe para
 * destapar. Una ficha puede declarar cuatro fuentes y ser las mismas cuatro de
 * todo el paquete —`ATLAS_SUELOS`, `RESOLVE`, `HWSD`, `SOILGRIDS`—. Eso la deja
 * **trazable y no verificable**: no hay dónde ir a chequear lo que esa ficha
 * concreta afirma de ese lugar concreto.
 *
 * El primer criterio que probé fue «constante EN_MAYÚSCULAS = marco general», y
 * estaba mal: `PEI_ROTACION` es la ley de rotación de la papa de la Isla del
 * Príncipe Eduardo y `HIRCANIA` es el bosque hircano. Son constantes porque se
 * escriben una vez, no porque sean genéricas, y clasificarlas así inflaba la
 * cuenta de 62 a 79.
 *
 * El criterio que vale es **cuántas fichas comparten la fuente**: a partir de
 * cinco es marco del paquete, y de una a cuatro es del lugar. El umbral es
 * arbitrario y por eso el script imprime las dos listas, para poder discutirlo
 * mirando los nombres en vez de confiar en el número.
 *
 * Los umbrales de «flaco» (5 especies, 250 caracteres de suelos) no son una
 * norma: son los que usó el relevamiento como plantilla, y por eso sirven para
 * encontrar lo que quedó en la plantilla y nunca se engrosó.
 *
 * No escribe nada: lee los catálogos por texto e imprime.
 */
import { readFileSync, readdirSync } from 'node:fs';

const LIB = 'apps/terreno/lib/';
/** Una fuente compartida por esta cantidad de fichas o más es marco del paquete. */
const UMBRAL_MARCO = 5;

/** Items de nivel 0 de un array que arranca en el '[' de `pos`. */
function items(src, pos) {
  let d = 0, ini = pos + 1;
  const out = [];
  for (let i = pos; i < src.length; i++) {
    const c = src[i];
    if (c === '[' || c === '{' || c === '(') d++;
    else if (c === ']' || c === '}' || c === ')') {
      d--;
      if (d === 0) { const t = src.slice(ini, i).trim(); if (t) out.push(t); return out; }
    } else if (c === ',' && d === 1) { const t = src.slice(ini, i).trim(); if (t) out.push(t); ini = i + 1; }
    else if (c === "'" || c === '"') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } }
  }
  return out;
}

const fichas = [];
for (const arch of readdirSync(LIB).filter(f => /^biomasRegionales.*\.ts$/.test(f))) {
  const s = readFileSync(LIB + arch, 'utf8');
  const marcas = [...s.matchAll(/^  ([a-z0-9_]+):\s*\{/gm)];
  for (let i = 0; i < marcas.length; i++) {
    const cuerpo = s.slice(marcas[i].index, i + 1 < marcas.length ? marcas[i + 1].index : s.length);
    const arr = (campo) => {
      const m = cuerpo.match(new RegExp(campo + ':\\s*\\['));
      return m ? items(cuerpo, m.index + m[0].length - 1) : [];
    };
    const nom = cuerpo.match(/nombre:\s*'([^']*)'/);
    // Largo del texto de `suelos`, contando dentro de las comillas.
    const sm = cuerpo.match(/suelos:\s*\n?\s*['"]/);
    let suelos = -1;
    if (sm) {
      const q = cuerpo[sm.index + sm[0].length - 1];
      let j = sm.index + sm[0].length, n = 0;
      while (j < cuerpo.length && cuerpo[j] !== q) { if (cuerpo[j] === '\\') j++; j++; n++; }
      suelos = n;
    }
    fichas.push({
      id: marcas[i][1],
      paq: arch.replace('biomasRegionales', '').replace('.ts', '') || 'base',
      nombre: nom ? nom[1] : '?',
      esp: arr('especies').length,
      fu: arr('fuentes'),
      suelos,
    });
  }
}

const uso = new Map();
for (const f of fichas) for (const t of f.fu) if (/^[A-Z][A-Z0-9_]*$/.test(t)) uso.set(t, (uso.get(t) ?? 0) + 1);
const MARCO = new Set([...uso].filter(([, n]) => n >= UMBRAL_MARCO).map(([k]) => k));
for (const f of fichas) f.propias = f.fu.filter(t => !MARCO.has(t)).length;

const fmt = (pred) => [...uso].filter(pred).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}(${n})`).join(' ');
console.log(`fichas: ${fichas.length}\n`);
console.log(`marco compartido (>=${UMBRAL_MARCO} fichas):\n  ${fmt(([, n]) => n >= UMBRAL_MARCO)}`);
console.log(`propias del lugar (1-${UMBRAL_MARCO - 1}):\n  ${fmt(([, n]) => n < UMBRAL_MARCO)}\n`);

const grupos = {};
for (const f of fichas) (grupos[f.paq] ??= []).push(f);
console.log('| paquete | fichas | especies prom | fuentes prom | sin fuente propia | suelos prom |');
for (const [k, v] of Object.entries(grupos)) {
  const m = (c) => Math.round(v.reduce((s, f) => s + Math.max(0, typeof f[c] === 'number' ? f[c] : f[c].length), 0) / v.length * 10) / 10;
  console.log(`| ${k} | ${v.length} | ${m('esp')} | ${m('fu')} | ${v.filter(f => f.propias === 0).length} | ${m('suelos')} |`);
}

const lista = (rot, pred, conNombre = false) => {
  const v = fichas.filter(pred);
  const porPaq = {};
  for (const f of v) porPaq[f.paq] = (porPaq[f.paq] ?? 0) + 1;
  console.log(`\n${rot}: ${v.length}`);
  console.log('  ' + Object.entries(porPaq).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(' · '));
  if (conNombre) for (const f of v) console.log(`- \`${f.id}\` — ${f.nombre}`);
  else if (v.length <= 50) console.log('  ' + v.map(f => f.id).join(', '));
};
lista('especies <= 5', f => f.esp <= 5);
lista('sin ninguna fuente propia del lugar', f => f.propias === 0, true);
lista('suelos < 250 caracteres', f => f.suelos >= 0 && f.suelos < 250);
