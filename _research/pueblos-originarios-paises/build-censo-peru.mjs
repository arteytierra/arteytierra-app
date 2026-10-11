/**
 * Arma `apps/terreno/lib/censoIndigena2017Pe.ts` desde los anexos estadísticos
 * de «Perú: Autoidentificación étnica» (INEI, 2018), la publicación de
 * resultados finales recodificados de los Censos Nacionales 2017.
 *
 * Los tres XLSX quedan congelados en `xlsx-peru/` al lado de este script, tal
 * como los baja el INEI y byte por byte: es una foto fechada, no un servicio.
 * Se corre así, parado en la raíz del repo:
 *
 *     node _research/pueblos-originarios-paises/build-censo-peru.mjs
 *
 * El script no inventa nada y se cae si un total no cierra. Las seis
 * verificaciones están al final; si alguna falla, el archivo no se escribe.
 *
 * ── De dónde sale cada número ──────────────────────────────────────────────
 *
 * El INEI no publica un cuadro con las cuatro autoidentificaciones juntas por
 * departamento. Publica tres anexos, y cada uno compara **su** grupo contra la
 * misma columna residual «Blanca(o), mestiza(o) y otra(o)»:
 *
 *     anexo01 → Indígena u originaria de los Andes   | Blanca, mestiza y otra
 *     anexo04 → Indígena u originaria de la Amazonía | Blanca, mestiza y otra
 *     anexo07 → Afroperuana(o)                       | Blanca, mestiza y otra
 *
 * Las cuatro categorías son excluyentes y exhaustivas: a escala nacional suman
 * 5.771.885 + 212.823 + 828.894 + 16.382.789 = 23.196.391, que es exactamente
 * la población censada de 12 y más años. **Por eso el denominador por
 * departamento se puede sumar de los tres anexos y no es una estimación**, y
 * por eso el script verifica que la columna residual sea idéntica en los tres
 * antes de usarla una sola vez.
 *
 * ── Las trampas de estos cuadros ───────────────────────────────────────────
 *
 * 1. **El universo son las personas de 12 y más años.** La pregunta 25 no se le
 *    hizo a los menores de 12. Dividir por la población total del país da un
 *    porcentaje que no significa lo que parece; el denominador correcto está en
 *    el propio cuadro y es el que viaja acá.
 *
 * 2. **El cuadro trae 25 departamentos y además abre Lima en dos.**
 *    «Provincia de Lima» son los 43 distritos de Lima metropolitana y «Región
 *    Lima» las otras nueve provincias del departamento. Se suman exacto a
 *    «Lima» y no se montan: sus proporciones indígenas son casi la misma
 *    —17,2% y 17,9%— y el geocodificador no las distingue sin riesgo, porque a
 *    Callao, que es otro departamento, también le pone `state_district`
 *    «Lima Metropolitana». El script comprueba que cierren y las descarta.
 *
 * 3. **Los rótulos de departamento llevan la llamada al pie pegada**
 *    («Provincia de Lima 2/»), y el número de la llamada **cambia entre
 *    cuadros**: en el 1.1 Lima es «2/» y en el 1.3 es «3/». Cotejar cuadros por
 *    el rótulo crudo deja los dos pedazos de Lima sin casar y en silencio.
 *
 * 4. **La lengua materna no es el pueblo.** El cuadro x.3 pregunta qué lengua
 *    aprendió en la niñez, y 2.473.986 de los 5.771.885 indígenas de los Andes
 *    contestan castellano. Es un dato sobre la lengua, no sobre la pertenencia,
 *    y la pantalla lo dice.
 *
 * 5. **«Awajún/Aguaruna», «Shipibo/Konibo», «Shawi/Chayahuita» y
 *    «Matsigenka/Machiguenga» son una lengua cada uno.** La barra separa dos
 *    denominaciones de la misma lengua, no dos lenguas. Nunca se parten, igual
 *    que las barras del censo paraguayo.
 *
 * 6. **«Prov. Const. del Callao» es una abreviatura de la tabla**, no el nombre
 *    del departamento. Se expande a «Provincia Constitucional del Callao», que
 *    es como lo escribe el propio INEI en prosa.
 *
 * ── Lo que este censo no da ────────────────────────────────────────────────
 *
 * No hay nada abajo del departamento: los anexos abren por área urbana/rural,
 * por sexo y por edad, pero no por provincia ni por distrito. Y no hay un
 * conteo comparable por cada uno de los 55 pueblos oficiales; lo más cerca es
 * la lengua materna. El relevamiento completo está en `peru.json`.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// `fileURLToPath` y no `.pathname`: la ruta de este repo tiene espacios, y
// crudo llegan como «%20» y ningún archivo existe.
const AQUI = fileURLToPath(new URL('.', import.meta.url));
const SALIDA = join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2017Pe.ts');

// ── Lectura de OOXML sin dependencias ──────────────────────────────────────

/**
 * Un .xlsx es un ZIP de XML. No hay descompresor en la línea de comandos de
 * esta máquina, así que se usa el de .NET a través de PowerShell.
 */
function descomprimir(xlsx) {
  const destino = mkdtempSync(join(tmpdir(), 'acequia-pe-'));
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
  const raiz = descomprimir(join(AQUI, 'xlsx-peru', `${nombre}.xlsx`));
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

// ── Los rótulos ────────────────────────────────────────────────────────────

/** Le saca la llamada al pie al nombre del departamento. Ver la trampa 3. */
function limpiarRotulo(s) {
  return s.replace(/\s*\d+\/\s*$/, '').trim();
}

/** Comilla simple, que es la que usa el resto del código de acequia. */
function cita(s) {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * Las quince categorías de lengua materna del cuadro x.3, en el orden del
 * cuadro. La llamada «2/» de «Otra lengua nativa» dice: incluye Kichwa, Ticuna,
 * Nomatsigenga, Wampis, Yine, entre otras.
 */
const LENGUAS = ['Quechua', 'Aimara', 'Ashaninka', 'Awajún/Aguaruna', 'Shipibo/Konibo',
  'Shawi/Chayahuita', 'Matsigenka/Machiguenga', 'Achuar', 'Otra lengua nativa',
  'Castellano', 'Portugués', 'Otra lengua extranjera', 'Lengua de señas',
  'No escucha ni habla', 'No sabe/No responde'];

/** Filas que encabezan un bloque del cuadro pero no son un departamento. */
const NO_SON_DEPARTAMENTO = new Set(['Total', 'Área Urbana', 'Área Rural', 'Área urbana', 'Área rural']);

/** Los dos pedazos de Lima, que se comprueban y se descartan. Ver la trampa 2. */
const PEDAZOS_DE_LIMA = new Set(['Provincia de Lima', 'Región Lima']);

/** «Prov. Const. del Callao» es una abreviatura del cuadro. Ver la trampa 6. */
const EXPANSIONES = { 'Prov. Const. del Callao': 'Provincia Constitucional del Callao' };

// ── Los cuadros ────────────────────────────────────────────────────────────

/**
 * Cuadros x.1: población por grupo especial de edad. Los subniveles llevan un
 * espacio adelante, así que un rótulo sin espacio encabeza un bloque.
 *
 * Devuelve, por rótulo, el total del grupo (columna B) y el de la columna
 * residual «Blanca(o), mestiza(o) y otra(o)» (columna E).
 */
function leerCuadro1(libro, hoja) {
  const out = new Map();
  for (const c of libro.filas(hoja)) {
    if (!c.A || !c.B || c.A.startsWith(' ')) continue;
    if (!/^\d+$/.test(String(c.B).trim())) continue;
    out.set(limpiarRotulo(c.A), { grupo: +c.B, resto: +c.E });
  }
  return out;
}

/**
 * Cuadros x.3: población por lengua materna. Acá los subniveles son las quince
 * lenguas y no llevan sangría, así que el corte se hace por la lista.
 */
function leerCuadro3(libro, hoja) {
  const out = new Map();
  let actual = null;
  for (const c of libro.filas(hoja)) {
    if (!c.A || c.B === undefined) continue;
    const rotulo = limpiarRotulo(c.A);
    if (LENGUAS.includes(rotulo)) {
      if (actual) actual.set(rotulo, +c.B);
      continue;
    }
    if (!/^\d+$/.test(String(c.B).trim())) continue;
    actual = new Map();
    out.set(rotulo, actual);
  }
  return out;
}

const a01 = abrirLibro('anexo01');
const a04 = abrirLibro('anexo04');
const a07 = abrirLibro('anexo07');

const andes = leerCuadro1(a01, 'Ane. 1.1');
const amazonia = leerCuadro1(a04, 'Ane. 2.1');
const afro = leerCuadro1(a07, 'Ane. 3.1');
const lenguaAndes = leerCuadro3(a01, 'Ane. 1.3');
const lenguaAmazonia = leerCuadro3(a04, 'Ane. 2.3');

a01.cerrar(); a04.cerrar(); a07.cerrar();

// ── Verificaciones ─────────────────────────────────────────────────────────

const problemas = [];
const exigir = (ok, que) => { if (!ok) problemas.push(que); };

/** 1. Los tres anexos tienen los mismos rótulos y la misma columna residual. */
for (const rotulo of andes.keys()) {
  exigir(amazonia.has(rotulo) && afro.has(rotulo), `${rotulo} falta en el anexo 04 o en el 07`);
  exigir(lenguaAndes.has(rotulo) && lenguaAmazonia.has(rotulo), `${rotulo} falta en los cuadros de lengua`);
  if (!amazonia.has(rotulo) || !afro.has(rotulo)) continue;
  exigir(andes.get(rotulo).resto === amazonia.get(rotulo).resto
    && andes.get(rotulo).resto === afro.get(rotulo).resto,
    `la columna residual de ${rotulo} no es la misma en los tres anexos`);
}

/** 2. La lengua materna suma el total del grupo, en los dos cuadros. */
for (const rotulo of andes.keys()) {
  if (!lenguaAndes.has(rotulo) || !lenguaAmazonia.has(rotulo)) continue;
  const sa = LENGUAS.reduce((s, l) => s + (lenguaAndes.get(rotulo).get(l) ?? 0), 0);
  const sm = LENGUAS.reduce((s, l) => s + (lenguaAmazonia.get(rotulo).get(l) ?? 0), 0);
  exigir(sa === andes.get(rotulo).grupo, `la lengua materna andina de ${rotulo} suma ${sa} y no ${andes.get(rotulo).grupo}`);
  exigir(sm === amazonia.get(rotulo).grupo, `la lengua materna amazónica de ${rotulo} suma ${sm} y no ${amazonia.get(rotulo).grupo}`);
}

const departamentos = [...andes.keys()]
  .filter(r => !NO_SON_DEPARTAMENTO.has(r) && !PEDAZOS_DE_LIMA.has(r));

/** 3. Son veinticinco: los 24 departamentos más la Provincia Constitucional del Callao. */
exigir(departamentos.length === 25, `hay ${departamentos.length} departamentos y no 25`);

/** 4. Los dos pedazos de Lima cierran contra Lima, aunque después se descarten. */
for (const [campo, tabla] of [['andes', andes], ['amazonia', amazonia], ['afro', afro]]) {
  const partes = [...PEDAZOS_DE_LIMA].reduce((s, r) => s + (tabla.get(r)?.grupo ?? NaN), 0);
  exigir(partes === tabla.get('Lima').grupo,
    `los dos pedazos de Lima suman ${partes} en ${campo} y Lima tiene ${tabla.get('Lima').grupo}`);
}

const PAIS = { censada12: 23196391, andes: 5771885, amazonia: 212823, afroperuano: 828894, resto: 16382789 };

/**
 * Cuántos de los indígenas andinos declaran el castellano como lengua materna.
 * Es el número que sostiene la advertencia de la pantalla —la lengua materna no
 * es el pueblo—, así que sale del cuadro y no de la memoria de nadie.
 */
const CASTELLANO_ANDES = lenguaAndes.get('Total').get('Castellano');
exigir(CASTELLANO_ANDES > 0 && CASTELLANO_ANDES < PAIS.andes,
  `el castellano como lengua materna andina dio ${CASTELLANO_ANDES}`);

/** 5. Las cuatro categorías nacionales son las publicadas y cierran el universo. */
exigir(andes.get('Total').grupo === PAIS.andes, 'el total andino nacional no es 5.771.885');
exigir(amazonia.get('Total').grupo === PAIS.amazonia, 'el total amazónico nacional no es 212.823');
exigir(afro.get('Total').grupo === PAIS.afroperuano, 'el total afroperuano nacional no es 828.894');
exigir(andes.get('Total').resto === PAIS.resto, 'la columna residual nacional no es 16.382.789');
exigir(PAIS.andes + PAIS.amazonia + PAIS.afroperuano + PAIS.resto === PAIS.censada12,
  'las cuatro categorías nacionales no suman 23.196.391');

/** 6. Los veinticinco departamentos suman el país, en las cuatro categorías. */
const suma = campo => departamentos.reduce((s, r) => s + campo(r), 0);
exigir(suma(r => andes.get(r).grupo) === PAIS.andes, 'los departamentos no suman el total andino');
exigir(suma(r => amazonia.get(r).grupo) === PAIS.amazonia, 'los departamentos no suman el total amazónico');
exigir(suma(r => afro.get(r).grupo) === PAIS.afroperuano, 'los departamentos no suman el total afroperuano');
exigir(suma(r => andes.get(r).resto) === PAIS.resto, 'los departamentos no suman la columna residual');

if (problemas.length) {
  console.error('No se escribió nada. Los cuadros no cierran:');
  for (const p of problemas) console.error('  -', p);
  process.exit(1);
}

// ── La tabla ───────────────────────────────────────────────────────────────

const filas = departamentos.map(rotulo => {
  const a = andes.get(rotulo), m = amazonia.get(rotulo), f = afro.get(rotulo);
  return {
    departamento: EXPANSIONES[rotulo] ?? rotulo,
    censada12: a.grupo + m.grupo + f.grupo + a.resto,
    andes: a.grupo,
    amazonia: m.grupo,
    indigena: a.grupo + m.grupo,
    lenguas: LENGUAS.map(l => (lenguaAndes.get(rotulo).get(l) ?? 0) + (lenguaAmazonia.get(rotulo).get(l) ?? 0)),
  };
}).sort((x, y) => x.departamento.localeCompare(y.departamento, 'es'));

const cab = `/**
 * GENERADO. No editar a mano: sale de
 * \`_research/pueblos-originarios-paises/build-censo-peru.mjs\`, que lee los tres
 * anexos congelados al lado suyo y no escribe nada si un total no cierra.
 *
 * Censos Nacionales 2017 (INEI de Perú), momento censal 22 de octubre de 2017.
 * Los números son los de «Perú: Autoidentificación étnica» (2018), la
 * publicación final que recodifica y controla la consistencia de las respuestas
 * a la pregunta 25; no son los de los primeros perfiles difundidos, que daban
 * 5.176.809 quechuas donde el cuadro final da 5.179.774.
 *
 * El INEI no adjunta una licencia estándar a cada archivo, pero su página «Uso
 * de la información» del Censo 2017 dice expresamente que los resultados pueden
 * ser usados por empresas privadas para orientar actividades comerciales. Se
 * usan citando al INEI y a los Censos Nacionales 2017.
 *
 * ── Cuatro cosas que hay que saber para leer estos números ─────────────────
 *
 *   1. **El universo son las personas de 12 y más años.** La pregunta por la
 *      autoidentificación no se le hizo a los menores de 12, así que el
 *      denominador de todo este archivo es \`censada12\` y no la población total.
 *      Dividir por la población del país daría un porcentaje más chico que no
 *      significa nada.
 *
 *   2. **\`indigena\` es la suma de dos grupos que el INEI publica separados.**
 *      Indígena u originaria de los Andes —quechua, aimara y otro pueblo
 *      originario andino— e indígena u originaria de la Amazonía. El total
 *      nacional de 5.984.708 no aparece como una sola fila en ningún cuadro: es
 *      esta suma.
 *
 *   3. **\`censada12\` se suma de cuatro columnas publicadas, y es exacto.** El
 *      INEI no publica un cuadro con las cuatro autoidentificaciones juntas por
 *      departamento: publica un anexo por grupo, cada uno contra la misma
 *      columna residual «Blanca(o), mestiza(o) y otra(o)». Las cuatro son
 *      excluyentes y exhaustivas y cierran exactamente el universo nacional, y
 *      el script verifica que la columna residual sea idéntica en los tres
 *      anexos antes de usarla.
 *
 *   4. **No hay nada abajo del departamento.** Los anexos abren por área
 *      urbana/rural, por sexo y por edad, no por provincia ni por distrito.
 *      Perú contesta a escala departamental y nada más.
 *
 * ── La lengua materna no es el pueblo ──────────────────────────────────────
 *
 * \`lenguas\` es el cuadro x.3: qué lengua o idioma aprendió en la niñez esa
 * misma población indígena. No es la lista de pueblos y no debe leerse como
 * tal: 2.473.986 de los 5.771.885 indígenas de los Andes declaran castellano
 * como lengua materna. Es lo más cerca que llega este censo de decir quiénes
 * viven en un departamento, porque no publica un conteo comparable para cada
 * uno de los 55 pueblos oficiales del Ministerio de Cultura.
 *
 * Las barras de «Awajún/Aguaruna», «Shipibo/Konibo», «Shawi/Chayahuita» y
 * «Matsigenka/Machiguenga» separan dos denominaciones de **una** lengua, no dos
 * lenguas. Nunca se parten, igual que las del censo paraguayo.
 */

/** Las quince categorías de lengua materna del cuadro x.3, en su orden. */
export const LENGUAS_PE: readonly string[] = [
${LENGUAS.map(l => `  ${cita(l)},`).join('\n')}
];

/** Cuántas de \`LENGUAS_PE\` son lenguas originarias. Las nueve primeras. */
export const LENGUAS_ORIGINARIAS_PE = 9;

export interface CensoPeDepartamento {
  departamento: string;
  /** Población censada de 12 y más años: el universo de la pregunta 25. */
  censada12: number;
  /** Indígena u originaria de los Andes: quechua, aimara y otro pueblo andino. */
  andes: number;
  /** Indígena u originaria de la Amazonía. */
  amazonia: number;
  /** \`andes + amazonia\`. El INEI no lo publica como una fila; es esta suma. */
  indigena: number;
  /** Lengua materna de esa población indígena, en el orden de \`LENGUAS_PE\`. */
  lenguas: number[];
}

export const CENSO_PE: CensoPeDepartamento[] = [
`;

const cuerpo = filas.map(f => `  {
    departamento: ${cita(f.departamento)},
    censada12: ${f.censada12},
    andes: ${f.andes},
    amazonia: ${f.amazonia},
    indigena: ${f.indigena},
    lenguas: [${f.lenguas.join(', ')}],
  },`).join('\n');

const pie = `
];

/**
 * El país, con las cuatro categorías que cierran el universo. \`afroperuano\` y
 * \`resto\` no son de esta capa —el pueblo afroperuano no es un pueblo
 * originario— y están sólo para que se pueda ver que la cuenta cierra:
 * ${PAIS.andes} + ${PAIS.amazonia} + ${PAIS.afroperuano} + ${PAIS.resto} = ${PAIS.censada12}.
 */
export const CENSO_PE_PAIS = {
  censada12: ${PAIS.censada12},
  andes: ${PAIS.andes},
  amazonia: ${PAIS.amazonia},
  indigena: ${PAIS.andes + PAIS.amazonia},
  afroperuano: ${PAIS.afroperuano},
  resto: ${PAIS.resto},
  /** Indígenas de los Andes cuya lengua materna es el castellano. Es la mayoría. */
  castellanoAndes: ${CASTELLANO_ANDES},
} as const;
`;

writeFileSync(SALIDA, cab + cuerpo + pie, 'utf8');
console.log(`Escrito ${SALIDA}`);
console.log(`${filas.length} departamentos, ${PAIS.andes + PAIS.amazonia} personas indígenas de ${PAIS.censada12} censadas de 12 y más años.`);
