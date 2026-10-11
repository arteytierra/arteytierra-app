/**
 * Arma `apps/terreno/lib/censoIndigena2022Ar.ts` desde los cuadros publicados
 * del Censo Nacional de Población, Hogares y Viviendas 2022 (INDEC).
 *
 * ── Qué toma y de dónde ────────────────────────────────────────────────────
 *
 * Tres series de cuadros, todas de censo.gob.ar (resultados definitivos):
 *
 *   c2022_tp_poblacion_indigena_c10.xlsx
 *     Total del país por jurisdicción: población en viviendas particulares y
 *     población que se reconoce indígena. Es el control de todo lo demás.
 *
 *   c2022_<prov>_poblacion_indigena_c8_<n>.xlsx
 *     Por provincia: personas por pueblo indígena u originario declarado, más
 *     la fila «Sin información» —las que se reconocen indígenas y no declaran
 *     pueblo—, que es un tercio del total del país y hay que mostrarla.
 *
 *   c2022_<prov>_poblacion_indigena_c1_<n>.xlsx
 *     Por departamento: población que se reconoce indígena. Una hoja por
 *     departamento; el nombre está en el título del cuadro.
 *
 *   c2022_<prov>_est_c3_<n>.xlsx
 *     Por departamento: población en viviendas particulares. Es el denominador
 *     correcto y el único: el numerador de arriba también se cuenta sobre
 *     viviendas particulares, así que dividir por el total de población
 *     —que incluye viviendas colectivas— daría un porcentaje apenas más chico
 *     y mal calculado. Esa es toda la razón por la que este cuarto cuadro está.
 *
 * ── Lo que el script NO hace ───────────────────────────────────────────────
 *
 * No normaliza los nombres de los pueblos. El censo escribe «Qom/Toba» y el
 * INAI escribe «Qom (Toba)»; el censo tiene «Wichi» sin tilde y «Selk´Nam/Ona»
 * con un apóstrofo raro. Se muestran como los escribe cada fuente y no se
 * cruzan: son dos preguntas distintas hechas por dos organismos distintos, y
 * unificar las grafías daría la impresión de que una lista confirma a la otra.
 *
 * No inventa ceros. Un departamento sin hoja en el cuadro 1 no entra en la
 * tabla como 0: no entra. El único caso en todo el país es el departamento
 * Antártida Argentina, que no tiene población en viviendas particulares.
 *
 * Uso:  node build-censo-indigena.mjs [carpeta-con-los-xlsx]
 * Los .xlsx no se versionan (son 3 MB de binario). Lo que queda congelado en
 * el repo son los dos .tsv que este script escribe al lado, que es lo que un
 * humano puede auditar contra la publicación del INDEC.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const FUENTES = process.argv[2] ?? path.join(AQUI, 'xlsx');
const SALIDA = path.join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2022Ar.ts');

/**
 * Los cuadros se bajan del sitio del INDEC y no de censo.gob.ar, que publica
 * los mismos archivos con los mismos nombres.
 *
 * No es una preferencia: **cinco de los veinticuatro cuadros 8 que publica
 * censo.gob.ar tienen adentro otra provincia.** El archivo llamado
 * `c2022_chubut_…_c8_5.xlsx` contiene el cuadro 8.9, que es Formosa; el de
 * Córdoba trae La Pampa; el de San Juan, Santa Cruz; el de Tierra del Fuego,
 * Tucumán; y el de Santa Cruz trae el cuadro nacional. En indec.gob.ar los
 * veinticuatro son correctos. Se descubrió porque el total de cada cuadro 8 se
 * compara contra el cuadro 10 antes de escribir nada, y sin esa comparación
 * Chubut habría salido publicado con los pueblos de Formosa.
 *
 * La misma copia tiene defectos más chicos: en su cuadro 1.23.3 el título no
 * nombra a Ushuaia. Acá los cuadros se identifican por su número y no por el
 * nombre del archivo, y los nombres que falten se completan desde el cuadro
 * hermano, así que el armado aguanta las dos cosas.
 */
const BASE = 'https://www.indec.gob.ar/ftp/cuadros/poblacion/';

/**
 * Las 24 jurisdicciones con el número que les da el INDEC (1 = Ciudad de
 * Buenos Aires, después las provincias en orden alfabético) y el rótulo con el
 * que las nombra la app, que es el del registro del INAI: las dos capas se
 * muestran juntas y tienen que casar por provincia. La única que difiere de
 * veras es Tierra del Fuego, que el censo escribe con el nombre completo.
 */
const PROVINCIAS = [
  { n: 1,  slug: 'caba',       rotulo: 'Ciudad Autónoma de Buenos Aires' },
  { n: 2,  slug: 'bsas',       rotulo: 'Buenos Aires' },
  { n: 3,  slug: 'catamarca',  rotulo: 'Catamarca' },
  { n: 4,  slug: 'chaco',      rotulo: 'Chaco' },
  { n: 5,  slug: 'chubut',     rotulo: 'Chubut' },
  { n: 6,  slug: 'cordoba',    rotulo: 'Córdoba' },
  { n: 7,  slug: 'corrientes', rotulo: 'Corrientes' },
  { n: 8,  slug: 'entrerios',  rotulo: 'Entre Ríos' },
  { n: 9,  slug: 'formosa',    rotulo: 'Formosa' },
  { n: 10, slug: 'jujuy',      rotulo: 'Jujuy' },
  { n: 11, slug: 'lapampa',    rotulo: 'La Pampa' },
  { n: 12, slug: 'larioja',    rotulo: 'La Rioja' },
  { n: 13, slug: 'mendoza',    rotulo: 'Mendoza' },
  { n: 14, slug: 'misiones',   rotulo: 'Misiones' },
  { n: 15, slug: 'neuquen',    rotulo: 'Neuquén' },
  { n: 16, slug: 'rionegro',   rotulo: 'Río Negro' },
  { n: 17, slug: 'salta',      rotulo: 'Salta' },
  { n: 18, slug: 'sanjuan',    rotulo: 'San Juan' },
  { n: 19, slug: 'sanluis',    rotulo: 'San Luis' },
  { n: 20, slug: 'santacruz',  rotulo: 'Santa Cruz' },
  { n: 21, slug: 'santafe',    rotulo: 'Santa Fe' },
  { n: 22, slug: 'santiago',   rotulo: 'Santiago del Estero' },
  { n: 23, slug: 'tdf',        rotulo: 'Tierra del Fuego' },
  { n: 24, slug: 'tucuman',    rotulo: 'Tucumán' },
];

const archivos = p => ({
  pueblos:      `c2022_${p.slug}_poblacion_indigena_c8_${p.n}.xlsx`,
  departamentos:`c2022_${p.slug}_poblacion_indigena_c1_${p.n}.xlsx`,
  estructura:   `c2022_${p.slug}_est_c3_${p.n}.xlsx`,
});
const urlDe = f => BASE + f;

// ── Leer un .xlsx sin dependencias ──────────────────────────────────────────
// Un .xlsx es un ZIP de XML. Se lee el directorio central, se desinfla cada
// entrada que interesa y se barren las celdas con expresiones regulares. Es
// menos frágil de lo que parece: son planillas generadas por el INDEC, no
// escritas a mano, y siempre tienen la misma forma.

function entradasZip(buf) {
  let fin = buf.length - 22;
  while (fin >= 0 && buf.readUInt32LE(fin) !== 0x06054b50) fin--;
  if (fin < 0) throw new Error('no parece un ZIP');
  const cantidad = buf.readUInt16LE(fin + 10);
  let off = buf.readUInt32LE(fin + 16);
  const salida = new Map();
  for (let i = 0; i < cantidad; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('directorio central corrupto');
    const metodo = buf.readUInt16LE(off + 10);
    const comprimido = buf.readUInt32LE(off + 20);
    const largoNombre = buf.readUInt16LE(off + 28);
    const largoExtra = buf.readUInt16LE(off + 30);
    const largoComentario = buf.readUInt16LE(off + 32);
    const local = buf.readUInt32LE(off + 42);
    const nombre = buf.toString('utf8', off + 46, off + 46 + largoNombre);
    const datos = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const crudo = buf.subarray(datos, datos + comprimido);
    salida.set(nombre, metodo === 8 ? zlib.inflateRawSync(crudo) : crudo);
    off += 46 + largoNombre + largoExtra + largoComentario;
  }
  return salida;
}

const desmarcar = s => s
  .replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Devuelve las hojas del libro, cada una como filas de celdas ya en texto. */
function hojas(rutaXlsx) {
  const zip = entradasZip(fs.readFileSync(rutaXlsx));
  const ss = zip.get('xl/sharedStrings.xml');
  const compartidas = ss
    ? [...ss.toString('utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => desmarcar(m[1]).replace(/\s+/g, ' ').trim())
    : [];

  return [...zip.keys()]
    .filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    .map(k => {
      const xml = zip.get(k).toString('utf8');
      return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map(fila => {
        const celdas = [];
        for (const c of fila[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
          const v = /<v>([\s\S]*?)<\/v>/.exec(c[3]);
          const inline = /<is>([\s\S]*?)<\/is>/.exec(c[3]);
          let val = '';
          if (inline) val = desmarcar(inline[1]).replace(/\s+/g, ' ').trim();
          else if (v) val = / t="s"/.test(c[2]) ? (compartidas[Number(v[1])] ?? '') : v[1];
          let i = 0;
          for (const ch of c[1]) i = i * 26 + (ch.charCodeAt(0) - 64);
          celdas[i - 1] = val;
        }
        return Array.from(celdas, x => x ?? '');
      });
    });
}

/**
 * «123» → 123. El INDEC escribe «-» para el cero absoluto y «///» para el dato
 * que no corresponde presentar, y son dos cosas distintas: el cero es un dato y
 * el otro es la ausencia de dato. Devuelve `null` para el segundo.
 */
function numero(celda) {
  const s = (celda ?? '').trim();
  if (s === '-') return 0;
  if (s === '' || s.startsWith('///')) return null;
  const n = Number(s.replace(/\./g, '').replace(/,/g, '.'));
  if (!Number.isFinite(n)) throw new Error(`no es un número: «${s}»`);
  return Math.round(n);
}

/** El título de un cuadro es siempre la primera celda no vacía de la hoja. */
const tituloDe = hoja => hoja.flat().find(c => c && c.startsWith('Cuadro')) ?? '';

/**
 * La hoja de índice también empieza con «Cuadro …» y engaña a `tituloDe`. Se
 * la saltea siempre: leerla como si fuera el cuadro daba un total del país
 * vacío y un departamento inventado.
 */
const esIndice = hoja => hoja.flat().some(c => c === 'Índice de cuadros');

/**
 * De «Cuadro 1.17.7. Provincia de Salta, departamento General Güemes. …» saca
 * el índice del departamento (7) y su nombre. Una hoja sin índice —«Cuadro
 * 1.17.»— es el total provincial y devuelve `indice: null`.
 *
 * El nombre puede venir vacío —pasa en la copia de censo.gob.ar del cuadro
 * 1.23.3, que no nombra a Ushuaia—. Por eso el índice manda y el nombre se
 * completa después desde el cuadro hermano, que sí lo nombra.
 */
function encabezado(titulo, nProvincia) {
  const m = new RegExp(`^Cuadro \\d+\\.${nProvincia}(?:\\.(\\d+))?\\.\\s*(.*)$`).exec(titulo);
  if (!m) return null;
  const resto = m[2];
  const mn = /,\s*(?:departamento|partido|comuna)\s+([^.]+)\./i.exec(resto);
  const esComuna = /,\s*comuna\s+/i.test(resto);
  return {
    indice: m[1] ? Number(m[1]) : null,
    nombre: mn ? (esComuna ? `Comuna ${mn[1].trim()}` : mn[1].trim()) : null,
  };
}

/** El valor de la fila «Total» de una hoja, en la columna que se pida. */
function filaTotal(hoja, columna) {
  const fila = hoja.find(f => (f[0] ?? '').trim().toLowerCase() === 'total');
  if (!fila) throw new Error('la hoja no tiene fila Total');
  return numero(fila[columna]);
}

// ── Descarga ────────────────────────────────────────────────────────────────

async function asegurarFuentes() {
  fs.mkdirSync(FUENTES, { recursive: true });
  const faltan = [];
  for (const p of PROVINCIAS) for (const f of Object.values(archivos(p))) {
    if (!fs.existsSync(path.join(FUENTES, f))) faltan.push(f);
  }
  if (!fs.existsSync(path.join(FUENTES, NACIONAL))) faltan.push(NACIONAL);
  if (!faltan.length) return;
  console.log(`Bajando ${faltan.length} cuadros del INDEC…`);
  for (const f of faltan) {
    const res = await fetch(urlDe(f));
    if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
    fs.writeFileSync(path.join(FUENTES, f), Buffer.from(await res.arrayBuffer()));
  }
}
const NACIONAL = 'c2022_tp_poblacion_indigena_c10.xlsx';

// ── Armado ──────────────────────────────────────────────────────────────────

await asegurarFuentes();
const leer = f => hojas(path.join(FUENTES, f));
const avisos = [];

/** Cuadro 10: por jurisdicción, población en viviendas particulares e indígena. */
function jurisdicciones() {
  const hoja = leer(NACIONAL).find(h => !esIndice(h) && /^Cuadro 10\./.test(tituloDe(h)));
  if (!hoja) throw new Error('el cuadro 10 no tiene la hoja del cuadro');
  const porRotulo = new Map();
  let pais = null;
  for (const fila of hoja) {
    // Las filas de encabezado y de notas al pie tienen texto donde van los
    // números: se saltean por la forma de la celda y no por su posición.
    if (!/^\d+$/.test((fila[2] ?? '').trim())) continue;
    const nombre = (fila[1] ?? '').trim();
    const poblacion = numero(fila[2]);
    const indigena = numero(fila[3]);
    if (poblacion === null || indigena === null) continue;
    if (nombre === '' && (fila[0] ?? '').trim() === 'Total del país') { pais = { poblacion, indigena }; continue; }
    // «24 Partidos del Gran Buenos Aires» y «Resto de la Provincia» son
    // subtotales de Buenos Aires: vienen sin código y no son jurisdicciones.
    if (!(fila[0] ?? '').trim()) continue;
    // Tierra del Fuego viene con el nombre completo y una llamada al pie.
    const limpio = nombre.replace(/\(.*$/, '').trim();
    const p = PROVINCIAS.find(x => limpio.startsWith(x.rotulo));
    if (!p) throw new Error(`jurisdicción no reconocida en el cuadro 10: «${nombre}»`);
    porRotulo.set(p.rotulo, { poblacion, indigena });
  }
  if (!pais) throw new Error('el cuadro 10 no trae el total del país');
  if (porRotulo.size !== 24) throw new Error(`el cuadro 10 trajo ${porRotulo.size} jurisdicciones`);
  return { pais, porRotulo };
}

/** Cuadro 8 provincial: personas por pueblo declarado, y las que no declaran. */
function pueblosDe(p) {
  // El número del cuadro, y no el nombre del archivo, dice de qué provincia es.
  const esperado = new RegExp(`^Cuadro 8\\.${p.n}\\.`);
  const hoja = leer(archivos(p).pueblos).find(h => !esIndice(h) && esperado.test(tituloDe(h)));
  if (!hoja) {
    const hay = leer(archivos(p).pueblos).map(tituloDe).find(t => t.startsWith('Cuadro')) ?? '(ninguno)';
    throw new Error(`${p.rotulo}: se esperaba el cuadro 8.${p.n} y el archivo trae «${hay}»`);
  }
  const pueblos = [];
  let total = null, sinInformacion = 0;
  let dentro = false;
  for (const fila of hoja) {
    const etiqueta = (fila[0] ?? '').trim();
    // El cuerpo del cuadro empieza después del encabezado y termina en las
    // notas. Acotarlo no es cosmético: el título, la nota y la fuente llevan un
    // número en la segunda columna —la llamada al pie— y sin este corte cada
    // uno entraba como un pueblo de una persona. Eran tres de más por provincia.
    if (/^Pueblo indígena/i.test(etiqueta)) { dentro = true; continue; }
    if (/^(Notas?|Fuente|\()/.test(etiqueta)) break;
    if (!dentro) continue;
    if (!/^\d+$/.test((fila[1] ?? '').trim())) continue;
    const n = numero(fila[1]);
    if (!etiqueta || n === null) continue;
    const clave = etiqueta.toLowerCase();
    if (clave === 'total') { total = n; continue; }
    if (clave === 'sin información') { sinInformacion = n; continue; }
    pueblos.push({ pueblo: etiqueta, personas: n });
  }
  if (total === null) throw new Error(`${p.rotulo}: el cuadro 8 no trae el total`);
  const suma = pueblos.reduce((s, x) => s + x.personas, 0) + sinInformacion;
  if (suma !== total) throw new Error(`${p.rotulo}: los pueblos suman ${suma} y el total dice ${total}`);
  return { pueblos, total, sinInformacion };
}

/**
 * Cuadros 1 y 3 provinciales, cruzados por el índice del departamento. El 1
 * trae la población indígena y el 3 la población en viviendas particulares, que
 * es el denominador. Se cruzan por índice y no por nombre porque un cuadro del
 * INDEC tiene el nombre en blanco.
 */
function departamentosDe(p) {
  const indigena = new Map(), poblacion = new Map(), nombres = new Map();
  let totalProvincial = null;

  for (const hoja of leer(archivos(p).departamentos)) {
    if (esIndice(hoja)) continue;
    const t = tituloDe(hoja);
    if (!/^Cuadro 1\./.test(t)) continue;
    const e = encabezado(t, p.n);
    if (!e) continue;
    if (e.indice === null) { totalProvincial = filaTotal(hoja, 1); continue; }
    indigena.set(e.indice, filaTotal(hoja, 1));
    if (e.nombre) nombres.set(e.indice, e.nombre);
  }

  for (const hoja of leer(archivos(p).estructura)) {
    if (esIndice(hoja)) continue;
    const t = tituloDe(hoja);
    if (!/^Cuadro 3\./.test(t)) continue;
    const e = encabezado(t, p.n);
    if (!e || e.indice === null) continue;
    const viviendasParticulares = filaTotal(hoja, 2);
    if (viviendasParticulares === null) {
      // El único del país es Antártida Argentina: sus 81 habitantes están todos
      // en viviendas colectivas, así que no hay denominador ni numerador.
      avisos.push(`${p.rotulo}: «${e.nombre}» no tiene población en viviendas particulares, queda afuera`);
      continue;
    }
    poblacion.set(e.indice, viviendasParticulares);
    if (e.nombre && !nombres.has(e.indice)) {
      avisos.push(`${p.rotulo}: el cuadro 1.${p.n}.${e.indice} no nombra al departamento; se toma «${e.nombre}» del cuadro 3`);
      nombres.set(e.indice, e.nombre);
    }
  }

  const salida = [];
  for (const [indice, personas] of indigena) {
    const nombre = nombres.get(indice);
    const total = poblacion.get(indice);
    if (!nombre) throw new Error(`${p.rotulo}: el departamento ${indice} no tiene nombre en ningún cuadro`);
    if (total === undefined) throw new Error(`${p.rotulo}: «${nombre}» no tiene población en el cuadro 3`);
    if (personas > total) throw new Error(`${p.rotulo}: «${nombre}» tiene más indígenas que habitantes`);
    salida.push({ departamento: nombre, poblacion: total, indigena: personas });
  }
  salida.sort((a, b) => a.departamento.localeCompare(b.departamento, 'es'));
  return { departamentos: salida, totalProvincial };
}

const { pais, porRotulo } = jurisdicciones();
const provincias = [];
for (const p of PROVINCIAS) {
  const control = porRotulo.get(p.rotulo);
  const { pueblos, total, sinInformacion } = pueblosDe(p);
  const { departamentos, totalProvincial } = departamentosDe(p);

  if (total !== control.indigena) throw new Error(`${p.rotulo}: el cuadro 8 dice ${total} y el 10 dice ${control.indigena}`);
  if (totalProvincial !== null && totalProvincial !== total) throw new Error(`${p.rotulo}: el total del cuadro 1 no cierra`);
  const suma = departamentos.reduce((s, d) => s + d.indigena, 0);
  if (suma !== total) throw new Error(`${p.rotulo}: los departamentos suman ${suma} y la provincia ${total}`);
  const sumaPob = departamentos.reduce((s, d) => s + d.poblacion, 0);
  if (sumaPob !== control.poblacion) {
    avisos.push(`${p.rotulo}: los departamentos suman ${sumaPob} habitantes y el cuadro 10 dice ${control.poblacion}`);
  }

  pueblos.sort((a, b) => b.personas - a.personas || a.pueblo.localeCompare(b.pueblo, 'es'));
  provincias.push({
    provincia: p.rotulo,
    poblacion: control.poblacion,
    indigena: total,
    sinInformacion,
    pueblos,
    departamentos,
  });
}

const sumaPais = provincias.reduce((s, p) => s + p.indigena, 0);
if (sumaPais !== pais.indigena) throw new Error(`las provincias suman ${sumaPais} y el país ${pais.indigena}`);
const sumaPobPais = provincias.reduce((s, p) => s + p.poblacion, 0);
if (sumaPobPais !== pais.poblacion) throw new Error(`la población de las provincias no cierra con la del país`);

const rotulosPueblo = new Set(provincias.flatMap(p => p.pueblos.map(x => x.pueblo)));
const sinInfoPais = provincias.reduce((s, p) => s + p.sinInformacion, 0);
const totalDepartamentos = provincias.reduce((s, p) => s + p.departamentos.length, 0);

// ── Salidas ─────────────────────────────────────────────────────────────────

const tsv = (nombre, cabecera, filas) => {
  fs.writeFileSync(path.join(AQUI, nombre), [cabecera, ...filas].map(f => f.join('\t')).join('\n') + '\n', 'utf8');
};
tsv('censo2022-jurisdicciones.tsv',
  ['nivel', 'provincia', 'departamento', 'poblacion_viviendas_particulares', 'poblacion_indigena'],
  [['pais', '', '', pais.poblacion, pais.indigena],
   ...provincias.flatMap(p => [
     ['provincia', p.provincia, '', p.poblacion, p.indigena],
     ...p.departamentos.map(d => ['departamento', p.provincia, d.departamento, d.poblacion, d.indigena]),
   ])]);
tsv('censo2022-pueblos.tsv',
  ['provincia', 'pueblo', 'personas'],
  provincias.flatMap(p => [
    ...p.pueblos.map(x => [p.provincia, x.pueblo, x.personas]),
    [p.provincia, 'Sin información', p.sinInformacion],
  ]));

const q = s => JSON.stringify(s);
const cuerpo = provincias.map(p => `  {
    provincia: ${q(p.provincia)},
    poblacion: ${p.poblacion},
    indigena: ${p.indigena},
    sinInformacion: ${p.sinInformacion},
    pueblos: [
${p.pueblos.map(x => `      { pueblo: ${q(x.pueblo)}, personas: ${x.personas} },`).join('\n')}
    ],
    departamentos: [
${p.departamentos.map(d => `      { departamento: ${q(d.departamento)}, poblacion: ${d.poblacion}, indigena: ${d.indigena} },`).join('\n')}
    ],
  },`).join('\n');

fs.writeFileSync(SALIDA, `import type { CensoProvincia } from './pueblosOriginarios';

/**
 * GENERADO. No editar a mano.
 *
 * Lo arma \`_research/censo-2022-pueblos-indigenas/build-censo-indigena.mjs\`
 * desde los cuadros de resultados definitivos del Censo Nacional de Población,
 * Hogares y Viviendas 2022 (INDEC). Las decisiones de armado están ahí.
 *
 * ${pais.indigena.toLocaleString('es-AR')} personas que se reconocen indígenas o descendientes de pueblos
 * indígenas u originarios, sobre ${pais.poblacion.toLocaleString('es-AR')} en viviendas particulares.
 * ${rotulosPueblo.size} rótulos de pueblo, 24 jurisdicciones, ${totalDepartamentos} departamentos.
 *
 * Dos cosas que hay que decir cada vez que se muestran estos números:
 *
 * 1. El censo cuenta **autorreconocimiento donde la persona vive**, no
 *    territorio. Alguien que se reconoce kolla y vive en Rosario suma en Santa
 *    Fe. Por eso esta capa no dice de quién es la tierra ni quién estuvo antes:
 *    dice cuánta gente se reconoce indígena hoy, ahí.
 *
 * 2. ${sinInfoPais.toLocaleString('es-AR')} personas —el ${(sinInfoPais / pais.indigena * 100).toFixed(0)}% de las que se reconocen indígenas— no
 *    declararon a qué pueblo pertenecen. La lista de pueblos no es un padrón:
 *    es lo que contestó quien contestó.
 */
export const CENSO_AR: CensoProvincia[] = [
${cuerpo}
];

/** El total del país, para poder comparar la provincia contra él. */
export const CENSO_PAIS = {
  poblacion: ${pais.poblacion},
  indigena: ${pais.indigena},
  sinInformacion: ${sinInfoPais},
  /** Rótulos distintos en el cuadro nacional; en una provincia hay menos. */
  pueblos: ${rotulosPueblo.size},
} as const;
`, 'utf8');

console.log(`✓ ${SALIDA}`);
console.log(`  ${pais.indigena.toLocaleString('es-AR')} personas, ${provincias.length} jurisdicciones, ${totalDepartamentos} departamentos, ${rotulosPueblo.size} pueblos`);
console.log(`  sin declarar pueblo: ${sinInfoPais.toLocaleString('es-AR')} (${(sinInfoPais / pais.indigena * 100).toFixed(1)}%)`);
for (const a of avisos) console.log(`  · ${a}`);
