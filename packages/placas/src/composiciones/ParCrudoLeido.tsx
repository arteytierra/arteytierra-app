/**
 * ENCARGO 03 · ENTREGA C · El par crudo contra leído.
 *
 * Dos imágenes fijas del MISMO encuadre exacto, para la cortina de la página:
 * el visitante corre el borde y aparece la lectura sobre la misma foto.
 *
 *   cuadro 0   la ortofoto desnuda, sin una sola línea
 *   cuadro 1   la lectura completa encima — curvas, agua, la represa posible,
 *              el corredor, lo que el terreno admite y las bandas de caminata
 *
 * ── Por qué es una composición de DOS CUADROS y no dos imágenes sueltas ────
 *
 * Porque «alineadas al píxel» no se consigue pidiendo dos veces la misma
 * cámara: se consigue no moviéndola. Dos `renderStill` separados son dos
 * navegadores, dos mapas y dos cargas de teselas distintas; la cámara saldría
 * idéntica y la ORTOFOTO no, porque la segunda corrida puede quedarse con una
 * tesela de otro nivel de detalle. Entre el cuadro 0 y el 1 de una misma
 * corrida el mapa es el mismo objeto, con las mismas teselas ya cargadas, y lo
 * único que cambia es la opacidad de unas capas. Se renderiza como secuencia de
 * PNG, que además no recomprime nada.
 *
 * Y se comprueba: el guion mide la diferencia entre las dos imágenes FUERA de
 * lo que se dibuja encima. Si el terreno se movió, la cortina no sirve y hay
 * que saberlo antes de entregar, no después.
 *
 * ── Qué NO lleva la imagen leída ──────────────────────────────────────────
 *
 * El shader de cota, que es lo que el encargo pide: «el estado final de la
 * entrega A SIN el shader de cota». Tiene sentido para una cortina — si la
 * mitad leída repinta el color del suelo, lo que el visitante ve al correr el
 * borde es un filtro, no una lectura. Y tampoco el velo: oscurecer el predio
 * del lado leído haría que la cortina parezca un control de brillo.
 */
import { AbsoluteFill } from 'remotion';
import type maplibregl from 'maplibre-gl';

import { COLORES } from '../marca';
import { M } from './predio/mesa';
import { degradadoDeAvance, usarMapaDelPredio, vistaASangre } from './predio/mapa';
import { CAPAS_MESA, INCLINACION } from './MesaDeTrabajo';

/** Dos cuadros: el crudo y el leído. */
export const CUADROS_PAR = 2;

export const ParCrudoLeido: React.FC = () => {
  const { contRef, width, height } = usarMapaDelPredio({
    nombre: 'par-crudo-leido',
    // La MISMA cámara en los dos cuadros, y la misma de la secuencia: la
    // cortina y el video tienen que mostrar el mismo predio desde el mismo
    // lugar o la página se contradice sola.
    camara: (_f, ancho, alto) => vistaASangre(ancho, alto, { inclinacion: INCLINACION }),
    fuentes: CAPAS_MESA.fuentes,
    capas: CAPAS_MESA.capas,
    pintar: (map, frame) => {
      const on = frame > 0 ? 1 : 0;
      const op = (capa: string, prop: string, v: unknown) =>
        map.setPaintProperty(capa, prop, v as unknown as
          maplibregl.DataDrivenPropertyValueSpecification<number>);

      op('predio', 'line-opacity', 0.9 * on);
      map.setPaintProperty('predio', 'line-gradient',
        degradadoDeAvance(1, COLORES.crema) as maplibregl.ExpressionSpecification);

      op('curvas', 'line-opacity', 0.7 * on);
      map.setPaintProperty('curvas', 'line-gradient',
        degradadoDeAvance(1, COLORES.crema) as maplibregl.ExpressionSpecification);

      op('agua', 'line-opacity', 0.95 * on);
      op('agua-halo', 'line-opacity', 0.45 * on);
      op('junturas', 'circle-stroke-opacity', 0.85 * on);

      op('espejo-mesa', 'fill-opacity', 0.72 * on);
      op('espejo-mesa-borde', 'line-opacity', 0.95 * on);
      op('muro-base', 'line-opacity', 0.8 * on);
      op('muro', 'line-opacity', on);
      for (const capa of ['muro-base', 'muro']) {
        map.setPaintProperty(capa, 'line-gradient',
          degradadoDeAvance(1, capa === 'muro' ? COLORES.crema : '#1A1210') as
            maplibregl.ExpressionSpecification);
      }
      op('derrame', 'circle-radius', 7);
      op('derrame', 'circle-stroke-opacity', 0.95 * on);

      op('acceso', 'circle-stroke-opacity', 0.9 * on);
      op('corredor', 'fill-opacity', 0.85 * on);
      op('admite', 'fill-opacity', 0.9 * on);
      // Igual que en la secuencia: la banda de «más de 40 minutos» no se pinta,
      // porque son 382 de las 428 ha y taparía el cuadro con el color de lejos.
      op('caminata', 'fill-opacity', [
        'case', ['>=', ['get', 'b'], M.caminata.cortes_min.length], 0, 0.55 * on,
      ]);
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.tinta }}>
      <div ref={contRef} style={{ width, height }} />
    </AbsoluteFill>
  );
};
