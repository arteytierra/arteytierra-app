/**
 * ENTREGA B · Las cuatro lecturas. Ocho segundos, para recorrer con el scroll.
 *
 * El mismo predio leído cuatro veces, sobre el mismo encuadre:
 *
 *   0,0 s  Relieve   la vista 3D con el sombreado del terreno, sin más
 *   2,0 s  Agua      las líneas de acumulación y los puntos de juntura
 *   4,0 s  Aptitud   los manchones de aptitud de uso, en los colores de la app
 *   6,0 s  Diseño    el keyline y el espejo de la retención, sobre las curvas
 *
 * ── Tres cosas que esta pieza decide y hay que saber ───────────────────────
 *
 * 1. **La cámara no se mueve.** Ni una décima de zoom. Las cuatro lecturas son
 *    del mismo predio y lo que tiene que cambiar entre una y otra es la capa,
 *    no el punto de vista: si la cámara derivara, el visitante que se detiene
 *    en la marca de «Agua» y en la de «Diseño» estaría comparando dos encuadres
 *    distintos. Además es lo que hace que el archivo entre en su tope: con el
 *    fondo quieto, los cuadros intermedios pesan casi nada, que es justo lo que
 *    hace falta cuando hay un fotograma clave cada cinco.
 *
 * 2. **El tercer estado se llama Aptitud y no Suelo.** La app lo calcula de
 *    pendiente, orientación, agua acumulada y altura relativa —puro relieve—;
 *    no toca un dato de suelo. Rotularlo «Suelo» en la página prometería un
 *    análisis edafológico que esta pieza no trae. Y son cinco clases, no tres:
 *    en este predio dan 88,6 % forestal, 10 % pasturas y 1,3 % frutales, que es
 *    la lectura correcta de 417 ha al 30 % de pendiente.
 *
 * 3. **En «Diseño» no hay zanjas, y es la app la que se niega.** Con 30,4 % de
 *    pendiente la tabla de `criterios` pide 3 m de separación vertical, que
 *    sobre 369 m de desnivel son 124 zanjas contra un tope de diseño de 60.
 *    Dibujarlas igual sería pasarle por encima al criterio de la herramienta
 *    para llenar un cuadro. Lo que sí hay son las dos capas de diseño que este
 *    relieve sí define: las guías de keyline y el espejo del cierre que
 *    encuentra el terreno.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { z } from 'zod';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import { usarMapaDelPredio, vistaASangre } from './predio/mapa';

export const esquemaCuatroLecturas = z.object({});

/** Las cuatro marcas, en cuadros a 30 fps. El scroll se detiene en éstas. */
const MARCAS = [0, 60, 120, 180];
/** Medio segundo quieto alrededor de cada marca: ±8 cuadros. */
const QUIETO = 8;
export const CUADROS_CUATRO_LECTURAS = 240;

const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

/**
 * Cuánto se ve el estado `k` en el cuadro `f`: 1 en la meseta alrededor de su
 * marca, 0 en la meseta de los vecinos, y una transición continua en el medio.
 *
 * La meseta no es decoración: el video se recorre moviendo `currentTime` desde
 * la página, el scroll se detiene en la marca, y el cuadro congelado tiene que
 * leerse solo. Sin la meseta, parar «en 2,0 s» cae casi siempre en el medio de
 * un fundido y las dos lecturas se ven a media opacidad.
 */
function estado(f: number, k: number): number {
  const m = MARCAS[k]!;
  if (f >= m - QUIETO && f <= m + QUIETO) return 1;
  if (f < m) {
    const previa = MARCAS[k - 1];
    if (previa === undefined) return 1;   // antes de la primera marca ya está puesto
    return interpolate(f, [previa + QUIETO, m - QUIETO], [0, 1], {
      easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
  }
  const siguiente = MARCAS[k + 1];
  if (siguiente === undefined) return 1;  // después de la última se queda
  return interpolate(f, [m + QUIETO, siguiente - QUIETO], [1, 0], {
    easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

export const CuatroLecturas: React.FC<z.infer<typeof esquemaCuatroLecturas>> = () => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: 'lecturas',
    camara: (_f, ancho, alto) => vistaASangre(ancho, alto),
    pintar: (map, frame) => {
      const op = (capa: string, prop: string, v: number) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);

      // El perímetro se queda en los cuatro estados: es lo que dice de qué
      // predio se está hablando, y sin él las cuatro lecturas son cuatro
      // manchas sobre un valle cualquiera.
      op('predio', 'line-opacity', 0.85);

      // 1 · Relieve. No enciende ninguna capa: el sombreado y la ortofoto están
      // desde el cuadro 0 y son el piso de las otras tres lecturas.

      // 2 · Agua
      const agua = estado(frame, 1);
      op('agua', 'line-opacity', 0.95 * agua);
      op('junturas', 'circle-stroke-opacity', 0.9 * agua);

      // 3 · Aptitud
      const aptitud = estado(frame, 2);
      // 0,35 y no 0,5: con 88,6 % de una sola clase, medio punto de opacidad
      // convierte el predio en una mancha marrón que tapa el relieve que las
      // otras tres lecturas muestran. A 0,35 la ortofoto sigue abajo y los
      // manchones se leen como lo que son, una lectura puesta encima.
      op('aptitud', 'fill-opacity', 0.35 * aptitud);

      // 4 · Diseño. Las curvas entran acá y no antes: son el sustento del
      // keyline —la guía principal pasa por el keypoint y las otras le siguen
      // el paralelo—, y encenderlas en los cuatro estados convertiría la
      // lectura del agua en una maraña.
      const diseno = estado(frame, 3);
      op('curvas', 'line-opacity', 0.5 * diseno);
      op('keyline', 'line-opacity', 0.95 * diseno);
      op('espejo', 'fill-opacity', 0.65 * diseno);
      op('espejo-borde', 'line-opacity', 0.9 * diseno);
      op('zanjas', 'line-opacity', 0.9 * diseno);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
