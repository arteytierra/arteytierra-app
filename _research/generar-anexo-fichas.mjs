// Se corre desde la raiz del repo: node _research/generar-anexo-fichas.mjs
// Regenera _research/_encargos/ANEXO_IDS_FICHAS.md desde los catalogos.
// Lee cada archivo de fichas, saca (id, nombre) en el orden del archivo, y
// marca con un tilde las fichas que ya tienen al menos una practica cargada
// en lib/practicasHistoricas.ts.
import fs from 'node:fs';

const LIB = 'apps/terreno/lib/';

// cada bloque: letra, titulo, archivo, y desde donde empieza a leer
const BLOQUES = [
  { letra: 'A', titulo: 'Sudamérica — fichas base (las 12 que resuelve la heurística Köppen)', archivo: 'contexto.ts', desde: 'export const BIOMAS' },
  { letra: 'B', titulo: 'Sudamérica — resto del continente', archivo: 'biomasRegionalesSudamerica.ts', desde: 'export const BIOMAS_REGIONALES_SUDAMERICA' },
  { letra: 'C', titulo: 'Norteamérica, Mesoamérica, Caribe y Europa — catálogo base', archivo: 'biomasRegionales.ts', desde: 'const CURADAS_A_MANO', hasta: 'export const BIOMAS_REGIONALES' },
  { letra: 'D', titulo: 'México, Centroamérica y Estados Unidos', archivo: 'biomasRegionalesAmerica.ts', desde: 'export const BIOMAS_REGIONALES_AMERICA' },
  { letra: 'E', titulo: 'Canadá, Alaska y Groenlandia', archivo: 'biomasRegionalesCanada.ts', desde: 'export const BIOMAS_REGIONALES_CANADA' },
  { letra: 'F', titulo: 'Europa no comunitaria y asociados', archivo: 'biomasRegionalesEuropa.ts', desde: 'export const BIOMAS_REGIONALES_EUROPA' },
  { letra: 'G', titulo: 'Unión Europea', archivo: 'biomasRegionalesEuropaUE.ts', desde: 'export const BIOMAS_REGIONALES_EUROPA_UE' },
  { letra: 'H', titulo: 'Medio Oriente', archivo: 'biomasRegionalesMedioOriente.ts', desde: 'export const BIOMAS_REGIONALES_MEDIO_ORIENTE' },
  { letra: 'I', titulo: 'Norte de África', archivo: 'biomasRegionalesNorteAfrica.ts', desde: 'export const BIOMAS_REGIONALES_NORTE_AFRICA' },
  { letra: 'J', titulo: 'Indomalaya', archivo: 'biomasRegionalesIndomalaya.ts', desde: 'export const BIOMAS_REGIONALES_INDOMALAYA' },
  { letra: 'K', titulo: 'Australasia', archivo: 'biomasRegionalesAustralasia.ts', desde: 'export const BIOMAS_REGIONALES_AUSTRALASIA' },
  { letra: 'L', titulo: 'África subsahariana', archivo: 'biomasRegionalesAfrica.ts', desde: 'export const BIOMAS_REGIONALES_AFRICA' },
];

const PRIORIDAD_AR = [
  'selva_paranaense', 'chaco_seco', 'monte', 'espinal', 'pampa', 'yungas',
  'puna_altoandino', 'estepa_patagonica', 'bosque_andino_patagonico',
  'campos_uruguayos', 'chaco_humedo', 'humedales_parana_mesopotamia',
];

function fichas(b) {
  const texto = fs.readFileSync(LIB + b.archivo, 'utf8');
  const i = texto.indexOf(b.desde);
  if (i < 0) throw new Error('no encontre "' + b.desde + '" en ' + b.archivo);
  let cuerpo = texto.slice(i);
  if (b.hasta) {
    const j = cuerpo.indexOf(b.hasta, b.desde.length);
    if (j < 0) throw new Error('no encontre "' + b.hasta + '" en ' + b.archivo);
    cuerpo = cuerpo.slice(0, j);
  }
  const re = /^    id: '([a-z0-9_]+)',\r?\n    nombre: '(.+?)',/gm;
  return [...cuerpo.matchAll(re)].map((m) => ({ id: m[1], nombre: m[2].replace(/\\'/g, "'") }));
}

// las fichas que ya tienen una practica cargada
const practicas = fs.readFileSync(LIB + 'practicasHistoricas.ts', 'utf8');
const conPractica = new Set([...practicas.matchAll(/^ {2}([a-z0-9_]+):\s*\[/gm)].map((m) => m[1]));

const bloques = BLOQUES.map((b) => ({ ...b, lista: fichas(b) }));
const todas = new Map();
for (const b of bloques) for (const f of b.lista) todas.set(f.id, f);

const total = [...bloques].reduce((s, b) => s + b.lista.length, 0);
const marcadas = [...todas.keys()].filter((id) => conPractica.has(id)).length;
const hoy = new Date().toISOString().slice(0, 10);

const linea = (f) => `- \`${f.id}\` — ${f.nombre}${conPractica.has(f.id) ? ' ✓ *(ya tiene práctica cargada)*' : ''}`;

const out = [];
out.push('# Anexo — los ids de ficha', '');
out.push(`_Generado desde los catálogos el ${hoy}. **${total} fichas** en total._`, '');
out.push('Un `fichaId` que no esté en esta lista, o que esté mal tipeado, hace que la');
out.push('entrada no se muestre nunca. Copiarlo, no escribirlo de memoria.', '');
out.push(`Las ${marcadas} marcadas con ✓ ya tienen al menos una práctica cargada.`, '');
out.push('---', '');
out.push(`## Prioridad 1 — Argentina (${PRIORIDAD_AR.length} fichas)`, '');
out.push('Estos ids también aparecen abajo, en el bloque del archivo al que pertenecen.');
out.push('Son las ecorregiones cuya ficha nombra a la Argentina: es el mercado del');
out.push('producto y donde más fuente accesible hay (INTA, CONICET, universidades');
out.push('nacionales, parques nacionales).', '');
for (const id of PRIORIDAD_AR) {
  const f = todas.get(id);
  if (!f) throw new Error('la ficha de prioridad ' + id + ' ya no existe en los catalogos');
  out.push(linea(f));
}
out.push('');

for (const b of bloques) {
  out.push('---', '');
  out.push(`## ${b.letra}. ${b.titulo} — ${b.lista.length} fichas`, '');
  out.push(`_\`lib/${b.archivo}\`_`, '');
  for (const f of b.lista) out.push(linea(f));
  out.push('');
}

fs.writeFileSync('_research/_encargos/ANEXO_IDS_FICHAS.md', out.join('\n'), 'utf8');
console.log('total', total, '· con practica', marcadas, '· bloques', bloques.map((b) => b.letra + ':' + b.lista.length).join(' '));
