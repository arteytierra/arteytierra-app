/**
 * ¿El predio está sobre turba o suelo orgánico?
 *
 * ## Por qué existe
 *
 * En una turbera tropical la huerta no se limita por fertilidad: se limita
 * porque **para cultivar hay que drenar, y drenar destruye el suelo**. La turba
 * drenada se hunde unos 142 cm en los primeros cinco años y después alrededor de
 * 5 cm por año, y más del 90 % de ese hundimiento es oxidación y no compactación
 * (Hooijer et al. 2012). Es irreversible: el carbono se va a la atmósfera y la
 * cota no vuelve. Un modificador de aptitud no alcanza para decir eso, porque un
 * número negativo se lee como «rinde menos», no como «esto no se deshace».
 *
 * El relevamiento de Indomalaya lo pidió explícitamente para cuatro
 * ecorregiones —pantanos del suroeste de Borneo, de Sumatra, de los Sundarbans y
 * del delta del Irrawaddy—, donde PEATMAP marca entre 7 % y 41 % del polígono
 * como turbera mientras el texto de WWF los describe como aluvión mineral
 * fértil. A escala de ecorregión las dos cosas son ciertas, y por eso el aviso
 * tiene que salir del **punto**, no de la ficha.
 *
 * ## Por qué no se montan los polígonos de PEATMAP
 *
 * La licencia de PEATMAP cierra —**CC BY 4.0**, verificado el 26/09/2026 en el
 * repositorio de la Universidad de Leeds, doi:10.5518/252— así que redistribuir
 * el dato está permitido. Lo que no cierra es el peso: se publica como shapefile
 * por continente (Europa 170 MB, Sudamérica 83 MB, Asia 27 MB; unos 350 MB en
 * total) y no hay versión ráster ni servicio de consulta por punto. Empaquetarlo
 * exigiría rasterizarlo acá, y una rasterización hecha a mano de 350 MB de
 * polígonos es exactamente la clase de trabajo que produce un mapa plausible y
 * corrido unos kilómetros, que es el peor resultado posible para una capa cuya
 * única función es decir «tu predio está sobre turba».
 *
 * La alternativa que se usa acá es mejor por tres razones, no sólo más barata:
 * el dato ya viaja en cada consulta de suelo —SoilGrids trae carbono orgánico en
 * las seis profundidades—, es **del punto** y no del polígono, y es una medición
 * del perfil en vez de la pertenencia a un mapa. Si algún día conviene además
 * dibujar las turberas en el mapa, la licencia ya está verificada y la decisión
 * pasa a ser de peso, no de derechos.
 *
 * ## El criterio, y de dónde sale
 *
 * WRB 2022 define **material orgánico** por su carbono orgánico: **≥ 20 % de
 * carbono orgánico** en masa, o sea ≥ 200 g/kg. Ojo con la trampa de unidades,
 * que cambia el resultado por un factor 1,7: 20 % de *materia* orgánica no es
 * 20 % de *carbono* orgánico (materia ≈ carbono × 1,724, factor Van Bemmelen).
 * La taxonomía del USDA usa un umbral más bajo, **12 % de carbono orgánico**, y
 * esa diferencia es de sistema, no de error.
 *
 * Los dos niveles que devuelve esta función son esos dos umbrales:
 *
 * - **`turba`** — criterio de Histosol de WRB: material orgánico (≥ 200 g/kg)
 *   acumulando **≥ 40 cm** dentro del primer metro, empezando a menos de 40 cm
 *   de la superficie.
 * - **`organico`** — o el horizonte hístico de WRB (≥ 200 g/kg contiguos por
 *   ≥ 10 cm desde la superficie), o material orgánico del USDA (≥ 120 g/kg)
 *   acumulando ≥ 40 cm con el mismo arranque. Es suelo que se hunde al drenarlo
 *   aunque no clasifique como Histosol.
 *
 * ## Rango de validez, que acá es la mitad del asunto
 *
 * SoilGrids agregado a **1 km** promedia dentro de la celda. Una turbera chica o
 * el borde de una grande quedan diluidos con el suelo mineral de al lado y el
 * carbono baja del umbral: **esta función subestima, nunca sobreestima**. Por eso
 * un `null` significa «no da el umbral en esta celda de 1 km», y no «acá no hay
 * turba», y el texto que sale a pantalla lo dice con esas palabras.
 *
 * Si el perfil entero viene en cero no hay dato: la lectura de SoilGrids
 * convierte NoData en 0 río arriba, y sin el guardia un hueco del ráster —o un
 * espejo de agua— se leería como «suelo mineral confirmado».
 *
 * ## Validación contra puntos reales
 *
 * Medido el 26/09/2026 leyendo los COG de SoilGrids a 1 km. Carbono orgánico en
 * g/kg, las seis profundidades de 0–5 a 100–200 cm:
 *
 *   Kalimantan Central, cúpula de turba (-2,320 / 114,000)
 *       258,8 · 348,8 · 342,6 · 440,5 · 453,9 · 455,5
 *       → turba, 100 cm sobre el umbral de WRB
 *   Riau, Sumatra, turbera (0,750 / 102,100)
 *       109,7 · 149,6 · 93,7 · 130,4 · 145,1 · 140,7
 *       → organico por el umbral del USDA, 80 cm. **Este es el caso que muestra
 *         la dilución**: es turbera conocida y a 1 km no llega al 20 % de WRB.
 *   Sundarbans, aluvión salobre (22,000 / 89,200)
 *        54,3 · 35,4 · 25,0 · 23,1 · 22,5 · 22,5   → null
 *   Llanura gangética inferior (24,000 / 88,000)
 *        20,6 · 16,4 · 9,3 · 13,9 · 8,4 · 8,9      → null
 *   Pampa, control mineral (-33,500 / -61,500)
 *        23,0 · 19,1 · 11,6 · 6,2 · 2,9 · 1,3      → null
 *   Tonlé Sap, sobre el lago (13,000 / 104,000)
 *       todo NoData                                 → null por el guardia
 *
 * Separa lo que tiene que separar, y los dos niveles se ganan el lugar: con un
 * solo umbral —el de WRB— la turbera de Riau habría salido como suelo mineral.
 *
 * ## Lo que se probó y no sirve: la densidad aparente
 *
 * La turba tiene densidad aparente de 0,1 a 0,2 g/cm³ y era el corroborador
 * obvio. **SoilGrids no lo refleja**: en la cúpula de Kalimantan predice 1,02 a
 * 1,15 g/cm³, valores de suelo mineral, y en Riau 1,20 a 1,39. Imprimir esa
 * densidad al lado de «esto es turba» sería publicar una contradicción y hacerle
 * perder crédito al panel entero, así que el criterio usa sólo el carbono y la
 * densidad no se muestra. Queda anotado para que nadie la agregue pensando que
 * falta.
 *
 * Fuentes:
 *   IUSS Working Group WRB 2022, World Reference Base for Soil Resources, 4.ª ed.
 *     https://wrb.isric.org/files/WRB_fourth_edition_2022-12-18.pdf
 *   Xu, Morris, Liu y Holden 2018, PEATMAP, Catena, doi:10.1016/j.catena.2017.09.010
 *     datos doi:10.5518/252, CC BY 4.0
 *   Hooijer et al. 2012, Subsidence and carbon loss in drained tropical
 *     peatlands, Biogeosciences 9:1053, doi:10.5194/bg-9-1053-2012
 */
import type { CapaSuelo } from './suelos';

/** Material orgánico de WRB 2022: ≥ 20 % de carbono orgánico, en g/kg. */
export const SOC_ORGANICO_WRB = 200;

/** Material orgánico de la taxonomía del USDA: ≥ 12 % de carbono orgánico. */
export const SOC_ORGANICO_USDA = 120;

/** Espesor acumulado que pide el Histosol de WRB, en cm. */
export const ESPESOR_HISTOSOL_CM = 40;

/** El material orgánico tiene que empezar a menos de esta profundidad, en cm. */
export const ARRANQUE_MAX_CM = 40;

/** Espesor contiguo desde la superficie del horizonte hístico de WRB, en cm. */
export const ESPESOR_HISTICO_CM = 10;

/** Hasta dónde se acumula el espesor, en cm. */
const PROFUNDIDAD_MAX_CM = 100;

/**
 * Hundimiento sostenido de una turbera tropical drenada, en cm por año, después
 * de los primeros cinco (Hooijer et al. 2012). No es una predicción para este
 * predio: es el orden de magnitud publicado, y va con su fuente a la vista.
 */
export const HUNDIMIENTO_CM_ANO = 5;

export interface SueloOrganico {
  /** `turba` es el Histosol de WRB; `organico` es el escalón de abajo. */
  nivel: 'turba' | 'organico';
  /** Sistema cuyo umbral se cumplió, para poder citarlo en pantalla. */
  criterio: 'histosol_wrb' | 'histico_wrb' | 'organico_usda';
  /** Espesor acumulado de material orgánico dentro del primer metro, en cm. */
  espesor_cm: number;
  /** Carbono orgánico máximo del perfil, en g/kg. */
  soc_max: number;
  /** El mismo máximo en % de la masa, que es como lo expresan los umbrales. */
  soc_max_pct: number;
  /** Qué hacer y qué no, en una frase que se imprime tal cual. */
  cautela: string;
  /** El dato y su límite, para que el número no salga solo. */
  detalle: string;
}

/** Espesor de la capa en cm, desde los mm que guarda el perfil. */
const espesorCm = (c: CapaSuelo) => c.espesor_mm / 10;

/**
 * Acumula el espesor de las capas que pasan el umbral dentro del primer metro,
 * exigiendo que la más somera empiece a menos de `ARRANQUE_MAX_CM`.
 */
function espesorOrganico(perfil: CapaSuelo[], umbral: number): number {
  const califican = perfil.filter(
    c => c.carbono_org >= umbral && c.prof_top < PROFUNDIDAD_MAX_CM,
  );
  if (!califican.length) return 0;
  const arranque = Math.min(...califican.map(c => c.prof_top));
  if (arranque >= ARRANQUE_MAX_CM) return 0;
  return califican.reduce((t, c) => t + espesorCm(c), 0);
}

/** Espesor contiguo desde la superficie que pasa el umbral, en cm. */
function espesorContiguoDesdeSuperficie(perfil: CapaSuelo[], umbral: number): number {
  let total = 0;
  for (const c of perfil) {
    if (c.carbono_org < umbral) break;
    total += espesorCm(c);
  }
  return total;
}

const LIMITE_RESOLUCION =
  'El dato es de SoilGrids agregado a 1 km, que promedia dentro de la celda: una '
  + 'turbera chica o el borde de una grande quedan diluidos y no llegan al umbral. '
  + 'Esta lectura subestima, nunca sobreestima.';

/**
 * Detecta suelo orgánico en el perfil. Devuelve `null` cuando no llega a ningún
 * umbral **o cuando no hay dato**, que no es lo mismo pero en los dos casos la
 * respuesta honesta es no afirmar nada.
 */
export function detectarSueloOrganico(perfil: CapaSuelo[]): SueloOrganico | null {
  if (!perfil.length) return null;

  // Sin este guardia, un hueco del ráster o un espejo de agua —que llegan como
  // 0— se leerían como suelo mineral confirmado.
  if (perfil.every(c => c.carbono_org <= 0)) return null;

  const socMax = Math.max(...perfil.map(c => c.carbono_org));
  const comun = { soc_max: socMax, soc_max_pct: Math.round(socMax) / 10 };

  const wrb = espesorOrganico(perfil, SOC_ORGANICO_WRB);
  const histico = espesorContiguoDesdeSuperficie(perfil, SOC_ORGANICO_WRB);
  const usda = espesorOrganico(perfil, SOC_ORGANICO_USDA);

  if (wrb >= ESPESOR_HISTOSOL_CM) {
    return {
      ...comun,
      nivel: 'turba',
      criterio: 'histosol_wrb',
      espesor_cm: wrb,
      cautela:
        'No drenar. Este perfil cumple el criterio de Histosol de WRB: es turba. '
        + 'Drenarla para cultivar la hunde unos 142 cm en los primeros cinco años '
        + `y después alrededor de ${HUNDIMIENTO_CM_ANO} cm por año, y más del 90 % `
        + 'de ese hundimiento es oxidación y no compactación: el suelo no se '
        + 'asienta, se va. El diseño que funciona mantiene el nivel del agua alto '
        + 'y cultiva sobre camellones, nunca bajando la napa.',
      detalle:
        `${wrb} cm de material orgánico en el primer metro, con hasta `
        + `${comun.soc_max_pct} % de carbono orgánico. El umbral de WRB es 20 % en `
        + `40 cm. ${LIMITE_RESOLUCION}`,
    };
  }

  if (histico >= ESPESOR_HISTICO_CM) {
    return {
      ...comun,
      nivel: 'organico',
      criterio: 'histico_wrb',
      espesor_cm: histico,
      cautela:
        'Tratar como suelo orgánico: hay un horizonte hístico de WRB en '
        + 'superficie. No llega a Histosol por espesor, pero ese carbono se oxida '
        + 'igual si se drena o se labra, y con él baja la cota. Conviene cobertura '
        + 'permanente y no bajar la napa.',
      detalle:
        `${histico} cm contiguos de material orgánico desde la superficie, con `
        + `hasta ${comun.soc_max_pct} % de carbono orgánico. ${LIMITE_RESOLUCION}`,
    };
  }

  if (usda >= ESPESOR_HISTOSOL_CM) {
    return {
      ...comun,
      nivel: 'organico',
      criterio: 'organico_usda',
      espesor_cm: usda,
      cautela:
        'Tratar como suelo orgánico. No alcanza el 20 % de carbono que pide WRB '
        + 'pero sí el 12 % de la taxonomía del USDA, y al drenarlo se comporta '
        + 'igual en grado menor: se oxida y pierde cota. Conviene cobertura '
        + 'permanente y no bajar la napa. Si el predio está en una turbera '
        + 'conocida, el valor real puede ser mayor que el que mide la celda.',
      detalle:
        `${usda} cm de material orgánico del USDA en el primer metro, con hasta `
        + `${comun.soc_max_pct} % de carbono orgánico; no alcanza el 20 % de WRB. `
        + LIMITE_RESOLUCION,
    };
  }

  return null;
}
