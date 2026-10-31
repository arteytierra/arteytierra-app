/**
 * ENCARGO 04 · A — «Lo que no se ve»: el sol y el viento. Treinta segundos,
 * en bucle, con los actos rotulados.
 *
 * Un encuadre fijo sobre el mismo predio de siempre, la ortofoto de base, y
 * tres movimientos encima:
 *
 *   01  LOS ARCOS   las tres trayectorias del sol dibujándose del amanecer al
 *                   atardecer, en proyección azimutal equidistante: el centro
 *                   del círculo es el cénit y el borde es el horizonte
 *   02  LAS HORAS   el mapa de horas de sol acumuladas, el día largo primero y
 *                   el corto después, los dos sobre el mismo terreno y contra
 *                   el mismo techo de color
 *   03  EL VIENTO   los doce sectores mensuales —la envolvente tenue y el mes
 *                   en curso brillante— y después la cortina como BANDA con su
 *                   zona protegida a sotavento
 *   --  VUELVE      todo se apaga junto y queda la ortofoto desnuda
 *
 * ── Los rótulos, y por qué la pieza cambió de opinión ──────────────────────
 *
 * Hasta el 30/10/2026 esta pieza no llevaba una sola palabra quemada, y la
 * cabecera lo defendía: «qué es cada acto lo dice la página». El argumento
 * tenía un agujero que se vio recién con la pieza publicada —un mapa de
 * colores sobre una ladera no se autoexplica, y quien lo mira no sabe si está
 * viendo horas de sol, pendiente o temperatura—, así que ahora cada acto se
 * presenta en el cuadro.
 *
 * Tres reglas para que un rótulo no se vuelva el defecto que esta pieza venía
 * esquivando:
 *
 * 1. **Ningún rótulo trae un número que la pieza no pueda sostener.** Ni horas
 *    de sol —`insolacion.ts` avisa que es sin nubes, sin refracción y sobre un
 *    modelo de ~30 m—, ni azimut del viento, ni superficie. Lo que se nombra
 *    es QUÉ se está mirando, no cuánto mide.
 * 2. **Lo que dicen sale del dato, no del redactado.** Los tres arcos son los
 *    solsticios y el equinoccio porque `sol.arcos` son esos tres; que el
 *    mediodía de junio pase al norte sale de `porElNorte`, que la app calcula
 *    como `declinación > latitud`; la escala de color va del azul al amarillo
 *    porque así está escrita en `rects[].c`.
 * 3. **El velo sube y baja con el rótulo.** Un degradado permanente al pie
 *    cambiaría el aspecto de la pieza también en los cuadros donde no hay nada
 *    escrito —y el cuadro 0, que es el que cierra el bucle, tiene que seguir
 *    siendo la ortofoto desnuda.
 *
 * Y el ritmo se alargó de 18 a 30 segundos por lo mismo: un acto que dura
 * cinco segundos no da tiempo de leer tres renglones y mirar lo que describen.
 * Los dos mapas de horas pasaron de 60 a 90 cuadros de dibujado y los doce
 * meses del viento, de 75 cuadros a 108 —de 6 a 9 cuadros por mes—, que es lo
 * que permite ver la rotación mes a mes en vez de un parpadeo.
 *
 * ── Por qué el primer y el último cuadro son idénticos ─────────────────────
 *
 * Por lo mismo que en la secuencia de la mesa: la cámara está QUIETA y las dos
 * puntas son el mismo estado —la ortofoto sin una sola línea—. Donde nada se
 * mueve, periódico e idéntico son la misma cosa. El apagado termina en el
 * cuadro 870 y los veintinueve que quedan son el cuadro 0, así que el bucle
 * cierra al pie de la letra sin pagar el tirón de dos cuadros repetidos en una
 * pieza que sí se mueve.
 *
 * ── Lo que esta pieza NO muestra ───────────────────────────────────────────
 *
 * · **Ni un número de horas de sol.** `insolacion.ts` lo pide en su propia
 *   cabecera: sin nubes, sin refracción, sobre un modelo de ~30 m. Se ve dónde
 *   hay más y dónde menos. El mínimo, el máximo y el promedio están en el JSON
 *   para poder verificar, y de ahí no salen.
 * · **Ni una flecha anual de viento.** Los doce meses están medidos uno por uno
 *   (`viento_dir_deg` de cada mes, que es WD10M). El promedio anual que la app
 *   calcula aparte NO se dibuja: la pieza existe, entre otras cosas, para
 *   mostrar el cuadrante entero por el que el viento entra en el año.
 * · **Ni un crédito, ni una interfaz.** Los rótulos nombran el acto y nada más.
 *
 * ── La única pieza del repertorio con el norte arriba, y por qué ──────────
 *
 * Las otras miran desde el rumbo 165, que es el otro lado de la ladera y la
 * pose aprobada: ahí lo que importa es el paisaje y de dónde baja el agua.
 * Acá el tema es la DIRECCIÓN —por dónde entra el sol y por dónde entra el
 * viento— y con la cámara a 165° el norte queda abajo del cuadro. El arco de
 * junio, que es el que pasa por el norte, aparecería en la mitad de abajo y
 * cualquiera lo leería como «el sol va por el sur»: la pieza diría exactamente
 * lo contrario de lo que dice el dato que la sostiene. Un criterio de
 * aceptación del encargo es que se vea el sol pasando por el norte, así que el
 * encuadre se da vuelta y la familia se rompe en esta sola pieza.
 *
 * Y la inclinación es baja —22° y no los 44 de la mesa ni los 61 del paisaje—
 * por lo mismo: los dos primeros actos son una proyección del CIELO sobre el
 * suelo, centro el cénit y borde el horizonte, y cuanto más se inclina la
 * cámara más se aplasta ese círculo contra una elipse. A cenital puro, en
 * cambio, el terreno se vuelve un plano y el acto 02 —que es justamente el
 * relieve haciéndose su propia sombra— pierde su tema, porque el sombreado se
 * sigue viendo pero el volumen no. 22° deja leer el círculo y deja ver la
 * ladera.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import { DISPLAY, SANS } from '../tipografia';
import {
  GEO_ARCOS, GEO_BRUJULA, GEO_CORTINA_BANDA, GEO_CORTINA_EJE, GEO_CORTINA_ZONA,
  GEO_HORAS, GEO_HORIZONTE, GEO_MEDIODIAS, GEO_RUMBOS, GEO_SECTORES, MESES_VIENTO, SV,
} from './predio/sol';
import { CENTRO } from './predio/datos';
import {
  type CapaExtra, corriente, degradadoDeAvance, usarMapaDelPredio, zoomQueEncuadra,
} from './predio/mapa';

/** Treinta segundos a 30 fps. */
export const CUADROS_SOL = 900;

/**
 * Los tres actos y el apagado, en cuadros. `apaga.hasta` es el cuadro en que
 * ya no queda nada encendido: de ahí al 899 no se mueve nada, que es lo que
 * hace que el último cuadro sea el 0.
 */
const ACTO = {
  arcos:  { desde: 0,   hasta: 240 },
  horas:  { desde: 240, hasta: 512 },
  viento: { desde: 512, hasta: 790 },
  apaga:  { desde: 790, hasta: 870 },
};

const SUAVE = Easing.bezier(0.33, 0, 0.2, 1);
const ENTRA = Easing.out(Easing.cubic);

/** De 0 a 1 a lo largo de un tramo, acotado en las dos puntas. */
function tramo(f: number, desde: number, hasta: number, easing = SUAVE) {
  return interpolate(f, [desde, hasta], [0, 1], {
    easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

/** Una capa que entra en su acto, se queda, y se apaga al final con las demás. */
function viva(f: number, desde: number, dura: number) {
  return tramo(f, desde, desde + dura, ENTRA) * (1 - tramo(f, ACTO.apaga.desde, ACTO.apaga.hasta));
}

/**
 * Una capa que entra en su acto y se apaga cuando entra el siguiente, en vez de
 * quedarse. Los dos actos del cielo ocupan el MISMO círculo, así que
 * acumularlos sería superponer tres lecturas sobre los mismos píxeles y no
 * dejar leer ninguna.
 */
function solo(f: number, desde: number, dura: number, hasta: number, sale = 28) {
  return tramo(f, desde, desde + dura, ENTRA) * (1 - tramo(f, hasta, hasta + sale));
}

/** El frente que recorre una propiedad de 0 a 1 encendiendo los rasgos en orden. */
const BANDA = 0.22;
const frente = (t: number) => t * (1 + BANDA);

/**
 * El claro con el que se dibuja el sol: no es el crema de la marca sino un
 * blanco cálido más alto, porque la cabeza del trazo tiene que leerse sobre el
 * naranja y el azul de los propios arcos.
 */
const LUZ = '#FFF3D6';

/**
 * El azul de los rótulos. No es `COLORES.agua` y es a propósito: el azul de la
 * marca está hecho para texto sobre crema y sobre este fondo —ortofoto de monte
 * en penumbra— queda por debajo del contraste legible. Éste es el mismo
 * aclarado que usa la landing para el agua sobre oscuro.
 */
const AGUA_CLARA = '#7FC0DF';

/**
 * Qué dice cada acto mientras corre.
 *
 * Los tramos están elegidos para que el rótulo aparezca con el acto y se vaya
 * antes de que entre el siguiente: dos rótulos encimados son peor que ninguno.
 * Ver la cabecera para las tres reglas de qué puede decir un rótulo acá.
 */
const ROTULOS = [
  {
    acto: '01',
    titulo: 'Las trayectorias del sol',
    bajada: 'Solsticios y equinoccios, del amanecer al atardecer. En junio el mediodía pasa al norte.',
    desde: 16, hasta: 212,
  },
  {
    acto: '02',
    titulo: 'Horas de sol sobre el terreno',
    bajada: 'El día más largo del año. Amarillo, más horas; azul, sombra.',
    desde: 246, hasta: 352,
  },
  {
    acto: '02',
    titulo: 'Horas de sol sobre el terreno',
    bajada: 'El día más corto, con la misma escala de color.',
    desde: 374, hasta: 500,
  },
  {
    acto: '03',
    titulo: 'De dónde entra el viento',
    bajada: 'Los doce meses, medidos uno por uno.',
    desde: 518, hasta: 642,
  },
  {
    acto: '03',
    titulo: 'La cortina',
    bajada: 'Perpendicular al viento de los meses fríos, con la superficie que queda a resguardo.',
    desde: 648, hasta: 784,
  },
] as const;

/** Lo que tarda un rótulo en entrar, y lo mismo en salir. */
const ENTRA_ROTULO = 16;

const opacidadRotulo = (f: number, r: { desde: number; hasta: number }) =>
  tramo(f, r.desde, r.desde + ENTRA_ROTULO) * (1 - tramo(f, r.hasta, r.hasta + ENTRA_ROTULO));

/** Las fuentes y las capas que agrega esta pieza. */
export const CAPAS_SOL: {
  fuentes: Record<string, maplibregl.SourceSpecification>;
  capas: CapaExtra[];
} = {
  fuentes: {
    horizonte: { type: 'geojson', data: GEO_HORIZONTE },
    brujula:   { type: 'geojson', data: GEO_BRUJULA },
    mediodias: { type: 'geojson', data: GEO_MEDIODIAS },
    horas_verano:   { type: 'geojson', data: GEO_HORAS.verano },
    horas_invierno: { type: 'geojson', data: GEO_HORAS.invierno },
    sectores:  { type: 'geojson', data: GEO_SECTORES },
    rumbos:    { type: 'geojson', data: GEO_RUMBOS },
    cortina_zona:  { type: 'geojson', data: GEO_CORTINA_ZONA },
    cortina_banda: { type: 'geojson', data: GEO_CORTINA_BANDA },
    cortina_eje:   { type: 'geojson', data: GEO_CORTINA_EJE, lineMetrics: true },
    // Una fuente por arco: `line-gradient` es propiedad de capa y no valor por
    // rasgo, así que tres arcos en una sola fuente sólo podrían dibujarse del
    // mismo color. Y el color es lo que distingue el solsticio alto del bajo.
    ...Object.fromEntries(GEO_ARCOS.map((fc, i) => [
      `arco_${i}`, { type: 'geojson' as const, data: fc, lineMetrics: true },
    ])),
  },
  capas: [
    // ── Los dos mapas de horas, debajo del sombreado ─────────────────────
    //
    // Van donde va el shader de cota de las otras piezas, y por la misma razón:
    // así la misma luz que le da volumen al monte se la da al mapa, y el acto
    // 02 —el relieve haciéndose su propia sombra— se ve como relieve y no como
    // una calcomanía plana. `fill-antialias: false` porque son 2.569 y 3.001
    // rectángulos que se tocan: con antialias cada borde interno dibuja una
    // línea semitransparente y el mapa sale cruzado por una grilla.
    {
      antes: 'sombra',
      capa: {
        id: 'horas-verano', type: 'fill', source: 'horas_verano',
        paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0, 'fill-antialias': false },
      },
    },
    {
      antes: 'sombra',
      capa: {
        id: 'horas-invierno', type: 'fill', source: 'horas_invierno',
        paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0, 'fill-antialias': false },
      },
    },
    // ── El viento, arriba de la ortofoto y debajo de las líneas ──────────
    {
      antes: 'aptitud',
      capa: {
        id: 'cortina-zona', type: 'fill', source: 'cortina_zona',
        paint: { 'fill-color': '#7CC2E3', 'fill-opacity': 0 },
      },
    },
    {
      antes: 'aptitud',
      capa: {
        id: 'sectores-todos', type: 'fill', source: 'sectores',
        paint: { 'fill-color': '#9FD2E8', 'fill-opacity': 0, 'fill-antialias': false },
      },
    },
    {
      antes: 'aptitud',
      capa: {
        id: 'sector-mes', type: 'fill', source: 'sectores',
        filter: ['==', ['get', 'i'], 0],
        paint: { 'fill-color': '#D8F1FF', 'fill-opacity': 0 },
      },
    },
    // Los doce rumbos medidos. Ver `GEO_RUMBOS`: sin ellos la rotación mes a
    // mes no se ve, porque doce cuñas de 70° que se mueven 45° en total se
    // tapan entre sí.
    {
      capa: {
        id: 'rumbos-todos', type: 'line', source: 'rumbos',
        paint: { 'line-color': '#9FD2E8', 'line-opacity': 0, 'line-width': 1.4 },
      },
    },
    {
      capa: {
        id: 'rumbo-mes', type: 'line', source: 'rumbos',
        filter: ['==', ['get', 'i'], 0],
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': '#E8F7FF', 'line-opacity': 0, 'line-width': 3.4, 'line-blur': 0.5 },
      },
    },
    // La banda de plantación va ARRIBA de todo lo del viento: es la obra.
    {
      capa: {
        id: 'cortina-banda', type: 'fill', source: 'cortina_banda',
        paint: { 'fill-color': '#2F6B3A', 'fill-opacity': 0 },
      },
    },
    {
      capa: {
        id: 'cortina-banda-borde', type: 'line', source: 'cortina_banda',
        paint: { 'line-color': '#8FD39A', 'line-opacity': 0, 'line-width': 1.6 },
      },
    },
    // El eje dibujado grueso es un SÍMBOLO, no un ancho.
    //
    // La banda mide 8 m sobre un predio de 3,4 km: en 1280 px de ancho son 2,6
    // píxeles, y el polígono de verdad —que está dibujado acá al lado y es el
    // que lleva la superficie— se pierde contra el monte. Un rasgo que no se ve
    // no dice nada, así que encima del polígono real va una línea de 5 px, que
    // es lo mismo que hace la app en pantalla con cualquier rasgo lineal fino y
    // lo mismo que hizo la mesa con el muro de la represa. La superficie
    // informada sigue siendo la del polígono: 1,93 ha de banda y 36,26 de
    // resguardo.
    {
      capa: {
        id: 'cortina-eje-base', type: 'line', source: 'cortina_eje',
        layout: { 'line-cap': 'butt' },
        paint: { 'line-color': '#132b17', 'line-opacity': 0, 'line-width': 8 },
      },
    },
    {
      capa: {
        id: 'cortina-eje', type: 'line', source: 'cortina_eje',
        layout: { 'line-cap': 'butt' },
        paint: { 'line-color': '#8FD39A', 'line-opacity': 0, 'line-width': 5 },
      },
    },
    // ── El cielo: el horizonte, los cardinales y los tres arcos ──────────
    {
      capa: {
        id: 'horizonte', type: 'line', source: 'horizonte',
        paint: {
          'line-color': COLORES.crema, 'line-opacity': 0, 'line-width': 2.2,
          'line-dasharray': [3, 4],
        },
      },
    },
    {
      capa: {
        id: 'brujula', type: 'circle', source: 'brujula',
        paint: {
          'circle-radius': ['case', ['get', 'cardinal'], 4.6, 3.2],
          'circle-color': COLORES.crema,
          'circle-opacity': 0,
          'circle-stroke-color': '#1A1210',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0,
        },
      },
    },
    ...GEO_ARCOS.map((_, i) => ({
      capa: {
        id: `arco-${i}`, type: 'line' as const, source: `arco_${i}`,
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
        paint: { 'line-opacity': 0, 'line-width': 3.6, 'line-blur': 0.6 },
      },
    })),
    {
      capa: {
        id: 'mediodias', type: 'circle', source: 'mediodias',
        paint: {
          'circle-radius': 1,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-width': 2.6,
          'circle-opacity': 0,
          'circle-stroke-opacity': 0,
        },
      },
    },
  ],
};

/** Ver la cabecera: por qué 22 y no 44 ni 61. */
export const INCLINACION_SOL = 22;

/** Ver la cabecera: la única pieza con el norte arriba. */
export const RUMBO_SOL = 0;

/**
 * Cuánto se acerca el encuadre, y es un número medido y no un gusto.
 *
 * La vista a sangre de las piezas aprobadas va con `acercar: 1`, que es un
 * nivel de zoom sobre el encuadre con aire, o sea la mitad de terreno en cada
 * eje. Acá no entra: el círculo del horizonte mide 1.514 m de radio —3.028 m de
 * diámetro sobre un bbox de 3.690 × 3.410 m—, así que con la vista a sangre se
 * le cortarían el amanecer y el atardecer de los tres arcos, que es justo
 * dónde se lee por qué lado del cielo pasa el sol.
 *
 * 0,55 es el número que deja el círculo entero con aire: `zoomQueEncuadra`
 * calcula para la SOMBRA GIRADA del rectángulo del predio —0,0399 grados de
 * alto contra los 0,0320 del rectángulo derecho—, así que con `acercar: 0` el
 * predio ocupa el 70 % del alto del cuadro y el círculo del horizonte el 62 %.
 * Subirlo 0,55 de zoom lo lleva a 1,46×: el alto visible queda en unos 3.330 m
 * contra los 3.028 del círculo, o sea un 10 % de aire. Con 0,7 el predio llenaba
 * mejor el cuadro pero el círculo quedaba en 3.011 m de alto visible contra
 * 3.028 de diámetro: la cuña del viento, que llega hasta el azimut 2°, salía
 * cortada contra el borde de arriba.
 */
const ACERCAR_SOL = 0.55;

export const SolYViento: React.FC = () => {
  const { contRef, width, height, frame } = usarMapaDelPredio({
    nombre: 'sol-y-viento',
    // La cámara se arma acá y no con `vistaASangre`, y la diferencia es un
    // número: esa función corre el blanco 351 m HACIA la cámara para subir el
    // predio al medio del cuadro cuando la inclinación es de 61°. A 22° ese
    // corrimiento no corrige nada —descentra—, y lo que esta pieza necesita
    // centrado no es el predio sino el CÉNIT, que es el centro del círculo de
    // la proyección y el punto contra el que se lee si el mediodía cae al
    // norte o al sur.
    camara: (_f, ancho, alto) => ({
      center: CENTRO,
      zoom: zoomQueEncuadra(ancho, alto) + ACERCAR_SOL,
      pitch: INCLINACION_SOL,
      bearing: RUMBO_SOL,
    }),
    fuentes: CAPAS_SOL.fuentes,
    capas: CAPAS_SOL.capas,
    pintar: (map, f) => {
      const op = (capa: string, prop: string, v: unknown) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);

      // El perímetro entra con el primer acto y se queda hasta el apagado: sin
      // él los tres actos son dibujos sobre un valle cualquiera.
      const marco = viva(f, 0, 26);
      op('predio', 'line-opacity', 0.8 * marco);
      map.setPaintProperty('predio', 'line-gradient',
        degradadoDeAvance(tramo(f, 0, 44), COLORES.crema) as maplibregl.ExpressionSpecification);

      // ── 01 · LOS ARCOS ──────────────────────────────────────────────────
      //
      // El horizonte y los cardinales abren el acto y acompañan también al
      // tercero: los dos hablan del mismo círculo —por dónde entra el sol y por
      // dónde entra el viento— y volver a dibujarlo en el acto 03 sería contar
      // dos veces la misma cosa.
      const cielo = viva(f, 8, 26);
      op('horizonte', 'line-opacity', 0.85 * cielo);
      op('brujula', 'circle-opacity', 0.9 * cielo);
      op('brujula', 'circle-stroke-opacity', 0.7 * cielo);

      // Las tres trayectorias se dibujan a la vez, del amanecer al atardecer, y
      // cada una lleva su cabeza encendida: `corriente` es el mismo recurso que
      // el agua bajando por las cadenas, acá sobre el recorrido del día. El
      // trazado tarda 148 cuadros —casi cinco segundos— y no 96: es el tiempo
      // que lleva leer el rótulo y seguir la cabeza del arco a la vez.
      const tArco = tramo(f, 22, 170);
      const vArco = solo(f, 22, 24, ACTO.arcos.hasta - 34, 34);
      SV.sol.arcos.forEach((a, i) => {
        op(`arco-${i}`, 'line-opacity', 0.95 * vArco);
        map.setPaintProperty(`arco-${i}`, 'line-gradient',
          corriente(tArco, a.color, LUZ, 0.05, Math.max(0.001, tArco)) as
            maplibregl.ExpressionSpecification);
      });

      // El mediodía de cada arco late una vez cuando el trazo ya llegó: es el
      // punto donde se ve que el de junio cae al NORTE del centro y los otros
      // dos al sur. El rótulo lo dice con palabras y el pulso lo señala.
      const vMedio = solo(f, 158, 18, ACTO.arcos.hasta - 34, 34);
      const uM = Math.max(0, Math.min(1, (f - 158) / 48));
      op('mediodias', 'circle-radius', 3 + 26 * uM);
      op('mediodias', 'circle-stroke-opacity', vMedio * (1 - uM) * (1 - uM));

      // ── 02 · LAS HORAS ──────────────────────────────────────────────────
      //
      // Primero el día largo y después el corto, los dos contra el MISMO techo
      // de color: así el corto se ve más oscuro, que es el dato. Cada mapa se
      // enciende de las celdas de sombra a las de sol recorriendo `n`, que es
      // la clase de horas normalizada.
      const porHoras = (base: number, t: number) => {
        const u = frente(t);
        return ['*', base,
          ['interpolate', ['linear'], ['get', 'n'], Math.max(-1, u - BANDA), 1, u, 0]];
      };
      const tLargo = tramo(f, 246, 336);
      // El día largo se va cuando entra el corto: los dos mapas pintan las
      // mismas celdas, así que superponerlos no compara nada, mezcla.
      const vLargo = solo(f, 246, 1, 352, 26);
      op('horas-verano', 'fill-opacity', porHoras(0.92 * vLargo, tLargo));

      const tCorto = tramo(f, 378, 468);
      const vCorto = solo(f, 378, 1, ACTO.horas.hasta - 14, 26);
      op('horas-invierno', 'fill-opacity', porHoras(0.92 * vCorto, tCorto));

      // ── 03 · EL VIENTO ──────────────────────────────────────────────────
      //
      // La envolvente primero —los doce sectores juntos, que es todo el
      // cuadrante por el que el viento entra en el año— y después el mes en
      // curso recorriéndolos de enero a diciembre. Los doce están medidos: el
      // promedio anual no se dibuja.
      const vTodos = viva(f, ACTO.viento.desde + 4, 26);
      op('sectores-todos', 'fill-opacity', 0.12 * vTodos);
      op('rumbos-todos', 'line-opacity', 0.38 * vTodos);

      // 108 cuadros para doce meses son nueve cuadros por mes, tres décimas de
      // segundo cada uno. Con los 75 de antes eran seis cuadros, y a esa
      // velocidad los doce rumbos se leían como un parpadeo y no como una
      // rotación.
      const tMes = tramo(f, 532, 640, Easing.linear);
      const mes = Math.min(MESES_VIENTO.length - 1, Math.floor(tMes * MESES_VIENTO.length));
      map.setFilter('sector-mes', ['==', ['get', 'i'], mes]);
      map.setFilter('rumbo-mes', ['==', ['get', 'i'], mes]);
      // El mes brillante se apaga cuando entra la cortina: lo que la cortina
      // tiene que dejar leer es su banda y su resguardo, no competir con una
      // cuña encendida del mismo color.
      const vMes = solo(f, 532, 16, 646, 28);
      op('sector-mes', 'fill-opacity', 0.3 * vMes);
      op('rumbo-mes', 'line-opacity', 0.95 * vMes);

      // Y la cortina: primero el resguardo —≈15 veces la altura, que acá son
      // 150 m y 36,26 ha—, después la banda de 8 m trazándose sobre su eje. La
      // banda es lo último que aparece y queda arriba: es la obra. Termina de
      // dibujarse en el cuadro 736 y se queda dos segundos quieta antes del
      // apagado, que es el tiempo que pedía la única cosa que esta pieza
      // propone construir.
      const vZona = viva(f, 650, 30);
      op('cortina-zona', 'fill-opacity', 0.22 * vZona);

      const vBanda = viva(f, 666, 24);
      const aBanda = tramo(f, 666, 736);
      op('cortina-banda', 'fill-opacity', 0.85 * vBanda);
      op('cortina-banda-borde', 'line-opacity', 0.9 * vBanda);
      op('cortina-eje-base', 'line-opacity', 0.8 * vBanda);
      op('cortina-eje', 'line-opacity', 0.95 * vBanda);
      for (const [capa, color] of [['cortina-eje-base', '#132b17'], ['cortina-eje', '#8FD39A']] as const) {
        map.setPaintProperty(capa, 'line-gradient',
          degradadoDeAvance(aBanda, color) as maplibregl.ExpressionSpecification);
      }
    },
  });

  const visibles = ROTULOS.map((r) => opacidadRotulo(frame, r));
  const velo = Math.max(...visibles);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
      {/* El velo y los rótulos no capturan el puntero: en el estudio de
          Remotion el mapa se arrastra para encuadrar, y una capa encima lo
          dejaría muerto. */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 300,
            background:
              'linear-gradient(to top, rgba(10,9,8,0.86) 0%, rgba(10,9,8,0.58) 34%, rgba(10,9,8,0) 100%)',
            opacity: velo,
          }}
        />
        {ROTULOS.map((r, i) => {
          const o = visibles[i] ?? 0;
          if (o <= 0.002) return null;
          return (
            <div
              key={`${r.acto}-${r.desde}`}
              style={{
                position: 'absolute', left: 58, bottom: 54, maxWidth: 740,
                opacity: o,
                // Doce píxeles de entrada: lo justo para que el rótulo se lea
                // como que llega y no como que se prende.
                transform: `translateY(${(1 - o) * 12}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.24em', color: AGUA_CLARA, marginBottom: 11,
                }}
              >
                {r.acto}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY, fontSize: 36, lineHeight: 1.04,
                  letterSpacing: '-0.02em', color: COLORES.crema, marginBottom: 11,
                }}
              >
                {r.titulo}
              </div>
              <div
                style={{
                  fontFamily: SANS, fontSize: 17, lineHeight: 1.46, fontWeight: 400,
                  color: 'rgba(245,240,232,0.80)',
                }}
              >
                {r.bajada}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
