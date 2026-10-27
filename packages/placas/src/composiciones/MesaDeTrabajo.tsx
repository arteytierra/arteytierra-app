/**
 * ENCARGO 03 · La secuencia de la mesa de trabajo. Dieciséis segundos, en bucle.
 *
 * Un encuadre fijo sobre el predio, la ortofoto de base, y la lectura
 * armándose encima en cuatro actos:
 *
 *   01  LA COTA     el shader de elevaciones subiendo de las cotas bajas a las altas
 *   02  LA FORMA    las curvas de nivel DIBUJÁNDOSE, cada una sobre su propio recorrido
 *   03  EL AGUA     las líneas de acumulación encendiéndose de los filos al cauce,
 *                   y después el vaso, el muro y el punto de derrame
 *   04  EL DISEÑO   el predio se vela, se enciende el corredor por el que se puede
 *                   llegar, lo que el terreno admite, y las bandas de caminata
 *   --  VUELVE      todo se apaga junto y queda la ortofoto desnuda
 *
 * ── Por qué ACÁ el primer y el último cuadro SÍ son idénticos ──────────────
 *
 * En las piezas que giran, dos cuadros iguales seguidos son un defecto: meten
 * una trabita de 1/30 s en cada vuelta. Acá no, y la diferencia no es de
 * criterio sino de la pieza: la cámara está QUIETA y las dos puntas son el
 * mismo estado —la ortofoto sin una sola línea—. Donde nada se mueve, periódico
 * e idéntico son la misma cosa. El apagado termina en el cuadro 468 y los once
 * que quedan son el cuadro 0, así que el criterio del encargo se cumple al pie
 * de la letra sin pagar ningún tirón.
 *
 * ── Por qué el acto 04 dura cuatro segundos y no tres y medio ──────────────
 *
 * Porque son tres cosas y no una: lo que el terreno rechaza, por dónde se
 * llega, y cada cuánto se puede volver. Entran en 3,5 s pisándose. Los treinta
 * cuadros salen del acto 01, que es el más simple de los cuatro —una rampa que
 * sube— y el que menos los necesita.
 *
 * ── Lo que esta pieza NO dibuja ────────────────────────────────────────────
 *
 * Ni viviendas, ni potreros, ni un bosque comestible: la app no los calcula sin
 * un programa declarado, y este predio no lo tiene. Lo que sí calcula está en
 * el encabezado de `predio/mesa.ts`, con el nombre de cada función.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import { GEO_PREDIO_RELLENO } from './predio/datos';
import {
  GEO_ACCESO, GEO_ADMITE, GEO_CAMINATA, GEO_CIERRE, GEO_CORREDOR, GEO_DERRAME,
  GEO_ESPEJO_MESA, GEO_MURO, M,
} from './predio/mesa';
import {
  type CapaExtra, degradadoDeAvance, usarMapaDelPredio, vistaASangre,
} from './predio/mapa';

/** Dieciséis segundos a 30 fps. */
export const CUADROS_MESA = 480;

/**
 * Los cuatro actos y el apagado, en cuadros.
 *
 * `fin` es el cuadro en que todo está ya apagado. De ahí al último cuadro no
 * se mueve nada, que es lo que hace que el 479 sea el 0.
 */
const ACTO = {
  cota:    { desde: 0,   hasta: 100 },
  forma:   { desde: 100, hasta: 200 },
  agua:    { desde: 200, hasta: 320 },
  disenio: { desde: 320, hasta: 440 },
  apaga:   { desde: 440, hasta: 468 },
};

const SUAVE = Easing.bezier(0.33, 0, 0.2, 1);
const ENTRA = Easing.out(Easing.cubic);

/** De 0 a 1 a lo largo de un tramo, acotado en las dos puntas. */
function tramo(f: number, desde: number, hasta: number, easing = SUAVE) {
  return interpolate(f, [desde, hasta], [0, 1], {
    easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

/**
 * Cuánto está encendida una capa: entra en su acto, se queda, y se apaga al
 * final con todas las demás.
 */
function viva(f: number, desde: number, dura: number) {
  const entra = tramo(f, desde, desde + dura, ENTRA);
  const sale = 1 - tramo(f, ACTO.apaga.desde, ACTO.apaga.hasta);
  return entra * sale;
}

/**
 * El frente que recorre una propiedad de 0 a 1 para encender los rasgos en
 * orden. El ancho de la banda es lo que hace que no aparezca todo de golpe ni
 * se vea el corte duro de un `step`.
 */
const BANDA = 0.22;
function frente(t: number) {
  // Llega hasta 1 + BANDA para que el último rasgo también termine encendido.
  return t * (1 + BANDA);
}

/**
 * Las fuentes y las capas que agregan las dos piezas del encargo 03.
 *
 * Están acá, exportadas, porque la entrega C —el par crudo contra leído— usa
 * EXACTAMENTE las mismas. Dos copias de once capas con sus órdenes de
 * inserción es garantizar que el día que se mueva una, la cortina de la
 * página deje de mostrar lo mismo que el video.
 */
export const CAPAS_MESA: {
  fuentes: Record<string, maplibregl.SourceSpecification>;
  capas: CapaExtra[];
} = {
  fuentes: {
    predio_relleno: { type: 'geojson', data: GEO_PREDIO_RELLENO },
    admite:         { type: 'geojson', data: GEO_ADMITE },
    corredor:       { type: 'geojson', data: GEO_CORREDOR },
    caminata:       { type: 'geojson', data: GEO_CAMINATA },
    espejo_mesa:    { type: 'geojson', data: GEO_ESPEJO_MESA },
    muro:           { type: 'geojson', data: GEO_MURO, lineMetrics: true },
    cierre:         { type: 'geojson', data: GEO_CIERRE },
    derrame:        { type: 'geojson', data: GEO_DERRAME },
    acceso:         { type: 'geojson', data: GEO_ACCESO },
  },
  capas: [
    // El velo: el predio entero oscurecido de una pasada. Es el 95,5 % que el
    // terreno rechaza, dicho con un rasgo en vez de con 3.242.
    {
      antes: 'aptitud',
      capa: {
        id: 'velo', type: 'fill', source: 'predio_relleno',
        paint: { 'fill-color': COLORES.tinta, 'fill-opacity': 0 },
      },
    },
    // Las bandas de caminata van ARRIBA del velo, y se probó al revés.
    //
    // Abajo del sombreado quedan mejor —el relieve se les nota encima en vez de
    // parecer una calcomanía plana— pero el velo de este mismo acto las apaga,
    // y entonces no se leen: en el cuadro 435 eran una mancha parda. Entre que
    // se vean con el relieve encima y que se vean, mandan las segundas. Lo que
    // el relieve tenía que decir ya lo dijo el acto 01.
    {
      antes: 'aptitud',
      capa: {
        id: 'caminata', type: 'fill', source: 'caminata',
        paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0, 'fill-antialias': false },
      },
    },
    {
      antes: 'aptitud',
      capa: {
        id: 'corredor', type: 'fill', source: 'corredor',
        // Con antialias: el corredor son celdas sueltas de 12 m y sin
        // suavizar el borde queda una escalera de píxeles. En las capas
        // densas —el shader, las bandas— va al revés, porque ahí cada borde
        // interno dibujaría una costura.
        paint: { 'fill-color': '#C9B88A', 'fill-opacity': 0 },
      },
    },
    {
      antes: 'aptitud',
      capa: {
        id: 'admite', type: 'fill', source: 'admite',
        // Lo admitido cae ADENTRO del corredor, así que son dos cremas: la
        // apagada es por dónde se llega y la encendida es dónde además se
        // puede apoyar algo. Un azul acá competiría con el agua, que sigue
        // dibujada.
        paint: { 'fill-color': '#F7F1E0', 'fill-opacity': 0 },
      },
    },
    // El vaso de la represa, arriba del espejo genérico del encargo 02 —que
    // esta pieza no enciende— para que no se pisen.
    {
      antes: 'zanjas',
      capa: {
        id: 'espejo-mesa', type: 'fill', source: 'espejo_mesa',
        paint: { 'fill-color': '#2E6B8A', 'fill-opacity': 0 },
      },
    },
    {
      antes: 'zanjas',
      capa: {
        id: 'espejo-mesa-borde', type: 'line', source: 'espejo_mesa',
        paint: { 'line-color': '#7CC2E3', 'line-opacity': 0, 'line-width': 2.4 },
      },
    },
    // El muro va ARRIBA del agua: es la obra, y lo último que se lee.
    {
      capa: {
        id: 'muro-base', type: 'line', source: 'muro',
        layout: { 'line-cap': 'butt' },
        paint: { 'line-color': '#1A1210', 'line-opacity': 0, 'line-width': 13 },
      },
    },
    {
      capa: {
        id: 'muro', type: 'line', source: 'muro',
        layout: { 'line-cap': 'butt' },
        paint: { 'line-color': COLORES.crema, 'line-opacity': 0, 'line-width': 8 },
      },
    },
    {
      capa: {
        id: 'pulso-cierre', type: 'circle', source: 'cierre',
        paint: {
          'circle-radius': 1, 'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#D8F1FF', 'circle-stroke-width': 2.5,
          'circle-opacity': 0, 'circle-stroke-opacity': 0,
        },
      },
    },
    {
      capa: {
        id: 'derrame', type: 'circle', source: 'derrame',
        paint: {
          'circle-radius': 1, 'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#F2C14E', 'circle-stroke-width': 2.5,
          'circle-opacity': 0, 'circle-stroke-opacity': 0,
        },
      },
    },
    {
      capa: {
        id: 'acceso', type: 'circle', source: 'acceso',
        paint: {
          'circle-radius': 5, 'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#E8D9A8', 'circle-stroke-width': 2.5,
          'circle-opacity': 0, 'circle-stroke-opacity': 0,
        },
      },
    },
  ],
};

/**
 * La inclinación de la cámara, y por qué no es la de las otras piezas.
 *
 * Las del encargo 02 van a 61 grados porque son un PAISAJE: lo que tienen que
 * dar es el cordón de fondo recortado contra el cielo. Ésta tiene que dejar
 * LEER cuatro capas que se superponen, y a 61 grados la mitad lejana del predio
 * se comprime contra el horizonte: medido sobre el cuadro 300, la represa de
 * 6,7 ha —370 × 543 m de espejo— cae en el fondo y se lee como una mancha, no
 * como un vaso con su muro. A 44 el predio se abre y las cuatro capas se
 * distinguen, sin irse a cenital, que sería un plano y no una mesa.
 */
export const INCLINACION = 44;

export const MesaDeTrabajo: React.FC = () => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: 'mesa-de-trabajo',
    // Un solo encuadre fijo: es lo que pide el encargo y es lo que deja que el
    // codificador pague el primer cuadro y casi nada después. Es la misma pose
    // aprobada de las otras piezas —el otro lado de la ladera—, así que las
    // dos secciones de la página miran el mismo paisaje.
    camara: (_f, ancho, alto) => vistaASangre(ancho, alto, { inclinacion: INCLINACION }),
    fuentes: CAPAS_MESA.fuentes,
    capas: CAPAS_MESA.capas,
    pintar: (map, frame) => {
      const op = (capa: string, prop: string, v: unknown) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);

      // El perímetro entra con el primer acto y se queda: es lo que dice de qué
      // predio se está hablando, y sin él el shader es una mancha sobre un valle
      // cualquiera.
      const marco = viva(frame, 0, 24);
      op('predio', 'line-opacity', 0.85 * marco);
      map.setPaintProperty('predio', 'line-gradient',
        degradadoDeAvance(tramo(frame, 0, 40), COLORES.crema) as maplibregl.ExpressionSpecification);

      // ── 01 · LA COTA ────────────────────────────────────────────────────
      // El shader sube de las cotas bajas a las altas. `n` es la clase de cota
      // normalizada: la banda la recorre y detrás queda encendido.
      const fCota = frente(tramo(frame, ACTO.cota.desde, ACTO.cota.hasta));
      // La rampa SE APAGA cuando entra el acto del diseño, y no es que sobre:
      // es que deja de ser el tema, y el color del suelo pasa a decir otra cosa.
      // Se probó atenuándola a la mitad y el cuadro queda marrón: la rampa
      // debajo, las bandas de caminata encima y el velo en el medio son tres
      // colores sobre el mismo píxel y no se lee ninguno. Lo que una mesa de
      // trabajo hace con una capa que ya contó lo suyo es sacarla.
      const cotaDeFondo = 1 - tramo(frame, ACTO.disenio.desde, ACTO.disenio.desde + 36);
      op('elevacion', 'fill-opacity', [
        '*', 0.88 * cotaDeFondo * viva(frame, ACTO.cota.desde, 1),
        ['interpolate', ['linear'], ['get', 'n'], Math.max(-1, fCota - BANDA), 1, fCota, 0],
      ]);

      // ── 02 · LA FORMA ───────────────────────────────────────────────────
      // Las curvas se DIBUJAN: el degradado por `line-progress` es por rasgo,
      // así que una sola expresión dibuja los 187 tramos, cada uno sobre su
      // propio largo y no sobre el del más largo. Y además suben de cota en
      // cota, que es el orden en que se leen en el campo.
      const tForma = tramo(frame, ACTO.forma.desde, ACTO.forma.hasta);
      const fForma = frente(tForma);
      map.setPaintProperty('curvas', 'line-gradient',
        degradadoDeAvance(interpolate(tForma, [0, 0.75], [0, 1], {
          easing: SUAVE, extrapolateRight: 'clamp',
        }), COLORES.crema) as maplibregl.ExpressionSpecification);
      op('curvas', 'line-opacity', [
        '*', 0.7 * viva(frame, ACTO.forma.desde, 1),
        ['interpolate', ['linear'], ['get', 'altura'], Math.max(-1, fForma - BANDA), 1, fForma, 0],
      ]);

      // ── 03 · EL AGUA ────────────────────────────────────────────────────
      // Primero las líneas de acumulación, de los filos al cauce: `orden` es 0
      // en el filo y 1 en el cauce principal, que es el orden en que ocurre.
      const tAgua = tramo(frame, ACTO.agua.desde, ACTO.agua.desde + 60);
      const fAgua = frente(tAgua);
      const porOrden = (base: number) => ([
        '*', base * viva(frame, ACTO.agua.desde, 1),
        ['interpolate', ['linear'], ['get', 'orden'], Math.max(-1, fAgua - BANDA), 1, fAgua, 0],
      ]);
      // El agua también cede en el acto del diseño: sigue, porque es la razón
      // de media zonificación, pero deja de ser lo más brillante del cuadro.
      const aguaDeFondo = 1 - 0.45 * tramo(frame, ACTO.disenio.desde, ACTO.disenio.desde + 36);
      op('agua', 'line-opacity', porOrden(0.95 * aguaDeFondo));
      op('agua-halo', 'line-opacity', porOrden(0.45 * aguaDeFondo));
      op('junturas', 'circle-stroke-opacity', 0.85 * viva(frame, ACTO.agua.desde + 40, 20));

      // Y después la represa posible: el vaso, el muro levantándose sobre su
      // propio eje, y el punto de derrame —por donde se va el agua cuando el
      // vaso se llena, que es donde iría el vertedero—.
      const vVaso = viva(frame, ACTO.agua.desde + 55, 25);
      op('espejo-mesa', 'fill-opacity', 0.72 * vVaso);
      op('espejo-mesa-borde', 'line-opacity', 0.95 * vVaso);

      // El cierre late dos veces mientras el muro se levanta: marca DÓNDE está
      // el cuello de botella, que es el dato. Es un anillo sobre el terreno, no
      // un control de una interfaz.
      const vCierre = viva(frame, ACTO.agua.desde + 55, 20);
      const uC = Math.max(0, ((frame - ACTO.agua.desde - 55) / 30) % 1);
      op('pulso-cierre', 'circle-radius', 4 + 34 * uC);
      op('pulso-cierre', 'circle-stroke-opacity', vCierre * (1 - uC) * (1 - uC) * 0.95);

      const vMuro = viva(frame, ACTO.agua.desde + 72, 20);
      const aMuro = tramo(frame, ACTO.agua.desde + 72, ACTO.agua.desde + 100);
      op('muro-base', 'line-opacity', 0.8 * vMuro);
      op('muro', 'line-opacity', vMuro);
      for (const capa of ['muro-base', 'muro']) {
        map.setPaintProperty(capa, 'line-gradient',
          degradadoDeAvance(aMuro, capa === 'muro' ? COLORES.crema : '#1A1210') as
            maplibregl.ExpressionSpecification);
      }

      // El derrame late dos veces en el acto y las dos quedan enteras adentro,
      // así que no hay medio pulso colgado cuando el bucle vuelve.
      const vDerrame = viva(frame, ACTO.agua.desde + 92, 16);
      const uD = ((frame - ACTO.agua.desde - 92) / 28) % 1;
      op('derrame', 'circle-radius', 4 + 26 * Math.max(0, uD));
      op('derrame', 'circle-stroke-opacity',
        vDerrame * (1 - Math.max(0, uD)) * (1 - Math.max(0, uD)) * 0.95);

      // ── 04 · EL DISEÑO ──────────────────────────────────────────────────
      // Primero el velo: el terreno rechaza el 95,5 % del predio, y la razón
      // que más saca no es la pendiente de la plataforma sino LLEGAR.
      op('velo', 'fill-opacity', 0.38 * viva(frame, ACTO.disenio.desde, 22));

      // El corredor se recorre desde la tranquera: `t` va de 0 a 7 según la
      // distancia al acceso por un camino que no se pasa del 10 %.
      const tCorr = tramo(frame, ACTO.disenio.desde + 14, ACTO.disenio.desde + 58);
      const fCorr = tCorr * (M.caminos.pasos + 1);
      op('acceso', 'circle-stroke-opacity', 0.9 * viva(frame, ACTO.disenio.desde + 10, 14));
      op('corredor', 'fill-opacity', [
        '*', 0.8 * viva(frame, ACTO.disenio.desde + 14, 1),
        ['interpolate', ['linear'], ['get', 't'], Math.max(-1, fCorr - 1.4), 1, fCorr, 0],
      ]);

      // Lo que el terreno admite: 6,6 ha de 428,4.
      // Sin contorno: lo admitido son 68 rectángulos de UNA fila cada uno, y
      // dibujarle el borde a cada uno no marca la mancha, la raya.
      const vAdmite = viva(frame, ACTO.disenio.desde + 42, 22);
      op('admite', 'fill-opacity', 0.9 * vAdmite);

      // Y por último las bandas de caminata: cada cuánto se puede volver a cada
      // parte del predio. No son anillos concéntricos y se ve: se estiran sobre
      // la curva de nivel y se aplastan contra la ladera.
      const tBandas = tramo(frame, ACTO.disenio.desde + 62, ACTO.disenio.hasta);
      const fBandas = tBandas * (M.caminata.cortes_min.length + 1.4);
      // La quinta banda —lo que está a MÁS de 40 minutos de ida y vuelta— no
      // se pinta, y eso es el dato: son 382 de las 428 ha del predio, el 89 %.
      // Pintarla sería tapar el cuadro entero con el color de «lejos»; dejarla
      // en blanco hace que lo que se ve sean las 46 ha a las que se puede
      // volver seguido, rodeadas de todo lo demás.
      op('caminata', 'fill-opacity', [
        'case', ['>=', ['get', 'b'], M.caminata.cortes_min.length], 0,
        ['*', 0.7 * viva(frame, ACTO.disenio.desde + 62, 1),
          ['interpolate', ['linear'], ['get', 'b'], Math.max(-1, fBandas - 1.2), 1, fBandas, 0]],
      ]);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
