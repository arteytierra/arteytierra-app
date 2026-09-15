import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES, LOGOS } from '../marca';
import { DISPLAY } from '../tipografia';

/** Qué lockup usa cada fondo. */
const LOCKUP = {
  crema: LOGOS.color,
  oscuro: LOGOS.blanco,
  'oscuro-azul': LOGOS.azulCrema,
} as const;

export const esquemaApertura = z.object({
  bajada: z.string(),
  /**
   * Cada fondo trae su propia variante del lockup, porque el lockup **no se
   * recolorea**: se cambia por la que corresponde.
   *
   * - `crema`: el lockup de color, isotipo azul y wordmark en negro profundo.
   * - `oscuro`: el lockup blanco del paquete v1.
   * - `oscuro-azul`: isotipo en azul agua y wordmark en crema. El azul sobre el
   *   negro profundo tiene poco contraste para texto, así que el wordmark va
   *   claro y el azul queda en el símbolo, que es donde está en el original.
   */
  fondo: z.enum(['crema', 'oscuro', 'oscuro-azul']).default('crema'),
});

/** Apertura de marca: el lockup entra, y una línea de agua se dibuja por debajo. */
export const AperturaAcequia: React.FC<z.infer<typeof esquemaApertura>> = ({ bajada, fondo }) => {
  const cuadro = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const oscuro = fondo !== 'crema';

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

  const anchoLogo = vertical ? width * 0.68 : width * 0.34;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: oscuro ? COLORES.tinta : COLORES.crema,
        justifyContent: 'center',
        alignItems: 'center',
        gap: vertical ? 48 : 32,
      }}
    >
      <Img
        src={staticFile(LOCKUP[fondo])}
        style={{ width: anchoLogo, opacity: entrada, transform: `scale(${escala})` }}
      />

      <div style={{ width: anchoLogo * linea, height: 3, backgroundColor: COLORES.agua }} />

      <p
        style={{
          fontFamily: DISPLAY,
          fontSize: vertical ? 42 : 34,
          color: oscuro ? COLORES.crema : COLORES.tinta,
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
