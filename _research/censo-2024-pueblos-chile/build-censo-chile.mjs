/**
 * Arma `apps/terreno/lib/censoIndigena2024Cl.ts` desde los cuadros publicados
 * del Censo de Población y Vivienda 2024 (INE de Chile).
 *
 * ── Qué toma y de dónde ────────────────────────────────────────────────────
 *
 * Tres planillas de censo2024.ine.gob.cl. A diferencia de la Argentina, que
 * publica un archivo por provincia y por cuadro —73 en total—, Chile publica
 * el país entero en una planilla por tema:
 *
 *   P2-Pueblos-indigenas.xlsx
 *     Hoja «1»: por región, personas que son o se consideran pertenecientes a
 *     un pueblo indígena u originario, abiertas por pueblo.
 *     Hoja «2»: lo mismo por comuna. Es el dato a escala del predio.
 *
 *   D1_Poblacion-censada-por-sexo-y-edad-en-grupos-quinquenales.xlsx
 *     Hojas «1» y «2»: población censada por región y por comuna. Es el
 *     denominador, y es el único lugar donde está publicado a escala comunal.
 *
 *   D3_Poblacion-censada-por-tipo-de-operativo.xlsx
 *     Hoja «1»: población censada por región, abierta en viviendas
 *     particulares, colectivas y personas en situación de calle. No entra en
 *     la tabla: está para verificar el universo, que acá no es el mismo que en
 *     la Argentina —ver abajo.
 *
 * ── El denominador, que es la única decisión de fondo ──────────────────────
 *
 * El INE publica que el 11,5% de la población es o se considera perteneciente
 * a un pueblo indígena u originario. Esa cifra sale de dividir 2.105.863 por
 * 18.370.540, que son las personas que **respondieron** la pregunta, y no por
 * las 18.480.432 **censadas**. Las 109.892 de diferencia no contestaron.
 *
 * El problema: ese denominador no está publicado por comuna. Sólo está la
 * población censada. Así que la app divide por población censada en los tres
 * niveles —comuna, provincia, región— y también en el total del país, que
 * entonces da 11,4% y no 11,5%.
 *
 * No es un error de redondeo y no se arregla: es otro denominador, y está
 * elegido así porque comparar una comuna calculada sobre población censada
 * contra un país calculado sobre quienes respondieron sería mezclar dos
 * universos en la misma frase. La diferencia entre los dos criterios es de
 * 0,07 puntos a nivel nacional. `CENSO_CL_PAIS` lleva los dos números para
 * que el de la publicación oficial se pueda citar tal como está.
 *
 * El universo, además, no es el mismo que el del censo argentino: el INDEC
 * cuenta población indígena sólo sobre viviendas particulares, y el INE de
 * Chile censó también viviendas colectivas (119.027 personas) y personas en
 * situación de calle (21.750), y les hizo la misma pregunta. Por eso acá el
 * denominador correcto es la población censada entera y no hace falta un
 * cuarto cuadro de estructura como en la Argentina.
 *
 * ── Lo que el script NO hace ───────────────────────────────────────────────
 *
 * No normaliza ni traduce nombres de pueblo, y no los cruza con los de la
 * Argentina. La lista chilena tiene once rótulos y es **cerrada**: son los
 * pueblos reconocidos por la ley 19.253 y sus modificaciones, que el
 * cuestionario ofrece como alternativas para marcar. La argentina es abierta
 * —58 rótulos escritos por quien respondía— y por eso «Quechua» en las dos
 * listas no es un dato comparable: en Chile es una casilla y en la Argentina
 * es una respuesta. Las dos aparecen como las escribe cada organismo.
 *
 * No inventa ceros ni completa comunas faltantes: si un código de comuna está
 * en una planilla y no en la otra, el script corta.
 *
 * Uso:  node build-censo-chile.mjs [carpeta-con-los-xlsx]
 * Los .xlsx no se versionan (1,1 MB de binario). Lo que queda congelado en el
 * repo son los dos .tsv que este script escribe al lado, que es lo que un
 * humano puede auditar contra la publicación del INE.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const FUENTES = process.argv[2] ?? path.join(AQUI, 'xlsx');
const SALIDA = path.join(AQUI, '..', '..', 'apps', 'terreno', 'lib', 'censoIndigena2024Cl.ts');

const BASE = 'https://censo2024.ine.gob.cl/wp-content/uploads/';
const ARCHIVOS = {
  pueblos:   { nombre: 'P2.xlsx', url: BASE + '2025/06/P2-Pueblos-indigenas.xlsx' },
  poblacion: { nombre: 'D1_Poblacion-censada-por-sexo-y-edad-en-grupos-quinquenales.xlsx',
               url: BASE + '2025/03/D1_Poblacion-censada-por-sexo-y-edad-en-grupos-quinquenales.xlsx' },
  operativo: { nombre: 'D3_Poblacion-censada-por-tipo-de-operativo.xlsx',
               url: BASE + '2025/03/D3_Poblacion-censada-por-tipo-de-operativo.xlsx' },
};

/**
 * Las 16 regiones con el código que les da el INE. El orden es el de la
 * planilla, que es geográfico de norte a sur y no numérico: 15 (Arica y
 * Parinacota) va primero y 12 (Magallanes) último. Se conserva, porque es el
 * orden con el que cualquiera lee una tabla chilena.
 */
const REGIONES_ESPERADAS = 16;
const COMUNAS_ESPERADAS = 346;

// ── Leer un .xlsx sin dependencias ──────────────────────────────────────────
// Igual que en el generador del censo argentino: un .xlsx es un ZIP de XML, se
// recorre el directorio central, se desinfla cada hoja y se barren las celdas
// con expresiones regulares. Son planillas generadas por el INE, no escritas a
// mano, así que la forma es estable.

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

function entero(celda, donde) {
  const s = (celda ?? '').trim();
  if (s === '') throw new Error(`celda vacía donde tiene que haber un número: ${donde}`);
  const n = Number(s.replace(/\./g, ''));
  if (!Number.isInteger(n)) throw new Error(`no es un entero: «${s}» en ${donde}`);
  return n;
}

/**
 * Cada tabla del INE empieza con dos filas de relleno, el título en la tercera
 * y el encabezado en la cuarta. El cuerpo va desde la quinta hasta la fila de
 * «Fuente:», que también hay que cortar: si entra al cuerpo, el desmarcado la
 * convierte en una fila de texto y el conteo de comunas se pasa de largo.
 *
 * La primera fila del cuerpo es siempre el total del país, con código 0. Se
 * separa del resto en vez de filtrarse, porque es el control de todo lo demás.
 */
function tabla(hoja, tituloEsperado) {
  const titulo = hoja.flat().find(c => c && /^\d+\.\s/.test(c)) ?? '';
  if (!titulo.includes(tituloEsperado)) {
    throw new Error(`la hoja no es la esperada.\n  esperaba: «…${tituloEsperado}…»\n  encontré: «${titulo}»`);
  }
  const iEncabezado = hoja.findIndex(f => f[0] === 'Código región');
  if (iEncabezado < 0) throw new Error(`no encontré el encabezado en «${titulo}»`);
  const encabezado = hoja[iEncabezado];
  const cuerpo = [];
  for (const fila of hoja.slice(iEncabezado + 1)) {
    if (!fila[0] || /^(Fuente|Nota)/.test(fila[0])) break;
    cuerpo.push(fila);
  }
  const pais = cuerpo.shift();
  if (!pais || pais[0] !== '0') throw new Error(`la primera fila de «${titulo}» no es el total del país`);
  return { titulo, encabezado, pais, cuerpo };
}

const col = (encabezado, nombre) => {
  const i = encabezado.indexOf(nombre);
  if (i < 0) throw new Error(`falta la columna «${nombre}» en [${encabezado.filter(Boolean).join(' | ')}]`);
  return i;
};

// ── Lo que se lee de cada planilla ──────────────────────────────────────────

const ruta = clave => path.join(FUENTES, ARCHIVOS[clave].nombre);

function leerPueblos() {
  const hs = hojas(ruta('pueblos'));
  const porRegion = tabla(hs[1], 'por nombre del pueblo originario, según región');
  const porComuna = tabla(hs[2], 'por nombre del pueblo originario, según comuna');

  const TOTAL = 'Población que es o se considera perteneciente a un pueblo indígena u originario';
  // Las columnas de pueblo son todas las que están después del total. Las dos
  // últimas —«Otro» y «Pueblo no declarado»— no son pueblos y salen aparte: la
  // primera es quien se reconoce de un pueblo que no está entre las once
  // alternativas del cuestionario, y la segunda quien dijo que sí y no marcó
  // ninguna. Tomarlas como rótulos habría dado trece pueblos en vez de once.
  const iTotal = col(porRegion.encabezado, TOTAL);
  const columnas = porRegion.encabezado.slice(iTotal + 1).filter(Boolean);
  const NO_SON_PUEBLO = ['Otro', 'Pueblo no declarado'];
  const rotulos = columnas.filter(c => !NO_SON_PUEBLO.includes(c));
  for (const c of NO_SON_PUEBLO) {
    if (!columnas.includes(c)) throw new Error(`la planilla ya no trae la columna «${c}»`);
  }

  const abrir = (fila, encabezado, donde) => {
    const i = col(encabezado, TOTAL);
    const total = entero(fila[i], donde);
    const pueblos = rotulos.map(r => ({ pueblo: r, personas: entero(fila[col(encabezado, r)], `${donde} / ${r}`) }));
    const otro = entero(fila[col(encabezado, 'Otro')], `${donde} / Otro`);
    const sinDeclarar = entero(fila[col(encabezado, 'Pueblo no declarado')], `${donde} / sin declarar`);
    const suma = pueblos.reduce((a, p) => a + p.personas, 0) + otro + sinDeclarar;
    if (suma !== total) {
      throw new Error(`${donde}: los pueblos suman ${suma} y el total dice ${total}`);
    }
    return { total, pueblos, otro, sinDeclarar };
  };

  const iCodRegion = col(porRegion.encabezado, 'Código región');
  const iRegion = col(porRegion.encabezado, 'Región');
  const regiones = porRegion.cuerpo.map(f => ({
    codigo: entero(f[iCodRegion], 'código de región'),
    region: (f[iRegion] ?? '').trim(),
    ...abrir(f, porRegion.encabezado, `región ${f[iRegion]}`),
  }));

  const eC = porComuna.encabezado;
  const iCc = col(eC, 'Código comuna');
  const comunas = porComuna.cuerpo.map(f => ({
    codigo: entero(f[iCc], 'código de comuna'),
    comuna: (f[col(eC, 'Comuna')] ?? '').trim(),
    provincia: (f[col(eC, 'Provincia')] ?? '').trim(),
    codigoRegion: entero(f[col(eC, 'Código región')], 'código de región en la tabla comunal'),
    ...abrir(f, eC, `comuna ${f[col(eC, 'Comuna')]}`),
  }));

  return {
    pais: abrir(porPaisFila(porRegion), porRegion.encabezado, 'total del país'),
    rotulos, regiones, comunas,
  };
}

const porPaisFila = t => t.pais;

function leerPoblacion() {
  const hs = hojas(ruta('poblacion'));
  const porRegion = tabla(hs[1], 'Población censada por sexo y razón hombre-mujer, según región');
  const porComuna = tabla(hs[2], 'Población censada por sexo y razón hombre-mujer, según comuna');
  const CENSADA = 'Población censada';

  const iR = col(porRegion.encabezado, CENSADA);
  const regiones = new Map(porRegion.cuerpo.map(f => [
    entero(f[col(porRegion.encabezado, 'Código región')], 'código de región en D1'),
    entero(f[iR], `población de la región ${f[1]}`),
  ]));

  const eC = porComuna.encabezado;
  const iC = col(eC, CENSADA);
  const comunas = new Map(porComuna.cuerpo.map(f => [
    entero(f[col(eC, 'Código comuna')], 'código de comuna en D1'),
    { poblacion: entero(f[iC], `población de la comuna ${f[col(eC, 'Comuna')]}`),
      comuna: (f[col(eC, 'Comuna')] ?? '').trim() },
  ]));

  return {
    pais: entero(porRegion.pais[iR], 'población del país'),
    regiones, comunas,
  };
}

/**
 * D3 no alimenta la tabla: está para dejar escrito en la auditoría que la
 * pregunta se hizo sobre toda la población censada y no sólo sobre viviendas
 * particulares, que es la diferencia de universo con el censo argentino.
 */
function leerOperativo() {
  const hs = hojas(ruta('operativo'));
  const t = tabla(hs[1], 'Población censada por tipo de operativo, según región');
  const dato = nombre => entero(t.pais[col(t.encabezado, nombre)], nombre);
  return {
    censada: dato('Población censada'),
    particulares: dato('Población en viviendas particulares'),
    colectivas: dato('Población en viviendas colectivas'),
    calle: dato('Población en situación de calle'),
  };
}

// ── Armado y verificación ───────────────────────────────────────────────────
// Todas las comprobaciones son condiciones de corte: si una falla no se
// escribe nada. Es la parte que en la Argentina encontró cinco archivos con
// otra provincia adentro.

function armar() {
  const P = leerPueblos();
  const D = leerPoblacion();
  const O = leerOperativo();
  const avisos = [];

  if (P.regiones.length !== REGIONES_ESPERADAS) {
    throw new Error(`esperaba ${REGIONES_ESPERADAS} regiones y leí ${P.regiones.length}`);
  }
  if (P.comunas.length !== COMUNAS_ESPERADAS) {
    throw new Error(`esperaba ${COMUNAS_ESPERADAS} comunas y leí ${P.comunas.length}`);
  }

  // 1. Las regiones suman el país, y también cada apertura por pueblo.
  const sumaRegiones = P.regiones.reduce((a, r) => a + r.total, 0);
  if (sumaRegiones !== P.pais.total) {
    throw new Error(`las regiones suman ${sumaRegiones} y el país dice ${P.pais.total}`);
  }
  for (const [i, rot] of P.rotulos.entries()) {
    const suma = P.regiones.reduce((a, r) => a + r.pueblos[i].personas, 0);
    const pais = P.pais.pueblos[i].personas;
    if (suma !== pais) throw new Error(`${rot}: las regiones suman ${suma} y el país dice ${pais}`);
  }
  for (const [clave, valor] of [['otro', 'otro'], ['sinDeclarar', 'sinDeclarar']]) {
    const suma = P.regiones.reduce((a, r) => a + r[valor], 0);
    if (suma !== P.pais[valor]) {
      throw new Error(`${clave}: las regiones suman ${suma} y el país dice ${P.pais[valor]}`);
    }
  }

  // 2. Las comunas suman el país y cierran dentro de su región.
  const sumaComunas = P.comunas.reduce((a, c) => a + c.total, 0);
  if (sumaComunas !== P.pais.total) {
    throw new Error(`las comunas suman ${sumaComunas} y el país dice ${P.pais.total}`);
  }
  for (const r of P.regiones) {
    const suyas = P.comunas.filter(c => c.codigoRegion === r.codigo);
    if (!suyas.length) throw new Error(`la región ${r.region} no tiene ninguna comuna`);
    const suma = suyas.reduce((a, c) => a + c.total, 0);
    if (suma !== r.total) {
      throw new Error(`${r.region}: sus comunas suman ${suma} y la región dice ${r.total}`);
    }
  }

  // 3. Los dos archivos hablan de las mismas 346 comunas. Emparejar por código
  //    y no por nombre: la tabla de pueblos se actualizó el 04/12/2025 por el
  //    cambio de nombre de una comuna, y D1 es de marzo. Un emparejamiento por
  //    texto habría perdido esa comuna sin avisar.
  for (const c of P.comunas) {
    const d = D.comunas.get(c.codigo);
    if (!d) throw new Error(`la comuna ${c.comuna} (${c.codigo}) no está en la planilla de población`);
    if (d.comuna !== c.comuna) {
      avisos.push(`la comuna ${c.codigo} se llama «${c.comuna}» en la tabla de pueblos y «${d.comuna}» en la de población; vale la primera, que es la actualizada`);
    }
  }
  for (const codigo of D.comunas.keys()) {
    if (!P.comunas.some(c => c.codigo === codigo)) {
      throw new Error(`la comuna ${codigo} está en la planilla de población y no en la de pueblos`);
    }
  }

  // 4. Nadie puede tener más gente que se reconoce indígena que habitantes.
  for (const c of P.comunas) {
    const pob = D.comunas.get(c.codigo).poblacion;
    if (c.total > pob) {
      throw new Error(`${c.comuna}: ${c.total} personas indígenas sobre ${pob} habitantes`);
    }
  }

  // 5. La población censada cierra por región y por país, y coincide con D3.
  const sumaPobComunas = [...D.comunas.values()].reduce((a, c) => a + c.poblacion, 0);
  if (sumaPobComunas !== D.pais) {
    throw new Error(`la población de las comunas suma ${sumaPobComunas} y el país dice ${D.pais}`);
  }
  if (O.censada !== D.pais) {
    throw new Error(`D3 dice ${O.censada} censados y D1 dice ${D.pais}`);
  }
  if (O.particulares + O.colectivas + O.calle !== O.censada) {
    throw new Error('el tipo de operativo no cierra con la población censada');
  }
  for (const r of P.regiones) {
    const suyas = P.comunas.filter(c => c.codigoRegion === r.codigo);
    const suma = suyas.reduce((a, c) => a + D.comunas.get(c.codigo).poblacion, 0);
    const deD1 = D.regiones.get(r.codigo);
    if (suma !== deD1) {
      throw new Error(`${r.region}: la población de sus comunas suma ${suma} y D1 dice ${deD1}`);
    }
  }

  // 6. Cada provincia cierra con sus comunas. El resolvedor suma las comunas
  //    de una provincia cuando no puede fijar la comuna, así que esa suma
  //    tiene que ser la del INE y no una aproximación.
  const provincias = new Map();
  for (const c of P.comunas) {
    const clave = `${c.codigoRegion}|${c.provincia}`;
    const p = provincias.get(clave) ?? { indigena: 0, poblacion: 0, comunas: 0 };
    p.indigena += c.total;
    p.poblacion += D.comunas.get(c.codigo).poblacion;
    p.comunas += 1;
    provincias.set(clave, p);
  }
  for (const [clave, p] of provincias) {
    if (p.indigena > p.poblacion) throw new Error(`la provincia ${clave} tiene más gente indígena que habitantes`);
  }

  return { P, D, O, provincias, avisos };
}

// ── Salida ──────────────────────────────────────────────────────────────────

const ts = s => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function escribir({ P, D, O, provincias, avisos }) {
  const regiones = P.regiones.map(r => {
    const comunas = P.comunas
      .filter(c => c.codigoRegion === r.codigo)
      .map(c => ({ ...c, poblacion: D.comunas.get(c.codigo).poblacion }));
    return { ...r, poblacion: D.regiones.get(r.codigo), comunas };
  });

  const cuerpo = regiones.map(r => {
    const pueblos = r.pueblos
      .filter(p => p.personas > 0)
      .sort((a, b) => b.personas - a.personas || a.pueblo.localeCompare(b.pueblo, 'es'))
      .map(p => `      { pueblo: ${ts(p.pueblo)}, personas: ${p.personas} },`)
      .join('\n');
    const comunas = r.comunas
      .map(c => `      { comuna: ${ts(c.comuna)}, codigo: ${c.codigo}, provincia: ${ts(c.provincia)}, poblacion: ${c.poblacion}, indigena: ${c.total} },`)
      .join('\n');
    return [
      '  {',
      `    region: ${ts(r.region)},`,
      `    codigo: ${r.codigo},`,
      `    poblacion: ${r.poblacion},`,
      `    indigena: ${r.total},`,
      `    otroPueblo: ${r.otro},`,
      `    sinDeclarar: ${r.sinDeclarar},`,
      '    pueblos: [',
      pueblos,
      '    ],',
      '    comunas: [',
      comunas,
      '    ],',
      '  },',
    ].join('\n');
  }).join('\n');

  const paisPueblos = P.pais.pueblos
    .filter(p => p.personas > 0)
    .sort((a, b) => b.personas - a.personas || a.pueblo.localeCompare(b.pueblo, 'es'))
    .map(p => `  { pueblo: ${ts(p.pueblo)}, personas: ${p.personas} },`)
    .join('\n');

  const porcentajeApp = (P.pais.total / D.pais * 100).toFixed(1).replace('.', ',');

  const encabezado = `/**
 * GENERADO. No editar a mano: sale de \`_research/censo-2024-pueblos-chile/build-censo-chile.mjs\`.
 *
 * Censo de Población y Vivienda 2024 (INE de Chile), levantado entre el 9 de
 * marzo y el 31 de julio de 2024. Cuarta entrega de resultados, tabla de
 * pueblos indígenas u originarios publicada el 30/06/2025 y actualizada el
 * 04/12/2025. Licencia CC BY-SA 4.0 de los datos abiertos del INE: permite uso
 * comercial con atribución, y obliga a que las adaptaciones lleven la misma
 * licencia. Esta tabla es una adaptación de esa publicación y queda bajo
 * CC BY-SA 4.0; el resto del código de acequia no lo está.
 *
 * Dos cosas que hay que saber para leer los números:
 *
 *   1. El porcentaje se calcula sobre la población censada. El INE publica
 *      11,5% porque divide por las 18.370.540 personas que respondieron la
 *      pregunta; acá sale ${porcentajeApp}% porque divide por las ${D.pais.toLocaleString('es-AR')}
 *      censadas, que es el único denominador publicado a escala comunal. No es
 *      un error: es otro denominador, y es el mismo en los cuatro niveles.
 *
 *   2. La lista de pueblos es cerrada. El cuestionario ofrece once
 *      alternativas —los pueblos reconocidos por la ley 19.253 y sus
 *      modificaciones, con Chango desde 2020 y Selk'nam desde 2023— más
 *      «Otro». No es comparable con la lista argentina, que es abierta.
 */
`;

  const contenido = `${encabezado}
export interface CensoClPueblo {
  pueblo: string;
  personas: number;
}

export interface CensoClComuna {
  comuna: string;
  /** Código único de comuna del INE. Es la clave: los nombres cambian. */
  codigo: number;
  provincia: string;
  /** Población censada, que es el denominador. */
  poblacion: number;
  indigena: number;
}

export interface CensoClRegion {
  region: string;
  codigo: number;
  poblacion: number;
  indigena: number;
  /** Se reconocen de un pueblo que no está entre las once alternativas. */
  otroPueblo: number;
  /** Dijeron que sí y no marcaron pueblo. En Chile son muy pocos. */
  sinDeclarar: number;
  pueblos: CensoClPueblo[];
  comunas: CensoClComuna[];
}

export const CENSO_CL: CensoClRegion[] = [
${cuerpo}
];

/**
 * Los totales del país. \`respondieron\` y \`porcentajeIne\` están para poder
 * citar la cifra oficial tal como la publica el INE, que usa otro denominador
 * —ver el encabezado—. \`poblacion\` es el que usa la app.
 */
export const CENSO_CL_PAIS = {
  poblacion: ${D.pais},
  indigena: ${P.pais.total},
  otroPueblo: ${P.pais.otro},
  sinDeclarar: ${P.pais.sinDeclarar},
  pueblos: ${P.rotulos.length},
  respondieron: 18370540,
  porcentajeIne: '11,5',
  /** Desglose del universo: a las tres se les hizo la misma pregunta. */
  viviendasParticulares: ${O.particulares},
  viviendasColectivas: ${O.colectivas},
  situacionDeCalle: ${O.calle},
} as const;

/** El país entero abierto por pueblo, para el contraste con la región. */
export const CENSO_CL_PUEBLOS: CensoClPueblo[] = [
${paisPueblos}
];
`;

  fs.writeFileSync(SALIDA, contenido, 'utf8');

  // Los dos .tsv congelados: son la copia auditable de lo extraído.
  const tsvRegiones = [
    ['codigo', 'region', 'poblacion_censada', 'indigena', 'otro_pueblo', 'sin_declarar', 'comunas', ...P.rotulos].join('\t'),
    ...regiones.map(r => [
      r.codigo, r.region, r.poblacion, r.total, r.otro, r.sinDeclarar, r.comunas.length,
      ...P.rotulos.map(rot => r.pueblos.find(p => p.pueblo === rot).personas),
    ].join('\t')),
    ['0', 'País', D.pais, P.pais.total, P.pais.otro, P.pais.sinDeclarar, P.comunas.length,
      ...P.rotulos.map((rot, i) => P.pais.pueblos[i].personas)].join('\t'),
  ].join('\n') + '\n';
  fs.writeFileSync(path.join(AQUI, 'censo2024-cl-regiones.tsv'), tsvRegiones, 'utf8');

  const tsvComunas = [
    ['codigo', 'comuna', 'provincia', 'region', 'poblacion_censada', 'indigena', 'otro_pueblo', 'sin_declarar'].join('\t'),
    ...regiones.flatMap(r => r.comunas.map(c => [
      c.codigo, c.comuna, c.provincia, r.region, c.poblacion, c.total, c.otro, c.sinDeclarar,
    ].join('\t'))),
  ].join('\n') + '\n';
  fs.writeFileSync(path.join(AQUI, 'censo2024-cl-comunas.tsv'), tsvComunas, 'utf8');

  return { regiones, provincias, porcentajeApp, avisos };
}

const datos = armar();
const { regiones, provincias, porcentajeApp, avisos } = escribir(datos);

console.log(`${regiones.length} regiones, ${provincias.size} provincias, ${datos.P.comunas.length} comunas.`);
console.log(`${datos.P.pais.total.toLocaleString('es-AR')} personas sobre ${datos.D.pais.toLocaleString('es-AR')} censadas = ${porcentajeApp}% (el INE publica 11,5% con otro denominador).`);
console.log(`${datos.P.rotulos.length} pueblos: ${datos.P.rotulos.join(', ')}.`);
console.log(`«Otro»: ${datos.P.pais.otro.toLocaleString('es-AR')}. Sin declarar pueblo: ${datos.P.pais.sinDeclarar.toLocaleString('es-AR')}.`);
console.log(`Universo: ${datos.O.particulares.toLocaleString('es-AR')} en viviendas particulares, ${datos.O.colectivas.toLocaleString('es-AR')} en colectivas, ${datos.O.calle.toLocaleString('es-AR')} en situación de calle.`);
for (const a of avisos) console.log(`aviso: ${a}`);
console.log(`escrito ${path.relative(process.cwd(), SALIDA)}`);
