/**
 * Baja los 32 archivos ITER del Censo 2020 del INEGI y congela `iter-municipios.csv`.
 *
 *   node _research/pueblos-originarios-paises/iter-mexico/bajar-iter.mjs
 *
 * El ITER —«Principales resultados por localidad»— trae 231 columnas y 195.662
 * filas de localidad. Acá se guardan **nueve columnas y las filas de total**:
 * las 32 de entidad y las 2.469 de municipio. Son 130 KB en vez de 36 MB, y es
 * exactamente lo que los términos del INEGI llaman «extraer parcialmente la
 * información», que está permitido.
 *
 * Lo que NO se toca: ningún número se recalcula, se redondea ni se completa. Se
 * copian los enteros tal como vienen. Las sumas las hace `build-censo-mexico.mjs`
 * y aborta si no cierran.
 *
 * ── Por qué el script trae su propio lector de zip ──────────────────────────
 *
 * El INEGI publica cada entidad como .zip y esta máquina no tiene Python ni un
 * `tar` que lea zip (el de Git Bash es GNU tar y falla). Antes que depender de
 * un binario que puede no estar, el script lee el zip con `zlib.inflateRawSync`,
 * que viene en Node: son treinta líneas y funciona igual en cualquier máquina.
 *
 * ── La fuente ───────────────────────────────────────────────────────────────
 *
 * INEGI — Censo de Población y Vivienda 2020, «Principales resultados por
 * localidad (ITER)». Fecha de referencia del censo: 15 de marzo de 2020.
 * El propio archivo de metadatos de cada entidad declara
 * `license: https://www.inegi.org.mx/inegi/terminos.html`, que dice: «Puede
 * explotar comercialmente la información, utilizándola como insumo para generar
 * otros productos o servicios», con la obligación de acreditar al INEGI y de
 * avisarle al usuario final de cualquier transformación que se le haga.
 */
import { writeFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, 'iter-municipios.csv');

const URL_ITER = (ent) =>
  `https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/iter/iter_${ent}_cpv2020_csv.zip`;

/** Las nueve columnas que se congelan, con el mnemónico del diccionario del INEGI. */
const COLUMNAS = ['ENTIDAD', 'NOM_ENT', 'MUN', 'NOM_MUN', 'POBTOT', 'P_3YMAS', 'P3YM_HLI', 'P3HLINHE', 'POB_AFRO'];

/** Las cinco que tienen que ser enteros. Si alguna no lo es, el script aborta. */
const NUMERICAS = ['POBTOT', 'P_3YMAS', 'P3YM_HLI', 'P3HLINHE', 'POB_AFRO'];

function morir(msg) {
  console.error('ABORTA: ' + msg);
  process.exit(1);
}

/**
 * Los archivos de un zip, leyendo los encabezados locales uno por uno.
 *
 * Alcanza para lo que publica el INEGI: sin cifrado, sin zip64, sin spanning, y
 * con el tamaño comprimido escrito en el encabezado local (no en un descriptor
 * al final). Si alguna de esas cosas cambiara, el script aborta en vez de
 * devolver un archivo truncado.
 */
function archivosDelZip(buf) {
  const salida = [];
  let i = 0;
  while (i + 30 <= buf.length) {
    if (buf.readUInt32LE(i) !== 0x04034b50) break;   // ya no hay más encabezados locales
    const bandera = buf.readUInt16LE(i + 6);
    const metodo = buf.readUInt16LE(i + 8);
    const comprimido = buf.readUInt32LE(i + 18);
    const nLargo = buf.readUInt16LE(i + 26);
    const extraLargo = buf.readUInt16LE(i + 28);
    const nombre = buf.subarray(i + 30, i + 30 + nLargo).toString('utf8');
    const datos = i + 30 + nLargo + extraLargo;

    if (bandera & 0x1) morir('el zip está cifrado: ' + nombre);
    if (bandera & 0x8) morir('el zip usa descriptor de datos al final, que este lector no sigue: ' + nombre);
    if (comprimido === 0xffffffff) morir('zip64, que este lector no sigue: ' + nombre);

    const crudo = buf.subarray(datos, datos + comprimido);
    if (metodo === 0) salida.push({ nombre, buf: crudo });
    else if (metodo === 8) salida.push({ nombre, buf: inflateRawSync(crudo) });
    else morir('método de compresión ' + metodo + ' no soportado: ' + nombre);

    i = datos + comprimido;
  }
  if (salida.length === 0) morir('el zip no tenía ningún archivo');
  return salida;
}

/**
 * Un campo, entrecomillado si lo necesita. Las comillas internas se duplican.
 *
 * Hace falta: hay municipios de Oaxaca con coma en el nombre, como «Heroica
 * Villa Tezoatlán de Segura y Luna, Cuna de la Independencia de Oaxaca».
 */
function csvCampo(v) {
  return v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v;
}

/** CSV con comillas: el ITER las usa en LONGITUD y LATITUD. */
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

const salida = [COLUMNAS.join(',')];
let entidades = 0, municipios = 0;

for (let e = 1; e <= 32; e++) {
  const ent = String(e).padStart(2, '0');
  const r = await fetch(URL_ITER(ent));
  if (!r.ok) morir('la entidad ' + ent + ' devolvió ' + r.status);
  const zip = Buffer.from(await r.arrayBuffer());

  const csv = archivosDelZip(zip).find(a => /conjunto_de_datos[\\/]conjunto_de_datos_iter_.*\.csv$/i.test(a.nombre));
  if (!csv) morir('la entidad ' + ent + ' no trae el conjunto de datos');

  const filas = csvFilas(csv.buf.toString('utf8'));
  const cab = filas[0].map(s => s.replace(/^﻿/, '').trim());
  const ix = {};
  cab.forEach((c, i) => { ix[c] = i; });
  for (const c of COLUMNAS) if (ix[c] === undefined) morir('falta la columna ' + c + ' en la entidad ' + ent);

  for (const f of filas.slice(1)) {
    if (f.length < cab.length) continue;
    const mun = f[ix['MUN']].trim(), loc = f[ix['LOC']].trim();
    // Sólo las filas de total. Las de localidad quedan afuera, y también las
    // dos filas 9998/9999 que el ITER usa para agrupar las localidades de una y
    // de dos viviendas: no son un municipio y llevan MUN = '000'.
    const esEnt = mun === '000' && loc === '0000';
    const esMun = mun !== '000' && loc === '0000';
    if (!esEnt && !esMun) continue;

    const campos = COLUMNAS.map(c => f[ix[c]].trim());
    for (const c of NUMERICAS) {
      const v = f[ix[c]].trim();
      // El ITER reserva '*' para lo reservado por confidencialidad y 'N/D' para
      // lo no disponible. En las filas de total no aparecen; si aparecieran, un
      // cero silencioso sería exactamente el número plausible y equivocado que
      // este proyecto no publica.
      if (!/^\d+$/.test(v)) morir(`valor no entero en ${ent}/${mun}, columna ${c}: ${JSON.stringify(v)}`);
    }
    for (const v of campos) if (v.includes('\n')) morir('un campo trae salto de línea: ' + v);

    salida.push(campos.map(csvCampo).join(','));
    if (esEnt) entidades++; else municipios++;
  }
  console.log(`entidad ${ent}: ${filas.length - 1} filas leídas`);
}

if (entidades !== 32) morir('se esperaban 32 entidades y hay ' + entidades);
if (municipios !== 2469) morir('se esperaban 2.469 municipios y hay ' + municipios);

writeFileSync(SALIDA, salida.join('\n') + '\n');
console.log(`\n${SALIDA}\n32 entidades y ${municipios} municipios.`);
