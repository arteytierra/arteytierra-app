import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { ALTO_BANDA, COLORES } from '../marca';
import { DISPLAY } from '../tipografia';

export const esquemaTitular = z.object({
  texto: z.string(),
  /**
   * Dónde se apoya en el cuadro. El metraje de acequia tiene el panel a la
   * izquierda y el mapa a la derecha, así que un titular centrado siempre cae
   * sobre algo que se quiere ver. `derecha` es el lugar por defecto: el mapa
   * aguanta texto encima mucho mejor que un panel lleno de números.
   */
  anclaje: z.enum(['derecha', 'izquierda', 'centro']).default('derecha'),
  /** Un segundo renglón que entra después, para los pares del guión. */
  segundo: z.string().default(''),
});

/**
 * Los textos en pantalla del guión: "Un terreno cualquiera", "acequia los
 * cruza", "Dónde va el agua".
 *
 * Sale en MOV con alfa, para apoyar sobre el metraje. Lleva un velo detrás
 * porque sobre imagen satelital el texto claro se pierde: el velo es un
 * degradado, no un rectángulo, así que se nota que hay algo abajo y no parece
 * un cartel pegado.
 */
export const Titular: React.FC<z.infer<typeof esquemaTitular>> = ({ texto, anclaje, segundo }) => {
  const cuadro = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const vertical = height > width;
  const banda = ALTO_BANDA(width, height);

  const entrada = spring({ frame: cuadro, fps, config: { damping: 200, mass: 0.6 } });
  const salida = interpolate(cuadro, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
  });
  const opacidad = entrada * salida;

  // El segundo renglón entra 14 cuadros después: es una respuesta, no un eco.
  const segundoAvance = spring({ frame: cuadro - 14, fps, config: { damping: 200, mass: 0.6 } });

  const alineacion = anclaje === 'centro' ? 'center' : anclaje === 'izquierda' ? 'flex-start' : 'flex-end';
  const tamano = vertical ? 76 : 64;

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      {/* El velo. Va en diagonal hacia la esquina donde se apoya el texto y no
          recto hacia arriba: si fuera recto oscurecería también el panel del
          otro lado, que es claro, está lleno de números y es lo que se quiere
          leer. Con la diagonal el velo cae donde hay texto y en ningún lado
          más. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: banda,
          height: vertical ? height * 0.42 : height * 0.55,
          background:
            anclaje === 'centro'
              ? `linear-gradient(to top, ${COLORES.tinta}cc 0%, ${COLORES.tinta}66 45%, transparent 100%)`
              : `linear-gradient(to top ${anclaje === 'derecha' ? 'left' : 'right'}, ${COLORES.tinta}dd 0%, ${COLORES.tinta}77 38%, transparent 72%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: vertical ? 56 : 96,
          right: vertical ? 56 : 96,
          bottom: banda + (vertical ? 80 : 64),
          display: 'flex',
          flexDirection: 'column',
          alignItems: alineacion,
          gap: vertical ? 14 : 10,
        }}
      >
        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: tamano,
            fontWeight: 600,
            color: COLORES.crema,
            margin: 0,
            lineHeight: 1.15,
            textAlign: anclaje === 'izquierda' ? 'left' : anclaje === 'centro' ? 'center' : 'right',
            maxWidth: vertical ? '100%' : width * 0.52,
            transform: `translateY(${interpolate(entrada, [0, 1], [22, 0])}px)`,
          }}
        >
          {texto}
        </p>

        {segundo !== '' && (
          <p
            style={{
              fontFamily: DISPLAY,
              fontSize: tamano,
              fontWeight: 600,
              color: COLORES.agua,
              margin: 0,
              lineHeight: 1.15,
              textAlign: anclaje === 'izquierda' ? 'left' : anclaje === 'centro' ? 'center' : 'right',
              maxWidth: vertical ? '100%' : width * 0.52,
              opacity: segundoAvance,
              transform: `translateY(${interpolate(segundoAvance, [0, 1], [22, 0])}px)`,
            }}
          >
            {segundo}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
