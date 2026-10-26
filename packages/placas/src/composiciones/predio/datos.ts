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
 */
export const GEO_AGUA = coleccion(D.cadenas.map(c => linea(c.puntos, {
  acum: c.acum,
  orden: Math.pow(c.acum / D.acum_max, 0.45),
})));

/**
 * El cauce que dibuja el lazo del agua: **el tramo más largo**, no el de más
 * caudal.
 *
 * Parece lo mismo y no lo es. Las cadenas se recortan al perímetro, así que la
 * de mayor acumulación —la que junta toda el agua del predio— es justo la que
 * sale por el borde de abajo, y adentro queda un pedazo de doscientos metros.
 * El lazo dura seis segundos y lo único que hace es dibujar una línea: si la
 * línea es un muñón, no hay lazo. El largo se mide en nodos, que sobre una
 * grilla regular es proporcional a los metros.
 */
const CAUCE_MAYOR = D.cadenas.reduce<DatosPredio['cadenas'][number] | null>(
  (a, c) => {
    if (!a) return c;
    if (c.puntos.length !== a.puntos.length) return c.puntos.length > a.puntos.length ? c : a;
    return c.acum > a.acum ? c : a;
  }, null);

export const GEO_CAUCE = coleccion(CAUCE_MAYOR ? [linea(CAUCE_MAYOR.puntos)] : []);

/**
 * El medio del cauce elegido, para que el lazo del agua se pare encima.
 *
 * Hace falta porque el tramo más largo que queda DENTRO del predio mide unos
 * 590 m, y el predio tiene 3,4 km de ancho: a la escala de la vista a sangre
 * esa línea es una rayita de doscientos píxeles y el lazo no se lee. El lazo
 * muestra el lienzo, no el predio entero, así que se acerca.
 */
export const CENTRO_CAUCE: Par = CAUCE_MAYOR
  ? CAUCE_MAYOR.puntos[Math.floor(CAUCE_MAYOR.puntos.length / 2)]!
  : CENTRO;

/** Largo aproximado del cauce elegido, en metros. Decide cuánto se acerca el lazo. */
export const LARGO_CAUCE_M = CAUCE_MAYOR ? CAUCE_MAYOR.puntos.length * D.paso_m : 0;

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
