/**
 * ENCARGO 04 · B — el trazado sobre la toma de la Ecoescuela Tay Pichín.
 *
 * Son los polígonos que se dibujan encima del cuadro del vértice, en
 * coordenadas RELATIVAS al cuadro (0 a 1 en cada eje), medidos sobre
 * `DJI_0010.MOV` en el segundo 19 —que es el instante más quieto de la toma,
 * medido: la diferencia media entre cuadros consecutivos cae a 2,76 ahí y vale
 * 4,3 un segundo antes y 4,5 un segundo después—.
 *
 * ── Esto NO sale de un motor de cálculo, y por eso se dice acá ─────────────
 *
 * Está trazado a mano sobre la imagen. Es legítimo porque **es exactamente el
 * acto que hace el usuario en la app**: los techos de `captacion.ts` no los
 * encuentra ningún algoritmo, los dibuja la persona sobre la ortofoto, y lo
 * mismo el perímetro de `MOJONES`. Lo que la app calcula a partir de eso es el
 * volumen, y ese cálculo **no se publica en esta pieza**: ver abajo.
 *
 * ── Por qué no hay número de litros ───────────────────────────────────────
 *
 * Porque no hay escala. El MOV tiene un solo flujo, sin pista de telemetría:
 * su único metadato espacial es `©xyz = -30.788000-64.640468-2.000`, y ese
 * −2,0 m no es la altura de vuelo —el predio está a unos 600 m sobre el mar y
 * la cámara estuvo subiendo cuarenta y siete segundos—. Las tres fotos fijas sí
 * traen `RelativeAltitude`, pero son de 8,5, 10,1 y 13,1 m: son tomas bajas de
 * la obra, no del vértice. Sin escala, un área trazada a ojo multiplicada por
 * una lluvia real da litros falsos con cara de medidos, que es justo lo que el
 * contrato prohíbe. Así que la pieza dibuja lo que la imagen sostiene y nada
 * más. El detalle completo de lo que se intentó está en el documento de la
 * entrega.
 *
 * ── Y por qué tampoco hay perímetro del predio ────────────────────────────
 *
 * Porque no se ve. En el cuadro del vértice no hay alambrado, ni camino
 * perimetral, ni cambio de cobertura que marque dónde termina la escuela: el
 * monte sigue igual en los cuatro bordes. Un polígono dibujado ahí sería un
 * dibujo, no una lectura, y el encargo lo dice con todas las letras: «sólo lo
 * que la imagen sostiene». Lo que sí tiene perímetro visible es cada techo, que
 * además es el perímetro que la app le pide al usuario para la captación.
 */

/** Un punto del trazado, relativo al cuadro: 0 a 1 en cada eje. */
export type PuntoRel = [number, number];

/** El marco sobre el que se midió, antes de normalizar. */
const ANCHO = 2000;
const ALTO = 1125;

const rel = (pts: Array<[number, number]>): PuntoRel[] =>
  pts.map(([x, y]) => [x / ANCHO, y / ALTO]);

export interface Techo {
  id: string;
  /** Qué es, para el documento. En la pieza no se escribe nada. */
  nota: string;
  /** El tipo de `captacion.ts` que le correspondería. Hoy no se usa para
   *  calcular: está para que el día que haya escala la cuenta ya tenga su
   *  coeficiente y no se elija a ojo en ese momento. */
  tipo: 'techo_metal' | 'techo_teja' | 'techo_paja' | 'techo_verde';
  anillo: PuntoRel[];
}

/**
 * Los techos, en el orden en que se dibujan.
 *
 * El orden no es decorativo: va del más alto al más bajo del cuadro y de
 * izquierda a derecha, que es como se recorre una imagen, y deja el techo de
 * chapa —el más grande y el único inequívocamente captante— para el final.
 *
 * El octágono de madera que se ve entre el techo verde y el oscuro NO entra: en
 * esta toma todavía es una estructura con los tirantes a la vista, sin
 * cubierta. Un techo que no existe no capta nada.
 */
export const TECHOS: Techo[] = [
  {
    id: 'verde',
    nota: 'Techo plano cubierto de vegetación, al norte del conjunto.',
    tipo: 'techo_verde',
    anillo: rel([[815, 188], [1032, 230], [990, 425], [838, 398]]),
  },
  {
    id: 'oscuro',
    nota: 'Techo oscuro de dos aguas sobre muro de piedra, con canaleta visible '
      + 'en el borde oeste y un bajante que sale hacia el sur.',
    tipo: 'techo_metal',
    anillo: rel([[1655, 250], [1835, 245], [1842, 465], [1662, 470]]),
  },
  {
    id: 'mandala',
    nota: 'Techo plano con un mosaico de piedra formando un mandala.',
    tipo: 'techo_teja',
    anillo: rel([[702, 575], [843, 597], [820, 758], [690, 736]]),
  },
  {
    id: 'palapa',
    nota: 'Quincho de paja, planta redondeada con una cumbrera corta.',
    tipo: 'techo_paja',
    anillo: rel([
      [1355, 552], [1443, 581], [1461, 647], [1417, 703],
      [1348, 722], [1282, 703], [1252, 647], [1272, 583],
    ]),
  },
  {
    id: 'chapa',
    nota: 'El techo de chapa grande, el más extenso del conjunto y el único '
      + 'inequívocamente captante.',
    tipo: 'techo_metal',
    anillo: rel([
      [968, 795], [1012, 792], [1014, 818], [1100, 832], [1122, 884],
      [1112, 908], [1078, 952], [1050, 1042], [1000, 1040], [964, 1000],
      [940, 988], [938, 898], [956, 858],
    ]),
  },
];

/**
 * El espejo de agua: la misma cisterna del primer cuadro, vista desde arriba.
 *
 * Se la reconoce por el deck de madera con su borde de piedras, que es el mismo
 * que se ve en el arranque de la toma y en `DJI_0002.JPG` del 12/03/2025. La
 * superficie está cubierta de plantas flotantes —es una biopiscina—, así que lo
 * que se marca es el espejo vegetado, no un espejo de agua libre.
 */
export const AGUA: PuntoRel[] = rel([
  [916, 506], [968, 486], [1016, 500], [1030, 548],
  [1012, 600], [964, 622], [922, 604], [906, 552],
]);

/**
 * El deck de madera al borde del espejo.
 *
 * Se dibuja porque es lo que ATA este cuadro con el primero: es el objeto que
 * aparece en los dos, y el que permitiría medir la escala el día que alguien le
 * pase una cinta. Hoy es lo único de la pieza que sirve de referencia y no
 * tiene medida.
 */
export const DECK: PuntoRel[] = rel([
  [968, 616], [1022, 628], [1008, 688], [952, 676],
]);
