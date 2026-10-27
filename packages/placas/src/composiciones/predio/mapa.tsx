/**
 * El mapa que comparten las tres piezas del encargo 02.
 *
 * Es el mismo predio, el mismo estilo y el mismo encuadre a sangre en todas, y
 * la única diferencia entre una pieza y otra es qué capa se enciende en qué
 * cuadro. Eso vive acá por una razón práctica: las trampas de renderizar
 * MapLibre dentro de Remotion —las cuatro de abajo— costaron medio día de
 * encontrar y no pueden estar copiadas en cinco composiciones, porque el día
 * que una se arregle las otras cuatro se quedan rotas.
 *
 * ── Las cuatro trampas ──────────────────────────────────────────────────────
 * 1. `idle` avisa cuando el mapa PASA a estar quieto. Si ya estaba quieto —que
 *    es lo normal cuando el cuadro siguiente mira casi lo mismo que el
 *    anterior— el evento no llega nunca y el render se cuelga en ese cuadro
 *    hasta que vence el tiempo. Se pregunta cada 50 ms.
 * 2. MapLibre mide el contenedor UNA vez, cuando se crea, y en el render se
 *    crea antes de que el layout se asiente: se queda con un alto que no es el
 *    del cuadro. El síntoma es el predio pegado al borde de arriba y tres
 *    cuartos de cuadro negro, y SOLO en el render —en el estudio se ve bien—.
 *    Por eso `resize()` antes de cada `jumpTo`.
 * 3. El estado de React no sirve como condición: en el estudio el componente se
 *    vuelve a montar con cada recarga en caliente, el mapa se destruye y se
 *    crea de nuevo mientras el estado todavía dice que está listo, y el efecto
 *    le habla a un mapa cuyo estilo no cargó («Style is not done loading»). La
 *    condición se le pregunta al mapa.
 * 4. Un color `undefined` en el estilo hace que MapLibre rechace el estilo
 *    ENTERO y `load` no llegue nunca: un cuadro negro sin un solo error en la
 *    consola. De ahí el `map.on('error')`.
 */
import { useEffect, useRef, useState } from 'react';
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { COLORES } from '../../marca';
import {
  CENTRO, ESTE, NORTE, OESTE, SUR,
  GEO_AGUA, GEO_APTITUD, GEO_CURVAS, GEO_ESPEJO, GEO_JUNTURAS,
  GEO_KEYLINE, GEO_PREDIO, GEO_RELIEVE, GEO_REPRESAS, GEO_ZANJAS,
} from './datos';

/**
 * **El otro lado de la ladera.** 165° es el espejo exacto de los −15° de la
 * primera entrega, y no es una preferencia: es lo que dice el relieve de este
 * predio.
 *
 * Medido sobre los 536 nodos de cadena y los 28.157 nodos de grilla que caen
 * dentro del polígono, partiendo el predio por la mitad perpendicular a la
 * mirada:
 *
 *   rumbo   cadena cerca / lejos   cota del fondo − cota del frente
 *    −15        155 / 381                     −52 m
 *    165        381 / 155                     +52 m
 *
 * O sea que desde −15° se miraba ladera abajo: el agua corría ALEJÁNDOSE de la
 * cámara y el fondo del cuadro era la planicie, 52 m más baja que el primer
 * plano, así que no había horizonte que mirar. Desde 165° el predio se ve de
 * frente, las cadenas bajan HACIA la cámara —dos tercios de la red quedan en la
 * mitad cercana— y el cordón de 300 a 442 m queda de fondo, recortado contra el
 * cielo. Es lo que el pedido llama «más cuencas y más paisaje».
 *
 * Se probaron 180°, 195° y 225°: suben el fondo hasta 78 m pero pierden cadena
 * cercana (321 contra 381). 165° es el mejor de los dos criterios a la vez, y
 * de paso es el espejo exacto de la pose anterior.
 *
 * **Consecuencia que hay que decir: el póster publicado de la portada deja de
 * servir.** La pose ya no es la de la primera animación, así que el `poster` de
 * la página tiene que cambiar por el nuevo, que esta misma corrida escribe.
 */
export const RUMBO = 165;

/**
 * El rumbo con que se calcula la holgura del encuadre: cuánto ocupa la sombra
 * girada del rectángulo del predio.
 *
 * 15° para las piezas de cámara quieta —el predio entra con su diagonal chica—
 * y 45° para las que dan la vuelta entera, que es el peor caso posible: a 45°
 * el rectángulo ocupa lo máximo en los dos ejes. La diferencia entre los dos es
 * de 0,18 niveles de zoom, así que la pieza que gira no se ve «más lejos»: se
 * ve igual y no se le cortan las puntas a mitad de vuelta.
 */
const SOMBRA_QUIETA = 15;
export const SOMBRA_GIRO = 45;
/** Aire proporcional alrededor del predio cuando se lo encuadra entero. */
const AIRE = 0.0365;

/**
 * La exageración vertical del relieve. 1,4 es la que usa la vista 3D de la app.
 * Está fija y encendida desde el cuadro 0 en las tres piezas: ya no hay un acto
 * cenital del que entrar, así que `setTerrain` se llama una vez y nunca más
 * —rehace la malla entera y llamarlo por cuadro triplicaba el render—.
 */
export const EXAGERACION = 1.4;

/** Reloj de pared que se le da al mapa para terminar de cargar antes del primer
 *  cuadro. Cuatro segundos una vez por render. */
const CALENTAMIENTO_MS = 4000;

/** Lo mismo, por cuadro: ver el comentario largo en el efecto de abajo. */
const REPOSO_MS = 250;

export interface Camara {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * El zoom que mete el predio entero en el cuadro, con aire a los costados.
 *
 * Se calcula y no se le pregunta al mapa: `cameraForBounds` devuelve
 * `undefined` si se lo llama antes de que el mapa tenga tamaño útil —que es
 * justo cuando lo necesita el primer cuadro— y un valor de respaldo que se cuele
 * ahí queda fijo para todos los cuadros sin que nada avise.
 *
 * La cuenta es la del esquema de teselas: el mundo son 512 × 2^zoom píxeles para
 * 360° de longitud. La latitud va dividida por el coseno porque en Mercator un
 * grado de latitud ocupa más píxeles que uno de longitud. Y lo que tiene que
 * caber no es el rectángulo sino su sombra girada: un rectángulo a 23° ocupa más
 * ancho y más alto que el original, y sin eso el giro le corta las puntas.
 */
export function zoomQueEncuadra(ancho: number, alto: number, sombra = SOMBRA_QUIETA): number {
  const latMedia = ((SUR + NORTE) / 2) * Math.PI / 180;
  const anchoDeg = ESTE - OESTE;
  const altoDeg = (NORTE - SUR) / Math.cos(latMedia);
  const cos = Math.abs(Math.cos(sombra * Math.PI / 180));
  const sen = Math.abs(Math.sin(sombra * Math.PI / 180));
  const padding = ancho * AIRE;
  const zx = Math.log2(((ancho - 2 * padding) * 360) / (512 * (anchoDeg * cos + altoDeg * sen)));
  const zy = Math.log2(((alto - 2 * padding) * 360) / (512 * (altoDeg * cos + anchoDeg * sen)));
  return Math.min(zx, zy);
}

/**
 * **La vista a sangre**, que es la que funciona y de la que la cámara no sale.
 *
 * Es la pose que Jonatan aprobó sin reservas —«vista a sangre, la ortofoto
 * llenando el cuadro, el polígono con sus curvas y sus líneas de agua,
 * perspectiva»— con el rumbo dado vuelta: mismo encuadre, mismo aire, misma
 * inclinación, del otro lado de la ladera. Ver `RUMBO`.
 *
 * El `+1` de zoom sobre el encuadre con aire es lo que la lleva de «el predio
 * con margen» a «el predio llenando el cuadro». Ahí está el arreglo del segundo
 * defecto: antes la pieza arrancaba con un bloque chico flotando en negro y
 * terminaba acá, así que el salto del segundo 8 no era de cámara, era de un
 * bloque a un paisaje.
 */
export interface OpcionesVista {
  /** Hacia dónde mira la cámara. Por defecto, el otro lado de la ladera. */
  rumbo?: number;
  /** Qué holgura se le deja al encuadre: `SOMBRA_GIRO` si la pieza gira. */
  sombra?: number;
  /** Niveles de zoom sobre el encuadre con aire. 1,0 es la vista a sangre. */
  acercar?: number;
  /**
   * La inclinación de la cámara. 61 es la de la pose aprobada, que es un
   * paisaje; una pieza que tiene que dejar LEER capas superpuestas quiere menos
   * —con 61 grados la mitad lejana del predio se comprime contra el horizonte y
   * una represa de 6,7 ha queda del tamaño de un sello—.
   */
  inclinacion?: number;
}

/**
 * Cuánto se corre el blanco de la cámara HACIA la cámara, en metros.
 *
 * Con la cámara inclinada 61°, el punto que se le pide a `jumpTo` cae en la
 * mitad de abajo del cuadro, no en el centro. Los 351 m son los que tenía la
 * pose aprobada —medidos sobre su desplazamiento, que era de 106 m al este y
 * 334 m al sur— y suben el predio a la mitad del encuadre.
 *
 * Va expresado como «hacia la cámara» y no como un par de grados fijos por una
 * razón concreta: en las piezas que dan la vuelta entera, un desplazamiento
 * fijo en grados gira con la vista y el predio cabecea dentro del cuadro. Atado
 * al rumbo, el encuadre se queda igual toda la vuelta.
 */
const BLANCO_HACIA_LA_CAMARA_M = 351;

export function vistaASangre(
  ancho: number, alto: number,
  { rumbo = RUMBO, sombra = SOMBRA_QUIETA, acercar = 1.0, inclinacion = 61 }: OpcionesVista = {},
): Camara {
  const a = ((rumbo + 180) * Math.PI) / 180;
  const latMedia = ((SUR + NORTE) / 2) * Math.PI / 180;
  return {
    center: [
      CENTRO[0] + (BLANCO_HACIA_LA_CAMARA_M * Math.sin(a)) / (111_320 * Math.cos(latMedia)),
      CENTRO[1] + (BLANCO_HACIA_LA_CAMARA_M * Math.cos(a)) / 111_320,
    ],
    zoom: zoomQueEncuadra(ancho, alto, sombra) + acercar,
    pitch: inclinacion,
    bearing: rumbo,
  };
}

/**
 * Espera a que el mapa no tenga nada más que cargar ni dibujar.
 *
 * El tope de 20 s es para que un cuadro con una tesela que no baja no se lleve
 * puesto el render entero: un cuadro imperfecto se ve, un render que no termina
 * no se ve nunca.
 */
function cuandoEsteQuieto(
  map: maplibregl.Map,
  seguir: () => void,
  listo: () => boolean = () => Boolean(map.areTilesLoaded() && map.isStyleLoaded()),
  desde = Date.now(),
) {
  if (listo() || Date.now() - desde > 20_000) { seguir(); return; }
  setTimeout(() => cuandoEsteQuieto(map, seguir, listo, desde), 50);
}

/**
 * Un degradado sobre el largo de la línea que la dibuja «de a poco».
 *
 * Es la forma de MapLibre de dibujar una línea que crece: la fuente lleva
 * `lineMetrics: true`, y el degradado va de visible a transparente en el punto
 * `avance`. Mover ese punto de 0 a 1 es la línea dibujándose. Lo otro —ir
 * agregando vértices a la geometría cuadro por cuadro— obliga a reescribir la
 * fuente 390 veces y se nota en el render.
 *
 * El `avance` se acota a [0,001 · 0,999]: en 0 y en 1 los dos topes del
 * degradado colapsan en el mismo valor, MapLibre rechaza la expresión entera
 * —«input values must be in strictly ascending order»— y la línea no aparece
 * nunca. Ese error se lo come la consola y cuesta una tarde.
 */
export function degradadoDeAvance(avance: number, color: string) {
  if (avance >= 0.985) return degradado([[0, color], [1, color]]);
  const p = Math.max(0.001, avance);
  return degradado([
    [0, color],
    [p, color],
    [p + 0.012, 'rgba(0,0,0,0)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
}

const TRANSPARENTE = 'rgba(0,0,0,0)';

/**
 * Un degradado de `line-progress` con los topes **forzados a ser estrictamente
 * crecientes**.
 *
 * Esto es el arreglo de raíz de un error que ya costó dos tardes y que aparece
 * cada vez que se escribe un degradado animado a mano: si dos topes caen en el
 * mismo valor —y caen, en los extremos de cualquier animación—, MapLibre
 * rechaza la expresión ENTERA con «input values must be in strictly ascending
 * order», la capa se queda para siempre con el último degradado válido, y el
 * error va a la consola del mapa, que en un render headless no mira nadie. El
 * síntoma es una línea a la que le falta el último tramo, o un efecto que se
 * congela a mitad de camino.
 *
 * Empujar cada tope un diezmilésimo por encima del anterior es invisible —la
 * línea más larga del predio mide 590 m, así que 1e−4 son 6 cm— y hace que la
 * condición no se pueda violar.
 */
export function degradado(paradas: Array<[number, string]>) {
  const topes: Array<number | string> = [];
  let ultimo = -Infinity;
  for (const [t, color] of paradas) {
    const v = Math.max(ultimo + 1e-4, t);
    topes.push(v, color);
    ultimo = v;
  }
  return ['interpolate', ['linear'], ['line-progress'], ...topes];
}

/**
 * La corriente: una banda clara que baja por cada cadena.
 *
 * `pulso` va de −ancho a 1+ancho, así que la banda **entra por la cabecera y
 * sale por la desembocadura** en vez de aparecer y desaparecer de golpe; los
 * topes fuera de [0,1] son legales porque `interpolate` acota en los extremos.
 * Que esto se vea como agua bajando y no como agua subiendo depende de que las
 * cadenas estén encadenadas cuesta abajo, que está comprobado sobre el dato
 * —ver `GEO_AGUA`—.
 *
 * `hasta` es el avance del dibujo: después de ese punto la línea todavía no
 * existe, así que la banda no puede ir más allá.
 */
export function corriente(
  pulso: number, base: string, brillo: string, ancho = 0.14, hasta = 1,
) {
  // La banda nunca pasa el frente del dibujo: si lo pasara, el empujón que
  // fuerza los topes crecientes correría el frente hacia adelante y la línea
  // se dibujaría sola un 14 % de más.
  const p = Math.min(pulso, hasta - ancho);
  const paradas: Array<[number, string]> = [
    [p - ancho, base],
    [p - ancho * 0.35, brillo],
    [p + ancho * 0.35, brillo],
    [p + ancho, base],
  ];
  if (hasta < 0.985) {
    paradas.push([Math.max(0.001, hasta), base], [hasta + 0.012, TRANSPARENTE], [1, TRANSPARENTE]);
  }
  return degradado(paradas);
}

/**
 * Una capa que una pieza agrega al estilo compartido, con dónde va.
 *
 * El orden importa y no es decorativo: el shader de elevaciones vive ENTRE
 * la ortofoto y el sombreado para que la misma luz que le da volumen al
 * monte se lo dé a la rampa. Una capa que se agregue al final queda arriba
 * de todo, que casi nunca es lo que se quiere.
 */
export interface CapaExtra {
  capa: maplibregl.LayerSpecification;
  /** Id de la capa del estilo base ANTES de la cual se inserta. */
  antes?: string;
}

/**
 * Inserta las capas de la pieza en el estilo base, cada una donde pide.
 *
 * Una capa cuyo `antes` no existe se agrega al final en vez de perderse, y
 * se avisa: una capa que desaparece sin un error es un cuadro negro sin
 * explicación, que es el defecto más caro de encontrar de toda esta carpeta.
 */
function conExtras(
  base: maplibregl.LayerSpecification[],
  extras?: CapaExtra[],
): maplibregl.LayerSpecification[] {
  if (!extras || extras.length === 0) return base;
  const salida = [...base];
  for (const { capa, antes } of extras) {
    const i = antes ? salida.findIndex(l => l.id === antes) : -1;
    if (antes && i < 0) console.log(`[mapa] la capa «${capa.id}» pedía ir antes de «${antes}», que no existe: va al final`);
    if (i >= 0) salida.splice(i, 0, capa); else salida.push(capa);
  }
  return salida;
}

export interface OpcionesMapa {
  /** La cámara de este cuadro. */
  camara: (frame: number, ancho: number, alto: number) => Camara;
  /** Qué capa se ve en este cuadro. Se llama con el estilo ya cargado. */
  pintar: (map: maplibregl.Map, frame: number) => void;
  /** Identificador para los mensajes de `delayRender`. */
  nombre: string;
  /**
   * Fuentes y capas que esta pieza agrega al estilo compartido.
   *
   * Van por acá y no escritas en el estilo base por una razón concreta: las
   * diez piezas del encargo 02 están aprobadas, y meterles siete fuentes y
   * once capas que no usan les cambia el estilo —aunque todas arranquen en
   * opacidad cero—. Lo que una pieza no necesita, no se le monta.
   */
  fuentes?: Record<string, maplibregl.SourceSpecification>;
  capas?: CapaExtra[];
}

/**
 * Monta el mapa, lo mueve y lo pinta cuadro por cuadro, y devuelve el `ref` del
 * contenedor para que la composición lo ponga donde quiera.
 */
export function usarMapaDelPredio({ camara, pintar, nombre, fuentes, capas }: OpcionesMapa) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const contRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [listo, setListo] = useState(false);
  const [handleInicial] = useState(
    () => delayRender(`${nombre}: montando el mapa`, { timeoutInMilliseconds: 120_000 }),
  );

  useEffect(() => {
    if (!contRef.current) return;
    const inicial = camara(0, width, height);
    const map = new maplibregl.Map({
      container: contRef.current,
      interactive: false,
      attributionControl: false,
      // Sin esto MapLibre funde las teselas durante 300 ms y, cuadro a cuadro,
      // eso se ve como un parpadeo que nadie pidió.
      fadeDuration: 0,
      style: {
        version: 8,
        sources: {
          sat: {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            // Pasado este nivel Esri devuelve la tesela «Map data not yet
            // available»; con `maxzoom` MapLibre reescala la última real.
            maxzoom: 17,
          },
          // El mismo bucket que proxea /api/terrarium: dato público de AWS Open
          // Data, se lee sin clave. Levanta el terreno Y da el sombreado, así
          // que el volumen y la foto no se pueden desfasar entre sí.
          dem: {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            encoding: 'terrarium',
            maxzoom: 14,
          },
          // La MISMA fuente no puede servir al terreno y al sombreado a la vez:
          // MapLibre avisa que la calidad baja, porque el terreno consume las
          // teselas con un esquema de bordes distinto al que necesita el
          // sombreado. Son dos fuentes al mismo bucket.
          relieve: {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            encoding: 'terrarium',
            maxzoom: 14,
          },
          // `lineMetrics` habilita `line-progress`, que es lo que permite
          // DIBUJAR cada curva a lo largo de su propio recorrido en vez de
          // encenderla entera. Las piezas del encargo 02 no lo usan y su
          // dibujo no cambia: la bandera sólo agrega el cálculo de la
          // métrica, no toca la geometría ni la pintura.
          curvas:   { type: 'geojson', data: GEO_CURVAS, lineMetrics: true },
          // `lineMetrics` es lo que habilita el degradado por avance: sin esto
          // `line-progress` no existe y la corriente no se puede dibujar.
          agua:     { type: 'geojson', data: GEO_AGUA, lineMetrics: true },
          relieve_color: { type: 'geojson', data: GEO_RELIEVE },
          represas: { type: 'geojson', data: GEO_REPRESAS },
          junturas: { type: 'geojson', data: GEO_JUNTURAS },
          aptitud:  { type: 'geojson', data: GEO_APTITUD },
          espejo:   { type: 'geojson', data: GEO_ESPEJO },
          keyline:  { type: 'geojson', data: GEO_KEYLINE },
          zanjas:   { type: 'geojson', data: GEO_ZANJAS },
          predio:   { type: 'geojson', data: GEO_PREDIO, lineMetrics: true },
          ...(fuentes ?? {}),
        },
        layers: conExtras([
          { id: 'fondo', type: 'background', paint: { 'background-color': COLORES.tinta } },
          { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-opacity': 1 } },
          {
            // El shader de elevaciones va ENTRE la ortofoto y el sombreado, y
            // ese orden es la mitad del resultado: así la misma luz que le da
            // volumen al monte le da volumen a la rampa, y el predio no queda
            // como una calcomanía plana pegada sobre un paisaje con relieve.
            //
            // `fill-antialias: false` porque son 21.202 rectángulos que se
            // tocan: con el antialias prendido, cada borde interno dibuja una
            // línea semitransparente y el shader entero sale cruzado por una
            // grilla.
            id: 'elevacion', type: 'fill', source: 'relieve_color',
            paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0, 'fill-antialias': false },
          },
          {
            // El sombreado SOLO OSCURECE. Centrarlo y dejar que aclarara —que es
            // lo primero que uno escribe— quema el verde del monte: la ortofoto
            // ya trae su propia luz, y multiplicarla no es relieve, es
            // sobreexposición.
            id: 'sombra', type: 'hillshade', source: 'relieve',
            paint: {
              'hillshade-exaggeration': 0.45,
              'hillshade-shadow-color': '#06110f',
              'hillshade-highlight-color': 'rgba(255,255,255,0)',
              'hillshade-accent-color': 'rgba(0,0,0,0)',
              'hillshade-illumination-direction': 315,
            },
          },
          {
            id: 'aptitud', type: 'fill', source: 'aptitud',
            paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0 },
          },
          {
            id: 'espejo', type: 'fill', source: 'espejo',
            paint: { 'fill-color': '#2E6B8A', 'fill-opacity': 0 },
          },
          {
            id: 'espejo-borde', type: 'line', source: 'espejo',
            paint: { 'line-color': '#7CC2E3', 'line-opacity': 0, 'line-width': 2.4 },
          },
          {
            id: 'zanjas', type: 'line', source: 'zanjas',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': COLORES.crema, 'line-opacity': 0, 'line-width': 2.6 },
          },
          {
            id: 'keyline', type: 'line', source: 'keyline',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#F2C14E',
              'line-opacity': 0,
              'line-width': ['case', ['get', 'principal'], 4.2, 2.6],
            },
          },
          {
            id: 'curvas', type: 'line', source: 'curvas',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': COLORES.crema,
              'line-opacity': 0,
              'line-width': ['case', ['get', 'maestra'], 2.4, 1.4],
            },
          },
          {
            // El halo: la misma geometría, más ancha, muy desenfocada y por
            // debajo. Es lo que hace que el agua se vea ENCENDIDA sobre el
            // verde del monte en vez de dibujada encima. Va en una capa aparte
            // y no como `line-blur` de la de arriba porque una sola línea no
            // puede estar nítida y difusa a la vez.
            id: 'agua-halo', type: 'line', source: 'agua',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#7CC2E3',
              'line-opacity': 0,
              'line-width': ['interpolate', ['linear'], ['get', 'orden'], 0, 9, 1, 22],
              'line-blur': 9,
            },
          },
          {
            id: 'agua', type: 'line', source: 'agua',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              // Un aclarado del azul agua, no el azul agua: sobre el verde del
              // monte, #2E6B8A lee como una línea negra y el acto pide que el
              // agua se ENCIENDA.
              'line-color': '#7CC2E3',
              'line-opacity': 0,
              // Los anchos salen de un criterio y no del gusto: la pieza se
              // tiene que leer a 375 px de ancho, que sobre 1280 es escalar a
              // 0,29. Una línea de 1,6 px queda en medio píxel y desaparece.
              'line-width': ['interpolate', ['linear'], ['get', 'orden'], 0, 3.5, 1, 9],
              'line-blur': 0.8,
            },
          },
          {
            // El pulso del cierre: un anillo que sale del sitio de represa y se
            // apaga al crecer. Marca DÓNDE está el cierre, que es el dato —el
            // vaso ya lo dibuja el espejo—, y no inventa ninguna interfaz: es
            // un anillo sobre el terreno, no un control.
            id: 'pulso-represa', type: 'circle', source: 'represas',
            paint: {
              'circle-radius': 1,
              'circle-color': 'rgba(0,0,0,0)',
              'circle-stroke-color': '#D8F1FF',
              'circle-stroke-width': 2.5,
              'circle-opacity': 0,
              'circle-stroke-opacity': 0,
            },
          },
          {
            id: 'junturas', type: 'circle', source: 'junturas',
            paint: {
              'circle-radius': 5,
              'circle-color': 'rgba(0,0,0,0)',
              'circle-stroke-color': '#7CC2E3',
              'circle-stroke-width': 2,
              'circle-opacity': 0,
              'circle-stroke-opacity': 0,
            },
          },
          {
            id: 'predio', type: 'line', source: 'predio',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': COLORES.crema, 'line-opacity': 0, 'line-width': 3.4 },
          },
        ], capas),
        sky: {
          'sky-color': '#0f1418',
          'horizon-color': '#1A1210',
          'fog-color': '#1A1210',
          'sky-horizon-blend': 0.7,
        } as unknown as maplibregl.SkySpecification,
      },
      center: inicial.center,
      zoom: inicial.zoom,
      pitch: inicial.pitch,
      bearing: inicial.bearing,
      maxPitch: 82,
    });
    mapRef.current = map;
    // Para poder preguntarle al mapa desde la consola del estudio. En el render
    // headless no molesta y es lo único que hace depurable un cuadro negro.
    (window as unknown as { __predio?: maplibregl.Map }).__predio = map;
    map.on('error', e => console.log(`[${nombre}] maplibre:`, e.error?.message ?? e));
    map.on('load', () => {
      map.setTerrain({ source: 'dem', exaggeration: EXAGERACION });

      // ── El calentamiento, que es lo único que arregla el primer cuadro ────
      //
      // Remotion renderiza los cuadros en orden en UNA sola pestaña, así que
      // el cuadro 0 se captura con el mapa recién nacido. Medido en el lazo
      // del perímetro —cámara fija, mismas capas en las dos puntas, así que
      // tendrían que ser idénticas—: el cuadro 0 estaba a 18,9 de diferencia
      // media de luminancia del 179, y del 1 en adelante a 3,3. O sea dos
      // cosas distintas: el cuadro 0 sale con el terreno casi plano, y los
      // demás siguen afinándose durante todo el bucle a medida que llegan
      // teselas de más detalle.
      //
      // `areTilesLoaded()` no alcanza para esto: contesta por lo que el mapa
      // YA pidió, y el terreno no pide nada hasta que hay una pasada de dibujo
      // con la cámara puesta. Por eso acá se mueve la cámara a su sitio, se
      // espera, y recién entonces se le dan unos segundos de reloj para que
      // termine de llegar lo que se pidió en esa pasada. Cuesta cuatro
      // segundos UNA vez por render; el tirón del principio costaba un salto
      // cada seis segundos en los lazos.
      map.resize();
      map.jumpTo(camara(0, width, height));
      cuandoEsteQuieto(map, () => {
        setTimeout(() => {
          map.triggerRepaint();
          cuandoEsteQuieto(map, () => {
            setListo(true);
            continueRender(handleInicial);
          });
        }, CALENTAMIENTO_MS);
      });
    });

    return () => { map.remove(); mapRef.current = null; };
    // Se monta una sola vez a propósito: el mapa es caro y el cuadro lo mueve el
    // efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handle = delayRender(`${nombre}: cuadro ${frame}`, { timeoutInMilliseconds: 120_000 });
    let cerrado = false;
    const soltar = () => { if (!cerrado) { cerrado = true; continueRender(handle); } };

    const aplicar = () => {
      if (cerrado || !map.getLayer('predio')) { soltar(); return; }
      pintar(map, frame);
      map.resize();
      map.jumpTo(camara(frame, width, height));
      // Se espera DOS veces, con un repintado en el medio, y no es por las
      // dudas.
      //
      // `areTilesLoaded()` responde por lo que el mapa ya pidió, y el terreno
      // no pide sus teselas hasta que hay una pasada de dibujo con la cámara
      // puesta. En la primera espera contesta que sí teniendo pendiente todo el
      // relieve, así que el cuadro sale con el terreno plano. Medido en el lazo
      // del perímetro: el cuadro 0 y el 179 son la misma cámara y las mismas
      // capas, y daban 18,9 de diferencia media de luminancia —el cuadro 0 se
      // veía claramente más plano—. En un bucle eso es un salto cada seis
      // segundos; en las otras piezas es un tirón al empezar.
      cuandoEsteQuieto(map, () => {
        map.triggerRepaint();
        // El cuarto de segundo es el mismo remedio que el calentamiento del
        // primer cuadro, en chico: `areTilesLoaded()` contesta por lo que el
        // mapa YA PIDIÓ, y lo que la pasada de dibujo acaba de descubrir que
        // falta todavía no está pedido. Sin esta pausa la segunda espera
        // contesta que sí antes de que el pedido exista, y el cuadro sale con
        // el fondo lejano sin teselas: un recorte oscuro de bordes rectos
        // arriba del cuadro. Son cuatro minutos sobre una entrega de 1.650
        // cuadros.
        setTimeout(() => {
          cuandoEsteQuieto(map, () => requestAnimationFrame(() => requestAnimationFrame(soltar)));
        }, REPOSO_MS);
      });
    };

    cuandoEsteQuieto(
      map, aplicar,
      () => Boolean(map.isStyleLoaded()) && map.getLayer('predio') != null,
    );

    return soltar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, listo, width, height]);

  return { contRef, width, height, frame };
}
