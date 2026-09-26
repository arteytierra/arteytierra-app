/**
 * SoilGrids leído directo de los rásters, en vez de por la API de consulta.
 *
 * ## Por qué
 *
 * `rest.isric.org` es una API con cupo por IP. Cuando se pasa no contesta 429
 * sino 503, o deja la conexión colgada. Y acá pega el doble, porque el proxy
 * corre en Vercel: **todos los usuarios de acequia comparten una sola IP y por
 * lo tanto un solo cupo**. Con un usuario molesta; abierto al público no
 * funciona.
 *
 * `files.isric.org` es otra cosa: es un servidor de archivos estáticos, sin
 * cupo. Medido el 26/09/2026: acceso anónimo, `Accept-Ranges: bytes`, un pedido
 * `Range: bytes=0-1023` contesta `206`. Los rásters son COG —GeoTIFF tileado
 * 512×512, Deflate con predictor horizontal, 8 niveles de pirámide— así que se
 * lee un punto bajando una tile de ~35 KB, no los 79 MB del archivo.
 *
 * ## Qué se pierde y qué no
 *
 * Se usa el producto agregado a **1 km**, no el de 250 m. Es el mismo modelo:
 * el README de ISRIC dice que los agregados salen de remuestrear las
 * predicciones medias de 250 m, así que no cambia la fuente, la licencia ni la
 * cita — sigue siendo SoilGrids 2.0, CC BY 4.0. Lo que cambia es el paso de la
 * grilla, y eso **tiene que decirlo la interfaz**: la app no puede seguir
 * imprimiendo «~250 m» si el número salió de 1 km.
 *
 * (El juego de 250 m está en el mismo servidor y también es COG; se lee con este
 * mismo código cambiando la carpeta, porque la proyección es la misma. Queda
 * como opción, no como deuda.)
 *
 * ## Validación
 *
 * Contra la propia REST API a 250 m, el 26/09/2026, capa 0–5 cm:
 *
 *   Pampa (-33,500 / -61,500)   COG→REST   pH 63/63 · SOC 230/224 · arcilla 320/317
 *                                          arena 137/131 · limo 543/552
 *                                          densidad 134/135 · N 218/217
 *   Java  ( -7,750 / 112,500)   COG→REST   pH 51/52 · SOC 871/792 · arcilla 359/369
 *                                          arena 406/378 · limo 235/254
 *                                          densidad 93/90 · N 510/604
 *
 * Las diferencias son las del remuestreo de 250 m a 1 km, no las de leer otro
 * lugar del planeta: un error en la proyección no daría el mismo pH con dos
 * decimales de diferencia, daría el pH de otro continente.
 *
 * ## Rango de validez
 *
 * Todo el planeta donde SoilGrids tiene predicción. Fuera de eso —océano, hielo,
 * roca desnuda, y los huecos propios de una proyección interrumpida— el ráster
 * trae NoData y acá sale `null`. `null` significa «no hay dato», nunca cero.
 */
import { fromUrl, type GeoTIFFImage } from 'geotiff';
import { aHomolosine } from './homolosine';

const BASE = 'https://files.isric.org/soilgrids/latest/data_aggregated/1000m';

/** Paso de la grilla del producto agregado que leemos, en metros. */
export const RESOLUCION_M = 1000;

/** NoData declarado por los propios GeoTIFF (tag GDAL_NODATA). */
const NO_DATA = -32768;

export const PROPIEDADES = ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen'] as const;
export type Propiedad = (typeof PROPIEDADES)[number];

export const PROFUNDIDADES = ['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm'] as const;

/**
 * Divisor para pasar del entero guardado a la unidad física.
 *
 * SoilGrids guarda enteros para que quepan en 16 bits: el pH va ×10, la
 * densidad ×100. Estos valores **no están deducidos**: son los `d_factor` que
 * devuelve la propia REST API de ISRIC, leídos el 26/09/2026 en la misma
 * consulta con la que se validaron los valores de arriba. Van acá porque la
 * respuesta que armamos tiene que ser indistinguible de la de la REST API, que
 * es lo que espera `lib/suelos.ts`.
 */
const D_FACTOR: Record<Propiedad, number> = {
  phh2o:    10,   // pH×10           → adimensional
  soc:      10,   // dg/kg           → g/kg
  clay:     10,   // g/kg            → %
  sand:     10,   // g/kg            → %
  silt:     10,   // g/kg            → %
  bdod:    100,   // cg/cm³          → kg/dm³
  nitrogen:100,   // cg/kg           → g/kg
};

/** Unidad física de cada propiedad, tal como la nombra ISRIC. */
const UNIDAD: Record<Propiedad, string> = {
  phh2o: '-', soc: 'g/kg', clay: '%', sand: '%', silt: '%',
  bdod: 'kg/dm³', nitrogen: 'g/kg',
};

/**
 * Radio de búsqueda cuando el píxel del punto no tiene dato, en píxeles (= km).
 *
 * No es un capricho: a 1 km el NoData no es sólo el océano. Hay salpicado de
 * píxeles sueltos sin predicción (~5 % dentro de una tile continental medido el
 * 26/09/2026) y cuerpos de agua de pocos kilómetros. De cuatro puntos de prueba,
 * dos cayeron en un píxel sin dato y el vecino a 1 km sí tenía. Sin este radio,
 * un predio perfectamente normal al lado de un embalse se queda sin análisis.
 *
 * Con 2 km alcanza para el salpicado y para un río, y no alcanza para inventar
 * un suelo del otro lado de una sierra. Lo que se corrió se informa: sale en
 * `desplazamiento_km` y la interfaz lo dice.
 */
const RADIO_BUSQUEDA_PX = 2;

/** Forma de la respuesta de la REST API de ISRIC, que es la que imita esta. */
export interface RespuestaSoilGrids {
  properties: {
    layers: Array<{
      name: string;
      unit_measure: { d_factor: number; mapped_units: string; target_units: string };
      depths: Array<{ label: string; values: { mean: number | null } }>;
    }>;
  };
  /** Añadido nuestro: de dónde salió el dato. La REST API no lo trae. */
  _acequia: {
    fuente: 'cog-1000m';
    resolucion_m: number;
    /**
     * Cuánto hubo que alejarse del punto para encontrar un píxel con dato, en
     * km. 0 = el píxel del punto. `null` = no había dato en el radio.
     */
    desplazamiento_km: number | null;
  };
}

/**
 * Imágenes ya abiertas, por propiedad y profundidad.
 *
 * Abrir un COG remoto cuesta dos viajes: la cabecera y los índices de tiles
 * (`TileOffsets`/`TileByteCounts`, 2.262 entradas cada uno en estos archivos).
 * Eso no cambia nunca —los rásters son de 2020 y son archivos estáticos—, así
 * que se guarda en memoria del proceso. En una lambda tibia el segundo punto
 * sólo paga las 42 tiles.
 */
const abiertas = new Map<string, Promise<GeoTIFFImage>>();

function imagen(prop: Propiedad, prof: string): Promise<GeoTIFFImage> {
  const clave = `${prop}/${prof}`;
  let p = abiertas.get(clave);
  if (!p) {
    const url = `${BASE}/${prop}/${prop}_${prof}_mean_1000.tif`;
    p = fromUrl(url).then(t => t.getImage(0));
    // Si falla, que el próximo pedido lo reintente en vez de quedar pegado a la
    // promesa rechazada para siempre.
    p.catch(() => abiertas.delete(clave));
    abiertas.set(clave, p);
  }
  return p;
}

interface Lectura {
  /** Entero crudo del ráster, sin dividir por `d_factor`. */
  valor: number | null;
  /** Distancia en píxeles (= km) al píxel usado. `null` si no se encontró. */
  distanciaPx: number | null;
}

/**
 * Un valor del ráster en el punto, con búsqueda del vecino más cercano si el
 * píxel del punto no tiene dato.
 *
 * Se pide una ventana de (2·radio+1)² de una sola vez porque cuesta lo mismo que
 * un píxel: entra toda en la misma tile de 512×512 salvo en el borde, y una tile
 * es el mínimo que el servidor puede entregar.
 */
async function leerPunto(img: GeoTIFFImage, lat: number, lng: number): Promise<Lectura> {
  const [ox, oy] = img.getOrigin() as [number, number, number];
  const { x, y } = aHomolosine(lat, lng);

  const px = Math.floor((x - ox) / RESOLUCION_M);
  const py = Math.floor((oy - y) / RESOLUCION_M);

  const r  = RADIO_BUSQUEDA_PX;
  const x0 = Math.max(0, px - r), y0 = Math.max(0, py - r);
  const x1 = Math.min(img.getWidth(),  px + r + 1);
  const y1 = Math.min(img.getHeight(), py + r + 1);
  if (x1 <= x0 || y1 <= y0) return { valor: null, distanciaPx: null };

  const banda = (await img.readRasters({ window: [x0, y0, x1, y1] }) as unknown as ArrayLike<number>[])[0]!;
  const ancho = x1 - x0;

  let valor: number | null = null;
  let mejor = Infinity;
  for (let j = y0; j < y1; j++) {
    for (let i = x0; i < x1; i++) {
      const v = banda[(j - y0) * ancho + (i - x0)]!;
      if (v === NO_DATA || !Number.isFinite(v)) continue;
      // Distancia de Chebyshev: el anillo de píxeles, no la diagonal exacta. Es
      // la misma noción que "a cuántos km del punto", con el paso de la grilla.
      const d = Math.max(Math.abs(i - px), Math.abs(j - py));
      if (d < mejor) { mejor = d; valor = v; }
    }
  }
  return { valor, distanciaPx: valor === null ? null : mejor };
}

/** Corre las tareas con un tope de concurrencia, preservando el orden. */
async function conTope<T, R>(items: T[], tope: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let siguiente = 0;
  const obreros = Array.from({ length: Math.min(tope, items.length) }, async () => {
    for (;;) {
      const i = siguiente++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!);
    }
  });
  await Promise.all(obreros);
  return out;
}

/**
 * Concurrencia contra files.isric.org.
 *
 * Son 42 archivos (7 propiedades × 6 profundidades) y cada uno cuesta dos o tres
 * viajes: la cabecera, el índice de tiles y la tile. El cuello no es el ancho de
 * banda —una tile son 35 KB— sino la latencia, así que serializar sale carísimo.
 * Medido el 26/09/2026 desde Argentina contra el servidor en Países Bajos, en
 * frío y sobre el mismo punto:
 *
 *   concurrencia  8 → 31,2 s
 *   concurrencia 21 → 25,4 s
 *   concurrencia 42 → 15,7 s
 *
 * Con 8 se pasa del presupuesto del cliente (45 s) apenas el servidor tenga un
 * mal momento, así que van los 42 de una. Son 42 pedidos de rango en una sola
 * ráfaga, una vez por predio nuevo, y después el punto queda 30 días en la caché
 * compartida: menos tráfico del que genera abrir un mapa de teselas. Un visor
 * web pide más que esto por cada paneo.
 *
 * (El segundo punto de la misma lambda sale en ~270 ms, porque las cabeceras y
 * las tiles vecinas ya están en memoria. Lo caro es siempre el arranque en frío.)
 */
const CONCURRENCIA = 42;

/**
 * Un reintento por archivo.
 *
 * Sin esto, una sola conexión cortada entre 42 tira todo el perfil a la API de
 * consulta, que es justo el camino que estamos tratando de no usar. Un reintento
 * alcanza: lo que falla acá son cortes sueltos, no falta de permiso.
 */
async function conUnReintento<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

/**
 * Perfil completo de SoilGrids en un punto, con la forma de la REST API.
 *
 * Tira si **cualquier** archivo falla en el transporte. Es a propósito: un
 * perfil al que le falta una propiedad porque se cortó una conexión no se
 * distingue, aguas abajo, de un perfil donde esa propiedad no existe, y el
 * llamador tiene que poder caer a la REST API en ese caso. NoData no es falla:
 * eso baja como `mean: null`, que es la respuesta correcta.
 */
export async function perfilSoilGridsCog(lat: number, lng: number): Promise<RespuestaSoilGrids> {
  const tareas = PROPIEDADES.flatMap(prop => PROFUNDIDADES.map(prof => ({ prop, prof })));

  const lecturas = await conTope(tareas, CONCURRENCIA, async ({ prop, prof }) =>
    conUnReintento(async () => {
      const img = await imagen(prop, prof);
      return { prop, prof, ...(await leerPunto(img, lat, lng)) };
    }));

  // Cuánto hubo que alejarse: el mayor corrimiento de las capas que sí tienen
  // dato. Se informa el peor caso, no el promedio, porque es una advertencia.
  const corridos = lecturas.map(l => l.distanciaPx).filter((d): d is number => d !== null);
  const desplazamiento_km = corridos.length ? Math.max(...corridos) : null;

  const layers = PROPIEDADES.map(prop => ({
    name: prop,
    unit_measure: {
      d_factor: D_FACTOR[prop],
      mapped_units: UNIDAD[prop],
      target_units: UNIDAD[prop],
    },
    depths: PROFUNDIDADES.map(prof => ({
      label: prof,
      values: { mean: lecturas.find(l => l.prop === prop && l.prof === prof)?.valor ?? null },
    })),
  }));

  return {
    properties: { layers },
    _acequia: { fuente: 'cog-1000m', resolucion_m: RESOLUCION_M, desplazamiento_km },
  };
}
