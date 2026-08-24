/**
 * Huella construida: bandas de ambientes y polígono de perímetro.
 *
 * Vive aparte de `svg.ts` porque la usan tres salidas distintas —planta de
 * techos, fachadas y vistas 3D— y todas tienen que hablar del mismo edificio.
 * Si cada una dedujera el contorno por su cuenta, el volumen 3D podría mostrar
 * un muro donde la planta no lo tiene.
 */
import type { RectanguloAmbiente } from './layout';

export interface Banda {
  y0: number;
  y1: number;
  /** Ancho de la banda: x máximo alcanzado por sus ambientes. */
  ancho: number;
}

/**
 * Extensión de cada banda de ambientes. `empaquetarBalanceado` da todas las
 * bandas del mismo ancho (huella rectangular exacta), pero el empaquetado
 * greedy de respaldo puede dejarlas escalonadas, y el contorno tiene que
 * seguir la huella real en los dos casos.
 */
/**
 * Diferencia de ancho por debajo de la cual dos bandas se consideran la misma.
 * `empaquetarBalanceado` reparte áreas con divisiones que no cierran exactas,
 * y deja bandas de 9,95 y 9,94 m. Sin este ajuste el perímetro suma un
 * escalón de un centímetro que después aparece como un muro parásito de 1 cm
 * en el volumen 3D y como un diente en la planta de techos.
 */
const TOLERANCIA_ANCHO_M = 0.03;

export function bandasDe(rects: RectanguloAmbiente[]): Banda[] {
  const porFila = new Map<number, Banda>();
  for (const r of rects) {
    const actual = porFila.get(r.fila);
    if (actual) {
      actual.y0 = Math.min(actual.y0, r.y_m);
      actual.y1 = Math.max(actual.y1, r.y_m + r.h_m);
      actual.ancho = Math.max(actual.ancho, r.x_m + r.w_m);
    } else {
      porFila.set(r.fila, { y0: r.y_m, y1: r.y_m + r.h_m, ancho: r.x_m + r.w_m });
    }
  }
  const bandas = [...porFila.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  if (!bandas.length) return bandas;

  // Si todas las bandas miden prácticamente lo mismo, la huella es un
  // rectángulo: se unifican al ancho mayor para que lo sea de verdad.
  const anchos = bandas.map(b => b.ancho);
  const maximo = Math.max(...anchos);
  if (maximo - Math.min(...anchos) <= TOLERANCIA_ANCHO_M) {
    for (const b of bandas) b.ancho = maximo;
  }
  return bandas;
}

/**
 * Polígono cerrado que envuelve la huella, expandido `expansion_m` hacia
 * afuera (0 para el muro, el alero para la proyección de techo). Devuelve los
 * vértices en metros, sin repetir el primero al final.
 *
 * Todas las bandas arrancan en x = 0, así que el lado oeste es recto y el este
 * puede quedar en escalera.
 */
export function puntosHuella(rects: RectanguloAmbiente[], expansion_m = 0): [number, number][] {
  const bandas = bandasDe(rects);
  if (!bandas.length) return [];
  const e = expansion_m;
  const ultima = bandas.length - 1;

  const pts: [number, number][] = [[-e, bandas[0]!.y0 - e]];
  bandas.forEach((b, i) => {
    pts.push([b.ancho + e, i === 0 ? b.y0 - e : b.y0]);
    pts.push([b.ancho + e, i === ultima ? b.y1 + e : b.y1]);
  });
  pts.push([-e, bandas[ultima]!.y1 + e]);

  return simplificar(pts);
}

/**
 * Deja el polígono con un vértice por esquina real.
 *
 * Quita dos cosas: vértices repetidos —que producen muros de largo cero al
 * extruir— y vértices intermedios alineados con sus vecinos, que dibujan una
 * esquina donde el muro sigue derecho. Bandas del mismo ancho generan ambos.
 */
function simplificar(pts: [number, number][]): [number, number][] {
  const sinRepetidos = pts.filter((p, i) => {
    const previo = pts[(i - 1 + pts.length) % pts.length]!;
    return Math.hypot(p[0] - previo[0], p[1] - previo[1]) > 1e-4;
  });
  if (sinRepetidos.length < 4) return sinRepetidos;

  return sinRepetidos.filter((p, i) => {
    const a = sinRepetidos[(i - 1 + sinRepetidos.length) % sinRepetidos.length]!;
    const b = sinRepetidos[(i + 1) % sinRepetidos.length]!;
    // Área del triángulo a-p-b: si es ~0, p no es una esquina.
    const doblearea = Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]));
    return doblearea > 1e-4;
  });
}

/** El mismo polígono como atributo `d` de un `<path>` SVG, en píxeles. */
export function pathHuella(rects: RectanguloAmbiente[], expansion_m: number, px_m: number): string {
  const pts = puntosHuella(rects, expansion_m);
  if (!pts.length) return '';
  const px = (v: number) => (v * px_m).toFixed(2);
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p[0])} ${px(p[1])}`).join(' ') + ' Z';
}
