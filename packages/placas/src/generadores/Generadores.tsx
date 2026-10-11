import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

import { COLORES } from '../marca';

/**
 * Generadores de assets de marca. **No son placas**: no se montan en ningún
 * video. Existen para producir PNG que después se commitean en
 * `apps/terreno/public/marca/` y que las placas usan como imagen.
 *
 * Por qué este rodeo: el wordmark "acequia" está dibujado con **Century Gothic
 * Bold**, que no está en la mayoría de las máquinas ni en un servidor. Escribirlo
 * como texto en una placa haría que el render saliera con otra tipografía en
 * cuanto cambiara de computadora, sin avisar. Rasterizándolo una vez acá —donde
 * la fuente está y se verificó contra el wordmark oficial— el resultado viaja
 * como PNG y ya no depende de nada.
 *
 * Sólo se corren en una máquina que tenga Century Gothic instalada:
 *
 *   pnpm exec remotion still src/index.ts GenWordmarkApp app.png --frame=0
 *
 * La geometría sale de los SVG oficiales del paquete v1
 * (`Acequia_Logo_Final_v1/SVG/`): viewBox, posiciones y tamaños son los de ahí,
 * no valores elegidos acá.
 */

/** El trazo del isotipo, tal como está en los SVG oficiales. */
const TRAZO_ISOTIPO =
  'M218 34 C167 33 114 66 78 112 C42 158 39 217 62 269 C83 316 120 351 165 365 ' +
  'C198 375 218 371 239 350 C250 340 261 347 278 358 C307 377 337 360 350 331 ' +
  'C364 299 352 268 357 229 C362 185 356 140 334 101 C311 61 264 36 218 34 Z';

/** Los cuatro anillos: cada uno es el mismo trazo desplazado y reducido. */
const ANILLOS = [
  undefined,
  'translate(2 -8) translate(210 210) scale(.75) translate(-210 -210)',
  'translate(8 -18) translate(210 210) scale(.50) translate(-210 -210)',
  'translate(14 -28) translate(210 210) scale(.28) translate(-210 -210)',
] as const;

export const esquemaGenLockup = z.object({
  colorIsotipo: z.string(),
  colorTexto: z.string(),
});

/**
 * El lockup completo, con isotipo y wordmark en colores independientes. Se usa
 * para generar la variante de fondo oscuro con el isotipo en azul agua, que el
 * paquete v1 no trae rasterizada.
 */
export const GenLockup: React.FC<z.infer<typeof esquemaGenLockup>> = ({ colorIsotipo, colorTexto }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 850 280" width="100%" height="100%">
      <g
        transform="translate(10 54) scale(.46)"
        fill="none"
        stroke={colorIsotipo}
        strokeWidth={10.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ANILLOS.map((t, i) => (
          <path key={i} d={TRAZO_ISOTIPO} transform={t} />
        ))}
      </g>
      <text
        x={200}
        y={193}
        fill={colorTexto}
        fontFamily="Century Gothic"
        fontSize={126}
        fontWeight={700}
        letterSpacing={-1}
      >
        acequia
      </text>
    </svg>
  </AbsoluteFill>
);

export const esquemaGenWordmark = z.object({
  texto: z.string(),
  color: z.string(),
});

/**
 * El wordmark suelto, con el texto que se le pase. Sirve para "acequia" y para
 * "acequia.app": los dos salen del mismo lienzo y con la misma métrica, así que
 * el punto donde termina "acequia" en uno es el mismo que en el otro. Eso es lo
 * que permite revelar el ".app" sin que se mueva un píxel del resto.
 *
 * El viewBox es el del `acequia-wordmark-*.svg` oficial, ensanchado para que
 * ".app" entre: el origen del texto (x=22) y el tamaño (164) no se tocan.
 */
export const GenWordmark: React.FC<z.infer<typeof esquemaGenWordmark>> = ({ texto, color }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1180 240" width="100%" height="100%">
      <text
        x={22}
        y={174}
        fill={color}
        fontFamily="Century Gothic"
        fontSize={164}
        fontWeight={700}
        letterSpacing={-1}
      >
        {texto}
      </text>
    </svg>
  </AbsoluteFill>
);

/** Los colores con los que se generan los assets, para no repetirlos al invocar. */
export const COLORES_GEN = {
  agua: COLORES.agua,
  crema: COLORES.crema,
  tinta: COLORES.tinta,
  blanco: '#FFFFFF',
} as const;
