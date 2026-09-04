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
 * puntos elegidos a mano— y que a Europa, con el alcance puesto en la UE y sus
 * asociados, le faltaban 34 y no las 15 que decía el paquete.
 *
 * El alcance de cada región es una decisión y está escrito en el encabezado de
 * la tabla que le corresponde en `apps/terreno/lib/`. Lo que aparece sin ficha
 * y está bien que aparezca va en ESPERADOS, con el motivo al lado.
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
  'ecorregionesEuropaUE.ts',
  'ecorregionesMedioOriente.ts',
  'ecorregionesNorteAfrica.ts',
];

const MAPA = {};
for (const f of TABLAS) {
  const s = readFileSync(new URL(f, LIB), 'utf8');
  for (const m of s.matchAll(/^\s*(\d+)\s*:\s*'([a-z0-9_]+)'\s*,/gm)) MAPA[Number(m[1])] = m[2];
}

/** Donde un rectángulo se comería países que están fuera del alcance de su
 *  región, la caja es un polígono que sigue la frontera a grandes rasgos. No
 *  pretende ser exacto: pretende no invitar a nadie que no esté en la lista.
 *  Sin esto, Turquía arrastra Siria, Irak, Irán y Azerbaiyán; el Cáucaso,
 *  Armenia y Rusia; Irán, Turkmenistán, Afganistán y Pakistán; y Arabia, el
 *  Cuerno de África. */
const TURQUIA = [[[26,40.2],[26.2,41.8],[28,41.6],[31,41.2],[35,42.1],[38,41],[41,41.5],[43,41.2],[44.8,39.7],[44.4,37.9],[42.4,37.2],[40,37],[38,36.7],[36.2,36.6],[36,35.8],[32.5,36],[29,36.3],[27.2,36.7],[26,38],[26,40.2]]];
const GEORGIA = [[[40,43.4],[42,43.5],[44,42.6],[46.5,41.6],[46.4,41.2],[45,41.2],[43.5,41.1],[41.5,41.5],[40,43.4]]];
const UCRANIA = [[[22.1,48.4],[24,50.4],[23.6,51.5],[27,51.8],[30,52.3],[34,52.3],[38,50.4],[40.2,49.8],[40.1,47.7],[38,47.1],[36,46.6],[33.6,46.2],[33.6,44.4],[32,45.3],[30.2,45.4],[28.2,45.4],[28.9,47.9],[26.6,48.3],[22.1,48.4]]];

/** Medio Oriente y norte de África: mismo criterio, la caja sigue la frontera
 *  cuando el rectángulo se comería países de otra región (Asia central,
 *  Afganistán, Pakistán, el Cuerno de África). */
const IRAN = [[[44.05,39.4],[45,39.2],[46.5,38.9],[47.9,39.7],[48.4,38.4],[50,37],[53,36.9],[54.5,37.5],[56,38.1],[58.4,37.6],[60,36.6],[61.2,36.6],[61.1,35.6],[60.5,34.1],[60.9,31.5],[61.8,31.4],[61.7,29],[62.7,28.2],[61.6,25.2],[57.8,25.6],[56.4,27.1],[53.5,26.7],[51.5,28],[49.5,30],[48,30.5],[47.7,31],[47.4,32.5],[45.9,33.5],[45.4,34.6],[46.1,35.6],[44.8,37.3],[44.6,38.3],[44.05,39.4]]];
const ARABIA = [[[34.5,29.4],[36,29.5],[38,32],[39.2,32.2],[40.4,31.9],[42,31],[44,29.2],[46.5,29.1],[48,29.5],[48.6,28.5],[50.2,26.6],[51.6,24.6],[55,24],[56.4,26.4],[59.8,22.5],[58,20.5],[55.3,17],[52.5,16.5],[49,14],[45,12.6],[43.2,12.6],[42.6,15.5],[39,21],[36.5,25],[34.6,28],[34.5,29.4]]];
const CAUCASO_SUR = [[[43.4,41.1],[44.8,41.2],[45.5,41.9],[46.5,41.9],[47.6,41.3],[48.6,41.6],[49.6,40.6],[50.4,40.3],[49,39],[48.9,38.4],[48,38.4],[46,38.9],[44.8,39.7],[43.4,41.1]]];

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
    'Iberia y Francia':         { xmin: -10, ymin: 36, xmax:   8, ymax: 51 },
    'Islas atlánticas UE':      { xmin: -32, ymin: 27, xmax: -13, ymax: 40 },
    'Chipre y Malta':           { xmin:  14, ymin: 34, xmax:  35, ymax: 36.5 },
    'Italia y Alpes orientales':{ xmin:   6, ymin: 36, xmax:  19, ymax: 47 },
    'Alemania y Europa central':{ xmin:   5, ymin: 45, xmax:  25, ymax: 55 },
    'Escandinavia y Báltico':   { xmin:   4, ymin: 54, xmax:  32, ymax: 71 },
    'Svalbard y Jan Mayen':     { xmin:  -9, ymin: 70, xmax:  35, ymax: 81 },
    'Islandia':                 { xmin: -25, ymin: 62, xmax: -12, ymax: 67 },
    'Islas Británicas':         { xmin: -11, ymin: 49, xmax:   2, ymax: 61 },
    'Balcanes y Grecia':        { xmin:  13, ymin: 34, xmax:  30, ymax: 47 },
    'Ucrania y Moldavia':       { rings: UCRANIA },
    'Turquía':                  { rings: TURQUIA },
    'Georgia':                  { rings: GEORGIA },
  },
  medioriente: {
    'Levante':                  { xmin: 33.5, ymin: 29,   xmax: 39.5, ymax: 37.5 },
    'Mesopotamia e Irak':       { xmin: 38.5, ymin: 29,   xmax: 49,   ymax: 37.5 },
    'Irán':                     { rings: IRAN },
    'Península Arábiga':        { rings: ARABIA },
    'Socotra':                  { xmin: 52.5, ymin: 12,   xmax: 54.8, ymax: 12.9 },
    'Cáucaso sur':              { rings: CAUCASO_SUR },
  },
  norafrica: {
    'Marruecos y Sáhara Occ.':  { xmin: -17,  ymin: 20.7, xmax: -1,   ymax: 36 },
    'Argelia y Túnez':          { xmin:  -2,  ymin: 19,   xmax: 12,   ymax: 37.5 },
    'Libia':                    { xmin:   9,  ymin: 19.5, xmax: 25.2, ymax: 33.5 },
    'Egipto y Sinaí':           { xmin: 24.7, ymin: 21.9, xmax: 37,   ymax: 32 },
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
  774: 'tundra de Kola: es Rusia; verificado por punto que no entra en Laponia ni en Finnmark',
  778: 'desierto ártico ruso: Franz Josef y Nueva Zembla; Svalbard no tiene polígono en RESOLVE',
  53:  'sabana de acacias del Sahel: entra por el borde sur de las cajas de Marruecos y Argelia; verificado por punto que no llega a territorio argelino ni saharaui',
  79:  'pastizal montano etíope: entra por el vértice sudeste de la caja de Egipto, en el triángulo de Halaib que administra Sudán; el punto sobre el Gebel Elba devuelve 836',
  129: 'islas del mar de Scotia: reino Antártico, entra por el vértice sudeste de la caja sudamericana',
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

const FALTAN = new Map(); // únicos: una ecorregión aparece en varias cajas a propósito
for (const [region, grupo] of Object.entries(cajas)) {
  console.log(`\n# ${region.toUpperCase()}`);
  for (const [nombre, caja] of Object.entries(grupo)) {
    const p = new URLSearchParams({
      f: 'json',
      geometry: JSON.stringify({ ...caja, spatialReference: { wkid: 4326 } }),
      geometryType: caja.rings ? 'esriGeometryPolygon' : 'esriGeometryEnvelope',
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
    for (const a of reales) FALTAN.set(a.ECO_ID, a);
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

console.log(`
# total sin ficha, únicos y sin contar los esperados: ${FALTAN.size}`);
for (const a of [...FALTAN.values()].sort((x, y) => x.ECO_ID - y.ECO_ID)) {
  console.log(`${String(a.ECO_ID).padStart(4)}  bioma ${String(a.BIOME_NUM).padStart(2)}  ${a.ECO_NAME}`);
}
