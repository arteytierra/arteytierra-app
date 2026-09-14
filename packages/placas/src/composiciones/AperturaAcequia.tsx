import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES, LOGOS } from '../marca';
import { DISPLAY } from '../tipografia';

export const esquemaApertura = z.object({
  bajada: z.string(),
});

/**
 * Apertura de marca: el lockup entra, y una línea de agua se dibuja por debajo.
 *
 * Va sobre fondo **crema**, no sobre el negro profundo: el paquete de marca no
 * tiene un lockup blanco rasterizado, y el wordmark no se puede dibujar con
 * texto (depende de Century Gothic). Ver `src/marca.ts`.
 */
export const AperturaAcequia: React.FC<z.infer<typeof esquemaApertura>> = ({ bajada }) => {
  const cuadro = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  // `spring` da la curva del sitio: entra con cuerpo y frena sin rebotar.
  const entrada = spring({ frame: cuadro, fps, config: { damping: 200 } });
  const escala = interpolate(entrada, [0, 1], [0.94, 1]);

  // La línea de agua se dibuja después del logo, de izquierda a derecha.
  const linea = spring({ frame: cuadro - 12, fps, config: { damping: 200 } });

  // La bajada aparece al final, sin movimiento: acompaña, no compite.
  const opacidadBajada = interpolate(cuadro, [30, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORES.crema,
        justifyContent: 'center',
        alignItems: 'center',
        gap: vertical ? 48 : 32,
      }}
    >
      <Img
        src={staticFile(LOGOS.color)}
        style={{
          width: vertical ? width * 0.68 : width * 0.34,
          opacity: entrada,
          transform: `scale(${escala})`,
        }}
      />

      <div
        style={{
          width: (vertical ? width * 0.68 : width * 0.34) * linea,
          height: 3,
          backgroundColor: COLORES.agua,
        }}
      />

      <p
        style={{
          fontFamily: DISPLAY,
          fontSize: vertical ? 42 : 34,
          color: COLORES.tinta,
          opacity: opacidadBajada,
          margin: 0,
          maxWidth: vertical ? width * 0.8 : width * 0.45,
          textAlign: 'center',
          lineHeight: 1.35,
        }}
      >
        {bajada}
      </p>
    </AbsoluteFill>
  );
};
