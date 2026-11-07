/**
 * El índice de suficiencia hídrica del forraje, **temporada por temporada**.
 *
 * ## Por qué el cálculo pasa acá y no en el cliente
 *
 * La ruta hermana `/ventana` entrega una ventana diaria de hasta 420 días, que es
 * lo que necesita un corte suelto. Esto necesita otra cosa: la serie **completa**,
 * porque el balance corre continuo para que cada temporada arranque con el agua
 * que dejó la anterior. Son 24.000 días, y mandárselos al cliente para que
 * devuelva sesenta y seis números sería mover medio megabyte para nada.
 *
 * Así que la serie se consume del lado del servidor —igual que en
 * `/api/clima-diario`— y sale sólo el índice de cada temporada con su
 * distribución. El balance es una función pura de `lib/`, así que corre igual
 * de los dos lados; lo que cambia es el tamaño del payload.
 *
 * ## La ventana de la serie es fija
 *
 * `1960-01-01` a `2025-12-31`, igual de determinista que el `1991-2025` de la
 * ruta hermana, porque una fecha de corte móvil daría una clave de caché nueva
 * todos los días.
 *
 * Las primeras temporadas salen **marcadas** y no entran en la distribución,
 * porque la cadena todavía arrastra el agua con la que arrancó. Cuántas son no lo
 * decide esta ruta ni una constante: se mide corriendo la cadena dos veces, del
 * perfil lleno y del vacío. En Sidney alcanzaron tres; en un clima donde el perfil
 * nunca se llena pueden no alcanzar nunca, y entonces la respuesta es que no hay
 * distribución. Ver `LA_CADENA_OLVIDA_EL_ARRANQUE`.
 *
 * ## Lo que hay que saber antes de usar el número
 *
 * La ventana de temporada es la misma para todos los años —el pastizal no rebrota
 * el mismo día siempre, y moverla quince días mueve el índice del año seco hasta
 * un 24 %—, la cadena no acumula nieve, y la distribución es la de lo que pasó y
 * no un pronóstico. Las tres salen en `avisos` y `advertencias`, y las tres están
 * medidas en `lib/forrajeAnios.ts`.
 */
import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import {
  distribucion,
  indicesPorAnio,
  indicesQueSirven,
  ventanasDeCadaAnio,
} from '@/lib/forrajeAnios';

const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };

/** Reanálisis histórico con ventana fija: casi estático. */
const CACHE_TTL = 60 * 60 * 24 * 90;

/** La ventana de la serie, fija para que la clave de caché no cambie por día. */
const PRIMER_ANIO = 1960;
const ULTIMO_ANIO = 2025;
const START = `${PRIMER_ANIO}-01-01`;
const END = `${ULTIMO_ANIO}-12-31`;

/**
 * Un pedido de 66 años diarios con dos variables, más el balance sobre 24.000
 * días. El balance tarda milisegundos; el pedido es lo que puede demorar.
 * El plan Hobby no admite más de 60.
 */
export const maxDuration = 60;

const ES_MD = /^\d{2}-\d{2}$/;

function error(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return error('Faltan lat/lng.', 400);

  const arranque = p.get('arranque');
  if (!arranque || !ES_MD.test(arranque)) {
    return error('Falta arranque, el día de rebrote en formato MM-DD.', 400);
  }
  if (arranque === '02-29') {
    return error('El 29 de febrero no existe en tres de cada cuatro años: elegí otro día de arranque.', 400);
  }

  const dias = Number(p.get('dias'));
  if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
    return error('Falta dias, el largo de la temporada, entre 1 y 365.', 400);
  }

  // El agua útil de las tres capas de 30 cm, en mm, de arriba hacia abajo.
  const awCrudo = (p.get('aw') ?? '').split(',').map(x => Number(x.trim()));
  if (awCrudo.length !== 3 || awCrudo.some(v => !Number.isFinite(v) || v <= 0)) {
    return error('Falta aw: el agua útil de las tres capas de 30 cm en mm, separadas por coma.', 400);
  }

  const numeroOpcional = (nombre: string): number | undefined => {
    const v = p.get(nombre);
    if (v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const kc = numeroOpcional('kc');
  const c = numeroOpcional('c');
  const b = numeroOpcional('b');
  const aguaBajo = numeroOpcional('agua_bajo_el_limite');

  // Mismo redondeo que las rutas hermanas: ~1 km, estable para la clave de caché.
  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);
  if (!Number.isFinite(parseFloat(latR)) || !Number.isFinite(parseFloat(lngR))) {
    return error('lat/lng no son números.', 400);
  }

  // Todo lo que cambia el resultado entra en la clave. Si falta un parámetro acá,
  // dos corridas distintas se sirven la misma respuesta.
  const dbKey = `clima-indices-v1:${latR},${lngR},${arranque},${dias},${awCrudo.join('-')},`
    + `${kc ?? ''},${c ?? ''},${b ?? ''},${aguaBajo ?? ''}`;
  const hit = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${latR}&longitude=${lngR}`
    + `&start_date=${START}&end_date=${END}`
    + '&daily=precipitation_sum,et0_fao_evapotranspiration&timezone=auto';

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(45_000) });
  } catch {
    return error('Open-Meteo no disponible, reintentá en unos segundos.', 503);
  }
  if (!res.ok) return error(`Open-Meteo respondió con error ${res.status}.`, res.status);

  let raw: {
    daily?: {
      time?: string[];
      precipitation_sum?: Array<number | null>;
      et0_fao_evapotranspiration?: Array<number | null>;
    };
  };
  try {
    raw = await res.json();
  } catch {
    return error('Respuesta inválida de Open-Meteo.', 502);
  }

  const d = raw.daily;
  if (!d?.time?.length) return error('Open-Meteo no devolvió serie para este punto.', 502);

  const precip = d.precipitation_sum ?? [];
  const et0 = d.et0_fao_evapotranspiration ?? [];
  const serie = d.time.map((fecha, i) => ({
    fecha,
    precip_mm: precip[i] ?? null,
    et0_mm: et0[i] ?? null,
  }));
  const nulos = serie.filter(x => x.precip_mm === null || x.et0_mm === null).length;
  if (nulos > 0) {
    // Sin rellenar y sin seguir: un hueco del reanálisis no es un día sin lluvia,
    // y la cadena es continua, así que un hueco en 1974 contamina 1975.
    return error(
      `La serie de este punto trae ${nulos} días incompletos y la cadena es continua, `
      + 'así que un hueco se arrastra a las temporadas siguientes. No se puede calcular el índice acá.',
      502,
    );
  }

  const ventanas = ventanasDeCadaAnio(PRIMER_ANIO, ULTIMO_ANIO, arranque, dias);
  if (ventanas === null) return error('La ventana de temporada pedida no es válida.', 400);

  const r = indicesPorAnio({
    serie,
    ventanas,
    aw_por_capa_mm: awCrudo,
    agua_bajo_el_limite_mm: aguaBajo,
    opciones: {
      ...(kc !== undefined ? { kc } : {}),
      ...(c !== undefined ? { c } : {}),
      ...(b !== undefined ? { b_constante: b } : {}),
    },
  });
  if (r === null) {
    return error('El balance no corrió con estas entradas: revisá el agua útil y la ventana.', 400);
  }

  const payload = JSON.stringify({
    anios: r.anios,
    distribucion: distribucion(indicesQueSirven(r.anios)),
    anios_sin_serie: r.anios_sin_serie,
    anios_descartados: r.anios_descartados,
    dias_corridos: r.dias_corridos,
    advertencias: r.advertencias,
    avisos: r.avisos,
    serie: { desde: START, hasta: END },
    fuente: 'Open-Meteo / ERA5 (reanálisis, ~10 km). et0_mm es la ETo de referencia de FAO-56, '
      + 'no la Eo de Wight y Hanks: ver ETO_NO_ES_EO y EL_ANIO_SECO_LO_DECIDE_LA_EO en lib/.',
  });

  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}
