/**
 * Manguera móvil: la pérdida de carga real, no la tabla de pulgar.
 *
 * Una manguera que se arrastra de parcela en parcela para llenar un bebedero es
 * la instalación de agua más común de un predio chico y la que peor se
 * dimensiona, porque se elige por el diámetro que había en la ferretería y se
 * descubre que no llega cuando ya está desenrollada.
 *
 * acequia ya tiene el motor hidráulico (`lib/hidraulica.ts`: Hazen-Williams,
 * velocidad, clase de caño, línea piezométrica sobre el perfil del terreno). Lo
 * que faltaba era el coeficiente correcto para una **manguera**, que no es el
 * del caño de catálogo, y los dos límites de la norma que acequia no estaba
 * aplicando.
 *
 * ── LAS FUENTES ─────────────────────────────────────────────────────────────
 * · **Tajrishy, M.A.M. y Hills, D.J. (1992)**, «Friction Losses in Layflat
 *   Manifold Hose and Drip-Tape Fittings», *Applied Engineering in Agriculture*
 *   8(3):343-346, ASAE, doi 10.13031/2013.26074. Es un ensayo de laboratorio,
 *   no una tabla heredada: *«Results indicate values for the Hazen-Williams
 *   roughness coefficient, C, of 135 and 140 for 76 mm (3 in.) and 102 mm
 *   (4 in.) diameter layflat plastic hoses, respectively.»*
 * · **USDA NRCS (2021)**, «Conservation Practice Standard — Irrigation Pipeline
 *   (Code 430)», NRCS California, agosto de 2021. De acá salen los dos límites
 *   de diseño: la velocidad máxima y la fracción de la presión nominal que se
 *   puede usar.
 *
 * ── EL HALLAZGO: EL CAÑO DE CATÁLOGO MIENTE A FAVOR ─────────────────────────
 * La tabla de materiales de `hidraulica.ts` usa C = 150 para PVC y polietileno,
 * que es el valor de catálogo del caño nuevo. La manguera **medida** da 135 a
 * 140. No parece mucho, pero Hazen-Williams va a la 1,852: pasar de 150 a 135 es
 * un **21 % más de pérdida de carga** sobre la misma manguera. En una tirada de
 * 200 m eso es la diferencia entre que llegue agua al bebedero y que llegue un
 * chorrito.
 *
 * Y es en la dirección peligrosa: el número de catálogo subestima la pérdida, o
 * sea que hace parecer suficiente una manguera que no alcanza.
 *
 * ── RANGO DE VALIDEZ ────────────────────────────────────────────────────────
 * El ensayo midió **dos** diámetros: 76 y 102 mm. Una manguera de 1 pulgada no
 * está medida ahí, y acequia no interpola hacia abajo un coeficiente que nadie
 * midió: usa el más desfavorable de los dos medidos y lo dice. Tampoco describe
 * una manguera floja: la medición es sobre manguera en presión de trabajo, que
 * es la que toma su sección.
 */

import {
  perdidaHazenWilliams, velocidad,
  VEL_MAX_NRCS_MS, FRACCION_PRESION_TRABAJO_NRCS, CARGA_MAX_SIN_CLASE_MCA,
} from './hidraulica';

export { VEL_MAX_NRCS_MS, FRACCION_PRESION_TRABAJO_NRCS, CARGA_MAX_SIN_CLASE_MCA };

export const FUENTE_TAJRISHY =
  'Tajrishy, M.A.M. y Hills, D.J. (1992) — Friction Losses in Layflat Manifold Hose and Drip-Tape Fittings, Applied Engineering in Agriculture 8(3):343-346';
export const FUENTE_NRCS_430 =
  'USDA NRCS (2021) — Conservation Practice Standard: Irrigation Pipeline (Code 430), NRCS California';

/** 1 pie = 0,3048 m. */
export const PIE_M = 0.3048;

// ─── Los tres límites de la norma ─────────────────────────────────────────────
//
// Los tres salen de la misma norma de cañerías de riego (NRCS 430) y los tres
// viven en `hidraulica.ts`, que es donde los usa el análisis de líneas; se
// reexportan arriba para que este módulo se lea solo:
//
//   · `VEL_MAX_NRCS_MS` = 1,52 m/s (5 pies/s) a sección llena, «in pipelines
//     with valves or some other flow control appurtenance placed within the
//     pipeline or at the downstream end». Una manguera móvil siempre termina en
//     una canilla, así que siempre cae en esa condición. acequia venía usando
//     2,0 m/s por defecto, sin fuente.
//   · `FRACCION_PRESION_TRABAJO_NRCS` = 0,72: «As a safety factor against surge,
//     keep the working pressure at any point at or below 72 percent of the
//     pressure rating of the pipe». acequia venía admitiendo el 91 %.
//   · `CARGA_MAX_SIN_CLASE_MCA` = 7,6 m.c.a. (25 pies): «If the pipe is not
//     pressure rated, the maximum allowable pressure shall be 25 feet of head».
//     Es el caso de casi toda manguera de ferretería.

// ─── El coeficiente medido ────────────────────────────────────────────────────

export interface MedicionC { diametro_mm: number; C: number; }

/** Los dos únicos diámetros medidos por Tajrishy y Hills (1992). */
export const C_MEDIDO: readonly MedicionC[] = [
  { diametro_mm: 76,  C: 135 },
  { diametro_mm: 102, C: 140 },
];

/** C de catálogo del caño nuevo de plástico, que es lo que usa `hidraulica.ts`. */
export const C_CATALOGO_PLASTICO = 150;

export interface CoeficienteManguera {
  C:          number;
  /** `true` si el diámetro pedido está entre los dos medidos. */
  en_rango:   boolean;
  fuente:     string;
  nota:       string;
}

/**
 * Coeficiente C para una manguera de un diámetro dado.
 *
 * Entre los dos diámetros medidos se interpola linealmente, que es lo único que
 * dos puntos autorizan. Afuera —y la mayoría de las mangueras de un predio están
 * afuera, por abajo— se usa el **más desfavorable de los dos medidos** y se
 * avisa. Extrapolar la tendencia (más chico, más rugoso) daría un número
 * plausible que nadie midió.
 */
export function coeficienteManguera(diametro_interior_mm: number): CoeficienteManguera {
  const [chico, grande] = [C_MEDIDO[0]!, C_MEDIDO[1]!];
  if (diametro_interior_mm >= chico.diametro_mm && diametro_interior_mm <= grande.diametro_mm) {
    const t = (diametro_interior_mm - chico.diametro_mm) / (grande.diametro_mm - chico.diametro_mm);
    return {
      C: chico.C + t * (grande.C - chico.C),
      en_rango: true,
      fuente: FUENTE_TAJRISHY,
      nota: 'Interpolado entre los dos diámetros medidos en el ensayo.',
    };
  }
  return {
    C: chico.C,
    en_rango: false,
    fuente: FUENTE_TAJRISHY,
    nota: diametro_interior_mm < chico.diametro_mm
      ? `El ensayo midió 76 y 102 mm; ${Math.round(diametro_interior_mm)} mm queda por debajo. Se usa C = ${chico.C}, el más desfavorable de los dos medidos, en lugar de extrapolar.`
      : `El ensayo midió 76 y 102 mm; ${Math.round(diametro_interior_mm)} mm queda por encima. Se usa C = ${chico.C} para no acreditarle a la manguera una lisura que no se midió.`,
  };
}

// ─── Diámetros de manguera que se consiguen ───────────────────────────────────

export interface DiametroManguera { pulgadas: string; interior_mm: number; }

export const DIAMETROS_MANGUERA: readonly DiametroManguera[] = [
  { pulgadas: '½"',  interior_mm: 13 },
  { pulgadas: '¾"',  interior_mm: 19 },
  { pulgadas: '1"',  interior_mm: 25 },
  { pulgadas: '1½"', interior_mm: 38 },
  { pulgadas: '2"',  interior_mm: 51 },
  { pulgadas: '2½"', interior_mm: 64 },
  { pulgadas: '3"',  interior_mm: 76 },
  { pulgadas: '4"',  interior_mm: 102 },
];

// ─── La pérdida ───────────────────────────────────────────────────────────────

export interface PerdidaManguera {
  perdida_m:        number;
  /** Lo que daría el C de catálogo, para ver la diferencia. */
  perdida_catalogo_m: number;
  /** Cuánto más pierde de verdad, en veces. */
  veces_catalogo:   number;
  coeficiente:      CoeficienteManguera;
  velocidad_ms:     number;
  /** Largo usado en la cuenta, con los acoples ya sumados como largo equivalente. */
  largo_efectivo_m: number;
  avisos:           string[];
}

/**
 * Pérdida de carga de una tirada de manguera.
 *
 * Usa el mismo Hazen-Williams de `hidraulica.ts` —una sola fórmula en toda la
 * app— con el C medido en vez del de catálogo.
 *
 * Las pérdidas locales de los acoples entran como **largo equivalente**, que es
 * exactamente la forma en que la fuente las publica: *«The head losses for a
 * variety of drip-tape fittings are presented in terms of tape length producing
 * an equivalent friction loss.»* El ensayo no midió acoples de manguera de
 * bebedero, así que `largo_equivalente_m` lo pone quien conoce la instalación y
 * por defecto es cero; lo que acequia no hace es inventarle un porcentaje.
 *
 * NRCS 430 pide que estén: *«Evaluate and include other head losses (called
 * minor or local losses) from a change in velocity and direction of flow due to
 * inlet type, valves, bends, enlargements, or contractions.»* Si van en cero, el
 * aviso lo dice.
 */
export function perdidaManguera(p: {
  caudal_m3s: number; diametro_interior_mm: number; largo_m: number;
  largo_equivalente_m?: number;
}): PerdidaManguera | null {
  const { caudal_m3s, diametro_interior_mm, largo_m } = p;
  if (caudal_m3s <= 0 || diametro_interior_mm <= 0 || largo_m <= 0) return null;

  const D_m = diametro_interior_mm / 1000;
  const equivalente = Math.max(0, p.largo_equivalente_m ?? 0);
  const largo_efectivo_m = largo_m + equivalente;
  const coeficiente = coeficienteManguera(diametro_interior_mm);

  const perdida_m = perdidaHazenWilliams(caudal_m3s, coeficiente.C, D_m, largo_efectivo_m);
  const perdida_catalogo_m = perdidaHazenWilliams(caudal_m3s, C_CATALOGO_PLASTICO, D_m, largo_efectivo_m);
  const vel = velocidad(caudal_m3s, D_m);

  const avisos: string[] = [];
  if (!coeficiente.en_rango) avisos.push(coeficiente.nota);
  if (vel > VEL_MAX_NRCS_MS) {
    avisos.push(`La velocidad es de ${vel.toFixed(2)} m/s y la norma de cañerías de riego pone el techo en ${VEL_MAX_NRCS_MS.toFixed(2)} m/s (5 pies/s) cuando la línea termina en una canilla, que es el caso de toda manguera. No es por fricción: es por el golpe al cerrar.`);
  }
  if (equivalente === 0) {
    avisos.push('Sin largo equivalente por acoples: la cuenta es sólo fricción del tubo. La norma pide incluir las pérdidas locales de acoples, codos y canillas.');
  }
  return {
    perdida_m, perdida_catalogo_m,
    veces_catalogo: perdida_catalogo_m > 0 ? perdida_m / perdida_catalogo_m : 1,
    coeficiente, velocidad_ms: vel, largo_efectivo_m, avisos,
  };
}

// ─── El dimensionado ──────────────────────────────────────────────────────────

export interface OpcionManguera {
  diametro:      DiametroManguera;
  perdida:       PerdidaManguera;
  /** Carga que queda en la punta (m.c.a.), con el desnivel ya aplicado. */
  carga_final_m: number;
  alcanza:       boolean;
}

export interface ResultadoManguera {
  elegida:  OpcionManguera | null;
  opciones: OpcionManguera[];
  avisos:   string[];
}

/**
 * Qué diámetro de manguera hay que comprar.
 *
 * `carga_disponible_m` es la carga en el punto de toma (la altura del tanque, o
 * la presión de la bomba). `desnivel_m` es cuánto sube la manguera hasta la
 * punta —negativo si baja—. `carga_min_punta_m` es lo que tiene que quedar para
 * que el artefacto del final funcione.
 */
export function dimensionarManguera(p: {
  caudal_m3s:         number;
  largo_m:            number;
  carga_disponible_m: number;
  desnivel_m?:        number;
  carga_min_punta_m?: number;
  largo_equivalente_m?: number;
}): ResultadoManguera {
  const desnivel = p.desnivel_m ?? 0;
  const minPunta = p.carga_min_punta_m ?? 0;
  const opciones: OpcionManguera[] = [];

  for (const d of DIAMETROS_MANGUERA) {
    const perdida = perdidaManguera({
      caudal_m3s: p.caudal_m3s, diametro_interior_mm: d.interior_mm,
      largo_m: p.largo_m, largo_equivalente_m: p.largo_equivalente_m,
    });
    if (!perdida) continue;
    const carga_final_m = p.carga_disponible_m - perdida.perdida_m - desnivel;
    const alcanza = carga_final_m >= minPunta && perdida.velocidad_ms <= VEL_MAX_NRCS_MS;
    opciones.push({ diametro: d, perdida, carga_final_m, alcanza });
  }

  const elegida = opciones.find(o => o.alcanza) ?? null;
  const avisos: string[] = [];

  if (!elegida && opciones.length > 0) {
    avisos.push('Ningún diámetro de la serie llega con esa carga y esa longitud: hay que acortar la tirada, subir la toma o poner una bomba.');
  }
  if (elegida) {
    const conCatalogo = opciones.find(o =>
      o.diametro.interior_mm < elegida.diametro.interior_mm &&
      p.carga_disponible_m - o.perdida.perdida_catalogo_m - desnivel >= minPunta &&
      o.perdida.velocidad_ms <= VEL_MAX_NRCS_MS);
    if (conCatalogo) {
      avisos.push(`Con el coeficiente de catálogo (C = ${C_CATALOGO_PLASTICO}) habría alcanzado la de ${conCatalogo.diametro.pulgadas}. Con el medido en manguera no alcanza: es el error que hace comprar una manguera chica.`);
    }
    avisos.push(...elegida.perdida.avisos);
  }
  avisos.push(`Si la manguera no trae presión nominal impresa —el caso habitual—, la norma la limita a ${CARGA_MAX_SIN_CLASE_MCA.toFixed(1)} m.c.a. de carga de trabajo; y cuando sí la trae, sólo se puede usar el ${Math.round(FRACCION_PRESION_TRABAJO_NRCS * 100)} % de esa nominal como margen contra el golpe de ariete.`);

  return { elegida, opciones, avisos };
}
