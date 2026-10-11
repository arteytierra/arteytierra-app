/**
 * Los criterios publicados de la geometría Keyline.
 *
 * `lib/keyline.ts` dibujaba el patrón de cultivo con una sola regla —paralelas a
 * espaciado fijo desde la curva de nivel que pasa por el centroide— y medía su
 * calidad por la **pendiente residual a lo largo de las líneas**, premiando que
 * fuera cerca de cero. Las dos cosas están mal, y la segunda es la que importa:
 * **la deriva no es el error del método, es el método.**
 *
 * ── Por qué la deriva es el punto ───────────────────────────────────────────
 *
 * Yeomans lo explica en una sola parrafada, y es toda la geometría:
 *
 *   «Contours, which by nature are a uniform vertical distance apart, are
 *   parallel to each other on the vertical plane only. The contour lines
 *   depicting undulating land are not parallel to each other. Therefore if
 *   lines are made parallel to a contour on one side of it […] these lines do
 *   not remain on the contour but progressively develop a slope as the distance
 *   from the initial contour increases. If other lines are made parallel to the
 *   same contour, but on the other side of it, they too would develop into
 *   sloping lines but their slope direction would be opposite.»
 *
 * Esa pendiente que aparece sola es la que mueve el agua. Arando paralelo a la
 * curva que pasa por el keypoint, los surcos *se van* de la vertiente hacia las
 * laderas, y eso es exactamente lo que se busca: sacar el agua del eje del valle
 * —donde erosiona— y repartirla en el lomo —donde se infiltra—. El propio
 * Yeomans remata la distinción que acequia no hacía:
 *
 *   «Although any cultivation parallel to a contour guide line is "contour
 *   cultivation", it is not necessarily Keyline pattern cultivation.»
 *
 * acequia hacía lo primero, lo llamaba como lo segundo, y le ponía «excelente»
 * cuanto más se parecía a lo primero.
 *
 * ── Pero la deriva tiene una banda, no es libre ─────────────────────────────
 *
 * Y acá entra la otra fuente, que mide lo que Yeomans no numera. El estándar de
 * laboreo en contorno del NRCS fija **techo y piso** a esa pendiente del surco:
 *
 *   «Row grades must be designed to be as near level as possible while allowing
 *   drainage. The maximum row grade must not exceed one-half of the
 *   up-and-down-hill slope percent used for conservation planning with a
 *   maximum 4-percent row grade.»
 *
 *   «Design the row grades with positive row drainage of not less than 0.2
 *   percent on slopes where ponding is a concern. This includes sites with soils
 *   with slow to very slow infiltration rates (soil hydrologic groups C or D),
 *   or where crops are sensitive to ponded water.»
 *
 * O sea que el 0,5 % que acequia llamaba «excelente» puede estar **por debajo
 * del mínimo publicado** en un suelo del grupo C o D: ahí el surco no drena y
 * encharca. Y el techo —la mitad de la pendiente del terreno, nunca más de 4 %—
 * es el que acequia no tenía: pasado eso el surco deja de repartir agua y se
 * convierte en un canal que erosiona.
 *
 * Las dos fuentes además coinciden en el remedio cuando la deriva se pasa, cada
 * una con sus palabras. NRCS: «When the row grade reaches the maximum allowable
 * design grade, a new baseline must be established up or down slope from the
 * last contour line». Yeomans: «it is better not to continue the parallel
 * cultivation mindlessly too far from any guide line. Two or sometimes three
 * contours at appropriate distances apart may be used if necessary». Es la misma
 * regla, y el NRCS le pone el número que la dispara.
 *
 * ── Y la directriz no es la curva de nivel ──────────────────────────────────
 *
 * Pavlov (HUMA) agrega la parte que vuelve el patrón ejecutable con una máquina:
 * no se hace el offset de la curva de nivel cruda, sino de **un perfil libre y
 * simplificado del contorno que sólo considere las formas principales del
 * terreno**, porque una curva real es una multitud de rectitas cada una con su
 * propia trayectoria y el offset produce formas que no se pueden manejar. Se
 * arranca del trazo de contorno simplificado **más largo** del área, y recién al
 * final se redondea.
 *
 * De ahí salen también los tres límites de máquina que faltaban: el headland de
 * maniobra (2 a 4 veces el ancho del implemento, y también **entre conjuntos de
 * patrones**), el ángulo máximo de giro de la mayoría de los tractores (50 a
 * 55°, así que un vértice de 30° es indibujable a campo) y el aviso de que
 * arriba de 20° de pendiente puede convenir otro patrón.
 *
 * Y una corrección conceptual que simplifica en vez de complicar: **el keypoint
 * no hace falta para dibujar la geometría**; sigue importando para ubicar
 * cuerpos de agua, que es para lo que Yeomans lo definió —«the highest site for
 * a storage dam in a primary valley […] is just below the Keyline of the valley
 * […] These may be called Keypoint dams»—.
 *
 * ── Qué hay y qué no hay en este módulo ────────────────────────────────────
 *
 * Acá viven los números publicados y la geometría pura: la banda de deriva, el
 * giro, el headland, la aptitud de la pendiente y la simplificación de la
 * directriz. Lo que necesita el modelo de elevación —elegir la directriz, medir
 * hacia dónde deriva cada surco— está en `lib/keyline.ts`, que importa de acá.
 *
 * Fuentes:
 *   · P.A. Yeomans / Ken B. Yeomans, «Water for Every Farm — Yeomans Keyline
 *     Plan» (el método publicado por P.A. Yeomans en 1954).
 *   · Georgi Pavlov (HUMA), «Entendiendo la aplicación de la geometría
 *     Keyline», prólogo de Darren J. Doherty.
 *   · USDA NRCS, Conservation Practice Standard 330 «Contour Farming»,
 *     NHCP, octubre 2017.
 *   · USDA NRCS, Conservation Practice Standard 386 «Field Border»,
 *     NHCP, enero 2024.
 */
import { PIE_M, PULGADA_M } from './represaDiseno';
import type { GrupoHidro } from './cuenca';

export const FUENTE_YEOMANS =
  'Yeomans — «Water for Every Farm: Yeomans Keyline Plan» (método de P.A. Yeomans, 1954)';
export const FUENTE_PAVLOV =
  'Georgi Pavlov (HUMA) — «Entendiendo la aplicación de la geometría Keyline», prólogo de Darren J. Doherty';
export const FUENTE_NRCS330 =
  'USDA NRCS — Conservation Practice Standard 330 «Contour Farming», NHCP, octubre 2017';
export const FUENTE_NRCS386 =
  'USDA NRCS — Conservation Practice Standard 386 «Field Border», NHCP, enero 2024';

// ─── La banda de deriva admisible del surco ──────────────────────────────────

/** Techo absoluto de la pendiente del surco, cualquiera sea la del terreno. */
export const DERIVA_MAX_PCT = 4;

/** El techo relativo: «one-half of the up-and-down-hill slope percent». */
export const DERIVA_MAX_FRACCION_PENDIENTE = 0.5;

/** Piso de drenaje donde el encharcamiento preocupa: «not less than 0.2 percent». */
export const DERIVA_MIN_DRENAJE_PCT = 0.2;

/** Los grupos hidrológicos que el estándar nombra como de infiltración lenta. */
export const GRUPOS_QUE_ENCHARCAN: readonly GrupoHidro[] = ['C', 'D'];

export interface BandaDeriva {
  /** Pendiente mínima del surco (%). 0 si el encharcamiento no es un problema acá. */
  min_pct: number;
  /** Pendiente máxima del surco (%). */
  max_pct: number;
  /** true si el piso de drenaje aplica (suelo C/D o cultivo sensible al agua). */
  pideDrenaje: boolean;
  /**
   * true cuando el piso queda por encima del techo. No es un error de cuenta:
   * es terreno demasiado plano para que el surco drene sin pasarse del grado
   * máximo, y el estándar ya avisa que debajo del 2 % de pendiente el laboreo
   * en contorno no es la herramienta.
   */
  bandaVacia: boolean;
  fuente: string;
  nota: string;
}

/**
 * La banda en la que la pendiente del surco puede moverse.
 *
 * El techo sale del terreno: la mitad de su pendiente, con tope de 4 %. El piso
 * sale del suelo: 0,2 % si la infiltración es lenta (grupos C y D) o el cultivo
 * no tolera agua parada, y 0 si no. **Los dos datos ya los tiene la app**: la
 * pendiente la calcula el patrón y el grupo hidrológico sale del panel de suelo.
 */
export function bandaDeriva(p: {
  pendienteTerreno_pct: number;
  grupoHidro?: GrupoHidro | null;
  cultivoSensibleAlAgua?: boolean;
}): BandaDeriva {
  const pend = Number.isFinite(p.pendienteTerreno_pct) ? Math.max(0, p.pendienteTerreno_pct) : 0;
  const max_pct = Math.min(DERIVA_MAX_PCT, pend * DERIVA_MAX_FRACCION_PENDIENTE);
  const pideDrenaje = (p.grupoHidro != null && GRUPOS_QUE_ENCHARCAN.includes(p.grupoHidro))
    || p.cultivoSensibleAlAgua === true;
  const min_pct = pideDrenaje ? DERIVA_MIN_DRENAJE_PCT : 0;
  const bandaVacia = min_pct > max_pct;

  const nota = bandaVacia
    ? `Con ${pend.toFixed(1)} % de pendiente el surco no puede drenar al 0,2 % que pide el suelo sin pasarse `
      + `del grado máximo (la mitad de la pendiente del terreno). En terreno así de plano el laboreo en contorno `
      + 'no es la herramienta: el estándar lo da por efectivo entre 2 y 10 % de pendiente.'
    : pideDrenaje
      ? `El surco tiene que correr entre ${min_pct.toFixed(1)} % y ${max_pct.toFixed(2)} %: el piso es el drenaje `
        + 'que pide un suelo de infiltración lenta, y el techo es la mitad de la pendiente del terreno.'
      : `El surco puede correr hasta ${max_pct.toFixed(2)} %, la mitad de la pendiente del terreno con tope de 4 %. `
        + 'Sin suelo de infiltración lenta no hay piso de drenaje, pero sí lo hay de función: a cero no mueve agua.';

  return { min_pct, max_pct, pideDrenaje, bandaVacia, fuente: FUENTE_NRCS330, nota };
}

// ─── Aptitud de la pendiente y del largo de ladera ───────────────────────────

/** Rango en el que el estándar da el laboreo en contorno por más efectivo. */
export const PENDIENTE_EFECTIVA_MIN_PCT = 2;
export const PENDIENTE_EFECTIVA_MAX_PCT = 10;

/** Arriba de esto Pavlov avisa que puede convenir otro patrón (surcos a 90°). */
export const PENDIENTE_OTRO_PATRON_DEG = 20;

/** Largo de ladera en el que el estándar lo da por más efectivo: 100 a 400 pies. */
export const LARGO_LADERA_MIN_M = 100 * PIE_M;
export const LARGO_LADERA_MAX_M = 400 * PIE_M;

/** Lámina de la tormenta de 10 años y 24 h arriba de la cual pierde efectividad. */
export const LLUVIA_10A_24H_LIMITE_MM = 6.5 * PULGADA_M * 1000;

export type GradoAptitud = 'apto' | 'con_reservas' | 'otro_patron';

export interface AptitudKeyline {
  grado: GradoAptitud;
  motivos: string[];
  fuente: string;
}

/** Pendiente en % a grados. */
export const pctAGrados = (pct: number) => Math.atan(pct / 100) * 180 / Math.PI;

/**
 * Si el patrón corresponde en este terreno, y con qué reservas.
 *
 * Las tres condiciones son publicadas y ninguna estaba en la app. La de la
 * tormenta es de regalo: acequia ya calcula la lámina de 10 años y 24 h en la
 * pestaña de tormenta, y el estándar la usa como límite de efectividad.
 */
export function aptitudKeyline(p: {
  pendiente_pct: number;
  largoLadera_m?: number | null;
  lluvia10a24h_mm?: number | null;
}): AptitudKeyline {
  const motivos: string[] = [];
  let grado: GradoAptitud = 'apto';

  const deg = pctAGrados(p.pendiente_pct);
  if (deg > PENDIENTE_OTRO_PATRON_DEG) {
    grado = 'otro_patron';
    motivos.push(
      `${p.pendiente_pct.toFixed(0)} % de pendiente son ${deg.toFixed(0)}°, arriba de los 20° en los que `
      + 'puede convenir otro patrón: surcos a 90° de las curvas, para que la máquina gire en lo plano de arriba '
      + 'y de abajo.',
    );
  } else if (p.pendiente_pct > PENDIENTE_EFECTIVA_MAX_PCT) {
    grado = 'con_reservas';
    motivos.push(
      `Arriba del 10 % de pendiente el laboreo en contorno es menos efectivo para frenar la erosión; acá hay `
      + `${p.pendiente_pct.toFixed(0)} %.`,
    );
  } else if (p.pendiente_pct < PENDIENTE_EFECTIVA_MIN_PCT) {
    grado = 'con_reservas';
    motivos.push(
      `Debajo del 2 % de pendiente la práctica pierde sentido —no hay escurrimiento que redirigir— y el surco `
      + `apenas puede drenar; acá hay ${p.pendiente_pct.toFixed(1)} %.`,
    );
  }

  const largo = p.largoLadera_m;
  if (largo != null && Number.isFinite(largo) && largo > 0) {
    if (largo > LARGO_LADERA_MAX_M) {
      if (grado === 'apto') grado = 'con_reservas';
      motivos.push(
        `La ladera mide ${Math.round(largo)} m. Arriba de los 122 m (400 pies) «the volume and velocity of `
        + 'overland flow exceeds the capacity of the contour ridges to contain them»: hace falta cortar la '
        + 'ladera con otra práctica, no estirar el patrón.',
      );
    } else if (largo < LARGO_LADERA_MIN_M) {
      motivos.push(
        `La ladera mide ${Math.round(largo)} m, debajo de los 30 m (100 pies) del rango de mayor efectividad. `
        + 'No invalida el patrón: lo vuelve poco relevante.',
      );
    }
  }

  const lluvia = p.lluvia10a24h_mm;
  if (lluvia != null && Number.isFinite(lluvia) && lluvia >= LLUVIA_10A_24H_LIMITE_MM) {
    if (grado === 'apto') grado = 'con_reservas';
    motivos.push(
      `La tormenta de 10 años y 24 h deja ${Math.round(lluvia)} mm, por encima de los 165 mm (6,5 pulgadas) `
      + 'arriba de los cuales el estándar da la práctica por menos efectiva. El patrón sigue sirviendo para '
      + 'repartir el agua de las lluvias comunes, pero no es el que va a contener la grande.',
    );
  }

  return { grado, motivos, fuente: FUENTE_NRCS330 };
}

// ─── El giro del tractor ─────────────────────────────────────────────────────

/**
 * Giro máximo de la mayoría de los tractores, en grados de cambio de dirección.
 *
 * El rango publicado es 50 a 55°; se toma el extremo exigente, que es el que
 * marca más vértices. Marcar de más es un aviso; marcar de menos es un vértice
 * que a campo no se puede trazar.
 */
export const GIRO_MAX_TRACTOR_DEG = 50;
export const GIRO_MAX_TRACTOR_DEG_PERMISIVO = 55;

/** Ángulo interior mínimo de un vértice del patrón: 180° menos el giro máximo. */
export const ANGULO_INTERIOR_MIN_DEG = 180 - GIRO_MAX_TRACTOR_DEG;

/**
 * Cuánto cambia la pendiente de los rayos por cada grado que se abre el vértice
 * de la directriz. Pavlov lo da como regla práctica: «por cada 10 grados de
 * cambio en el ángulo de la geometría, la pendiente de los rayos cambia 5
 * grados». Es la razón de que el ángulo del vértice sea la palanca de diseño: la
 * bisectriz muestra por dónde va a derivar el offset, así que el ángulo se
 * elige de antemano para que el agua vaya de la vertiente a la ladera.
 */
export const DERIVA_POR_ANGULO_PAVLOV = 0.5;

export interface Punto2D { x: number; y: number }

export interface VerticeCerrado {
  /** Índice del vértice en la polilínea. */
  i: number;
  /** Cambio de dirección en ese vértice (grados). */
  giro_deg: number;
}

/**
 * Los vértices que un tractor no puede trazar.
 *
 * El giro de un vértice es el cambio de dirección, o sea 180° menos el ángulo
 * interior: una polilínea recta gira 0° y un vértice de 30° de ángulo interior
 * gira 150°. Se devuelven los que pasan el giro máximo.
 */
export function verticesCerrados(
  linea: readonly Punto2D[],
  giroMax_deg = GIRO_MAX_TRACTOR_DEG,
): VerticeCerrado[] {
  const out: VerticeCerrado[] = [];
  for (let i = 1; i + 1 < linea.length; i++) {
    const a = linea[i - 1]!, b = linea[i]!, c = linea[i + 1]!;
    const u = { x: b.x - a.x, y: b.y - a.y };
    const v = { x: c.x - b.x, y: c.y - b.y };
    const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
    if (lu < 1e-6 || lv < 1e-6) continue;
    const cos = Math.min(1, Math.max(-1, (u.x * v.x + u.y * v.y) / (lu * lv)));
    const giro = Math.acos(cos) * 180 / Math.PI;
    // El epsilon no es cosmético: un vértice que cae exactamente en el máximo
    // publicado sale del arcocoseno como 50,000000000000004, y marcar eso es
    // ponerle un aviso al usuario por el último bit de un float.
    if (giro > giroMax_deg + 1e-6) out.push({ i, giro_deg: Math.round(giro * 10) / 10 });
  }
  return out;
}

// ─── El headland de maniobra ─────────────────────────────────────────────────

export const HEADLAND_VECES_MIN = 2;
export const HEADLAND_VECES_MAX = 4;

/** Mínimo publicado de una franja de borde que además cumple función de borde de lote. */
export const BORDE_LOTE_MIN_M = 30 * PIE_M;

export interface Headland {
  min_m: number;
  max_m: number;
  /** Lo que acequia propone: el extremo bajo de la banda, redondeado al metro. */
  sugerido_m: number;
  fuente: string;
  nota: string;
}

/**
 * La franja de maniobra en los extremos del patrón.
 *
 * Dos a cuatro veces el ancho del implemento, en el borde del área y **también
 * entre conjuntos de patrones**: una máquina de 5 m pide de 10 a 20 m. Sin esto
 * el patrón llega hasta el alambrado y la máquina no tiene dónde girar, que es
 * lo que hacía acequia.
 *
 * El segundo número es de otra fuente y de otra función: si esa franja además va
 * a hacer de borde de lote —vegetación permanente que frena la erosión del
 * borde—, el mínimo publicado es de 30 pies, 9,14 m. No se suman: se avisa cuál
 * manda.
 */
export function headland(p: { anchoImplemento_m: number; tambienBordeDeLote?: boolean }): Headland {
  const ancho = Number.isFinite(p.anchoImplemento_m) && p.anchoImplemento_m > 0 ? p.anchoImplemento_m : 3;
  const min_m = ancho * HEADLAND_VECES_MIN;
  const max_m = ancho * HEADLAND_VECES_MAX;
  const manda = p.tambienBordeDeLote === true && BORDE_LOTE_MIN_M > min_m;
  const sugerido_m = Math.round(manda ? BORDE_LOTE_MIN_M : min_m);
  return {
    min_m: Math.round(min_m * 10) / 10,
    max_m: Math.round(max_m * 10) / 10,
    sugerido_m,
    fuente: FUENTE_PAVLOV,
    nota: manda
      ? `Con un implemento de ${ancho} m la maniobra pide de ${min_m.toFixed(0)} a ${max_m.toFixed(0)} m, pero `
        + 'como esta franja también va a hacer de borde de lote manda el mínimo de 30 pies (9,1 m) del estándar '
        + 'de borde de lote.'
      : `Con un implemento de ${ancho} m la franja de maniobra va de ${min_m.toFixed(0)} a ${max_m.toFixed(0)} m. `
        + 'El headland va en el borde del área y también entre conjuntos de patrones.',
  };
}

// ─── La directriz simplificada ───────────────────────────────────────────────

/**
 * Simplifica una polilínea conservando sólo las formas principales
 * (Douglas-Peucker: se descartan los vértices que estén a menos de `tolerancia_m`
 * de la recta que une los extremos del tramo).
 *
 * Es el reemplazo de hacer el offset de la curva de nivel cruda. No es lo mismo
 * que suavizar: suavizar redondea las esquinas y deja los cincuenta vértices,
 * así que el offset arrastra cada ondulación. Simplificar **saca** los vértices
 * que no son formas del terreno, que es lo que la fuente pide, y el redondeo va
 * después.
 */
export function simplificarDirectriz(linea: readonly Punto2D[], tolerancia_m: number): Punto2D[] {
  const n = linea.length;
  if (n <= 2 || !(tolerancia_m > 0)) return [...linea];
  const conservar = new Uint8Array(n);
  conservar[0] = 1; conservar[n - 1] = 1;

  const pila: Array<[number, number]> = [[0, n - 1]];
  while (pila.length > 0) {
    const [ini, fin] = pila.pop()!;
    if (fin <= ini + 1) continue;
    const a = linea[ini]!, b = linea[fin]!;
    const abx = b.x - a.x, aby = b.y - a.y;
    const lab = Math.hypot(abx, aby);
    let peor = -1, dPeor = -1;
    for (let i = ini + 1; i < fin; i++) {
      const p = linea[i]!;
      // Distancia del punto a la recta a–b (al punto a si el tramo es degenerado).
      const d = lab < 1e-9
        ? Math.hypot(p.x - a.x, p.y - a.y)
        : Math.abs(abx * (a.y - p.y) - aby * (a.x - p.x)) / lab;
      if (d > dPeor) { dPeor = d; peor = i; }
    }
    if (dPeor > tolerancia_m && peor > 0) {
      conservar[peor] = 1;
      pila.push([ini, peor], [peor, fin]);
    }
  }

  const out: Punto2D[] = [];
  for (let i = 0; i < n; i++) if (conservar[i]) out.push(linea[i]!);
  return out;
}

/**
 * Redondea los vértices de la directriz con un arco de radio acotado.
 *
 * Es el «redondear después si hace falta» de la fuente, y el radio tiene que
 * estar acotado por una razón que se ve en cuanto se prueba: un suavizado por
 * corte de esquina —tipo Chaikin— reemplaza el vértice por una cuerda que se
 * come la mitad del tramo adyacente. Sobre una curva de nivel cruda, con sus
 * cincuenta vértices pegados, eso casi no se nota; sobre una directriz ya
 * simplificada a tres vértices **destruye la forma**, y con ella la deriva: en
 * una vertiente, cortar el ángulo hace que las líneas bajen hacia el eje del
 * valle, que es exactamente lo contrario de lo que el método busca.
 *
 * Acá el vértice se reemplaza por un arco tangente a los dos tramos, con la
 * tangente limitada a poco menos de la mitad del tramo más corto para que dos
 * redondeos vecinos no se superpongan. Si el límite aprieta, el radio efectivo
 * baja; la forma se conserva.
 *
 * El radio natural es el de giro de la máquina: Pavlov señala que entre líneas
 * paralelas la distancia en los ángulos es mayor que entre sus rayos, así que
 * **redondear no rompe la equidistancia general** y es la salida para los
 * vértices que un tractor no puede trazar.
 */
export function redondearVertices(
  linea: readonly Punto2D[],
  radio_m: number,
  puntosPorArco = 6,
): Punto2D[] {
  if (linea.length < 3 || !(radio_m > 0)) return [...linea];
  const out: Punto2D[] = [linea[0]!];
  for (let i = 1; i + 1 < linea.length; i++) {
    const a = linea[i - 1]!, b = linea[i]!, c = linea[i + 1]!;
    const ux = a.x - b.x, uy = a.y - b.y;
    const vx = c.x - b.x, vy = c.y - b.y;
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    if (lu < 1e-6 || lv < 1e-6) continue;
    const nux = ux / lu, nuy = uy / lu, nvx = vx / lv, nvy = vy / lv;
    const cos = Math.min(1, Math.max(-1, nux * nvx + nuy * nvy));
    const interior = Math.acos(cos);
    // Casi recto o casi doblado sobre sí mismo: no hay arco que valga la pena.
    if (interior > Math.PI - 1e-3 || interior < 1e-3) { out.push(b); continue; }
    // Tangente teórica del arco, y el tope que evita que dos arcos se pisen.
    const tTeorica = radio_m / Math.tan(interior / 2);
    const t = Math.min(tTeorica, 0.45 * Math.min(lu, lv));
    if (t < 1e-6) { out.push(b); continue; }
    const p0 = { x: b.x + nux * t, y: b.y + nuy * t };
    const p1 = { x: b.x + nvx * t, y: b.y + nvy * t };
    // Arco aproximado por interpolación sobre la bisectriz: la cuadrática de
    // Bézier con el vértice como control es tangente a los dos tramos en p0 y
    // p1, que es lo que importa para que la máquina no tenga que frenar.
    out.push(p0);
    for (let k = 1; k < puntosPorArco; k++) {
      const u = k / puntosPorArco;
      const w = (1 - u) * (1 - u), wb = 2 * (1 - u) * u, w1 = u * u;
      out.push({ x: w * p0.x + wb * b.x + w1 * p1.x, y: w * p0.y + wb * b.y + w1 * p1.y });
    }
    out.push(p1);
  }
  out.push(linea[linea.length - 1]!);
  return out;
}

// ─── El veredicto del patrón ─────────────────────────────────────────────────

export interface TramoPatron {
  largo_m: number;
  /** Pendiente a lo largo del surco (%), siempre positiva. */
  deriva_pct: number;
  /**
   * true si el agua que corre por el surco va hacia la ladera (lo que se busca),
   * false si va hacia la vertiente (lo que se quiere evitar), null si no se
   * pudo decidir.
   */
  haciaLadera: boolean | null;
}

export type VeredictoPatron =
  /** La mayor parte del patrón deriva hacia la ladera y dentro de la banda. */
  | 'keyline'
  /** La deriva es tan chica que esto es laboreo en contorno, no patrón Keyline. */
  | 'contorno'
  /** La mayor parte deriva hacia la vertiente: concentra agua en vez de repartirla. */
  | 'reversa'
  /** La deriva se pasa del grado máximo: el surco deja de repartir y erosiona. */
  | 'excede';

export interface ResumenPatron {
  veredicto: VeredictoPatron;
  /** Fracción del largo del patrón que deriva hacia la ladera (0–1). */
  fraccionHaciaLadera: number;
  /** Fracción del largo cuya deriva cae dentro de la banda publicada (0–1). */
  fraccionEnBanda: number;
  /** Deriva media, ponderada por largo (%). */
  deriva_media_pct: number;
  /** Fracción del largo con la deriva por encima del techo (0–1). */
  fraccionExcedida: number;
  largoTotal_m: number;
}

/**
 * Qué está haciendo el patrón con el agua.
 *
 * Reemplaza a la métrica anterior —«pendiente residual, menos es mejor»— que
 * puntuaba el patrón por el criterio opuesto al del método que le da el nombre.
 * Acá se mide lo que la fuente pide: cuánto del patrón deriva **hacia la
 * ladera** y cuánto de esa deriva cae dentro de la banda publicada.
 *
 * El orden de los veredictos tiene su razón, y el primer intento lo tuvo mal.
 * Primero se mira si la deriva se pasa del techo, porque un surco que erosiona
 * es un problema de obra. Después si la deriva es tan chica que no mueve el agua
 * de lugar: eso es laboreo en contorno y **preguntar para qué lado deriva algo
 * que no deriva no tiene sentido**. Recién con una deriva que existe se mira si
 * va para el lado contrario, que es el daño que el método vino a evitar.
 *
 * Ponerlo al revés —mirar la dirección antes de la magnitud— hace que el patrón
 * que corre exactamente a nivel salga rotulado «deriva invertida», que es una
 * alarma falsa: no hay deriva ninguna.
 */
export function resumirPatron(tramos: readonly TramoPatron[], banda: BandaDeriva): ResumenPatron {
  let total = 0, haciaLadera = 0, enBanda = 0, excedido = 0, suma = 0;
  for (const t of tramos) {
    if (!(t.largo_m > 0) || !Number.isFinite(t.deriva_pct)) continue;
    total += t.largo_m;
    suma += t.deriva_pct * t.largo_m;
    if (t.haciaLadera === true) haciaLadera += t.largo_m;
    if (t.deriva_pct > banda.max_pct) excedido += t.largo_m;
    else if (t.deriva_pct >= banda.min_pct) enBanda += t.largo_m;
  }
  if (total <= 0) {
    return {
      veredicto: 'contorno', fraccionHaciaLadera: 0, fraccionEnBanda: 0,
      deriva_media_pct: 0, fraccionExcedida: 0, largoTotal_m: 0,
    };
  }
  const fLadera = haciaLadera / total;
  const fBanda = enBanda / total;
  const fExcede = excedido / total;
  const media = suma / total;

  const veredicto: VeredictoPatron =
    fExcede > 0.25 ? 'excede'
      : fBanda < 0.4 ? 'contorno'
        : fLadera < 0.4 ? 'reversa'
          : 'keyline';

  return {
    veredicto,
    fraccionHaciaLadera: Math.round(fLadera * 1000) / 1000,
    fraccionEnBanda: Math.round(fBanda * 1000) / 1000,
    deriva_media_pct: Math.round(media * 100) / 100,
    fraccionExcedida: Math.round(fExcede * 1000) / 1000,
    largoTotal_m: Math.round(total),
  };
}

/** Una línea de lectura del veredicto, con el porqué y no sólo el rótulo. */
export function leerVeredicto(r: ResumenPatron, banda: BandaDeriva): string {
  const pct = (f: number) => `${Math.round(f * 100)} %`;
  switch (r.veredicto) {
    case 'excede':
      return `El ${pct(r.fraccionExcedida)} del patrón corre con más del ${banda.max_pct.toFixed(2)} % de pendiente `
        + 'a lo largo del surco. Pasado ese grado el surco deja de repartir agua y se convierte en un canal que '
        + 'erosiona: hay que arrancar una directriz nueva más arriba o más abajo en vez de estirar esta.';
    case 'reversa':
      return `Sólo el ${pct(r.fraccionHaciaLadera)} del patrón lleva el agua hacia la ladera: el resto la lleva `
        + 'hacia la vertiente, que es lo contrario de lo que el método busca. Dos cosas lo producen y las dos '
        + 'tienen remedio publicado. Si es el lado del pareo, la directriz se parea hacia arriba en los lomos y '
        + 'hacia abajo en las vertientes por debajo de la keyline. Si el patrón da la vuelta por el vértice de la '
        + 'directriz —el fondo de la vertiente—, ahí el método no manda seguir de largo: la vertiente se trabaja '
        + 'en dos mitades, con el eje del valle como línea divisoria.';
    case 'contorno':
      return `Esto es laboreo en contorno, no patrón Keyline: el ${pct(1 - r.fraccionEnBanda)} del largo corre con `
        + `menos de ${banda.min_pct > 0 ? `${banda.min_pct.toFixed(1)} %` : 'pendiente apreciable'}, así que el `
        + 'surco no mueve el agua de lugar. Sirve para frenar la erosión; no reparte agua de la vertiente a la '
        + 'ladera.';
    case 'keyline':
      return `El ${pct(r.fraccionHaciaLadera)} del patrón lleva el agua hacia la ladera y el ${pct(r.fraccionEnBanda)} `
        + `corre con una pendiente dentro de la banda publicada (${banda.min_pct.toFixed(1)}–${banda.max_pct.toFixed(2)} %). `
        + 'Es lo que el método pide: sacar el agua del eje del valle y repartirla en el lomo.';
  }
}
