/**
 * El dato de la pieza A del encargo 04 —el sol y el viento— y las capas que lo
 * dibujan.
 *
 * Todo sale de `generado/cuetiepa-sol-viento.json`, que escribe
 * `apps/terreno/scripts/datos-sol-viento.ts` llamando a `calcularArcoSolar`,
 * `calcularInsolacion`, `obtenerClima` y `construirCortina` sobre los mismos
 * siete mojones que las piezas ya aprobadas. Acá no se calcula nada: se lee.
 *
 * ── Lo que este archivo NO dibuja, y es parte del encargo ──────────────────
 *
 * · **Ningún número de horas de sol.** `insolacion.ts` avisa en su cabecera que
 *   es sin nubes, sin refracción y sobre un modelo de ~30 m. El JSON trae el
 *   mínimo, el máximo y el promedio porque sin ellos no se puede normalizar el
 *   color ni verificar nada; de acá no sale ninguno a la pantalla.
 * · **Ninguna especie de la cortina.** `ESTRATOS_CORTINA` nombra algarrobo,
 *   quebracho blanco y jarilla, que son del espinal argentino, y este predio
 *   está en Chiapas. Lo que se dibuja es la estructura —una banda de ancho
 *   medido con su zona de resguardo— y no una lista de plantas que no viven
 *   ahí. El aviso viaja en el propio JSON.
 * · **Ningún rótulo.** Las tres trayectorias se distinguen por el color que les
 *   pone la app (`#FF5722`, `#43A047`, `#1E88E5`) y el resto se lee de la
 *   geometría. Qué es cada cosa lo dice la página, igual que el crédito.
 */
import crudo from '../../../generado/cuetiepa-sol-viento.json';

type Par = [number, number];

/** Un punto del arco: longitud, latitud, elevación en grados y avance del día. */
type PuntoArco = [number, number, number, number];

/**
 * Los rectángulos de un mapa de horas, ya juntados por fila.
 *
 * Va escrito con la geometría concreta y no como `unknown[]`: MapLibre pide un
 * `FeatureCollection` de verdad para una fuente `geojson`, y un `unknown[]`
 * obliga a un `as` en el lugar donde se monta la fuente —que es exactamente
 * donde no se quiere apagar el chequeo—.
 */
interface RectsDeHoras {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    /** `c` es el color de la clase y `n` la clase normalizada, de 0 a 1. */
    properties: { c: string; n: number };
    geometry: { type: 'Polygon'; coordinates: Par[][] };
  }>;
}

export interface DatosSolViento {
  predio: string;
  lat: number; lng: number;
  bbox: [number, number, number, number];
  mojones: Par[];
  relieve: { fuente: string; resolucion_m: number; atribucion: string };
  sol: {
    radio_m: number;
    brujula: { N: Par; S: Par; E: Par; O: Par };
    arcos: Array<{
      clave: string; label: string; corto: string; color: string;
      doy: number; horas_luz: number;
      /** `declinación > latitud`: el mediodía pasa por el norte. No es el hemisferio. */
      por_el_norte: boolean;
      puntos: PuntoArco[];
      amanecer: { p: Par; az: number; hora: number };
      atardecer: { p: Par; az: number; hora: number };
      mediodia: { p: Par; az: number; elev: number; norte_m: number };
    }>;
    proyeccion: string;
    nota_hemisferio: string;
  };
  insolacion: {
    paso_min: number; clases: number;
    grilla: { cols: number; rows: number; paso_m: number };
    resolucion_fuente_m: number;
    celdas_dentro: number;
    max_comun_h: number;
    dias: Array<{
      cual: 'verano' | 'invierno';
      doy: number; label: string; corto: string;
      horas_luz: number; salida: number; puesta: number;
      min: number; max: number; promedio: number;
      rectangulos: number;
      rects: RectsDeHoras;
    }>;
    limites: string;
  };
  viento: {
    fuente: string;
    meses: Array<{
      i: number; nombre: string; dir: string; dir_deg: number;
      vel_ms: number; vel_max_ms: number | null;
      sector: Par[];
    }>;
    rango_deg: { min: number; max: number };
    modal: { rumbo: string; veces: number; az: number };
    mes_mas_fuerte: { nombre: string; vel_ms: number; az: number };
    anual_de_la_app: string;
    anual_coincide_con_algun_mes: boolean;
    default_de_la_app_deg: number;
    por_que_modal: string;
    cortina: {
      eje: Par[]; banda: Par[]; zona: Par[];
      ancho_m: number; alto_m: number; longitud_m: number;
      proteccion_m: number; factor: number;
      area_banda_ha: number; area_protegida_ha: number;
      dir_viento: string; estratos: number; aviso_estratos: string;
    };
  };
  bitacora_red: string[];
}

export const SV = crudo as unknown as DatosSolViento;

const coleccion = <G,>(features: Array<{ type: 'Feature'; properties: Record<string, unknown>; geometry: G }>) =>
  ({ type: 'FeatureCollection' as const, features });

const linea = (puntos: Par[], properties: Record<string, unknown> = {}) => ({
  type: 'Feature' as const, properties,
  geometry: { type: 'LineString' as const, coordinates: puntos },
});

const poligono = (anillo: Par[], properties: Record<string, unknown> = {}) => ({
  type: 'Feature' as const, properties,
  geometry: {
    type: 'Polygon' as const,
    coordinates: [anillo[0]! === anillo[anillo.length - 1]! ? anillo : [...anillo, anillo[0]!]],
  },
});

// ─── 01 · Los arcos ─────────────────────────────────────────────────────────

/**
 * Las tres trayectorias, **una fuente por arco**.
 *
 * Son tres y no una porque cada una se dibuja con su propio color y
 * `line-gradient` es una propiedad de capa, no un valor por rasgo: tres arcos
 * en una sola fuente sólo pueden dibujarse del mismo color, y el color es lo
 * que distingue el solsticio alto del bajo.
 *
 * El avance del degradado va de 0 a 1 a lo largo del recorrido, que acá es el
 * día: los puntos vienen muestreados cada diez minutos del amanecer al
 * atardecer, así que dibujar la línea de punta a punta ES el sol cruzando el
 * cielo. Por eso la fuente lleva `lineMetrics`.
 */
export const GEO_ARCOS = SV.sol.arcos.map(a =>
  coleccion([linea(a.puntos.map(p => [p[0], p[1]] as Par), {
    clave: a.clave, color: a.color, por_el_norte: a.por_el_norte,
  })]));

/**
 * El mediodía de cada arco, como punto.
 *
 * Es el dato que el encargo pide que se vea: a 17,33° N el mediodía de junio
 * cae al NORTE del centro del círculo —103 m al norte— y los otros dos al sur
 * —298 y 686 m—. Un punto que late en cada cúspide lo señala sin escribir una
 * palabra.
 */
export const GEO_MEDIODIAS = coleccion(SV.sol.arcos.map(a => ({
  type: 'Feature' as const,
  properties: { color: a.color, norte: a.por_el_norte, clave: a.clave },
  geometry: { type: 'Point' as const, coordinates: a.mediodia.p },
})));

/**
 * El horizonte de la proyección: la circunferencia donde la elevación es cero.
 *
 * No es un dato nuevo ni un adorno: es el borde que define la proyección
 * azimutal equidistante —centro = cénit, borde = horizonte— y sin él los tres
 * arcos flotan sobre el campo sin que se entienda contra qué. Sale del
 * `radio_m` y del centro que ya trae el JSON, con la misma cuenta que usa
 * `proyectar` en `arco_solar.ts` para elevación 0.
 */
const PUNTOS_HORIZONTE = 180;
export const GEO_HORIZONTE = coleccion([(() => {
  const cosLat = Math.cos(SV.lat * Math.PI / 180);
  const anillo: Par[] = [];
  for (let i = 0; i <= PUNTOS_HORIZONTE; i++) {
    const a = (i / PUNTOS_HORIZONTE) * 2 * Math.PI;
    anillo.push([
      SV.lng + (SV.sol.radio_m * Math.sin(a)) / (111_320 * cosLat),
      SV.lat + (SV.sol.radio_m * Math.cos(a)) / 111_320,
    ]);
  }
  return linea(anillo);
})()]);

/**
 * Los cuatro cardinales sobre el horizonte, como puntos y sin letras.
 *
 * `calcularArcoSolar` los devuelve en `brujula` y son los que orientan los dos
 * actos del cielo. Van como marcas y no como texto: una pieza de este
 * repertorio no lleva nada quemado, y con el norte arriba del encuadre la
 * dirección se lee de la geometría.
 */
export const GEO_BRUJULA = coleccion(
  (['N', 'E', 'S', 'O'] as const).map(k => ({
    type: 'Feature' as const,
    properties: { rumbo: k, cardinal: k === 'N' },
    geometry: { type: 'Point' as const, coordinates: SV.sol.brujula[k] },
  })),
);

// ─── 02 · Las horas ─────────────────────────────────────────────────────────

/**
 * Los dos mapas de horas de sol, ya en rectángulos juntados por fila.
 *
 * Los dos están normalizados contra el MISMO techo —el máximo del día largo—,
 * que es lo que hace que la comparación signifique algo: con cada día
 * normalizado contra el suyo, los dos mapas recorrerían la rampa entera y el
 * invierno se vería igual de soleado que el verano.
 */
export const GEO_HORAS = Object.fromEntries(
  SV.insolacion.dias.map(d => [d.cual, d.rects]),
) as Record<'verano' | 'invierno', RectsDeHoras>;

/** Los dos días, en el orden en que se muestran: primero el largo. */
export const DIAS_HORAS = SV.insolacion.dias;

// ─── 03 · El viento ─────────────────────────────────────────────────────────

/**
 * Los doce sectores del viento, cada uno con su mes.
 *
 * Van los doce en una sola fuente y se dibujan dos veces: una capa tenue que
 * los muestra todos —la envolvente, o sea todo el cuadrante por el que el
 * viento entra en el año— y una capa brillante filtrada al mes en curso. Así se
 * ve a la vez el movimiento mes a mes y el hecho que el promedio anual tapa:
 * acá el viento entra entre 37° y 82° los doce meses y del norte no sopla
 * nunca, que es donde la cortina por defecto de la app la habría puesto.
 */
export const GEO_SECTORES = coleccion(SV.viento.meses.map(m => poligono(m.sector, {
  i: m.i, dir: m.dir, deg: m.dir_deg, vel: m.vel_ms,
})));

export const MESES_VIENTO = SV.viento.meses;

/**
 * El rumbo exacto de cada mes, como radio del centro al horizonte.
 *
 * Existe porque sin él la rotación no se ve, y no verse sería mentir por
 * omisión. El sector de la app tiene 70° de amplitud y los doce meses de este
 * predio caben entre 37° y 82°: doce cuñas de 70° que se mueven 45° en total se
 * superponen casi del todo, así que el acto quedaría como una mancha quieta
 * —justo lo contrario de lo que el encargo pide mostrar—. El radio, en cambio,
 * es el dato crudo: `viento_dir_deg` del mes, sin amplitud y sin promedio. Doce
 * radios tenues son las doce mediciones, y el encendido va de enero a
 * diciembre.
 *
 * La cuña sigue estando: es la que dibuja la app. Lo que se agrega es la línea
 * que dice dónde cae su centro.
 */
export const GEO_RUMBOS = coleccion(SV.viento.meses.map(m => {
  const cosLat = Math.cos(SV.lat * Math.PI / 180);
  const a = m.dir_deg * Math.PI / 180;
  return linea([
    [SV.lng, SV.lat],
    [
      SV.lng + (SV.sol.radio_m * Math.sin(a)) / (111_320 * cosLat),
      SV.lat + (SV.sol.radio_m * Math.cos(a)) / 111_320,
    ],
  ], { i: m.i, deg: m.dir_deg, dir: m.dir });
}));

/** La banda de plantación: la cortina como franja de ancho medido, no como línea. */
export const GEO_CORTINA_BANDA = coleccion([poligono(SV.viento.cortina.banda)]);

/** La zona a sotavento: `alto × 15`, que son 150 m y 36,26 ha en este predio. */
export const GEO_CORTINA_ZONA = coleccion([poligono(SV.viento.cortina.zona)]);

/** El eje, con `lineMetrics` para poder trazarlo de punta a punta. */
export const GEO_CORTINA_EJE = coleccion([linea(SV.viento.cortina.eje)]);
