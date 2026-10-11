import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { ALTO_BANDA, COLORES } from '../marca';
import { SANS } from '../tipografia';

/**
 * La banda del pie: una franja opaca abajo de todo, del alto justo para que el
 * metraje de la app quede limpio.
 *
 * Existe por dos razones que se dan la mano. La primera es de diseño: el guión
 * pide que cada capa muestre **su fuente al pie, en tipografía chica**, y eso
 * necesita un lugar fijo donde apoyarse en vez de flotar sobre la imagen.
 *
 * La segunda es que el metraje viene con la barra de Chrome que avisa que la
 * pantalla se está compartiendo, y esa barra cae **en el centro del cuadro**
 * (x 587–1341, y 960–1017 sobre 1920×1080). Recortarla obligaría a agrandar la
 * imagen y a perder el riel de herramientas de la izquierda y media columna del
 * panel de capas de la derecha. Taparla con una franja no pierde nada de la app
 * y de paso se lleva la atribución de Leaflet y la barra de estado.
 *
 * `BandaBase` es la franja sola, en PNG, para estirar debajo de todo el montaje.
 * `Fuente` es sólo el texto, en MOV con alfa, para apoyar encima: así la franja
 * no se dibuja dos veces ni se oscurece de más donde se superponen.
 */

/** La franja sola. Se renderiza como PNG y se estira toda la línea de tiempo. */
export const BandaBase: React.FC = () => {
  const { width, height } = useVideoConfig();
  const alto = ALTO_BANDA(width, height);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: alto,
          backgroundColor: COLORES.tinta,
        }}
      />
      {/* Un filo de agua arriba: separa la franja del metraje sin subrayarla. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: alto,
          height: 2,
          backgroundColor: COLORES.agua,
        }}
      />
    </AbsoluteFill>
  );
};

export const esquemaFuente = z.object({
  /** Qué capa se está viendo: "Relieve", "Clima", "Suelo". */
  capa: z.string(),
  /**
   * De dónde sale el dato, tal como lo cita la app. No es decorativo: es lo que
   * separa esto de una demo de software, y es lo que le habla al profesional.
   */
  fuente: z.string(),
});

/**
 * El pie de una capa: el nombre y su fuente, para apoyar sobre `BandaBase`.
 * Sale en MOV con alfa.
 */
export const Fuente: React.FC<z.infer<typeof esquemaFuente>> = ({ capa, fuente }) => {
  const cuadro = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const alto = ALTO_BANDA(width, height);
  const vertical = height > width;

  // Entra y sale con el corte, no antes: 8 cuadros de cada lado.
  const opacidad = Math.min(
    interpolate(cuadro, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(cuadro, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' }),
  );

  // Sube un poco al entrar. Poco: es un pie, no un titular.
  const subida = interpolate(cuadro, [0, 12], [10, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: vertical ? 48 : 72,
          bottom: 0,
          height: alto,
          display: 'flex',
          alignItems: 'center',
          gap: vertical ? 18 : 22,
          opacity: opacidad,
          transform: `translateY(${subida}px)`,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: vertical ? 34 : 26,
            fontWeight: 600,
            color: COLORES.agua,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {capa}
        </span>
        <span style={{ width: 1, height: vertical ? 30 : 24, backgroundColor: `${COLORES.crema}44` }} />
        <span
          style={{
            fontFamily: SANS,
            fontSize: vertical ? 32 : 24,
            fontWeight: 400,
            color: `${COLORES.crema}cc`,
          }}
        >
          {fuente}
        </span>
      </div>
    </AbsoluteFill>
  );
};
