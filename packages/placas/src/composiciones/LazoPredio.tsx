/**
 * ENTREGA C · Tres lazos del lienzo. Seis segundos cada uno, en bucle.
 *
 *   perimetro  el polígono del predio se traza y se cierra
 *   giro       el relieve gira despacio bajo las curvas de nivel
 *   agua       las treinta y siete cadenas se dibujan a la vez, desde más lejos
 *
 * Los tres miran **el otro lado de la ladera**, que es el que tiene la red de
 * escurrimiento y el cordón de fondo. Los números están en `RUMBO`.
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
import { corriente, degradadoDeAvance, usarMapaDelPredio, vistaASangre } from './predio/mapa';

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
      // El lazo del agua se mira DESDE MÁS LEJOS que los otros dos: lo que
      // tiene que verse acá no es una línea, son las treinta y siete cadenas
      // dibujándose a la vez sobre las dos vertientes. Con el acercamiento de
      // la vista a sangre, media red queda fuera del cuadro.
      const base = vistaASangre(ancho, alto, lazo === 'agua' ? { acercar: 0.6 } : {});
      const t = f / CUADROS_LAZO;
      if (lazo === 'giro') {
        return { ...base, bearing: base.bearing + VAIVEN_GRADOS * Math.sin(2 * Math.PI * t) };
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

      // agua · las treinta y siete cadenas se dibujan a la vez, cada una de su
      // cabecera a su desembocadura, y la corriente las recorre mientras se
      // dibujan. El `line-progress` es por rasgo, así que una sola expresión
      // dibuja toda la red: cada cadena avanza sobre su propio largo y no sobre
      // el de la más larga.
      const { avance, opacidad } = trazo(t);
      op('predio', 'line-opacity', 0.45);
      grad('predio', 1, COLORES.crema);
      op('agua', 'line-opacity', 0.95 * opacidad);
      op('agua-halo', 'line-opacity', 0.45 * opacidad);
      // Tres ciclos de corriente en los seis segundos del lazo: entero, así que
      // el bucle cierra. La banda nunca pasa el frente del dibujo.
      const pulso = ((t * 3) % 1) * 1.3 - 0.15;
      map.setPaintProperty('agua', 'line-gradient',
        corriente(pulso, '#7CC2E3', '#EAF8FF', 0.14, avance) as maplibregl.ExpressionSpecification);
      map.setPaintProperty('agua-halo', 'line-gradient',
        corriente(pulso, '#7CC2E3', '#FFFFFF', 0.2, avance) as maplibregl.ExpressionSpecification);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
