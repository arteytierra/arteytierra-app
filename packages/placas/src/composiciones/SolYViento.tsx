/**
 * ENCARGO 04 · A — «Lo que no se ve»: el sol y el viento. Dieciocho segundos,
 * en bucle.
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
 * ── Por qué el primer y el último cuadro son idénticos ─────────────────────
 *
 * Por lo mismo que en la secuencia de la mesa: la cámara está QUIETA y las dos
 * puntas son el mismo estado —la ortofoto sin una sola línea—. Donde nada se
 * mueve, periódico e idéntico son la misma cosa. El apagado termina en el
 * cuadro 528 y los once que quedan son el cuadro 0, así que el bucle cierra al
 * pie de la letra sin pagar el tirón de dos cuadros repetidos en una pieza que
 * sí se mueve.
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
 * · **Ni un rótulo, ni un crédito, ni una interfaz.** Las tres trayectorias se
 *   distinguen por el color que les pone la app. Qué es cada una lo dice la
 *   página.
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
import {
  GEO_ARCOS, GEO_BRUJULA, GEO_CORTINA_BANDA, GEO_CORTINA_EJE, GEO_CORTINA_ZONA,
  GEO_HORAS, GEO_HORIZONTE, GEO_MEDIODIAS, GEO_RUMBOS, GEO_SECTORES, MESES_VIENTO, SV,
} from './predio/sol';
import { CENTRO } from './predio/datos';
import {
  type CapaExtra, corriente, degradadoDeAvance, usarMapaDelPredio, zoomQueEncuadra,
} from './predio/mapa';

/** Dieciocho segundos a 30 fps. */
export const CUADROS_SOL = 540;

/**
 * Los tres actos y el apagado, en cuadros. `apaga.hasta` es el cuadro en que
 * ya no queda nada encendido: de ahí al 539 no se mueve nada, que es lo que
 * hace que el último cuadro sea el 0.
 */
const ACTO = {
  arcos:  { desde: 0,   hasta: 150 },
  horas:  { desde: 150, hasta: 300 },
  viento: { desde: 300, hasta: 450 },
  apaga:  { desde: 450, hasta: 528 },
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
  const { contRef, width, height } = usarMapaDelPredio({
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
    pintar: (map, frame) => {
      const op = (capa: string, prop: string, v: unknown) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);

      // El perímetro entra con el primer acto y se queda hasta el apagado: sin
      // él los tres actos son dibujos sobre un valle cualquiera.
      const marco = viva(frame, 0, 24);
      op('predio', 'line-opacity', 0.8 * marco);
      map.setPaintProperty('predio', 'line-gradient',
        degradadoDeAvance(tramo(frame, 0, 40), COLORES.crema) as maplibregl.ExpressionSpecification);

      // ── 01 · LOS ARCOS ──────────────────────────────────────────────────
      //
      // El horizonte y los cardinales abren el acto y acompañan también al
      // tercero: los dos hablan del mismo círculo —por dónde entra el sol y por
      // dónde entra el viento— y volver a dibujarlo en el acto 03 sería contar
      // dos veces la misma cosa.
      const cielo = viva(frame, 6, 22);
      op('horizonte', 'line-opacity', 0.85 * cielo);
      op('brujula', 'circle-opacity', 0.9 * cielo);
      op('brujula', 'circle-stroke-opacity', 0.7 * cielo);

      // Las tres trayectorias se dibujan a la vez, del amanecer al atardecer, y
      // cada una lleva su cabeza encendida: `corriente` es el mismo recurso que
      // el agua bajando por las cadenas, acá sobre el recorrido del día.
      const tArco = tramo(frame, 14, 110);
      const vArco = solo(frame, 14, 20, ACTO.arcos.hasta - 10, 30);
      SV.sol.arcos.forEach((a, i) => {
        op(`arco-${i}`, 'line-opacity', 0.95 * vArco);
        map.setPaintProperty(`arco-${i}`, 'line-gradient',
          corriente(tArco, a.color, LUZ, 0.05, Math.max(0.001, tArco)) as
            maplibregl.ExpressionSpecification);
      });

      // El mediodía de cada arco late una vez cuando el trazo ya llegó: es el
      // punto donde se ve que el de junio cae al NORTE del centro y los otros
      // dos al sur. Un pulso lo señala sin escribir nada.
      const vMedio = solo(frame, 104, 16, ACTO.arcos.hasta - 10, 30);
      const uM = Math.max(0, Math.min(1, (frame - 104) / 34));
      op('mediodias', 'circle-radius', 3 + 26 * uM);
      op('mediodias', 'circle-stroke-opacity', vMedio * (1 - uM) * (1 - uM));

      // ── 02 · LAS HORAS ──────────────────────────────────────────────────
      //
      // Primero el día largo y después el corto, los dos contra el MISMO techo
      // de color: así el corto se ve más oscuro, que es el dato. Cada mapa se
      // enciende de las celdas de sombra a las de sol recorriendo `n`, que es
      // la clase de horas normalizada.
      const porHoras = (base: number, t: number) => {
        const f = frente(t);
        return ['*', base,
          ['interpolate', ['linear'], ['get', 'n'], Math.max(-1, f - BANDA), 1, f, 0]];
      };
      const tLargo = tramo(frame, ACTO.horas.desde + 4, ACTO.horas.desde + 64);
      // El día largo se va cuando entra el corto: los dos mapas pintan las
      // mismas celdas, así que superponerlos no compara nada, mezcla.
      const vLargo = solo(frame, ACTO.horas.desde + 4, 1, ACTO.horas.desde + 84, 26);
      op('horas-verano', 'fill-opacity', porHoras(0.92 * vLargo, tLargo));

      const tCorto = tramo(frame, ACTO.horas.desde + 92, ACTO.horas.desde + 136);
      const vCorto = solo(frame, ACTO.horas.desde + 92, 1, ACTO.horas.hasta - 6, 26);
      op('horas-invierno', 'fill-opacity', porHoras(0.92 * vCorto, tCorto));

      // ── 03 · EL VIENTO ──────────────────────────────────────────────────
      //
      // La envolvente primero —los doce sectores juntos, que es todo el
      // cuadrante por el que el viento entra en el año— y después el mes en
      // curso recorriéndolos de enero a diciembre. Los doce están medidos: el
      // promedio anual no se dibuja.
      const vTodos = viva(frame, ACTO.viento.desde + 2, 22);
      op('sectores-todos', 'fill-opacity', 0.12 * vTodos);
      op('rumbos-todos', 'line-opacity', 0.38 * vTodos);

      const tMes = tramo(frame, ACTO.viento.desde + 14, ACTO.viento.desde + 89, Easing.linear);
      const mes = Math.min(MESES_VIENTO.length - 1, Math.floor(tMes * MESES_VIENTO.length));
      map.setFilter('sector-mes', ['==', ['get', 'i'], mes]);
      map.setFilter('rumbo-mes', ['==', ['get', 'i'], mes]);
      // El mes brillante se apaga cuando entra la cortina: lo que la cortina
      // tiene que dejar leer es su banda y su resguardo, no competir con una
      // cuña encendida del mismo color.
      const vMes = solo(frame, ACTO.viento.desde + 14, 14, ACTO.viento.desde + 96, 24);
      op('sector-mes', 'fill-opacity', 0.3 * vMes);
      op('rumbo-mes', 'line-opacity', 0.95 * vMes);

      // Y la cortina: primero el resguardo —≈15 veces la altura, que acá son
      // 150 m y 36,26 ha—, después la banda de 8 m trazándose sobre su eje. La
      // banda es lo último que aparece y queda arriba: es la obra.
      const vZona = viva(frame, ACTO.viento.desde + 100, 26);
      op('cortina-zona', 'fill-opacity', 0.22 * vZona);

      const vBanda = viva(frame, ACTO.viento.desde + 112, 20);
      const aBanda = tramo(frame, ACTO.viento.desde + 112, ACTO.viento.desde + 146);
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

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
