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
import { rotuloKoppen } from '@/lib/koppenTexto';

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
 * El grupo y el rótulo en castellano salen de `lib/koppenTexto.ts`, que es la
 * única tabla de las 31 clases.
 *
 * Acá había una copia, con el argumento de que importar de `lib/clima.ts`
 * arrastraría medio módulo de cliente adentro de la función serverless. El
 * argumento era bueno y el resultado no: las dos tablas se escribieron con
 * palabras distintas, así que la misma clase se llamaba «Selva tropical
 * lluviosa» o «Selva tropical (lluvia todo el año)» según de dónde hubiera
 * salido —del clasificador o del mapa—, que es justo lo que no puede pasar
 * cuando las dos aparecen en la misma pantalla. `koppenTexto` no importa nada:
 * son tablas y una función pura, y pesa menos que la copia que reemplaza.
 */

export const FUENTE_KOPPEN_BECK =
  'Köppen-Geiger 1 km, 1991–2020 — Beck et al. (2023), CC BY 4.0';

/**
 * Los tres períodos que hostea la app, de los siete que publica Beck.
 *
 * 'presente' es el que manda: es la clase del predio hoy y la que alimenta
 * análogos y biomas. Los otros dos existen para una sola pregunta, que es la que
 * importa cuando se planta un monte que tarda treinta años: **¿el clima de acá
 * ya cambió de clase, y a cuál va?**
 *
 * El futuro es **SSP2-4.5**, el escenario intermedio del CMIP6 —el que se usa
 * como referencia de planificación—. Beck publica siete; traer los siete serían
 * 84 MB para mostrar un abanico que nadie va a leer. Si alguna vez hace falta el
 * peor caso, SSP5-8.5 está en el mismo zip y entra acá sin tocar nada más.
 */
export type PeriodoKoppen = 'pasado' | 'presente' | 'futuro';

interface DefPeriodo { archivo: string; etiqueta: string }

export const PERIODOS: Record<PeriodoKoppen, DefPeriodo> = {
  pasado:   { archivo: 'koppen_geiger_1961_1990_1km.tif',            etiqueta: '1961-1990' },
  presente: { archivo: 'koppen_geiger_1991_2020_1km.tif',            etiqueta: '1991-2020' },
  futuro:   { archivo: 'koppen_geiger_2071_2099_ssp245_1km.tif',     etiqueta: '2071-2099 (SSP2-4.5)' },
};

/**
 * Cada archivo se abre una vez por instancia y queda cacheado: abrirlo lee el
 * directorio de teselas (14.365 offsets), y hacerlo en cada request sería el
 * grueso del costo. Si la apertura falla se guarda `null` y no se reintenta en
 * caliente: sin el mapa la app sigue con el Köppen calculado.
 */
const tiffs = new Map<PeriodoKoppen, Promise<GeoTIFF | null>>();

function abrir(periodo: PeriodoKoppen): Promise<GeoTIFF | null> {
  let pr = tiffs.get(periodo);
  if (!pr) {
    const ruta = path.join(process.cwd(), 'datos', 'koppen', PERIODOS[periodo].archivo);
    pr = fromFile(ruta).catch(() => null);
    tiffs.set(periodo, pr);
  }
  return pr;
}

/**
 * Clase Köppen del punto, o `null` si el mapa no tiene dato ahí (océano) o no se
 * pudo leer. El llamador se queda con el Köppen calculado en ese caso.
 */
export async function koppenBeck(
  lat: number,
  lng: number,
  periodo: PeriodoKoppen = 'presente',
): Promise<Koppen | null> {
  if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  const tiff = await abrir(periodo);
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

    const info = rotuloKoppen(codigo);
    return { codigo, grupo: info.grupo, descripcion: info.titulo };
  } catch {
    return null;
  }
}

// ─── Deriva climática: dónde estaba el predio, dónde está, a dónde va ─────────

export interface DerivaKoppen {
  pasado:   Koppen | null;
  presente: Koppen | null;
  futuro:   Koppen | null;
  /** La clase ya cambió entre 1961-1990 y 1991-2020. */
  yaCambio: boolean;
  /** La clase cambia entre 1991-2020 y 2071-2099 bajo SSP2-4.5. */
  vaACambiar: boolean;
  /** Qué se mueve en el salto que haya (el futuro pesa más que el pasado). */
  queCambia: string | null;
}

/**
 * Qué parte de la clasificación se mueve entre dos códigos Köppen. No es
 * cosmético: cambiar de grupo (C→B) es que el lugar se vuelve árido y hay que
 * repensar el agua; cambiar la segunda letra (f→s) es que la lluvia se corre de
 * estación y hay que repensar el calendario; cambiar la tercera (b→a) es que los
 * veranos se ponen calurosos y hay que repensar qué especies aguantan.
 */
function queSeMueve(a: string, b: string): string | null {
  if (a === b) return null;
  if (a[0] !== b[0]) return 'el tipo de clima: cambia el régimen de fondo, no un matiz';
  if (a.length > 1 && b.length > 1 && a[1] !== b[1])
    return 'la estación de las lluvias: el calendario de siembra se corre';
  if (a.length > 2 && b.length > 2 && a[2] !== b[2])
    return 'el rigor térmico: cambia qué especies aguantan el verano o el invierno';
  return 'la clase, dentro del mismo grupo';
}

/**
 * Lee el mismo punto en los tres períodos. Para plantar un monte —que tarda
 * treinta años en ser monte— importa menos en qué clima está el predio que a
 * cuál se dirige.
 *
 * Los tres archivos son locales: se leen en paralelo y es una tesela de cada uno.
 */
export async function derivaKoppen(lat: number, lng: number): Promise<DerivaKoppen> {
  const [pasado, presente, futuro] = await Promise.all([
    koppenBeck(lat, lng, 'pasado'),
    koppenBeck(lat, lng, 'presente'),
    koppenBeck(lat, lng, 'futuro'),
  ]);

  const yaCambio   = !!pasado   && !!presente && pasado.codigo   !== presente.codigo;
  const vaACambiar = !!presente && !!futuro   && presente.codigo !== futuro.codigo;

  // Si las dos cosas pasan, se cuenta la que todavía se puede anticipar.
  const queCambia =
    vaACambiar ? queSeMueve(presente!.codigo, futuro!.codigo)
    : yaCambio ? queSeMueve(pasado!.codigo, presente!.codigo)
    : null;

  return { pasado, presente, futuro, yaCambio, vaACambiar, queCambia };
}
