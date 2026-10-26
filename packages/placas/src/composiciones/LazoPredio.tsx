/**
 * ENTREGA C · Tres lazos del lienzo. Seis segundos cada uno, en bucle.
 *
 *   perimetro  el polígono del predio se traza y se cierra
 *   giro       el relieve gira despacio bajo las curvas de nivel
 *   agua       el cauce principal se dibuja a lo largo del valle
 *
 * Se muestra **el lienzo, no la interfaz**: no hay barras, ni botones, ni
 * paneles, ni reales —`/mapa` está detrás de login— ni inventados. El contenido
 * del mapa sí es el real, calculado con las funciones de la app.
 *
 * ── Por qué el bucle no tiene el primer y el último cuadro idénticos ───────
 * Porque eso sería un defecto, no el requisito. Dos cuadros iguales seguidos
 * son una trabita de 1/30 s en cada vuelta. Lo que hace que un bucle no salte
 * es que la animación sea **periódica**: que el cuadro 180 —el que vendría
 * después del último— caiga exactamente sobre el cuadro 0. Por eso todo acá se
 * parametriza con `t = cuadro / 180` y las funciones vuelven solas a su valor
 * inicial. El cuadro 179 es el anterior a ese, no una copia del 0.
 *
 * ── Por qué el giro va y vuelve en vez de dar la vuelta entera ─────────────
 * Una órbita completa también cierra el bucle, pero 360° en seis segundos son
 * 60° por segundo: a esa velocidad el predio deja de leerse y la pieza se
 * parece a un plato giratorio de showroom. El vaivén es una sinusoide, así que
 * en los extremos la velocidad llega a cero y vuelve sin un golpe — no es un
 * rebote, que es lo que el contrato prohíbe: un rebote se pasa de su destino y
 * vuelve, y esto nunca se pasa. La marca se llama acequia, que es un canal de
 * agua.
 */
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { z } from 'zod';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import { CENTRO_CAUCE, LARGO_CAUCE_M } from './predio/datos';
import { degradadoDeAvance, usarMapaDelPredio, vistaASangre } from './predio/mapa';

export const esquemaLazo = z.object({
  lazo: z.enum(['perimetro', 'giro', 'agua']).default('perimetro'),
});

export const CUADROS_LAZO = 180;   // 6 s a 30 fps

const AGUA_QUE_CORRE = Easing.bezier(0.33, 0, 0.2, 1);

/** Hasta dónde del lazo se dedica a dibujar, antes de empezar a apagarse. */
const DIBUJA_HASTA = 0.72;
const APAGA_DESDE = 0.80;

/** Cuánto gira el vaivén, a cada lado del rumbo de la vista a sangre. */
const VAIVEN_GRADOS = 8;

/**
 * El trazo que se dibuja y se apaga, en función del ciclo.
 *
 * Devuelve el avance del degradado y la opacidad. En `t = 0` el avance es 0
 * —no hay nada dibujado— y en `t = 1` la opacidad es 0 —tampoco se ve nada—,
 * así que las dos puntas del ciclo muestran lo mismo y el salto no existe,
 * aunque los números de adentro sean distintos.
 */
function trazo(t: number) {
  return {
    avance: interpolate(t, [0, DIBUJA_HASTA], [0, 1], {
      easing: AGUA_QUE_CORRE, extrapolateRight: 'clamp',
    }),
    opacidad: interpolate(t, [APAGA_DESDE, 1], [1, 0], {
      easing: AGUA_QUE_CORRE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }),
  };
}

export const LazoPredio: React.FC<z.infer<typeof esquemaLazo>> = ({ lazo }) => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: `lazo-${lazo}`,
    camara: (f, ancho, alto) => {
      const base = vistaASangre(ancho, alto);
      const t = f / CUADROS_LAZO;
      if (lazo === 'giro') {
        return { ...base, bearing: base.bearing + VAIVEN_GRADOS * Math.sin(2 * Math.PI * t) };
      }
      if (lazo === 'agua') {
        // El lazo del agua se para encima del cauce. El acercamiento sale de
        // una cuenta y no del ojo: cada nivel de zoom divide por dos lo que
        // entra en el cuadro, así que para que un cauce de `LARGO_CAUCE_M`
        // ocupe la mitad del ancho de un cuadro que hoy abarca el predio
        // entero, hacen falta `log2(predio / (2 · cauce))` niveles más.
        const anchoPredioM = 3690;
        const acercar = Math.log2(anchoPredioM / Math.max(120, 2 * LARGO_CAUCE_M));
        return {
          ...base,
          center: CENTRO_CAUCE,
          // El tope de 1,3 no es arbitrario: más cerca, la ortofoto de Esri ya
          // no tiene tesela propia y se ve blanda, y la escalera de ocho rumbos
          // del D8 se vuelve el rasgo principal de la línea en vez del valle.
          zoom: base.zoom + Math.max(0, Math.min(1.3, acercar)),
        };
      }
      return base;
    },
    pintar: (map, frame) => {
      const t = frame / CUADROS_LAZO;
      const op = (capa: string, prop: string, v: number) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);
      const grad = (capa: string, avance: number, color: string) =>
        map.setPaintProperty(capa, 'line-gradient',
          degradadoDeAvance(avance, color) as unknown as maplibregl.ExpressionSpecification);

      if (lazo === 'perimetro') {
        const { avance, opacidad } = trazo(t);
        op('predio', 'line-opacity', 0.95 * opacidad);
        grad('predio', avance, COLORES.crema);
        return;
      }

      if (lazo === 'giro') {
        // Nada se enciende ni se apaga: lo único que cambia es el punto de
        // vista, que es de lo que trata este lazo. Las curvas van porque son lo
        // que hace legible el relieve cuando gira.
        op('predio', 'line-opacity', 0.85);
        grad('predio', 1, COLORES.crema);
        op('curvas', 'line-opacity', 0.6);
        return;
      }

      // agua · el cauce principal se dibuja valle abajo.
      const { avance, opacidad } = trazo(t);
      op('predio', 'line-opacity', 0.45);
      grad('predio', 1, COLORES.crema);
      op('cauce', 'line-opacity', 0.95 * opacidad);
      grad('cauce', avance, '#7CC2E3');
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
