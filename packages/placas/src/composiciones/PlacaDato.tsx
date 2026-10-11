import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES } from '../marca';
import { DISPLAY, SANS } from '../tipografia';

export const esquemaPlacaDato = z.object({
  valor: z.number(),
  unidad: z.string(),
  descripcion: z.string(),
  /**
   * De dónde sale el número. **No es opcional**: en este estudio un dato que se
   * muestra sin fuente es un dato que no se muestra. Mismo criterio que los
   * motores de cálculo de acequia.
   */
  fuente: z.string(),
  decimales: z.number().int().min(0).max(3).default(0),
});

/** Un número que cuenta hasta su valor, con la unidad y la fuente a la vista. */
export const PlacaDato: React.FC<z.infer<typeof esquemaPlacaDato>> = ({
  valor,
  unidad,
  descripcion,
  fuente,
  decimales,
}) => {
  const cuadro = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const avance = spring({ frame: cuadro, fps, config: { damping: 200, mass: 0.8 } });
  const actual = avance * valor;

  const opacidadPie = interpolate(cuadro, [24, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORES.tinta,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 28,
        padding: 96,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 180, color: COLORES.crema, lineHeight: 1 }}>
          {actual.toLocaleString('es-AR', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales,
          })}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 72, fontWeight: 500, color: COLORES.agua }}>{unidad}</span>
      </div>

      <p
        style={{
          fontFamily: SANS,
          fontSize: 38,
          color: COLORES.crema,
          margin: 0,
          maxWidth: width * 0.6,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {descripcion}
      </p>

      <p
        style={{
          fontFamily: SANS,
          fontSize: 20,
          color: `${COLORES.crema}88`,
          margin: 0,
          opacity: opacidadPie,
          letterSpacing: '0.04em',
        }}
      >
        Fuente: {fuente}
      </p>
    </AbsoluteFill>
  );
};
