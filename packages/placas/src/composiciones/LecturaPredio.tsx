/**
 * ENTREGA B · Las lecturas del predio. Doce segundos, una vuelta entera, en bucle.
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
 *   secuencia  las cuatro encendiéndose una tras otra a lo largo de la vuelta
 *
 * ── Por qué doce segundos y no dos ─────────────────────────────────────────
 *
 * Porque en dos segundos la vuelta entera son 180° por segundo y **no se
 * distingue nada**: a esa velocidad el predio deja de ser un lugar y pasa a ser
 * un plato giratorio. Es la corrección que pidió Jonatan sobre la entrega
 * anterior, y la pedía la pieza: lo que estas seis variantes tienen que mostrar
 * es una capa de lectura sobre un terreno, y una capa no se lee mientras el
 * terreno vuela.
 *
 * Doce segundos de vuelta son 30° por segundo. A 30 cuadros por segundo eso da
 * **un grado por cuadro**, que es seis veces más lento que lo que antes
 * estroboscopiaba, así que los 60 fps de la versión de dos segundos ya no hacen
 * falta: vuelven a 30, como todo el resto del repertorio, y el render cuesta la
 * mitad de los cuadros que costaría a 60.
 *
 * ── Qué decide esta pieza y por qué ────────────────────────────────────────
 *
 * 1. **La velocidad es exactamente constante.** No hay arranque ni frenada,
 *    aunque una rampa en las puntas se vea mejor en una pieza que empieza y
 *    termina: esto es un BUCLE, y una rampa deja el cuadro 359 quieto contra un
 *    cuadro 0 que va a un grado por cuadro. Ese escalón de velocidad es
 *    exactamente lo que se siente como una trabita en cada vuelta. La pieza que
 *    sí lleva rampas es `PortadaGiro`, que no hace bucle.
 *
 * 2. **El bucle cierra porque la pieza es PERIÓDICA**, no porque se repita un
 *    cuadro. El rumbo da exactamente 360°, la corriente del agua da cuatro
 *    ciclos enteros y el pulso de las represas otros cuatro. Así el cuadro 360
 *    —el que vendría después del último— cae exactamente sobre el 0. Dos
 *    cuadros idénticos seguidos serían una trabita de 1/30 s en cada vuelta.
 *
 * 3. **Gira hacia la derecha**, que es rumbo DECRECIENTE. Un rasgo que está al
 *    norte se ve arriba con rumbo 0; con rumbo −10 se ve 10° a la derecha de
 *    arriba. O sea: bajar el rumbo corre el paisaje hacia la derecha.
 *
 * 4. **El blanco de la cámara se recalcula con el rumbo de cada cuadro.** La
 *    cámara apunta 351 m hacia sí misma y no al centro del predio, que es lo
 *    que lo sube a la mitad del cuadro con 61° de inclinación (ver
 *    `BLANCO_HACIA_LA_CAMARA_M` en `predio/mapa`). Pedir esa pose una sola vez
 *    y después cambiarle sólo el rumbo —que es lo que hacía la versión de dos
 *    segundos— deja el corrimiento apuntando a un rumbo geográfico fijo, y el
 *    predio sube y baja dentro del cuadro a lo largo de la vuelta. En dos
 *    segundos no se alcanzaba a ver; en doce, sí.
 *
 * 5. **`secuencia` es la única que no es un bucle**, porque acumula capas: el
 *    último cuadro tiene las cuatro y el primero ninguna. Es la que la página
 *    puede recorrer con `currentTime`, y por eso es la única que lleva
 *    fotograma clave corto en el MP4. Con doce segundos cada lectura se sostiene
 *    tres segundos en vez de medio, que es lo que el encargo pedía para que el
 *    scroll pueda detenerse en una marca y el cuadro congelado se lea.
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

/**
 * Doce segundos a 30 fps: un grado de rumbo por cuadro.
 *
 * `FPS_LECTURA` ya vale lo mismo que el `FPS` del repertorio y se podría borrar.
 * Queda con nombre a propósito: fue 60 mientras la vuelta duraba dos segundos,
 * y el día que alguien quiera acelerarla de nuevo tiene que ver acá, al lado de
 * la duración, que las dos cosas se mueven juntas.
 */
export const CUADROS_LECTURA = 360;
export const FPS_LECTURA = 30;

/**
 * Cuántos ciclos de corriente y de pulso entran en una vuelta. **Enteros, o el
 * bucle no cierra.**
 *
 * Cuatro, no dos: con dos, cada pasada del agua por una cadena duraría seis
 * segundos y el agua se leería detenida. Y tampoco doce —que es lo que daría la
 * cadencia de la versión de dos segundos, una pasada por segundo—: con la
 * cámara ahora lenta, un agua a un hertz es lo único apurado del cuadro. Cuatro
 * son tres segundos por pasada: alcanza para seguir una banda de la cabecera a
 * la desembocadura, que es de lo que se trata.
 */
const CICLOS_POR_VUELTA = 4;

/**
 * Cuánto se acerca la cámara sobre el encuadre con aire.
 *
 * Con la vuelta entera, el predio pasa por todos los rumbos y el lado largo
 * —3,7 km— se cruza en diagonal a mitad de giro, así que al encuadre le hace
 * falta más aire que a una pieza quieta. Ese aire ya lo da `SOMBRA_GIRO`: el
 * zoom se calcula sobre la SOMBRA GIRADA del rectángulo, que a 45° es la más
 * grande que va a ocupar en toda la vuelta. Hecha esa cuenta, el acercamiento
 * puede ser el de la vista a sangre y un poco más, y el predio entra entero los
 * 360° — que es lo que se comprobó mirando la vuelta cuadro por cuadro.
 */
const ACERCA_GIRO = 1.05;

/** Las cuatro marcas de `secuencia`, en cuadros: 0 · 3 · 6 · 9 s. */
const MARCAS = [0, 90, 180, 270];

/**
 * Cuánto tarda una capa de `secuencia` en entrar: un segundo.
 *
 * Deja dos segundos de cuadro QUIETO alrededor de cada marca, que es lo que el
 * encargo pide para que el scroll pueda detenerse ahí y lo que se congela se
 * lea. Con los 22 cuadros de la versión de dos segundos —0,37 s— la pieza era
 * casi todo transición.
 */
const ENTRA = 30;

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
  return interpolate(f, [m, m + ENTRA], [0, 1], {
    easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

export const LecturaPredio: React.FC<z.infer<typeof esquemaLectura>> = ({ lectura }) => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: `lectura-${lectura}`,
    // La vuelta entera, hacia la derecha, arrancando donde está la pose, a
    // velocidad constante. La pose se pide ENTERA con el rumbo de este cuadro y
    // no una vez con el rumbo inicial: ver el punto 4 de la cabecera.
    camara: (f, ancho, alto) => vistaASangre(ancho, alto, {
      rumbo: RUMBO - 360 * (f / CUADROS_LECTURA),
      sombra: SOMBRA_GIRO,
      acercar: ACERCA_GIRO,
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
      // Cuatro ciclos por vuelta, enteros, para que el bucle cierre. La banda
      // entra por la cabecera de cada cadena y sale por la desembocadura.
      const agua = encendida(lectura, 'agua', frame);
      op('agua', 'line-opacity', 0.95 * agua);
      op('agua-halo', 'line-opacity', 0.45 * agua);
      op('junturas', 'circle-stroke-opacity', 0.85 * agua);
      const pulso = ((t * CICLOS_POR_VUELTA) % 1) * 1.3 - 0.15;
      grad('agua', corriente(pulso, '#7CC2E3', '#EAF8FF'));
      grad('agua-halo', corriente(pulso, '#7CC2E3', '#FFFFFF', 0.2));

      // ── Las represas, con el anillo del cierre ───────────────────────────
      const rep = encendida(lectura, 'represas', frame);
      op('espejo', 'fill-opacity', 0.7 * rep);
      op('espejo-borde', 'line-opacity', 0.95 * rep);
      // El anillo: cuatro pulsos por vuelta, el radio creciendo y la opacidad
      // cayendo. `u` vuelve a 0 al terminar el ciclo, así que el bucle cierra.
      const u = (t * CICLOS_POR_VUELTA) % 1;
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
