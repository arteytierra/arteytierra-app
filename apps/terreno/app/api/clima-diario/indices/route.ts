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
import { coeficientesDeLaSerie } from '@/lib/eoJensenHaise';
import { requierePlan } from '@/lib/auth/apiGuard';
import {
  distribucion,
  indicesPorAnio,
  indicesQueSirven,
  ventanasDeCadaAnio,
} from '@/lib/forrajeAnios';
import { humedadDeLaSerie } from '@/lib/aguaDelPerfil';

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
  const dbKey = `clima-indices-v4:${latR},${lngR},${arranque},${dias},${awCrudo.join('-')},`
    + `${kc ?? ''},${c ?? ''},${b ?? ''},${aguaBajo ?? ''}`;
  const hit = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${latR}&longitude=${lngR}`
    + `&start_date=${START}&end_date=${END}`
    + '&daily=precipitation_sum,et0_fao_evapotranspiration,shortwave_radiation_sum,'
    + 'temperature_2m_max,temperature_2m_min,soil_temperature_28_to_100cm_mean,'
    + 'soil_moisture_0_to_7cm_mean,soil_moisture_7_to_28cm_mean,soil_moisture_28_to_100cm_mean&timezone=auto';

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(45_000) });
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
      soil_temperature_28_to_100cm_mean?: Array<number | null>;
      soil_moisture_0_to_7cm_mean?: Array<number | null>;
      soil_moisture_7_to_28cm_mean?: Array<number | null>;
      soil_moisture_28_to_100cm_mean?: Array<number | null>;
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
  const rs = d.shortwave_radiation_sum ?? [];
  const tmax = d.temperature_2m_max ?? [];
  const tmin = d.temperature_2m_min ?? [];
  // La capa de 28 a 100 cm de ERA5-Land, que es la que contiene a las dos capas
  // del modelo que llevan factor de actividad radicular. Si la serie no la trae
  // completa, la cadena corre sin el factor y lo advierte: ver
  // `actividadRadicular.ts`. Media serie con factor y media sin él se rechaza.
  const tsuelo = d.soil_temperature_28_to_100cm_mean ?? [];
  const sueloCompleto = tsuelo.length === d.time.length
    && tsuelo.every(v => v !== null && v !== undefined && Number.isFinite(v));
  // La humedad de suelo de las tres primeras capas de ERA5-Land, que es con lo
  // que cada temporada arranca con el agua **medida** en vez de con la que dejó
  // el invierno simulado. La textura del píxel se identifica de la propia serie.
  // Si no llega completa, se cae a la cadena y el aviso lo dice: ver
  // `aguaDelPerfil.ts`.
  const humedad = humedadDeLaSerie(
    d.soil_moisture_0_to_7cm_mean ?? [],
    d.soil_moisture_7_to_28cm_mean ?? [],
    d.soil_moisture_28_to_100cm_mean ?? [],
  );
  const aguaCompleta = humedad !== null && humedad.completa
    && humedad.por_dia.length === d.time.length;

  const serie = d.time.map((fecha, i) => ({
    fecha,
    precip_mm: precip[i] ?? null,
    et0_mm: et0[i] ?? null,
    rs_mj_m2: rs[i] ?? null,
    t_max_c: tmax[i] ?? null,
    t_min_c: tmin[i] ?? null,
    ...(sueloCompleto ? { t_suelo_30_90_c: tsuelo[i] as number } : {}),
    ...(aguaCompleta
      ? { agua_util_por_capa: humedad.por_dia[i] as readonly number[] }
      : {}),
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

  /**
   * La `Eo` del modelo, calculada con las normales del mes más cálido de esta
   * misma serie y la altitud que devuelve Open-Meteo para el píxel.
   *
   * Si no sale —serie corta, o un mes más cálido al que le faltan días— la
   * cadena cae a la ETo de FAO-56 y el aviso lo dice, que es la degradación
   * declarada en `ETO_NO_ES_EO`. No se inventa una altitud ni se estiran las
   * normales: con menos de diez años, `coeficientesDeLaSerie` devuelve `null`.
   */
  const elevacion = raw.elevation;
  const coeficientes = elevacion !== undefined && Number.isFinite(elevacion)
    ? coeficientesDeLaSerie(serie, elevacion)
    : null;

  const r = indicesPorAnio({
    serie,
    ventanas,
    aw_por_capa_mm: awCrudo,
    coeficientes_eo: coeficientes,
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
    /**
     * Los coeficientes de la `Eo`, para que el cliente pueda mostrarlos y, sobre
     * todo, para que el corte del que sale el `Yp` use **los mismos**.
     */
    coeficientes_eo: coeficientes,
    /**
     * Si la cadena restringió la extracción de las capas profundas por
     * temperatura de suelo. El corte del que sale el `Yp` tiene que haber
     * corrido igual: con factor y sin factor los índices no son comparables.
     */
    actividad_radicular: r.actividad_radicular,
    /**
     * Si cada temporada arrancó con el agua del perfil **medida** en vez de con
     * la que dejó el invierno simulado. El corte del que sale el `Yp` tiene que
     * haber corrido igual: en Sidney la mediana del índice se mueve 0,10 entre
     * una cosa y la otra.
     */
    agua_inicial_medida: r.agua_inicial_medida,
    /** La clase de textura de H-TESSEL que se identificó para el píxel. */
    textura_del_pixel: humedad === null ? null : {
      clase: humedad.textura.textura.clase,
      agua_util_m3_m3: humedad.textura.textura.agua_util,
      maximo_de_la_serie: humedad.textura.maximo_de_la_serie,
    },
    fuente: coeficientes
      ? 'Open-Meteo / ERA5 (reanálisis, ~10 km). La Eo del balance se calculó por Jensen-Haise '
        + 'modificada —el método con el que Wight y Hanks ajustaron su Kc y su b— con las '
        + 'normales del mes más cálido de esta serie: ver lib/eoJensenHaise.ts. '
        + (r.actividad_radicular
          ? 'La extracción de las capas de 30-60 y 60-90 cm se restringió por temperatura de '
            + 'suelo de ERA5-Land, capa de 28 a 100 cm: ver lib/actividadRadicular.ts.'
          : 'No llegó la temperatura del suelo, así que las capas profundas corrieron sin el '
            + 'factor de actividad radicular y el índice sale alto.')
        + (r.agua_inicial_medida
          ? ' El agua con la que arranca cada temporada sale de la humedad de suelo de '
            + 'ERA5-Land: ver lib/aguaDelPerfil.ts.'
          : ' No llegó la humedad del suelo, así que el agua con la que arranca cada temporada '
            + 'sale de correr el balance fuera de temporada, que en Sidney entrega unos 40 mm de '
            + 'mas sobre 150 y deja el indice alto.')
      : 'Open-Meteo / ERA5 (reanálisis, ~10 km). No se pudieron calcular los coeficientes de la '
        + 'Eo de Jensen-Haise, así que el balance usó la ETo de referencia de FAO-56: ver '
        + 'ETO_NO_ES_EO en lib/forrajeCorte.ts.',
  });

  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}
