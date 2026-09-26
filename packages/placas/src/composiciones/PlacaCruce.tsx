import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

import { COLORES } from '../marca';
import { DISPLAY, SANS } from '../tipografia';

/**
 * El cruce: las cuatro capas colapsando sobre una fórmula, y la fórmula
 * resolviéndose en un número que sube contando.
 *
 * Es el pico del video y el único argumento que no copia nadie: los datos
 * abiertos los baja cualquiera, cruzarlos es otra cosa. Por eso el trabajo fino
 * va acá.
 *
 * **Todos los números son props y todos salen de una corrida real de acequia**
 * sobre el predio que se filmó (Cwa, Tucumán, 31,15 ha, cuenca de aporte de
 * 282 ha). No hay ninguno inventado ni redondeado "para que quede lindo": el
 * mismo criterio que rige los motores de cálculo rige lo que se muestra.
 *
 * Ojo con una distinción que es fácil de pisar y sería un error caro: el
 * volumen escurrido es el de **la cuenca de aporte**, no el del predio. Son 282
 * ha contra 31. Decir "mi terreno tira 180 millones de litros" sería falso, y
 * el pie de la placa está para que no se pueda leer así.
 */

export const esquemaCruce = z.object({
  /** Lámina de la tormenta de diseño, en mm. */
  lluviaMm: z.number(),
  /** Período de retorno de esa tormenta, para nombrarla sin ambigüedad. */
  tormenta: z.string(),
  /** Textura y grupo hidrológico, tal como los nombra la app. */
  suelo: z.string(),
  /** Pendiente media del predio, en porcentaje. */
  pendientePct: z.number(),
  /** Cobertura dominante. */
  cobertura: z.string(),
  /** La curva número compuesta que sale del cruce. */
  cn: z.number(),
  /** Lámina que escurre, en mm. */
  escurreMm: z.number(),
  /** Qué fracción de lo que cae se va por la superficie, en porcentaje. */
  escurrePct: z.number(),
  /** Volumen escurrido, en m³, sobre la cuenca de aporte. */
  volumenM3: z.number(),
  /** Superficie de la cuenca de aporte, en hectáreas. */
  cuencaHa: z.number(),
});

/** Los cuatro ingredientes, en el orden en que los nombra el guión. */
const ENTRADAS = ['lluvia', 'suelo', 'pendiente', 'cobertura'] as const;

export const PlacaCruce: React.FC<z.infer<typeof esquemaCruce>> = ({
  lluviaMm,
  tormenta,
  suelo,
  pendientePct,
  cobertura,
  cn,
  escurreMm,
  escurrePct,
  volumenM3,
  cuencaHa,
}) => {
  const cuadro = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  const valores: Record<(typeof ENTRADAS)[number], string> = {
    lluvia: `${lluviaMm.toLocaleString('es-AR', { minimumFractionDigits: 1 })} mm`,
    suelo,
    pendiente: `${pendientePct.toLocaleString('es-AR', { minimumFractionDigits: 1 })} %`,
    cobertura,
  };

  // ── 1. Las cuatro entran de a una ──────────────────────────────────────────
  const entrada = (i: number) => spring({ frame: cuadro - i * 12, fps, config: { damping: 200 } });

  // ── 2. Colapsan: se juntan y se apagan ─────────────────────────────────────
  const colapso = spring({ frame: cuadro - 78, fps, config: { damping: 200, mass: 0.9 } });

  // ── 3. La curva número, que es el cruce hecho un solo número ───────────────
  const apareceCn = spring({ frame: cuadro - 104, fps, config: { damping: 18, mass: 0.6 } });

  // ── 4. Y el resultado, contando ────────────────────────────────────────────
  // Lineal con salida suave, no resorte: un contador que rebota se lee como un
  // efecto y no como una cuenta.
  const avanceConteo = interpolate(cuadro, [140, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const volumenActual = Math.round(avanceConteo * volumenM3);
  const escurreActual = avanceConteo * escurreMm;

  const apareceRemate = interpolate(cuadro, [232, 252], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const aparecePie = interpolate(cuadro, [258, 278], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORES.tinta,
        justifyContent: 'center',
        alignItems: 'center',
        padding: vertical ? 64 : 110,
      }}
    >
      {/* Las cuatro capas. Se van juntando hacia el centro mientras se apagan. */}
      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: interpolate(colapso, [0, 1], [vertical ? 22 : 34, 0]),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1 - colapso,
          transform: `scale(${interpolate(colapso, [0, 1], [1, 0.82])})`,
          position: 'absolute',
        }}
      >
        {ENTRADAS.map((clave, i) => (
          <div
            key={clave}
            style={{
              opacity: entrada(i),
              transform: `translateY(${interpolate(entrada(i), [0, 1], [26, 0])}px)`,
              border: `1px solid ${COLORES.crema}33`,
              borderRadius: 14,
              padding: vertical ? '20px 26px' : '22px 30px',
              minWidth: vertical ? 320 : 250,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: vertical ? 24 : 21,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: COLORES.agua,
                marginBottom: 10,
              }}
            >
              {clave}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: vertical ? 42 : 38, color: COLORES.crema }}>
              {valores[clave]}
            </div>
          </div>
        ))}
      </div>

      {/* El resultado del cruce. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: vertical ? 20 : 16,
          opacity: colapso,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: vertical ? 26 : 23,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: COLORES.agua,
            opacity: apareceCn,
            transform: `scale(${interpolate(apareceCn, [0, 1], [0.88, 1])})`,
          }}
        >
          Curva número {cn}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: vertical ? 120 : 168,
              fontWeight: 600,
              color: COLORES.crema,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {volumenActual.toLocaleString('es-AR')}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: vertical ? 48 : 62,
              fontWeight: 500,
              color: COLORES.agua,
            }}
          >
            m³
          </span>
        </div>

        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: vertical ? 38 : 40,
            color: COLORES.crema,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: vertical ? width * 0.9 : width * 0.6,
            opacity: apareceRemate,
          }}
        >
          De los {lluviaMm.toLocaleString('es-AR', { minimumFractionDigits: 1 })} mm que caen en un día,{' '}
          {escurreActual.toLocaleString('es-AR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{' '}
          se van por la superficie.
        </p>

        <p
          style={{
            fontFamily: SANS,
            fontSize: vertical ? 28 : 26,
            color: `${COLORES.crema}aa`,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.45,
            maxWidth: vertical ? width * 0.9 : width * 0.62,
            opacity: aparecePie,
          }}
        >
          El {escurrePct} % de la tormenta de {tormenta}, sobre las{' '}
          {cuencaHa.toLocaleString('es-AR')} ha de la cuenca de aporte.
        </p>
      </div>
    </AbsoluteFill>
  );
};
