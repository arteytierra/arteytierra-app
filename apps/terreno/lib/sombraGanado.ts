/**
 * Sombra para el ganado: cuántos metros cuadrados, dónde, y en qué meses.
 *
 * ## Qué pedía el plan y qué apareció al abrir la literatura
 *
 * La etapa D pedía dos números publicados —metros cuadrados de sombra por
 * animal, y a qué distancia tiene que estar para que el rodeo la use— más dos
 * que la app puede calcular y nadie más: en qué meses hace falta y dónde cae la
 * sombra.
 *
 * El primero existe. **El segundo no existe como distancia**, y eso es un
 * hallazgo y no una falta: ninguna de las cuatro fuentes leídas publica un radio
 * de uso de la sombra. Lo que publican es una *regla de ubicación* —la sombra NO
 * va al lado del agua ni del bloque de sal, justamente para correr al rodeo del
 * arroyo y repartir el pastoreo— y una distancia al **agua**, que es otra cosa.
 * Ver `RETIROS` y `DISTANCIA_AGUA_PIE` más abajo.
 *
 * Y el primer número, que el plan daba por resuelto, resultó ser el problema:
 * **tres documentos publican la tabla, los tres la llaman mínimo o estándar, y
 * no coinciden.** Para una vaca de carne dicen 30, 30–40 y 40 pies² por cabeza,
 * y la misma publicación que da 30–40 dice que **el óptimo son 40–70**. Del piso
 * más bajo que alguien llama mínimo (30) al techo del óptimo (70) hay un factor
 * **2,3**. Elegir un número y presentarlo como «el requerimiento» es elegir un
 * punto en un rango de 2,3× sin decirlo. Este módulo devuelve la banda con cada
 * número atribuido.
 *
 * ## Las fuentes
 *
 * 1. **Higgins, S.F., Agouridis, C.T. y Wightman, S.J., «Shade Options for
 *    Grazing Cattle», AEN-99, University of Kentucky Cooperative Extension**
 *    (revisión 04-2024). Es el origen que las otras citan —la norma de la NRCS
 *    de Virginia referencia explícitamente el trabajo de Larry W. Turner en
 *    Kentucky, a cuya memoria está dedicada esta publicación—, es la única que
 *    explica de dónde sale su propia tabla, y es la más reciente. De ahí salen:
 *      • *«The optimum recommendation is approximately 40-70 square feet/head of
 *        shade for mature cows on pasture, but that's difficult to achieve. A
 *        practical compromise is to provide 75% of this requirement.»*
 *      • La tabla 1, rotulada *«Suggested shade requirements for beef and dairy
 *        cattle (75% of optimum amount)»*, con su propia cautela: *«These
 *        recommendations are based upon limited UK research results and previous
 *        experience; additional research is needed regarding the benefits and
 *        optimum size.»*
 *      • *«For high-producing animals, shade should be provided for at least 75%
 *        of the herd in controlled grazing systems»* — que es **otro** 75 % y no
 *        el mismo.
 *      • *«A portable shade structure should be no more than 10 x 20 ft to be
 *        practical.»*
 *      • El caso resuelto: *«a 30-cow beef herd would require 900 to 1,200
 *        square feet of shade, or five to six portable shades (each 10 x 20
 *        ft).»*
 *      • *«If cattle have to travel more than 800 ft for water, grazing
 *        distribution will be less even.»*
 *      • *«Cattle generally prefer shade from trees rather than constructed
 *        structures»*, y el precio de no poner bastante: *«If there are not
 *        enough trees for the number of cattle, they will congregate under the
 *        trees, eroding the soil and exposing the roots, which can damage or
 *        kill the trees.»*
 *      • *«For dairy and beef cattle, the ideal ambient temperature is between
 *        41° and 77° F. When temperatures are over 77° F, cattle may begin to
 *        experience heat stress.»*
 *      • *«a well-designed portable shade structure can reduce total heat load
 *        by 30 to 50%.»*
 *
 * 2. **USDA-NRCS, *Virginia Conservation Practice Standard: Livestock Shade
 *    Structure, Code 717*** (noviembre de 2006), con su hoja de campo gemela de
 *    Alabama (*Job Sheet No. AL717*, 3/09), que agrega la fila del equino. Su
 *    tabla 1 se rotula *«Minimum shade requirement»* en Virginia y
 *    *«Recommended Shade Requirement»* en Alabama: el mismo cuadro, dos
 *    categorías distintas de exigencia. De ahí salen además los retiros, el 80 %
 *    de corte de luz de la tela, el tope de 25 × 42 pies por unidad portátil y
 *    la regla de orientación.
 *
 * 3. **University of Arizona Cooperative Extension, «Shelter Needs for Small
 *    Livestock», az2125** (2025), cuya tabla 1 se rotula *«Natural Resource
 *    Conservation Service standards for minimal livestock shade requirements»* y
 *    da, para la misma vaca de carne, **30** pies² donde la de Virginia da 40.
 *    Es la única que publica **altura mínima de techo** y las filas de aves y de
 *    cabras.
 *
 * 4. **USDA Southeast Regional Climate Hub, «Cattle Heat Stress Alert»**, de
 *    donde sale el umbral de ITH **por categoría** (fuente declarada: St-Pierre
 *    et al. 2003), que es la pieza que convierte el clima del predio en «estos
 *    meses piden sombra».
 *
 * Para el índice en sí: **NRC (1971)**, en la forma que usa temperatura de bulbo
 * seco y humedad relativa, tal como la transcribe Harithalekshmi y Kumar,
 * «Intercomparison of seven Temperature-Humidity Index (THI) equations», MAUSAM
 * (Indian Meteorological Department), que además la encuentra la más apta de las
 * siete para relacionar estrés calórico con producción de leche. Y para pasar del
 * punto de rocío a la humedad relativa, **FAO-56** (Allen et al., 1998),
 * ecuaciones 10, 11 y 14.
 *
 * ## Rango de validez
 *
 * Las tablas de superficie son de servicios de extensión y conservación de
 * Estados Unidos, calibradas para rodeo de carne y tambo en praderas templadas y
 * húmedas (Kentucky, Virginia, Alabama) y una de zona árida (Arizona). La propia
 * AEN-99 avisa que su tabla sale de investigación limitada. **No cubren ovinos:**
 * ninguna de las tres publica una fila de oveja, y acá no se inventa (ver
 * `filaDeCategoria`). Tampoco cubren feedlot ni encierre.
 *
 * El ITH está calibrado sobre *Bos taurus*; un rodeo cebú o cruza índica tolera
 * más, y ninguna de las fuentes leídas publica un umbral corregido por raza. Eso
 * se dice en pantalla en vez de ajustarlo a ojo.
 *
 * ## Quién lee esto
 *
 * El rodeo del predio (`rodeo.ts`) y el clima (`clima.ts`) entran; sale el bloque
 * de sombra del panel de Ganadería. La posición del sol la calcula `sombras.ts`
 * y acá se reusa: si dos archivos calculan la declinación, en algún momento la
 * app va a mostrar dos sombras distintas para el mismo mediodía.
 */

import type { MesDato } from './clima';
import { MESES } from './clima';
import { posicionSol, diaDelAnio } from './sombras';
import { categoriaDe, type Rodeo } from './rodeo';
import type { CategoriaAnimal } from './categorias';

// ─── Unidades ─────────────────────────────────────────────────────────────────

/** El pie, exacto. Está declarado en cada módulo que lo usa; no es un coeficiente. */
export const PIE_M = 0.3048;
/** Pie cuadrado en metros cuadrados, derivado del pie y no escrito aparte. */
export const PIE2_M2 = PIE_M * PIE_M;

const DEG = Math.PI / 180;

/**
 * Tolerancia para contar estructuras. Sin esto, un área que es múltiplo exacto
 * de la unidad —el caso del ejemplo resuelto de AEN-99, 1.200 pies² en sombras de
 * 200— puede dar una estructura de más por el error de punto flotante de pasar
 * por metros y volver. El redondeo no es cosmético: es una sombra más de
 * presupuesto.
 */
const EPS_CONTEO = 1e-9;

// ─── Las tres tablas de superficie, cada una con su nombre ────────────────────

export const FUENTE_AEN99 =
  'Higgins, Agouridis y Wightman, «Shade Options for Grazing Cattle», AEN-99, University of Kentucky Cooperative Extension (rev. 04-2024), tabla 1 — «75 % del óptimo»';
export const FUENTE_NRCS_717 =
  'USDA-NRCS, «Livestock Shade Structure», Virginia Conservation Practice Standard Code 717 (nov. 2006), tabla 1 «Minimum shade requirement»; la fila del equino, de la hoja de campo AL717 de Alabama (3/09)';
export const FUENTE_UA_AZ =
  'University of Arizona Cooperative Extension, «Shelter Needs for Small Livestock», az2125 (2025), tabla 1 «NRCS standards for minimal livestock shade requirements»';
export const FUENTE_SERCH =
  'USDA Southeast Regional Climate Hub, «Cattle Heat Stress Alert» (umbrales de St-Pierre et al. 2003)';
export const FUENTE_NRC_1971 =
  'NRC (1971), índice temperatura-humedad en su forma de bulbo seco y humedad relativa, según Harithalekshmi y Kumar, «Intercomparison of seven Temperature-Humidity Index (THI) equations», MAUSAM';
export const FUENTE_FAO56 =
  'Allen, Pereira, Raes y Smith (1998), «Crop evapotranspiration», FAO Irrigation and Drainage Paper 56, ecuaciones 10, 11 y 14';

/** Las filas de las tablas publicadas. Un `id` propio, porque las tres difieren. */
export type FilaId =
  | 'ternero_400lb' | 'novillo_800lb' | 'vaca_carne' | 'vaca_leche'
  | 'equino' | 'cerdo_cabra' | 'ave';

export interface FilaSombra {
  id: FilaId;
  /** Cómo la nombra la fuente, traducido. */
  nombre: string;
  /**
   * Pies cuadrados por cabeza, `[mín, máx]`. Una fuente que publica un solo
   * número repite el valor; así el consumidor no tiene que preguntar de qué
   * forma vino la fila.
   */
  ft2: readonly [number, number];
  /** Altura mínima libre del techo, en pies. `null` = la fuente no la publica. */
  alturaMin_pie: number | null;
}

/** AEN-99, tabla 1. Rangos, y explícitamente el 75 % del óptimo. */
export const SOMBRA_AEN99: readonly FilaSombra[] = [
  { id: 'ternero_400lb', nombre: 'Ternero de 400 lb (181 kg)',        ft2: [15, 20], alturaMin_pie: null },
  { id: 'novillo_800lb', nombre: 'Novillo de 800 lb (363 kg) o más',  ft2: [20, 25], alturaMin_pie: null },
  { id: 'vaca_carne',    nombre: 'Vaca de carne adulta',              ft2: [30, 40], alturaMin_pie: null },
  { id: 'vaca_leche',    nombre: 'Vaca de tambo',                     ft2: [40, 50], alturaMin_pie: null },
];

/** NRCS Virginia 717 + Alabama AL717. Un valor por fila, rotulado «mínimo». */
export const SOMBRA_NRCS: readonly FilaSombra[] = [
  { id: 'ternero_400lb', nombre: 'Ternero de 400 lb (181 kg)',        ft2: [23, 23], alturaMin_pie: null },
  { id: 'novillo_800lb', nombre: 'Novillo de 800 lb (363 kg) o más',  ft2: [32, 32], alturaMin_pie: null },
  { id: 'vaca_carne',    nombre: 'Vaca de carne adulta',              ft2: [40, 40], alturaMin_pie: null },
  { id: 'vaca_leche',    nombre: 'Vaca de tambo',                     ft2: [50, 50], alturaMin_pie: null },
  { id: 'cerdo_cabra',   nombre: 'Cerdo adulto',                      ft2: [20, 20], alturaMin_pie: 7 },
  { id: 'equino',        nombre: 'Equino',                            ft2: [60, 60], alturaMin_pie: null },
];

/** University of Arizona az2125. Es la única que publica altura de techo. */
export const SOMBRA_UA_AZ: readonly FilaSombra[] = [
  { id: 'vaca_leche',    nombre: 'Vaca de tambo',                     ft2: [40, 40], alturaMin_pie: 10 },
  { id: 'ternero_400lb', nombre: 'Ternero de 400 lb (181 kg)',        ft2: [15, 15], alturaMin_pie: 10 },
  { id: 'novillo_800lb', nombre: 'Novillo de 800 lb (363 kg) o más',  ft2: [20, 20], alturaMin_pie: 10 },
  { id: 'vaca_carne',    nombre: 'Vaca de carne adulta',              ft2: [30, 30], alturaMin_pie: 10 },
  { id: 'equino',        nombre: 'Equino',                            ft2: [50, 50], alturaMin_pie: 12 },
  { id: 'cerdo_cabra',   nombre: 'Cerdo o cabra',                     ft2: [10, 10], alturaMin_pie: 7 },
  { id: 'ave',           nombre: 'Ave de corral',                     ft2: [3, 3],   alturaMin_pie: 7 },
];

/**
 * El óptimo publicado para una vaca madura a campo, en pies² por cabeza.
 *
 * AEN-99 lo escribe aparte de su tabla y es el único número de todo el conjunto
 * que se presenta como óptimo y no como mínimo. La tabla sale de multiplicarlo
 * por `FRAC_PRACTICA` — pero sólo en el extremo de abajo, ver `coherenciaDelOptimo`.
 */
export const OPTIMO_VACA_FT2: readonly [number, number] = [40, 70];

/** «A practical compromise is to provide 75% of this requirement». */
export const FRAC_PRACTICA = 0.75;

/**
 * «Shade should be provided for at least 75% of the herd in controlled grazing
 * systems». Es **otra** cosa que `FRAC_PRACTICA`, y multiplicar las dos —que es
 * lo que sale si uno lee rápido— deja el 56 % del óptimo.
 */
export const FRAC_RODEO = 0.75;

/**
 * Lo que la tabla práctica es realmente respecto del óptimo, en cada extremo.
 *
 * El 75 % cierra exacto abajo (40 × 0,75 = 30) y no cierra arriba: el 75 % de 70
 * son 52,5 y la tabla dice 40. O sea que **el techo de la tabla práctica es el
 * piso del óptimo**: quien llega al número más alto de la tabla está recién
 * empezando lo que la misma publicación llama óptimo. Esto no es una crítica a la
 * fuente —es explícita en que su tabla es un compromiso—, es lo que hay que
 * mostrar para que nadie lea el 40 como un techo.
 */
export function coherenciaDelOptimo(): {
  piso_cierra: boolean; techo_cierra: boolean;
  techo_practico_ft2: number; techo_esperado_ft2: number;
} {
  const fila = SOMBRA_AEN99.find(f => f.id === 'vaca_carne')!;
  const esperado = Math.round(OPTIMO_VACA_FT2[1] * FRAC_PRACTICA * 10) / 10;
  return {
    piso_cierra:  Math.abs(fila.ft2[0] - OPTIMO_VACA_FT2[0] * FRAC_PRACTICA) < 0.05,
    techo_cierra: Math.abs(fila.ft2[1] - esperado) < 0.05,
    techo_practico_ft2: fila.ft2[1],
    techo_esperado_ft2: esperado,
  };
}

// ─── De la categoría de acequia a la fila publicada ───────────────────────────

/**
 * El mapeo, categoría por categoría y a mano.
 *
 * Se escribe explícito y no con una regla de peso vivo a propósito. La tabla
 * publicada **no es proporcional al peso**: 23 pies² para 181 kg son 0,127 por
 * kilo, y 32 para 363 kg son 0,088. Una regla de «pies² por kilo» contradiría a
 * la fuente en el primer renglón, y es exactamente el tipo de atajo que después
 * nadie revisa. Donde el mapeo es un juicio, el juicio está escrito y va a
 * pantalla.
 *
 * `fila: null` significa **sin fila publicada**. No se rellena con la fila más
 * parecida: esa categoría se cuenta aparte y se dice.
 */
const MAPA_CATEGORIA: Record<string, { fila: FilaId | null; nota?: string }> = {
  bovino_vaca_prom:      { fila: 'vaca_carne' },
  bovino_vaca_cria:      { fila: 'vaca_carne', nota: 'La vaca lactando produce más calor metabólico y es más sensible —AEN-99 lo dice— pero la tabla no tiene una fila aparte: el número es el de la vaca adulta.' },
  bovino_vaca_seca:      { fila: 'vaca_carne' },
  bovino_vaquillona_1_2: { fila: 'novillo_800lb', nota: 'A 250 kg queda entre las dos filas de recría (181 y 363 kg); se lee la de arriba, que es la que no desprovee.' },
  bovino_vaquillona_2_3: { fila: 'novillo_800lb' },
  bovino_ternero:        { fila: 'ternero_400lb', nota: 'A 200 kg está apenas arriba de los 181 kg de la fila; es la que corresponde.' },
  bovino_novillito:      { fila: 'novillo_800lb', nota: 'A 250 kg queda entre las dos filas de recría; se lee la de arriba.' },
  bovino_novillo:        { fila: 'novillo_800lb' },
  bovino_novillo_engorde:{ fila: 'vaca_carne',    nota: 'A 430 kg pasa los 363 kg de la fila de novillo, así que se lee la del animal adulto.' },
  bovino_toro:           { fila: 'vaca_carne',    nota: 'La tabla se termina en la vaca adulta y el toro pesa 700 kg. AEN-99 avisa que el animal más pesado es MÁS sensible al calor por la grasa de cobertura, así que este número es un piso y no el requerimiento.' },

  equino_adulto:         { fila: 'equino' },
  equino_crecimiento:    { fila: 'equino', nota: 'La tabla no distingue edad en el equino.' },
  equino_potrillo:       { fila: 'equino', nota: 'La tabla no distingue edad en el equino; para un potrillo de 150 kg el número queda holgado.' },

  caprino:               { fila: 'cerdo_cabra', nota: 'Arizona es la única de las tres que nombra a la cabra, y la agrupa con el cerdo en 10 pies². Virginia da 20 para el cerdo adulto: entre las dos hay un factor 2 para la misma fila.' },
  porcino:               { fila: 'cerdo_cabra', nota: 'Virginia publica 20 pies² para el cerdo adulto y Arizona 10 para «cerdo o cabra»: un factor 2 en la misma fila, y las dos se presentan como mínimo.' },

  ovino_oveja:           { fila: null },
  ovino_borrego:         { fila: null },
  ovino_carnero:         { fila: null },
};

/** Por qué una categoría no tiene fila. Es un resultado, no un agujero. */
export const SIN_FILA_OVINOS =
  'Ninguna de las tres tablas leídas publica una superficie de sombra para ovinos. Las fuentes coinciden en que la oveja y la cabra toleran el calor mejor que el bovino, pero eso no es un número: acá no se inventa uno y los ovinos se cuentan aparte.';

export interface FilaDeCategoria {
  filaId: FilaId | null;
  aen99:   FilaSombra | null;
  nrcs:    FilaSombra | null;
  arizona: FilaSombra | null;
  nota?:   string;
}

/** Las tres lecturas de la misma categoría, para poder mostrar la discrepancia. */
export function filaDeCategoria(categoriaId: string): FilaDeCategoria {
  const m = MAPA_CATEGORIA[categoriaId];
  if (!m || !m.fila) return { filaId: null, aen99: null, nrcs: null, arizona: null, nota: m?.nota };
  const id = m.fila;
  return {
    filaId:  id,
    aen99:   SOMBRA_AEN99.find(f => f.id === id) ?? null,
    nrcs:    SOMBRA_NRCS.find(f => f.id === id)  ?? null,
    arizona: SOMBRA_UA_AZ.find(f => f.id === id) ?? null,
    nota:    m.nota,
  };
}

// ─── La sombra que pide un rodeo ──────────────────────────────────────────────

export interface LoteSombra {
  loteId:    string;
  categoria: CategoriaAnimal;
  cabezas:   number;
  filaId:    FilaId | null;
  /** `[mín, máx]` en m², según AEN-99. `null` = la categoría no tiene fila. */
  aen99_m2:  readonly [number, number] | null;
  nrcs_m2:   number | null;
  arizona_m2: number | null;
  nota?:     string;
}

/**
 * Por qué las superficies de acá salen **sin redondear**, contra la costumbre del
 * resto de la app.
 *
 * Porque alimentan un `ceil`. El caso resuelto de AEN-99 —30 vacas, 1.200 pies²,
 * seis sombras de 10 × 20— es un múltiplo exacto de la unidad: 1.200 / 200 = 6
 * justo. Redondeando el área a un decimal, 111,4836 m² se vuelven 111,5, el
 * cociente pasa a 6,0009 y el `ceil` devuelve **siete** sombras. Una sombra
 * entera de presupuesto por un decimal de pantalla, y del lado caro, que es el
 * que nadie reclama. El redondeo va donde se muestra el número y no donde se usa.
 */

export interface SombraRodeo {
  lotes: LoteSombra[];
  cabezasConFila: number;
  cabezasSinFila: number;
  /**
   * El número de diseño: la banda de AEN-99 para todo el rodeo, en m². Se elige
   * esta fuente porque es la que las otras citan, la que explica de dónde sale su
   * tabla y la más reciente — no porque sea la más alta ni la más baja.
   */
  aen99_m2: readonly [number, number];
  /** Las otras dos, para que la discrepancia esté a la vista. */
  nrcs_m2:   number;
  arizona_m2: number;
  /** El óptimo publicado, sólo de las categorías que caen en la fila de vaca adulta. */
  optimo_m2: readonly [number, number] | null;
  cabezasConOptimo: number;
  /** La banda si se le da sombra al 75 % del rodeo y no al 100 %. */
  parcial_m2: readonly [number, number];
  /** Altura mínima libre del techo que pide la categoría más exigente, en m. */
  alturaMin_m: number | null;
  advertencias: string[];
  fuentes: string[];
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Superficie de sombra del rodeo, en las tres fuentes.
 *
 * No promedia las tres y no elige la más cómoda: devuelve las tres y marca como
 * número de diseño la banda de AEN-99. El panel muestra las otras al lado.
 */
export function sombraDelRodeo(rodeo: Rodeo): SombraRodeo {
  const lotes: LoteSombra[] = [];
  let aMin = 0, aMax = 0, nrcs = 0, az = 0;
  let optMin = 0, optMax = 0, conOptimo = 0;
  let conFila = 0, sinFila = 0, alturaMax_pie: number | null = null;
  const avisos = new Set<string>();

  for (const lote of rodeo.lotes) {
    const cat = categoriaDe(lote);
    if (!cat || lote.cabezas <= 0) continue;
    const f = filaDeCategoria(cat.id);
    const n = lote.cabezas;

    if (!f.filaId || !f.aen99) {
      sinFila += n;
      lotes.push({
        loteId: lote.id, categoria: cat, cabezas: n, filaId: null,
        aen99_m2: null, nrcs_m2: null, arizona_m2: null, nota: f.nota,
      });
      if (cat.especie === 'ovino') avisos.add(SIN_FILA_OVINOS);
      else avisos.add(`«${cat.nombre}» no tiene fila en ninguna de las tres tablas, así que no entra en la superficie y se cuenta aparte.`);
      continue;
    }

    conFila += n;
    const lMin = f.aen99.ft2[0] * PIE2_M2 * n;
    const lMax = f.aen99.ft2[1] * PIE2_M2 * n;
    aMin += lMin; aMax += lMax;
    const lNrcs = f.nrcs ? f.nrcs.ft2[0] * PIE2_M2 * n : lMax;
    const lAz   = f.arizona ? f.arizona.ft2[0] * PIE2_M2 * n : lMin;
    nrcs += lNrcs; az += lAz;

    if (!f.nrcs) avisos.add(`La norma de la NRCS no tiene fila para «${cat.nombre}»; en su columna se usó el techo de AEN-99.`);
    if (!f.arizona) avisos.add(`La tabla de Arizona no tiene fila para «${cat.nombre}»; en su columna se usó el piso de AEN-99.`);

    // El óptimo publicado es de la vaca madura a campo y de ninguna otra fila.
    if (f.filaId === 'vaca_carne') {
      optMin += OPTIMO_VACA_FT2[0] * PIE2_M2 * n;
      optMax += OPTIMO_VACA_FT2[1] * PIE2_M2 * n;
      conOptimo += n;
    }

    const h = f.arizona?.alturaMin_pie ?? f.nrcs?.alturaMin_pie ?? null;
    if (h !== null && (alturaMax_pie === null || h > alturaMax_pie)) alturaMax_pie = h;
    if (f.nota) avisos.add(`${cat.nombre}: ${f.nota}`);

    lotes.push({
      loteId: lote.id, categoria: cat, cabezas: n, filaId: f.filaId,
      aen99_m2: [lMin, lMax], nrcs_m2: lNrcs, arizona_m2: lAz,
      nota: f.nota,
    });
  }

  if (conFila > 0) {
    const coh = coherenciaDelOptimo();
    if (!coh.techo_cierra) {
      avisos.add(
        `Ojo con leer el número más alto como un techo: la tabla de diseño es, según su propia fuente, el ${Math.round(FRAC_PRACTICA * 100)} % del óptimo, ` +
        `y ese ${Math.round(FRAC_PRACTICA * 100)} % cierra en el extremo de abajo del óptimo (${OPTIMO_VACA_FT2[0]} × 0,75 = ${coh.piso_cierra ? SOMBRA_AEN99.find(f => f.id === 'vaca_carne')!.ft2[0] : '—'} pies²) y no en el de arriba, ` +
        `donde daría ${coh.techo_esperado_ft2.toLocaleString('es-AR')} pies² y la tabla dice ${coh.techo_practico_ft2}. El techo de la tabla es el piso del óptimo.`,
      );
    }
    if (Math.abs(nrcs - az) > 0.5) {
      const alto = Math.max(nrcs, az), bajo = Math.min(nrcs, az);
      avisos.add(
        `Las otras dos tablas no coinciden entre sí: ${r1(bajo).toLocaleString('es-AR')} m² contra ${r1(alto).toLocaleString('es-AR')} m² ` +
        `(un factor ${(alto / Math.max(bajo, 0.001)).toLocaleString('es-AR', { maximumFractionDigits: 2 })}), y las dos se presentan como mínimo.`,
      );
    }
    avisos.add(
      'La superficie no es sólo para que entren: si el ganado se apiña bajo una sombra chica se corta el movimiento de aire, que es la mitad del enfriamiento. Por eso el número es por cabeza y no por rodeo.',
    );
  }

  return {
    lotes,
    cabezasConFila: conFila,
    cabezasSinFila: sinFila,
    aen99_m2: [aMin, aMax],
    nrcs_m2: nrcs,
    arizona_m2: az,
    optimo_m2: conOptimo > 0 ? [optMin, optMax] : null,
    cabezasConOptimo: conOptimo,
    parcial_m2: [aMin * FRAC_RODEO, aMax * FRAC_RODEO],
    alturaMin_m: alturaMax_pie === null ? null : r1(alturaMax_pie * PIE_M),
    advertencias: [...avisos],
    fuentes: [FUENTE_AEN99, FUENTE_NRCS_717, FUENTE_UA_AZ],
  };
}

// ─── Con qué se hace esa sombra ───────────────────────────────────────────────

/** AEN-99: «no more than 10 x 20 ft to be practical». */
export const PORTATIL_AEN99_PIE: readonly [number, number] = [10, 20];
/** NRCS 717: «will be limited to 25 feet by 42 feet». */
export const PORTATIL_NRCS_PIE: readonly [number, number] = [25, 42];
/** La tela tiene que cortar al menos este tanto de la luz. Las tres coinciden. */
export const CORTE_LUZ_MIN_PCT = 80;
/** «a well-designed portable shade structure can reduce total heat load by 30 to 50%». */
export const BAJA_CARGA_TERMICA_PCT: readonly [number, number] = [30, 50];

export interface Estructuras {
  /** Unidad de AEN-99 (10 × 20 pies) y cuántas hacen falta, `[mín, máx]`. */
  unidad_aen99_m2: number;
  n_aen99: readonly [number, number];
  /** Unidad máxima de la NRCS (25 × 42 pies) y cuántas. */
  unidad_nrcs_m2: number;
  n_nrcs: readonly [number, number];
  advertencias: string[];
}

/**
 * Cuántas sombras portátiles cubren el área, bajo los dos topes publicados.
 *
 * Las dos fuentes dan un máximo para una unidad portátil y difieren por **5,25
 * veces** (200 pies² contra 1.050). No son el mismo criterio: la NRCS limita por
 * estructura —lo que resiste el marco de caño— y AEN-99 por manejo, lo que una
 * persona puede mover entre potreros. Las dos van, porque el número de sombras
 * es el presupuesto y conviene verlo con los dos criterios.
 */
export function estructurasPortatiles(area_m2: readonly [number, number]): Estructuras {
  const uA = PORTATIL_AEN99_PIE[0] * PORTATIL_AEN99_PIE[1] * PIE2_M2;
  const uN = PORTATIL_NRCS_PIE[0] * PORTATIL_NRCS_PIE[1] * PIE2_M2;
  const cuenta = (a: number, u: number) => (a <= 0 ? 0 : Math.ceil(a / u - EPS_CONTEO));
  return {
    unidad_aen99_m2: r1(uA),
    n_aen99: [cuenta(area_m2[0], uA), cuenta(area_m2[1], uA)],
    unidad_nrcs_m2: r1(uN),
    n_nrcs: [cuenta(area_m2[0], uN), cuenta(area_m2[1], uN)],
    advertencias: [
      `Los dos topes de unidad portátil que publican las fuentes difieren ${(uN / uA).toLocaleString('es-AR', { maximumFractionDigits: 2 })} veces: ` +
      `${PORTATIL_AEN99_PIE[0]} × ${PORTATIL_AEN99_PIE[1]} pies por manejo (lo que se puede mover) y ` +
      `${PORTATIL_NRCS_PIE[0]} × ${PORTATIL_NRCS_PIE[1]} pies por estructura (lo que resiste el marco).`,
      `La tela tiene que cortar al menos el ${CORTE_LUZ_MIN_PCT} % de la luz, y la estructura portátil se mueve de lugar cada tanto: si se queda, abajo no hay más pasto y hay barro.`,
    ],
  };
}

export interface ArbolesSombra {
  copa_m: number;
  area_copa_m2: number;
  n: readonly [number, number];
  advertencias: string[];
}

/**
 * Cuántos árboles de copa `copa_m` dan esa sombra.
 *
 * La copa se modela como una esfera, y la sombra de una esfera es un disco del
 * mismo diámetro en cualquier dirección: `π·D²/4`. Sobre suelo horizontal ese
 * disco se estira a un óvalo de área `π·D²/(4·sen θ)` según la altura del sol,
 * así que `π·D²/4` es el número **conservador** —el del sol alto, que es cuando
 * el animal busca la sombra—. A sol bajo la sombra es más grande, más oblicua y
 * menos necesaria.
 *
 * Esto es geometría, no una fuente: lo que sí es de AEN-99 es la consecuencia de
 * poner de menos, que no es que falte sombra sino que se mueren los árboles.
 */
export function arbolesEquivalentes(area_m2: readonly [number, number], copa_m: number): ArbolesSombra | null {
  if (!(copa_m > 0)) return null;
  const a = Math.PI * copa_m * copa_m / 4;
  const cuenta = (x: number) => (x <= 0 ? 0 : Math.ceil(x / a - EPS_CONTEO));
  return {
    copa_m: r1(copa_m),
    area_copa_m2: r1(a),
    n: [cuenta(area_m2[0]), cuenta(area_m2[1])],
    advertencias: [
      'El ganado prefiere la sombra de árbol a la construida, y ahí está la trampa: si los árboles no alcanzan para el rodeo, el ganado se amontona abajo, compacta, deja las raíces a la vista y los árboles se mueren. Poner de menos no da menos sombra: da menos árboles.',
      'La cuenta vale para copa madura. Un monte recién plantado no da esta sombra por años, y mientras tanto hace falta otra.',
    ],
  };
}

// ─── En qué meses hace falta: del clima al índice ─────────────────────────────

/** FAO-56, ec. 11: presión de vapor de saturación, en kPa, con T en °C. */
export function presionVaporSat_kPa(t_c: number): number {
  return 0.6108 * Math.exp(17.27 * t_c / (t_c + 237.3));
}

/**
 * Humedad relativa a una temperatura dada, a partir del punto de rocío.
 *
 * FAO-56, ec. 14 (`ea = e°(Trocío)`) dentro de la ec. 10 (`RH = 100·ea/e°(T)`).
 *
 * **Para qué está acá.** El umbral de estrés calórico se compara contra el índice
 * del momento más caluroso del día, y la app tiene la máxima media del mes. Lo
 * que NO tiene es la humedad de esa hora: `rh_pct` es la media de las 24 horas, y
 * la humedad relativa es mínima justo cuando la temperatura es máxima. Pegar la
 * humedad media a la máxima diaria sobreestima el índice en varios puntos —en el
 * ejemplo de los tests, 3,8— y eso puede ser una banda entera de severidad.
 *
 * El punto de rocío, en cambio, casi no se mueve en el día: la humedad absoluta
 * del aire es la misma a la mañana y a la tarde. Así que el apareo físicamente
 * correcto es **máxima media + rocío medio**, y de ahí sale la humedad de la hora
 * de calor. El error acá es del lado caro —sobra sombra— pero sigue siendo un
 * número equivocado.
 */
export function humedadRelativaEn(t_c: number, rocio_c: number): number {
  const rh = 100 * presionVaporSat_kPa(rocio_c) / presionVaporSat_kPa(t_c);
  return Math.max(0, Math.min(100, rh));
}

/**
 * Índice temperatura-humedad (ITH), NRC (1971), en la escala Fahrenheit en que se
 * publican los umbrales:
 *
 *     ITH = (1,8·T + 32) − (0,55 − 0,0055·HR) · (1,8·T − 26,8)
 *
 * `t_c` en °C, `rh_pct` en %. El resultado no tiene unidad: es un índice, y sólo
 * significa algo comparado contra el umbral de la categoría. No se convierte a
 * grados ni se muestra con °.
 */
export function indiceTempHumedad(t_c: number, rh_pct: number): number {
  const f = 1.8 * t_c + 32;
  return f - (0.55 - 0.0055 * rh_pct) * (1.8 * t_c - 26.8);
}

/**
 * Umbrales de ITH por categoría, del aviso del Climate Hub del USDA.
 *
 * Son contraintuitivos y vale leerlos dos veces: la **vaca de tambo en
 * producción** es la más sensible de todas (70) y la **vaquillona de tambo de
 * menos de un año**, la más resistente (77). O sea que el umbral no sigue al
 * tamaño ni a la edad: sigue al calor metabólico que el animal ya está
 * produciendo por dentro. Por eso en un rodeo manda la categoría más sensible y
 * no el promedio.
 */
export const UMBRALES_THI = {
  bovino_carne:          75,
  bovino_carne_engorde:  72,
  bovino_leche:          70,
  bovino_leche_vaq_0_1:  77,
  bovino_leche_vaq_1_2:  72,
} as const;

export type TipoUmbral = keyof typeof UMBRALES_THI;

export const UMBRAL_NOMBRE: Record<TipoUmbral, string> = {
  bovino_carne:         'Bovino de carne',
  bovino_carne_engorde: 'Bovino de carne en terminación',
  bovino_leche:         'Vaca de tambo en producción',
  bovino_leche_vaq_0_1: 'Vaquillona de tambo, hasta 1 año',
  bovino_leche_vaq_1_2: 'Vaquillona de tambo, de 1 a 2 años',
};

/**
 * La temperatura del aire a partir de la cual AEN-99 dice que el bovino puede
 * empezar a sufrir calor: 77 °F. Está acá porque es el contraste independiente
 * del índice — ver el test que muestra que 77 °F con 50 % de humedad dan ITH 72
 * justo, que es el umbral publicado del bovino en terminación. Dos fuentes que no
 * se citan entre sí, el mismo punto.
 */
export const T_CONFORT_MAX_F = 77;
export const T_CONFORT_MIN_F = 41;

export interface ThiMes {
  mesIndex: number;
  mes: string;
  tmax_c: number;
  /** El número que vale: ITH con la humedad de la hora de calor. */
  thi: number;
  /** Humedad relativa a la máxima, derivada del rocío (%). */
  rh_pico_pct: number;
  /** Lo que daría pegando la humedad media del mes a la máxima diaria. */
  thi_humedad_media: number | null;
  rh_media_pct: number | null;
  /** De dónde salió la humedad: `rocio` es la buena. */
  origenHumedad: 'rocio' | 'media';
  advertencias: string[];
}

/**
 * ITH de un mes. `null` si el mes no trae ni rocío ni humedad: sin humedad no hay
 * índice, y un índice con una humedad inventada es peor que no tenerlo.
 */
export function thiDelMes(m: MesDato, mesIndex: number): ThiMes | null {
  const avisos: string[] = [];
  let rhPico: number;
  let origen: 'rocio' | 'media';

  if (m.rocio_c !== undefined) {
    rhPico = humedadRelativaEn(m.tmax_c, m.rocio_c);
    origen = 'rocio';
    if (m.rocio_c > m.tmax_c) {
      avisos.push('El punto de rocío del mes es mayor que la máxima media, que no puede ser: la humedad quedó topeada en 100 % y el índice es el peor caso.');
    }
  } else if (m.rh_pct !== undefined) {
    rhPico = m.rh_pct;
    origen = 'media';
    avisos.push('Este mes no trae punto de rocío, así que se usó la humedad relativa media de las 24 horas. A la hora de más calor la humedad real es menor, así que el índice sale alto: el error va para el lado de pedir más sombra.');
  } else {
    return null;
  }

  const thi = indiceTempHumedad(m.tmax_c, rhPico);
  const thiMedia = m.rh_pct !== undefined && origen === 'rocio'
    ? indiceTempHumedad(m.tmax_c, m.rh_pct)
    : null;

  return {
    mesIndex,
    mes: MESES[mesIndex] ?? m.mes,
    tmax_c: m.tmax_c,
    thi: r1(thi),
    rh_pico_pct: Math.round(rhPico),
    thi_humedad_media: thiMedia === null ? null : r1(thiMedia),
    rh_media_pct: m.rh_pct ?? null,
    origenHumedad: origen,
    advertencias: avisos,
  };
}

export interface MesesConSombra {
  tipo: TipoUmbral;
  umbral: number;
  /** Los doce meses con su índice, en orden de calendario. */
  meses: ThiMes[];
  /** Los que pasan el umbral, en orden de calendario. */
  piden: ThiMes[];
  /** El peor del año. */
  pico: ThiMes | null;
  /** Cuánto pasa el pico del umbral, en puntos de índice. */
  margen_pico: number | null;
  advertencias: string[];
  fuentes: string[];
}

/**
 * Qué meses del predio pasan el umbral de la categoría más sensible del rodeo.
 *
 * No hay escalera de severidad acá a propósito. Las bandas que circulan
 * —alerta/peligro/emergencia— aparecen con cortes distintos en cada publicación y
 * ninguna de las fuentes leídas las da con números limpios, así que lo que se
 * informa es **cuántos puntos pasa del umbral publicado** y nada más. Una
 * escalera inventada se lee igual que una publicada, y es el error que este
 * repositorio ya tiene en otra parte.
 */
export function mesesQuePidenSombra(
  meses: readonly MesDato[],
  tipo: TipoUmbral = 'bovino_carne',
): MesesConSombra | null {
  if (meses.length === 0) return null;
  const umbral = UMBRALES_THI[tipo];
  const calc: ThiMes[] = [];
  for (let i = 0; i < meses.length; i++) {
    const m = meses[i];
    if (!m) continue;
    const t = thiDelMes(m, i);
    if (t) calc.push(t);
  }
  if (calc.length === 0) return null;

  const piden = calc.filter(t => t.thi > umbral);
  let pico = calc[0]!;
  for (const t of calc) if (t.thi > pico.thi) pico = t;

  const avisos: string[] = [];
  if (calc.length < 12) {
    avisos.push(`Sólo ${calc.length} de los 12 meses traen humedad; los otros quedaron sin índice.`);
  }
  if (calc.some(t => t.origenHumedad === 'media')) {
    avisos.push('Hay meses calculados con la humedad media de las 24 horas en vez de la de la hora de calor: ésos salen altos.');
  }
  if (piden.length === 0) {
    avisos.push(`Ningún mes pasa el umbral de ${umbral} para ${UMBRAL_NOMBRE[tipo].toLowerCase()}. Eso no significa que la sombra no sirva: el índice es un promedio de días medios, y un día de ola de calor pasa el umbral igual. La sombra además corre al ganado del arroyo y reparte el pastoreo, que es razón suficiente.`);
  } else if (piden.length === 12) {
    avisos.push('Los doce meses pasan el umbral. Acá la sombra no es un refugio de verano: es parte de la infraestructura del campo.');
  }
  avisos.push('El umbral está calibrado sobre razas británicas y continentales. Un rodeo cebú o cruza índica tolera más, y ninguna de las fuentes leídas publica un umbral corregido por raza.');
  avisos.push('Esto sale de las medias mensuales del predio. Los días de ola de calor —que son los que matan animales— no están acá: están en los extremos de la serie diaria.');

  return {
    tipo, umbral, meses: calc, piden, pico,
    margen_pico: r1(pico.thi - umbral),
    advertencias: avisos,
    fuentes: [FUENTE_NRC_1971, FUENTE_SERCH, FUENTE_FAO56],
  };
}

/**
 * El umbral que manda en un rodeo: el de la categoría más sensible, no el
 * promedio. Mientras acequia no tenga categorías de tambo, todo bovino que
 * pastorea se lee como bovino de carne y el novillo en engorde baja el umbral.
 */
export function umbralDelRodeo(rodeo: Rodeo): { tipo: TipoUmbral; porque: string } | null {
  let hayBovino = false, hayEngorde = false;
  for (const l of rodeo.lotes) {
    if (l.cabezas <= 0) continue;
    const c = categoriaDe(l);
    if (!c || c.especie !== 'bovino') continue;
    hayBovino = true;
    if (c.id === 'bovino_novillo_engorde') hayEngorde = true;
  }
  if (!hayBovino) return null;
  return hayEngorde
    ? { tipo: 'bovino_carne_engorde', porque: 'Hay novillos en engorde, y la fuente les da el umbral más bajo de las categorías de carne: manda el más sensible y no el promedio.' }
    : { tipo: 'bovino_carne', porque: 'Rodeo de carne. Si hubiera vacas de tambo en producción el umbral bajaría a 70, pero acequia todavía no tiene esa categoría.' };
}

// ─── Dónde cae la sombra ──────────────────────────────────────────────────────

/**
 * La orientación, y el mecanismo que la justifica.
 *
 * Las tres fuentes dicen **eje largo norte-sur**, y la de Virginia dice por qué:
 * *«This will permit a greater amount of sunshine to affect the total shaded
 * area»* — o sea que la sombra barre de este a oeste sobre una faja ancha, cada
 * punto del suelo recibe sol en algún momento del día y abajo no se hace barro.
 * La excepción está publicada en la misma oración: *«If the animals are to be
 * confined under the structure, then an east to west orientation of the long axis
 * is more desirable»*, porque ahí conviene que la sombra se quede quieta.
 */
export const ORIENTACION_A_CAMPO = 'norte-sur';
export const ORIENTACION_ENCIERRE = 'este-oeste';

export interface SombraEnElPiso {
  mesIndex: number;
  mes: string;
  /** Altura del sol al mediodía solar, en grados. */
  elevacion_mediodia: number;
  /** Cuánto se corre la sombra al mediodía solar, en m. */
  corrimiento_mediodia_m: number | null;
  /** Lo mismo tres horas después, cuando el sol bajó. `null` si ya se puso. */
  elevacion_tarde: number;
  corrimiento_tarde_m: number | null;
  altura_m: number;
  notas: string[];
}

/**
 * Dónde cae la sombra de un techo plano, y por qué la tabla está en área de techo.
 *
 * La sombra de una placa horizontal sobre suelo horizontal es la misma figura
 * **trasladada**: tiene exactamente el área del techo, cualquiera sea la altura
 * del sol. Eso es lo que hace legítima una tabla en pies² de techo. Lo que cambia
 * con el sol es **dónde** está: se corre `altura / tan(elevación)` en la dirección
 * opuesta al sol.
 *
 * Y ahí está el detalle de diseño que no se ve en la tabla: al mediodía solar de
 * verano el sol está casi vertical y la sombra queda debajo del techo, pero la
 * máxima de aire llega más tarde, con el sol más bajo, y entonces la sombra está
 * corrida varios metros hacia el este. Si el techo es angosto, a la hora en que
 * el animal la necesita la sombra no está donde está la estructura.
 */
export function sombraEnElPiso(lat_deg: number, mesIndex: number, altura_m: number): SombraEnElPiso | null {
  if (mesIndex < 0 || mesIndex > 11 || !(altura_m > 0)) return null;
  const doy = diaDelAnio(mesIndex + 1, 15);
  const mediodia = posicionSol(lat_deg, doy, 12);
  const tarde    = posicionSol(lat_deg, doy, 15);
  const corr = (elev: number) => (elev <= 1 ? null : r1(altura_m / Math.tan(elev * DEG)));

  const notas = [
    'La sombra de un techo plano tiene el área del techo sea cual sea la altura del sol: lo que cambia es dónde cae. Por eso la tabla publicada está en superficie de techo y no depende de la latitud.',
    'Al mediodía solar la sombra está casi debajo de la estructura. La máxima de temperatura del aire llega después, con el sol más bajo, y ahí la sombra ya está corrida hacia el este: si el techo es angosto, a esa hora el animal tiene que salirse de abajo para estar a la sombra.',
    `Eje largo ${ORIENTACION_A_CAMPO} a campo, para que la faja sombreada barra y el suelo de abajo se seque; ${ORIENTACION_ENCIERRE} sólo si los animales quedan confinados debajo.`,
  ];
  if (mediodia.elevacion <= 0) notas.push('Este mes el sol no pasa el horizonte al mediodía en esta latitud: no hay sombra que calcular.');

  return {
    mesIndex,
    mes: MESES[mesIndex] ?? '',
    elevacion_mediodia: r1(mediodia.elevacion),
    corrimiento_mediodia_m: corr(mediodia.elevacion),
    elevacion_tarde: r1(tarde.elevacion),
    corrimiento_tarde_m: corr(tarde.elevacion),
    altura_m: r1(altura_m),
    notas,
  };
}

// ─── Dónde NO va, que es lo que las fuentes sí publican ───────────────────────

/** Retiros de la NRCS 717, en pies. */
export const RETIROS = {
  aguaSuperficial: 200,
  pozoAguasArriba: 150,
  pozoAguasAbajo:  300,
  obstruccionAire:  50,
} as const;

/**
 * AEN-99: más de 800 pies al agua y el pastoreo se desparrama mal. Es distancia
 * **al agua**, no a la sombra, y es otro criterio que los 1.980 pies de
 * `abrevadero.ts`: ése decide si el rodeo llega junto al bebedero —y entonces
 * hacen falta el doble de bocas—, y éste decide si el potrero se pastorea
 * parejo. Los dos son publicados y no se contradicen: miden cosas distintas.
 */
export const DISTANCIA_AGUA_PIE = 800;

export interface UbicacionSombra {
  /** Los retiros, pasados a metros. */
  retiros_m: Record<keyof typeof RETIROS, number>;
  distancia_agua_m: number;
  /** La respuesta honesta a «¿a qué distancia?». */
  reglas: string[];
  advertencias: string[];
  fuentes: string[];
}

/**
 * Dónde va la sombra.
 *
 * Acá está el resultado negativo de la etapa: **ninguna de las fuentes leídas
 * publica un radio de uso de la sombra.** No hay un «el rodeo camina hasta X
 * metros a la sombra» que se pueda citar. Lo que hay es una regla de ubicación, y
 * va en la dirección contraria a la intuición: la sombra NO se pone donde el
 * ganado ya está, se pone donde se lo quiere llevar.
 */
export function ubicacionDeLaSombra(): UbicacionSombra {
  const aM = (pie: number) => r1(pie * PIE_M);
  return {
    retiros_m: {
      aguaSuperficial: aM(RETIROS.aguaSuperficial),
      pozoAguasArriba: aM(RETIROS.pozoAguasArriba),
      pozoAguasAbajo:  aM(RETIROS.pozoAguasAbajo),
      obstruccionAire: aM(RETIROS.obstruccionAire),
    },
    distancia_agua_m: aM(DISTANCIA_AGUA_PIE),
    reglas: [
      `La sombra no va al lado del agua ni del bloque de sal, y eso es textual en las dos normas: la proximidad al agua y a los minerales se planifica «para crear el patrón de pastoreo que se busca». Juntar las tres cosas concentra el pisoteo, el estiércol y el sobrepastoreo en un solo lugar.`,
      `Va, al contrario, a correr al rodeo de la costa del arroyo: con calor el ganado se mete al agua y a la ribera, y ahí es donde el campo pierde suelo y el agua se ensucia. Una sombra lejos del arroyo es una obra de calidad de agua.`,
      `A ${aM(RETIROS.aguaSuperficial)} m o más de cualquier agua superficial, ${aM(RETIROS.pozoAguasArriba)} m de un pozo que esté aguas arriba y ${aM(RETIROS.pozoAguasAbajo)} m de uno aguas abajo.`,
      `A ${aM(RETIROS.obstruccionAire)} m o más de cualquier construcción que corte el aire. El alambrado no cuenta como obstrucción, salvo que impida llegar a la sombra.`,
      `Sitio bien drenado; si no lo hay, que la sombra sea portátil. Y moverla cada tanto, porque abajo se termina el pasto.`,
      `Repartida por el potrero en vez de junta: un solo grupo de árboles en el medio de un potrero grande junta todo el estiércol y toda la compactación en un punto.`,
    ],
    advertencias: [
      'Ninguna de las fuentes leídas publica a qué distancia tiene que estar la sombra para que el rodeo la use. Lo que publican es a qué distancia tiene que estar el AGUA —más de ' +
      `${aM(DISTANCIA_AGUA_PIE)} m y el pastoreo deja de ser parejo— y la regla de no pegar la sombra al agua. acequia no convierte eso en un radio de sombra: diría un número que nadie publicó.`,
      'Con los árboles hay un orden que la fuente marca y es fácil invertir: plantarlos del lado oeste del potrero, que es de donde viene el sol de la tarde.',
    ],
    fuentes: [FUENTE_AEN99, FUENTE_NRCS_717],
  };
}
