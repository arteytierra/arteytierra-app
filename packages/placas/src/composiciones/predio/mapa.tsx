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
  GEO_AGUA, GEO_APTITUD, GEO_CAUCE, GEO_CURVAS, GEO_ESPEJO, GEO_JUNTURAS,
  GEO_KEYLINE, GEO_PREDIO, GEO_ZANJAS,
} from './datos';

/**
 * El rumbo con que se calcula el encuadre. Son los 15° de la primera animación
 * y NO los 23° que llega a girar el lazo del relieve, a propósito: este número
 * fija la pose a sangre, y moverlo aunque sea un poco la corre respecto del
 * último cuadro que ya está publicado como póster. El lazo no necesita el
 * margen extra porque en la vista a sangre el predio ya llena el cuadro y lo
 * que gira entra y sale por los bordes, que es lo que tiene que pasar.
 */
const RUMBO_MAX = 15;
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
export function zoomQueEncuadra(ancho: number, alto: number): number {
  const latMedia = ((SUR + NORTE) / 2) * Math.PI / 180;
  const anchoDeg = ESTE - OESTE;
  const altoDeg = (NORTE - SUR) / Math.cos(latMedia);
  const cos = Math.abs(Math.cos(RUMBO_MAX * Math.PI / 180));
  const sen = Math.abs(Math.sin(RUMBO_MAX * Math.PI / 180));
  const padding = ancho * AIRE;
  const zx = Math.log2(((ancho - 2 * padding) * 360) / (512 * (anchoDeg * cos + altoDeg * sen)));
  const zy = Math.log2(((alto - 2 * padding) * 360) / (512 * (altoDeg * cos + anchoDeg * sen)));
  return Math.min(zx, zy);
}

/**
 * **La vista a sangre**, que es la que funciona y de la que la cámara no sale.
 *
 * Es la pose exacta del último cuadro de la primera animación: la única parte
 * que Jonatan aprobó sin reservas —«vista a sangre, la ortofoto llenando el
 * cuadro, el polígono con sus curvas y sus líneas de agua, perspectiva»—. Que
 * el último cuadro de la pieza nueva caiga en esta misma pose no es comodidad:
 * es lo que hace que el póster que ya está publicado siga sirviendo.
 *
 * El `+1` de zoom sobre el encuadre con aire es lo que la lleva de «el predio
 * con margen» a «el predio llenando el cuadro». Ahí está el arreglo del segundo
 * defecto: antes la pieza arrancaba con un bloque chico flotando en negro y
 * terminaba acá, así que el salto del segundo 8 no era de cámara, era de un
 * bloque a un paisaje.
 */
export function vistaASangre(ancho: number, alto: number): Camara {
  return {
    center: [CENTRO[0] + 0.0010, CENTRO[1] - 0.0030],
    zoom: zoomQueEncuadra(ancho, alto) + 1.0,
    pitch: 61,
    bearing: -15,
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
  // Terminado: la línea entera, de un color. Hay que devolver esto y no un
  // degradado con el corte pegado al final, porque los topes tienen que quedar
  // ESTRICTAMENTE crecientes: con el corte en 0,999 y el borde también en
  // 0,999, MapLibre rechaza la expresión entera, la capa se queda con el último
  // degradado válido —el de 0,98— y al perímetro le falta para siempre el
  // último tramo. El error va a la consola del mapa, que en un render headless
  // no mira nadie.
  if (avance >= 0.985) {
    return ['interpolate', ['linear'], ['line-progress'], 0, color, 1, color];
  }
  const p = Math.max(0.001, avance);
  return [
    'interpolate', ['linear'], ['line-progress'],
    0, color,
    p, color,
    p + 0.012, 'rgba(0,0,0,0)',
    1, 'rgba(0,0,0,0)',
  ];
}

export interface OpcionesMapa {
  /** La cámara de este cuadro. */
  camara: (frame: number, ancho: number, alto: number) => Camara;
  /** Qué capa se ve en este cuadro. Se llama con el estilo ya cargado. */
  pintar: (map: maplibregl.Map, frame: number) => void;
  /** Identificador para los mensajes de `delayRender`. */
  nombre: string;
}

/**
 * Monta el mapa, lo mueve y lo pinta cuadro por cuadro, y devuelve el `ref` del
 * contenedor para que la composición lo ponga donde quiera.
 */
export function usarMapaDelPredio({ camara, pintar, nombre }: OpcionesMapa) {
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
          curvas:   { type: 'geojson', data: GEO_CURVAS },
          agua:     { type: 'geojson', data: GEO_AGUA },
          cauce:    { type: 'geojson', data: GEO_CAUCE, lineMetrics: true },
          junturas: { type: 'geojson', data: GEO_JUNTURAS },
          aptitud:  { type: 'geojson', data: GEO_APTITUD },
          espejo:   { type: 'geojson', data: GEO_ESPEJO },
          keyline:  { type: 'geojson', data: GEO_KEYLINE },
          zanjas:   { type: 'geojson', data: GEO_ZANJAS },
          predio:   { type: 'geojson', data: GEO_PREDIO, lineMetrics: true },
        },
        layers: [
          { id: 'fondo', type: 'background', paint: { 'background-color': COLORES.tinta } },
          { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-opacity': 1 } },
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
            id: 'cauce', type: 'line', source: 'cauce',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-opacity': 0, 'line-width': 8, 'line-blur': 0.8 },
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
        ],
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
        cuandoEsteQuieto(map, () => requestAnimationFrame(() => requestAnimationFrame(soltar)));
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
