/**
 * ENTREGA A · La portada, recortada. Trece segundos sobre un predio real.
 *
 * La corrección del encargo 02 en una frase: **la cámara nunca sale de la vista
 * que funciona.** Lo que se revela no es el terreno —que está ahí entero desde
 * el primer cuadro, a sangre, con su ortofoto— sino las capas encendiéndose
 * sobre esa vista.
 *
 *   01  0,0 – 3,0 s   el perímetro se dibuja, lado por lado
 *   02  2,8 – 6,8 s   las curvas de nivel se dibujan, de las cotas bajas a las altas
 *   03  6,6 – 10,6 s  el agua se enciende, de los filos a los cauces
 *   04  10,6 – 13,0 s deriva de cámara casi imperceptible, y se detiene
 *
 * NO ES UN LOOP. El último cuadro es el póster.
 *
 * ── Qué se arregló, defecto por defecto ────────────────────────────────────
 * (a) «Dos rectángulos superpuestos con otro ángulo.» Eran el relieve coloreado
 *     —una fuente `canvas`, que MapLibre dibuja como un cuadrilátero plano y no
 *     drapea— y las capas vectoriales, que sí van drapeadas. Acá no hay ráster
 *     propio: la rampa de alturas no aparece y no queda nada que se pueda
 *     desfasar.
 * (b) «Flota en un cuadro negro.» La vista a sangre es ahora el punto de
 *     partida, no el destino. No hay salto en el segundo 8 porque no hay dos
 *     escalas.
 * (c) «Está blando.» Lo blando era el canvas de 300 × 277 ampliado a 1280. Las
 *     teselas de la ortofoto se piden al zoom en que se ven.
 * (d) «La rampa de color.» Afuera. El color de la pieza es el de la ortofoto,
 *     que es el del mundo real, y el único color agregado es el de las líneas.
 *
 * Y la atribución **ya no va quemada**: la pone la página. La vez pasada venía
 * abajo a la izquierda y la hoja de estilos tuvo que recortarla con
 * `object-position`. Tampoco hay viñeta: el velo del hero lo pone la landing, y
 * dos velos encima del mismo cuadro fue parte del «tiene mucho filtro».
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { z } from 'zod';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import {
  degradadoDeAvance, usarMapaDelPredio, vistaASangre, type Camara,
} from './predio/mapa';

export const esquemaPortadaPredio = z.object({});

const ACTO = {
  perimetro: { desde:   0, hasta:  90 },   // 0,0 –  3,0 s
  curvas:    { desde:  84, hasta: 204 },   // 2,8 –  6,8 s
  agua:      { desde: 198, hasta: 318 },   // 6,6 – 10,6 s
  queda:     { desde: 318, hasta: 390 },   // 10,6 – 13,0 s
};
export const CUADROS_PORTADA_PREDIO = ACTO.queda.hasta;

/**
 * Una sola curva en toda la pieza, y no se pasa nunca de su destino: la marca
 * se llama acequia, que es un canal de agua. Nada rebota.
 */
const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

/**
 * La deriva: trece segundos para 0,06 de zoom y un grado y medio de rumbo.
 *
 * Termina EXACTAMENTE en `vistaASangre`, que es la pose del último cuadro de la
 * primera animación. Por eso el póster que ya está publicado sigue sirviendo, y
 * por eso la cámara no «sale» de la vista: entra y sale de la misma.
 */
function camara(f: number, ancho: number, alto: number): Camara {
  const destino = vistaASangre(ancho, alto);
  const t = interpolate(f, [0, CUADROS_PORTADA_PREDIO], [0, 1], {
    easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
  });
  return {
    center: [
      destino.center[0] - 0.00055 * (1 - t),
      destino.center[1] + 0.00030 * (1 - t),
    ],
    zoom: destino.zoom - 0.06 * (1 - t),
    pitch: destino.pitch - 2.0 * (1 - t),
    bearing: destino.bearing + 1.5 * (1 - t),
  };
}

/**
 * Enciende una capa por una propiedad de 0 a 1 de cada rasgo: las curvas por su
 * cota, el agua por su acumulación.
 *
 * `frente` arranca en −0,3 y termina en 1,0, así que los dos topes de la
 * interpolación son SIEMPRE estrictamente crecientes. Con un `Math.max(0, …)`
 * los dos valían 0 en el primer cuadro, MapLibre rechazaba la expresión entera
 * y la capa no aparecía nunca.
 */
function frenteQueEnciende(
  frame: number, acto: { desde: number; hasta: number },
  propiedad: string, opacidadMax: number,
) {
  const avance = interpolate(frame, [acto.desde, acto.hasta], [0, 1], {
    easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // 1,6 y no 1,35: el frente tiene que llegar a 1,22, porque el tope de arriba
  // va 0,22 atrás y si se queda en 1,05 los rasgos de la punta —las cotas más
  // altas, el cauce principal— terminan la pieza a media opacidad.
  const frente = avance * 1.6 - 0.3;
  return [
    'interpolate', ['linear'], ['get', propiedad],
    frente - 0.22, opacidadMax,
    frente, 0,
  ] as unknown as maplibregl.DataDrivenPropertyValueSpecification<number>;
}

export const PortadaPredio: React.FC<z.infer<typeof esquemaPortadaPredio>> = () => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: 'portada',
    camara,
    pintar: (map, frame) => {
      // 01 · el perímetro se dibuja.
      map.setPaintProperty('predio', 'line-opacity', interpolate(
        frame, [0, 6], [0, 0.92], { extrapolateRight: 'clamp' },
      ));
      map.setPaintProperty('predio', 'line-gradient', degradadoDeAvance(
        interpolate(frame, [ACTO.perimetro.desde, ACTO.perimetro.hasta], [0, 1], {
          easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
        }),
        COLORES.crema,
      ) as unknown as maplibregl.ExpressionSpecification);

      // 02 · las curvas, de las cotas bajas a las altas.
      map.setPaintProperty('curvas', 'line-opacity',
        frenteQueEnciende(frame, ACTO.curvas, 'altura', 0.74));

      // 03 · el agua, de los filos a los cauces.
      map.setPaintProperty('agua', 'line-opacity',
        frenteQueEnciende(frame, ACTO.agua, 'orden', 0.95));
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
