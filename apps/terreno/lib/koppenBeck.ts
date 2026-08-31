/**
 * Köppen-Geiger de 1 km leído del mapa de Beck et al. (2023).
 *
 * Hasta ahora la app **calculaba** el Köppen del predio con las reglas de la
 * clasificación sobre las medias mensuales de NASA POWER. Eso arrastra dos
 * problemas: la celda de POWER es de ~50 km —un valle y la ladera de enfrente
 * caen en el mismo píxel— y las reglas tienen umbrales duros, así que un predio
 * que está a medio grado de un límite salta de clase con cualquier ruido de la
 * fuente. Y los límites de Köppen son bordes ecológicos reales: es justo donde
 * más molesta equivocarse.
 *
 * Beck et al. publicaron el mapa **ya clasificado a 1 km**, hecho con un
 * ensamble de fuentes de temperatura y lluvia con corrección de sesgo. Pasamos
 * de calcular la etiqueta a leerla.
 *
 * **Esto reemplaza sólo la etiqueta.** No trae ningún número: la precipitación,
 * la temperatura, la ETP y el balance hídrico siguen saliendo de POWER y Daymet.
 *
 * Licencia: CC BY 4.0 — uso comercial permitido, con atribución.
 * Beck, H. E. et al. "High-resolution (1 km) Köppen-Geiger maps for 1901-2099
 * based on constrained CMIP6 projections", Scientific Data 10, 724 (2023).
 * https://doi.org/10.6084/m9.figshare.21789074.v2
 *
 * El archivo vive en `apps/terreno/datos/koppen/` y viaja con el bundle de la
 * función serverless por `outputFileTracingIncludes` en `next.config.ts`: si se
 * mueve el archivo, hay que mover también esa entrada o en producción no está.
 *
 * El GeoTIFF es **teselado (256×256) y comprimido con LZW**, no un raster plano:
 * no se puede hacer un `seek` al byte. `geotiff` lee sólo la tesela que contiene
 * el punto (unos pocos kB) y descomprime eso, así que nunca entran los 933
 * millones de píxeles del mapa en memoria.
 */
import path from 'node:path';
import { fromFile, type GeoTIFF } from 'geotiff';
import type { Koppen } from '@/lib/clima';

/** Grilla del archivo: global, EPSG:4326, 30 arcsec. */
const RES = 1 / 120; // 0,00833333°
const ANCHO = 43200;
const ALTO = 21600;

/** Valor → símbolo, tal cual el `legend.txt` que viene con el mapa. El 0 es
 *  "sin clase" (océano o sin dato) y no está en la tabla: ahí se cae al
 *  Köppen calculado. */
const CLASES = [
  '', 'Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk',
  'Csa', 'Csb', 'Csc', 'Cwa', 'Cwb', 'Cwc', 'Cfa', 'Cfb', 'Cfc',
  'Dsa', 'Dsb', 'Dsc', 'Dsd', 'Dwa', 'Dwb', 'Dwc', 'Dwd',
  'Dfa', 'Dfb', 'Dfc', 'Dfd', 'ET', 'EF',
] as const;

/**
 * Grupo y descripción en castellano. Se definen acá y no se importan de
 * `lib/clima.ts` a propósito: ese módulo es de cliente y arrastraría medio
 * `clima.ts` adentro de la función. Las 30 clases de Beck son un subconjunto de
 * las que ya maneja el clasificador —la única que él puede producir y Beck no
 * es `As`, que Beck agrupa dentro de `Aw`—, así que los textos coinciden.
 */
const DESC: Record<string, { grupo: string; desc: string }> = {
  Af:  { grupo: 'Tropical',    desc: 'Selva tropical (lluvia todo el año)' },
  Am:  { grupo: 'Tropical',    desc: 'Monzónico' },
  Aw:  { grupo: 'Tropical',    desc: 'Sabana (invierno seco)' },
  BWh: { grupo: 'Árido',       desc: 'Desierto cálido' },
  BWk: { grupo: 'Árido',       desc: 'Desierto frío' },
  BSh: { grupo: 'Árido',       desc: 'Estepa cálida (semiárido cálido)' },
  BSk: { grupo: 'Árido',       desc: 'Estepa fría (semiárido frío)' },
  Csa: { grupo: 'Templado',    desc: 'Mediterráneo de verano cálido' },
  Csb: { grupo: 'Templado',    desc: 'Mediterráneo de verano templado' },
  Csc: { grupo: 'Templado',    desc: 'Mediterráneo de verano fresco' },
  Cwa: { grupo: 'Templado',    desc: 'Subtropical de invierno seco' },
  Cwb: { grupo: 'Templado',    desc: 'Templado de altura, invierno seco' },
  Cwc: { grupo: 'Templado',    desc: 'Templado frío, invierno seco' },
  Cfa: { grupo: 'Templado',    desc: 'Húmedo de verano cálido' },
  Cfb: { grupo: 'Templado',    desc: 'Oceánico (verano templado)' },
  Cfc: { grupo: 'Templado',    desc: 'Oceánico frío (subpolar)' },
  Dsa: { grupo: 'Continental', desc: 'Continental de verano seco y cálido' },
  Dsb: { grupo: 'Continental', desc: 'Continental de verano seco y templado' },
  Dsc: { grupo: 'Continental', desc: 'Continental de verano seco y fresco' },
  Dsd: { grupo: 'Continental', desc: 'Continental de verano seco, invierno muy frío' },
  Dwa: { grupo: 'Continental', desc: 'Continental de invierno seco y verano cálido' },
  Dwb: { grupo: 'Continental', desc: 'Continental de invierno seco y verano templado' },
  Dwc: { grupo: 'Continental', desc: 'Continental de invierno seco y verano fresco' },
  Dwd: { grupo: 'Continental', desc: 'Continental de invierno seco muy frío' },
  Dfa: { grupo: 'Continental', desc: 'Continental húmedo de verano cálido' },
  Dfb: { grupo: 'Continental', desc: 'Continental húmedo de verano templado' },
  Dfc: { grupo: 'Continental', desc: 'Subártico' },
  Dfd: { grupo: 'Continental', desc: 'Subártico de invierno extremo' },
  ET:  { grupo: 'Polar',       desc: 'Tundra / altoandino' },
  EF:  { grupo: 'Polar',       desc: 'Hielo permanente' },
};

export const FUENTE_KOPPEN_BECK =
  'Köppen-Geiger 1 km, 1991–2020 — Beck et al. (2023), CC BY 4.0';

const ARCHIVO = path.join(
  process.cwd(),
  'datos', 'koppen', 'koppen_geiger_1991_2020_1km.tif',
);

/**
 * El archivo se abre una vez por instancia y queda cacheado: abrirlo lee el
 * directorio de teselas (14.365 offsets), y hacerlo en cada request sería el
 * grueso del costo. Si la apertura falla se guarda `null` y no se reintenta en
 * caliente: sin el mapa la app sigue con el Köppen calculado.
 */
let tiffPromesa: Promise<GeoTIFF | null> | null = null;

function abrir(): Promise<GeoTIFF | null> {
  tiffPromesa ??= fromFile(ARCHIVO).catch(() => null);
  return tiffPromesa;
}

/**
 * Clase Köppen del punto, o `null` si el mapa no tiene dato ahí (océano) o no se
 * pudo leer. El llamador se queda con el Köppen calculado en ese caso.
 */
export async function koppenBeck(lat: number, lng: number): Promise<Koppen | null> {
  if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  const tiff = await abrir();
  if (!tiff) return null;

  // Píxel que contiene el punto. El `min` cubre el borde exacto: lng = 180 o
  // lat = −90 darían una columna o una fila de más.
  const col = Math.min(ANCHO - 1, Math.floor((lng + 180) / RES));
  const fila = Math.min(ALTO - 1, Math.floor((90 - lat) / RES));

  try {
    const img = await tiff.getImage();
    // Ventana de 1×1: `geotiff` la traduce a la única tesela de 256×256 que la
    // contiene y descomprime sólo ésa.
    const bandas = await img.readRasters({ window: [col, fila, col + 1, fila + 1] });
    const banda = (bandas as unknown as Array<ArrayLike<number>>)[0];
    const valor = banda?.[0];
    if (valor === undefined) return null;

    const codigo = CLASES[valor];
    // 0 = sin clase (océano). Un valor fuera de la tabla querría decir que el
    // archivo no es el que creemos: tampoco ahí se inventa una clase.
    if (!codigo) return null;

    const info = DESC[codigo]!;
    return { codigo, grupo: info.grupo, descripcion: info.desc };
  } catch {
    return null;
  }
}
