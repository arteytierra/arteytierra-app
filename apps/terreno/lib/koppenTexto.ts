/**
 * Qué quiere decir una clase de Köppen, en castellano y con sus umbrales.
 *
 * La app mostraba el código y un rótulo de cuatro palabras —«Cwa · Subtropical
 * de invierno seco»— y ahí se terminaba. Para quien no tiene la tabla de
 * Köppen en la cabeza eso es una sigla: no dice si el verano es caluroso, ni
 * cuándo llueve, ni por qué esa clase y no la de al lado. Este módulo escribe
 * esa descripción.
 *
 * **Las tres letras son una definición, no una medición.** Cada letra de un
 * código Köppen es una regla con números: «a» quiere decir que el mes más
 * cálido pasa de 22 °C, «w» que el mes más seco del invierno recibe menos de la
 * décima parte del mes más lluvioso del verano. Así que la prosa no se inventa
 * ni se escribe clase por clase: se **compone** a partir de las letras, con el
 * umbral de cada una escrito al lado. Eso tiene dos consecuencias buenas: las
 * 31 clases quedan cubiertas sin que nadie tenga que redactar 31 párrafos, y no
 * hay forma de que el texto diga algo que la clasificación no dice.
 *
 * Lo que el texto describe es **la clase**, no el predio. Que «Cwa» signifique
 * que el mes más cálido pasa de 22 °C no dice cuántos grados tiene éste: eso
 * está en los números del panel, que salen de POWER o de Daymet. El texto
 * explica la etiqueta; los datos del lugar están al lado.
 *
 * Fuente de los criterios: Peel, M. C., Finlayson, B. L. y McMahon, T. A.,
 * "Updated world map of the Köppen-Geiger climate classification",
 * Hydrology and Earth System Sciences 11, 1633-1644 (2007), tabla 1.
 * https://doi.org/10.5194/hess-11-1633-2007
 * Es la misma tabla que implementa `clasificarKoppen` en lib/clima.ts y la
 * misma que usó Beck et al. (2023) para el mapa de 1 km que la app lee.
 *
 * **Fuente única de los rótulos.** Las 31 clases estaban escritas dos veces
 * —una en `lib/clima.ts` para el Köppen calculado y otra en `lib/koppenBeck.ts`
 * para el leído del mapa— y con palabras distintas: la misma clase se llamaba
 * «Selva tropical lluviosa» o «Selva tropical (lluvia todo el año)» según de
 * dónde hubiera salido. Ahora las dos leen de acá. Y la tabla de clima.ts
 * además estaba incompleta: le faltaban las cinco clases de invierno riguroso
 * (Dsc, Dsd, Dwc, Dwd, Dfd), que el clasificador sí puede devolver y que se
 * mostraban como un guión.
 *
 * Nada calcula sobre esto: es texto. Si se cambia una palabra no se mueve
 * ningún número.
 */

/** Grupo y rótulo corto de cada clase. Las 31 que el clasificador puede
 *  devolver; el mapa de Beck usa 30 de ellas (no distingue `As`, que agrupa
 *  dentro de `Aw`). */
const CLASES: Record<string, { grupo: string; titulo: string }> = {
  Af:  { grupo: 'Tropical',    titulo: 'Selva tropical lluviosa' },
  Am:  { grupo: 'Tropical',    titulo: 'Monzónico tropical' },
  Aw:  { grupo: 'Tropical',    titulo: 'Sabana tropical (invierno seco)' },
  As:  { grupo: 'Tropical',    titulo: 'Sabana tropical (verano seco)' },
  BWh: { grupo: 'Árido',       titulo: 'Desierto cálido' },
  BWk: { grupo: 'Árido',       titulo: 'Desierto frío' },
  BSh: { grupo: 'Árido',       titulo: 'Estepa cálida (semiárido cálido)' },
  BSk: { grupo: 'Árido',       titulo: 'Estepa fría (semiárido frío)' },
  Csa: { grupo: 'Templado',    titulo: 'Mediterráneo de verano cálido' },
  Csb: { grupo: 'Templado',    titulo: 'Mediterráneo de verano templado' },
  Csc: { grupo: 'Templado',    titulo: 'Mediterráneo de verano fresco' },
  Cwa: { grupo: 'Templado',    titulo: 'Subtropical húmedo de invierno seco' },
  Cwb: { grupo: 'Templado',    titulo: 'Subtropical de altura, invierno seco' },
  Cwc: { grupo: 'Templado',    titulo: 'Templado frío de invierno seco' },
  Cfa: { grupo: 'Templado',    titulo: 'Subtropical húmedo sin estación seca' },
  Cfb: { grupo: 'Templado',    titulo: 'Oceánico templado' },
  Cfc: { grupo: 'Templado',    titulo: 'Oceánico subpolar' },
  Dsa: { grupo: 'Continental', titulo: 'Continental, verano seco y cálido' },
  Dsb: { grupo: 'Continental', titulo: 'Continental, verano seco y templado' },
  Dsc: { grupo: 'Continental', titulo: 'Continental, verano seco y fresco' },
  Dsd: { grupo: 'Continental', titulo: 'Continental, verano seco e invierno extremo' },
  Dwa: { grupo: 'Continental', titulo: 'Continental, invierno seco y verano cálido' },
  Dwb: { grupo: 'Continental', titulo: 'Continental, invierno seco y verano templado' },
  Dwc: { grupo: 'Continental', titulo: 'Continental, invierno seco y verano fresco' },
  Dwd: { grupo: 'Continental', titulo: 'Continental, invierno seco y extremo' },
  Dfa: { grupo: 'Continental', titulo: 'Continental húmedo, verano cálido' },
  Dfb: { grupo: 'Continental', titulo: 'Continental húmedo, verano templado' },
  Dfc: { grupo: 'Continental', titulo: 'Subártico (taiga)' },
  Dfd: { grupo: 'Continental', titulo: 'Subártico de invierno extremo' },
  ET:  { grupo: 'Polar',       titulo: 'Tundra / altoandino' },
  EF:  { grupo: 'Polar',       titulo: 'Hielo permanente' },
};

/** Los 31 códigos, en orden de tabla. Útil para recorrerlos en un test. */
export const CODIGOS_KOPPEN = Object.keys(CLASES);

// ─── Las piezas ──────────────────────────────────────────────────────────────

/** Primera letra: el régimen térmico de fondo. */
const TERMICO: Record<string, string> = {
  A: 'Clima tropical: el mes más frío promedia 18 °C o más, así que no hay invierno térmico y ningún mes frena el crecimiento por frío.',
  B: 'Clima árido: lo que llueve en el año no alcanza para lo que ese calor evapora. El umbral con el que Köppen lo decide sube con la temperatura media y con la estación en que cae la lluvia, así que los mismos milímetros pueden ser sequía acá y suficiencia doscientos kilómetros más al sur.',
  C: 'Clima templado: el mes más frío promedia entre 0 y 18 °C. Hiela, pero el invierno no llega a congelar el suelo de manera sostenida.',
  D: 'Clima continental: el mes más frío promedia 0 °C o menos y el más cálido pasa de 10 °C. Invierno con el suelo congelado y verano de crecimiento, con la amplitud que eso supone.',
  E: 'Clima polar o de altura: ningún mes llega a 10 °C de media, que es el umbral por debajo del cual Köppen ya no reconoce bosque.',
};

/** Segunda letra del grupo A: cuánta estación seca hay. */
const LLUVIA_TROPICAL: Record<string, string> = {
  f: 'Llueve todo el año: hasta el mes más seco pasa los 60 mm.',
  m: 'Monzónico: hay una estación seca corta —el mes más seco baja de 60 mm—, pero el total del año es tan alto que la compensa y el suelo no llega a secarse del todo.',
  w: 'Con invierno seco: la estación seca cae en los meses frescos y la lluvia se junta en los cálidos.',
  s: 'Con verano seco: la estación seca cae en los meses cálidos, que en el trópico es la combinación rara.',
};

/** Segunda letra del grupo B: cuán lejos queda la lluvia del umbral. */
const SEQUEDAD: Record<string, string> = {
  W: 'Desierto: la lluvia del año no llega ni a la mitad de ese umbral.',
  S: 'Estepa: la lluvia queda entre la mitad y el total del umbral — seco, pero con una estación en que alcanza para el pasto.',
};

/** Tercera letra del grupo B: con o sin frío encima. */
const ARIDO_TERMICO: Record<string, string> = {
  h: 'Cálido: la media anual es de 18 °C o más, así que a la falta de agua no se le suma el frío.',
  k: 'Frío: la media anual no llega a 18 °C. El invierno puede ser duro y el problema del agua sigue estando igual.',
};

/** Segunda letra de los grupos C y D: cuándo llueve. */
const ESTACION_SECA: Record<string, string> = {
  s: 'Verano seco: el mes más seco del verano baja de 40 mm y recibe menos de un tercio de lo que cae en el mes más lluvioso del invierno. Es el régimen mediterráneo: el agua llega cuando hace frío y falta cuando hace calor.',
  w: 'Invierno seco: el mes más seco del invierno recibe menos de la décima parte de lo que cae en el mes más lluvioso del verano. El agua del año llega junto con el calor.',
  f: 'Sin estación seca: la lluvia se reparte entre las cuatro estaciones y ningún mes se descuelga del resto.',
};

/** Tercera letra de los grupos C y D: qué tan caluroso es el verano. */
const VERANO: Record<string, string> = {
  a: 'Verano caluroso: el mes más cálido supera los 22 °C de media.',
  b: 'Verano templado: ningún mes llega a 22 °C de media, pero hay cuatro o más por encima de 10 °C.',
  c: 'Verano corto: entre uno y tres meses superan los 10 °C de media.',
  d: 'Verano corto e invierno extremo: entre uno y tres meses pasan de 10 °C, y el mes más frío promedia menos de −38 °C.',
};

/** El grupo E no se descompone: son dos clases y cada una es una frase. */
const POLAR: Record<string, string> = {
  ET: 'Tundra: el mes más cálido queda entre 0 y 10 °C. Hay estación de crecimiento, y es corta.',
  EF: 'Hielo permanente: ningún mes llega a 0 °C de media.',
};

export interface TextoKoppen {
  codigo: string;
  /** 'Tropical', 'Árido', 'Templado', 'Continental', 'Polar'. */
  grupo: string;
  /** El rótulo corto, el mismo que se muestra al lado del código. */
  titulo: string;
  /** Una frase por letra del código, con el umbral que la define. */
  criterios: string[];
  /** Las mismas frases, unidas. Es lo que va en pantalla. */
  prosa: string;
}

/**
 * La descripción de una clase, o `null` si el código no es una de las 31.
 * `null` es una respuesta: el llamador no muestra nada, que es mejor que
 * mostrar un texto genérico que no describe a nadie.
 */
export function textoKoppen(codigo: string | null | undefined): TextoKoppen | null {
  if (!codigo) return null;
  const clase = CLASES[codigo];
  if (!clase) return null;

  const criterios: string[] = [];
  const grupo = codigo[0]!;
  const segunda = codigo[1];
  const tercera = codigo[2];

  const termico = TERMICO[grupo];
  if (termico) criterios.push(termico);

  if (grupo === 'A') {
    const l = segunda ? LLUVIA_TROPICAL[segunda] : undefined;
    if (l) criterios.push(l);
  } else if (grupo === 'B') {
    const s = segunda ? SEQUEDAD[segunda] : undefined;
    if (s) criterios.push(s);
    const t = tercera ? ARIDO_TERMICO[tercera] : undefined;
    if (t) criterios.push(t);
  } else if (grupo === 'C' || grupo === 'D') {
    const e = segunda ? ESTACION_SECA[segunda] : undefined;
    if (e) criterios.push(e);
    const v = tercera ? VERANO[tercera] : undefined;
    if (v) criterios.push(v);
  } else if (grupo === 'E') {
    const p = POLAR[codigo];
    if (p) criterios.push(p);
  }

  return {
    codigo,
    grupo: clase.grupo,
    titulo: clase.titulo,
    criterios,
    prosa: criterios.join(' '),
  };
}

/**
 * Grupo y rótulo de una clase, para quien sólo necesita eso. Devuelve un
 * descarte explícito cuando el código no está en la tabla: antes eso salía como
 * `{ grupo: '—', desc: codigo }` y se mostraba un guión en pantalla.
 */
export function rotuloKoppen(codigo: string): { grupo: string; titulo: string } {
  return CLASES[codigo] ?? { grupo: '—', titulo: codigo };
}

export const FUENTE_CRITERIOS_KOPPEN =
  'Criterios de Köppen-Geiger según Peel, Finlayson y McMahon (2007), tabla 1';
