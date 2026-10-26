/**
 * Cómo llegó muestreado el relieve, y cómo darse cuenta cuando llegó mal.
 *
 * ── El caso real, medido el 25/10/2026 ─────────────────────────────────────
 * `grillaGlo30` tiene dos caminos. El bueno lee la ventana de píxeles del COG
 * de Copernicus e interpola bilineal. El de respaldo —al que cae con CUALQUIER
 * excepción dentro del `try`, incluido un timeout de S3— pide una cota por
 * nodo y usa el píxel más cercano tal cual viene.
 *
 * Sobre el mismo bbox de un predio de 417 ha, con la misma grilla de 300×277 a
 * 12,3 m de paso:
 *
 * |                                   | ventana COG | por nodo |
 * |-----------------------------------|-------------|----------|
 * | nodos iguales a su vecino del este| 0,0 %       | 62 %     |
 * | celdas sin dirección de flujo D8  | ~0          | 29.577   |
 * | acumulación máxima                | 2.238       | **4**    |
 * | cadenas de escurrimiento          | 123         | **0**    |
 *
 * Y lo que hace que esto valga un módulo: **la versión mala no se nota
 * mirándola**. La cota mínima, la máxima y el desnivel dan casi iguales, el
 * sombreado se ve bien y las curvas de nivel se dibujan. Lo que se rompe en
 * silencio es todo lo que depende del D8 —escorrentías, swales, keyline, sitios
 * de represa, aptitud de uso—, porque sobre una meseta no hay vecino más bajo y
 * el flujo no tiene a dónde ir. Un predio con 369 m de desnivel y 30 % de
 * pendiente informaría que no escurre nada, sin un solo error.
 *
 * Es la falla que describe el CLAUDE.md del repo: acequia no falla
 * estrellándose, falla imprimiendo un número plausible y equivocado.
 *
 * ── Por qué se MIDE y no alcanza con preguntar de dónde vino ───────────────
 * Porque la procedencia no llega a todos lados. `/api/dem` cachea la respuesta
 * treinta días, así que una grilla degradada de hoy se sirve sin su bandera
 * hasta el mes que viene; los servicios nacionales resamplean del lado del
 * servidor y no dicen con qué método; y un DEM propio importado puede venir de
 * un remuestreo por vecino más cercano hecho en otro programa. La medición
 * funciona en los cuatro casos porque mira el dato, no su etiqueta.
 */

/** Quién interpoló el relieve que se está usando. */
export type MuestreoDEM =
  /** Leímos el ráster de origen y lo interpolamos nosotros, bilineal. */
  | 'bilineal'
  /** Pedimos una cota por nodo y la usamos como vino. Puede ser escalonada. */
  | 'por_nodo'
  /** La resampleó el servicio del proveedor, con un método que no declara. */
  | 'servicio';

/**
 * Proporción de nodos EXACTAMENTE iguales a su vecino del este, de 0 a 1.
 *
 * Es la huella del muestreo por vecino más cercano: cuando se pide una grilla
 * más fina que la fuente, varios nodos consecutivos caen en el mismo píxel y
 * salen con el mismo número repetido. Una interpolación bilineal no empata casi
 * nunca, porque el valor depende de la posición dentro del píxel.
 *
 * Se mira sólo hacia el este porque alcanza: el muestreo por nodo repite en las
 * dos direcciones, y recorrer una basta para detectarlo a la mitad del costo.
 */
export function proporcionDeMesetas(
  g: { cols: number; rows: number; elev: ArrayLike<number> },
): number {
  let iguales = 0;
  let pares = 0;
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols - 1; c++) {
      const a = g.elev[r * g.cols + c]!;
      const b = g.elev[r * g.cols + c + 1]!;
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      pares++;
      if (a === b) iguales++;
    }
  }
  return pares > 0 ? iguales / pares : 0;
}

/**
 * Arriba de esto la grilla está escalonada. Medido: 0,0 % por la ventana COG
 * contra 62 % por nodo, así que el 5 % no parte un pelo en dos — separa dos
 * poblaciones que no se tocan.
 */
export const UMBRAL_MESETAS = 0.05;

/**
 * Debajo de esta caída media por nodo, un empate entre vecinos no prueba nada.
 *
 * Es la salvedad que evita el falso positivo: un salar, una planicie de
 * inundación o un lago TIENEN vecinos con la misma cota, y ahí el dato está
 * bien aunque el D8 también sufra. La diferencia es que en terreno con relieve
 * el empate es imposible si alguien interpoló. Con 20 cm de caída media por
 * nodo —un predio de 60 m de desnivel sobre 300 nodos— ya no hay empates
 * legítimos a escala de grilla.
 */
const CAIDA_MINIMA_POR_NODO_M = 0.2;

export interface DiagnosticoMuestreo {
  /** Proporción de nodos iguales a su vecino, de 0 a 1. */
  mesetas: number;
  /** El relieve llegó escalonado y el D8 va a fallar en silencio. */
  escalonado: boolean;
  /** Caída media de cota entre un nodo y el siguiente, en metros. */
  caida_por_nodo_m: number;
}

/**
 * Mide si el relieve sirve para calcular flujo.
 *
 * No decide qué hacer: devuelve el número y el veredicto, y quien llama elige
 * si avisa, si no cachea, o si se niega. Es a propósito — negarse acá dejaría
 * sin curvas de nivel a un predio al que sí se le pueden dibujar.
 */
export function diagnosticarMuestreo(
  g: { cols: number; rows: number; elev: ArrayLike<number> },
): DiagnosticoMuestreo {
  const mesetas = proporcionDeMesetas(g);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < g.rows * g.cols; i++) {
    const v = g.elev[i]!;
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const lado = Math.max(g.cols, g.rows);
  const caida = Number.isFinite(min) && lado > 1 ? (max - min) / lado : 0;
  return {
    mesetas,
    caida_por_nodo_m: caida,
    escalonado: mesetas > UMBRAL_MESETAS && caida > CAIDA_MINIMA_POR_NODO_M,
  };
}
