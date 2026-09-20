/**
 * GENERADO. No editar a mano: sale de
 * `_research/pueblos-originarios-paises/build-censo-peru.mjs`, que lee los tres
 * anexos congelados al lado suyo y no escribe nada si un total no cierra.
 *
 * Censos Nacionales 2017 (INEI de Perú), momento censal 22 de octubre de 2017.
 * Los números son los de «Perú: Autoidentificación étnica» (2018), la
 * publicación final que recodifica y controla la consistencia de las respuestas
 * a la pregunta 25; no son los de los primeros perfiles difundidos, que daban
 * 5.176.809 quechuas donde el cuadro final da 5.179.774.
 *
 * El INEI no adjunta una licencia estándar a cada archivo, pero su página «Uso
 * de la información» del Censo 2017 dice expresamente que los resultados pueden
 * ser usados por empresas privadas para orientar actividades comerciales. Se
 * usan citando al INEI y a los Censos Nacionales 2017.
 *
 * ── Cuatro cosas que hay que saber para leer estos números ─────────────────
 *
 *   1. **El universo son las personas de 12 y más años.** La pregunta por la
 *      autoidentificación no se le hizo a los menores de 12, así que el
 *      denominador de todo este archivo es `censada12` y no la población total.
 *      Dividir por la población del país daría un porcentaje más chico que no
 *      significa nada.
 *
 *   2. **`indigena` es la suma de dos grupos que el INEI publica separados.**
 *      Indígena u originaria de los Andes —quechua, aimara y otro pueblo
 *      originario andino— e indígena u originaria de la Amazonía. El total
 *      nacional de 5.984.708 no aparece como una sola fila en ningún cuadro: es
 *      esta suma.
 *
 *   3. **`censada12` se suma de cuatro columnas publicadas, y es exacto.** El
 *      INEI no publica un cuadro con las cuatro autoidentificaciones juntas por
 *      departamento: publica un anexo por grupo, cada uno contra la misma
 *      columna residual «Blanca(o), mestiza(o) y otra(o)». Las cuatro son
 *      excluyentes y exhaustivas y cierran exactamente el universo nacional, y
 *      el script verifica que la columna residual sea idéntica en los tres
 *      anexos antes de usarla.
 *
 *   4. **No hay nada abajo del departamento.** Los anexos abren por área
 *      urbana/rural, por sexo y por edad, no por provincia ni por distrito.
 *      Perú contesta a escala departamental y nada más.
 *
 * ── La lengua materna no es el pueblo ──────────────────────────────────────
 *
 * `lenguas` es el cuadro x.3: qué lengua o idioma aprendió en la niñez esa
 * misma población indígena. No es la lista de pueblos y no debe leerse como
 * tal: 2.473.986 de los 5.771.885 indígenas de los Andes declaran castellano
 * como lengua materna. Es lo más cerca que llega este censo de decir quiénes
 * viven en un departamento, porque no publica un conteo comparable para cada
 * uno de los 55 pueblos oficiales del Ministerio de Cultura.
 *
 * Las barras de «Awajún/Aguaruna», «Shipibo/Konibo», «Shawi/Chayahuita» y
 * «Matsigenka/Machiguenga» separan dos denominaciones de **una** lengua, no dos
 * lenguas. Nunca se parten, igual que las del censo paraguayo.
 */

/** Las quince categorías de lengua materna del cuadro x.3, en su orden. */
export const LENGUAS_PE: readonly string[] = [
  'Quechua',
  'Aimara',
  'Ashaninka',
  'Awajún/Aguaruna',
  'Shipibo/Konibo',
  'Shawi/Chayahuita',
  'Matsigenka/Machiguenga',
  'Achuar',
  'Otra lengua nativa',
  'Castellano',
  'Portugués',
  'Otra lengua extranjera',
  'Lengua de señas',
  'No escucha ni habla',
  'No sabe/No responde',
];

/** Cuántas de `LENGUAS_PE` son lenguas originarias. Las nueve primeras. */
export const LENGUAS_ORIGINARIAS_PE = 9;

export interface CensoPeDepartamento {
  departamento: string;
  /** Población censada de 12 y más años: el universo de la pregunta 25. */
  censada12: number;
  /** Indígena u originaria de los Andes: quechua, aimara y otro pueblo andino. */
  andes: number;
  /** Indígena u originaria de la Amazonía. */
  amazonia: number;
  /** `andes + amazonia`. El INEI no lo publica como una fila; es esta suma. */
  indigena: number;
  /** Lengua materna de esa población indígena, en el orden de `LENGUAS_PE`. */
  lenguas: number[];
}

export const CENSO_PE: CensoPeDepartamento[] = [
  {
    departamento: 'Amazonas',
    censada12: 281605,
    andes: 8641,
    amazonia: 34958,
    indigena: 43599,
    lenguas: [498, 32, 70, 28951, 29, 8, 1, 2, 234, 13733, 1, 1, 10, 29, 0],
  },
  {
    departamento: 'Áncash',
    censada12: 850507,
    andes: 290323,
    amazonia: 211,
    indigena: 290534,
    lenguas: [200618, 202, 8, 19, 12, 1, 4, 2, 4, 89290, 15, 21, 92, 246, 0],
  },
  {
    departamento: 'Apurímac',
    censada12: 315006,
    andes: 273938,
    amazonia: 144,
    indigena: 274082,
    lenguas: [221230, 602, 9, 6, 7, 1, 7, 0, 5, 51912, 7, 5, 86, 205, 0],
  },
  {
    departamento: 'Arequipa',
    censada12: 1118223,
    andes: 387623,
    amazonia: 627,
    indigena: 388250,
    lenguas: [180264, 21612, 48, 16, 40, 2, 14, 7, 12, 185972, 25, 42, 51, 144, 1],
  },
  {
    departamento: 'Ayacucho',
    censada12: 479120,
    andes: 390209,
    amazonia: 314,
    indigena: 390523,
    lenguas: [298461, 552, 142, 9, 12, 3, 40, 3, 2, 90941, 13, 10, 93, 242, 0],
  },
  {
    departamento: 'Cajamarca',
    censada12: 1026734,
    andes: 66049,
    amazonia: 1963,
    indigena: 68012,
    lenguas: [4719, 77, 4, 713, 8, 3, 0, 2, 16, 62379, 7, 4, 15, 63, 2],
  },
  {
    departamento: 'Cusco',
    censada12: 950323,
    andes: 716013,
    amazonia: 6969,
    indigena: 722982,
    lenguas: [512555, 2336, 1238, 22, 45, 6, 1888, 12, 85, 204059, 41, 80, 198, 415, 2],
  },
  {
    departamento: 'Huancavelica',
    censada12: 266825,
    andes: 215804,
    amazonia: 48,
    indigena: 215852,
    lenguas: [167634, 81, 18, 2, 3, 0, 3, 1, 4, 47778, 13, 6, 98, 211, 0],
  },
  {
    departamento: 'Huánuco',
    censada12: 551601,
    andes: 238086,
    amazonia: 2211,
    indigena: 240297,
    lenguas: [132246, 204, 440, 6, 311, 2, 5, 5, 50, 106618, 13, 11, 107, 278, 1],
  },
  {
    departamento: 'Ica',
    censada12: 662444,
    andes: 97640,
    amazonia: 833,
    indigena: 98473,
    lenguas: [34471, 1241, 30, 42, 386, 5, 3, 4, 8, 62192, 9, 14, 22, 46, 0],
  },
  {
    departamento: 'Junín',
    censada12: 969059,
    andes: 346504,
    amazonia: 35920,
    indigena: 382424,
    lenguas: [113813, 598, 26525, 43, 135, 13, 281, 3, 1942, 238631, 18, 31, 115, 276, 0],
  },
  {
    departamento: 'La Libertad',
    censada12: 1379613,
    andes: 42985,
    amazonia: 806,
    indigena: 43791,
    lenguas: [3285, 216, 7, 119, 21, 2, 0, 3, 16, 40067, 7, 16, 9, 21, 2],
  },
  {
    departamento: 'Lambayeque',
    censada12: 935564,
    andes: 40771,
    amazonia: 700,
    indigena: 41471,
    lenguas: [16971, 170, 7, 209, 7, 3, 0, 3, 18, 24030, 1, 14, 13, 23, 2],
  },
  {
    departamento: 'Lima',
    censada12: 7782282,
    andes: 1330894,
    amazonia: 15505,
    indigena: 1346399,
    lenguas: [484557, 24113, 746, 637, 1155, 70, 116, 55, 605, 832620, 311, 607, 287, 517, 3],
  },
  {
    departamento: 'Loreto',
    censada12: 623029,
    andes: 18632,
    amazonia: 51722,
    indigena: 70354,
    lenguas: [2510, 85, 47, 3614, 3575, 9625, 80, 187, 8503, 42083, 8, 8, 7, 19, 3],
  },
  {
    departamento: 'Madre de Dios',
    censada12: 105503,
    andes: 38745,
    amazonia: 3494,
    indigena: 42239,
    lenguas: [19879, 1260, 59, 12, 172, 2, 696, 3, 989, 19110, 17, 12, 15, 12, 1],
  },
  {
    departamento: 'Moquegua',
    censada12: 142211,
    andes: 52132,
    amazonia: 128,
    indigena: 52260,
    lenguas: [11755, 17504, 12, 0, 6, 0, 2, 0, 4, 22942, 2, 3, 9, 21, 0],
  },
  {
    departamento: 'Pasco',
    censada12: 196780,
    andes: 75016,
    amazonia: 12284,
    indigena: 87300,
    lenguas: [18597, 138, 6684, 10, 24, 2, 2, 33, 108, 61613, 7, 3, 24, 55, 0],
  },
  {
    departamento: 'Piura',
    censada12: 1410686,
    andes: 32827,
    amazonia: 428,
    indigena: 33255,
    lenguas: [1902, 107, 4, 69, 8, 3, 4, 2, 5, 31110, 5, 3, 8, 23, 2],
  },
  {
    departamento: 'Provincia Constitucional del Callao',
    censada12: 799608,
    andes: 87090,
    amazonia: 1501,
    indigena: 88591,
    lenguas: [31298, 2458, 37, 60, 66, 6, 6, 8, 33, 54496, 16, 47, 28, 31, 1],
  },
  {
    departamento: 'Puno',
    censada12: 944083,
    andes: 857312,
    amazonia: 157,
    indigena: 857469,
    lenguas: [415309, 268244, 236, 3, 20, 3, 16, 2, 47, 172950, 36, 35, 145, 421, 2],
  },
  {
    departamento: 'San Martín',
    censada12: 608404,
    andes: 33908,
    amazonia: 4764,
    indigena: 38672,
    lenguas: [6922, 72, 14, 2063, 44, 289, 4, 11, 39, 29165, 1, 2, 11, 33, 2],
  },
  {
    departamento: 'Tacna',
    censada12: 269027,
    andes: 108330,
    amazonia: 248,
    indigena: 108578,
    lenguas: [8391, 50307, 24, 3, 23, 1, 3, 0, 6, 49755, 4, 14, 15, 32, 0],
  },
  {
    departamento: 'Tumbes',
    censada12: 171351,
    andes: 3546,
    amazonia: 114,
    indigena: 3660,
    lenguas: [326, 22, 5, 25, 1, 2, 0, 5, 1, 3269, 1, 3, 0, 0, 0],
  },
  {
    departamento: 'Ucayali',
    censada12: 356803,
    andes: 18867,
    amazonia: 36774,
    indigena: 55641,
    lenguas: [6534, 178, 12781, 137, 16177, 58, 303, 20, 4609, 14781, 12, 17, 11, 22, 1],
  },
];

/**
 * El país, con las cuatro categorías que cierran el universo. `afroperuano` y
 * `resto` no son de esta capa —el pueblo afroperuano no es un pueblo
 * originario— y están sólo para que se pueda ver que la cuenta cierra:
 * 5771885 + 212823 + 828894 + 16382789 = 23196391.
 */
export const CENSO_PE_PAIS = {
  censada12: 23196391,
  andes: 5771885,
  amazonia: 212823,
  indigena: 5984708,
  afroperuano: 828894,
  resto: 16382789,
  /** Indígenas de los Andes cuya lengua materna es el castellano. Es la mayoría. */
  castellanoAndes: 2473986,
} as const;
