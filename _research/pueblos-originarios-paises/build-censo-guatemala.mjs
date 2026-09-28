/**
 * Arma `apps/terreno/lib/censoIndigena2018Gt.ts` desde los cuadros A5 y A6 del
 * XII Censo Nacional de Población y VII de Vivienda 2018 del INE de Guatemala.
 *
 * Los dos XLSX quedan congelados en `xlsx-guatemala/` al lado de este script,
 * tal como los baja el portal y byte por byte: es una foto fechada, no un
 * servicio. Se corre así, parado en la raíz del repo:
 *
 *     node _research/pueblos-originarios-paises/build-censo-guatemala.mjs
 *
 * El script no inventa nada y se cae si un total no cierra. Las verificaciones
 * están al final; si alguna falla, el archivo no se escribe.
 *
 * ── De dónde sale cada número ──────────────────────────────────────────────
 *
 * Dos cuadros, tres niveles cada uno:
 *
 *     A5.1 / A5.2  población total por pueblo de pertenencia, por
 *                  departamento y por municipio
 *     A6.1 / A6.2  población maya por comunidad lingüística, los mismos
 *                  dos niveles
 *
 * El A5.3 y el A6.3 bajan hasta lugar poblado (20.036 filas) y traen el
 * centroide de cada uno. **No se usan a propósito.** Un centroide censal no es
 * un territorio, y dibujar con eso «dónde vive tal pueblo» es exactamente lo
 * que la capa no hace: el nivel que se muestra es el municipio, que es una
 * jurisdicción y no una comunidad.
 *
 * ── Las trampas de estos cuadros ───────────────────────────────────────────
 *
 * 1. **Las 22 comunidades lingüísticas son subconjuntos de «Maya».** Sumarlas
 *    al pueblo Maya duplica 6.207.503 personas. Por eso viajan adentro del
 *    registro del territorio y no como pueblos más: el tipo las llama
 *    `comunidades` y el total maya es un campo aparte.
 *
 * 2. **El encabezado de la primera columna de datos no existe en el XLSX.** En
 *    el A5 la fila de rótulos arranca en «Garífuna» y en el A6 en «Akateka»:
 *    la celda anterior está combinada con el título de arriba y viene vacía.
 *    O sea que «Maya» y «Achi» se saben por posición, no por rótulo. Se
 *    escriben acá a mano y las verificaciones 2 y 6 los sostienen: si el INE
 *    corriera una columna, las sumas dejarían de cerrar.
 *
 * 3. **El guión es un cero.** El INE escribe `-` donde no hubo nadie. Se lee
 *    como 0, y la verificación 6 lo confirma: si `-` significara «sin dato»,
 *    las 22 comunidades no sumarían el total maya de la fila.
 *
 * 4. **No hay categoría «no declarado».** Las seis columnas del A5 suman
 *    exactamente la población censada, fila por fila (verificación 2). Es una
 *    propiedad del cuadro que conviene tener verificada, porque hace que el
 *    porcentaje sea directo: el denominador es la población, sin residuos.
 *
 * 5. **La fila del país no tiene nombre de departamento** y trae un número
 *    suelto en la columna del código. No se lee por ese número: se reconoce
 *    por ser la única fila con cifras y sin departamento.
 *
 * ── Lo que se deja afuera, y por qué ───────────────────────────────────────
 *
 * `Ladina(o)` y `Extranjera(o)` no son pueblos originarios.
 * `Afrodescendiente / Creole / Afromestizo` (27.647 personas) tampoco lo es, y
 * dejarlo afuera no es borrarlo: los tres viajan en el total del país para que
 * la suma se pueda auditar contra el cuadro, pero no por municipio, donde la
 * capa contesta otra pregunta.
 *
 * Y **no se calcula un total indígena.** El INE publica cada pueblo por
 * separado y no publica esa suma; hacerla sería nuestro número presentado como
 * del censo. Maya, Garífuna y Xinka salen los tres, cada uno con su cifra.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = fileURLToPath(new URL('.', import.meta.url));
const SALIDA = join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2018Gt.ts');

// ── Lectura de OOXML sin dependencias ──────────────────────────────────────

/**
 * Un .xlsx es un ZIP de XML. No hay descompresor en la línea de comandos de
 * esta máquina, así que se usa el de .NET a través de PowerShell.
 */
function descomprimir(xlsx) {
  const destino = mkdtempSync(join(tmpdir(), 'acequia-gt-'));
  execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
    `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
    `[System.IO.Compression.ZipFile]::ExtractToDirectory('${xlsx}', '${destino}')`]);
  return destino;
}

function desescapar(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

function abrirLibro(nombre) {
  const raiz = descomprimir(join(AQUI, 'xlsx-guatemala', `${nombre}.xlsx`));
  const leer = p => readFileSync(join(raiz, p), 'utf8');

  const compartidas = [...leer('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map(m => [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => desescapar(t[1])).join(''));

  const rels = Object.fromEntries(
    [...leer('xl/_rels/workbook.xml.rels').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)]
      .map(m => [m[1], m[2]]));
  const hojas = Object.fromEntries(
    [...leer('xl/workbook.xml').matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)]
      .map(m => [desescapar(m[1]), rels[m[2]]]));

  return {
    /** Las filas de una hoja, cada una como `{ columna: valor }`. */
    filas(hoja) {
      const xml = leer(join('xl', hojas[hoja].replace(/^\/?xl\//, '')));
      const out = [];
      for (const fila of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
        const celdas = {};
        for (const c of fila[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
          const v = /<v>([\s\S]*?)<\/v>/.exec(c[3]);
          const inline = /<is>([\s\S]*?)<\/is>/.exec(c[3]);
          let valor;
          if (inline) valor = [...inline[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => desescapar(t[1])).join('');
          else if (v) valor = /t="s"/.test(c[2]) ? compartidas[+v[1]] : desescapar(v[1]);
          if (valor !== undefined && String(valor).trim() !== '') celdas[c[1]] = valor;
        }
        if (Object.keys(celdas).length) out.push(celdas);
      }
      return out;
    },
    cerrar() { rmSync(raiz, { recursive: true, force: true }); },
  };
}

function caer(mensaje) {
  console.error(`\n  NO SE ESCRIBIO NADA: ${mensaje}\n`);
  process.exit(1);
}

/** Un entero del cuadro. El guión es cero; cualquier otra cosa hace caer. */
function entero(v, donde) {
  if (v === undefined || v === '-') return 0;
  const s = String(v).replace(/\s/g, '');
  if (!/^\d+$/.test(s)) caer(`valor no entero en ${donde}: ${JSON.stringify(v)}`);
  return Number(s);
}

// ── Las columnas, que se saben por posición ────────────────────────────────
// Ver la trampa 2. El orden es el de los cuadros y no se toca.

/** A5: pueblo de pertenencia. Los tres primeros son los que quedan. */
const PUEBLOS_A5 = ['maya', 'garifuna', 'xinka', 'afrodescendiente', 'ladino', 'extranjero'];

/** A6: las 22 comunidades lingüísticas mayas, como las escribe el INE. */
const COMUNIDADES = [
  'Achi', 'Akateka', 'Awakateka', "Ch'orti'", 'Chalchiteka', 'Chuj', "Itza'",
  'Ixil', "Jakalteko /Popti'", "K'iche'", 'Kaqchikel', 'Mam', 'Mopan',
  'Poqomam', "Poqomchi'", "Q'anjob'al", "Q'eqchi'", 'Sakapulteka',
  'Sipakapense', 'Tektiteka', "Tz'utujil", 'Uspanteka',
];

/** «A», «B», … «AA». Las hojas del A6 llegan hasta AA. */
function col(i) {
  return i < 26 ? String.fromCharCode(65 + i) : 'A' + String.fromCharCode(65 + i - 26);
}

// ── A5: la población por pueblo ────────────────────────────────────────────

const a5 = abrirLibro('cuadro-a5');

/** Las filas con cifras de una hoja del A5: se descartan títulos y la fuente. */
function datosA5(hoja, colNombre, colPrimera) {
  const filas = a5.filas(hoja);
  const out = [];
  for (const f of filas) {
    const cifra = f[colPrimera];
    if (cifra === undefined || !/^\d+$/.test(String(cifra))) continue;
    out.push({ fila: f, nombre: f[colNombre] });
  }
  return out;
}

// A5.1 — país y 22 departamentos. Columnas: A cod, B departamento, C población,
// D..I los seis pueblos.
const crudoDeptos = datosA5('A5_1', 'B', 'C');
const filaPais = crudoDeptos.find(r => r.nombre === undefined);
if (!filaPais) caer('no se encontró la fila del país en A5.1 (ver la trampa 5)');

function leerPueblos(f, desde) {
  const o = {};
  PUEBLOS_A5.forEach((p, i) => { o[p] = entero(f[col(desde + i)], `A5 ${p}`); });
  return o;
}

const PAIS = {
  poblacion: entero(filaPais.fila['C'], 'A5.1 país población'),
  ...leerPueblos(filaPais.fila, 3), // D
};

const departamentos = crudoDeptos
  .filter(r => r.nombre !== undefined)
  .map(r => ({
    codigo: entero(r.fila['A'], 'A5.1 código'),
    departamento: r.nombre,
    poblacion: entero(r.fila['C'], 'A5.1 población'),
    ...leerPueblos(r.fila, 3), // D
    municipios: [],
  }));

// A5.2 — 340 municipios. Columnas: A cod depto, B departamento, C cod municipio,
// D municipio, E población, F..K los seis pueblos.
const crudoMunis = a5.filas('A5_2').filter(f => f['D'] !== undefined && /^\d+$/.test(String(f['E'] ?? '')));
for (const f of crudoMunis) {
  const codDepto = entero(f['A'], 'A5.2 código de departamento');
  const depto = departamentos.find(d => d.codigo === codDepto);
  if (!depto) caer(`A5.2: el municipio ${f['D']} cita un departamento ${codDepto} que no está en A5.1`);
  depto.municipios.push({
    codigo: entero(f['C'], 'A5.2 código'),
    municipio: f['D'],
    poblacion: entero(f['E'], 'A5.2 población'),
    ...leerPueblos(f, 5), // F
    comunidades: [],
  });
}
a5.cerrar();

// ── A6: las comunidades lingüísticas mayas ─────────────────────────────────

const a6 = abrirLibro('cuadro-a6');

/** Las 22 comunidades de una fila, en el orden del cuadro y sin los ceros. */
function leerComunidades(f, desde, donde) {
  const out = [];
  let suma = 0;
  COMUNIDADES.forEach((c, i) => {
    const n = entero(f[col(desde + i)], `${donde} ${c}`);
    suma += n;
    if (n > 0) out.push([c, n]);
  });
  return { comunidades: out, suma };
}

// A6.1 — país y departamentos. C total maya, D..AA las 22 comunidades.
const crudoA6Deptos = a6.filas('A6_1').filter(f => /^\d+$/.test(String(f['C'] ?? '')));
const a6Pais = crudoA6Deptos.find(f => f['B'] === undefined);
if (!a6Pais) caer('no se encontró la fila del país en A6.1');
const comunidadesPais = leerComunidades(a6Pais, 3, 'A6.1 país');

for (const f of crudoA6Deptos) {
  if (f['B'] === undefined) continue;
  const depto = departamentos.find(d => d.departamento === f['B']);
  if (!depto) caer(`A6.1 nombra un departamento que no está en A5.1: ${f['B']}`);
  const { comunidades, suma } = leerComunidades(f, 3, `A6.1 ${f['B']}`);
  depto.comunidades = comunidades;
  depto.mayaA6 = entero(f['C'], 'A6.1 total maya');
  depto.sumaComunidades = suma;
}

// A6.2 — municipios. E total maya, F..AA las 22 comunidades.
for (const f of a6.filas('A6_2')) {
  if (f['D'] === undefined || !/^\d+$/.test(String(f['E'] ?? ''))) continue;
  const codigo = entero(f['C'], 'A6.2 código de municipio');
  const depto = departamentos.find(d => d.codigo === entero(f['A'], 'A6.2 código de departamento'));
  const muni = depto?.municipios.find(m => m.codigo === codigo);
  if (!muni) caer(`A6.2 nombra un municipio que no está en A5.2: ${codigo} ${f['D']}`);
  const { comunidades, suma } = leerComunidades(f, 5, `A6.2 ${f['D']}`);
  muni.comunidades = comunidades;
  muni.mayaA6 = entero(f['E'], 'A6.2 total maya');
  muni.sumaComunidades = suma;
}
a6.cerrar();

// ── Las verificaciones. Si alguna falla, no se escribe nada ────────────────

const problemas = [];
const igual = (a, b, que) => { if (a !== b) problemas.push(`${que}: ${a} ≠ ${b}`); };

// 1. Los 22 departamentos suman el país, en las siete cifras.
igual(departamentos.reduce((s, d) => s + d.poblacion, 0), PAIS.poblacion, '1. población: departamentos vs país');
for (const p of PUEBLOS_A5) {
  igual(departamentos.reduce((s, d) => s + d[p], 0), PAIS[p], `1. ${p}: departamentos vs país`);
}

// 2. Fila por fila, los seis pueblos suman la población: no hay «no declarado».
const sumaPueblos = r => PUEBLOS_A5.reduce((s, p) => s + r[p], 0);
igual(sumaPueblos(PAIS), PAIS.poblacion, '2. los seis pueblos suman la población del país');
for (const d of departamentos) {
  igual(sumaPueblos(d), d.poblacion, `2. los seis pueblos suman la población de ${d.departamento}`);
  for (const m of d.municipios) {
    igual(sumaPueblos(m), m.poblacion, `2. los seis pueblos suman la población de ${m.municipio}`);
  }
}

// 3. Los municipios suman su departamento.
for (const d of departamentos) {
  igual(d.municipios.reduce((s, m) => s + m.poblacion, 0), d.poblacion, `3. población de ${d.departamento}`);
  for (const p of PUEBLOS_A5) {
    igual(d.municipios.reduce((s, m) => s + m[p], 0), d[p], `3. ${p} de ${d.departamento}`);
  }
}

// 4. Son 22 departamentos y 340 municipios, con códigos únicos.
igual(departamentos.length, 22, '4. cantidad de departamentos');
const codigos = departamentos.flatMap(d => d.municipios.map(m => m.codigo));
igual(codigos.length, 340, '4. cantidad de municipios');
igual(new Set(codigos).size, 340, '4. códigos de municipio únicos');

// 5. El total maya del A6 es el mismo que el del A5, en los tres niveles.
igual(entero(a6Pais['C'], 'A6.1 país'), PAIS.maya, '5. total maya del país: A6 vs A5');
for (const d of departamentos) {
  igual(d.mayaA6, d.maya, `5. total maya de ${d.departamento}: A6 vs A5`);
  for (const m of d.municipios) igual(m.mayaA6, m.maya, `5. total maya de ${m.municipio}: A6 vs A5`);
}

// 6. Las 22 comunidades suman el total maya. Sostiene la trampa 2 y la 3.
igual(comunidadesPais.suma, PAIS.maya, '6. las 22 comunidades suman el total maya del país');
for (const d of departamentos) {
  igual(d.sumaComunidades, d.maya, `6. las 22 comunidades suman el total maya de ${d.departamento}`);
  for (const m of d.municipios) {
    igual(m.sumaComunidades, m.maya, `6. las 22 comunidades suman el total maya de ${m.municipio}`);
  }
}

// 7. Las cifras que el relevamiento dejó anotadas el 26/09/2026, tal cual.
igual(PAIS.poblacion, 14901286, '7. población censada');
igual(PAIS.maya, 6207503, '7. maya');
igual(PAIS.garifuna, 19529, '7. garífuna');
igual(PAIS.xinka, 264167, '7. xinka');
igual(PAIS.afrodescendiente, 27647, '7. afrodescendiente');
igual(PAIS.ladino, 8346120, '7. ladino');
igual(PAIS.extranjero, 36320, '7. extranjero');

if (problemas.length) {
  console.error('\n  Verificaciones que no cerraron:');
  for (const p of problemas.slice(0, 25)) console.error('   · ' + p);
  if (problemas.length > 25) console.error(`   … y ${problemas.length - 25} más`);
  caer(`${problemas.length} verificación(es) fallaron`);
}

// ── Municipios homónimos dentro de un mismo departamento ───────────────────
// Si los hubiera, el resolver no podría elegir y habría que decirlo. Se mide,
// no se supone.
const homonimos = [];
for (const d of departamentos) {
  const vistos = new Map();
  for (const m of d.municipios) {
    const k = m.municipio.toLowerCase();
    vistos.set(k, (vistos.get(k) ?? 0) + 1);
  }
  for (const [k, n] of vistos) if (n > 1) homonimos.push(`${d.departamento}: ${k} ×${n}`);
}

// ── Escritura ──────────────────────────────────────────────────────────────

const txt = s => JSON.stringify(s);
const lista = cs => '[' + cs.map(([c, n]) => `[${txt(c)},${n}]`).join(',') + ']';

const lineas = [];
lineas.push(`/**
 * Censo 2018 de Guatemala: población por pueblo de pertenencia y, dentro del
 * pueblo Maya, por comunidad lingüística. Por departamento y por municipio.
 *
 * **Generado por \`_research/pueblos-originarios-paises/build-censo-guatemala.mjs\`
 * desde los cuadros A5 y A6 del INE. No se edita a mano.** Los XLSX quedan
 * congelados al lado del script y el script se cae si un total no cierra: ahí
 * está explicado de dónde sale cada número y cuáles son las trampas.
 *
 * ── Qué mide, que no es lo mismo que en los otros países ───────────────────
 *
 * La variable es **pueblo de pertenencia**, por autoidentificación, y se le
 * pregunta a **toda la población censada**: 14.901.286 personas. No hay recorte
 * de edad como en el Perú (12 y más) ni la pregunta es por lengua como en
 * México. Así que el denominador es la población entera y el porcentaje es
 * directo.
 *
 * Y no hay categoría «no declarado»: las seis columnas del cuadro suman
 * exactamente la población, fila por fila. El script lo verifica en los tres
 * niveles antes de escribir esto.
 *
 * ── Por qué no hay un total «indígena» ─────────────────────────────────────
 *
 * Porque el INE no lo publica. Publica Maya, Garífuna y Xinka por separado, y
 * sumarlos sería nuestro cálculo presentado como del censo. Los tres salen a
 * pantalla con su cifra, y quien lea suma si quiere.
 *
 * ── Las 22 comunidades lingüísticas están adentro del pueblo Maya ──────────
 *
 * No son pueblos más: son la subdivisión del cuadro A6. K'iche', Q'eqchi', Mam
 * y Kaqchikel son los cuatro grandes y entre los cuatro son dos tercios de los
 * 6.207.503 mayas. Sumarlas al total maya contaría dos veces a la misma gente,
 * y por eso viajan adentro de cada territorio, en \`comunidades\`, y nunca al
 * lado de \`maya\`.
 *
 * ── Lo que está afuera ─────────────────────────────────────────────────────
 *
 * El cuadro baja hasta lugar poblado (20.036 filas) y trae el centroide de cada
 * uno. No se usa: un centroide censal no es un territorio, y la capa no dibuja
 * dónde vive un pueblo. El nivel que se muestra es el municipio, que es una
 * jurisdicción.
 *
 * \`Ladina(o)\` y \`Extranjera(o)\` no son pueblos originarios, y
 * \`Afrodescendiente / Creole / Afromestizo\` tampoco lo es. Los tres viajan en
 * el total del país —para que la suma se pueda auditar contra el cuadro— y no
 * por municipio.
 *
 * ── La fuente ──────────────────────────────────────────────────────────────
 *
 * INE de Guatemala, XII Censo Nacional de Población y VII de Vivienda 2018,
 * cuadros A5 y A6, publicados en datos.ine.gob.gt con licencia Creative
 * Commons Attribution declarada en el propio dataset (cc-by en el CKAN).
 * La licencia la declara el dataset del portal de datos abiertos, no el visor
 * censo2018.ine.gob.gt: se cita el dataset.
 */

/** Una comunidad lingüística maya y su población: \`["K'iche'", 1680551]\`. */
export type ComunidadMaya = readonly [comunidad: string, personas: number];

/** Un municipio guatemalteco. Son 340. */
export interface CensoGtMunicipio {
  /** Código del INE: los dos o tres primeros dígitos son el departamento. */
  codigo: number;
  municipio: string;
  poblacion: number;
  maya: number;
  garifuna: number;
  xinka: number;
  /**
   * Las comunidades lingüísticas mayas con al menos una persona, **en el orden
   * del cuadro** (el alfabético del INE), no por tamaño. Ordenar es cosa de
   * quien muestra: ver \`comunidadesDestacadasGt\`.
   *
   * Suman exactamente \`maya\`. No se suman a \`maya\`.
   */
  comunidades: ComunidadMaya[];
}

/** Un departamento. Son 22. */
export interface CensoGtDepartamento {
  codigo: number;
  departamento: string;
  poblacion: number;
  maya: number;
  garifuna: number;
  xinka: number;
  comunidades: ComunidadMaya[];
  municipios: CensoGtMunicipio[];
}

/** Las 22 comunidades lingüísticas mayas, como las escribe el INE. */
export const COMUNIDADES_MAYAS_GT = ${JSON.stringify(COMUNIDADES)} as const;

export const CENSO_GT: CensoGtDepartamento[] = [`);

for (const d of departamentos) {
  lineas.push(`  {`);
  lineas.push(`    codigo: ${d.codigo}, departamento: ${txt(d.departamento)},`);
  lineas.push(`    poblacion: ${d.poblacion}, maya: ${d.maya}, garifuna: ${d.garifuna}, xinka: ${d.xinka},`);
  lineas.push(`    comunidades: ${lista(d.comunidades)},`);
  lineas.push(`    municipios: [`);
  for (const m of d.municipios) {
    lineas.push(`    { codigo: ${m.codigo}, municipio: ${txt(m.municipio)}, poblacion: ${m.poblacion}, maya: ${m.maya}, garifuna: ${m.garifuna}, xinka: ${m.xinka},`);
    lineas.push(`      comunidades: ${lista(m.comunidades)} },`);
  }
  lineas.push(`    ],`);
  lineas.push(`  },`);
}

lineas.push(`];

/**
 * El país. \`afrodescendiente\`, \`ladino\` y \`extranjero\` están para que la suma
 * se pueda auditar contra el cuadro A5: los seis dan \`poblacion\` exacta.
 *
 * No hay campo \`indigena\`: ver el encabezado.
 */
export const CENSO_GT_PAIS = {
  poblacion: ${PAIS.poblacion},
  maya: ${PAIS.maya},
  garifuna: ${PAIS.garifuna},
  xinka: ${PAIS.xinka},
  afrodescendiente: ${PAIS.afrodescendiente},
  ladino: ${PAIS.ladino},
  extranjero: ${PAIS.extranjero},
  departamentos: ${departamentos.length},
  municipios: ${codigos.length},
  /** Las 22 comunidades lingüísticas mayas del país, en el orden del cuadro. */
  comunidades: ${lista(comunidadesPais.comunidades)} as ComunidadMaya[],
} as const;
`);

writeFileSync(SALIDA, lineas.join('\n'), 'utf8');

console.log(`  ✓ ${SALIDA}`);
console.log(`    ${departamentos.length} departamentos · ${codigos.length} municipios`);
console.log(`    ${departamentos.reduce((s, d) => s + d.municipios.reduce((t, m) => t + m.comunidades.length, 0), 0)} pares municipio × comunidad con gente`);
console.log(`    población ${PAIS.poblacion} = maya ${PAIS.maya} + garífuna ${PAIS.garifuna} + xinka ${PAIS.xinka} + afro ${PAIS.afrodescendiente} + ladino ${PAIS.ladino} + extranjero ${PAIS.extranjero}`);
console.log(`    las 7 verificaciones cerraron`);
console.log(homonimos.length
  ? `    ⚠ municipios homónimos dentro de un departamento: ${homonimos.join(' · ')}`
  : `    sin municipios homónimos dentro de un mismo departamento`);
