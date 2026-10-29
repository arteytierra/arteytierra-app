/**
 * ENTREGA B · Las lecturas del predio. Dos segundos, una vuelta entera, en bucle.
 *
 * Reemplaza a la pieza de ocho segundos que se recorría con el scroll. Son seis
 * variantes de la misma composición, y cada una enciende una capa sobre la
 * ortofoto mientras la cámara da una vuelta completa:
 *
 *   relieve    el shader de elevaciones de la app, celda por celda
 *   curvas     las curvas de nivel, sobre el shader
 *   agua       las escorrentías, con la corriente bajando por cada cadena
 *   represas   los cierres que encuentra el terreno, con su espejo y su pulso
 *   todo       las cuatro juntas — la que pidió para el bucle
 *   secuencia  las cuatro encendiéndose una tras otra en los dos segundos
 *
 * ── Qué decide esta pieza y por qué ────────────────────────────────────────
 *
 * 1. **60 cuadros por segundo, no 30.** Una vuelta entera en dos segundos son
 *    180° por segundo: a 30 fps eso da 6° por cuadro y, sin desenfoque de
 *    movimiento, el giro estroboscopia. A 60 son 3° y queda continuo. Cuesta
 *    el doble de cuadros de render y nada de peso: son dos segundos.
 *
 * 2. **El bucle cierra porque la pieza es PERIÓDICA**, no porque se repita un
 *    cuadro. El rumbo da exactamente 360°, la corriente del agua da dos ciclos
 *    enteros y el pulso de las represas otros dos. Así el cuadro 120 —el que
 *    vendría después del último— cae exactamente sobre el 0. Dos cuadros
 *    idénticos seguidos serían una trabita de 1/60 s en cada vuelta.
 *
 * 3. **Gira hacia la derecha**, que es rumbo DECRECIENTE. Un rasgo que está al
 *    norte se ve arriba con rumbo 0; con rumbo −10 se ve 10° a la derecha de
 *    arriba. O sea: bajar el rumbo corre el paisaje hacia la derecha.
 *
 * 4. **`secuencia` es la única que no es un bucle**, porque acumula capas: el
 *    último cuadro tiene las cuatro y el primero ninguna. Es la que la página
 *    puede recorrer con `currentTime`, y por eso es la única que lleva
 *    fotograma clave corto en el MP4.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { z } from 'zod';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import {
  RUMBO, SOMBRA_GIRO, corriente, degradadoDeAvance, usarMapaDelPredio, vistaASangre,
} from './predio/mapa';

export const esquemaLectura = z.object({
  lectura: z.enum(['relieve', 'curvas', 'agua', 'represas', 'todo', 'secuencia'])
    .default('todo'),
});

export type Lectura = z.infer<typeof esquemaLectura>['lectura'];

/** Dos segundos a 60 fps. */
export const CUADROS_LECTURA = 120;
export const FPS_LECTURA = 60;

/**
 * Cuánto se acerca la cámara sobre el encuadre con aire.
 *
 * 0,62 y no el 1,0 de la vista a sangre: con la vuelta entera, el predio pasa
 * por todos los rumbos y el lado largo —3,7 km— se cruza en diagonal a mitad
 * de giro. A 1,0 se le van las dos puntas fuera del cuadro justo cuando se lo
 * está mirando de frente. A 0,62 la ortofoto sigue llenando el cuadro —que es
 * lo que quiere decir «a sangre»— y el predio entra entero toda la vuelta.
 */
const ACERCA_GIRO = 1.05;

/** Las cuatro marcas de `secuencia`, en cuadros: 0,0 · 0,5 · 1,0 · 1,5 s. */
const MARCAS = [0, 30, 60, 90];

const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

/**
 * Qué capas enciende cada variante. `secuencia` las resuelve por cuadro.
 *
 * **El shader va de base en las cuatro, y por eso es el que prende primero.**
 * Una represa sola es un charco azul en medio del monte: lo que la explica es
 * la hondonada donde está, y eso lo dice la rampa. Lo mismo las curvas y las
 * escorrentías — sobre la ortofoto sola son dibujos; sobre el shader son la
 * lectura del relieve que las produce. Es además como se ve en la app: la capa
 * de elevación queda puesta y arriba se van prendiendo las otras.
 */
const CAPAS: Record<Exclude<Lectura, 'secuencia'>, Lectura[]> = {
  relieve:  ['relieve'],
  curvas:   ['relieve', 'curvas'],
  agua:     ['relieve', 'agua'],
  represas: ['relieve', 'represas'],
  todo:     ['relieve', 'curvas', 'agua', 'represas'],
};

/**
 * Cuánto está encendida la capa `k` en el cuadro `f`.
 *
 * En las variantes de una sola capa es 1 o 0 y no hay transición: la pieza es
 * un bucle y un fundido de entrada se vería como un parpadeo en cada vuelta.
 * En `secuencia` cada capa entra en medio segundo y se queda.
 */
function encendida(lectura: Lectura, capa: Exclude<Lectura, 'secuencia' | 'todo'>, f: number) {
  if (lectura !== 'secuencia') {
    return CAPAS[lectura as Exclude<Lectura, 'secuencia'>].includes(capa) ? 1 : 0;
  }
  const k = ['relieve', 'curvas', 'agua', 'represas'].indexOf(capa);
  // La primera lectura ya está puesta en el cuadro 0: es la marca de 0,0 s y
  // también el póster, y si entrara con un fundido, la página que se detiene
  // en esa marca mostraría el predio pelado.
  if (k === 0) return 1;
  const m = MARCAS[k]!;
  return interpolate(f, [m, m + 22], [0, 1], {
    easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

export const LecturaPredio: React.FC<z.infer<typeof esquemaLectura>> = ({ lectura }) => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: `lectura-${lectura}`,
    camara: (f, ancho, alto) => ({
      ...vistaASangre(ancho, alto, { sombra: SOMBRA_GIRO, acercar: ACERCA_GIRO }),
      // La vuelta entera, hacia la derecha, arrancando donde está la pose.
      bearing: RUMBO - 360 * (f / CUADROS_LECTURA),
    }),
    pintar: (map, frame) => {
      const t = frame / CUADROS_LECTURA;
      const op = (capa: string, prop: string, v: number) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);
      const grad = (capa: string, expr: unknown) =>
        map.setPaintProperty(capa, 'line-gradient',
          expr as maplibregl.ExpressionSpecification);

      // El perímetro se queda en todas: es lo que dice de qué predio se está
      // hablando. Sin él, cada lectura es una mancha sobre un valle cualquiera.
      op('predio', 'line-opacity', 0.85);
      grad('predio', degradadoDeAvance(1, COLORES.crema));

      op('elevacion', 'fill-opacity', 0.88 * encendida(lectura, 'relieve', frame));
      op('curvas', 'line-opacity', 0.7 * encendida(lectura, 'curvas', frame));

      // ── El agua, con la corriente bajando ────────────────────────────────
      // Dos ciclos por vuelta, para que el bucle cierre. La banda entra por la
      // cabecera de cada cadena y sale por la desembocadura.
      const agua = encendida(lectura, 'agua', frame);
      op('agua', 'line-opacity', 0.95 * agua);
      op('agua-halo', 'line-opacity', 0.45 * agua);
      op('junturas', 'circle-stroke-opacity', 0.85 * agua);
      const pulso = ((t * 2) % 1) * 1.3 - 0.15;
      grad('agua', corriente(pulso, '#7CC2E3', '#EAF8FF'));
      grad('agua-halo', corriente(pulso, '#7CC2E3', '#FFFFFF', 0.2));

      // ── Las represas, con el anillo del cierre ───────────────────────────
      const rep = encendida(lectura, 'represas', frame);
      op('espejo', 'fill-opacity', 0.7 * rep);
      op('espejo-borde', 'line-opacity', 0.95 * rep);
      // El anillo: dos pulsos por vuelta, el radio creciendo y la opacidad
      // cayendo. `u` vuelve a 0 al terminar el ciclo, así que el bucle cierra.
      const u = (t * 2) % 1;
      op('pulso-represa', 'circle-radius', 4 + 46 * u);
      op('pulso-represa', 'circle-stroke-opacity', rep * (1 - u) * (1 - u) * 0.9);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
