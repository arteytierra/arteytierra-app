/**
 * ENTREGA A bis · La portada, y después la vuelta entera con la rampa de alturas.
 *
 * La portada de trece segundos está aprobada y no se toca: esta pieza **es**
 * esa, con dos actos más pegados al final.
 *
 *   01–04   0,0 – 13,0 s  la portada entera, cuadro por cuadro la misma
 *   05     13,0 – 15,0 s  se enciende el shader de elevaciones
 *   06     15,0 – 27,0 s  la vuelta entera, 360°, a velocidad constante
 *
 * 27 s en total. NO ES UN LOOP, igual que la portada: el último cuadro es el
 * póster, y es la pose aprobada —el otro lado de la ladera— ahora con la rampa
 * de alturas puesta.
 *
 * ── Por qué los actos 01 a 04 no están escritos acá ────────────────────────
 * Porque son los de `PortadaPredio`, importados: `camaraPortada` y
 * `pintarPortada`. Copiarlos habría dado una pieza que hoy se ve igual y que el
 * día que se corrija la portada se ve distinto. De paso, la corriente del agua
 * no se reinicia al entrar en el giro: `pintarPortada` la calcula desde el
 * cuadro 198 y sigue contando hasta el 810.
 *
 * ── Las tres cosas que esta pieza decide ───────────────────────────────────
 *
 * 1. **El retroceso de cámara va con la rampa, no con el giro.** Una vuelta
 *    entera necesita más aire que la vista a sangre: un rectángulo girado ocupa
 *    más ancho y más alto que el original, y con el encuadre quieto la vuelta le
 *    corta las puntas al predio. Son 0,19 niveles de zoom —`SOMBRA_QUIETA` 15°
 *    contra `SOMBRA_GIRO` 45°, más el 0,05 de acercamiento—, o sea un 14 % de
 *    retroceso repartido en dos segundos: no se ve. Lo que NO se podía hacer es
 *    retroceder mientras gira, porque entonces el giro no es un giro.
 *
 * 2. **El blanco de la cámara se recalcula en cada cuadro con el rumbo de ese
 *    cuadro.** La cámara no apunta al centro del predio: apunta 351 m hacia sí
 *    misma, que es lo que sube el predio a la mitad del cuadro con 61° de
 *    inclinación (ver `BLANCO_HACIA_LA_CAMARA_M` en `predio/mapa`). Si ese
 *    corrimiento se calcula una vez y se deja fijo, mientras la cámara da la
 *    vuelta el corrimiento se queda apuntando al mismo rumbo geográfico y el
 *    predio sube y baja dentro del cuadro a lo largo de la vuelta. Atado al
 *    rumbo de cada cuadro, el encuadre se queda igual los 360°.
 *
 * 3. **La vuelta es constante en el medio y entra y sale de cero.** Trescientos
 *    de los trescientos sesenta cuadros van a velocidad exactamente constante,
 *    que es lo que se pidió. Los dieciocho de cada punta son una rampa
 *    sinusoidal: sin eso el cuadro 449 está quieto y el 450 se mueve un grado,
 *    y ese escalón de velocidad se lee como un corte. No es un rebote —lo que
 *    el contrato prohíbe—: la vuelta nunca se pasa de los 360° ni vuelve atrás.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { z } from 'zod';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import {
  RUMBO, SOMBRA_GIRO, usarMapaDelPredio, vistaASangre, type Camara,
} from './predio/mapa';
import { CUADROS_PORTADA_PREDIO, camaraPortada, pintarPortada } from './PortadaPredio';

export const esquemaPortadaGiro = z.object({});

/** Dos segundos para que aparezca la rampa, con la cámara casi quieta. */
const RAMPA = { desde: CUADROS_PORTADA_PREDIO, hasta: CUADROS_PORTADA_PREDIO + 60 };

/** Doce segundos de vuelta, que es lo que se pidió. */
const CUADROS_VUELTA = 360;

/**
 * Cuántos cuadros duran el arranque y la frenada de la vuelta. 18 son 0,6 s.
 *
 * Son la mitad del ángulo de un tramo constante del mismo largo, así que la
 * velocidad del tramo constante sale de `1 / (CUADROS_VUELTA − RAMPA_VUELTA)`
 * de vuelta por cuadro: 1,05° por cuadro, y la vuelta mide exactamente 360°.
 */
const RAMPA_VUELTA = 18;

const GIRO = { desde: RAMPA.hasta, hasta: RAMPA.hasta + CUADROS_VUELTA };

export const CUADROS_PORTADA_GIRO = GIRO.hasta;

/** La misma curva de toda la obra. Nada rebota. */
const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

/**
 * El acercamiento de la pieza que gira, en niveles de zoom sobre el encuadre
 * con aire. Es el de las seis lecturas, para que las dos piezas que dan la
 * vuelta entera la den con el mismo encuadre.
 */
const ACERCA_GIRO = 1.05;

/** Cuánto está encendida la rampa de alturas. El 0,88 es el de las lecturas. */
const RAMPA_OPACIDAD = 0.88;

/**
 * Qué fracción de la vuelta se recorrió en el cuadro `f`, de 0 a 1.
 *
 * Constante en el medio, con una rampa sinusoidal de `RAMPA_VUELTA` cuadros en
 * cada punta. La posición es la integral de ese perfil de velocidad, hecha a
 * mano para que las dos puntas cierren en 0 y en 1 exactos: una vuelta que
 * termina en 0,998 deja el último cuadro medio grado corrido del primero del
 * giro, y ese medio grado es justo el que hace que no sirva de póster.
 */
function vueltaRecorrida(f: number): number {
  const n = CUADROS_VUELTA, r = RAMPA_VUELTA;
  const x = Math.min(Math.max(f - GIRO.desde, 0), n);
  const v = 1 / (n - r);
  // El área bajo media sinusoide de largo `r` que sube de 0 a `v`.
  const rampa = (u: number) => (v / 2) * (u - (r / Math.PI) * Math.sin((Math.PI * u) / r));
  if (x <= r) return rampa(x);
  if (x >= n - r) return 1 - rampa(n - x);
  return (v * r) / 2 + v * (x - r);
}

function camara(f: number, ancho: number, alto: number): Camara {
  if (f <= RAMPA.desde) return camaraPortada(f, ancho, alto);

  // La vuelta es hacia la DERECHA, que es rumbo decreciente: un rasgo que está
  // al norte se ve arriba con rumbo 0 y 10° a la derecha de arriba con rumbo
  // −10. Es el mismo sentido que el de las seis lecturas.
  const rumbo = RUMBO - 360 * vueltaRecorrida(f);

  // Las dos poses del MISMO rumbo: la de la portada y la que aguanta el giro.
  // Con el rumbo igual sólo difieren en el zoom —el centro depende del rumbo y
  // la inclinación es la misma—, así que el retroceso es una interpolación de
  // un solo número y el resto de la cámara no se mueve.
  const quieta = vistaASangre(ancho, alto, { rumbo });
  const gira = vistaASangre(ancho, alto, { rumbo, sombra: SOMBRA_GIRO, acercar: ACERCA_GIRO });
  const abre = interpolate(f, [RAMPA.desde, RAMPA.hasta], [0, 1], {
    easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return { ...gira, zoom: quieta.zoom + (gira.zoom - quieta.zoom) * abre };
}

export const PortadaGiro: React.FC<z.infer<typeof esquemaPortadaGiro>> = () => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: 'portada-giro',
    camara,
    pintar: (map, frame) => {
      // Las tres capas de la portada, sin un cambio: el perímetro dibujado, las
      // curvas por cota y el agua corriendo. Quedan puestas toda la vuelta.
      pintarPortada(map, frame);

      // 05 · la rampa de alturas se enciende.
      //
      // Va ENTRE la ortofoto y el sombreado, así que la misma luz que le da
      // volumen al monte se la da a la rampa. El fundido es lo que quiere decir
      // «activar el shader»: es lo que hace la app cuando se prende la capa.
      map.setPaintProperty('elevacion', 'fill-opacity', interpolate(
        frame, [RAMPA.desde, RAMPA.hasta], [0, RAMPA_OPACIDAD],
        { easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ) as unknown as maplibregl.DataDrivenPropertyValueSpecification<number>);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
