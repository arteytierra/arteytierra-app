/**
 * El camellón ancho con surco a pendiente: la geometría que nadie dibujaba.
 *
 * Desde el 12/11/2026 la app reconoce un suelo expansivo, y desde entonces le
 * fue diciendo al usuario, en lugares cada vez más adelante del informe, que
 * para este suelo el diseño publicado **no es una zanja a nivel**: es un
 * camellón ancho con el surco a pendiente, con desagües de parcela y cauces
 * empastados. Lo nombran los cuatro paneles de agua (`lib/saludCalculo.ts`), el
 * resumen ejecutivo y las tres hojas que se llevan al campo
 * (`lib/sueloEnElPapel.ts`). La lista de materiales llega al punto de **declarar
 * que no tiene ningún renglón** de esa obra.
 *
 * Y no lo dibujaba nadie. Los swales van a nivel por definición y el patrón de
 * líneas clave sale de una directriz y **mide** la pendiente que le aparece
 * sola; ninguna de las dos traza una línea a una pendiente **pedida**. Eso es
 * lo que falta y es lo que hay acá.
 *
 * ── Lo que resultó al ir a dibujarlo ────────────────────────────────────────
 *
 * El método publicado **no se puede trazar en la mitad del terreno donde vive
 * el suelo que lo motiva**, y el número que lo dice sale de cruzar dos fuentes
 * que ya estaban en el repo, sin medir nada nuevo:
 *
 * - el surco del camellón corre entre 0,4 y 0,8 % (Swindale 1988, ya en
 *   `saludCalculo.ts` como `BBF_SURCO_MIN_PCT`/`MAX`);
 * - el techo de la pendiente de un surco es **la mitad de la pendiente del
 *   terreno** (NRCS 330, ya en `keylineGeometria.ts` como
 *   `DERIVA_MAX_FRACCION_PENDIENTE`).
 *
 * Entonces hace falta **0,8 % de pendiente de terreno** para que el piso de la
 * banda publicada sea alcanzable, y **1,6 %** para que entre la banda entera. Y
 * el suelo para el que se diseñó el camellón está, dice la misma fuente, «mainly
 * on the gentle slopes-usually less than 3%-of terraces, plains and valley
 * floors». O sea: la ventana de este método es angosta —entre 0,8 y 8 % de
 * pendiente— y el vertisol aparece seguido por debajo del piso.
 *
 * Lo bueno es que eso no es una deducción solitaria de dos constantes. La
 * práctica etíope lo dice medido y con otras palabras, para los surcos de
 * drenaje tradicionales: «The major problem with this traditional system has
 * been that no outside drainage is constructed to take the field water. On very
 * low slopes, this practice does not drain out the water from the field. The
 * water thus forms ponds in the furrows. On moderate and higher slopes, the flow
 * of water from the fields accelerates erosion» (Abiye Astatke y Ferew Kelemu,
 * capítulo del maresha). Un estándar del USDA y la ladera de Inewari dan la
 * misma respuesta: por debajo de una pendiente el surco no drena, encharca.
 *
 * Y de ahí sale la otra mitad de la frase, que es la que esta geometría tiene
 * que respetar: **el surco sin salida afuera no es un desagüe, es una pileta.**
 * Por eso acá el desagüe de parcela y el cauce no son opcionales ni decorativos:
 * se trazan con el mismo flujo D8 que ya usa la cuenca, y si no se encuentra
 * salida, el resultado lo dice.
 *
 * ── Las dimensiones, y por qué son del implemento y no del terreno ──────────
 *
 * El paso del patrón —1,5 m— no es una elección de diseño: es el ancho de
 * trabajo de la máquina. «In the broadbed-and-furrow system, where the machinery
 * working width is 150 cm, the distance travelled per hectare is only 6.7 km»
 * (Kanwar, Kampen y Virmani 1982). El camellón mide «approximately 100 cm in
 * width» y el surco es el resto. Por eso el paso entra como **parámetro** y las
 * tres versiones publicadas se exportan como constantes distintas: la del
 * carro de ruedas del ICRISAT (1,5 m), la del broadbed maker de la ILCA hecho
 * con dos mareshas (1,2 m entre puntas) y la manual de Inewari (0,8 a 1 m). No
 * hay un paso «del camellón»: hay el paso de la herramienta que lo hace.
 *
 * ── El límite declarado, que es el mismo de la planilla ─────────────────────
 *
 * **Esta geometría da la dirección y el trazado, no la cota.** Un grado de
 * 0,6 % es un descenso de 9 cm en 15 m; ningún DEM de los que lee la app tiene
 * esa exactitud vertical, ni el de 30 m ni el de 0,5 m. Lo que la app puede
 * hacer honestamente es decir por dónde va la línea guía, hacia dónde corre el
 * surco, cuántos camellones entran, dónde tiene que estar el desagüe y por
 * dónde sale el agua. **El grado se replantea con nivel en el campo**, igual que
 * la cota del mojón en `sueloEnElPapel.ts`. Cuando la pendiente medida de la
 * línea no coincide con la pedida, el resultado trae las dos y no sólo la
 * pedida.
 *
 * ── Qué hay acá ─────────────────────────────────────────────────────────────
 *
 * - `bandaCamellon`: la banda publicada cruzada con el techo del NRCS, y el
 *   grado a usar. Si queda vacía, lo dice: el camellón no se puede trazar.
 * - `trazarLineaGuia`: la primitiva que faltaba. Una línea a una pendiente
 *   **pedida** sobre el DEM. No es una curva de nivel (grado 0) ni un offset que
 *   deriva: en cada paso resuelve la dirección que da el descenso pedido.
 * - `gradoDelOffset` y `anchoUnidadDeDrenaje`: hasta dónde se puede seguir
 *   corriendo paralelo antes de que la deriva saque el surco de la banda. Es
 *   donde el NRCS pide una directriz nueva, y es donde va el desagüe.
 * - `trazarDesague` y `trazarCauce`: la salida del agua, por D8.
 * - `cantidadesCamellon`: metros de surco, camellones y jornadas de yunta.
 * - `trazarCamellon`: el armado completo, con sus avisos.
 *
 * - `dimensionarSalida`: el caudal pico y la **sección** de cada salida.
 * - `resumenCamellon`: el snapshot serializable que leen los consumidores.
 *
 * Hasta el 20/11/2026 acá decía que la sección del cauce empastado y del
 * desagüe no estaba a propósito, y que dimensionarlas pedía «el pico de la
 * tormenta de 10 años y la velocidad admisible del NRCS 412». La primera mitad
 * de esa frase era correcta y la segunda estaba equivocada: **el método de
 * velocidad admisible es el viejo.** Salió del Technical Paper 61 del SCS en
 * 1947, se usó todo el siglo XX, y el cap. 7 del EFH 650 lo reemplazó por el de
 * **esfuerzo efectivo** del Agriculture Handbook 667 (Temple et al., 1987), que
 * separa lo que aguanta el suelo de lo que aguanta el pasto. Eso es lo que hay
 * ahora en `lib/cauceEmpastado.ts`, y es lo que este módulo pide para los dos
 * trazos que ya dibujaba.
 *
 * Quién lo lee, desde el 21/11/2026: `CamellonBloque.tsx` lo llama con la
 * parcela elegida en el panel de líneas clave, `MapaTerrenoApp` guarda el
 * resumen en el proyecto y lo manda al informe, y `materiales.ts` saca de ahí
 * cinco renglones —el surco, la yunta, la excavación de las dos salidas y el
 * empastado—. Antes de eso el módulo estaba completo y no lo leía nadie: la
 * lista de materiales declaraba una ausencia donde había cantidades.
 *
 * Qué se rompe si cambia `CamellonResumen`: la lista de materiales cotiza el
 * movimiento de suelo con `salida*.excavacion_m3`, la semilla con
 * `salida*.empastado_m2`, el surco con `surco_m` y la mano de obra con
 * `jornadasYunta`. Sacarle un campo deja un renglón sin cantidad.
 *
 * Fuentes:
 * - Kanwar, J.S., Kampen, J. y Virmani, S.M. (1982). «Management of Vertisols
 *   for Maximising Crop Production — ICRISAT Experience», en *Vertisols and rice
 *   soils of the tropics*, Symposia papers II, Transactions of the 12th
 *   International Congress of Soil Science, Nueva Delhi, 8-16 feb 1982.
 *   https://oar.icrisat.org/4045/ — de acá salen los 150 cm de ancho de trabajo,
 *   los 100 cm del camellón, el 0,6 % construido, las hileras a 30/45/75/150 cm,
 *   la vida de 2 a 4 años y la figura 6, que dibuja el conjunto como
 *   «bed and furrow direction» más «grassed waterways» y no surco por surco.
 * - Swindale, L.D. (1988). «Developing, testing and transferring improved
 *   Vertisol technology: the Indian experience», en Jutzi, Haque, McIntire y
 *   Stares (eds.), *Management of Vertisols in sub-Saharan Africa*, ILCA.
 *   https://www.fao.org/4/x5493e/x5493e03.htm — la banda 0,4 a 0,8 %, el límite
 *   de 750 mm entre la zona de lluvia asegurada y la que no, y los vertisoles
 *   «seldom occur on slopes greater than 8%».
 * - Abiye Astatke y Ferew Kelemu. «Modifying the traditional plough - Maresha -
 *   For better management of Vertisols», cap. 6.
 *   https://www.fao.org/4/x5456e/x5456e08.htm — el broadbed maker (1,2 m entre
 *   puntas de maresha, 0,4 a 1,2 ha en seis horas con una yunta), el camellón
 *   manual de Inewari (surcos cada 0,8 a 1 m), el 8 % de pendiente máxima y la
 *   falla del surco sin salida.
 * - USDA NRCS, Conservation Practice Standard 330 «Contour Farming», oct 2017,
 *   vía `lib/keylineGeometria.ts`: el techo de la mitad de la pendiente y la
 *   regla de la directriz nueva.
 */
import { elevEnGrilla, pasoEfectivoM, type GrillaElevacion } from './grillaElevacion';
import { flujoD8 } from './cuencaHidro';
import {
  bandaDeriva, DERIVA_MAX_FRACCION_PENDIENTE, FUENTE_NRCS330,
  type BandaDeriva,
} from './keylineGeometria';
// Los dos números de Swindale viven en `saludCalculo.ts` desde que el aviso de
// los paneles los necesitó, y de ahí se leen: una sola fuente. Su lugar natural
// es este archivo, y ahí hay que moverlos cuando `saludCalculo.ts` deje de estar
// modificado por otra sesión.
import { BBF_SURCO_MIN_PCT, BBF_SURCO_MAX_PCT } from './saludCalculo';
import { COBERTURAS } from './cuenca';
import type { ClaseUSDA } from './textura';
import {
  caudalDeDiseno, dimensionarCauce, erodibilidadDeTextura,
  type CaudalDiseno, type SeccionCauce, type ErodibilidadSuelo, type FormaCauce,
  type ClaseRetardancia,
} from './cauceEmpastado';
import type { GrupoHidro } from './cuenca';
import type { AvisoCalculo } from './hidrologiaPredio';

/** Metros por grado de latitud, igual que en `lib/keyline.ts`. */
const R = 111_320;

/**
 * La cota interpolada bilinealmente entre los cuatro nodos que rodean al punto.
 *
 * Existe porque `elevEnGrilla` muestrea por **vecino más cercano**: devuelve la
 * cota del nodo redondeado. Para casi todo lo que hace la app eso está bien,
 * pero acá rompe el trazado, y el test del plano inclinado lo encontró. Sobre un
 * plano exacto del 3 %, el gradiente leído por diferencias centradas con vecino
 * más cercano no vale 3 %: salta entre 2,82 y 3,53 % según cuántas filas de
 * grilla entren en el paso de diferenciación, un ±12 %. Y como la dirección del
 * trazado sale de `asin(g/S)`, ese error en `S` desvía la línea: la corrida que
 * tenía que dar 3,00 % daba 2,74 % y se iba para el costado.
 *
 * Con interpolación bilineal el gradiente de un plano es exacto para cualquier
 * paso, y el caso resuelto cierra. Donde alguno de los cuatro nodos no tiene
 * dato se cae a `elevEnGrilla`, que es el borde del dato y ahí vecino más
 * cercano es mejor que nada.
 */
function cotaBilineal(g: GrillaElevacion, lat: number, lng: number): number {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) return NaN;
  if (rows < 2 || cols < 2) return elevEnGrilla(g, lat, lng);
  const fr = ((lat - latMin) / (latMax - latMin)) * (rows - 1);
  const fc = ((lng - lngMin) / (lngMax - lngMin)) * (cols - 1);
  const r0 = Math.min(rows - 2, Math.max(0, Math.floor(fr)));
  const c0 = Math.min(cols - 2, Math.max(0, Math.floor(fc)));
  const tr = fr - r0, tc = fc - c0;
  const z00 = elev[r0 * cols + c0]!, z01 = elev[r0 * cols + c0 + 1]!;
  const z10 = elev[(r0 + 1) * cols + c0]!, z11 = elev[(r0 + 1) * cols + c0 + 1]!;
  if ([z00, z01, z10, z11].some(Number.isNaN)) return elevEnGrilla(g, lat, lng);
  return z00 * (1 - tr) * (1 - tc) + z01 * (1 - tr) * tc
    + z10 * tr * (1 - tc) + z11 * tr * tc;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const coma = (n: number | string) => String(n).replace('.', ',');

export const FUENTE_ICRISAT_1982 =
  'Kanwar, Kampen y Virmani (1982) — «Management of Vertisols for Maximising Crop Production: ICRISAT Experience», 12.º Congreso Internacional de Ciencia del Suelo';
export const FUENTE_MARESHA =
  'Abiye Astatke y Ferew Kelemu — «Modifying the traditional plough (Maresha) for better management of Vertisols», cap. 6';

// ─── Las dimensiones publicadas ──────────────────────────────────────────────

/** Ancho de trabajo del carro de ruedas del ICRISAT: «machinery working width is 150 cm». */
export const PASO_BBF_M = 1.5;
/** «Each bed (approximately 100 cm in width) is slightly raised». */
export const CAMELLON_ANCHO_M = 1.0;
/** El surco es el resto del paso. Derivado, no publicado como tal. */
export const SURCO_ANCHO_M = r1(PASO_BBF_M - CAMELLON_ANCHO_M);

/** «a flexible planting pattern in rows spaced at 30, 45, 75 or 150 cm». */
export const HILERAS_PUBLICADAS_CM = [30, 45, 75, 150] as const;

/** El grado del trazado que el ICRISAT construyó en 1975 y seguía en pie. */
export const GRADO_CONSTRUIDO_PCT = 0.6;

/** «Once laid out, the broadbeds are stable for 2 to 4 years». */
export const VIDA_CAMELLON_ANIOS_MIN = 2;
export const VIDA_CAMELLON_ANIOS_MAX = 4;

/** Separación entre las puntas de las mareshas del broadbed maker de la ILCA. */
export const PASO_BBM_ILCA_M = 1.2;
/** El camellón manual de Inewari: «furrows ... at an interval of 0.8 to 1 m». */
export const PASO_MANUAL_MIN_M = 0.8;
export const PASO_MANUAL_MAX_M = 1.0;

/** «The area constructed into BBF in six working hours by a pair of oxen». */
export const JORNADA_YUNTA_H = 6;
export const JORNADA_YUNTA_HA_MIN = 0.4;
export const JORNADA_YUNTA_HA_MAX = 1.2;

/** «seldom occur on slopes greater than 8%». */
export const PENDIENTE_VERTISOL_MAX_PCT = 8;
/** El límite entre la zona de lluvia asegurada y la que no: «approximately at 750 mm». */
export const LLUVIA_ASEGURADA_MM = 750;

/**
 * Pendiente de terreno mínima para que el piso de la banda publicada sea
 * alcanzable bajo el techo del NRCS, y para que entre la banda completa.
 *
 * No son datos: son el cruce de las dos fuentes, y es el hallazgo de este
 * módulo. Se derivan acá para que cambiar cualquiera de las dos constantes de
 * origen los mueva solos.
 */
export const PENDIENTE_MIN_PARA_GRADO_PCT =
  r1(BBF_SURCO_MIN_PCT / DERIVA_MAX_FRACCION_PENDIENTE);
export const PENDIENTE_MIN_PARA_BANDA_COMPLETA_PCT =
  r1(BBF_SURCO_MAX_PCT / DERIVA_MAX_FRACCION_PENDIENTE);

// ─── La banda de grado del surco ─────────────────────────────────────────────

export interface BandaCamellon {
  /** Grado mínimo del surco (%). */
  min_pct: number;
  /** Grado máximo del surco (%). */
  max_pct: number;
  /** true cuando el terreno es demasiado plano para que la banda exista. */
  vacia: boolean;
  /** El grado a trazar: el construido si entra, o el extremo más cercano. */
  grado_pct: number | null;
  /** true si el grado construido del ICRISAT no entra y hubo que recortarlo. */
  recortada: boolean;
  /** La banda del NRCS de la que sale el techo. */
  nrcs: BandaDeriva;
  fuentes: string[];
  nota: string;
}

/**
 * La banda en la que puede correr el surco del camellón, acá.
 *
 * Es la intersección de dos reglas que ya están en el repo: la banda publicada
 * del ICRISAT (0,4 a 0,8 %) y el techo del NRCS 330 (la mitad de la pendiente
 * del terreno, tope 4 %). El piso del NRCS —0,2 % para suelos de infiltración
 * lenta— queda siempre por debajo del piso del ICRISAT, así que no recorta
 * nada; se calcula igual porque es el que explica *por qué* hay un piso.
 *
 * Fuera de rango devuelve `vacia`, no un número extrapolado.
 */
export function bandaCamellon(p: {
  pendienteTerreno_pct: number;
  grupoHidro?: GrupoHidro | null;
  cultivoSensibleAlAgua?: boolean;
}): BandaCamellon {
  const nrcs = bandaDeriva(p);
  const pend = Number.isFinite(p.pendienteTerreno_pct)
    ? Math.max(0, p.pendienteTerreno_pct) : 0;

  const min_pct = Math.max(BBF_SURCO_MIN_PCT, nrcs.min_pct);
  const max_pct = Math.min(BBF_SURCO_MAX_PCT, nrcs.max_pct);
  const vacia = min_pct > max_pct;
  const grado_pct = vacia
    ? null
    : r2(Math.min(max_pct, Math.max(min_pct, GRADO_CONSTRUIDO_PCT)));
  const recortada = !vacia && grado_pct !== GRADO_CONSTRUIDO_PCT;

  const banda = `${coma(BBF_SURCO_MIN_PCT)} a ${coma(BBF_SURCO_MAX_PCT)} %`;
  const nota = vacia
    ? `Con ${coma(r1(pend))} % de pendiente el camellón publicado no se puede trazar. El surco tiene que `
      + `correr al ${banda}, y el techo de cualquier surco es la mitad de la pendiente del terreno: acá eso `
      + `da ${coma(r2(nrcs.max_pct))} %, por debajo del piso. Hacen falta ${coma(PENDIENTE_MIN_PARA_GRADO_PCT)} % `
      + `de pendiente para que el piso sea alcanzable y ${coma(PENDIENTE_MIN_PARA_BANDA_COMPLETA_PCT)} % para la `
      + 'banda entera. Y es el caso frecuente del suelo que motiva el camellón: los vertisoles se forman sobre '
      + 'pendientes suaves, en general de menos del 3 %, en llanuras y pisos de valle. Un surco sin pendiente '
      + 'suficiente no drena: encharca, que es exactamente la falla del sistema tradicional etiope.'
    : recortada
      ? `El surco se traza al ${coma(grado_pct!)} % y no al ${coma(GRADO_CONSTRUIDO_PCT)} % construido por el `
        + `ICRISAT: con ${coma(r1(pend))} % de pendiente de terreno el techo del estándar —la mitad— deja la banda `
        + `en ${coma(min_pct)} a ${coma(r2(max_pct))} %. La banda publicada es ${banda}.`
      : `El surco se traza al ${coma(grado_pct!)} %, que es el grado del trazado que el ICRISAT construyó en 1975 `
        + `y seguía en pie. La banda publicada es ${banda} y acá entra completa: con ${coma(r1(pend))} % de `
        + 'pendiente de terreno, el techo del estándar no la recorta.';

  return {
    min_pct: r2(min_pct), max_pct: r2(max_pct), vacia, grado_pct, recortada, nrcs,
    fuentes: [FUENTE_ICRISAT_1982, FUENTE_NRCS330],
    nota,
  };
}

// ─── Cantidades ──────────────────────────────────────────────────────────────

/**
 * Metros de surco por hectárea. Es una identidad geométrica, no un dato: un
 * surco cada `paso` metros sobre 10 000 m². Con el paso del ICRISAT da 6.667
 * m/ha, coherente con los «6.7 km of travel ... per hectare» publicados, que
 * son el mismo número leído como recorrido de la máquina.
 */
export function metrosDeSurcoPorHa(paso_m: number = PASO_BBF_M): number | null {
  if (!Number.isFinite(paso_m) || paso_m <= 0) return null;
  return Math.round(10_000 / paso_m);
}

export interface CantidadesCamellon {
  paso_m: number;
  superficie_ha: number;
  camellones: number;
  surco_m: number;
  /** Jornadas de seis horas de una yunta, como rango publicado. */
  jornadasYunta: { min: number; max: number };
  nota: string;
}

/**
 * Lo que la lista de materiales va a querer: cuántos camellones, cuántos metros
 * de surco y cuánta yunta.
 *
 * El rango de jornadas es el publicado y es ancho a propósito —«The rate of work
 * depends on the number of passes applied to make each BBF, the tilth status of
 * the top soil and the condition of the working oxen»—. Darlo como un solo
 * número sería inventarle precisión.
 */
export function cantidadesCamellon(p: {
  superficie_ha: number;
  paso_m?: number;
  anchoUnidad_m?: number | null;
}): CantidadesCamellon | null {
  const paso_m = p.paso_m ?? PASO_BBF_M;
  if (!Number.isFinite(p.superficie_ha) || p.superficie_ha <= 0) return null;
  if (!Number.isFinite(paso_m) || paso_m <= 0) return null;

  const surcoPorHa = metrosDeSurcoPorHa(paso_m)!;
  const surco_m = Math.round(surcoPorHa * p.superficie_ha);
  const camellones = p.anchoUnidad_m != null && p.anchoUnidad_m > 0
    ? Math.floor(p.anchoUnidad_m / paso_m)
    : Math.round(surco_m / Math.max(1, Math.sqrt(p.superficie_ha * 10_000)));

  return {
    paso_m, superficie_ha: p.superficie_ha, camellones, surco_m,
    jornadasYunta: {
      min: r1(p.superficie_ha / JORNADA_YUNTA_HA_MAX),
      max: r1(p.superficie_ha / JORNADA_YUNTA_HA_MIN),
    },
    nota: `Con un paso de ${coma(paso_m)} m son ${surcoPorHa} m de surco por hectárea. `
      + `El camellón dura ${VIDA_CAMELLON_ANIOS_MIN} a ${VIDA_CAMELLON_ANIOS_MAX} años antes de rehacerse.`,
  };
}

// ─── La línea guía: una línea a una pendiente pedida ─────────────────────────

export type CorteGuia = 'borde' | 'largo_maximo' | 'sin_dato' | 'plegado' | 'sin_pendiente';

export interface LineaGuia {
  puntos: Array<{ lat: number; lng: number }>;
  largo_m: number;
  /** Descenso total entre el primer y el último punto (m). */
  desnivel_m: number;
  grado_pedido_pct: number;
  /** El grado que de verdad dio el DEM. No tiene por qué ser el pedido. */
  grado_medido_pct: number;
  /** Pasos en los que el terreno era más suave que el grado pedido. */
  pasosSinPendiente: number;
  pasos: number;
  corte: CorteGuia;
}

export interface OpcionesGuia {
  grado_pct: number;
  /** Por cuál de los dos lados de la máxima pendiente arranca: +1 o −1. */
  sentido?: 1 | -1;
  /** Largo del paso de trazado (m). Por omisión, el paso efectivo del DEM. */
  paso_m?: number;
  largoMax_m?: number;
  /** Para recortar al predio. */
  dentro?: (lat: number, lng: number) => boolean;
}

/**
 * Traza una línea a una pendiente **pedida** sobre el modelo de elevación.
 *
 * Es la primitiva que faltaba, y la cuenta es exacta y de una línea. Si **u** es
 * el versor que apunta cuesta arriba y `S` la pendiente del terreno (fracción),
 * moverse un metro en la dirección **d** cambia la cota en `S·(d·u)`. Para bajar
 * `g` por metro hace falta `d·u = −g/S`, así que descomponiendo
 * **d** = a·**u** + b·**t** con **t** perpendicular a **u**:
 *
 *     a = −g/S        b = ±√(1 − a²)
 *
 * De ahí salen las tres cosas que importan. Primero, que la línea forma con la
 * curva de nivel un ángulo de `asin(g/S)`: a grado cero es la curva de nivel y
 * con `g = S` es la línea de máxima pendiente, los dos casos límite conocidos.
 * Segundo, que **hace falta `S ≥ g`**: no existe una línea más empinada que la
 * máxima pendiente, y cuando el terreno es más suave que el grado pedido la
 * función no extrapola: baja por la máxima pendiente, cuenta el paso en
 * `pasosSinPendiente` y el `grado_medido_pct` sale más chico que el pedido.
 * Tercero, que el signo de `b` es la única libertad: elige para qué lado corre,
 * y se mantiene por continuidad con el paso anterior para que la línea no se dé
 * vuelta sobre sí misma.
 *
 * El grado no se asume: después de cada paso se vuelve a leer la cota en el
 * DEM, y `grado_medido_pct` sale de las cotas de los extremos. Es la única forma
 * de que el resultado pueda contradecir al pedido, que es justo lo que tiene que
 * poder hacer.
 */
export function trazarLineaGuia(
  g: GrillaElevacion,
  arranque: { lat: number; lng: number },
  o: OpcionesGuia,
): LineaGuia | null {
  const gObj = o.grado_pct / 100;
  if (!Number.isFinite(gObj) || gObj < 0) return null;

  const paso = o.paso_m ?? Math.max(pasoEfectivoM(g), 2);
  if (!Number.isFinite(paso) || paso <= 0) return null;
  const largoMax = o.largoMax_m ?? 5_000;
  const maxPasos = Math.min(4_000, Math.max(1, Math.floor(largoMax / paso)));

  const z0 = cotaBilineal(g, arranque.lat, arranque.lng);
  if (Number.isNaN(z0)) return null;

  const lat0 = arranque.lat;
  const mLng = R * Math.cos(lat0 * Math.PI / 180);
  const aLL = (x: number, y: number) => ({ lat: lat0 + y / R, lng: arranque.lng + x / mLng });

  /** Gradiente cuesta arriba en fracción (m/m), por diferencias centradas. */
  const gradEn = (lat: number, lng: number): { gx: number; gy: number } | null => {
    const dLat = paso / R;
    const dLng = paso / (R * Math.cos(lat * Math.PI / 180));
    const zE = cotaBilineal(g, lat, lng + dLng), zW = cotaBilineal(g, lat, lng - dLng);
    const zN = cotaBilineal(g, lat + dLat, lng), zS = cotaBilineal(g, lat - dLat, lng);
    if ([zE, zW, zN, zS].some(Number.isNaN)) return null;
    return { gx: (zE - zW) / (2 * paso), gy: (zN - zS) / (2 * paso) };
  };

  const puntos: Array<{ lat: number; lng: number }> = [{ lat: arranque.lat, lng: arranque.lng }];
  let x = 0, y = 0, largo = 0, zUlt = z0, sinPendiente = 0;
  let prev: { dx: number; dy: number } | null = null;
  let corte: CorteGuia = 'largo_maximo';
  const signo = o.sentido === -1 ? -1 : 1;

  for (let i = 0; i < maxPasos; i++) {
    const aqui = aLL(x, y);
    const grad = gradEn(aqui.lat, aqui.lng);
    if (!grad) { corte = 'sin_dato'; break; }
    const S = Math.hypot(grad.gx, grad.gy);

    let dx: number, dy: number;
    if (S < 1e-7) {
      // Llano exacto: no hay ni máxima pendiente ni lado. Sigue derecho si
      // venía de algún lado, y si no, no hay línea que trazar.
      if (!prev) { corte = 'sin_pendiente'; break; }
      sinPendiente++;
      dx = prev.dx; dy = prev.dy;
    } else {
      const ux = grad.gx / S, uy = grad.gy / S;   // cuesta arriba
      const tx = -uy, ty = ux;                     // curva de nivel
      let a = -gObj / S;
      if (a < -1) { a = -1; sinPendiente++; }      // terreno más suave que el grado
      const b = Math.sqrt(Math.max(0, 1 - a * a));
      const c1 = { dx: a * ux + b * tx, dy: a * uy + b * ty };
      const c2 = { dx: a * ux - b * tx, dy: a * uy - b * ty };
      if (!prev) {
        const el = signo === 1 ? c1 : c2;
        dx = el.dx; dy = el.dy;
      } else {
        const d1 = c1.dx * prev.dx + c1.dy * prev.dy;
        const d2 = c2.dx * prev.dx + c2.dy * prev.dy;
        const el = d1 >= d2 ? c1 : c2;
        if (Math.max(d1, d2) <= 0) { corte = 'plegado'; break; }
        dx = el.dx; dy = el.dy;
      }
    }

    const nx = x + dx * paso, ny = y + dy * paso;
    const sig = aLL(nx, ny);
    const z = cotaBilineal(g, sig.lat, sig.lng);
    if (Number.isNaN(z)) { corte = 'sin_dato'; break; }
    if (o.dentro && !o.dentro(sig.lat, sig.lng)) { corte = 'borde'; break; }

    x = nx; y = ny; largo += paso; zUlt = z; prev = { dx, dy };
    puntos.push(sig);
  }

  if (puntos.length < 2 || largo <= 0) return null;
  const desnivel = z0 - zUlt;
  return {
    puntos, largo_m: r1(largo), desnivel_m: r2(desnivel),
    grado_pedido_pct: r2(o.grado_pct),
    grado_medido_pct: r2((desnivel / largo) * 100),
    pasosSinPendiente: sinPendiente, pasos: puntos.length - 1, corte,
  };
}

// ─── La deriva del offset: hasta dónde se puede correr paralelo ──────────────

export interface OffsetGuia {
  distancia_m: number;
  /** Grado medido de la paralela a esa distancia (%). */
  grado_pct: number;
  dentroDeBanda: boolean;
  /** true si la paralela se dobló sobre sí misma y ya no es trazable. */
  plegado: boolean;
}

/**
 * El grado de la paralela a la línea guía, a una distancia dada.
 *
 * Es la misma cuenta que hace el patrón Keyline y por el mismo motivo: dos
 * líneas separadas una distancia fija no son paralelas en el plano vertical, así
 * que la paralela de una línea trazada al grado pedido **no corre a ese grado**.
 * Yeomans lo dice del contorno y el NRCS 330 le pone la consecuencia: «When the
 * row grade reaches the maximum allowable design grade, a new baseline must be
 * established». Acá eso es un número: la distancia a la que hay que poner el
 * desagüe de parcela.
 *
 * `distancia_m` positiva desplaza hacia la izquierda del sentido de avance.
 */
export function gradoDelOffset(
  g: GrillaElevacion,
  guia: ReadonlyArray<{ lat: number; lng: number }>,
  distancia_m: number,
  banda?: { min_pct: number; max_pct: number },
): OffsetGuia | null {
  if (guia.length < 2 || !Number.isFinite(distancia_m)) return null;
  const p0 = guia[0]!;
  const mLng = R * Math.cos(p0.lat * Math.PI / 180);
  const aXY = (p: { lat: number; lng: number }) =>
    ({ x: (p.lng - p0.lng) * mLng, y: (p.lat - p0.lat) * R });
  const aLL = (x: number, y: number) =>
    ({ lat: p0.lat + y / R, lng: p0.lng + x / mLng });

  const xy = guia.map(aXY);
  // Normal de cada vértice: promedio de las normales de los tramos vecinos.
  const normales: Array<{ nx: number; ny: number }> = [];
  for (let i = 0; i < xy.length; i++) {
    const a = xy[Math.max(0, i - 1)]!, b = xy[Math.min(xy.length - 1, i + 1)]!;
    const ex = b.x - a.x, ey = b.y - a.y;
    const L = Math.hypot(ex, ey) || 1e-9;
    normales.push({ nx: -ey / L, ny: ex / L });
  }

  const off: Array<{ x: number; y: number }> = xy.map((q, i) => ({
    x: q.x + normales[i]!.nx * distancia_m,
    y: q.y + normales[i]!.ny * distancia_m,
  }));

  // Plegado: algún tramo de la paralela corre al revés que su original.
  let plegado = false;
  for (let i = 0; i + 1 < off.length; i++) {
    const ox = off[i + 1]!.x - off[i]!.x, oy = off[i + 1]!.y - off[i]!.y;
    const ex = xy[i + 1]!.x - xy[i]!.x, ey = xy[i + 1]!.y - xy[i]!.y;
    if (ox * ex + oy * ey <= 0) { plegado = true; break; }
  }

  let largo = 0;
  for (let i = 0; i + 1 < off.length; i++) {
    largo += Math.hypot(off[i + 1]!.x - off[i]!.x, off[i + 1]!.y - off[i]!.y);
  }
  if (largo <= 0) return null;

  const a = aLL(off[0]!.x, off[0]!.y);
  const b = aLL(off[off.length - 1]!.x, off[off.length - 1]!.y);
  const za = cotaBilineal(g, a.lat, a.lng), zb = cotaBilineal(g, b.lat, b.lng);
  if (Number.isNaN(za) || Number.isNaN(zb)) return null;

  const grado_pct = r2(((za - zb) / largo) * 100);
  const dentroDeBanda = banda
    ? grado_pct >= banda.min_pct && grado_pct <= banda.max_pct
    : true;
  return { distancia_m: r1(distancia_m), grado_pct, dentroDeBanda, plegado };
}

export type MotivoUnidad = 'deriva' | 'plegado' | 'sin_dato' | 'sin_corte';

export interface UnidadDeDrenaje {
  /** Ancho total de la unidad, sumando los dos lados de la línea guía (m). */
  ancho_m: number;
  ancho_izquierda_m: number;
  ancho_derecha_m: number;
  camellones: number;
  motivo: MotivoUnidad;
  /** El paso con el que se midió la deriva, que es el del DEM y no el del surco. */
  pasoMedicion_m: number;
  offsets: OffsetGuia[];
  nota: string;
}

/**
 * Hasta dónde se puede seguir haciendo camellones paralelos a la línea guía
 * antes de que la deriva saque el surco de la banda. Ahí va el desagüe.
 *
 * La deriva se mide con el paso del **DEM**, no con el del surco: una paralela
 * a 1,5 m de la guía tiene, en un modelo de 30 m, exactamente el mismo grado que
 * la guía, porque las dos caen entre los mismos cuatro nodos. Medir cada 1,5 m
 * daría una serie de ceros y un ancho de unidad infinito. El número de
 * camellones sale después, dividiendo el ancho por el paso del surco.
 */
export function anchoUnidadDeDrenaje(
  g: GrillaElevacion,
  guia: ReadonlyArray<{ lat: number; lng: number }>,
  banda: { min_pct: number; max_pct: number },
  o: { paso_m?: number; anchoMax_m?: number } = {},
): UnidadDeDrenaje | null {
  if (guia.length < 2) return null;
  const pasoSurco = o.paso_m ?? PASO_BBF_M;
  const pasoMed = Math.max(pasoEfectivoM(g), pasoSurco);
  const anchoMax = o.anchoMax_m ?? 400;

  const offsets: OffsetGuia[] = [];
  let motivo: MotivoUnidad = 'sin_corte';
  const hastaDonde = (signo: 1 | -1): number => {
    let ultimo = 0;
    for (let d = pasoMed; d <= anchoMax; d += pasoMed) {
      const r = gradoDelOffset(g, guia, signo * d, banda);
      if (!r) { if (motivo === 'sin_corte') motivo = 'sin_dato'; break; }
      offsets.push(r);
      if (r.plegado) { if (motivo === 'sin_corte') motivo = 'plegado'; break; }
      if (!r.dentroDeBanda) { if (motivo === 'sin_corte') motivo = 'deriva'; break; }
      ultimo = d;
    }
    return ultimo;
  };

  const izq = hastaDonde(1);
  const der = hastaDonde(-1);
  const ancho = izq + der;
  const camellones = Math.floor(ancho / pasoSurco);

  const nota = ancho <= 0
    ? 'La deriva saca al surco de la banda en el primer paso medible del modelo de elevación: la línea guía '
      + 'no admite paralelas acá, y cada tanda de camellones necesita su propia guía replanteada.'
    : `Se pueden correr camellones hasta ${coma(r1(ancho))} m a los costados de la línea guía —${coma(r1(izq))} m `
      + `de un lado y ${coma(r1(der))} m del otro— antes de que la deriva saque el surco de la banda. `
      + `Son ${camellones} camellones de ${coma(pasoSurco)} m, y en ese límite va el desagüe de parcela: el `
      + 'estándar pide empezar de una directriz nueva, no seguir derecho.';

  return {
    ancho_m: r1(ancho), ancho_izquierda_m: r1(izq), ancho_derecha_m: r1(der),
    camellones, motivo, pasoMedicion_m: r1(pasoMed), offsets, nota,
  };
}

// ─── La salida del agua ──────────────────────────────────────────────────────

export interface TrazoFlujo {
  puntos: Array<{ lat: number; lng: number }>;
  largo_m: number;
  desnivel_m: number;
  pendiente_pct: number;
  /** Acumulación de flujo en el último punto, en celdas aguas arriba. */
  acumulacion: number;
}

interface MallaFlujo {
  down: Int32Array;
  acc: Float64Array;
}

const llDeCelda = (g: GrillaElevacion, i: number) => {
  const r = Math.floor(i / g.cols), c = i % g.cols;
  return {
    lat: g.latMin + (g.rows > 1 ? (r / (g.rows - 1)) * (g.latMax - g.latMin) : 0),
    lng: g.lngMin + (g.cols > 1 ? (c / (g.cols - 1)) * (g.lngMax - g.lngMin) : 0),
  };
};

function medirTrazo(
  g: GrillaElevacion,
  celdas: number[],
  acc: Float64Array,
): TrazoFlujo | null {
  if (celdas.length < 2) return null;
  const puntos = celdas.map((i) => llDeCelda(g, i));
  let largo = 0;
  for (let i = 0; i + 1 < puntos.length; i++) {
    const a = puntos[i]!, b = puntos[i + 1]!;
    const mLng = R * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
    largo += Math.hypot((b.lng - a.lng) * mLng, (b.lat - a.lat) * R);
  }
  if (largo <= 0) return null;
  const z0 = g.elev[celdas[0]!]!, z1 = g.elev[celdas[celdas.length - 1]!]!;
  if (Number.isNaN(z0) || Number.isNaN(z1)) return null;
  return {
    puntos, largo_m: r1(largo), desnivel_m: r2(z0 - z1),
    pendiente_pct: r2(((z0 - z1) / largo) * 100),
    acumulacion: Math.round(acc[celdas[celdas.length - 1]!]!),
  };
}

const celdaDe = (g: GrillaElevacion, p: { lat: number; lng: number }): number | null => {
  if (g.rows < 2 || g.cols < 2) return null;
  const r = Math.round(((p.lat - g.latMin) / (g.latMax - g.latMin)) * (g.rows - 1));
  const c = Math.round(((p.lng - g.lngMin) / (g.lngMax - g.lngMin)) * (g.cols - 1));
  if (!Number.isFinite(r) || !Number.isFinite(c)) return null;
  if (r < 0 || r >= g.rows || c < 0 || c >= g.cols) return null;
  const i = r * g.cols + c;
  return Number.isNaN(g.elev[i]!) ? null : i;
};

/**
 * El desagüe de parcela: por dónde sale el agua del extremo de los surcos.
 *
 * Es la línea de máxima pendiente desde el final de los camellones, siguiendo el
 * mismo D8 con el que la app arma la cuenca, hasta que se encuentra con el cauce
 * —una celda con `acumulacion` por encima del umbral— o se va del predio. Si no
 * encuentra salida, el trazo queda corto y eso **es el resultado**: el surco sin
 * salida afuera es la falla documentada del sistema tradicional.
 */
export function trazarDesague(
  g: GrillaElevacion,
  desde: { lat: number; lng: number },
  o: { malla?: MallaFlujo; accCauce?: number; dentro?: (lat: number, lng: number) => boolean } = {},
): TrazoFlujo | null {
  const malla = o.malla ?? flujoD8(g);
  if (!malla) return null;
  const i0 = celdaDe(g, desde);
  if (i0 == null) return null;
  const accCauce = o.accCauce ?? Math.max(20, g.rows * g.cols * 0.01);

  const camino: number[] = [i0];
  const visto = new Set<number>([i0]);
  let i = i0;
  for (let n = 0; n < g.rows * g.cols; n++) {
    const d = malla.down[i]!;
    if (d < 0 || visto.has(d)) break;
    const ll = llDeCelda(g, d);
    if (o.dentro && !o.dentro(ll.lat, ll.lng)) break;
    camino.push(d); visto.add(d); i = d;
    if (malla.acc[d]! >= accCauce) break;   // llegó al cauce
  }
  return medirTrazo(g, camino, malla.acc);
}

/**
 * El cauce empastado: el eje de drenaje natural que cruza el predio.
 *
 * No se inventa un canal: se toma el que ya está. Se busca la celda de mayor
 * acumulación dentro del predio y se sube por el afluente de mayor acumulación
 * hasta que el eje deja de ser un eje. Es el elemento que la figura 6 de Kanwar
 * et al. dibuja como `grassed waterway` y es a donde descargan los desagües.
 *
 * La sección la pone `dimensionarSalida` con el pico de la tormenta de diseño y
 * el método de esfuerzo efectivo del cap. 7 del EFH 650. Acá sólo sale el eje,
 * su largo y su pendiente, que son las tres cosas que esa cuenta necesita.
 */
export function trazarCauce(
  g: GrillaElevacion,
  o: { malla?: MallaFlujo; dentro?: (lat: number, lng: number) => boolean } = {},
): TrazoFlujo | null {
  const malla = o.malla ?? flujoD8(g);
  if (!malla) return null;

  const adentro = (i: number) => {
    if (Number.isNaN(g.elev[i]!)) return false;
    if (g.dentro && g.dentro[i] === 0) return false;
    if (!o.dentro) return true;
    const ll = llDeCelda(g, i);
    return o.dentro(ll.lat, ll.lng);
  };

  let salida = -1, mejor = -1;
  for (let i = 0; i < malla.acc.length; i++) {
    if (!adentro(i)) continue;
    if (malla.acc[i]! > mejor) { mejor = malla.acc[i]!; salida = i; }
  }
  if (salida < 0) return null;

  // Sube por el afluente más caudaloso.
  const arriba: number[] = [salida];
  const visto = new Set<number>([salida]);
  const umbral = Math.max(2, mejor * 0.02);
  let i = salida;
  for (let n = 0; n < malla.acc.length; n++) {
    const r = Math.floor(i / g.cols), c = i % g.cols;
    let elegido = -1, accMax = -1;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr >= g.rows || cc < 0 || cc >= g.cols) continue;
      const j = rr * g.cols + cc;
      if (visto.has(j) || !adentro(j) || malla.down[j] !== i) continue;
      if (malla.acc[j]! > accMax) { accMax = malla.acc[j]!; elegido = j; }
    }
    if (elegido < 0 || accMax < umbral) break;
    arriba.push(elegido); visto.add(elegido); i = elegido;
  }

  return medirTrazo(g, arriba.reverse(), malla.acc);
}

// ─── La sección de las dos salidas ───────────────────────────────────────────

/**
 * La cobertura con la que se compone el CN del lote del camellón.
 *
 * El sistema publicado es un lote de **cultivo en línea**: el camellón se hace
 * para sembrar arriba del lomo, con hileras a 30, 45, 75 o 150 cm. Así que el
 * número de curva que corresponde al área de aporte del desagüe es el del
 * cultivo en línea en buena condición, no el de una pastura. Quien llame puede
 * pasar su propio CN si el lote es otra cosa.
 */
export const COBERTURA_LOTE_CAMELLON = 'cultivo_bueno';

export function cnDelLoteCamellon(grupo: GrupoHidro | null | undefined): number | null {
  if (!grupo) return null;
  const c = COBERTURAS.find(x => x.id === COBERTURA_LOTE_CAMELLON);
  return c ? c.cn[grupo] : null;
}

export interface SalidaDimensionada {
  caudal: CaudalDiseno;
  seccion: SeccionCauce;
}

/**
 * De un trazo de salida a su sección: el caudal pico del área que le llega y,
 * con ese caudal, el ancho y la profundidad que pide el cap. 7 del EFH 650.
 *
 * El largo y la pendiente del recorrido salen del trazo que el D8 ya dibujó, y
 * el área de aporte la pone quien llama: la unidad de drenaje para el desagüe
 * de parcela, el lote entero para el cauce empastado. No hay hidrología nueva.
 *
 * Devuelve `null` si falta alguno de los tres datos que no se pueden suponer:
 * la lámina de la tormenta de diseño, el número de curva o la textura del
 * suelo del cauce. Un ancho de obra inventado es peor que un ancho ausente.
 */
export function dimensionarSalida(
  trazo: TrazoFlujo | null,
  area_ha: number | null,
  o: {
    lluvia10a24h_mm?: number | null;
    cn?: number | null;
    erodibilidad?: ErodibilidadSuelo | null;
    forma?: FormaCauce;
    coberturaId?: string;
    resguardo_m?: number;
  },
): SalidaDimensionada | null {
  if (trazo == null || area_ha == null || !(area_ha > 0)) return null;
  if (o.lluvia10a24h_mm == null || o.cn == null || o.erodibilidad == null) return null;
  if (!(trazo.largo_m > 0) || !(trazo.pendiente_pct > 0)) return null;

  const caudal = caudalDeDiseno({
    area_ha,
    largoFlujo_m: trazo.largo_m,
    pendienteFlujo_m_m: trazo.pendiente_pct / 100,
    lluvia10a24h_mm: o.lluvia10a24h_mm,
    cn: o.cn,
    coberturaId: COBERTURA_LOTE_CAMELLON,
  });
  if (caudal == null) return null;

  const seccion = dimensionarCauce({
    caudal_m3s: caudal.caudal_m3s,
    pendiente_pct: trazo.pendiente_pct,
    forma: o.forma ?? 'parabolica',
    erodibilidad: o.erodibilidad,
    coberturaId: o.coberturaId,
    resguardo_m: o.resguardo_m,
  });
  if (seccion == null) return null;

  return { caudal, seccion };
}

// ─── El armado ───────────────────────────────────────────────────────────────

export interface EntradaCamellon {
  /** Pendiente media del área (%). La calcula quien llama. */
  pendienteTerreno_pct: number;
  grupoHidro?: GrupoHidro | null;
  /** Lluvia media anual (mm), para el límite de los 750 mm. */
  lluviaAnual_mm?: number | null;
  /** true cuando el diagnóstico de suelo expansivo dio positivo. */
  sueloExpansivo?: boolean;
  superficie_ha?: number | null;
  paso_m?: number;
  /**
   * Lámina de la tormenta de 10 años y 24 h (mm). Es la tormenta de diseño que
   * pide el cap. 7 del EFH 650 para un cauce empastado, y `climaExtremos` ya la
   * calcula. Sin esto, el desagüe y el cauce salen trazados pero sin sección.
   */
  lluvia10a24h_mm?: number | null;
  /** Clase textural del suelo del cauce: decide el esfuerzo que aguanta. */
  textura?: ClaseUSDA | null;
  /** CN del lote. Si no viene, sale del grupo hidrológico con cultivo en línea. */
  cn?: number | null;
  /** Tapiz del cauce empastado (ver `COBERTURAS_CAUCE`). */
  coberturaCauceId?: string;
  /** Resguardo sobre la profundidad de capacidad del cauce (m). */
  resguardoCauce_m?: number;
}

export interface ResultadoCamellon {
  banda: BandaCamellon;
  guia: LineaGuia | null;
  unidad: UnidadDeDrenaje | null;
  desague: TrazoFlujo | null;
  cauce: TrazoFlujo | null;
  cantidades: CantidadesCamellon | null;
  /** Caudal y sección del desagüe de parcela, que junta los surcos. */
  salidaDesague: SalidaDimensionada | null;
  /** Caudal y sección del cauce empastado, que saca el agua del lote. */
  salidaCauce: SalidaDimensionada | null;
  avisos: AvisoCalculo[];
  /** false cuando no hay geometría que dibujar, con el motivo en los avisos. */
  trazable: boolean;
}

/**
 * Los avisos de la geometría: cuándo el método publicado no aplica acá.
 *
 * Se arman aparte del trazado porque valen igual sin modelo de elevación: la
 * pendiente, la lluvia y el suelo alcanzan para saber si el camellón es la obra
 * que corresponde, y esa pregunta se contesta antes de dibujar.
 */
export function avisosCamellon(e: EntradaCamellon, banda: BandaCamellon): AvisoCalculo[] {
  const avisos: AvisoCalculo[] = [];
  const pend = Number.isFinite(e.pendienteTerreno_pct) ? e.pendienteTerreno_pct : 0;

  if (banda.vacia) {
    avisos.push({
      id: 'camellon_banda_vacia', nivel: 'alerta',
      titulo: 'Acá el camellón publicado no se puede trazar',
      detalle: banda.nota,
    });
  } else if (banda.recortada) {
    avisos.push({
      id: 'camellon_banda_recortada', nivel: 'aviso',
      titulo: 'El grado del surco sale recortado por la pendiente',
      detalle: banda.nota,
    });
  }

  if (pend > PENDIENTE_VERTISOL_MAX_PCT) {
    avisos.push({
      id: 'camellon_pendiente_alta', nivel: 'aviso',
      titulo: `Más de ${PENDIENTE_VERTISOL_MAX_PCT} % de pendiente`,
      detalle: `El camellón se desarrolló para suelos que «seldom occur on slopes greater than `
        + `${PENDIENTE_VERTISOL_MAX_PCT}%», y acá la pendiente media es de ${coma(r1(pend))} %. No es que el surco `
        + 'no drene: drena de más, y el elemento que gobierna pasa a ser el cauce empastado que recibe la '
        + 'descarga, que este módulo ubica pero no dimensiona.',
    });
  }

  if (e.lluviaAnual_mm != null && Number.isFinite(e.lluviaAnual_mm)
      && e.lluviaAnual_mm < LLUVIA_ASEGURADA_MM) {
    avisos.push({
      id: 'camellon_lluvia_insuficiente', nivel: 'aviso',
      titulo: `Menos de ${LLUVIA_ASEGURADA_MM} mm al año`,
      detalle: `El camellón es la obra de la zona de lluvia asegurada, y el límite publicado está «approximately `
        + `at ${LLUVIA_ASEGURADA_MM} mm»: acá llueven ${Math.round(e.lluviaAnual_mm)} mm. Por debajo de ese límite `
        + 'el camellón se recomendó «with limited success», y la razón es la misma que midieron en el altiplano '
        + 'etíope: la ventaja del surco aparece cuando hay exceso que drenar, y en el año seco del ensayo no hubo '
        + 'diferencia contra el laboreo tradicional «due to limited waterlogging». El surco cuesta igual.',
    });
  }

  if (e.sueloExpansivo === false) {
    avisos.push({
      id: 'camellon_sin_suelo_expansivo', nivel: 'aviso',
      titulo: 'Este suelo no es el que motiva el camellón',
      detalle: 'El camellón ancho con surco a pendiente se desarrolló para vertisoles, y el diagnóstico de suelo '
        + 'expansivo acá dio negativo. La geometría se traza igual —es un drenaje superficial y sirve en cualquier '
        + 'suelo de infiltración lenta—, pero los números publicados que la sostienen son de vertisol.',
    });
  }

  return avisos;
}

/**
 * La geometría completa del camellón para un área: línea guía, ancho de la
 * unidad de drenaje, desagüe, cauce y cantidades.
 *
 * El arranque de la línea guía es el punto más alto del área con dato: es de
 * donde se replantea a campo, porque los camellones se llenan ladera abajo. La
 * línea se traza para los dos lados desde ahí, así cruza el área entera.
 */
export function trazarCamellon(
  g: GrillaElevacion,
  e: EntradaCamellon,
  dentro?: (lat: number, lng: number) => boolean,
): ResultadoCamellon {
  const banda = bandaCamellon({
    pendienteTerreno_pct: e.pendienteTerreno_pct,
    grupoHidro: e.grupoHidro ?? null,
    cultivoSensibleAlAgua: true,   // el camellón existe porque el cultivo no tolera agua parada
  });
  const avisos = avisosCamellon(e, banda);
  const vacio: ResultadoCamellon = {
    banda, guia: null, unidad: null, desague: null, cauce: null,
    cantidades: null, salidaDesague: null, salidaCauce: null,
    avisos, trazable: false,
  };
  if (banda.vacia || banda.grado_pct == null) return vacio;

  /**
   * Los arranques candidatos: los puntos con dato más altos del área, **sin
   * pegarse al borde del modelo**.
   *
   * El margen de dos celdas no es cosmético. El gradiente se lee por
   * diferencias centradas, así que en la celda del borde no se puede leer, y el
   * punto más alto de un área cae casi siempre contra un borde. Arrancar ahí
   * devolvía `null` y dejaba sin geometría a un predio perfectamente trazable.
   */
  const margen = 2;
  const candidatos: number[] = [];
  for (let r = margen; r < g.rows - margen; r++) {
    for (let c = margen; c < g.cols - margen; c++) {
      const i = r * g.cols + c;
      if (Number.isNaN(g.elev[i]!)) continue;
      if (g.dentro && g.dentro[i] === 0) continue;
      if (dentro) {
        const ll = llDeCelda(g, i);
        if (!dentro(ll.lat, ll.lng)) continue;
      }
      candidatos.push(i);
    }
  }
  if (candidatos.length === 0) return vacio;
  candidatos.sort((a, b) => g.elev[b]! - g.elev[a]!);

  // Se prueba el más alto y, si de ahí no sale línea, puntos progresivamente
  // más bajos y lejanos en vez de los vecinos del mismo pico.
  let guia: LineaGuia | null = null;
  const INTENTOS = 8;
  for (let k = 0; k < INTENTOS; k++) {
    const i = candidatos[Math.floor((k * candidatos.length) / INTENTOS)]!;
    const arranque = llDeCelda(g, i);
    const unLado = trazarLineaGuia(g, arranque, {
      grado_pct: banda.grado_pct, sentido: 1, dentro,
    });
    const otroLado = trazarLineaGuia(g, arranque, {
      grado_pct: banda.grado_pct, sentido: -1, dentro,
    });
    // Se queda la más larga de las dos, NO se pegan. Las dos arrancan del mismo
    // punto y las dos bajan, así que pegarlas daría un techo a dos aguas y no
    // una línea guía: una línea al grado baja siempre para el mismo lado. Lo
    // que cubre el resto del área son las paralelas, que es lo que mide
    // `unidad`.
    const mejor = unLado && otroLado
      ? (unLado.largo_m >= otroLado.largo_m ? unLado : otroLado)
      : (unLado ?? otroLado);
    if (mejor && mejor.puntos.length > 2) { guia = mejor; break; }
  }
  if (!guia) {
    avisos.push({
      id: 'camellon_sin_guia', nivel: 'alerta',
      titulo: 'No se pudo trazar la línea guía',
      detalle: 'El modelo de elevación no alcanzó para resolver una línea al grado pedido dentro del área: '
        + 'o no hay dato, o el relieve es plano en la escala del modelo.',
    });
    return { ...vacio, avisos };
  }

  const malla = flujoD8(g) ?? undefined;
  const unidad = anchoUnidadDeDrenaje(g, guia.puntos, banda, { paso_m: e.paso_m });
  const finGuia = guia.puntos[guia.puntos.length - 1]!;
  const desague = trazarDesague(g, finGuia, { malla, dentro });
  const cauce = trazarCauce(g, { malla, dentro });
  const cantidades = e.superficie_ha != null
    ? cantidadesCamellon({
      superficie_ha: e.superficie_ha, paso_m: e.paso_m,
      anchoUnidad_m: unidad?.ancho_m ?? null,
    })
    : null;

  if (guia.pasosSinPendiente > 0) {
    avisos.push({
      id: 'camellon_guia_sin_pendiente', nivel: 'aviso',
      titulo: 'Hay tramos más suaves que el grado pedido',
      detalle: `En ${guia.pasosSinPendiente} de los ${guia.pasos} pasos del trazado el terreno es más suave que `
        + `el ${coma(guia.grado_pedido_pct)} % que pide el surco, así que ahí la línea baja por la máxima `
        + `pendiente y no al grado: el grado medido de la guía es ${coma(guia.grado_medido_pct)} %. No es un `
        + 'error del trazado, es el terreno, y el surco en esos tramos va a drenar menos de lo que el diseño '
        + 'supone.',
    });
  }

  /**
   * Las dos secciones. El área de aporte de cada una es distinta y la
   * diferencia importa: el desagüe de parcela junta **una** unidad de drenaje
   * —su ancho por el largo de la guía— y el cauce empastado junta el lote
   * entero. Dimensionar el desagüe con el área del lote da una obra tres veces
   * más grande que la que hace falta, y al revés deja el cauce chico.
   */
  const erod = erodibilidadDeTextura(e.textura ?? null);
  const cn = e.cn ?? cnDelLoteCamellon(e.grupoHidro);
  const comunes = {
    lluvia10a24h_mm: e.lluvia10a24h_mm ?? null,
    cn,
    erodibilidad: erod,
    coberturaId: e.coberturaCauceId,
    resguardo_m: e.resguardoCauce_m,
  };
  /**
   * El área de la unidad de drenaje, acotada por el lote.
   *
   * El tope no es prolijidad: `anchoUnidadDeDrenaje` devuelve **hasta dónde se
   * pueden correr los camellones** antes de que la deriva saque el surco de la
   * banda, que es un límite de diseño y no una medición del lote. En un lote
   * más chico que ese límite —el caso normal— el ancho por el largo de la guía
   * da un rectángulo más grande que el lote entero, y con eso el desagüe de
   * parcela se dimensionaba para un área que no existe. Al desagüe no le puede
   * llegar más agua que la que cae en el lote.
   */
  const areaRect_ha = unidad != null && unidad.ancho_m > 0
    ? (unidad.ancho_m * guia.largo_m) / 10_000
    : null;
  const areaUnidad_ha = areaRect_ha == null
    ? null
    : e.superficie_ha != null && e.superficie_ha > 0
      ? Math.min(areaRect_ha, e.superficie_ha)
      : areaRect_ha;
  const salidaDesague = dimensionarSalida(desague, areaUnidad_ha, comunes);
  const salidaCauce = dimensionarSalida(cauce, e.superficie_ha ?? null, comunes);

  if (salidaDesague == null && salidaCauce == null) {
    const falta: string[] = [];
    if (e.lluvia10a24h_mm == null) falta.push('la lámina de la tormenta de 10 años y 24 h');
    if (cn == null) falta.push('el grupo hidrológico del suelo, para el número de curva');
    if (erod == null) falta.push('la clase textural del suelo del cauce');
    avisos.push({
      id: 'camellon_salidas_sin_seccion',
      nivel: 'aviso',
      titulo: 'El desagüe y el cauce están trazados, pero sin sección',
      detalle: falta.length > 0
        ? `Para decir cuánto miden falta ${falta.join(', ')}. Por dónde van ya está resuelto; `
          + 'el ancho y la profundidad salen del pico de la tormenta de diseño y del esfuerzo '
          + 'que el suelo aguanta, y sin esos datos un ancho sería inventado.'
        : 'El pico de la tormenta no alcanza para dimensionar una sección en este trazo: '
          + 'o el recorrido no tiene pendiente, o el área de aporte es despreciable.',
    });
  }

  if (salidaCauce != null) {
    const sc = salidaCauce.seccion;
    avisos.push({
      id: 'camellon_cauce_dimensionado',
      nivel: 'ok',
      titulo: `El cauce de salida pide ${coma(sc.anchoTotal_m)} m de ancho`
        + ` y ${coma(sc.profundidadTotal_m)} m de profundidad`,
      detalle: `Es la sección mínima para el pico de ${coma(salidaCauce.caudal.caudal_m3s)} m³/s de la `
        + `tormenta de 10 años y 24 h, con el tapiz más pobre que se espera decidiendo el ancho. `
        + `Mueve del orden de ${coma(sc.areaExcavacion_m2)} m³ de suelo por cada metro de cauce. `
        + 'El detalle, los avisos de rango y las dos condiciones de estabilidad salen con la '
        + 'sección.',
    });
    // Los avisos de la sección viajan con ella y los muestra quien la dibuja;
    // acá sólo se eleva el que cambia la decisión de hacer la obra.
    for (const a of sc.avisos) {
      if (a.nivel === 'alerta') avisos.push(a);
    }
  }

  if (desague == null || (cauce != null && desague.acumulacion < cauce.acumulacion * 0.1)) {
    avisos.push({
      id: 'camellon_sin_salida', nivel: 'alerta',
      titulo: 'El surco no termina en una salida',
      detalle: 'El desagüe trazado desde el final de los camellones no llega a un cauce dentro del área. Es '
        + 'exactamente la falla documentada del sistema tradicional: «no outside drainage is constructed to take '
        + 'the field water», y entonces el agua se queda en el surco. El camellón sin desagüe de parcela y cauce '
        + 'de salida no es una obra de drenaje: es una pileta alargada.',
    });
  }

  avisos.push({
    id: 'camellon_grado_se_replantea', nivel: 'aviso',
    titulo: 'El grado se replantea con nivel, no sale del modelo',
    // Identidad de unidades: un grado en % por metros da directamente
    // centímetros, porque el 1 % de 1 m es 1 cm.
    detalle: `Un surco al ${coma(guia.grado_pedido_pct)} % baja `
      + `${coma(r1(guia.grado_pedido_pct * PASO_BBF_M))} cm cada ${coma(PASO_BBF_M)} m, y ningún `
      + 'modelo de elevación de los que usa la app tiene esa exactitud vertical. Esta geometría da la dirección, '
      + 'el trazado, el ancho de la unidad y dónde va el desagüe; la cota de cada estaca se fija con nivel en el '
      + 'campo. Es el mismo límite que la planilla de replanteo.',
  });

  return {
    banda, guia, unidad, desague, cauce, cantidades,
    salidaDesague, salidaCauce, avisos, trazable: true,
  };
}


// ─── El resumen que viaja ────────────────────────────────────────────────────

/**
 * La sección de una salida, reducida a lo que se compra y lo que se replantea.
 *
 * Es el puente entre el motor y los dos consumidores: la lista de materiales
 * —que necesita metros cúbicos y metros cuadrados, no coeficientes— y el
 * informe, que viaja por localStorage y por la base, así que tiene que ser
 * serializable y chico. Los puntos del trazo no viajan: el plano se dibuja en
 * el mapa, no en el informe.
 *
 * Las dos cantidades de obra son productos, y por eso se calculan acá y no en
 * `materiales.ts`: la sección da un área transversal y el trazo da un largo.
 * Multiplicarlos en el consumidor sería repetir la cuenta en cada consumidor.
 */
export interface SalidaResumen {
  cual:               'desague' | 'cauce';
  /** Largo del trazo (m) y su pendiente media (%). */
  largo_m:            number;
  pendiente_pct:      number;
  /** Área de aporte con la que se dimensionó (ha). */
  area_ha:            number;
  caudal_m3s:         number;
  lluvia_mm:          number;
  cn:                 number;
  tc_min:             number;
  forma:              FormaCauce;
  ancho_m:            number;
  anchoTotal_m:       number;
  profundidad_m:      number;
  profundidadTotal_m: number;
  velocidad_ms:       number;
  /** Talud de la orilla (z:1). Es la cota con la que se excava. */
  taludOrilla:        number;
  /** Movimiento de suelo: sección de excavación por el largo del trazo (m³). */
  excavacion_m3:      number;
  /** Superficie a empastar: ancho total por el largo del trazo (m²). */
  empastado_m2:       number;
  cobertura:          string;
  claseCapacidad:     ClaseRetardancia;
  claseEstabilidad:   ClaseRetardancia;
  sueloAguanta:       boolean;
  pastoAguanta:       boolean;
  esfuerzoEfectivo_pa:  number;
  esfuerzoAdmisible_pa: number;
  avisos:             AvisoCalculo[];
}

/**
 * El camellón entero, reducido a lo que entra en el informe.
 *
 * Quién lo lee: `materiales.ts` saca de acá los cinco renglones del sistema
 * —surco, yunta, las dos excavaciones y el empastado— y `InformeData` lo
 * guarda tal cual. Si se le agrega un campo, los dos lo ven; si se le saca
 * uno, la lista de materiales deja de poder cotizar ese renglón.
 */
export interface CamellonResumen {
  pendienteTerreno_pct: number;
  superficie_ha:      number | null;
  paso_m:             number;
  /** Grado al que se traza el surco (%), o `null` si la banda salió vacía. */
  grado_pct:          number | null;
  banda:              { min_pct: number; max_pct: number; vacia: boolean; nota: string };
  guia:               { largo_m: number; grado_medido_pct: number; corte: CorteGuia } | null;
  anchoUnidad_m:      number | null;
  camellones:         number | null;
  surco_m:            number | null;
  jornadasYunta:      { min: number; max: number } | null;
  salidaDesague:      SalidaResumen | null;
  salidaCauce:        SalidaResumen | null;
  trazable:           boolean;
  avisos:             AvisoCalculo[];
  fuentes:            string[];
}

function resumirSalida(
  cual: 'desague' | 'cauce',
  trazo: TrazoFlujo | null,
  sal: SalidaDimensionada | null,
): SalidaResumen | null {
  if (trazo == null || sal == null) return null;
  const s = sal.seccion;
  return {
    cual,
    largo_m:            Math.round(trazo.largo_m),
    pendiente_pct:      trazo.pendiente_pct,
    area_ha:            sal.caudal.area_ha,
    caudal_m3s:         sal.caudal.caudal_m3s,
    lluvia_mm:          sal.caudal.lluvia_mm,
    cn:                 sal.caudal.cn,
    tc_min:             sal.caudal.tc_min,
    forma:              s.forma,
    ancho_m:            s.ancho_m,
    anchoTotal_m:       s.anchoTotal_m,
    profundidad_m:      s.profundidad_m,
    profundidadTotal_m: s.profundidadTotal_m,
    velocidad_ms:       s.velocidad_ms,
    taludOrilla:        s.taludOrilla,
    excavacion_m3:      Math.round(s.areaExcavacion_m2 * trazo.largo_m),
    empastado_m2:       Math.round(s.anchoTotal_m * trazo.largo_m),
    cobertura:          s.cobertura.nombre,
    claseCapacidad:     s.claseCapacidad,
    claseEstabilidad:   s.claseEstabilidad,
    sueloAguanta:       s.sueloAguanta,
    pastoAguanta:       s.pastoAguanta,
    esfuerzoEfectivo_pa:  s.esfuerzoEfectivo_pa,
    esfuerzoAdmisible_pa: s.esfuerzoAdmisible_pa,
    avisos:             s.avisos,
  };
}

export function resumenCamellon(e: EntradaCamellon, r: ResultadoCamellon): CamellonResumen {
  return {
    pendienteTerreno_pct: r1(e.pendienteTerreno_pct),
    superficie_ha:  e.superficie_ha ?? null,
    paso_m:         e.paso_m ?? PASO_BBF_M,
    grado_pct:      r.banda.grado_pct,
    banda: {
      min_pct: r.banda.min_pct, max_pct: r.banda.max_pct,
      vacia: r.banda.vacia, nota: r.banda.nota,
    },
    guia: r.guia
      ? {
        largo_m: Math.round(r.guia.largo_m),
        grado_medido_pct: r.guia.grado_medido_pct,
        corte: r.guia.corte,
      }
      : null,
    anchoUnidad_m:  r.unidad?.ancho_m ?? null,
    camellones:     r.cantidades?.camellones ?? null,
    surco_m:        r.cantidades?.surco_m ?? null,
    jornadasYunta:  r.cantidades?.jornadasYunta ?? null,
    salidaDesague:  resumirSalida('desague', r.desague, r.salidaDesague),
    salidaCauce:    resumirSalida('cauce', r.cauce, r.salidaCauce),
    trazable:       r.trazable,
    avisos:         r.avisos,
    fuentes:        [FUENTE_ICRISAT_1982, FUENTE_MARESHA, FUENTE_NRCS330],
  };
}
