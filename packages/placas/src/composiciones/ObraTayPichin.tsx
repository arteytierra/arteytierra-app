/**
 * ENCARGO 04 · B — «De la hoja al predio»: la obra que existe.
 *
 * Esta composición **no es la pieza**: es sólo la capa de líneas, con fondo
 * transparente. La pieza la arma `scripts/obra.mjs`, que corrige el color de
 * `DJI_0010.MOV`, le pega esta capa encima en los cuadros del vértice y
 * codifica los dos formatos. La división es la de siempre: FFmpeg hace lo
 * mecánico con el metraje, Remotion dibuja.
 *
 * Catorce segundos a 30 fps, repartidos así:
 *
 *   0,0 – 5,0 s   la subida, sin una sola línea encima
 *   5,0 – 10,5 s  la cámara queda quieta y se dibuja la lectura
 *  10,5 – 14,0 s  las líneas se apagan y la cámara vuelve a bajar al agua
 *
 * ── Qué se dibuja, y por qué eso y no más ─────────────────────────────────
 *
 * El perímetro de cada techo, el espejo de la cisterna y el deck que la ata con
 * el primer cuadro. No hay perímetro del predio —no se ve ninguno— ni recorrido
 * del agua de los techos a la cisterna —no hay canaleta ni conducto que se
 * pueda seguir de punta a punta en esta toma— ni número de litros —no hay
 * escala—. Las tres ausencias son la misma regla del encargo: sólo lo que la
 * imagen sostiene. Están explicadas una por una en la cabecera de
 * `obra/trazado.ts`.
 *
 * Y nada de curvas de nivel, shader de cota ni escorrentías: en el vértice el
 * cuadro abarca unas decenas de metros y un modelo global de 30 m ahí son tres
 * datos cruzando la pantalla.
 */
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORES } from '../marca';
import { AGUA, DECK, TECHOS, type PuntoRel } from './obra/trazado';

/** Catorce segundos a 30 fps. */
export const CUADROS_OBRA = 420;

/** El tramo en que la cámara está quieta y se dibuja encima. */
const LECTURA = { desde: 150, hasta: 300 };
const APAGA = { desde: 300, hasta: 322 };

const SUAVE = Easing.bezier(0.33, 0, 0.2, 1);

function tramo(f: number, desde: number, hasta: number, easing = SUAVE) {
  return interpolate(f, [desde, hasta], [0, 1], {
    easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

/** Lo que queda encendido: entra en su momento y se apaga con todo al final. */
const viva = (f: number, desde: number, dura: number) =>
  tramo(f, desde, desde + dura) * (1 - tramo(f, APAGA.desde, APAGA.hasta));

/** El perímetro de un anillo en píxeles, para el dibujado progresivo. */
function largo(anillo: PuntoRel[], w: number, h: number): number {
  let d = 0;
  for (let i = 0; i < anillo.length; i++) {
    const a = anillo[i]!, b = anillo[(i + 1) % anillo.length]!;
    d += Math.hypot((b[0] - a[0]) * w, (b[1] - a[1]) * h);
  }
  return d;
}

const puntos = (anillo: PuntoRel[], w: number, h: number) =>
  anillo.map(([x, y]) => `${(x * w).toFixed(1)},${(y * h).toFixed(1)}`).join(' ');

/**
 * Un anillo que se dibuja solo.
 *
 * El recurso es `stroke-dasharray` del largo entero con el `dashoffset`
 * corriendo de ese largo a cero: el trazo aparece desde el primer vértice y
 * avanza por el contorno. Es el equivalente en SVG del `line-gradient` por
 * avance que usan las piezas de mapa, y hace lo mismo: dibuja en vez de
 * encender.
 */
const Anillo: React.FC<{
  anillo: PuntoRel[]; w: number; h: number;
  avance: number; opacidad: number; relleno: number;
  color: string; grosor: number;
}> = ({ anillo, w, h, avance, opacidad, relleno, color, grosor }) => {
  const L = largo(anillo, w, h);
  const pts = puntos(anillo, w, h);
  return (
    <>
      {relleno > 0 && (
        <polygon points={pts} fill={color} fillOpacity={relleno} stroke="none" />
      )}
      <polygon
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeOpacity={opacidad}
        strokeLinejoin="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - avance)}
      />
    </>
  );
};

export const ObraTayPichin: React.FC<{ frame: number; ancho: number; alto: number }> = ({
  frame, ancho, alto,
}) => {
  // Los techos se dibujan uno tras otro, con dieciséis cuadros de diferencia:
  // medio segundo entre uno y el siguiente es lo que hace que se lean como
  // cinco decisiones y no como una capa que se prende.
  const PASO = 16;
  const DIBUJA = 26;

  // El relleno entra DESPUÉS de los cinco contornos y no con cada uno: lo que
  // la captación necesita no son cinco líneas sino cinco superficies, y que
  // pasen de una cosa a la otra todas juntas es lo que lo dice.
  const relleno = viva(frame, LECTURA.desde + PASO * TECHOS.length + DIBUJA, 24);

  // El espejo y el deck cierran el círculo: es la misma agua del primer cuadro,
  // vista desde arriba.
  const tAgua = tramo(frame, LECTURA.desde + 118, LECTURA.desde + 150);
  const vAgua = viva(frame, LECTURA.desde + 118, 26);
  const vDeck = viva(frame, LECTURA.desde + 132, 20);

  return (
    <AbsoluteFill>
      <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`}>
        {TECHOS.map((t, i) => {
          const desde = LECTURA.desde + i * PASO;
          return (
            <Anillo
              key={t.id}
              anillo={t.anillo} w={ancho} h={alto}
              avance={tramo(frame, desde, desde + DIBUJA)}
              opacidad={viva(frame, desde, 6) * 0.95}
              relleno={relleno * 0.22}
              color={COLORES.crema}
              grosor={2.4}
            />
          );
        })}

        <Anillo
          anillo={AGUA} w={ancho} h={alto}
          avance={tAgua} opacidad={vAgua * 0.95} relleno={vAgua * 0.3}
          color="#7CC2E3" grosor={2.6}
        />
        <Anillo
          anillo={DECK} w={ancho} h={alto}
          avance={tramo(frame, LECTURA.desde + 132, LECTURA.desde + 152)}
          opacidad={vDeck * 0.8} relleno={0}
          color="#E8D9A8" grosor={1.8}
        />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * La composición que se renderiza con alfa. El cuadro lo pone el metraje.
 *
 * El cuerpo de arriba toma el cuadro por propiedad y no del contexto a
 * propósito: así el mismo dibujo se puede renderizar como cuadro suelto para
 * comprobar el calce del trazado encima de la foto, que es como se verificó.
 */
export const CapaObra: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return <ObraTayPichin frame={frame} ancho={width} alto={height} />;
};
