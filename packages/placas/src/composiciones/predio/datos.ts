/**
 * El dato del predio y las capas GeoJSON que dibujan las tres piezas.
 *
 * Todo sale de `generado/<predio>.json`, que escribe
 * `apps/terreno/scripts/datos-portada.ts` llamando a las funciones del repo
 * —`obtenerGrillaDEM`, `shaderDesdeGrilla`, `calcularEscorrentias`,
 * `calcularCurvas`, `calcularAptitud`, `analizarKeyline`,
 * `buscarSitiosRepresa`— sobre los siete mojones del proyecto. Acá no se
 * calcula relieve: se lee.
 *
 * ── Por qué TODO es vectorial y no hay un solo ráster propio ────────────────
 * Es la corrección del defecto principal de la primera animación. MapLibre
 * dibuja una fuente `canvas` (y una `image`) como un cuadrilátero de cuatro
 * vértices y NO la subdivide para drapearla sobre el relieve; las capas
 * vectoriales sí van drapeadas. Con la cámara inclinada las dos cosas dejan de
 * coincidir, y eso era exactamente lo que se veía: «dos rectángulos
 * superpuestos con otro ángulo, la costura cruzando la imagen en diagonal».
 * Acá no puede volver a pasar, porque no hay ráster propio que se pueda
 * desfasar: el color del cuadro es el de la ortofoto y el volumen lo pone el
 * sombreado que MapLibre calcula de las mismas teselas de relieve que levantan
 * el terreno.
 *
 * Y por eso el shader de elevaciones vuelve como VECTOR (`GEO_RELIEVE`): es el
 * mismo cálculo de la app —la misma rampa, el mismo rango, la misma celda— pero
 * dibujado con polígonos, que sí se drapean. La regla no era «la rampa no va»:
 * era «nada que se pueda desfasar».
 */
import crudo from '../../../generado/cuetiepa.json';

type Par = [number, number];

export interface DatosPredio {
  predio: string;
  fuente: string;
  atribucion: string;
  resolucion_m: number;
  bbox: [number, number, number, number];
  cols: number; rows: number;
  paso_m: number;
  elev_min: number; elev_max: number;
  /** Elevación por nodo, row-major, **fila 0 = la latitud mínima**. */
  elev: number[];
  /** 1 = el nodo cae dentro del polígono del predio. */
  dentro: number[];
  /** La rampa del shader, ya muestreada en 256 pasos por la app. */
  rampa: string[];
  mojones: Array<{ lat: number; lng: number }>;
  intervalo_curvas_m: number;
  curvas: Array<{ cota: number; lineas: Array<{ cerrada: boolean; puntos: Par[] }> }>;
  cadenas: Array<{ acum: number; puntos: Par[] }>;
  acum_max: number;
  junturas: Par[];
  aptitud: {
    colores: Record<string, string>;
    resumen: Record<string, { celdas: number; area_m2: number; pct: number }>;
    manchones: Array<{ tipo: string; celdas: number; anillo: Par[] }>;
  };
  zanjas: { intervalo_vertical_m: number; lineas: Array<{ cota: number; puntos: Par[] }> } | null;
  keyline: {
    nota: string;
    keypoint: Par;
    valle: Par[];
    guias: Array<{ principal: boolean; puntos: Par[] }>;
  } | null;
  represas: Array<{
    lat: number; lng: number;
    altura_m: number; ancho_muro_m: number; area_ha: number;
    espejo: Par[];
  }>;
}

export const D = crudo as unknown as DatosPredio;

export const [OESTE, SUR, ESTE, NORTE] = D.bbox;
export const CENTRO: Par = [(OESTE + ESTE) / 2, (SUR + NORTE) / 2];

const vacia = { type: 'FeatureCollection' as const, features: [] };
const linea = (puntos: Par[], properties: Record<string, unknown> = {}) => ({
  type: 'Feature' as const,
  properties,
  geometry: { type: 'LineString' as const, coordinates: puntos },
});
const coleccion = (features: ReturnType<typeof linea>[]) => ({
  type: 'FeatureCollection' as const, features,
});

/** Las curvas de nivel, con la cota normalizada para encenderlas de abajo arriba. */
export const GEO_CURVAS = coleccion(D.curvas.flatMap(c => c.lineas.map(l => linea(l.puntos, {
  cota: c.cota,
  maestra: c.cota % 100 === 0,
  /** 0 = la cota más baja del predio, 1 = la más alta. */
  altura: (c.cota - D.elev_min) / Math.max(1, D.elev_max - D.elev_min),
}))));

/**
 * Las cadenas de escurrimiento, con `orden` de 0 a 1 según su acumulación: 0 es
 * el filo y 1 el cauce principal. El acto del agua enciende primero los filos,
 * que es el orden en que ocurre en el campo.
 *
 * **Van cuesta abajo, y está comprobado.** Importa porque el efecto de
 * corriente es una banda clara que recorre cada cadena de `line-progress` 0 a
 * 1: si el primer punto fuera la desembocadura, el agua se vería subir el
 * cerro. Comparando la cota del primer nodo con la del último sobre la misma
 * grilla, **las 37 bajan y ninguna sube**. Sale del D8, que encadena de aguas
 * arriba hacia abajo por construcción; esto lo confirma sobre el dato.
 */
export const GEO_AGUA = coleccion(D.cadenas.map(c => linea(c.puntos, {
  acum: c.acum,
  orden: Math.pow(c.acum / D.acum_max, 0.45),
})));

/**
 * El shader de elevaciones de la app, **en vector**.
 *
 * Es la misma cuenta que hace `shaderDesdeGrilla`: cada nodo de la grilla es el
 * centro de una celda, y el color sale de `colorElev` —la posición relativa
 * entre la cota más baja y la más alta DEL PREDIO, no del mundo— sobre la rampa
 * que el JSON ya trae muestreada en 256 pasos. Lo único que cambia es el
 * soporte: la app la pinta en un `canvas` y acá son polígonos, porque un
 * `canvas` no se drapea sobre el relieve y un polígono sí. Ese era el defecto
 * principal de la primera animación.
 *
 * Dos decisiones con número:
 *
 * - **128 clases** sobre 369 m de desnivel son 2,9 m por clase. Con 32 el
 *   escalonado se ve como terrazas falsas en las laderas suaves; con 256 no
 *   cambia nada a la vista y hay 24.549 rectángulos en vez de 21.202.
 * - **Se juntan las celdas contiguas de la misma clase en un solo rectángulo
 *   por fila.** Sin eso son 28.157 polígonos de 12,3 m, uno por nodo, y cada
 *   borde interno es una costura que el antialias dibuja.
 */
const CLASES_RELIEVE = 128;

function construirRelieve() {
  const { cols, rows, elev, dentro, rampa } = D;
  const dLat = (NORTE - SUR) / (rows - 1);
  const dLng = (ESTE - OESTE) / (cols - 1);
  const rango = Math.max(1e-6, D.elev_max - D.elev_min);
  const color = (k: number) => rampa[Math.min(
    rampa.length - 1,
    Math.round(((k + 0.5) / CLASES_RELIEVE) * (rampa.length - 1)),
  )]!;

  const features: Array<{
    type: 'Feature'; properties: { c: string };
    geometry: { type: 'Polygon'; coordinates: Par[][] };
  }> = [];

  for (let r = 0; r < rows; r++) {
    const lat = SUR + r * dLat;
    const y0 = lat - dLat / 2, y1 = lat + dLat / 2;
    let clase = -1, desde = 0;
    // El barrido llega hasta `cols` —una columna de más, siempre vacía— para
    // cerrar el último tramo de la fila sin repetir el código afuera del bucle.
    for (let c = 0; c <= cols; c++) {
      const i = r * cols + c;
      const z = c < cols && dentro[i] === 1 ? elev[i]! : NaN;
      const k = Number.isFinite(z)
        ? Math.min(CLASES_RELIEVE - 1, Math.max(0,
          Math.floor(((z - D.elev_min) / rango) * CLASES_RELIEVE)))
        : -1;
      if (k === clase) continue;
      if (clase >= 0) {
        const x0 = OESTE + (desde - 0.5) * dLng;
        const x1 = OESTE + (c - 0.5) * dLng;
        features.push({
          type: 'Feature',
          properties: { c: color(clase) },
          geometry: {
            type: 'Polygon',
            coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]],
          },
        });
      }
      clase = k; desde = c;
    }
  }
  return { type: 'FeatureCollection' as const, features };
}

export const GEO_RELIEVE = construirRelieve();

/**
 * Los sitios de represa, como punto. Es lo que necesita el pulso que marca el
 * cierre cuando la capa se enciende; el vaso lo dibuja `GEO_ESPEJO`.
 */
export const GEO_REPRESAS = {
  type: 'FeatureCollection' as const,
  features: D.represas.map(r => ({
    type: 'Feature' as const,
    properties: { area_ha: r.area_ha, altura_m: r.altura_m },
    geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] as Par },
  })),
};

/** El perímetro, cerrado. Va con `lineMetrics` para poder dibujarlo de a poco. */
export const GEO_PREDIO = coleccion([
  linea([...D.mojones, D.mojones[0]!].map(m => [m.lng, m.lat] as Par)),
]);

export const GEO_JUNTURAS = {
  type: 'FeatureCollection' as const,
  features: D.junturas.map(p => ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Point' as const, coordinates: p },
  })),
};

/**
 * La aptitud de uso, en manchones contiguos.
 *
 * CUIDADO CON EL ROTULO, y esto va al documento: la app la calcula de
 * pendiente, orientación, agua acumulada y altura relativa —puro relieve—, no
 * de datos de suelo. Si la página llama «Suelo» a este estado promete un
 * análisis edafológico que la pieza no trae. Y son cinco clases, no tres.
 */
export const GEO_APTITUD = {
  type: 'FeatureCollection' as const,
  features: D.aptitud.manchones.map(m => ({
    type: 'Feature' as const,
    properties: { tipo: m.tipo, color: D.aptitud.colores[m.tipo] ?? '#888888' },
    geometry: { type: 'Polygon' as const, coordinates: [[...m.anillo, m.anillo[0]!]] },
  })),
};

/** Las guías de keyline. `principal` es la que pasa por el keypoint. */
export const GEO_KEYLINE = D.keyline
  ? coleccion(D.keyline.guias.map(g => linea(g.puntos, { principal: g.principal })))
  : vacia;

/** El espejo de agua de los cierres que encontró el terreno. */
export const GEO_ESPEJO = {
  type: 'FeatureCollection' as const,
  features: D.represas
    .filter(r => r.espejo.length >= 4)
    .map(r => ({
      type: 'Feature' as const,
      properties: { area_ha: r.area_ha },
      geometry: { type: 'Polygon' as const, coordinates: [[...r.espejo, r.espejo[0]!]] },
    })),
};

/**
 * Las zanjas de infiltración. En este predio van vacías **a propósito**: con
 * 30,4 % de pendiente la tabla de `criterios` pide 3 m de separación vertical,
 * que sobre 369 m de desnivel son 124 zanjas, y el tope de diseño de la
 * herramienta son 60. La app se niega a proponerlas y la pieza no las dibuja:
 * pasarle por encima a su propio criterio para llenar un cuadro es justo lo que
 * el contrato prohíbe. La capa existe para que el día que el predio o el área
 * cambien, el dato entre sin tocar la composición.
 */
export const GEO_ZANJAS = D.zanjas
  ? coleccion(D.zanjas.lineas.map(l => linea(l.puntos, { cota: l.cota })))
  : vacia;

/** Cuántas zanjas pediría la tabla si la herramienta no se negara. Va al documento. */
export const ZANJAS_HAY = D.zanjas != null;
