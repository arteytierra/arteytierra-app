/**
 * Modulación ganadera: la superficie que el ganado realmente usa, y en cuántas
 * unidades de manejo conviene partirla.
 *
 * ## Qué estaba mal
 *
 * `calcularReceptividad` recibe las hectáreas del polígono y las trata como si
 * todas fueran pasto al alcance del animal. **No lo son, y por dos motivos
 * distintos que conviene no mezclar:**
 *
 * 1. Parte del predio **no es tierra de pastoreo**: el espejo de agua, el
 *    humedal, lo construido, el afloramiento pelado. Eso se descuenta en
 *    hectáreas y es una resta.
 * 2. Del resto, **el ganado no usa todo igual**. En terreno quebrado se queda en
 *    los bajos y las lomadas suaves, y lejos de la aguada no camina. Eso **no es
 *    una resta de superficie**: es un factor sobre la capacidad de carga, y
 *    tratarlo como hectáreas que desaparecen es el error clásico, porque esas
 *    hectáreas siguen existiendo, siguen produciendo pasto y siguen apareciendo
 *    en el plano.
 *
 * Y había un tercer problema, más grave porque es un número: el coeficiente de
 * cosecha estaba fijo en 0,50 con el argumento de «take half, leave half».
 * **La fuente que acuñó esa regla dice explícitamente dónde vale**, y no es
 * donde acequia la venía aplicando. Es el mismo error que ya apareció dos veces
 * en esta cadena —el equivalente vaca y el agua de bebida—: el valor de una
 * situación buena aplicado a todo el planeta.
 *
 * ## Las fuentes
 *
 * - **Holechek, J.L. (1988), «An approach for setting the stocking rate»,
 *   _Rangelands_ 10(1):10-14.** Es el trabajo que sistematiza las tres cosas que
 *   usa este módulo: el uso admisible por tipo de pastizal (Tabla 1 y el párrafo
 *   que la resume por precipitación), la reducción de capacidad por pendiente
 *   (Tabla 3) y la reducción por distancia al agua (Tabla 4). Trae además dos
 *   ejemplos resueltos completos, que son los tests.
 *
 * - **Spackman, C. (2023), «Estimating Carrying Capacity on Rangelands», NMSU
 *   Extension Guide B-829, noviembre de 2023.** Reproduce las dos tablas citando
 *   a Holechek y, lo que importa acá, escribe las dos como ecuaciones de media
 *   ponderada **y da la regla de cómo se combinan**:
 *     • «There can be a significant overlap of slope and distance from water in
 *       adjustment calculations, thus, these should be calculated separately with
 *       the greatest reduction percent used. They should not be combined for a
 *       cumulative reduction.»
 *   O sea: **no se multiplican.** Se calculan los dos y manda el peor. Esto es
 *   exactamente lo que uno haría mal por sentido común —una ladera lejana está
 *   doblemente castigada, parece razonable multiplicar— y la fuente dice que no,
 *   porque las dos reducciones describen en buena medida al mismo animal que no
 *   camina.
 *
 * - **Millward, M.F., Bailey, D.W., Cibils, A.F. y Holechek, J.L. (2020), «A
 *   GPS-Based Evaluation of Factors Commonly Used to Adjust Cattle Stocking Rates
 *   on Both Extensive and Mountainous Rangelands», _Rangelands_ 42(3):63-71**
 *   (doi:10.1016/j.rala.2020.04.001). Treinta y dos años después, con collares
 *   GPS y Holechek entre los autores, se mide cuánto valen sus propios factores.
 *   Es lo que fija el rango de validez de abajo.
 *
 * ## Rango de validez, que acá es media historia
 *
 * Los dos factores son **guías para fijar una carga inicial**, no mediciones, y
 * su propio autor lo escribe: *«there is no substitute for experience»*. El
 * trabajo de 2020 los puso a prueba con GPS en seis campos de Nuevo México:
 *
 * - **La pendiente salió bien parada.** Donde falló fue por conservadora: en dos
 *   campos de terreno quebrado el ganado usó pendientes moderadas más de lo que
 *   la tabla supone, y resultaron 14 puntos porcentuales más de superficie
 *   efectiva que la que predecía el ajuste.
 * - **La distancia al agua no se sostuvo donde el agua es escasa.** Con una sola
 *   aguada el ganado caminó bastante más de la milla: en un campo la superficie
 *   realmente usada fue 39 puntos porcentuales mayor que la estimada, y en otro
 *   pasó en la franja de 1,6 a 3,2 km más del doble del tiempo que le
 *   correspondería por superficie. Con varias aguadas, en cambio, la tabla
 *   acertó: 43 % usable medido contra 47 % estimado.
 *
 * Conclusión que este módulo adopta: **los dos factores se reportan por separado
 * y se dice cuál manda**, nunca se presentan como una medición, y el de agua se
 * marca como el más blando de los dos. Un predio con una sola aguada es
 * justamente el caso donde la tabla castiga de más.
 *
 * Dos cautelas más, propias de acequia y no de las fuentes:
 *
 * - **Las bandas de pendiente se calculan sobre un DEM**, y un DEM de 30 m alisa:
 *   la pendiente de celda sale más baja que la que mide un clinómetro en el
 *   mismo lugar. Con relieve nacional de 1 o 2 m el problema se da vuelta. El
 *   paso efectivo de la grilla se informa en pantalla por eso.
 * - **Las tablas son de pastizal natural extensivo de Norteamérica.** Para una
 *   pastura implantada bajo riego no dicen nada, y para la montaña tropical
 *   tampoco.
 *
 * ## Lo que este módulo NO hace
 *
 * No decide cuántas parcelas de rotación lleva cada módulo: eso es ocupación y
 * descanso, y vive en `pastoreo.ts`. Un **módulo** acá es una unidad de manejo
 * completa —un rodeo, su agua, su superficie—, y los potreros son la subdivisión
 * de adentro.
 *
 * ## Quién lee esto
 *
 * `produccion.ts` (la receptividad pasa a usar el uso admisible de acá en lugar
 * del 0,50 fijo), y el panel de Producción, pestaña Ganadería.
 */

import type { GrillaElevacion } from './grillaElevacion';
import { VENTANA_ABREVADO_H, VIAJES_POR_DIA } from './abrevadero';

/** Una milla estadounidense en metros: la unidad en la que están las tablas. */
export const MILLA_M = 1609.344;

/** Una pulgada de lluvia en milímetros. */
export const PULGADA_MM = 25.4;

export const FUENTE_HOLECHEK =
  'Holechek, J.L. (1988), «An approach for setting the stocking rate», Rangelands 10(1):10-14.';

export const FUENTE_B829 =
  'Spackman, C. (2023), «Estimating Carrying Capacity on Rangelands», NMSU Extension Guide B-829.';

export const FUENTE_GPS =
  'Millward, Bailey, Cibils y Holechek (2020), «A GPS-Based Evaluation of Factors Commonly Used to Adjust '
  + 'Cattle Stocking Rates on Both Extensive and Mountainous Rangelands», Rangelands 42(3):63-71.';

// ─── El uso admisible: qué fracción del pasto se le puede dar al animal ───────

/**
 * Coeficiente de cosecha por banda de precipitación.
 *
 * Holechek (1988) resume su Tabla 1 en un párrafo que es el que se codifica acá,
 * porque es el que habla en precipitación —que es el dato que acequia tiene— y no
 * en nombres de pastizales de Estados Unidos:
 *
 *   • Arbustal desértico, **menos de 12 pulgadas** de lluvia media: 25 a 35 %.
 *   • Pastizales de **12 a 25 pulgadas**, como la pradera de pasto corto: 35 a 45 %.
 *   • Pastizales húmedos, **más de 25 pulgadas**: 45 a 60 %.
 *
 * Y la frase que corrige a acequia, textual: *«The general guideline of take half
 * and leave half of the current season's growth recommended by early range
 * managers appears applicable only to humid and annual grassland ranges.»*
 *
 * El `inicial` de cada banda es el valor que el mismo artículo recomienda cuando
 * **no hay información local de intensidad de pastoreo**, que es siempre el caso
 * de acequia: 30 % para el arbustal desértico, 40 % para el pastizal árido, 50 %
 * para el húmedo y 55 % para el de anuales.
 *
 * Qué se rompe si esto cambia: la receptividad del campo, y por esa vía la carga
 * objetivo, el número de módulos y el agua de bebida que lee la represa.
 */
export interface BandaUso {
  id: 'desertico' | 'arido' | 'humedo' | 'anuales';
  nombre: string;
  /** Tope de precipitación media anual de la banda, en mm. */
  hasta_mm: number;
  /** El valor para una carga inicial sin información local. */
  inicial: number;
  min: number;
  max: number;
}

export const BANDAS_USO: readonly BandaUso[] = [
  { id: 'desertico', nombre: 'Arbustal desértico',          hasta_mm: 12 * PULGADA_MM, inicial: 0.30, min: 0.25, max: 0.35 },
  { id: 'arido',     nombre: 'Pastizal árido o semiárido',  hasta_mm: 25 * PULGADA_MM, inicial: 0.40, min: 0.35, max: 0.45 },
  { id: 'humedo',    nombre: 'Pastizal húmedo',             hasta_mm: Infinity,        inicial: 0.50, min: 0.45, max: 0.60 },
];

/**
 * El pastizal de anuales no es una banda de lluvia: es un tipo de vegetación.
 * Holechek lo separa porque aguanta más uso que un perenne con la misma lluvia
 * —la planta ya cumplió su ciclo y dejó semilla—, así que entra como opción
 * explícita y no por precipitación.
 */
export const USO_ANUALES: BandaUso = {
  id: 'anuales', nombre: 'Pastizal de anuales', hasta_mm: Infinity, inicial: 0.55, min: 0.50, max: 0.60,
};

export function bandaUso(precip_anual_mm: number, deAnuales = false): BandaUso {
  if (deAnuales) return USO_ANUALES;
  if (!Number.isFinite(precip_anual_mm) || precip_anual_mm < 0) return BANDAS_USO[0]!;
  return BANDAS_USO.find(b => precip_anual_mm < b.hasta_mm) ?? BANDAS_USO[BANDAS_USO.length - 1]!;
}

/**
 * Corrección del forraje medido por cómo venía el año.
 *
 * Holechek: una medición de pasto en pie al final de un ciclo **bueno** (más del
 * 125 % de la lluvia media) hay que bajarla un 30 % para estimar la producción
 * de largo plazo, y una medición de un ciclo **malo** (menos del 70 %) hay que
 * subirla un 30 %. Y el límite honesto, que es la parte importante: *«In years
 * when precipitation deviates by 50 % or more from the average, reliable
 * estimates of grazing capacity in most cases will not be possible.»*
 *
 * Devuelve `null` en ese caso, que es la respuesta correcta y no un número.
 */
export interface AjusteAnio {
  factor: number | null;
  /** `null` cuando no hay con qué comparar. */
  desvio_pct: number | null;
  motivo: string;
}

export function ajusteAnioPrevio(precip12m: number | null, precipMedia: number): AjusteAnio {
  if (precip12m === null || !Number.isFinite(precip12m) || !(precipMedia > 0)) {
    return { factor: 1, desvio_pct: null, motivo: 'Sin la lluvia de los últimos doce meses, el forraje se toma como el del año medio.' };
  }
  const razon = precip12m / precipMedia;
  const desvio_pct = Math.round((razon - 1) * 100);
  if (razon >= 1.5 || razon <= 0.5) {
    return {
      factor: null, desvio_pct,
      motivo: `La lluvia de los últimos doce meses se apartó ${Math.abs(desvio_pct)} % de la media: con ese desvío la fuente dice que no se puede estimar la capacidad de carga de forma confiable.`,
    };
  }
  if (razon > 1.25) {
    return { factor: 0.70, desvio_pct, motivo: 'Vino un año húmedo: el pasto que se ve hoy es más que el del año medio, así que se baja un 30 % para no cargar sobre una excepción.' };
  }
  if (razon < 0.70) {
    return { factor: 1.30, desvio_pct, motivo: 'Vino un año seco: lo que se ve hoy subestima al año medio, así que se sube un 30 %.' };
  }
  return { factor: 1, desvio_pct, motivo: 'La lluvia de los últimos doce meses estuvo cerca de la media: el pasto en pie se toma tal cual.' };
}

// ─── El terreno: cuánto de la capacidad se pierde por pendiente ───────────────

export interface BandaPendiente {
  desde_pct: number;
  hasta_pct: number;
  /** Fracción de la capacidad de carga que queda en esa banda. */
  factor: number;
  rotulo: string;
}

/**
 * Tabla 3 de Holechek (1988), «Suggested reductions in cattle grazing capacity
 * for different percentages of slope»: sin reducción hasta 10 %, 30 % de
 * reducción entre 11 y 30, 60 % entre 31 y 60, y arriba de 60 % se considera no
 * pastoreable. Los factores de acá son el complemento de esas reducciones.
 *
 * ## Una inconsistencia de las fuentes, resuelta a favor de la tabla
 *
 * Las dos publicaciones traen la tabla y traen además la cuenta escrita como
 * ecuación, **y no coinciden entre sí**:
 *
 *   • Tabla 3 de Holechek y Tabla 4 de B-829 (idénticas): reducciones
 *     0 / 30 / 60 / 100, o sea factores **1,00 / 0,70 / 0,40 / 0**.
 *   • El ejemplo resuelto de Holechek: `(.40 × 1) + (.2 × .7) + (.3 × .3) + (.1 × 0)`,
 *     o sea factores 1,00 / 0,70 / **0,30** / 0.
 *   • La ecuación de B-829: `(% 0-10 × 1) + (% 11-30 × 0.6) + (% 31-60 × 0.3) + (% >60 × 0)`,
 *     o sea factores 1,00 / **0,60** / **0,30** / 0.
 *
 * Las tres versiones discrepan en la banda de 31 a 60 % y dos de las tres en la
 * de 11 a 30. **Manda la tabla**, por dos razones: es la que las dos
 * publicaciones escriben igual, y es la que cada una presenta como el resultado
 * de la literatura que cita (Mueggler 1965, Cook 1966, Gillen et al. 1984),
 * mientras las ecuaciones son aritmética de un ejemplo.
 *
 * Consecuencia práctica, y por eso está escrito acá: **acequia no reproduce el
 * resultado impreso del ejemplo de Holechek.** Con sus propios datos la tabla da
 * 159 novillos y el artículo imprime 152. La diferencia es ese 0,30 contra 0,40,
 * y está en un test para que quede claro que no es un error nuestro.
 */
export const BANDAS_PENDIENTE: readonly BandaPendiente[] = [
  { desde_pct: 0,  hasta_pct: 10,       factor: 1.00, rotulo: 'hasta 10 %' },
  { desde_pct: 10, hasta_pct: 30,       factor: 0.70, rotulo: '10 a 30 %' },
  { desde_pct: 30, hasta_pct: 60,       factor: 0.40, rotulo: '30 a 60 %' },
  { desde_pct: 60, hasta_pct: Infinity, factor: 0,    rotulo: 'más de 60 %' },
];

/**
 * Las ovejas y las cabras suben donde la vaca no va. Holechek cita un trabajo de
 * invernada en Nuevo México (McDaniel y Tiedeman 1981) donde el ovino usó
 * parejas todas las pendientes de menos de 45 % y casi nada arriba de eso, así
 * que para ovino y caprino la tabla de bovinos no corre: es un escalón en 45 %.
 */
export const PENDIENTE_LIMITE_MENOR_PCT = 45;

export type PorteParaTerreno = 'bovino' | 'menor';

export interface DistribucionPendiente {
  /** Fracción del área en cada banda de `BANDAS_PENDIENTE`, en el mismo orden. */
  fracciones: number[];
  /** Celdas de la grilla que cayeron dentro del polígono y tenían dato. */
  celdas: number;
  /** Paso efectivo de la grilla, en metros: con qué resolución se midió esto. */
  paso_m: number;
  pendiente_media_pct: number;
}

/**
 * Reparte el predio en las bandas de pendiente de la tabla, celda por celda
 * sobre el DEM.
 *
 * La pendiente de cada celda sale de la **máxima diferencia de cota contra sus
 * ocho vecinas** dividida por la distancia a esa vecina. Es el criterio de
 * pendiente máxima local y no el gradiente promediado a propósito: lo que decide
 * si una vaca sube una loma es la parte más empinada del camino, no la media.
 *
 * Devuelve `null` sin grilla o sin celdas adentro: adivinar la distribución de
 * pendientes de un campo que no se midió sería inventar el número que después
 * multiplica a toda la receptividad.
 */
export function distribucionPendiente(
  g: GrillaElevacion | null,
  poly: Array<{ lat: number; lng: number }>,
): DistribucionPendiente | null {
  if (!g || g.rows < 3 || g.cols < 3 || poly.length < 3) return null;

  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const latC = (latMin + latMax) / 2;
  // Tamaño de celda en metros. En latitudes medias el paso en longitud es
  // bastante más chico que el de latitud, así que se guardan los dos.
  const dy = ((latMax - latMin) * 111_320) / (rows - 1);
  const dx = ((lngMax - lngMin) * 111_320 * Math.cos((latC * Math.PI) / 180)) / (cols - 1);
  const diag = Math.hypot(dx, dy);
  if (!(dx > 0) || !(dy > 0)) return null;

  const cuentas = BANDAS_PENDIENTE.map(() => 0);
  let celdas = 0;
  let sumaPend = 0;

  const vecinos: Array<[number, number, number]> = [
    [-1, 0, dy], [1, 0, dy], [0, -1, dx], [0, 1, dx],
    [-1, -1, diag], [-1, 1, diag], [1, -1, diag], [1, 1, diag],
  ];

  for (let r = 1; r < rows - 1; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 1; c < cols - 1; c++) {
      const z = elev[r * cols + c]!;
      if (Number.isNaN(z)) continue;
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (!puntoEnPoligono(lat, lng, poly)) continue;

      let maxPct = 0;
      for (const [dr, dc, dist] of vecinos) {
        const zv = elev[(r + dr) * cols + (c + dc)]!;
        if (Number.isNaN(zv)) continue;
        const pct = (Math.abs(z - zv) / dist) * 100;
        if (pct > maxPct) maxPct = pct;
      }

      const i = BANDAS_PENDIENTE.findIndex(b => maxPct <= b.hasta_pct);
      cuentas[i >= 0 ? i : BANDAS_PENDIENTE.length - 1]! += 1;
      sumaPend += maxPct;
      celdas += 1;
    }
  }

  if (celdas === 0) return null;
  return {
    fracciones: cuentas.map(n => n / celdas),
    celdas,
    paso_m: Math.round(Math.max(dx, dy) * 10) / 10,
    pendiente_media_pct: Math.round((sumaPend / celdas) * 10) / 10,
  };
}

/** Punto en polígono por cruce de rayo. Mismo criterio que `cutfill.ts`. */
function puntoEnPoligono(lat: number, lng: number, poly: Array<{ lat: number; lng: number }>): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.lng, yi = poly[i]!.lat;
    const xj = poly[j]!.lng, yj = poly[j]!.lat;
    const cruza = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/**
 * Factor de pendiente: la media de los factores de banda ponderada por la
 * superficie de cada banda, que es la ecuación de B-829.
 *
 * Para ovino y caprino no se usa la tabla de bovinos sino el escalón de 45 %:
 * todo lo que está por debajo cuenta entero y lo que está arriba no cuenta. Como
 * las bandas del DEM no cortan en 45, la banda de 30 a 60 se reparte por mitades
 * —45 cae casi al medio— y eso se dice acá para que nadie lo lea como precisión.
 */
export function factorPendiente(d: DistribucionPendiente, porte: PorteParaTerreno = 'bovino'): number {
  const f = d.fracciones;
  if (porte === 'menor') {
    const haciaArriba = f[2] ?? 0;
    return redondear4((f[0] ?? 0) + (f[1] ?? 0) + haciaArriba * 0.5);
  }
  let acc = 0;
  BANDAS_PENDIENTE.forEach((b, i) => { acc += (f[i] ?? 0) * b.factor; });
  return redondear4(acc);
}

// ─── El agua: cuánto de la capacidad se pierde por distancia a la aguada ──────

export interface BandaAgua {
  hasta_m: number;
  factor: number;
  rotulo: string;
}

/**
 * Tabla 4 de Holechek (1988): sin reducción hasta una milla de la aguada, 50 %
 * de reducción entre una y dos millas, y más de dos millas se considera no
 * pastoreable. Acá las dos tablas de las dos publicaciones coinciden y además
 * coinciden con la ecuación, así que no hay nada que resolver.
 *
 * Para ovino y caprino el propio Holechek dice que no corre —no necesitan beber
 * todos los días y usan sin problema lo que está a dos millas o más—, así que
 * `factorAgua` con porte `menor` devuelve 1.
 */
export const BANDAS_AGUA: readonly BandaAgua[] = [
  { hasta_m: MILLA_M,     factor: 1.00, rotulo: 'hasta 1,6 km' },
  { hasta_m: 2 * MILLA_M, factor: 0.50, rotulo: '1,6 a 3,2 km' },
  { hasta_m: Infinity,    factor: 0,    rotulo: 'más de 3,2 km' },
];

export interface DistribucionAgua {
  /** Fracción del área en cada banda de `BANDAS_AGUA`, en el mismo orden. */
  fracciones: number[];
}

export function factorAgua(d: DistribucionAgua, porte: PorteParaTerreno = 'bovino'): number {
  if (porte === 'menor') return 1;
  let acc = 0;
  BANDAS_AGUA.forEach((b, i) => { acc += (d.fracciones[i] ?? 0) * b.factor; });
  return redondear4(acc);
}

/**
 * Reparte un módulo cuadrado en las tres bandas de distancia al agua, según
 * dónde esté la aguada.
 *
 * Esto no es una tabla de nadie: es la geometría del módulo que el usuario está
 * diseñando, y existe porque el factor de la Tabla 4 necesita **una distribución
 * de superficie por banda** y no una distancia máxima. Se muestrea el cuadrado en
 * una grilla de 101 × 101 celdas de área igual y se mide la distancia de cada
 * celda a la aguada; las fracciones son las cuentas.
 *
 * El supuesto —módulo cuadrado, una sola aguada, sin barreras— es el mismo que
 * usa `distanciaMaxima_m` y es el que corresponde a esta altura del diseño:
 * cuando el potrero exista con su forma real, esto se calcula sobre el polígono.
 * Mientras tanto es exacto para lo que decide: si todo el módulo entra en la
 * milla, el factor es 1 y la tabla no reduce nada.
 */
export function distribucionAguaCuadrado(area_ha: number, aguaEn: AguaEn = 'centro'): DistribucionAgua {
  if (!(area_ha > 0)) return { fracciones: [1, 0, 0] };
  const lado = Math.sqrt(area_ha * 10_000);
  const px = aguaEn === 'esquina' ? 0 : lado / 2;
  const py = aguaEn === 'centro' ? lado / 2 : 0;
  const n = 101;
  const cuentas = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * lado;
    for (let j = 0; j < n; j++) {
      const y = ((j + 0.5) / n) * lado;
      const d = Math.hypot(x - px, y - py);
      const k = BANDAS_AGUA.findIndex(b => d <= b.hasta_m);
      cuentas[k >= 0 ? k : 2]! += 1;
    }
  }
  const tot = n * n;
  return { fracciones: cuentas.map(c => redondear4(c / tot)) };
}

/**
 * La distancia que un animal recorre dentro de un módulo, en el peor caso, según
 * dónde esté la aguada.
 *
 * Es geometría elemental y por eso no lleva fuente, pero es la pieza que
 * convierte la tabla de distancias en una decisión de diseño: no se puede
 * elegir el tamaño de un módulo sin saber dónde va el agua. Se supone el módulo
 * cuadrado, que es la forma a la que tiende un alambrado.
 */
export type AguaEn = 'centro' | 'borde' | 'esquina';

export function distanciaMaxima_m(area_ha: number, aguaEn: AguaEn = 'centro'): number {
  if (!(area_ha > 0)) return 0;
  const lado = Math.sqrt(area_ha * 10_000);
  // Centro: media diagonal. Borde (punto medio de un lado): hasta la esquina
  // opuesta. Esquina: la diagonal completa.
  const f = aguaEn === 'centro' ? Math.SQRT2 / 2 : aguaEn === 'borde' ? Math.hypot(1, 0.5) : Math.SQRT2;
  return Math.round(lado * f);
}

/**
 * La inversa: la superficie más grande que una aguada puede servir sin que el
 * animal pase del radio dado. Por defecto el radio es la milla de la Tabla 4, o
 * sea el tope de superficie por aguada sin que aparezca ninguna reducción.
 *
 * Con la aguada en el centro, un módulo cuadrado de hasta **518 ha** no obliga a
 * nadie a caminar más de 1,6 km. La misma aguada puesta en una esquina hace
 * caminar el doble, así que el tope cae a **130 ha**: un factor cuatro que se
 * decide con un portón, antes de comprar un rollo de alambre.
 */
export function areaMaxima_ha(radio_m: number = MILLA_M, aguaEn: AguaEn = 'centro'): number {
  if (!(radio_m > 0)) return 0;
  const f = aguaEn === 'centro' ? Math.SQRT2 / 2 : aguaEn === 'borde' ? Math.hypot(1, 0.5) : Math.SQRT2;
  const lado = radio_m / f;
  return Math.round(((lado * lado) / 10_000) * 10) / 10;
}

/**
 * Cuántas cabezas puede abrevar una aguada de caudal dado dentro de la ventana
 * que pide la norma.
 *
 * Sale de dar vuelta `abrevaEnLaVentana` de `abrevadero.ts`: el ganado va dos
 * veces por día, así que en cada visita hay que entregarle la mitad de la
 * necesidad diaria, y esa mitad tiene que entrar en dos horas. Es el límite de
 * manejo que el plan buscaba: **el tamaño del rodeo lo limita el agua, no el
 * pasto.**
 *
 * `0` si el caudal o el consumo no son positivos, que es lo honesto: un caudal
 * desconocido no es un caudal infinito.
 */
export function rodeoMaximoPorAgua(caudal_l_min: number, litros_cabeza_dia: number): number {
  if (!(caudal_l_min > 0) || !(litros_cabeza_dia > 0)) return 0;
  const porVisita_l = caudal_l_min * 60 * VENTANA_ABREVADO_H;
  return Math.floor((porVisita_l * VIAJES_POR_DIA) / litros_cabeza_dia);
}

// ─── La superficie efectiva ───────────────────────────────────────────────────

/**
 * Clases de ESA WorldCover que no son tierra de pastoreo, con el motivo.
 *
 * No es una tabla de la bibliografía de pastizales: es la aplicación directa de
 * qué significa cada clase del producto. El espejo de agua, el humedal, el hielo
 * y lo construido no producen forraje pastoreable y además son peligro o
 * restricción. El criterio está del lado conservador en una sola cosa y vale
 * decirla: el **humedal herbáceo sí produce pasto** y en muchos campos es el
 * mejor que hay, pero es también lo que no se puede pastorear sin daño ni en
 * cualquier época, así que sale de la superficie efectiva y se avisa, en lugar
 * de entrar como si fuera loma.
 *
 * El suelo desnudo no se excluye: un pastizal ralo con 40 % de suelo desnudo
 * sigue siendo campo de pastoreo, y lo que corresponde es que produzca poco
 * forraje, no que desaparezca del plano.
 */
export const CLASES_NO_PASTOREABLES: Record<number, string> = {
  50: 'construido',
  70: 'nieve o hielo',
  80: 'espejo de agua',
  90: 'humedal herbáceo',
};

export interface Exclusion {
  nombre: string;
  pct: number;
  motivo: string;
}

export interface NoPastoreable {
  /** Fracción del predio que no es tierra de pastoreo. */
  fraccion: number;
  exclusiones: Exclusion[];
}

/**
 * Qué parte del predio no es tierra de pastoreo, leído de la cobertura.
 *
 * Toma los items tal como los devuelve `cobertura.ts` —clase de WorldCover y
 * porcentaje del predio— para no acoplar este módulo al fetch.
 */
export function noPastoreable(
  items: Array<{ valor: number; nombre: string; pct: number }> | null,
): NoPastoreable {
  if (!items || items.length === 0) return { fraccion: 0, exclusiones: [] };
  const exclusiones = items
    .filter(it => CLASES_NO_PASTOREABLES[it.valor] !== undefined && it.pct > 0)
    .map(it => ({ nombre: it.nombre, pct: it.pct, motivo: CLASES_NO_PASTOREABLES[it.valor]! }))
    .sort((a, b) => b.pct - a.pct);
  const suma = exclusiones.reduce((s, e) => s + e.pct, 0);
  return { fraccion: Math.min(1, redondear4(suma / 100)), exclusiones };
}

export interface SuperficieEfectiva {
  /** Las hectáreas del polígono, tal cual. */
  ha_brutas: number;
  /** Lo que queda después de las exclusiones: sigue siendo superficie real. */
  ha_pastoreables: number;
  /** Factor de distribución por pendiente, o `null` si no hay DEM. */
  factor_pendiente: number | null;
  /** Factor por distancia al agua, o `null` si no se declaró. */
  factor_agua: number | null;
  /** El que manda: el MENOR de los dos, nunca el producto. */
  factor: number;
  manda: 'pendiente' | 'agua' | 'ninguno';
  /**
   * `ha_pastoreables × factor`. **No es una superficie**: es la superficie que
   * daría la misma capacidad de carga si el ganado la usara toda por igual. Se
   * calcula para poder decir un número comparable, no para dibujarla.
   */
  ha_equivalentes: number;
  exclusiones: Exclusion[];
  cautelas: string[];
}

export function superficieEfectiva(args: {
  ha_brutas: number;
  noPastoreable?: NoPastoreable | null;
  pendiente?: DistribucionPendiente | null;
  agua?: DistribucionAgua | null;
  porte?: PorteParaTerreno;
  /** Cuántas aguadas tiene el predio: con una sola, la tabla de agua castiga de más. */
  aguadas?: number | null;
}): SuperficieEfectiva {
  const porte = args.porte ?? 'bovino';
  const ha_brutas = Math.max(0, args.ha_brutas);
  const np = args.noPastoreable ?? { fraccion: 0, exclusiones: [] };
  const ha_pastoreables = Math.round(ha_brutas * (1 - np.fraccion) * 100) / 100;

  const fPend = args.pendiente ? factorPendiente(args.pendiente, porte) : null;
  const fAgua = args.agua ? factorAgua(args.agua, porte) : null;

  // La regla de B-829: se calculan por separado y manda la reducción más grande.
  // Multiplicarlos descontaría dos veces al mismo animal que no camina.
  let factor = 1;
  let manda: SuperficieEfectiva['manda'] = 'ninguno';
  if (fPend !== null && (fAgua === null || fPend <= fAgua)) { factor = fPend; manda = 'pendiente'; }
  if (fAgua !== null && (fPend === null || fAgua < fPend))  { factor = fAgua; manda = 'agua'; }

  const cautelas: string[] = [];
  if (fPend === null) cautelas.push('Sin relieve cargado no se puede repartir el predio en bandas de pendiente, así que la capacidad se toma sin ajuste por terreno. En un campo quebrado eso la sobreestima.');
  if (fPend !== null && args.pendiente && args.pendiente.paso_m > 20) {
    cautelas.push(`El relieve se midió con un paso de ${args.pendiente.paso_m} m, que alisa las pendientes cortas: las bandas empinadas salen más chicas de lo que son en el campo.`);
  }
  if (fAgua === null) cautelas.push('Sin la distancia del predio a las aguadas no se aplica el ajuste por agua, que en campo extensivo suele ser el que manda.');
  if (manda === 'agua' && (args.aguadas ?? 0) === 1) {
    cautelas.push('Con una sola aguada esta reducción es la más conservadora de las dos tablas: medido con GPS, el ganado con poca agua camina bastante más de la milla. Tomalo como piso, no como medición.');
  }
  if (porte === 'menor') cautelas.push('Para ovinos y caprinos no corren las tablas de bovinos: el límite es 45 % de pendiente y la distancia al agua no reduce, porque no beben todos los días.');

  return {
    ha_brutas: Math.round(ha_brutas * 100) / 100,
    ha_pastoreables,
    factor_pendiente: fPend,
    factor_agua: fAgua,
    factor,
    manda,
    ha_equivalentes: Math.round(ha_pastoreables * factor * 100) / 100,
    exclusiones: np.exclusiones,
    cautelas,
  };
}

// ─── Los módulos ──────────────────────────────────────────────────────────────

export type Traba = 'agua' | 'distancia' | 'rodeo' | 'ninguna';

export interface Modulacion {
  /** Cuántas unidades de manejo: el mínimo que cumple todas las restricciones. */
  modulos: number;
  /** Cuál restricción obliga a ese número. */
  traba: Traba;
  /** Hectáreas pastoreables por módulo. */
  ha_modulo: number;
  /** Cabezas por módulo, repartidas parejo. */
  cabezas_modulo: number;
  /** Lo que pide cada restricción por separado, para poder discutirla. */
  por_agua: number | null;
  por_distancia: number | null;
  por_rodeo: number | null;
  /** Distancia que camina el animal más lejano dentro de un módulo. */
  distancia_maxima_m: number;
  avisos: string[];
}

/**
 * Cuántos módulos de manejo pide este campo con este rodeo, y por qué.
 *
 * El criterio de diseño, que es el que el plan pedía dejar escrito en el código:
 * **holgados en la carga objetivo y estrictos en todo lo demás.** Cada
 * subdivisión es alambre, portón y recorrido, así que el número que se devuelve
 * es **el menor que cumple todas las restricciones**, no un número redondo ni
 * uno que «quede lindo». Y se dice cuál es la restricción que manda, porque es la
 * única que vale la pena discutir: aflojar cualquier otra no cambia nada.
 *
 * Las tres restricciones:
 *
 * - **El agua**: cuántas cabezas puede abrevar la aguada del módulo en la ventana
 *   de dos horas de la norma (`rodeoMaximoPorAgua`).
 * - **La distancia**: cuánta superficie puede servir una aguada sin que aparezca
 *   la reducción de la Tabla 4 (`areaMaxima_ha`).
 * - **El rodeo manejable**: un tope de cabezas por rodeo que pone el productor.
 *   No tiene fuente publicada y no se inventa: si no se declara, no restringe.
 */
export function modulacion(args: {
  ha_pastoreables: number;
  cabezas: number;
  /** Caudal de la aguada de cada módulo, en L/min. `null` = no restringe. */
  caudal_l_min?: number | null;
  litros_cabeza_dia?: number | null;
  /** Dónde va la aguada dentro del módulo: cambia el tope de superficie 4 veces. */
  aguaEn?: AguaEn;
  /** Tope de cabezas por rodeo que declara el productor. `null` = no restringe. */
  rodeoManejable?: number | null;
}): Modulacion {
  const ha = Math.max(0, args.ha_pastoreables);
  const cabezas = Math.max(0, Math.round(args.cabezas));
  const aguaEn = args.aguaEn ?? 'centro';

  const maxPorAgua = args.caudal_l_min && args.litros_cabeza_dia
    ? rodeoMaximoPorAgua(args.caudal_l_min, args.litros_cabeza_dia)
    : null;

  const por_agua = maxPorAgua !== null && maxPorAgua > 0 && cabezas > 0 ? Math.ceil(cabezas / maxPorAgua) : null;
  const topeHa = areaMaxima_ha(MILLA_M, aguaEn);
  const por_distancia = ha > 0 ? Math.ceil(ha / topeHa) : null;
  const por_rodeo = args.rodeoManejable && args.rodeoManejable > 0 && cabezas > 0
    ? Math.ceil(cabezas / args.rodeoManejable)
    : null;

  const candidatos: Array<[Traba, number]> = [];
  if (por_agua !== null)      candidatos.push(['agua', por_agua]);
  if (por_distancia !== null) candidatos.push(['distancia', por_distancia]);
  if (por_rodeo !== null)     candidatos.push(['rodeo', por_rodeo]);

  let modulos = 1;
  let traba: Traba = 'ninguna';
  for (const [t, n] of candidatos) {
    if (n > modulos) { modulos = n; traba = t; }
  }

  const ha_modulo = modulos > 0 ? Math.round((ha / modulos) * 100) / 100 : 0;
  const avisos: string[] = [];

  if (maxPorAgua === 0 && args.caudal_l_min) {
    avisos.push('El caudal declarado no alcanza para abrevar ni una cabeza en la ventana de dos horas: revisá el número o poné reserva en el bebedero.');
  }
  if (traba === 'ninguna') {
    avisos.push('Con los datos cargados ninguna restricción obliga a subdividir: un solo módulo cumple. Eso no significa que convenga un solo potrero —la rotación es otra cosa— sino que el agua y las distancias dan.');
  }
  if (aguaEn === 'esquina') {
    avisos.push('Con la aguada en una esquina el animal camina el doble que con la aguada en el centro, y el tope de superficie por módulo baja a la cuarta parte. Moverla al centro es la decisión más barata de todo este cálculo.');
  }
  if (por_agua !== null && por_distancia !== null && por_agua > por_distancia * 2) {
    avisos.push('Lo que obliga a subdividir es el caudal y no la superficie: antes de alambrar conviene ver si se puede agrandar la reserva del bebedero, que es mucho más barato que un módulo nuevo.');
  }

  return {
    modulos, traba, ha_modulo,
    cabezas_modulo: modulos > 0 ? Math.ceil(cabezas / modulos) : 0,
    por_agua, por_distancia, por_rodeo,
    distancia_maxima_m: distanciaMaxima_m(ha_modulo, aguaEn),
    avisos,
  };
}

function redondear4(x: number): number {
  return Math.round(x * 10_000) / 10_000;
}
