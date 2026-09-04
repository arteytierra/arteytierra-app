/**
 * Enumera la cobertura real de fichas contra RESOLVE, por envolvente.
 *
 * Se corre desde la raíz del repo:  node _research/enumerar-cobertura-resolve.mjs
 * y con una región sola:            node _research/enumerar-cobertura-resolve.mjs europa
 *
 * Por qué existe: cada paquete de investigación cierra declarando "0 ECO_ID
 * faltantes", pero esa cuenta se hace contra la lista que el propio paquete
 * eligió mirar. Este script no usa ninguna lista: le pide al FeatureServer de
 * RESOLVE todas las ecorregiones cuya geometría interseca una caja y resta las
 * que la app ya tiene mapeadas. Fue así como apareció que a América le faltaban
 * 22 ecorregiones del norte —no las 10 que había encontrado un barrido de 85
 * puntos elegidos a mano— y que a Europa le faltan 26, no 15.
 *
 * No toca la app: lee las tablas de `lib/` por texto y no escribe nada.
 * Sin API key: el servicio es público y la licencia de RESOLVE es CC BY 4.0.
 */
import { readFileSync } from 'node:fs';

const LIB = new URL('../apps/terreno/lib/', import.meta.url);
const TABLAS = [
  'ecorregiones.ts',
  'ecorregionesAmerica.ts',
  'ecorregionesCanada.ts',
  'ecorregionesSudamerica.ts',
  'ecorregionesEuropa.ts',
];

const MAPA = {};
for (const f of TABLAS) {
  const s = readFileSync(new URL(f, LIB), 'utf8');
  for (const m of s.matchAll(/^\s*(\d+)\s*:\s*'([a-z0-9_]+)'\s*,/gm)) MAPA[Number(m[1])] = m[2];
}

const SERVICIO =
  'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query';

/** Cajas por región. Se solapan a propósito: una ecorregión de borde tiene que
 *  aparecer desde los dos lados, así ninguna se cuela por el hueco. */
const REGIONES = {
  america: {
    'Canadá y Ártico':          { xmin: -141.5, ymin: 41.5, xmax: -52, ymax: 84 },
    'Alaska y Yukón':           { xmin: -172,   ymin: 51,   xmax: -129, ymax: 72 },
    'EE.UU. contiguo':          { xmin: -125,   ymin: 24,   xmax: -66,  ymax: 50 },
    'México':                   { xmin: -118,   ymin: 14,   xmax: -86,  ymax: 33 },
    'Centroamérica':            { xmin: -93,    ymin: 7,    xmax: -77,  ymax: 19 },
    'Caribe':                   { xmin: -85,    ymin: 10,   xmax: -59,  ymax: 28 },
  },
  europa: {
    'Iberia y Francia':         { xmin: -10, ymin: 36, xmax:  8, ymax: 51 },
    'Italia y Alpes orientales':{ xmin:   6, ymin: 36, xmax: 19, ymax: 47 },
    'Alemania y Europa central':{ xmin:   5, ymin: 45, xmax: 25, ymax: 55 },
    'Escandinavia y Báltico':   { xmin:   4, ymin: 54, xmax: 32, ymax: 71 },
    'Islas Británicas':         { xmin: -11, ymin: 49, xmax:  2, ymax: 61 },
    'Balcanes y Grecia':        { xmin:  13, ymin: 34, xmax: 30, ymax: 47 },
  },
  sudamerica: {
    'Sudamérica':               { xmin: -82, ymin: -56, xmax: -34, ymax: 13 },
  },
};

/**
 * Los que aparecen sin ficha y está bien que aparezcan. Si esta lista crece sin
 * una explicación al lado, algo se está tapando en vez de resolverse.
 */
const ESPERADOS = {
  0:   'roca y hielo: se resuelve al bioma 98 de RESOLVE, no lleva ficha regional',
  772: 'Chukchi Peninsula tundra: es Palearctic, Siberia; entra por vecindad con Alaska',
};

const pedido = (process.argv[2] ?? '').toLowerCase();
const cajas = pedido
  ? { [pedido]: REGIONES[pedido] ?? {} }
  : REGIONES;
if (pedido && !REGIONES[pedido]) {
  console.error(`región desconocida: ${pedido}. Hay: ${Object.keys(REGIONES).join(', ')}`);
  process.exit(1);
}

console.log(`# lista blanca: ${Object.keys(MAPA).length} ECO_ID mapeados\n`);

let faltanTotal = 0;
for (const [region, grupo] of Object.entries(cajas)) {
  console.log(`\n# ${region.toUpperCase()}`);
  for (const [nombre, caja] of Object.entries(grupo)) {
    const p = new URLSearchParams({
      f: 'json',
      geometry: JSON.stringify({ ...caja, spatialReference: { wkid: 4326 } }),
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'ECO_ID,ECO_NAME,BIOME_NUM,REALM',
      returnGeometry: 'false',
      resultRecordCount: '2000',
    });
    let js;
    try {
      const r = await fetch(`${SERVICIO}?${p}`, { signal: AbortSignal.timeout(60000) });
      js = await r.json();
    } catch (e) {
      console.log(`\n## ${nombre}: error de red — ${e.message}`);
      continue;
    }
    if (js.error) { console.log(`\n## ${nombre}: ${js.error.message}`); continue; }

    const sin = new Map();
    for (const f of js.features) {
      const a = f.attributes;
      if (!MAPA[a.ECO_ID]) sin.set(a.ECO_ID, a);
    }
    const reales = [...sin.values()].filter(a => !ESPERADOS[a.ECO_ID]);
    faltanTotal += reales.length;
    console.log(`\n## ${nombre}: ${js.features.length} polígonos, ${reales.length} sin ficha`);
    for (const a of reales.sort((x, y) => x.ECO_ID - y.ECO_ID)) {
      console.log(`${String(a.ECO_ID).padStart(4)}  bioma ${String(a.BIOME_NUM).padStart(2)}  ${a.REALM.padEnd(11)}  ${a.ECO_NAME}`);
    }
    for (const a of [...sin.values()].filter(x => ESPERADOS[x.ECO_ID])) {
      console.log(`${String(a.ECO_ID).padStart(4)}  (esperado) ${ESPERADOS[a.ECO_ID]}`);
    }
    await new Promise(r => setTimeout(r, 900)); // el servicio limita si se lo apura
  }
}

console.log(`\n# total sin ficha (sin contar los esperados): ${faltanTotal}`);
