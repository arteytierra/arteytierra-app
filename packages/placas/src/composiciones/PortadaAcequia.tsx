/**
 * La animación de la portada de acequia.app: cuatro actos sobre un predio real,
 * fundidos entre sí, que terminan y se quedan quietos.
 *
 *   01  el relieve aparece — el sombreado y el color por cota se revelan de la
 *       cota más baja a la más alta, en vista cenital, como se lee un plano
 *   01b las curvas de nivel se dibujan sobre el relieve. No es relleno para
 *       tapar un hueco: **el botón de Topografía de la app dice literalmente
 *       «enciende relieve + curvas»**, así que ése es el orden en que la
 *       aplicación las muestra, y entre el color y el agua había cuatro
 *       segundos en los que no pasaba nada
 *   02  el agua encuentra su camino — las líneas de acumulación se encienden
 *       desde los filos hacia los cauces
 *   03  el zoom — la cámara baja y se inclina, entra la ortofoto y el relieve
 *       se levanta
 *   04  el predio — vista 3D con la foto y las curvas de nivel sobre el
 *       paisaje. Se queda.
 *
 * NO ES UN LOOP. El último cuadro es el que más se va a ver —es el póster del
 * `<video>`— así que está compuesto para funcionar solo, como una foto.
 *
 * ── De dónde sale cada cosa ─────────────────────────────────────────────────
 * El relieve coloreado, el sombreado, las curvas y el agua salen de
 * `generado/cuetiepa.json`, que escribe `apps/terreno/scripts/datos-portada.ts`
 * llamando a las funciones del repo —`obtenerGrillaDEM`, `shaderDesdeGrilla`,
 * `calcularEscorrentias`, `calcularCurvas`, `colorElevacion`— sobre los siete
 * mojones del proyecto. La vista 3D es MapLibre con el mismo estilo que
 * `apps/terreno/components/Vista3D.tsx`: la ortofoto de Esri drapeada sobre un
 * `raster-dem` de teselas Terrarium.
 *
 * Se usa el motor de la app y no un rasterizador propio por la regla que manda
 * sobre todas las demás: lo que se muestra tiene que ser lo que la aplicación
 * hace de verdad, y un terreno *parecido* en una página que promete
 * trazabilidad es la única mentira que acá hace daño.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AbsoluteFill, Easing, continueRender, delayRender, interpolate,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { z } from 'zod';

import { COLORES } from '../marca';
import crudo from '../../generado/cuetiepa.json';

// ─────────────────────────────────────────────────────────────────────────────
// El dato
// ─────────────────────────────────────────────────────────────────────────────

interface DatosPortada {
  predio: string;
  fuente: string;
  atribucion: string;
  resolucion_m: number;
  bbox: [number, number, number, number];
  cols: number; rows: number;
  paso_m: number;
  elev_min: number; elev_max: number;
  mojones: Array<{ lat: number; lng: number }>;
  rampa: string[];
  /** row-major, fila 0 = sur. */
  elev: Array<number | null>;
  dentro: number[];
  intervalo_curvas_m: number;
  curvas: Array<{ cota: number; lineas: Array<{ cerrada: boolean; puntos: Array<[number, number]> }> }>;
  /** Ordenadas de menor a mayor acumulación. */
  cadenas: Array<{ acum: number; puntos: Array<[number, number]> }>;
  acum_max: number;
}

const D = crudo as unknown as DatosPortada;

export const esquemaPortada = z.object({
  /** Exageración vertical del relieve en los actos 03 y 04. 1,4 usa la app. */
  exageracion: z.number().default(1.4),
  /** Quemar la atribución del relieve y de la imagen. Se apaga sólo para pruebas. */
  atribucion: z.boolean().default(true),
});

// ─────────────────────────────────────────────────────────────────────────────
// Los cuatro actos, en cuadros a 30 fps
// ─────────────────────────────────────────────────────────────────────────────

const ACTO = {
  relieve: { desde:   0, hasta: 110 },   // 0,0 – 3,7 s
  curvas:  { desde: 108, hasta: 168 },   // 3,6 – 5,6 s
  agua:    { desde: 156, hasta: 252 },   // 5,2 – 8,4 s
  zoom:    { desde: 252, hasta: 330 },   // 8,4 – 11,0 s
  predio:  { desde: 330, hasta: 420 },   // 11,0 – 14,0 s
};
export const CUADROS_PORTADA = ACTO.predio.hasta;

/**
 * El cuadro en que el relieve coloreado termina de irse y, recién entonces,
 * empiezan la inclinación y el terreno 3D. **El orden no es estético: es la
 * única forma de que la pieza no mienta**, y la razón está abajo, en
 * `FUENTE_PLANA`.
 */
const RELEVO = 284;

/**
 * El movimiento es lento y continuo y nada rebota: la marca se llama acequia,
 * que es un canal de agua. `ease` entra y sale suave y no se pasa nunca de su
 * destino, que es lo que descarta cualquier curva elástica.
 */
const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

const [W, S, E, N] = D.bbox;
const CENTRO: [number, number] = [(W + E) / 2, (S + N) / 2];

/**
 * **La restricción que ordena toda la animación.**
 *
 * MapLibre dibuja una fuente `canvas` (y una `image`) como un cuadrilátero de
 * cuatro vértices, y NO la subdivide para drapearla sobre el relieve. Las capas
 * vectoriales sí van drapeadas. Con el terreno encendido y la cámara inclinada,
 * las dos cosas dejan de coincidir: medido sobre este predio, el relieve
 * coloreado quedaba corrido al este de su lugar, así que las líneas de agua
 * —que estaban bien, las 540 adentro del polígono— aparecían dibujadas fuera del
 * ráster, flotando en el negro. Con `pitch 0` y sin terreno, la máscara del
 * predio calza exacta con el perímetro vectorial y todo cae adentro.
 *
 * De ahí sale el diseño: **el relieve coloreado vive sólo mientras la vista es
 * cenital y el terreno está apagado**, y se va del todo antes de que la cámara
 * se incline. El volumen del acto 01 no lo pone el terreno 3D sino el sombreado
 * calculado en el propio canvas, que es parte del dibujo y no se puede
 * desfasar. Los actos 03 y 04 sí son 3D de verdad, con la ortofoto drapeada:
 * ésa es una fuente de teselas y las teselas se drapean bien.
 */
const FUENTE_PLANA = true;

/** El rumbo más inclinado del recorrido. El encuadre se calcula con ése. */
const RUMBO_MAX = 15;
/** El aire a los costados, proporcional: 70 px sobre 1920, 47 sobre 1280. */
const AIRE = 0.0365;

/**
 * El zoom que mete el predio entero en un cuadro de `ancho` × `alto`, con aire
 * a los costados.
 *
 * Se calcula y no se le pregunta al mapa. `cameraForBounds` sabe hacerlo, pero
 * devuelve `undefined` si se lo llama antes de que el mapa tenga tamaño útil
 * —que es justo cuando lo necesita el primer cuadro— y un valor de respaldo que
 * se cuele ahí queda fijo para los 420 cuadros sin que nada avise.
 *
 * La cuenta es la del esquema de teselas: el mundo son 512 × 2^zoom píxeles para
 * 360° de longitud. La latitud va dividida por el coseno porque en Mercator un
 * grado de latitud ocupa más píxeles que uno de longitud. Y lo que tiene que
 * caber no es el rectángulo sino su sombra girada: un rectángulo a 15° ocupa más
 * ancho y más alto que el original, y sin eso el giro le corta las dos puntas.
 */
function zoomQueEncuadra(ancho: number, alto: number): number {
  const latMedia = ((S + N) / 2) * Math.PI / 180;
  const anchoDeg = E - W;
  const altoDeg = (N - S) / Math.cos(latMedia);
  const cos = Math.abs(Math.cos(RUMBO_MAX * Math.PI / 180));
  const sen = Math.abs(Math.sin(RUMBO_MAX * Math.PI / 180));
  const padding = ancho * AIRE;
  const zx = Math.log2(((ancho - 2 * padding) * 360) / (512 * (anchoDeg * cos + altoDeg * sen)));
  const zy = Math.log2(((alto - 2 * padding) * 360) / (512 * (altoDeg * cos + anchoDeg * sen)));
  return Math.min(zx, zy);
}

/**
 * La cámara, cuadro por cuadro. El zoom y el rumbo son continuos de punta a
 * punta: los actos marcan qué aparece, no cortes de cámara. Un corte en catorce
 * segundos se lee como un error.
 *
 * La inclinación espera a `RELEVO`. Inclinar antes hacía dos cosas malas a la
 * vez: desfasaba el relieve coloreado (ver `FUENTE_PLANA`) y llenaba la mitad de
 * abajo del cuadro con el suelo de adelante, que en los actos 01 y 02 todavía no
 * tiene imagen y es negro.
 */
function camara(f: number, zoomBase: number) {
  const t = f / CUADROS_PORTADA;
  return {
    center: [
      interpolate(t, [0, 1], [CENTRO[0], CENTRO[0] + 0.0010]),
      interpolate(t, [0, 1], [CENTRO[1], CENTRO[1] - 0.0030]),
    ] as [number, number],
    zoom: zoomBase + interpolate(
      f, [0, ACTO.zoom.desde, ACTO.predio.desde, CUADROS_PORTADA],
      [0, 0.16, 0.74, 1.0],
      { easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp' },
    ),
    pitch: interpolate(
      f, [0, RELEVO, ACTO.predio.desde, CUADROS_PORTADA], [0, 0, 48, 61],
      { easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp' },
    ),
    bearing: interpolate(f, [0, CUADROS_PORTADA], [-8, -15], {
      easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
    }),
  };
}

/** La exageración del relieve 3D, que se levanta cuando entra la foto. */
function relieve3D(f: number, exageracion: number): number {
  return exageracion * interpolate(
    f, [RELEVO, ACTO.predio.desde + 20], [0, 1],
    { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// El relieve coloreado, pintado a mano sobre el canvas que MapLibre drapea
// ─────────────────────────────────────────────────────────────────────────────

const ID_CANVAS = 'portada-relieve';

/**
 * Espera a que el mapa no tenga nada más que cargar ni dibujar, y recién ahí
 * sigue.
 *
 * Pregunta cada 50 ms en vez de escuchar `idle`. Parece peor y es lo único que
 * funciona: `idle` avisa cuando el mapa PASA a estar quieto, así que si ya
 * estaba quieto cuando uno se suscribe —que es lo normal cuando el cuadro
 * siguiente mira casi lo mismo que el anterior— el evento no llega nunca y el
 * render se cuelga en ese cuadro hasta que vence el tiempo.
 *
 * El tope de 20 s es para que un cuadro con una tesela que no baja no se lleve
 * puesto el render entero. Un cuadro imperfecto se ve; un render que no termina
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

/** El color de la rampa de la app, ya descompuesto en canales. */
const RAMPA = D.rampa.map(c => {
  const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(c);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] as const : [128, 128, 128] as const;
});

/**
 * El sombreado del relieve, calculado del mismo DEM, con el sol al noroeste a
 * 45°. Es la convención cartográfica —la luz viene de arriba a la izquierda— y
 * existe porque **sin él la vista cenital no tiene volumen**: el color por cota
 * dice la altura de cada punto pero no la forma del terreno entre dos puntos.
 *
 * Se calcula una sola vez: no depende del cuadro.
 */
const SOMBRA = (() => {
  const { cols, rows, elev, paso_m } = D;
  const s = new Float32Array(cols * rows);
  const az = (315 * Math.PI) / 180;
  const alt = (45 * Math.PI) / 180;
  const cota = (r: number, c: number) => {
    const rr = Math.min(rows - 1, Math.max(0, r));
    const cc = Math.min(cols - 1, Math.max(0, c));
    return elev[rr * cols + cc] ?? 0;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dzdx = (cota(r, c + 1) - cota(r, c - 1)) / (2 * paso_m);
      const dzdy = (cota(r + 1, c) - cota(r - 1, c)) / (2 * paso_m);
      const pend = Math.atan(Math.hypot(dzdx, dzdy));
      const rumbo = Math.atan2(dzdy, -dzdx);
      const luz = Math.cos(alt) * Math.sin(pend) * Math.cos(az - rumbo)
        + Math.sin(alt) * Math.cos(pend);
      s[r * cols + c] = Math.max(0, Math.min(1, luz));
    }
  }
  return s;
})();

/**
 * Pinta la grilla de cotas en el canvas.
 *
 * `revelado` va de 0 a 1 y es la cota hasta donde llegó el color: abajo de esa
 * cota el nodo sale con su color de la rampa de la app, arriba sale gris. Así el
 * acto 01 se revela de la cota más baja a la más alta, que es cómo se llena un
 * valle y no cómo pasa un barrido por la pantalla. `volumen` hace lo mismo con
 * el sombreado: el primer cuadro es casi plano, como pide el guión.
 *
 * La fila 0 de la grilla es el SUR y la fila 0 del canvas es el norte, así que
 * se pinta al revés. Sin eso el predio sale espejado y nadie lo nota hasta que
 * lo mira alguien que conoce el campo.
 */
function pintarRelieve(
  canvas: HTMLCanvasElement,
  revelado: number,
  volumen: number,
  difuminado = 18,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { cols, rows, elev, dentro, elev_min, elev_max } = D;
  const img = ctx.createImageData(cols, rows);
  const rango = Math.max(1e-6, elev_max - elev_min);
  const cota = elev_min - difuminado + revelado * (rango + 2 * difuminado);

  for (let r = 0; r < rows; r++) {
    const filaCanvas = rows - 1 - r;
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const v = elev[i];
      const o = (filaCanvas * cols + c) * 4;
      if (v === null || v === undefined) { img.data[o + 3] = 0; continue; }

      const t = Math.min(1, Math.max(0, (v - elev_min) / rango));
      const [cr, cg, cb] = RAMPA[Math.round(t * 255)] ?? RAMPA[0]!;

      // Gris de partida: la luminancia del color, desaturada. El terreno está
      // ahí desde el cuadro 0; lo que entra es el color, no la forma.
      const gris = (0.3 * cr + 0.59 * cg + 0.11 * cb) * 0.72;
      const mezcla = Math.min(1, Math.max(0, (cota - v) / Math.max(1e-6, difuminado)));
      // El sombreado SOLO OSCURECE, nunca aclara: va de 0,38 en la ladera en
      // sombra a 1 en la que da al sol. Centrarlo en 1 y dejar que aclarara
      // —que es lo primero que uno escribe— clavaba el interior del predio en
      // 255: la rampa de la app ya es clara en el medio, y multiplicar eso por
      // 1,8 no es relieve, es sobreexposición. Así no hay nada que recortar.
      const luz = 1 - volumen * 0.62 * (1 - SOMBRA[i]!);
      // Afuera del predio el color se apaga en vez de volverse transparente.
      // Con alfa, el borde del polígono quedaba como un escalón de brillo con
      // forma de cuadrilátero —se leía como un error de exposición— en vez de
      // como lo que es: el predio iluminado y el entorno de contexto.
      const foco = dentro[i] === 1 ? 1 : 0.62;

      img.data[o]     = Math.min(255, (gris + (cr - gris) * mezcla) * luz * foco);
      img.data[o + 1] = Math.min(255, (gris + (cg - gris) * mezcla) * luz * foco);
      img.data[o + 2] = Math.min(255, (gris + (cb - gris) * mezcla) * luz * foco);

      // El halo de cálculo se desvanece hacia el borde: la grilla es 1,15× el
      // predio a propósito —la pendiente necesita vecinos y el D8 necesita ver
      // de dónde baja el agua—, pero eso es andamio. Sin el desvanecido se ve
      // como lo que es: un rectángulo con borde duro flotando sobre el valle.
      // El 5 % es menos que el 8 % de margen con que se pidió la grilla; con
      // 10 % el desvanecido entraba en el predio y apagaba la esquina oeste.
      const borde = Math.min(
        1,
        Math.min(c, cols - 1 - c) / (cols * 0.05),
        Math.min(r, rows - 1 - r) / (rows * 0.05),
      );
      img.data[o + 3] = 255 * borde;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// GeoJSON de lo que dibuja la app
// ─────────────────────────────────────────────────────────────────────────────

const GEO_CURVAS = {
  type: 'FeatureCollection' as const,
  features: D.curvas.flatMap(c => c.lineas.map(l => ({
    type: 'Feature' as const,
    properties: { cota: c.cota, maestra: c.cota % 100 === 0 },
    geometry: { type: 'LineString' as const, coordinates: l.puntos },
  }))),
};

/**
 * Las cadenas de escurrimiento, con `orden` de 0 a 1 según su acumulación. El
 * acto 02 enciende primero las de arriba —poca agua, muchos filos— y al final
 * las de abajo, que es como se llena un árbol de ramas y es el orden en que
 * ocurre en el campo.
 */
const GEO_AGUA = {
  type: 'FeatureCollection' as const,
  features: D.cadenas.map(c => ({
    type: 'Feature' as const,
    properties: {
      acum: c.acum,
      /** 0 = el filo, 1 = el cauce principal. */
      orden: Math.pow(c.acum / D.acum_max, 0.45),
    },
    geometry: { type: 'LineString' as const, coordinates: c.puntos },
  })),
};

const GEO_PREDIO = {
  type: 'FeatureCollection' as const,
  features: [{
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [...D.mojones, D.mojones[0]!].map(m => [m.lng, m.lat]),
    },
  }],
};

// ─────────────────────────────────────────────────────────────────────────────

export const PortadaAcequia: React.FC<z.infer<typeof esquemaPortada>> = ({
  exageracion, atribucion,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const contRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const exagRef = useRef<number | null>(null);
  const [listo, setListo] = useState(false);
  const [handleInicial] = useState(
    () => delayRender('portada: montando el mapa', { timeoutInMilliseconds: 120_000 }),
  );

  // ── El mapa, una sola vez ──────────────────────────────────────────────────
  useEffect(() => {
    if (!contRef.current || !canvasRef.current) return;
    pintarRelieve(canvasRef.current, 0, 0.06);

    const inicial = camara(0, zoomQueEncuadra(width, height));
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
            // Pasado este nivel Esri devuelve la tesela "Map data not yet
            // available"; con `maxzoom` MapLibre reescala la última real.
            maxzoom: 17,
          },
          // El mismo bucket que proxea /api/terrarium. Se lee sin clave y sin
          // nosotros: es dato público de AWS Open Data.
          dem: {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            encoding: 'terrarium',
            maxzoom: 14,
          },
          curvas: { type: 'geojson', data: GEO_CURVAS },
          agua:   { type: 'geojson', data: GEO_AGUA },
          predio: { type: 'geojson', data: GEO_PREDIO },
        },
        layers: [
          { id: 'fondo', type: 'background', paint: { 'background-color': COLORES.tinta } },
          { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-opacity': 0 } },
          {
            id: 'agua', type: 'line', source: 'agua',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              // Un aclarado del azul agua, no el azul agua. Sobre la parte
              // amarilla de la rampa, #2E6B8A lee como una linea negra y el
              // acto 02 pide que el agua se ENCIENDA.
              'line-color': '#7CC2E3',
              'line-opacity': 0,
              // El cauce principal más grueso que el filo: el ancho cuenta
              // cuánta agua junta, que es lo único que mide la acumulación.
              // Los anchos salen de un criterio de aceptación, no del gusto:
              // la portada se tiene que ver a 375 px de ancho, que sobre un
              // render de 1280 es escalar a 0,29. Una línea de 1,6 px queda en
              // medio píxel y desaparece, y entonces el acto 02 no existe para
              // la mitad de las visitas. El filo más fino va a 3,5 para que
              // sobreviva a esa reducción con un píxel entero.
              'line-width': ['interpolate', ['linear'], ['get', 'orden'], 0, 3.5, 1, 9],
              'line-blur': 0.8,
            },
          },
          {
            id: 'curvas', type: 'line', source: 'curvas',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': COLORES.crema,
              'line-opacity': 0,
              'line-width': ['case', ['get', 'maestra'], 2, 1.1],
            },
          },
          {
            id: 'predio', type: 'line', source: 'predio',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': COLORES.crema, 'line-opacity': 0, 'line-width': 3.2 },
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
    (window as unknown as { __portada?: maplibregl.Map }).__portada = map;

    // MapLibre se traga sus errores en el `error` del mapa. En un render
    // headless eso es media hora buscando por qué el cuadro salió negro.
    map.on('error', e => console.log('[portada] maplibre:', e.error?.message ?? e));
    map.on('load', () => {
      // El `canvas` NO puede ir en el estilo inicial: no es una fuente de la
      // especificación de estilos, sólo existe en tiempo de ejecución. Puesta
      // ahí, MapLibre rechaza el estilo entero y `load` no llega nunca.
      map.addSource('relieve', {
        type: 'canvas',
        canvas: ID_CANVAS,
        coordinates: [[W, N], [E, N], [E, S], [W, S]],
        animate: true,
      });
      map.addLayer(
        { id: 'relieve', type: 'raster', source: 'relieve', paint: { 'raster-opacity': 1 } },
        'agua',
      );
      setListo(true);
      continueRender(handleInicial);
    });

    return () => { map.remove(); mapRef.current = null; };
    // Se monta una sola vez a propósito: el mapa es caro y el cuadro lo mueve el
    // efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cada cuadro ────────────────────────────────────────────────────────────
  //
  // `listo` NO alcanza como condición. En el estudio el componente se vuelve a
  // montar con cada recarga en caliente: el mapa se destruye y se crea de nuevo
  // mientras el estado todavía dice que está listo, y el efecto le habla a un
  // mapa cuyo estilo no cargó. Eso es el «Style is not done loading». La
  // condición buena se la pregunta al mapa, no al estado.
  useEffect(() => {
    const map = mapRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;
    const handle = delayRender(`portada: cuadro ${frame}`, { timeoutInMilliseconds: 120_000 });
    let cerrado = false;
    const soltar = () => { if (!cerrado) { cerrado = true; continueRender(handle); } };

    const aplicar = () => {
      if (cerrado || !map.getLayer('relieve')) { soltar(); return; }

      // 01 · el color sube por las cotas y el terreno toma volumen
      pintarRelieve(
        canvas,
        interpolate(frame, [0, ACTO.relieve.hasta], [0, 1], {
          easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
        }),
        interpolate(frame, [0, ACTO.relieve.hasta], [0.06, 1], {
          easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
        }),
      );

      // 02 · el agua se enciende de los filos a los cauces.
      //
      // `lo` arranca en −0,3 y termina en 1,0, así que los dos topes de la
      // interpolación son SIEMPRE estrictamente crecientes: con un
      // `Math.max(0, …)` los dos valían 0 en el cuadro inicial, MapLibre
      // rechazaba la expresión entera —«input values must be in strictly
      // ascending order»— y el agua no aparecía nunca.
      const lo = interpolate(frame, [ACTO.agua.desde, ACTO.agua.hasta - 18], [0, 1], {
        easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }) * 1.3 - 0.3;
      map.setPaintProperty('agua', 'line-opacity', [
        'interpolate', ['linear'], ['get', 'orden'],
        lo, 0.95,
        lo + 0.3, 0,
      ] as unknown as maplibregl.DataDrivenPropertyValueSpecification<number>);

      // 03 y 04 · el relevo. El relieve coloreado se va del todo ANTES de que
      // entren la inclinación y el terreno 3D; la ortofoto ocupa su lugar.
      map.setPaintProperty('relieve', 'raster-opacity', interpolate(
        frame, [ACTO.zoom.desde, RELEVO], [1, 0],
        { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ));
      map.setPaintProperty('sat', 'raster-opacity', interpolate(
        frame, [ACTO.zoom.desde + 6, RELEVO + 26], [0, 1],
        { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ));
      // Las curvas entran en el acto 01b, sobre el relieve coloreado, y se
      // quedan hasta el final: cuando entra la ortofoto suben un poco, porque
      // sobre la foto compiten con el verde del monte y sobre el shader no.
      map.setPaintProperty('curvas', 'line-opacity', interpolate(
        frame,
        [ACTO.curvas.desde, ACTO.curvas.hasta, RELEVO, ACTO.predio.desde + 30],
        [0, 0.6, 0.6, 0.78],
        { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ));
      map.setPaintProperty('predio', 'line-opacity', interpolate(
        frame, [ACTO.zoom.desde - 32, ACTO.zoom.desde + 28], [0, 0.9],
        { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ));

      // El terreno 3D se prende y se apaga, no se deja puesto: con `pitch 0` no
      // aporta nada y cuesta una malla. `setTerrain` la rehace entera, así que
      // sólo se llama cuando la exageración cambia de verdad — llamarlo en los
      // 240 cuadros donde vale 0 triplicaba el render.
      const exag = FUENTE_PLANA ? relieve3D(frame, exageracion) : exageracion;
      if (Math.abs(exag - (exagRef.current ?? -1)) > 0.004) {
        exagRef.current = exag;
        map.setTerrain(exag > 0.01 ? { source: 'dem', exaggeration: exag } : null);
      }

      // `resize` antes de mover la cámara, siempre. MapLibre mide el contenedor
      // UNA vez, cuando se crea, y en el render se crea antes de que el layout
      // se haya asentado: se queda con un alto que no es el del cuadro. El
      // síntoma es un predio pegado al borde de arriba y cortado, con tres
      // cuartos de cuadro negro, y sólo en el render —en el estudio el mapa nace
      // con el layout ya hecho y se ve bien, que es lo que hace que esto cueste
      // media hora de encontrar.
      map.resize();
      map.jumpTo(camara(frame, zoomQueEncuadra(width, height)));

      cuandoEsteQuieto(map, () => requestAnimationFrame(() => requestAnimationFrame(soltar)));
    };

    cuandoEsteQuieto(
      map, aplicar,
      () => Boolean(map.isStyleLoaded()) && map.getLayer('relieve') != null,
    );

    return soltar;
  }, [frame, listo, exageracion, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <canvas
        id={ID_CANVAS}
        ref={canvasRef}
        width={D.cols}
        height={D.rows}
        style={{ display: 'none' }}
      />
      <div ref={contRef} style={{ width, height }} />

      {/* La viñeta: el borde del cuadro se apaga para que el texto de la
          portada, que va encima, se lea sin una caja. */}
      <AbsoluteFill style={{
        background: `radial-gradient(125% 95% at 50% 45%, transparent 40%, ${COLORES.tinta}bb 100%)`,
        pointerEvents: 'none',
      }} />

      {/*
        La atribución no lleva la resolución. «~30 m» es una escala numérica y
        el criterio A4 no admite ningún número en pantalla —ni hectáreas, ni
        pendientes, ni cotas—; el paso del DEM va en el `alt` del video y en el
        documento del encargo, que es donde A1 pide que se declare. «GLO-30» se
        queda porque es el nombre del conjunto de datos, no una medición.
      */}
      {atribucion && (
        <div style={{
          position: 'absolute', left: 24, bottom: 18,
          fontFamily: 'system-ui, sans-serif', fontSize: Math.round(height * 0.0155),
          color: `${COLORES.crema}88`, letterSpacing: '0.02em',
        }}>
          Relieve Copernicus GLO-30 · imagen Esri World Imagery
        </div>
      )}
    </AbsoluteFill>
  );
};
