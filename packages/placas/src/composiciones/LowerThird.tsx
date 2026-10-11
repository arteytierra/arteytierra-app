import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES, LOGOS } from '../marca';
import { SANS } from '../tipografia';

export const esquemaLowerThird = z.object({
  nombre: z.string(),
  rol: z.string(),
});

/**
 * Placa de identificación. Se renderiza con **canal alfa** para superponerla en
 * CapCut sobre el metraje:
 *
 *   pnpm --filter @arteytierra/placas render LowerThird lower.mov \
 *     --codec=prores --prores-profile=4444
 *
 * En h264 sale con fondo negro, que no es lo que se quiere.
 */
export const LowerThird: React.FC<z.infer<typeof esquemaLowerThird>> = ({ nombre, rol }) => {
  const cuadro = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entra = spring({ frame: cuadro, fps, config: { damping: 200 } });
  // Sale sola 20 cuadros antes del final: la placa no se queda pegada.
  const sale = spring({ frame: cuadro - (durationInFrames - 20), fps, config: { damping: 200 } });
  const presencia = entra - sale;

  const desplazamiento = interpolate(presencia, [0, 1], [-60, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', paddingLeft: 96, paddingBottom: 120 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          alignSelf: 'flex-start',
          backgroundColor: COLORES.crema,
          borderLeft: `6px solid ${COLORES.agua}`,
          padding: '20px 36px 20px 28px',
          opacity: presencia,
          transform: `translateX(${desplazamiento}px)`,
        }}
      >
        <Img src={staticFile(LOGOS.firma)} style={{ height: 46 }} />
        <div style={{ width: 1, height: 52, backgroundColor: `${COLORES.tinta}22` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, color: COLORES.tinta, lineHeight: 1.1 }}>
            {nombre}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 19,
              fontWeight: 500,
              color: COLORES.agua,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {rol}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
