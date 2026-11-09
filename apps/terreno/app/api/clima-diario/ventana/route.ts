/**
 * La ventana diaria que necesita el balance de forraje de Wight y Hanks.
 *
 * ## Por qué no alcanzaba `/api/clima-diario`
 *
 * Esa ruta pide a Open-Meteo 35 años de serie diaria y devuelve **estadística**:
 * extremos, tormenta de diseño, rachas, y la serie **dekadal** año por año que
 * usa el balance hídrico mensual. La serie diaria se consume del lado del
 * servidor y no sale.
 *
 * Y la dekadal no sirve para este balance. La ecuación 6 del modelo,
 * `E = Ep · t^(−1/2)`, cuenta **días desde que la superficie se mojó**: un total
 * de diez días no dice cuándo llovió, y las dos formas razonables de repartirlo
 * mueven el índice `T/Tp` un 12 % para arriba o un 18 % para abajo según cuál se
 * elija. Está medido en `LA_SERIE_DEKADAL_NO_ALCANZA`, en `lib/forrajeCorte.ts`.
 *
 * Así que el corte de pasto necesita su propia ventana, y chica: la temporada de
 * crecimiento más el calentamiento del perfil. Eso es lo que entrega esta ruta.
 *
 * ## Qué devuelve
 *
 * `{ dias: [{ fecha, precip_mm, et0_mm }], fuente, nulos }` — un día por fecha,
 * inclusive en las dos puntas, en el orden en que viene la serie.
 *
 * **Los `null` se pasan tal cual y no se rellenan con cero.** Un hueco del
 * reanálisis no es un día sin lluvia, y `ventanaDeBalance` los rechaza del lado
 * del cliente: una laguna que se viera como una seca saldría del otro lado como
 * una carga animal.
 *
 * `et0_mm` es la **ETo de referencia de FAO-56**, que no es la `Eo` que usó el
 * trabajo original. La sustitución está declarada en `ETO_NO_ES_EO` y acá se
 * repite en `fuente`, para que nadie la lea de este payload sin verla.
 */
import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import {
  coeficientesEo, normalesDelMesMasCalido,
  type CoeficientesEo, type DiaConRadiacion,
} from '@/lib/eoJensenHaise';

const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };

/** Reanálisis histórico: casi estático, igual que la ruta hermana. */
const CACHE_TTL = 60 * 60 * 24 * 90;

/**
 * El tope de días de la ventana.
 *
 * La temporada de crecimiento de la validación va de 68 a 99 días, y el
 * calentamiento del perfil que más se probó son 270. 420 deja margen para los
 * dos juntos y para un hemisferio sur cuya temporada cruza el año, y corta el
 * pedido de alguien que quiera bajarse la serie entera por acá.
 */
const MAX_DIAS = 420;

/** Lo más viejo que publica el archivo de Open-Meteo con ERA5. */
const PRIMER_DIA = '1940-01-01';

/**
 * El tramo del que salen las normales del mes más cálido para la `Eo`.
 *
 * Es **el mismo** que corre `/api/clima-diario/indices`, para que las dos rutas
 * calculen los mismos coeficientes.
 */
const NORMALES_DESDE = '1960-01-01';
const NORMALES_HASTA = '2025-12-31';

export const maxDuration = 60;

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function diasEntre(desde: string, hasta: string): number | null {
  const t0 = Date.parse(`${desde}T00:00:00Z`);
  const t1 = Date.parse(`${hasta}T00:00:00Z`);
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return null;
  return Math.round((t1 - t0) / 86_400_000) + 1;
}

function error(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  const desde = p.get('desde');
  const hasta = p.get('hasta');
  if (!lat || !lng) return error('Faltan lat/lng.', 400);
  if (!desde || !hasta) return error('Faltan desde/hasta, en formato YYYY-MM-DD.', 400);
  if (!ES_FECHA.test(desde) || !ES_FECHA.test(hasta)) {
    return error('Las fechas van en formato YYYY-MM-DD.', 400);
  }

  const n = diasEntre(desde, hasta);
  if (n === null) return error('Alguna de las dos fechas no existe.', 400);
  if (n < 1) return error('La fecha de inicio tiene que ser anterior o igual a la de fin.', 400);
  if (n > MAX_DIAS) {
    return error(
      `La ventana pedida son ${n} días y el tope es ${MAX_DIAS}. `
      + 'Esta ruta es para una temporada de crecimiento y su calentamiento, no para la serie entera.',
      400,
    );
  }
  if (desde < PRIMER_DIA) return error(`El archivo de ERA5 arranca el ${PRIMER_DIA}.`, 400);

  // Mismo redondeo que la ruta hermana: ~1 km, bajo la resolución de ERA5 pero
  // estable para la clave de caché.
  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);
  if (!Number.isFinite(parseFloat(latR)) || !Number.isFinite(parseFloat(lngR))) {
    return error('lat/lng no son números.', 400);
  }

  const dbKey = `clima-ventana-v1:${latR},${lngR},${desde},${hasta}`;
  const hit = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${latR}&longitude=${lngR}`
    + `&start_date=${desde}&end_date=${hasta}`
    + '&daily=precipitation_sum,et0_fao_evapotranspiration,shortwave_radiation_sum,'
    + 'temperature_2m_max,temperature_2m_min&timezone=auto';

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch {
    return error('Open-Meteo no disponible, reintentá en unos segundos.', 503);
  }
  if (!res.ok) return error(`Open-Meteo respondió con error ${res.status}.`, res.status);

  let raw: {
    elevation?: number;
    daily?: {
      time?: string[];
      precipitation_sum?: Array<number | null>;
      et0_fao_evapotranspiration?: Array<number | null>;
      shortwave_radiation_sum?: Array<number | null>;
      temperature_2m_max?: Array<number | null>;
      temperature_2m_min?: Array<number | null>;
    };
  };
  try {
    raw = await res.json();
  } catch {
    return error('Respuesta inválida de Open-Meteo.', 502);
  }

  const d = raw.daily;
  if (!d?.time?.length) return error('Open-Meteo no devolvió serie para esta ventana.', 502);

  const precip = d.precipitation_sum ?? [];
  const et0 = d.et0_fao_evapotranspiration ?? [];
  const rs = d.shortwave_radiation_sum ?? [];
  const tmax = d.temperature_2m_max ?? [];
  const tmin = d.temperature_2m_min ?? [];
  const dias = d.time.map((fecha, i) => ({
    fecha,
    // Sin rellenar: un hueco del reanálisis no es un día sin lluvia.
    precip_mm: precip[i] ?? null,
    et0_mm: et0[i] ?? null,
    rs_mj_m2: rs[i] ?? null,
    t_max_c: tmax[i] ?? null,
    t_min_c: tmin[i] ?? null,
  }));
  const nulos = dias.filter(
    x => x.precip_mm === null || x.et0_mm === null || x.rs_mj_m2 === null
      || x.t_max_c === null || x.t_min_c === null,
  ).length;

  // Los coeficientes de la `Eo`, que son del punto y no de la ventana.
  const coeficientes = await coeficientesDelPunto(latR, lngR, raw.elevation);

  const payload = JSON.stringify({
    dias,
    /**
     * Cuántos días vinieron incompletos. El cliente los rechaza igual, pero
     * saber el número permite decirle al usuario que la ventana es demasiado
     * reciente en vez de que «no hay serie».
     */
    nulos,
    dias_pedidos: n,
    /**
     * Los coeficientes de la `Eo` de Jensen-Haise de este punto, o `null` si no
     * se pudieron calcular. El cliente se los pasa a `ventanaDeBalance` y la
     * ruta de índices calcula **los mismos** sobre la misma definición, para que
     * el `Yp` del corte y los índices de los otros años no salgan de dos `Eo`
     * distintas.
     */
    coeficientes_eo: coeficientes,
    fuente: coeficientes
      ? 'Open-Meteo / ERA5 (reanálisis, ~10 km). La Eo del balance se calcula por Jensen-Haise '
        + 'modificada, que es el método con el que Wight y Hanks ajustaron su Kc y su b: ver '
        + 'lib/eoJensenHaise.ts.'
      : 'Open-Meteo / ERA5 (reanálisis, ~10 km). Sin coeficientes de Jensen-Haise, el balance usa '
        + 'et0_mm, que es la ETo de referencia de FAO-56 y no la Eo de Wight y Hanks: ver '
        + 'ETO_NO_ES_EO en lib/forrajeCorte.ts.',
  });

  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

/**
 * Los coeficientes `CT` y `Tx` de la `Eo` de Jensen-Haise de un punto.
 *
 * Las normales del mes más cálido no se pueden sacar de una ventana de una
 * temporada, así que van en un pedido aparte y con su propia caché: son del
 * punto y no de la ventana, y las usa cualquier corte de cualquier año.
 *
 * **El tramo es el mismo que el de `/api/clima-diario/indices`**, 1960 a 2025, a
 * propósito: si las dos rutas sacaran las normales de períodos distintos, el
 * `Yp` del corte y los índices de los otros años saldrían de dos `Eo` que no son
 * la misma y el error se cancelaría mal. Ver `EntradasIndicesPorAnio`.
 *
 * Devuelve `null` si Open-Meteo no responde, si no hay altitud del píxel o si la
 * serie no alcanza: ahí el balance cae a la ETo de FAO-56 con su aviso, que es
 * la degradación declarada y no un silencio.
 */
async function coeficientesDelPunto(
  latR: string,
  lngR: string,
  elevacion?: number,
): Promise<CoeficientesEo | null> {
  if (elevacion === undefined || !Number.isFinite(elevacion)) return null;

  const key = `clima-eo-coef-v1:${latR},${lngR},${elevacion}`;
  const hit = await cacheGet<{ coef: CoeficientesEo | null }>(key);
  if (hit !== null && hit !== undefined && 'coef' in hit) return hit.coef;

  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${latR}&longitude=${lngR}`
    + `&start_date=${NORMALES_DESDE}&end_date=${NORMALES_HASTA}`
    + '&daily=temperature_2m_max,temperature_2m_min&timezone=auto';

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let raw: {
    daily?: {
      time?: string[];
      temperature_2m_max?: Array<number | null>;
      temperature_2m_min?: Array<number | null>;
    };
  };
  try {
    raw = await res.json();
  } catch {
    return null;
  }
  const d = raw.daily;
  if (!d?.time?.length) return null;
  const tmax = d.temperature_2m_max ?? [];
  const tmin = d.temperature_2m_min ?? [];
  const serie: DiaConRadiacion[] = d.time.map((fecha, i) => ({
    fecha,
    t_max_c: tmax[i] ?? null,
    t_min_c: tmin[i] ?? null,
    rs_mj_m2: null,
  }));

  const normales = normalesDelMesMasCalido(serie);
  const coef = normales === null ? null : coeficientesEo({
    elevacion_m: elevacion,
    tmax_normal_c: normales.tmax_c,
    tmin_normal_c: normales.tmin_c,
    mes_mas_calido: normales.mes,
    anios_de_las_normales: normales.anios,
    normales_de_reanalisis: true,
  });

  await cacheSet(key, { coef }, CACHE_TTL);
  return coef;
}
