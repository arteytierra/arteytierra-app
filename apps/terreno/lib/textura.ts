/**
 * Las doce clases del triángulo textural USDA, leídas del manual.
 *
 * ## La fuente
 *
 * **Soil Survey Manual**, Soil Science Division Staff, USDA Handbook No. 18,
 * edición de **marzo de 2017**, capítulo 3 («Examination and Description of
 * Soil Profiles»), sección *Definitions of Soil Texture Classes and
 * Subclasses*, **página 124**; el triángulo es la figura 3-7 de la página 125
 * y la agrupación general es la tabla 3-1 de la página 126. Las fracciones de
 * tamaño están en la página 120.
 *
 * Se leyó el PDF del primario —639 páginas, el que publica el NRCS— el
 * 22/10/2026. Las doce definiciones están transcriptas abajo tal como las
 * escribe el manual, y cada una está al lado de la condición que la codifica.
 *
 * ## Por qué existe este módulo
 *
 * Porque había **dos** clasificadores y los dos estaban mal:
 *
 * - `clasificarTextura` de `lib/suelos.ts` tenía **diez** salidas, no doce: el
 *   franco arcillo arenoso y el franco arcillo limoso no salían nunca. Barrido
 *   el triángulo entero en paso de 1 %, se equivocaba en **1.699 de 5.151
 *   celdas, el 33,0 %**. No era un rótulo: `lib/usle.ts` indexa la erodabilidad
 *   K por ese string, así que el error entraba en el cálculo de erosión.
 * - `claseUSDA` de `lib/emplazamiento.ts` tenía las doce, pero se apartaba del
 *   texto en **43 celdas (0,83 %)**, todas sobre las líneas de borde, y
 *   siempre del mismo modo: usaba `>=` donde el manual dice *more than*, con
 *   lo cual el borde caía en la clase **más gruesa**. Más grueso es más
 *   permeable: en el campo de infiltración sobra tasa de absorción y en la
 *   USLE falta erodabilidad. Las dos del lado inseguro.
 *
 * Una de esas 43 celdas es el vértice `(arcilla 10, arena 90, limo 0)`, que es
 * justamente el punto donde se decide una ambigüedad del manual. Ver abajo.
 *
 * ## La verificación
 *
 * Las doce definiciones son desigualdades lineales, así que la prueba fuerte no
 * es un puñado de puntos: es que **partan el triángulo sin huecos ni solapes**.
 * Barridas las 5.151 celdas enteras de arcilla/arena/limo en paso de 1 %, cada
 * una cae en exactamente una clase: **cero celdas sin clase, cero celdas con
 * más de una**. Cualquier límite mal leído habría dejado un hueco o un solape,
 * así que la partición perfecta prueba a la vez que la transcripción está bien
 * y que el código la implementa.
 *
 * ## Las dos frases ambiguas, y cómo las resuelve la geometría
 *
 * El manual tiene dos límites escritos de un modo que no dice si el extremo
 * entra. Probadas las cuatro combinaciones sobre el triángulo entero, sólo una
 * lectura cierra la partición:
 *
 * 1. **«more than 20 to 45 percent sand»** (franco arcilloso). Sólo
 *    `arena > 20` y `arena <= 45` da cero huecos y cero solapes; las otras tres
 *    lecturas dejan 13 celdas colgadas o 13 repetidas. Y es exactamente lo que
 *    dice el texto: *more than* 20, *to* 45. La redacción y la geometría
 *    coinciden.
 * 2. **«between 70 and 90 percent sand»** (arenoso franco). Acá hay algo más
 *    lindo. Los dos números son **redundantes**: si `limo + 2·arcilla < 30`
 *    entonces la arena ya es mayor que 70 por aritmética, y si la arena pasa de
 *    90 entonces `limo + 1,5·arcilla` no puede llegar a 15. Las dos condiciones
 *    lineales ya encierran el intervalo. Con una sola excepción: la celda
 *    `(10, 90, 0)`, que es el punto donde la recta `limo + 1,5·arcilla = 15`
 *    —el borde entre arenoso y arenoso franco— toca el lado de limo cero. Ahí,
 *    y sólo ahí, hace falta leer el 90 como inclusive; si no, ese vértice del
 *    triángulo queda sin ninguna clase.
 *
 * ## Rango de validez y qué pasa afuera
 *
 * Esto no es un método empírico calibrado en ningún lado: es una definición, y
 * vale donde los tres porcentajes son los de la **tierra fina** (partículas
 * menores a 2 mm). Los fragmentos de roca quedan afuera del denominador, que es
 * la base en la que informan SoilGrids y SSURGO.
 *
 * Lo que sí hay que cuidar es la suma. Las tres fracciones vienen de
 * predicciones independientes, así que no suman 100 exacto: redondean. Este
 * módulo **normaliza a 100** antes de clasificar, porque las definiciones están
 * escritas para una composición que suma 100, y **devuelve `null` si la suma se
 * va más de 5 puntos**. Un dato que dice arcilla 30, arena 30 y limo 30 no es
 * un suelo: es un dato roto, y la clase que salga de ahí sería inventada.
 *
 * ## Qué se rompe si esto cambia
 *
 * Tres consumidores, y los tres cambian de número cuando cambia la clase:
 *
 * - `lib/usle.ts` → `erodabilidadK` busca la K en una tabla indexada por el
 *   **nombre** de la clase. Las dos clases que antes no salían nunca no tienen
 *   entrada en esa tabla y caen en `K_POR_DEFECTO`, que es el franco —que es,
 *   numéricamente, **lo mismo que recibían hasta hoy**, porque la escalera vieja
 *   las llamaba «Franco» o «Franco-arcilloso» y las dos valen 0,040. Así que
 *   esta corrección no les cambia la K; se la cambia a las otras
 *   reclasificaciones, como el franco limoso que la escalera llamaba
 *   franco-arcilloso y pasa de 0,040 a 0,050.
 * - `lib/emplazamiento.ts` → `grupoLTAR` y el campo de infiltración.
 * - La interfaz: `SuelosPanel` y el informe muestran el nombre.
 */

/** Las fracciones de tierra fina, Soil Survey Manual 2017, p. 120. */
export const SEPARADOS_USDA = {
  arena_muy_gruesa: { mm: [1.0, 2.0] as const, texto: '< 2,0 a > 1,0 mm' },
  arena_gruesa:     { mm: [0.5, 1.0] as const, texto: '1,0 a > 0,5 mm' },
  arena_media:      { mm: [0.25, 0.5] as const, texto: '0,5 a > 0,25 mm' },
  arena_fina:       { mm: [0.10, 0.25] as const, texto: '0,25 a > 0,10 mm' },
  arena_muy_fina:   { mm: [0.05, 0.10] as const, texto: '0,10 a > 0,05 mm' },
  limo_grueso:      { mm: [0.02, 0.05] as const, texto: '0,05 a > 0,02 mm' },
  limo_fino:        { mm: [0.002, 0.02] as const, texto: '0,02 a > 0,002 mm' },
  arcilla_gruesa:   { mm: [0.0002, 0.002] as const, texto: '0,002 a > 0,0002 mm' },
  arcilla_fina:     { mm: [0, 0.0002] as const, texto: '≤ 0,0002 mm' },
} as const;

/** Tierra fina: lo que entra en el denominador de los tres porcentajes. */
export const TIERRA_FINA_MM_MAX = 2;

/** Cuánto se tolera que los tres porcentajes se aparten de 100 antes de rendirse. */
export const SUMA_TOLERADA_PCT = 5;

export type ClaseUSDA =
  | 'arenoso' | 'arenoso-franco' | 'franco-arenoso' | 'franco'
  | 'franco-limoso' | 'limoso' | 'franco-arcillo-arenoso' | 'franco-arcilloso'
  | 'franco-arcillo-limoso' | 'arcillo-arenoso' | 'arcillo-limoso' | 'arcilloso';

/** Las doce, en el orden en que el manual las enumera en la página 122. */
export const CLASES_USDA: readonly ClaseUSDA[] = [
  'arenoso', 'arenoso-franco', 'franco-arenoso', 'franco', 'franco-limoso',
  'limoso', 'franco-arcillo-arenoso', 'franco-arcilloso',
  'franco-arcillo-limoso', 'arcillo-arenoso', 'arcillo-limoso', 'arcilloso',
] as const;

/**
 * El nombre que se muestra y con el que se indexa la tabla de erodabilidad de
 * `lib/usle.ts`. No se cambia ninguno: son los diez que ya salían más los dos
 * que faltaban.
 */
export const NOMBRE_CLASE_USDA: Record<ClaseUSDA, string> = {
  'arenoso':                'Arenoso',
  'arenoso-franco':         'Arenoso-franco',
  'franco-arenoso':         'Franco-arenoso',
  'franco':                 'Franco',
  'franco-limoso':          'Franco-limoso',
  'limoso':                 'Limoso',
  'franco-arcillo-arenoso': 'Franco-arcillo-arenoso',
  'franco-arcilloso':       'Franco-arcilloso',
  'franco-arcillo-limoso':  'Franco-arcillo-limoso',
  'arcillo-arenoso':        'Arcillo-arenoso',
  'arcillo-limoso':         'Arcillo-limoso',
  'arcilloso':              'Arcilloso',
};

/** Lo que se muestra cuando los tres porcentajes no describen un suelo. */
export const SIN_CLASE_TEXTURA = 'Sin dato';

export type GrupoTextura = 'arenoso' | 'franco' | 'arcilloso';
export type SubgrupoTextura =
  | 'gruesa' | 'moderadamente_gruesa' | 'media' | 'moderadamente_fina' | 'fina';

export interface DefGrupoTextura {
  grupo:    GrupoTextura;
  subgrupo: SubgrupoTextura;
  nombre:   string;
  clases:   readonly ClaseUSDA[];
}

/**
 * Tabla 3-1 del manual, p. 126: tres grupos generales y cinco subgrupos.
 *
 * El propio manual aclara al pie que **no** son las clases de tamaño de
 * partícula de familia de *Soil Taxonomy*, aunque se llamen parecido. Y que
 * donde el limo manda se puede usar un cuarto grupo, «silty soil materials»,
 * para limoso y franco limoso; acá esos dos quedan en medio, como en la tabla.
 *
 * Sirve de caso resuelto: es una tabla publicada que reparte las doce clases, y
 * un test compara el reparto contra ella.
 */
export const GRUPOS_TEXTURA_USDA: readonly DefGrupoTextura[] = [
  {
    grupo: 'arenoso', subgrupo: 'gruesa', nombre: 'Textura gruesa',
    clases: ['arenoso', 'arenoso-franco'],
  },
  {
    grupo: 'franco', subgrupo: 'moderadamente_gruesa', nombre: 'Textura moderadamente gruesa',
    clases: ['franco-arenoso'],
  },
  {
    grupo: 'franco', subgrupo: 'media', nombre: 'Textura media',
    clases: ['franco', 'franco-limoso', 'limoso'],
  },
  {
    grupo: 'franco', subgrupo: 'moderadamente_fina', nombre: 'Textura moderadamente fina',
    clases: ['franco-arcilloso', 'franco-arcillo-arenoso', 'franco-arcillo-limoso'],
  },
  {
    grupo: 'arcilloso', subgrupo: 'fina', nombre: 'Textura fina',
    clases: ['arcillo-arenoso', 'arcillo-limoso', 'arcilloso'],
  },
] as const;

/**
 * La clase textural USDA de una composición, o `null` si esa composición no
 * describe un suelo.
 *
 * Las doce condiciones son el texto de la página 124, en orden de enumeración
 * del manual. **No dependen del orden**: la partición es exclusiva, así que
 * cualquier orden da lo mismo. Se dejan en el del manual para poder leerlas
 * contra el papel.
 */
export function claseTexturaUSDA(
  arcilla_pct: number,
  arena_pct:   number,
  limo_pct:    number,
): ClaseUSDA | null {
  if (![arcilla_pct, arena_pct, limo_pct].every(x => Number.isFinite(x) && x >= 0)) return null;

  const suma = arcilla_pct + arena_pct + limo_pct;
  if (!(suma > 0) || Math.abs(suma - 100) > SUMA_TOLERADA_PCT) return null;

  // Las definiciones están escritas para una composición que suma 100.
  const a = (arcilla_pct / suma) * 100;   // clay
  const s = (arena_pct   / suma) * 100;   // sand
  const l = (limo_pct    / suma) * 100;   // silt

  // «Sands.—Material has more than 85 percent sand, and the percentage of silt
  //  plus 1.5 times the percentage of clay is less than 15.»
  if (s > 85 && l + 1.5 * a < 15) return 'arenoso';

  // «Loamy sands.—Material has between 70 and 90 percent sand, the percentage
  //  of silt plus 1.5 times the percentage of clay is 15 or more, and the
  //  percentage of silt plus twice the percentage of clay is less than 30.»
  if (s >= 70 && s <= 90 && l + 1.5 * a >= 15 && l + 2 * a < 30) return 'arenoso-franco';

  // «Sandy loams.—Material has 7 to less than 20 percent clay and more than 52
  //  percent sand, and the percentage of silt plus twice the percentage of clay
  //  is 30 or more; OR material has less than 7 percent clay and less than 50
  //  percent silt, and the percentage of silt plus twice the percentage of clay
  //  is 30 or more.»
  if ((a >= 7 && a < 20 && s > 52 && l + 2 * a >= 30)
      || (a < 7 && l < 50 && l + 2 * a >= 30)) return 'franco-arenoso';

  // «Loam.—Material has 7 to less than 27 percent clay, 28 to less than 50
  //  percent silt, and 52 percent or less sand.»
  if (a >= 7 && a < 27 && l >= 28 && l < 50 && s <= 52) return 'franco';

  // «Silt loam.—Material has 50 percent or more silt and 12 to less than 27
  //  percent clay; OR material has 50 to less than 80 percent silt and less
  //  than 12 percent clay.»
  if ((l >= 50 && a >= 12 && a < 27) || (l >= 50 && l < 80 && a < 12)) return 'franco-limoso';

  // «Silt.—Material has 80 percent or more silt and less than 12 percent clay.»
  if (l >= 80 && a < 12) return 'limoso';

  // «Sandy clay loam.—Material has 20 to less than 35 percent clay, less than
  //  28 percent silt, and more than 45 percent sand.»
  if (a >= 20 && a < 35 && l < 28 && s > 45) return 'franco-arcillo-arenoso';

  // «Clay loam.—Material has 27 to less than 40 percent clay and more than 20
  //  to 45 percent sand.»  El «more than 20 to 45» es estricto abajo e
  //  inclusive arriba: es la única lectura que cierra el triángulo.
  if (a >= 27 && a < 40 && s > 20 && s <= 45) return 'franco-arcilloso';

  // «Silty clay loam.—Material has 27 to less than 40 percent clay and 20
  //  percent or less sand.»
  if (a >= 27 && a < 40 && s <= 20) return 'franco-arcillo-limoso';

  // «Sandy clay.—Material has 35 percent or more clay and more than 45 percent
  //  sand.»
  if (a >= 35 && s > 45) return 'arcillo-arenoso';

  // «Silty clay.—Material has 40 percent or more clay and 40 percent or more
  //  silt.»
  if (a >= 40 && l >= 40) return 'arcillo-limoso';

  // «Clay.—Material has 40 percent or more clay, 45 percent or less sand, and
  //  less than 40 percent silt.»
  if (a >= 40 && s <= 45 && l < 40) return 'arcilloso';

  // Inalcanzable con una composición que suma 100: la partición es completa y
  // hay un test que lo prueba sobre las 5.151 celdas del triángulo. Queda como
  // red de seguridad para el día en que alguien toque una condición de arriba.
  return null;
}

/** El nombre que se muestra, con el «Sin dato» honesto cuando no hay clase. */
export function nombreTextura(c: ClaseUSDA | null): string {
  return c == null ? SIN_CLASE_TEXTURA : NOMBRE_CLASE_USDA[c];
}

/** El grupo general de la tabla 3-1 al que pertenece una clase. */
export function grupoTexturaUSDA(c: ClaseUSDA): DefGrupoTextura {
  const def = GRUPOS_TEXTURA_USDA.find(g => g.clases.includes(c));
  // Las doce están repartidas y hay un test que lo prueba.
  return def ?? GRUPOS_TEXTURA_USDA[2]!;
}
