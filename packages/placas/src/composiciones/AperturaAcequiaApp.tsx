import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES, LOGOS } from '../marca';
import { DISPLAY } from '../tipografia';

export const esquemaAperturaApp = z.object({
  bajada: z.string(),
  fondo: z.enum(['crema', 'oscuro']).default('oscuro'),
});

/**
 * Fracción del ancho del wordmark "acequia.app" donde termina "acequia".
 *
 * No es un valor a ojo: se midió sobre el PNG generado contando la última
 * columna con píxeles opacos de "acequia" (x=1354) contra la de "acequia.app"
 * (x=2096), los dos escritos desde el mismo origen y con la misma métrica.
 * 1297 px de 2039. Si alguna vez se regenera el wordmark, hay que volver a
 * medirlo.
 */
const FIN_DE_ACEQUIA = 0.6361;

/** Proporción del PNG del wordmark, para reservarle el alto sin deformarlo. */
const RELACION_WORDMARK = 2039 / 310;

/**
 * Apertura vertical del dominio: el isotipo arriba, el wordmark, la línea de
 * agua, la bajada — y al final aparece `.app`.
 *
 * El truco del `.app` está en no dibujarlo aparte. Se muestra siempre el PNG
 * completo de "acequia.app" y se lo recorta a la altura donde termina
 * "acequia"; revelar es correr ese recorte. Así el kerning entre la última "a"
 * y el punto es el que puso la tipografía, y "acequia" no se mueve un píxel
 * cuando aparece el resto.
 *
 * El corrimiento hacia la izquierda es sólo del contenedor, para que
 * "acequia.app" termine centrado igual que estaba "acequia".
 */
export const AperturaAcequiaApp: React.FC<z.infer<typeof esquemaAperturaApp>> = ({ bajada, fondo }) => {
  const cuadro = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const oscuro = fondo === 'oscuro';

  const anchoWordmark = vertical ? width * 0.62 : width * 0.3;
  const anchoAcequia = anchoWordmark * FIN_DE_ACEQUIA;

  // 1. el isotipo baja y se asienta
  const isotipo = spring({ frame: cuadro, fps, config: { damping: 200 } });
  // 2. el wordmark aparece debajo
  const wordmark = spring({ frame: cuadro - 10, fps, config: { damping: 200 } });
  // 3. la línea de agua se dibuja
  const linea = spring({ frame: cuadro - 22, fps, config: { damping: 200 } });
  // 4. la bajada acompaña, sin movimiento
  const opacidadBajada = interpolate(cuadro, [34, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 5. y recién al final, el dominio. Un toque de rebote: es el remate.
  const revelado = spring({ frame: cuadro - 70, fps, config: { damping: 14, mass: 0.7 } });
  const anchoVisible = interpolate(revelado, [0, 1], [anchoAcequia, anchoWordmark]);

  const colorTexto = oscuro ? COLORES.crema : COLORES.tinta;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: oscuro ? COLORES.tinta : COLORES.crema,
        justifyContent: 'center',
        alignItems: 'center',
        gap: vertical ? 40 : 28,
      }}
    >
      <Img
        src={staticFile(oscuro ? LOGOS.isotipoBlanco : LOGOS.isotipoColor)}
        style={{
          width: vertical ? width * 0.26 : width * 0.11,
          opacity: isotipo,
          transform: `translateY(${interpolate(isotipo, [0, 1], [-28, 0])}px)`,
        }}
      />

      {/* El contenedor está centrado por el flex y es el que crece: con eso
          solo, "acequia" queda centrado antes y "acequia.app" después, sin
          compensar nada a mano. */}
      <div
        style={{
          width: anchoVisible,
          height: anchoWordmark / RELACION_WORDMARK,
          overflow: 'hidden',
          opacity: wordmark,
        }}
      >
        <Img
          src={staticFile(oscuro ? LOGOS.wordmarkAppBlanco : LOGOS.wordmarkAppTinta)}
          style={{ width: anchoWordmark, maxWidth: 'none', display: 'block' }}
        />
      </div>

      {/* La línea acompaña el ancho del texto, así que se estira con el .app */}
      <div style={{ width: anchoVisible * linea, height: 3, backgroundColor: COLORES.agua }} />

      <p
        style={{
          fontFamily: DISPLAY,
          fontSize: vertical ? 38 : 30,
          color: colorTexto,
          opacity: opacidadBajada,
          margin: 0,
          maxWidth: vertical ? width * 0.82 : width * 0.44,
          textAlign: 'center',
          lineHeight: 1.35,
        }}
      >
        {bajada}
      </p>
    </AbsoluteFill>
  );
};
