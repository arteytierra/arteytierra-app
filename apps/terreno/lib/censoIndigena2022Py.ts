/**
 * GENERADO. No editar a mano: sale de
 * `_research/pueblos-originarios-paises/build-censo-paraguay.mjs`, que lee los
 * cuatro cuadros congelados al lado suyo y no escribe nada si un total no cierra.
 *
 * IV Censo Nacional de Población y Viviendas para Pueblos Indígenas 2022 (INE
 * de Paraguay). El relevamiento arrancó el 9 de noviembre de 2022 y duró quince
 * días. Cuadros A2 (departamento × familia lingüística × pueblo) y A3 (las 834
 * localidades), resultados finales publicados en datos.gov.py bajo la Licencia
 * de Uso de la Información Pública del Gobierno Paraguayo (Anexo II del Decreto
 * 4064/2015): permite copiar, adaptar y usar comercialmente, citando la fuente
 * y sin sugerir patrocinio oficial.
 *
 * ── Tres cosas que hay que saber para leer estos números ───────────────────
 *
 *   1. **El total oficial no es el de esta tabla.** El INE publica 140.049
 *      personas indígenas en el país: las 137.547 de acá, censadas por el
 *      operativo indígena en comunidades, aldeas, barrios, núcleos familiares e
 *      individualidades, más 2.502 que el Censo Nacional captó fuera de ese
 *      operativo por declarar que tienen carnet indígena. Esas 2.502 no están
 *      abiertas por departamento en ningún cuadro, así que acá no están.
 *
 *   2. **`indigena` y `noIndigena` son dos cosas distintas.** El operativo
 *      censó comunidades enteras, y adentro vive gente que el censo rotula «No
 *      indigena»: 1.245 personas en todo el país. `indigena` es la suma de
 *      los cinco grupos lingüísticos y no las incluye. Abajo del departamento
 *      **no se pueden separar**: el A3 publica una sola población por localidad,
 *      así que `censadas` en distritos y localidades es la suma de las dos.
 *
 *   3. **No hay porcentaje por departamento, a propósito.** El numerador sale
 *      del operativo indígena y el único denominador disponible saldría del
 *      Censo Nacional, que es otro operativo con otro universo; dividir uno por
 *      el otro daría un número creíble que no significa lo que parece. El país
 *      sí lleva porcentaje porque el INE publica las dos puntas.
 *
 * ── Los nombres ────────────────────────────────────────────────────────────
 *
 * Los cuatro CSV del INE son ASCII puro: no traen una sola tilde, aunque la
 * publicación escriba Nivaclé, Angaité, Guaraní y Tavyterã. Acá quedan como los
 * escribe el cuadro, y la pantalla lo aclara; reponer las tildes de los que
 * pudimos leer y no las del resto daría a entender que el INE escribe unos con
 * tilde y otros sin.
 *
 * Dos rótulos llevan una barra adentro y **no son dos pueblos**: «Guarani
 * Occidental / Pueblo Guarani» y «Toba Maskoy / Toba Enenlhet». La barra es el
 * registro de un cambio de nombre —las comunidades de Casanillo y Pesempo'o se
 * autodenominaron Toba Enenlhet en este censo, y la Organización Pueblo Guaraní
 * acordó Pueblo Guaraní en julio de 2022—, y el INE conserva las dos formas
 * para no perder comparabilidad con los censos anteriores. Nunca se parten.
 */

export interface CensoPyPueblo {
  pueblo: string;
  personas: number;
}

export interface CensoPyFamilia {
  /** Grupo lingüístico, como lo rotula el INE. Son cinco en todo el país. */
  familia: string;
  personas: number;
  pueblos: CensoPyPueblo[];
}

export interface CensoPyLocalidad {
  /** Comunidad, aldea, barrio, núcleo de familias o individualidades. */
  nombre: string;
  urbana: boolean;
  /** Índices en `PUEBLOS_PY`. El último rótulo de esa lista es «No indigena». */
  pueblos: number[];
  /** Población censada en la localidad, indígena y no indígena junta. */
  censadas: number;
  /** Viviendas particulares. Las colectivas son 20 en todo el país y no viajan. */
  viviendas: number;
}

export interface CensoPyDistrito {
  distrito: string;
  /** Suma de sus localidades: incluye los casos rotulados «No indigena». */
  censadas: number;
  localidades: CensoPyLocalidad[];
}

export interface CensoPyDepartamento {
  departamento: string;
  /** Suma de los cinco grupos lingüísticos. No incluye «No indigena». */
  indigena: number;
  /** Viven en las mismas comunidades y el censo los rotula así. */
  noIndigena: number;
  familias: CensoPyFamilia[];
  distritos: CensoPyDistrito[];
}

/**
 * Los 19 pueblos del censo más «No indigena» al final. Las localidades
 * guardan índices acá adentro en vez de repetir los rótulos 834 veces.
 */
export const PUEBLOS_PY: string[] = [
  "Ache",
  "Angaite",
  "Ava Guarani",
  "Ayoreo",
  "Enlhet Norte",
  "Enxet Sur",
  "Guana",
  "Guarani Nandeva",
  "Guarani Occidental / Pueblo Guarani",
  "Maka",
  "Manjui",
  "Mbya Guarani",
  "Nivacle",
  "Pai Tavytera",
  "Qom",
  "Sanapana",
  "Toba Maskoy / Toba Enenlhet",
  "Tomaraho",
  "Ybytoso",
  "No indigena",
];

export const CENSO_PY: CensoPyDepartamento[] = [
  {
    departamento: "Asuncion",
    indigena: 404,
    noIndigena: 16,
    familias: [
      { familia: "Guarani", personas: 210, pueblos: [
        { pueblo: "Mbya Guarani", personas: 99 },
        { pueblo: "Ava Guarani", personas: 86 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 24 },
        { pueblo: "Ache", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 121, pueblos: [
        { pueblo: "Nivacle", personas: 121 },
      ] },
      { familia: "Zamuco", personas: 38, pueblos: [
        { pueblo: "Ybytoso", personas: 38 },
      ] },
      { familia: "Lengua Maskoy", personas: 34, pueblos: [
        { pueblo: "Guana", personas: 20 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 7 },
        { pueblo: "Sanapana", personas: 4 },
        { pueblo: "Angaite", personas: 2 },
        { pueblo: "Enlhet Norte", personas: 1 },
      ] },
      { familia: "Guaicuru", personas: 1, pueblos: [
        { pueblo: "Qom", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Asuncion", censadas: 420, localidades: [
      { nombre: "Cerro Poty", urbana: true, pueblos: [2,11,15,19], censadas: 149, viviendas: 40 },
      { nombre: "Individualidades de Asuncion", urbana: true, pueblos: [0,2,11,8,4,15,1,6,16,12,18,14,19], censadas: 271, viviendas: 105 },
    ] },
    ],
  },
  {
    departamento: "Concepcion",
    indigena: 3608,
    noIndigena: 27,
    familias: [
      { familia: "Guarani", personas: 3054, pueblos: [
        { pueblo: "Pai Tavytera", personas: 1854 },
        { pueblo: "Mbya Guarani", personas: 1160 },
        { pueblo: "Ava Guarani", personas: 35 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 3 },
        { pueblo: "Ache", personas: 1 },
        { pueblo: "Guarani Nandeva", personas: 1 },
      ] },
      { familia: "Lengua Maskoy", personas: 535, pueblos: [
        { pueblo: "Enlhet Norte", personas: 165 },
        { pueblo: "Guana", personas: 120 },
        { pueblo: "Angaite", personas: 99 },
        { pueblo: "Enxet Sur", personas: 68 },
        { pueblo: "Sanapana", personas: 66 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 17 },
      ] },
      { familia: "Guaicuru", personas: 8, pueblos: [
        { pueblo: "Qom", personas: 8 },
      ] },
      { familia: "Mataco Mataguayo", personas: 7, pueblos: [
        { pueblo: "Manjui", personas: 5 },
        { pueblo: "Nivacle", personas: 2 },
      ] },
      { familia: "Zamuco", personas: 4, pueblos: [
        { pueblo: "Ybytoso", personas: 4 },
      ] },
    ],
    distritos: [
    { distrito: "Yby Yau", censadas: 1189, localidades: [
      { nombre: "Mberyvo Jaguarymi", urbana: false, pueblos: [13,19], censadas: 68, viviendas: 19 },
      { nombre: "Ypyju Tukambiju", urbana: false, pueblos: [13], censadas: 164, viviendas: 41 },
      { nombre: "Takuarytiy", urbana: false, pueblos: [2,13], censadas: 100, viviendas: 34 },
      { nombre: "Yvyraija", urbana: false, pueblos: [13,19], censadas: 103, viviendas: 32 },
      { nombre: "Cerro Puka", urbana: false, pueblos: [13], censadas: 43, viviendas: 20 },
      { nombre: "Yrapey", urbana: false, pueblos: [11,13,12], censadas: 400, viviendas: 116 },
      { nombre: "Ka'aguy Poty Rory", urbana: false, pueblos: [13,19], censadas: 82, viviendas: 33 },
      { nombre: "Yvy Apu'a", urbana: false, pueblos: [13], censadas: 58, viviendas: 19 },
      { nombre: "Yry Poty Peju", urbana: false, pueblos: [11,13], censadas: 171, viviendas: 50 },
    ] },
    { distrito: "Azote'y", censadas: 902, localidades: [
      { nombre: "Vy'a Pave", urbana: false, pueblos: [0,2,11,13,19], censadas: 902, viviendas: 204 },
    ] },
    { distrito: "Paso Barreto", censadas: 448, localidades: [
      { nombre: "Jeguahaty", urbana: false, pueblos: [11,13,19], censadas: 149, viviendas: 62 },
      { nombre: "Vy'a Renda - Boqueron", urbana: false, pueblos: [2,11], censadas: 281, viviendas: 62 },
      { nombre: "Takuarendyju", urbana: false, pueblos: [13], censadas: 18, viviendas: 7 },
    ] },
    { distrito: "Concepcion", censadas: 388, localidades: [
      { nombre: "Redencion", urbana: true, pueblos: [13,4,5,15,1,6,16,10,18,14,19], censadas: 388, viviendas: 90 },
    ] },
    { distrito: "Horqueta", censadas: 254, localidades: [
      { nombre: "Paso Ita", urbana: false, pueblos: [11,13], censadas: 99, viviendas: 28 },
      { nombre: "Kora'i Punta Suerte", urbana: false, pueblos: [11], censadas: 27, viviendas: 5 },
      { nombre: "Nande Yvy Pave", urbana: false, pueblos: [11,13,7,15,19], censadas: 88, viviendas: 23 },
      { nombre: "Takuapu Pora - Nu Pora", urbana: false, pueblos: [11], censadas: 40, viviendas: 15 },
    ] },
    { distrito: "Sargento Jose Felix Lopez", censadas: 212, localidades: [
      { nombre: "Takuarita", urbana: false, pueblos: [2,11,13,8], censadas: 212, viviendas: 41 },
    ] },
    { distrito: "San Lazaro", censadas: 107, localidades: [
      { nombre: "Apa Acosta", urbana: false, pueblos: [1,6,16], censadas: 107, viviendas: 31 },
    ] },
    { distrito: "Belen", censadas: 59, localidades: [
      { nombre: "Ayvu Pora", urbana: false, pueblos: [11,19], censadas: 59, viviendas: 19 },
    ] },
    { distrito: "Itacua", censadas: 59, localidades: [
      { nombre: "Calera Guyrati", urbana: false, pueblos: [1], censadas: 59, viviendas: 23 },
    ] },
    { distrito: "Arroyito", censadas: 17, localidades: [
      { nombre: "Nucleo de familias Kuero Fresco - Nu Pora", urbana: false, pueblos: [2,11,13], censadas: 17, viviendas: 5 },
    ] },
    ],
  },
  {
    departamento: "San Pedro",
    indigena: 4555,
    noIndigena: 87,
    familias: [
      { familia: "Guarani", personas: 4272, pueblos: [
        { pueblo: "Ava Guarani", personas: 2082 },
        { pueblo: "Mbya Guarani", personas: 1565 },
        { pueblo: "Pai Tavytera", personas: 460 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 162 },
        { pueblo: "Guarani Nandeva", personas: 3 },
      ] },
      { familia: "Guaicuru", personas: 274, pueblos: [
        { pueblo: "Qom", personas: 274 },
      ] },
      { familia: "Mataco Mataguayo", personas: 6, pueblos: [
        { pueblo: "Nivacle", personas: 3 },
        { pueblo: "Maka", personas: 3 },
      ] },
      { familia: "Lengua Maskoy", personas: 2, pueblos: [
        { pueblo: "Enxet Sur", personas: 1 },
        { pueblo: "Guana", personas: 1 },
      ] },
      { familia: "Zamuco", personas: 1, pueblos: [
        { pueblo: "Tomaraho", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "General Francisco Isidoro Resquin", censadas: 1215, localidades: [
      { nombre: "Santa Carolina", urbana: false, pueblos: [2], censadas: 376, viviendas: 95 },
      { nombre: "Naranjito - Santa Lucia", urbana: false, pueblos: [2,11,13,14,19], censadas: 306, viviendas: 91 },
      { nombre: "Tahekyi", urbana: false, pueblos: [2,11], censadas: 68, viviendas: 22 },
      { nombre: "Tapyi Kue", urbana: false, pueblos: [2,11,19], censadas: 248, viviendas: 71 },
      { nombre: "Naranjay", urbana: false, pueblos: [11,17], censadas: 81, viviendas: 30 },
      { nombre: "Ko'e Poty", urbana: false, pueblos: [2,11,19], censadas: 136, viviendas: 31 },
    ] },
    { distrito: "Yrybucua", censadas: 1032, localidades: [
      { nombre: "Palomita 1", urbana: false, pueblos: [2,8,12,9,19], censadas: 115, viviendas: 40 },
      { nombre: "Palomita 2", urbana: false, pueblos: [8,19], censadas: 60, viviendas: 19 },
      { nombre: "Y'apy - Santa Isabel", urbana: false, pueblos: [2,11], censadas: 95, viviendas: 22 },
      { nombre: "Y'apy - Mburukuja", urbana: false, pueblos: [2,11,19], censadas: 107, viviendas: 43 },
      { nombre: "Y'apy - Arroyo Sa'yju", urbana: false, pueblos: [2,11,13,8,6,9,19], censadas: 609, viviendas: 200 },
      { nombre: "Y'apy - Arroyo Kora", urbana: false, pueblos: [2,19], censadas: 46, viviendas: 14 },
    ] },
    { distrito: "Tacuati", censadas: 824, localidades: [
      { nombre: "Jeroky Roka", urbana: false, pueblos: [2,13,19], censadas: 63, viviendas: 32 },
      { nombre: "Kapi'itindy", urbana: false, pueblos: [13,19], censadas: 181, viviendas: 53 },
      { nombre: "Yvamindy", urbana: false, pueblos: [2,11,13], censadas: 178, viviendas: 45 },
      { nombre: "Nu Rugua", urbana: false, pueblos: [2,11,13,19], censadas: 182, viviendas: 75 },
      { nombre: "Espajin", urbana: false, pueblos: [11,13,19], censadas: 220, viviendas: 65 },
    ] },
    { distrito: "Capiibary", censadas: 439, localidades: [
      { nombre: "Ka'aty Mir? - San Francisco", urbana: false, pueblos: [2], censadas: 68, viviendas: 24 },
      { nombre: "Ka'aguy Pyahu 1", urbana: false, pueblos: [2,11], censadas: 30, viviendas: 13 },
      { nombre: "Ka'aguy Pyahu 2", urbana: false, pueblos: [2], censadas: 17, viviendas: 7 },
      { nombre: "Parakau Keha", urbana: false, pueblos: [2], censadas: 50, viviendas: 23 },
      { nombre: "Ypach?", urbana: false, pueblos: [11], censadas: 52, viviendas: 12 },
      { nombre: "Rio Corrientemi", urbana: false, pueblos: [2,11], censadas: 95, viviendas: 60 },
      { nombre: "San Jose", urbana: false, pueblos: [2], censadas: 25, viviendas: 6 },
      { nombre: "Rio Verde", urbana: false, pueblos: [2,14,19], censadas: 31, viviendas: 14 },
      { nombre: "Tatar? 14", urbana: false, pueblos: [2], censadas: 47, viviendas: 30 },
      { nombre: "Parakau Keha 1", urbana: false, pueblos: [2], censadas: 24, viviendas: 10 },
    ] },
    { distrito: "Santa Rosa del Aguaray", censadas: 262, localidades: [
      { nombre: "Arroyo Verde", urbana: false, pueblos: [2], censadas: 91, viviendas: 19 },
      { nombre: "Blanca'i", urbana: false, pueblos: [11,7,19], censadas: 64, viviendas: 30 },
      { nombre: "Ka'aguy Pyahu", urbana: false, pueblos: [2,11,13,19], censadas: 62, viviendas: 24 },
      { nombre: "Isla Pora", urbana: false, pueblos: [2,11,13,19], censadas: 45, viviendas: 17 },
    ] },
    { distrito: "Guajayvi", censadas: 217, localidades: [
      { nombre: "Nu Apu'a", urbana: false, pueblos: [2,11,19], censadas: 181, viviendas: 45 },
      { nombre: "San Jose Kupa'y", urbana: false, pueblos: [11,19], censadas: 36, viviendas: 15 },
    ] },
    { distrito: "Villa del Rosario", censadas: 191, localidades: [
      { nombre: "Boqueron", urbana: false, pueblos: [14,19], censadas: 101, viviendas: 21 },
      { nombre: "Urukuy - Las Palmas", urbana: false, pueblos: [5,9,14,19], censadas: 90, viviendas: 24 },
    ] },
    { distrito: "Nueva Germania", censadas: 102, localidades: [
      { nombre: "Y'apy Poty", urbana: false, pueblos: [13], censadas: 102, viviendas: 30 },
    ] },
    { distrito: "San Jose del Rosario", censadas: 93, localidades: [
      { nombre: "Urukuy - Las Palmas", urbana: false, pueblos: [14], censadas: 93, viviendas: 26 },
    ] },
    { distrito: "San Estanislao", censadas: 89, localidades: [
      { nombre: "Javier Kue Rugua", urbana: false, pueblos: [11], censadas: 38, viviendas: 23 },
      { nombre: "San Antonio", urbana: false, pueblos: [11,7], censadas: 51, viviendas: 29 },
    ] },
    { distrito: "Yataity del Norte", censadas: 62, localidades: [
      { nombre: "Virgen Del Carmen", urbana: false, pueblos: [11], censadas: 47, viviendas: 15 },
      { nombre: "La Paloma", urbana: false, pueblos: [2], censadas: 15, viviendas: 9 },
    ] },
    { distrito: "General Elizardo Aquino", censadas: 60, localidades: [
      { nombre: "Mboi Kua", urbana: false, pueblos: [11], censadas: 60, viviendas: 18 },
    ] },
    { distrito: "San Vicente Pancholo", censadas: 56, localidades: [
      { nombre: "Ypotyju", urbana: false, pueblos: [2], censadas: 37, viviendas: 12 },
      { nombre: "Ka'a Poty", urbana: false, pueblos: [11], censadas: 19, viviendas: 8 },
    ] },
    ],
  },
  {
    departamento: "Guaira",
    indigena: 1922,
    noIndigena: 7,
    familias: [
      { familia: "Guarani", personas: 1921, pueblos: [
        { pueblo: "Mbya Guarani", personas: 1874 },
        { pueblo: "Ava Guarani", personas: 17 },
        { pueblo: "Ache", personas: 15 },
        { pueblo: "Guarani Nandeva", personas: 12 },
        { pueblo: "Pai Tavytera", personas: 3 },
      ] },
      { familia: "Mataco Mataguayo", personas: 1, pueblos: [
        { pueblo: "Manjui", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Paso Yobai", censadas: 1509, localidades: [
      { nombre: "Tapy? Mir?", urbana: true, pueblos: [11], censadas: 112, viviendas: 32 },
      { nombre: "Arroyo H?", urbana: false, pueblos: [11], censadas: 171, viviendas: 49 },
      { nombre: "Vega Kue", urbana: false, pueblos: [11], censadas: 183, viviendas: 50 },
      { nombre: "Santa Teresita", urbana: false, pueblos: [11,7], censadas: 450, viviendas: 99 },
      { nombre: "Yryvu Kua Naranjito", urbana: false, pueblos: [11], censadas: 126, viviendas: 42 },
      { nombre: "Isla H?", urbana: false, pueblos: [2,11,13,10], censadas: 288, viviendas: 71 },
      { nombre: "Ovenia San Francisco", urbana: false, pueblos: [11], censadas: 162, viviendas: 60 },
      { nombre: "Nucleo de Familias Santa Maria", urbana: false, pueblos: [11], censadas: 17, viviendas: 4 },
    ] },
    { distrito: "Gral. Eugenio A. Garay", censadas: 155, localidades: [
      { nombre: "Joyvy Mir? Poty", urbana: false, pueblos: [0,2,11,7], censadas: 32, viviendas: 18 },
      { nombre: "Yvyty Kora", urbana: false, pueblos: [11,7], censadas: 123, viviendas: 45 },
    ] },
    { distrito: "Independencia", censadas: 139, localidades: [
      { nombre: "Yvyty Mir?", urbana: false, pueblos: [11,13], censadas: 106, viviendas: 30 },
      { nombre: "Nucleo de Familia - 11 de Diciembre", urbana: false, pueblos: [11], censadas: 33, viviendas: 18 },
    ] },
    { distrito: "Villarrica", censadas: 126, localidades: [
      { nombre: "Kuarahy Vera", urbana: true, pueblos: [11,19], censadas: 16, viviendas: 6 },
      { nombre: "8 de Diciembre - Santa Lucia", urbana: false, pueblos: [0,11,19], censadas: 110, viviendas: 33 },
    ] },
    ],
  },
  {
    departamento: "Caaguazu",
    indigena: 13221,
    noIndigena: 44,
    familias: [
      { familia: "Guarani", personas: 13219, pueblos: [
        { pueblo: "Mbya Guarani", personas: 11909 },
        { pueblo: "Ava Guarani", personas: 937 },
        { pueblo: "Ache", personas: 346 },
        { pueblo: "Guarani Nandeva", personas: 15 },
        { pueblo: "Pai Tavytera", personas: 9 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 3 },
      ] },
      { familia: "Mataco Mataguayo", personas: 1, pueblos: [
        { pueblo: "Nivacle", personas: 1 },
      ] },
      { familia: "Zamuco", personas: 1, pueblos: [
        { pueblo: "Ybytoso", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Dr. J. Eulogio Estigarribia", censadas: 2443, localidades: [
      { nombre: "Jaguary", urbana: false, pueblos: [2,11,19], censadas: 499, viviendas: 210 },
      { nombre: "Mbarigui 14", urbana: false, pueblos: [2,11], censadas: 219, viviendas: 58 },
      { nombre: "Nueva Esperanza", urbana: false, pueblos: [2,11,19], censadas: 440, viviendas: 92 },
      { nombre: "San Juan Cheiro Ara Poty Y Hovy", urbana: false, pueblos: [2,11,13], censadas: 673, viviendas: 158 },
      { nombre: "Cheiro Ara Poty", urbana: false, pueblos: [11], censadas: 142, viviendas: 36 },
      { nombre: "Ko'? Pyahu", urbana: false, pueblos: [11], censadas: 114, viviendas: 29 },
      { nombre: "Mbokaja Yguasu", urbana: false, pueblos: [2,11], censadas: 356, viviendas: 70 },
    ] },
    { distrito: "Raul Arsenio Oviedo", censadas: 2380, localidades: [
      { nombre: "Santa Teresa", urbana: false, pueblos: [2,11,19], censadas: 912, viviendas: 226 },
      { nombre: "Tajy Poty", urbana: false, pueblos: [2], censadas: 79, viviendas: 28 },
      { nombre: "Yvy Ryvate", urbana: false, pueblos: [2,11], censadas: 167, viviendas: 38 },
      { nombre: "Y'aka Reta", urbana: false, pueblos: [2,11], censadas: 770, viviendas: 192 },
      { nombre: "Ara Poty - Panambi", urbana: false, pueblos: [11], censadas: 55, viviendas: 14 },
      { nombre: "Nembiara", urbana: false, pueblos: [2,11], censadas: 217, viviendas: 67 },
      { nombre: "Loma Piro'y", urbana: false, pueblos: [2,11,19], censadas: 64, viviendas: 40 },
      { nombre: "Hugua Po'i", urbana: false, pueblos: [11], censadas: 116, viviendas: 32 },
    ] },
    { distrito: "Repatriacion", censadas: 1985, localidades: [
      { nombre: "Takuaro - 3 de Febrero", urbana: false, pueblos: [11], censadas: 91, viviendas: 25 },
      { nombre: "Arroyope", urbana: false, pueblos: [11], censadas: 59, viviendas: 15 },
      { nombre: "Ka'atymi", urbana: false, pueblos: [2,11,12], censadas: 276, viviendas: 70 },
      { nombre: "Nu Hovy", urbana: false, pueblos: [11], censadas: 228, viviendas: 55 },
      { nombre: "Pindo'i - Culantrillo", urbana: false, pueblos: [0,11,7], censadas: 609, viviendas: 151 },
      { nombre: "Isla Jovai Teju", urbana: false, pueblos: [0,2,11], censadas: 72, viviendas: 21 },
      { nombre: "Ypa'? - Senorita", urbana: false, pueblos: [2,11], censadas: 494, viviendas: 116 },
      { nombre: "23 de Junio", urbana: false, pueblos: [11], censadas: 46, viviendas: 20 },
      { nombre: "Y Hovy'i", urbana: false, pueblos: [11,13], censadas: 84, viviendas: 18 },
      { nombre: "Isla Nu", urbana: false, pueblos: [2,11], censadas: 26, viviendas: 8 },
    ] },
    { distrito: "Nueva Toledo", censadas: 1647, localidades: [
      { nombre: "Tekoha Pora", urbana: false, pueblos: [2,19], censadas: 428, viviendas: 135 },
      { nombre: "Yvy Morot?", urbana: false, pueblos: [2,11,19], censadas: 462, viviendas: 133 },
      { nombre: "Yvu Santa Rita", urbana: false, pueblos: [2,11,13,19], censadas: 561, viviendas: 138 },
      { nombre: "Ypa'? - Toledo", urbana: false, pueblos: [2,11,19], censadas: 70, viviendas: 23 },
      { nombre: "15 de Enero", urbana: false, pueblos: [2,11,7], censadas: 126, viviendas: 36 },
    ] },
    { distrito: "Yhu", censadas: 1277, localidades: [
      { nombre: "Toro Kangue", urbana: false, pueblos: [2,11], censadas: 129, viviendas: 31 },
      { nombre: "Arroyo Guasu Guajaivi", urbana: false, pueblos: [2,11], censadas: 334, viviendas: 82 },
      { nombre: "Arroyo Guasu Kambilo Kue", urbana: false, pueblos: [2,11,13], censadas: 108, viviendas: 35 },
      { nombre: "Ko'? Poty", urbana: false, pueblos: [2,19], censadas: 130, viviendas: 33 },
      { nombre: "Paraje Puku", urbana: false, pueblos: [11], censadas: 51, viviendas: 21 },
      { nombre: "Ypach?", urbana: false, pueblos: [2,11], censadas: 436, viviendas: 103 },
      { nombre: "Nueva Estrella", urbana: false, pueblos: [2,11], censadas: 42, viviendas: 12 },
      { nombre: "Takuapi'i", urbana: false, pueblos: [11,19], censadas: 33, viviendas: 15 },
      { nombre: "Nucleo de familias Pakuri", urbana: false, pueblos: [11], censadas: 14, viviendas: 15 },
    ] },
    { distrito: "Caaguazu", censadas: 1101, localidades: [
      { nombre: "Mandu'ara", urbana: true, pueblos: [2,11,8], censadas: 101, viviendas: 30 },
      { nombre: "Ka'aguy Pa'?", urbana: false, pueblos: [11], censadas: 24, viviendas: 7 },
      { nombre: "Escalera - Guakikua", urbana: false, pueblos: [2,11], censadas: 34, viviendas: 15 },
      { nombre: "Kambay", urbana: false, pueblos: [11], censadas: 119, viviendas: 35 },
      { nombre: "San Martin", urbana: false, pueblos: [11], censadas: 102, viviendas: 25 },
      { nombre: "Ykua Pora", urbana: false, pueblos: [11,7], censadas: 97, viviendas: 21 },
      { nombre: "Arroyo Guasu - San Isidro", urbana: false, pueblos: [11,19], censadas: 67, viviendas: 24 },
      { nombre: "San Jorge", urbana: false, pueblos: [11], censadas: 52, viviendas: 15 },
      { nombre: "20 de Julio", urbana: false, pueblos: [2,11], censadas: 62, viviendas: 22 },
      { nombre: "Guaviramindy", urbana: false, pueblos: [2,11], censadas: 111, viviendas: 43 },
      { nombre: "6 de Enero", urbana: false, pueblos: [2,11,7,18], censadas: 64, viviendas: 19 },
      { nombre: "Yvy Pora", urbana: false, pueblos: [2,11], censadas: 43, viviendas: 25 },
      { nombre: "29 de Setiembre - Yvy Pyahu", urbana: false, pueblos: [2,11], censadas: 60, viviendas: 18 },
      { nombre: "San Jorge - Originario", urbana: false, pueblos: [11,8], censadas: 81, viviendas: 25 },
      { nombre: "Nucleo Parque Guayaki", urbana: false, pueblos: [2,7], censadas: 20, viviendas: 9 },
      { nombre: "Ara Yvoty", urbana: false, pueblos: [2,11,19], censadas: 64, viviendas: 17 },
    ] },
    { distrito: "San Joaquin", censadas: 1060, localidades: [
      { nombre: "Cerro Morot?", urbana: false, pueblos: [0,13,19], censadas: 349, viviendas: 65 },
      { nombre: "Tekoha Pora - Campito", urbana: false, pueblos: [11], censadas: 82, viviendas: 28 },
      { nombre: "Tekoha Mir?", urbana: false, pueblos: [11], censadas: 68, viviendas: 13 },
      { nombre: "Modaymi", urbana: false, pueblos: [2,11,19], censadas: 172, viviendas: 45 },
      { nombre: "Hugua Rory", urbana: false, pueblos: [2,11], censadas: 14, viviendas: 7 },
      { nombre: "Tejas Kue", urbana: false, pueblos: [11], censadas: 55, viviendas: 22 },
      { nombre: "Amambay", urbana: false, pueblos: [2,11], censadas: 158, viviendas: 37 },
      { nombre: "San Jorge", urbana: false, pueblos: [11], censadas: 93, viviendas: 61 },
      { nombre: "Isla Pora", urbana: false, pueblos: [2,11,19], censadas: 19, viviendas: 9 },
      { nombre: "Santa Librada", urbana: false, pueblos: [11,19], censadas: 50, viviendas: 22 },
    ] },
    { distrito: "Mariscal Francisco Solano Lopez", censadas: 440, localidades: [
      { nombre: "Ka'aguy Poty - Romero Kue", urbana: false, pueblos: [2,11], censadas: 440, viviendas: 110 },
    ] },
    { distrito: "Dr. Juan Manuel Frutos", censadas: 358, localidades: [
      { nombre: "Punta Pora", urbana: false, pueblos: [2,11], censadas: 155, viviendas: 38 },
      { nombre: "Nueva Esperanza - Vy'a Renda", urbana: false, pueblos: [2,11], censadas: 46, viviendas: 15 },
      { nombre: "San Jorge - Jukyry", urbana: false, pueblos: [11], censadas: 118, viviendas: 43 },
      { nombre: "Sol Naciente", urbana: false, pueblos: [11], censadas: 19, viviendas: 10 },
      { nombre: "Nucleo San Carlos 2", urbana: false, pueblos: [11], censadas: 20, viviendas: 11 },
    ] },
    { distrito: "Vaqueria", censadas: 353, localidades: [
      { nombre: "Mbokaja'i", urbana: false, pueblos: [2,11], censadas: 156, viviendas: 52 },
      { nombre: "Yvyku'i Jovai", urbana: false, pueblos: [2,11], censadas: 197, viviendas: 71 },
    ] },
    { distrito: "Coronel Oviedo", censadas: 84, localidades: [
      { nombre: "Arroyo Guasu - San Isidro", urbana: false, pueblos: [2,11], censadas: 84, viviendas: 28 },
    ] },
    { distrito: "R.I. 3 Corrales", censadas: 78, localidades: [
      { nombre: "Tovat?ry - Yvy pora", urbana: false, pueblos: [2,11,19], censadas: 78, viviendas: 25 },
    ] },
    { distrito: "3 De Febrero", censadas: 59, localidades: [
      { nombre: "Ara Pyahu", urbana: false, pueblos: [2,11], censadas: 59, viviendas: 20 },
    ] },
    ],
  },
  {
    departamento: "Caazapa",
    indigena: 5270,
    noIndigena: 24,
    familias: [
      { familia: "Guarani", personas: 5263, pueblos: [
        { pueblo: "Mbya Guarani", personas: 4617 },
        { pueblo: "Ache", personas: 610 },
        { pueblo: "Ava Guarani", personas: 28 },
        { pueblo: "Pai Tavytera", personas: 6 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 2 },
      ] },
      { familia: "Lengua Maskoy", personas: 6, pueblos: [
        { pueblo: "Guana", personas: 3 },
        { pueblo: "Enxet Sur", personas: 2 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 1, pueblos: [
        { pueblo: "Nivacle", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Abai", censadas: 3313, localidades: [
      { nombre: "Campito Kurukau", urbana: false, pueblos: [2,11,13], censadas: 118, viviendas: 32 },
      { nombre: "Cerrito", urbana: false, pueblos: [2,11], censadas: 287, viviendas: 86 },
      { nombre: "Ka'atymi", urbana: false, pueblos: [11], censadas: 164, viviendas: 44 },
      { nombre: "Nu Apu'a", urbana: false, pueblos: [2,11,16,19], censadas: 269, viviendas: 53 },
      { nombre: "Takuarusu", urbana: false, pueblos: [11], censadas: 261, viviendas: 68 },
      { nombre: "Ykua Pora", urbana: false, pueblos: [2,11,13], censadas: 451, viviendas: 115 },
      { nombre: "Ypet? - Tajy", urbana: false, pueblos: [11,13,12], censadas: 552, viviendas: 133 },
      { nombre: "Ypet? - Nara'i", urbana: false, pueblos: [11,13], censadas: 214, viviendas: 50 },
      { nombre: "Ypet?mi", urbana: false, pueblos: [0,11,5,6,19], censadas: 605, viviendas: 136 },
      { nombre: "Yt?", urbana: false, pueblos: [2,11,8], censadas: 107, viviendas: 32 },
      { nombre: "Yvytymi", urbana: false, pueblos: [2,11], censadas: 170, viviendas: 42 },
      { nombre: "Cecina Tekoha Pyahu", urbana: false, pueblos: [11], censadas: 95, viviendas: 33 },
      { nombre: "Takuaro'i", urbana: false, pueblos: [11], censadas: 20, viviendas: 5 },
    ] },
    { distrito: "Tavai", censadas: 1513, localidades: [
      { nombre: "Viju", urbana: false, pueblos: [11], censadas: 175, viviendas: 44 },
      { nombre: "Jukeri - Arroz Tygue", urbana: false, pueblos: [11], censadas: 78, viviendas: 32 },
      { nombre: "Jukeri - Tuna'i", urbana: false, pueblos: [11], censadas: 106, viviendas: 25 },
      { nombre: "Karumbey", urbana: false, pueblos: [11], censadas: 79, viviendas: 21 },
      { nombre: "Kokuere Guasu - Centro", urbana: false, pueblos: [2,11], censadas: 107, viviendas: 30 },
      { nombre: "Kokuere Guasu - Sexta Linea", urbana: false, pueblos: [11], censadas: 135, viviendas: 47 },
      { nombre: "Kokuere Guasu - Arroyo Ka'a", urbana: false, pueblos: [11], censadas: 117, viviendas: 29 },
      { nombre: "Tajay Pakuri", urbana: false, pueblos: [2,11], censadas: 199, viviendas: 57 },
      { nombre: "Tuna Arroyo Guasu", urbana: false, pueblos: [11], censadas: 115, viviendas: 30 },
      { nombre: "Pakuri - Castor Kue", urbana: false, pueblos: [11], censadas: 74, viviendas: 32 },
      { nombre: "Ka'aguy Pa'?", urbana: false, pueblos: [11], censadas: 38, viviendas: 9 },
      { nombre: "Vy'a Renda", urbana: false, pueblos: [0,11,19], censadas: 102, viviendas: 29 },
      { nombre: "Ka'amindy", urbana: false, pueblos: [11], censadas: 7, viviendas: 5 },
      { nombre: "Yvyty Kora", urbana: false, pueblos: [11], censadas: 8, viviendas: 6 },
      { nombre: "Jukeri - Karanda", urbana: false, pueblos: [0,11,19], censadas: 111, viviendas: 35 },
      { nombre: "Mbya Guarani Santa Rita'i", urbana: false, pueblos: [11], censadas: 28, viviendas: 12 },
      { nombre: "Amambay", urbana: false, pueblos: [11], censadas: 34, viviendas: 14 },
    ] },
    { distrito: "San Juan Nepomuceno", censadas: 275, localidades: [
      { nombre: "Takuaro", urbana: false, pueblos: [2,11,19], censadas: 275, viviendas: 69 },
    ] },
    { distrito: "Yuty", censadas: 107, localidades: [
      { nombre: "Jesus Tava Pora - Monte Alto", urbana: false, pueblos: [11,19], censadas: 30, viviendas: 9 },
      { nombre: "Ykua Poty", urbana: false, pueblos: [0,11,19], censadas: 77, viviendas: 25 },
    ] },
    { distrito: "Yegros", censadas: 86, localidades: [
      { nombre: "Isla Mborevi", urbana: false, pueblos: [11,19], censadas: 67, viviendas: 21 },
      { nombre: "Guavira Poty", urbana: false, pueblos: [11,19], censadas: 19, viviendas: 8 },
    ] },
    ],
  },
  {
    departamento: "Itapua",
    indigena: 3479,
    noIndigena: 11,
    familias: [
      { familia: "Guarani", personas: 3443, pueblos: [
        { pueblo: "Mbya Guarani", personas: 3426 },
        { pueblo: "Ava Guarani", personas: 9 },
        { pueblo: "Guarani Nandeva", personas: 4 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 2 },
        { pueblo: "Ache", personas: 1 },
        { pueblo: "Pai Tavytera", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 35, pueblos: [
        { pueblo: "Maka", personas: 33 },
        { pueblo: "Nivacle", personas: 2 },
      ] },
      { familia: "Lengua Maskoy", personas: 1, pueblos: [
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Alto Vera", censadas: 912, localidades: [
      { nombre: "Arroyo Morot?", urbana: false, pueblos: [11], censadas: 117, viviendas: 34 },
      { nombre: "Ko'?ju", urbana: false, pueblos: [11], censadas: 41, viviendas: 11 },
      { nombre: "Mberu Pirapo'i", urbana: false, pueblos: [11], censadas: 186, viviendas: 48 },
      { nombre: "Mboi Ka'?", urbana: false, pueblos: [11], censadas: 249, viviendas: 71 },
      { nombre: "Pindo'i", urbana: false, pueblos: [11,8], censadas: 97, viviendas: 30 },
      { nombre: "Pindoju", urbana: false, pueblos: [11], censadas: 51, viviendas: 13 },
      { nombre: "Guapo'y", urbana: false, pueblos: [11], censadas: 41, viviendas: 9 },
      { nombre: "Taguato Sauco", urbana: false, pueblos: [11], censadas: 22, viviendas: 9 },
      { nombre: "Ysapy'i", urbana: false, pueblos: [11], censadas: 30, viviendas: 8 },
      { nombre: "Karumbey Mbarakaju", urbana: false, pueblos: [11], censadas: 7, viviendas: 4 },
      { nombre: "Takuarymi", urbana: false, pueblos: [11], censadas: 47, viviendas: 15 },
      { nombre: "Pykasu'i", urbana: false, pueblos: [11], censadas: 24, viviendas: 6 },
    ] },
    { distrito: "Itapua Poty", censadas: 652, localidades: [
      { nombre: "Tapy Savy", urbana: false, pueblos: [2,11], censadas: 280, viviendas: 60 },
      { nombre: "Jukeri", urbana: false, pueblos: [11], censadas: 133, viviendas: 28 },
      { nombre: "Jukeri - Ka'aguy Pora", urbana: false, pueblos: [11], censadas: 108, viviendas: 27 },
      { nombre: "Agosto Poty", urbana: false, pueblos: [2,11], censadas: 131, viviendas: 29 },
    ] },
    { distrito: "Pirapo", censadas: 462, localidades: [
      { nombre: "Potrero Guarani", urbana: false, pueblos: [11,12], censadas: 105, viviendas: 30 },
      { nombre: "Paraiso", urbana: false, pueblos: [11], censadas: 19, viviendas: 9 },
      { nombre: "Ka'atymy", urbana: false, pueblos: [2,11], censadas: 158, viviendas: 46 },
      { nombre: "Manduviju", urbana: false, pueblos: [11], censadas: 85, viviendas: 29 },
      { nombre: "Nu Hovy Jaguara Sapa", urbana: false, pueblos: [2,11,7], censadas: 74, viviendas: 23 },
      { nombre: "Salto Renda", urbana: false, pueblos: [11], censadas: 21, viviendas: 7 },
    ] },
    { distrito: "Carlos Antonio Lopez", censadas: 347, localidades: [
      { nombre: "Y'aka Marangatu", urbana: false, pueblos: [11,13], censadas: 119, viviendas: 32 },
      { nombre: "Arasa Poty", urbana: false, pueblos: [11], censadas: 124, viviendas: 36 },
      { nombre: "Ka'aguy Pora - Tirol", urbana: false, pueblos: [11,12], censadas: 104, viviendas: 28 },
    ] },
    { distrito: "Trinidad", censadas: 242, localidades: [
      { nombre: "Guavirami", urbana: false, pueblos: [11], censadas: 197, viviendas: 67 },
      { nombre: "Nu Poty", urbana: false, pueblos: [11], censadas: 45, viviendas: 15 },
    ] },
    { distrito: "San Rafael del Parana", censadas: 205, localidades: [
      { nombre: "Makutinga", urbana: false, pueblos: [11], censadas: 43, viviendas: 18 },
      { nombre: "Pykasu Ygua", urbana: false, pueblos: [11,7], censadas: 100, viviendas: 31 },
      { nombre: "Nucleo de Familias Mbya Guarani de Naranjito", urbana: false, pueblos: [11], censadas: 62, viviendas: 19 },
    ] },
    { distrito: "Obligado", censadas: 175, localidades: [
      { nombre: "Pastoreo", urbana: false, pueblos: [11], censadas: 117, viviendas: 41 },
      { nombre: "Loma Hovy", urbana: false, pueblos: [11,19], censadas: 39, viviendas: 14 },
      { nombre: "Nucleo de Familia Nueva Esperanza", urbana: false, pueblos: [11], censadas: 19, viviendas: 3 },
    ] },
    { distrito: "San Cosme y Damian", censadas: 156, localidades: [
      { nombre: "Pindo", urbana: false, pueblos: [0,2,11], censadas: 156, viviendas: 48 },
    ] },
    { distrito: "Encarnacion", censadas: 102, localidades: [
      { nombre: "Individualidades de Encarnacion", urbana: true, pueblos: [11,8,19], censadas: 68, viviendas: 20 },
      { nombre: "Maka - Ita Paso", urbana: false, pueblos: [16,9], censadas: 34, viviendas: 11 },
    ] },
    { distrito: "Jesus", censadas: 101, localidades: [
      { nombre: "Kambay", urbana: false, pueblos: [11], censadas: 101, viviendas: 29 },
    ] },
    { distrito: "Capitan Meza", censadas: 76, localidades: [
      { nombre: "Arroyo Kora", urbana: false, pueblos: [2,11], censadas: 76, viviendas: 30 },
    ] },
    { distrito: "Mayor Julio Dionisio Otano", censadas: 48, localidades: [
      { nombre: "Tekoha Pora", urbana: false, pueblos: [11], censadas: 48, viviendas: 15 },
    ] },
    { distrito: "Edelira", censadas: 12, localidades: [
      { nombre: "Ka'aguy Poty", urbana: false, pueblos: [11], censadas: 12, viviendas: 6 },
    ] },
    ],
  },
  {
    departamento: "Paraguari",
    indigena: 109,
    noIndigena: 7,
    familias: [
      { familia: "Guarani", personas: 109, pueblos: [
        { pueblo: "Ava Guarani", personas: 73 },
        { pueblo: "Mbya Guarani", personas: 35 },
        { pueblo: "Ache", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Pirayu", censadas: 116, localidades: [
      { nombre: "Nevanga Renda", urbana: false, pueblos: [0,2,11,19], censadas: 47, viviendas: 24 },
      { nombre: "Mbokajaty Mir?", urbana: false, pueblos: [2,19], censadas: 69, viviendas: 21 },
    ] },
    ],
  },
  {
    departamento: "Alto Parana",
    indigena: 8821,
    noIndigena: 87,
    familias: [
      { familia: "Guarani", personas: 8731, pueblos: [
        { pueblo: "Ava Guarani", personas: 6977 },
        { pueblo: "Mbya Guarani", personas: 1456 },
        { pueblo: "Ache", personas: 288 },
        { pueblo: "Pai Tavytera", personas: 9 },
        { pueblo: "Guarani Nandeva", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 86, pueblos: [
        { pueblo: "Maka", personas: 82 },
        { pueblo: "Nivacle", personas: 4 },
      ] },
      { familia: "Lengua Maskoy", personas: 3, pueblos: [
        { pueblo: "Enxet Sur", personas: 2 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 1 },
      ] },
      { familia: "Guaicuru", personas: 1, pueblos: [
        { pueblo: "Qom", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Itakyry", censadas: 4154, localidades: [
      { nombre: "Arroyo Guasu - Chopa Cue", urbana: false, pueblos: [2], censadas: 122, viviendas: 29 },
      { nombre: "Arroyo Guasu - Centro", urbana: false, pueblos: [2,19], censadas: 396, viviendas: 120 },
      { nombre: "Arroyo Guasu - Pilico kue", urbana: false, pueblos: [2,11,19], censadas: 271, viviendas: 86 },
      { nombre: "Jukyry", urbana: false, pueblos: [2,11,12,19], censadas: 347, viviendas: 96 },
      { nombre: "Ka'a Poty", urbana: false, pueblos: [2,19], censadas: 120, viviendas: 27 },
      { nombre: "Ka'aguy Poty", urbana: false, pueblos: [2,11], censadas: 85, viviendas: 21 },
      { nombre: "Ka'aguy Roky", urbana: false, pueblos: [2], censadas: 111, viviendas: 31 },
      { nombre: "Ka'aguy Yvate", urbana: false, pueblos: [2,11], censadas: 98, viviendas: 30 },
      { nombre: "Ka'aty Mir? - Formosa", urbana: false, pueblos: [2,19], censadas: 55, viviendas: 16 },
      { nombre: "Y'aryty Mir?", urbana: false, pueblos: [2], censadas: 89, viviendas: 23 },
      { nombre: "Ko'?ju", urbana: false, pueblos: [2,19], censadas: 213, viviendas: 60 },
      { nombre: "Mariscal Lopez", urbana: false, pueblos: [2,11,19], censadas: 377, viviendas: 126 },
      { nombre: "Mbokaja'i", urbana: false, pueblos: [11], censadas: 53, viviendas: 17 },
      { nombre: "Paso Cadena", urbana: false, pueblos: [2,11], censadas: 558, viviendas: 164 },
      { nombre: "Y Pora Poty", urbana: false, pueblos: [2], censadas: 158, viviendas: 44 },
      { nombre: "Uruku Poty", urbana: false, pueblos: [0,2,19], censadas: 132, viviendas: 32 },
      { nombre: "Ysat?", urbana: false, pueblos: [2], censadas: 50, viviendas: 16 },
      { nombre: "Carreria'i 1", urbana: false, pueblos: [2,11,12], censadas: 194, viviendas: 50 },
      { nombre: "Carreria'i 2", urbana: false, pueblos: [2,12], censadas: 70, viviendas: 24 },
      { nombre: "Ka'aguy Poty 2", urbana: false, pueblos: [2], censadas: 177, viviendas: 45 },
      { nombre: "Loma Tajy", urbana: false, pueblos: [2], censadas: 76, viviendas: 28 },
      { nombre: "Loma Clavel", urbana: false, pueblos: [2,11], censadas: 150, viviendas: 38 },
      { nombre: "Tupa Renda'i", urbana: false, pueblos: [2,19], censadas: 57, viviendas: 23 },
      { nombre: "Ka'a Poty 1", urbana: false, pueblos: [2,19], censadas: 62, viviendas: 20 },
      { nombre: "Tajy Poty", urbana: false, pueblos: [2,16], censadas: 68, viviendas: 39 },
      { nombre: "Arroyo Kupa'y", urbana: false, pueblos: [2], censadas: 65, viviendas: 20 },
    ] },
    { distrito: "Minga Pora", censadas: 1150, localidades: [
      { nombre: "Arroyo Guasu - Arroyo Azul", urbana: false, pueblos: [0,2], censadas: 436, viviendas: 151 },
      { nombre: "Arroyo Guasu - Centro", urbana: false, pueblos: [2], censadas: 74, viviendas: 27 },
      { nombre: "Arroyo Guasu - Hugua'i", urbana: false, pueblos: [2], censadas: 264, viviendas: 71 },
      { nombre: "Arroyo Guasu - Caaguazu", urbana: false, pueblos: [2,11], censadas: 218, viviendas: 60 },
      { nombre: "Tekoha Sauce", urbana: false, pueblos: [2], censadas: 73, viviendas: 30 },
      { nombre: "Cerrito - Ipotapy - Viju", urbana: false, pueblos: [2,11,14], censadas: 85, viviendas: 30 },
    ] },
    { distrito: "Hernandarias", censadas: 914, localidades: [
      { nombre: "Acaraymi - Angela Antonia", urbana: false, pueblos: [2,11,19], censadas: 289, viviendas: 86 },
      { nombre: "Acaraymi - San Miguel", urbana: false, pueblos: [2,19], censadas: 168, viviendas: 48 },
      { nombre: "Acaraymi - Centro", urbana: false, pueblos: [2,11], censadas: 325, viviendas: 102 },
      { nombre: "Independiente", urbana: false, pueblos: [2], censadas: 132, viviendas: 40 },
    ] },
    { distrito: "Mbaracayu", censadas: 745, localidades: [
      { nombre: "Kirito - Gleva 10", urbana: false, pueblos: [2,13,5], censadas: 224, viviendas: 67 },
      { nombre: "Kirito - Pindo", urbana: false, pueblos: [2], censadas: 366, viviendas: 110 },
      { nombre: "Kirito - Hugua'i", urbana: false, pueblos: [2], censadas: 155, viviendas: 48 },
    ] },
    { distrito: "Presidente Franco", censadas: 451, localidades: [
      { nombre: "Puerto Bertoni", urbana: false, pueblos: [11], censadas: 57, viviendas: 23 },
      { nombre: "Yvyra Moa - Puerto Gimenez", urbana: false, pueblos: [2,11,13], censadas: 45, viviendas: 13 },
      { nombre: "Puerto Barreto", urbana: false, pueblos: [2,11], censadas: 79, viviendas: 23 },
      { nombre: "Puesto Kue - Medio Mundo", urbana: false, pueblos: [2,11], censadas: 170, viviendas: 42 },
      { nombre: "8 de Diciembre", urbana: false, pueblos: [2,11], censadas: 67, viviendas: 16 },
      { nombre: "Joyvy Mir? Poty", urbana: false, pueblos: [2,11,19], censadas: 33, viviendas: 18 },
    ] },
    { distrito: "Ciudad del Este", censadas: 412, localidades: [
      { nombre: "Yvu Pora Renda", urbana: true, pueblos: [11], censadas: 109, viviendas: 28 },
      { nombre: "Maka - Ciudad Del Este", urbana: true, pueblos: [5,9], censadas: 83, viviendas: 23 },
      { nombre: "Carcel - Terminal - Nucleo", urbana: true, pueblos: [2,11], censadas: 104, viviendas: 23 },
      { nombre: "Nucleo de Familias Km. 12 Monday", urbana: true, pueblos: [2,11], censadas: 116, viviendas: 46 },
    ] },
    { distrito: "Yguazu", censadas: 380, localidades: [
      { nombre: "Karanda'y", urbana: false, pueblos: [11], censadas: 71, viviendas: 23 },
      { nombre: "Remanso Toro", urbana: false, pueblos: [2,11,19], censadas: 251, viviendas: 77 },
      { nombre: "Puerto Juanita", urbana: false, pueblos: [11], censadas: 58, viviendas: 18 },
    ] },
    { distrito: "Naranjal", censadas: 294, localidades: [
      { nombre: "Tapy Puerto Barra", urbana: false, pueblos: [0,19], censadas: 294, viviendas: 72 },
    ] },
    { distrito: "San Cristobal", censadas: 286, localidades: [
      { nombre: "Ka'a Jovai", urbana: false, pueblos: [11,13,7], censadas: 286, viviendas: 74 },
    ] },
    { distrito: "Nacunday", censadas: 122, localidades: [
      { nombre: "Kapi'ibary", urbana: false, pueblos: [2,11], censadas: 101, viviendas: 24 },
      { nombre: "Guayaibi Poty", urbana: false, pueblos: [11], censadas: 21, viviendas: 9 },
    ] },
    ],
  },
  {
    departamento: "Central",
    indigena: 2965,
    noIndigena: 109,
    familias: [
      { familia: "Mataco Mataguayo", personas: 1548, pueblos: [
        { pueblo: "Maka", personas: 1469 },
        { pueblo: "Nivacle", personas: 79 },
      ] },
      { familia: "Guarani", personas: 913, pueblos: [
        { pueblo: "Ava Guarani", personas: 393 },
        { pueblo: "Mbya Guarani", personas: 331 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 130 },
        { pueblo: "Ache", personas: 52 },
        { pueblo: "Guarani Nandeva", personas: 4 },
        { pueblo: "Pai Tavytera", personas: 3 },
      ] },
      { familia: "Zamuco", personas: 370, pueblos: [
        { pueblo: "Ybytoso", personas: 369 },
        { pueblo: "Tomaraho", personas: 1 },
      ] },
      { familia: "Lengua Maskoy", personas: 133, pueblos: [
        { pueblo: "Guana", personas: 70 },
        { pueblo: "Angaite", personas: 32 },
        { pueblo: "Enxet Sur", personas: 17 },
        { pueblo: "Sanapana", personas: 6 },
        { pueblo: "Enlhet Norte", personas: 4 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 4 },
      ] },
      { familia: "Guaicuru", personas: 1, pueblos: [
        { pueblo: "Qom", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Mariano Roque Alonso", censadas: 1528, localidades: [
      { nombre: "Maka", urbana: true, pueblos: [4,12,9,14,19], censadas: 1519, viviendas: 318 },
      { nombre: "Individualidades de Mariano Roque Alonso", urbana: true, pueblos: [2,18], censadas: 9, viviendas: 2 },
    ] },
    { distrito: "Luque", censadas: 902, localidades: [
      { nombre: "Nueva Esperanza", urbana: true, pueblos: [2,11,12,18,19], censadas: 325, viviendas: 99 },
      { nombre: "Yvapovõndy", urbana: true, pueblos: [2,18,19], censadas: 83, viviendas: 23 },
      { nombre: "La Virginia", urbana: true, pueblos: [2,11,17,19], censadas: 55, viviendas: 21 },
      { nombre: "Tarumandymi", urbana: true, pueblos: [2,11], censadas: 251, viviendas: 58 },
      { nombre: "Marin Ka'aguy", urbana: true, pueblos: [12,18,19], censadas: 21, viviendas: 9 },
      { nombre: "Individualidades de Luque", urbana: true, pueblos: [2,11,8,1,12,18,19], censadas: 77, viviendas: 26 },
      { nombre: "Nucleo de Familias Clan Kuchingui", urbana: true, pueblos: [0,2,11,8,19], censadas: 90, viviendas: 22 },
    ] },
    { distrito: "Limpio", censadas: 242, localidades: [
      { nombre: "Individualidades de Limpio", urbana: true, pueblos: [0,2,11,8,7,4,5,1,6,12,9,18,19], censadas: 242, viviendas: 88 },
    ] },
    { distrito: "Ita", censadas: 156, localidades: [
      { nombre: "Y'ary Mir?", urbana: false, pueblos: [2,11,19], censadas: 156, viviendas: 40 },
    ] },
    { distrito: "Aregua", censadas: 56, localidades: [
      { nombre: "Individuales de Aregua", urbana: true, pueblos: [15,6,19], censadas: 56, viviendas: 19 },
    ] },
    { distrito: "Lambare", censadas: 56, localidades: [
      { nombre: "Individualidades de Lambare", urbana: true, pueblos: [13,8,19], censadas: 56, viviendas: 13 },
    ] },
    { distrito: "Capiata", censadas: 44, localidades: [
      { nombre: "Individualidades de Capiata", urbana: true, pueblos: [8,12,18,19], censadas: 44, viviendas: 12 },
    ] },
    { distrito: "San Antonio", censadas: 33, localidades: [
      { nombre: "Individualidades de San Antonio", urbana: true, pueblos: [8,19], censadas: 33, viviendas: 8 },
    ] },
    { distrito: "Villeta", censadas: 18, localidades: [
      { nombre: "Takuapu Mir?", urbana: true, pueblos: [11,13,19], censadas: 18, viviendas: 8 },
    ] },
    { distrito: "Villa Elisa", censadas: 13, localidades: [
      { nombre: "Individualidades de Villa Elisa", urbana: true, pueblos: [8], censadas: 13, viviendas: 5 },
    ] },
    { distrito: "Fernando de La Mora", censadas: 9, localidades: [
      { nombre: "Individualidades de Fernando de La Mora", urbana: true, pueblos: [8], censadas: 9, viviendas: 2 },
    ] },
    { distrito: "San Lorenzo", censadas: 6, localidades: [
      { nombre: "Individualidades de San Lorenzo", urbana: true, pueblos: [11,16,18], censadas: 6, viviendas: 6 },
    ] },
    { distrito: "Ypane", censadas: 6, localidades: [
      { nombre: "Individualidades de Ypane", urbana: true, pueblos: [8,12,19], censadas: 6, viviendas: 2 },
    ] },
    { distrito: "Itaugua", censadas: 5, localidades: [
      { nombre: "Individualidades de Itaugua", urbana: true, pueblos: [12,19], censadas: 5, viviendas: 2 },
    ] },
    ],
  },
  {
    departamento: "Amambay",
    indigena: 12393,
    noIndigena: 22,
    familias: [
      { familia: "Guarani", personas: 12385, pueblos: [
        { pueblo: "Pai Tavytera", personas: 12007 },
        { pueblo: "Ava Guarani", personas: 353 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 11 },
        { pueblo: "Mbya Guarani", personas: 8 },
        { pueblo: "Ache", personas: 5 },
        { pueblo: "Guarani Nandeva", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 6, pueblos: [
        { pueblo: "Nivacle", personas: 5 },
        { pueblo: "Manjui", personas: 1 },
      ] },
      { familia: "Lengua Maskoy", personas: 1, pueblos: [
        { pueblo: "Enlhet Norte", personas: 1 },
      ] },
      { familia: "Zamuco", personas: 1, pueblos: [
        { pueblo: "Tomaraho", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Pedro Juan Caballero", censadas: 5662, localidades: [
      { nombre: "Vy'a Renda", urbana: true, pueblos: [13,19], censadas: 45, viviendas: 12 },
      { nombre: "Jasuka Venda - Avakua", urbana: false, pueblos: [13], censadas: 23, viviendas: 11 },
      { nombre: "Jasuka Venda - Karavie Guasu", urbana: false, pueblos: [13], censadas: 46, viviendas: 17 },
      { nombre: "Y'ete Poty", urbana: false, pueblos: [13,8,7,19], censadas: 277, viviendas: 90 },
      { nombre: "Anguja'i Yvangusu", urbana: false, pueblos: [13], censadas: 154, viviendas: 40 },
      { nombre: "Itay Pavusu", urbana: false, pueblos: [11,13,19], censadas: 362, viviendas: 121 },
      { nombre: "Jakaira", urbana: false, pueblos: [13], censadas: 128, viviendas: 40 },
      { nombre: "Jakaira Potrerito", urbana: false, pueblos: [13,19], censadas: 101, viviendas: 34 },
      { nombre: "Mba'e Marangatu - Ita Jegua", urbana: false, pueblos: [13,19], censadas: 287, viviendas: 71 },
      { nombre: "Mba'e Marangatu - Y'aka Guasu", urbana: false, pueblos: [0,13], censadas: 165, viviendas: 40 },
      { nombre: "Mba'e Marangatu - Tajay", urbana: false, pueblos: [0,13], censadas: 477, viviendas: 135 },
      { nombre: "Mba'e Nemy", urbana: false, pueblos: [13], censadas: 68, viviendas: 25 },
      { nombre: "Nuapy", urbana: false, pueblos: [0,2,13,8], censadas: 249, viviendas: 89 },
      { nombre: "Pysyry", urbana: false, pueblos: [13], censadas: 176, viviendas: 60 },
      { nombre: "Takuaguyogue Takuara", urbana: false, pueblos: [11,13], censadas: 182, viviendas: 72 },
      { nombre: "Tava Mboa'e", urbana: false, pueblos: [13], censadas: 384, viviendas: 157 },
      { nombre: "Yvy Ata'i", urbana: false, pueblos: [13], censadas: 86, viviendas: 36 },
      { nombre: "Yvypyte - Atyva", urbana: false, pueblos: [13], censadas: 145, viviendas: 70 },
      { nombre: "Yvypyte - Campo Flor", urbana: false, pueblos: [2,13], censadas: 174, viviendas: 51 },
      { nombre: "Yvypyte - Juruka", urbana: false, pueblos: [13,4,12,10,17,19], censadas: 604, viviendas: 189 },
      { nombre: "Yvypyte - Kurijuy", urbana: false, pueblos: [13], censadas: 158, viviendas: 73 },
      { nombre: "Yvypyte - Loma'i", urbana: false, pueblos: [13], censadas: 39, viviendas: 10 },
      { nombre: "Yvypyte - Y'ete Mir?", urbana: false, pueblos: [13], censadas: 51, viviendas: 23 },
      { nombre: "Yvypyte - Tatu Kaita", urbana: false, pueblos: [13], censadas: 163, viviendas: 71 },
      { nombre: "Yvypyte - Yjevy", urbana: false, pueblos: [13], censadas: 68, viviendas: 29 },
      { nombre: "Mbokaja'i", urbana: false, pueblos: [11,13,12,19], censadas: 148, viviendas: 47 },
      { nombre: "Pirary", urbana: false, pueblos: [13], censadas: 902, viviendas: 296 },
    ] },
    { distrito: "Cerro Cora", censadas: 2817, localidades: [
      { nombre: "Ita Guasu", urbana: false, pueblos: [13], censadas: 411, viviendas: 142 },
      { nombre: "Jaguat?", urbana: false, pueblos: [13,12], censadas: 423, viviendas: 131 },
      { nombre: "Jakaira", urbana: false, pueblos: [2,13], censadas: 201, viviendas: 68 },
      { nombre: "Tanambiy", urbana: false, pueblos: [13,19], censadas: 156, viviendas: 44 },
      { nombre: "Pikykua - Pikykua", urbana: false, pueblos: [11,13,19], censadas: 349, viviendas: 100 },
      { nombre: "Pikykua - Cerro Pa'?", urbana: false, pueblos: [13], censadas: 256, viviendas: 73 },
      { nombre: "Pikykua - Arroyo Guasu", urbana: false, pueblos: [13], censadas: 153, viviendas: 54 },
      { nombre: "Pirity", urbana: false, pueblos: [13], censadas: 208, viviendas: 62 },
      { nombre: "Tajy", urbana: false, pueblos: [11,13], censadas: 276, viviendas: 102 },
      { nombre: "Yvy Ata'i", urbana: false, pueblos: [11,13], censadas: 346, viviendas: 127 },
      { nombre: "Avarendiju", urbana: false, pueblos: [13], censadas: 38, viviendas: 21 },
    ] },
    { distrito: "Capitan Bado", censadas: 2123, localidades: [
      { nombre: "Guarani Paso Historia", urbana: false, pueblos: [2,13,19], censadas: 186, viviendas: 52 },
      { nombre: "Ita Poty", urbana: false, pueblos: [13], censadas: 158, viviendas: 51 },
      { nombre: "Itaju - Itaju", urbana: false, pueblos: [13], censadas: 86, viviendas: 25 },
      { nombre: "Itaju - Paso Lima", urbana: false, pueblos: [13], censadas: 82, viviendas: 26 },
      { nombre: "Mbarakay", urbana: false, pueblos: [13], censadas: 144, viviendas: 44 },
      { nombre: "Piraymi", urbana: false, pueblos: [2,13,8,19], censadas: 407, viviendas: 101 },
      { nombre: "Tavytera", urbana: false, pueblos: [13], censadas: 379, viviendas: 111 },
      { nombre: "Takuaju Poty", urbana: false, pueblos: [2,13], censadas: 166, viviendas: 46 },
      { nombre: "Potrero Novillo", urbana: false, pueblos: [2,11], censadas: 47, viviendas: 11 },
      { nombre: "Itay", urbana: false, pueblos: [2,13], censadas: 58, viviendas: 25 },
      { nombre: "Nandejara Guerovy'a Pav?", urbana: false, pueblos: [13], censadas: 196, viviendas: 51 },
      { nombre: "Nepu'a Pyahu", urbana: false, pueblos: [13], censadas: 160, viviendas: 53 },
      { nombre: "Nucleo de Familias Pai Tavytera", urbana: false, pueblos: [2,13], censadas: 54, viviendas: 15 },
    ] },
    { distrito: "Bella Vista", censadas: 1718, localidades: [
      { nombre: "Apyka Jegua", urbana: false, pueblos: [13], censadas: 57, viviendas: 34 },
      { nombre: "Cerro Akangue", urbana: false, pueblos: [11,13], censadas: 509, viviendas: 188 },
      { nombre: "Ita Jevaka", urbana: false, pueblos: [13], censadas: 484, viviendas: 142 },
      { nombre: "Apyka Rendy'i", urbana: false, pueblos: [13], censadas: 46, viviendas: 30 },
      { nombre: "Yvyty Rovi Cerro Amambay", urbana: false, pueblos: [13], censadas: 51, viviendas: 13 },
      { nombre: "Guyra Ne'?ngatu Amba", urbana: false, pueblos: [13], censadas: 115, viviendas: 32 },
      { nombre: "Sat? - Pa? Renda Chiru Poty", urbana: false, pueblos: [13,12,19], censadas: 181, viviendas: 53 },
      { nombre: "Arroyo Ka'a", urbana: false, pueblos: [13], censadas: 151, viviendas: 54 },
      { nombre: "Yvy Oka", urbana: false, pueblos: [13], censadas: 124, viviendas: 41 },
    ] },
    { distrito: "Zanja Pyta", censadas: 95, localidades: [
      { nombre: "Y Morot?", urbana: false, pueblos: [13,8], censadas: 95, viviendas: 27 },
    ] },
    ],
  },
  {
    departamento: "Canindeyu",
    indigena: 16128,
    noIndigena: 177,
    familias: [
      { familia: "Guarani", personas: 16118, pueblos: [
        { pueblo: "Ava Guarani", personas: 11699 },
        { pueblo: "Mbya Guarani", personas: 1788 },
        { pueblo: "Pai Tavytera", personas: 1335 },
        { pueblo: "Ache", personas: 1281 },
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 15 },
      ] },
      { familia: "Mataco Mataguayo", personas: 8, pueblos: [
        { pueblo: "Nivacle", personas: 8 },
      ] },
      { familia: "Lengua Maskoy", personas: 2, pueblos: [
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 2 },
      ] },
    ],
    distritos: [
    { distrito: "Villa Curuguaty", censadas: 3966, localidades: [
      { nombre: "Individualidades de Curuguaty", urbana: true, pueblos: [2,11,13], censadas: 79, viviendas: 67 },
      { nombre: "1° De Marzo", urbana: false, pueblos: [2], censadas: 141, viviendas: 61 },
      { nombre: "Fortuna - San Francisco", urbana: false, pueblos: [2,19], censadas: 100, viviendas: 27 },
      { nombre: "Fortuna - 12 de Junio", urbana: false, pueblos: [2,19], censadas: 173, viviendas: 48 },
      { nombre: "Fortuna - San Lorenzo", urbana: false, pueblos: [0,2,19], censadas: 366, viviendas: 110 },
      { nombre: "Fortuna - Primavera", urbana: false, pueblos: [2,11,19], censadas: 558, viviendas: 162 },
      { nombre: "Fortuna - Jukyry", urbana: false, pueblos: [2,11], censadas: 135, viviendas: 37 },
      { nombre: "Fortuna - Yataity", urbana: false, pueblos: [2,11], censadas: 251, viviendas: 85 },
      { nombre: "Fortuna - Cordillera", urbana: false, pueblos: [2,8,19], censadas: 553, viviendas: 188 },
      { nombre: "Isla Jovai", urbana: false, pueblos: [2], censadas: 55, viviendas: 15 },
      { nombre: "Itaymi", urbana: false, pueblos: [2], censadas: 94, viviendas: 23 },
      { nombre: "Mba'e Katu", urbana: false, pueblos: [2,19], censadas: 31, viviendas: 9 },
      { nombre: "Marcelino Montania", urbana: false, pueblos: [2,11], censadas: 170, viviendas: 57 },
      { nombre: "Nueva Esperanza", urbana: false, pueblos: [0,2,11], censadas: 246, viviendas: 76 },
      { nombre: "Paso Real", urbana: false, pueblos: [2,11,13,19], censadas: 217, viviendas: 56 },
      { nombre: "Tekojoja 4 Bocas", urbana: false, pueblos: [2,19], censadas: 87, viviendas: 27 },
      { nombre: "Y'aka Poty Jukeri", urbana: false, pueblos: [2], censadas: 32, viviendas: 16 },
      { nombre: "Y'akaju", urbana: false, pueblos: [2,11], censadas: 74, viviendas: 39 },
      { nombre: "Y'hovy", urbana: false, pueblos: [2], censadas: 37, viviendas: 12 },
      { nombre: "Montania II", urbana: false, pueblos: [2,11], censadas: 107, viviendas: 30 },
      { nombre: "26 de Febrero", urbana: false, pueblos: [2,12], censadas: 56, viviendas: 20 },
      { nombre: "Mytuy", urbana: false, pueblos: [2], censadas: 155, viviendas: 55 },
      { nombre: "Arroyo Piro'y", urbana: false, pueblos: [2,11,13,19], censadas: 82, viviendas: 28 },
      { nombre: "Ko'? Pyahu", urbana: false, pueblos: [2,19], censadas: 104, viviendas: 31 },
      { nombre: "Rio Verde Ysaka", urbana: false, pueblos: [2], censadas: 63, viviendas: 25 },
    ] },
    { distrito: "Villa Ygatimi", censadas: 3313, localidades: [
      { nombre: "Y'apo", urbana: false, pueblos: [2,11,13], censadas: 134, viviendas: 38 },
      { nombre: "Arroyo Bandera", urbana: false, pueblos: [0,2,19], censadas: 235, viviendas: 40 },
      { nombre: "Chupa Pou", urbana: false, pueblos: [0,2,11,13,8,19], censadas: 697, viviendas: 139 },
      { nombre: "Ita Poty", urbana: false, pueblos: [0,2,19], censadas: 210, viviendas: 58 },
      { nombre: "Itanarami", urbana: false, pueblos: [2,11,8,12], censadas: 196, viviendas: 61 },
      { nombre: "Ka'aguy Pora Poty", urbana: false, pueblos: [2], censadas: 93, viviendas: 33 },
      { nombre: "Mboi Jagua - Centro", urbana: false, pueblos: [2,19], censadas: 149, viviendas: 51 },
      { nombre: "Mboi Jagua - Canadita", urbana: false, pueblos: [2,11,19], censadas: 488, viviendas: 135 },
      { nombre: "Mboi Jagua - Pindoty", urbana: false, pueblos: [2,13,19], censadas: 369, viviendas: 95 },
      { nombre: "San Antonio", urbana: false, pueblos: [2,8,19], censadas: 131, viviendas: 38 },
      { nombre: "Takuary", urbana: false, pueblos: [11,19], censadas: 144, viviendas: 37 },
      { nombre: "Arroyo Mokõi Yva Poty", urbana: false, pueblos: [0,2], censadas: 100, viviendas: 33 },
      { nombre: "Ka'aguy Poty", urbana: false, pueblos: [2,19], censadas: 67, viviendas: 19 },
      { nombre: "Vera Vusu", urbana: false, pueblos: [2], censadas: 25, viviendas: 25 },
      { nombre: "8 de Diciembre", urbana: false, pueblos: [2,11,19], censadas: 275, viviendas: 76 },
    ] },
    { distrito: "Yby Pyta", censadas: 1769, localidades: [
      { nombre: "Tekoha Poty Pyahu", urbana: false, pueblos: [2], censadas: 70, viviendas: 25 },
      { nombre: "San Juan", urbana: false, pueblos: [2], censadas: 102, viviendas: 35 },
      { nombre: "Y'ary Poty", urbana: false, pueblos: [2], censadas: 94, viviendas: 27 },
      { nombre: "Agua'e", urbana: false, pueblos: [2], censadas: 203, viviendas: 66 },
      { nombre: "12 de Junio", urbana: false, pueblos: [2,13,19], censadas: 147, viviendas: 48 },
      { nombre: "Kuetuvy", urbana: false, pueblos: [0,2,11,19], censadas: 393, viviendas: 74 },
      { nombre: "Takua Poty", urbana: false, pueblos: [2], censadas: 80, viviendas: 30 },
      { nombre: "Y Ryapu", urbana: false, pueblos: [2,11,19], censadas: 172, viviendas: 53 },
      { nombre: "Yvyju", urbana: false, pueblos: [13], censadas: 100, viviendas: 30 },
      { nombre: "Yt?", urbana: false, pueblos: [2], censadas: 20, viviendas: 10 },
      { nombre: "Y Vera Ka'a Poty", urbana: false, pueblos: [2], censadas: 26, viviendas: 10 },
      { nombre: "Yvy Katu", urbana: false, pueblos: [2], censadas: 195, viviendas: 75 },
      { nombre: "Nu Vera Katu", urbana: false, pueblos: [2,19], censadas: 58, viviendas: 15 },
      { nombre: "Ara Poty", urbana: false, pueblos: [2,16], censadas: 19, viviendas: 15 },
      { nombre: "Ko'? Pyahu Poty Ex Kurusu", urbana: false, pueblos: [2,19], censadas: 53, viviendas: 19 },
      { nombre: "Mytuy Araguayu", urbana: false, pueblos: [2], censadas: 23, viviendas: 16 },
      { nombre: "Paso Jovai", urbana: false, pueblos: [2], censadas: 14, viviendas: 6 },
    ] },
    { distrito: "Ypejhu", censadas: 1741, localidades: [
      { nombre: "Pariri", urbana: false, pueblos: [13], censadas: 43, viviendas: 16 },
      { nombre: "Kavaju Paso", urbana: false, pueblos: [11], censadas: 290, viviendas: 76 },
      { nombre: "Narandy", urbana: false, pueblos: [2,11], censadas: 147, viviendas: 53 },
      { nombre: "Barranco Apy - Y'apy Barranco", urbana: false, pueblos: [2,11], censadas: 58, viviendas: 21 },
      { nombre: "Yvy Pav? - Canada", urbana: false, pueblos: [11], censadas: 51, viviendas: 16 },
      { nombre: "Tekoha Yvypoty", urbana: false, pueblos: [2], censadas: 71, viviendas: 24 },
      { nombre: "Yvy Katu", urbana: false, pueblos: [2,11], censadas: 150, viviendas: 35 },
      { nombre: "Pypuku", urbana: false, pueblos: [13,19], censadas: 641, viviendas: 165 },
      { nombre: "Arroyo Sat?", urbana: false, pueblos: [2], censadas: 40, viviendas: 17 },
      { nombre: "Yvy Pony", urbana: false, pueblos: [2,11], censadas: 30, viviendas: 11 },
      { nombre: "Ka'aguyju Candado", urbana: false, pueblos: [11], censadas: 25, viviendas: 8 },
      { nombre: "Barranco Rugua", urbana: false, pueblos: [11], censadas: 44, viviendas: 18 },
      { nombre: "Ka'aguy Potyra", urbana: false, pueblos: [2,11], censadas: 53, viviendas: 16 },
      { nombre: "Tekoha Pyahu", urbana: false, pueblos: [2,11], censadas: 37, viviendas: 13 },
      { nombre: "Y Mir?", urbana: false, pueblos: [2,19], censadas: 27, viviendas: 14 },
      { nombre: "Pindoju", urbana: false, pueblos: [11,19], censadas: 34, viviendas: 9 },
    ] },
    { distrito: "Yasy Cany", censadas: 1365, localidades: [
      { nombre: "Tekoha Mir? Poty - Alika Kue", urbana: false, pueblos: [11], censadas: 166, viviendas: 42 },
      { nombre: "Pindo'i", urbana: false, pueblos: [11], censadas: 82, viviendas: 25 },
      { nombre: "Ka'aguy Poty Kapi'itindy", urbana: false, pueblos: [2], censadas: 26, viviendas: 14 },
      { nombre: "Ka'aguy Poty Kamba", urbana: false, pueblos: [2,11], censadas: 28, viviendas: 18 },
      { nombre: "Kaninde", urbana: false, pueblos: [2,11,19], censadas: 105, viviendas: 34 },
      { nombre: "Pakuri Santa Librada", urbana: false, pueblos: [11], censadas: 29, viviendas: 12 },
      { nombre: "Tajy Poty", urbana: false, pueblos: [2], censadas: 27, viviendas: 12 },
      { nombre: "Takua Mir?", urbana: false, pueblos: [2], censadas: 101, viviendas: 35 },
      { nombre: "Tuna Poty", urbana: false, pueblos: [2,16], censadas: 59, viviendas: 26 },
      { nombre: "Yva Viju", urbana: false, pueblos: [2,11], censadas: 49, viviendas: 21 },
      { nombre: "San Antonio", urbana: false, pueblos: [2,11], censadas: 157, viviendas: 51 },
      { nombre: "Yvy Pora", urbana: false, pueblos: [2,11], censadas: 29, viviendas: 22 },
      { nombre: "Joyvy", urbana: false, pueblos: [2,11], censadas: 51, viviendas: 23 },
      { nombre: "Tekojoja", urbana: false, pueblos: [2,11], censadas: 101, viviendas: 49 },
      { nombre: "Vy'a Renda", urbana: false, pueblos: [2,11,13], censadas: 110, viviendas: 54 },
      { nombre: "Yvay Mir?", urbana: false, pueblos: [2,11], censadas: 32, viviendas: 14 },
      { nombre: "Guavira Poty", urbana: false, pueblos: [2,11], censadas: 107, viviendas: 37 },
      { nombre: "Ka'aguy Mir?", urbana: false, pueblos: [2], censadas: 21, viviendas: 15 },
      { nombre: "Ko'? Rory", urbana: false, pueblos: [11], censadas: 16, viviendas: 5 },
      { nombre: "Takuara'i", urbana: false, pueblos: [2], censadas: 58, viviendas: 30 },
      { nombre: "12 de Noviembre", urbana: false, pueblos: [2], censadas: 11, viviendas: 6 },
    ] },
    { distrito: "Ybyrarobana", censadas: 1103, localidades: [
      { nombre: "Arroyo Mokõi", urbana: false, pueblos: [2,19], censadas: 142, viviendas: 47 },
      { nombre: "Cerro Pyta", urbana: false, pueblos: [2,12], censadas: 114, viviendas: 29 },
      { nombre: "Cerro Campin", urbana: false, pueblos: [0,2,19], censadas: 95, viviendas: 37 },
      { nombre: "Tekoha Poty Pyahu", urbana: false, pueblos: [2], censadas: 97, viviendas: 30 },
      { nombre: "San Juan", urbana: false, pueblos: [2,13], censadas: 165, viviendas: 48 },
      { nombre: "Tatu Kue", urbana: false, pueblos: [2], censadas: 73, viviendas: 25 },
      { nombre: "Arroyo Pora", urbana: false, pueblos: [2,11,19], censadas: 108, viviendas: 34 },
      { nombre: "Yvy Apy Katu Potrerito", urbana: false, pueblos: [2,19], censadas: 46, viviendas: 13 },
      { nombre: "Ka'aguy Mir?", urbana: false, pueblos: [2], censadas: 54, viviendas: 21 },
      { nombre: "Y'apo - Tres Bocas", urbana: false, pueblos: [2], censadas: 149, viviendas: 41 },
      { nombre: "Fortuna Cristo Rey", urbana: false, pueblos: [2], censadas: 60, viviendas: 31 },
    ] },
    { distrito: "Corpus Christi", censadas: 1059, localidades: [
      { nombre: "Arroz Tygue", urbana: false, pueblos: [2], censadas: 39, viviendas: 15 },
      { nombre: "Felicidad", urbana: false, pueblos: [2], censadas: 122, viviendas: 45 },
      { nombre: "Nu'i", urbana: false, pueblos: [2,19], censadas: 45, viviendas: 14 },
      { nombre: "Ynambu Ygua", urbana: false, pueblos: [2], censadas: 94, viviendas: 35 },
      { nombre: "Laguna Hovy", urbana: false, pueblos: [2], censadas: 58, viviendas: 34 },
      { nombre: "Y'apo", urbana: false, pueblos: [2], censadas: 254, viviendas: 93 },
      { nombre: "Y'apo 90", urbana: false, pueblos: [0,2], censadas: 250, viviendas: 75 },
      { nombre: "Kola'i", urbana: false, pueblos: [2,19], censadas: 68, viviendas: 23 },
      { nombre: "3 Nacientes", urbana: false, pueblos: [2], censadas: 54, viviendas: 25 },
      { nombre: "3 Rios Tajy", urbana: false, pueblos: [2,19], censadas: 75, viviendas: 30 },
    ] },
    { distrito: "Itanara", censadas: 512, localidades: [
      { nombre: "Pariri", urbana: false, pueblos: [13,8], censadas: 422, viviendas: 169 },
      { nombre: "Yvyty Mir?", urbana: false, pueblos: [13], censadas: 90, viviendas: 35 },
    ] },
    { distrito: "Francisco Caballero Alvarez", censadas: 467, localidades: [
      { nombre: "Bajada Guasu", urbana: false, pueblos: [0,2,11,12,19], censadas: 250, viviendas: 98 },
      { nombre: "Bajada Guasu - Guyraju Mir?", urbana: false, pueblos: [2,19], censadas: 84, viviendas: 35 },
      { nombre: "Takuapu", urbana: false, pueblos: [2,12,19], censadas: 133, viviendas: 48 },
    ] },
    { distrito: "Nueva Esperanza", censadas: 342, localidades: [
      { nombre: "Itavo Guarani", urbana: false, pueblos: [2,19], censadas: 199, viviendas: 61 },
      { nombre: "Takuara'i", urbana: false, pueblos: [2,8,12,19], censadas: 57, viviendas: 17 },
      { nombre: "Ara Pyahu", urbana: false, pueblos: [2,19], censadas: 86, viviendas: 24 },
    ] },
    { distrito: "Maracana", censadas: 289, localidades: [
      { nombre: "Arroyo Morot?", urbana: false, pueblos: [2,11], censadas: 46, viviendas: 17 },
      { nombre: "Pindoju", urbana: false, pueblos: [2], censadas: 75, viviendas: 19 },
      { nombre: "Vera Ro", urbana: false, pueblos: [2,11,19], censadas: 48, viviendas: 19 },
      { nombre: "Y'apy Piro'y", urbana: false, pueblos: [2,11], censadas: 30, viviendas: 13 },
      { nombre: "Yvy Pora", urbana: false, pueblos: [11], censadas: 22, viviendas: 4 },
      { nombre: "Nueva Fortuna", urbana: false, pueblos: [2], censadas: 68, viviendas: 41 },
    ] },
    { distrito: "Laurel", censadas: 229, localidades: [
      { nombre: "Jejyty Mir?", urbana: false, pueblos: [2], censadas: 68, viviendas: 20 },
      { nombre: "Yaso Manduvi", urbana: false, pueblos: [2], censadas: 112, viviendas: 40 },
      { nombre: "Takua Mir? 2", urbana: false, pueblos: [2,11], censadas: 49, viviendas: 22 },
    ] },
    { distrito: "Salto del Guaira", censadas: 76, localidades: [
      { nombre: "Guyra Keha Guavira", urbana: false, pueblos: [2], censadas: 76, viviendas: 27 },
    ] },
    { distrito: "Puerto Adela", censadas: 74, localidades: [
      { nombre: "Tekoha Poty Vera", urbana: false, pueblos: [2,19], censadas: 74, viviendas: 36 },
    ] },
    ],
  },
  {
    departamento: "Presidente Hayes",
    indigena: 29592,
    noIndigena: 245,
    familias: [
      { familia: "Lengua Maskoy", personas: 23710, pueblos: [
        { pueblo: "Enxet Sur", personas: 8022 },
        { pueblo: "Angaite", personas: 6001 },
        { pueblo: "Enlhet Norte", personas: 4578 },
        { pueblo: "Sanapana", personas: 3237 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 1830 },
        { pueblo: "Guana", personas: 42 },
      ] },
      { familia: "Mataco Mataguayo", personas: 3907, pueblos: [
        { pueblo: "Nivacle", personas: 3347 },
        { pueblo: "Maka", personas: 559 },
        { pueblo: "Manjui", personas: 1 },
      ] },
      { familia: "Guaicuru", personas: 1911, pueblos: [
        { pueblo: "Qom", personas: 1911 },
      ] },
      { familia: "Guarani", personas: 62, pueblos: [
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 22 },
        { pueblo: "Guarani Nandeva", personas: 18 },
        { pueblo: "Pai Tavytera", personas: 10 },
        { pueblo: "Mbya Guarani", personas: 7 },
        { pueblo: "Ava Guarani", personas: 3 },
        { pueblo: "Ache", personas: 2 },
      ] },
      { familia: "Zamuco", personas: 2, pueblos: [
        { pueblo: "Ayoreo", personas: 1 },
        { pueblo: "Tomaraho", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Tte. 1° Manuel Irala Fernandez", censadas: 14327, localidades: [
      { nombre: "Karandilla Poty", urbana: true, pueblos: [15,1], censadas: 167, viviendas: 38 },
      { nombre: "Diez Leguas - Vista Alegre", urbana: false, pueblos: [1], censadas: 197, viviendas: 59 },
      { nombre: "Diez Leguas - Palo Blanco", urbana: false, pueblos: [5,15,1], censadas: 276, viviendas: 61 },
      { nombre: "Diez Leguas - 12 de Junio", urbana: false, pueblos: [13,1,19], censadas: 411, viviendas: 113 },
      { nombre: "Diez Leguas - Martillo", urbana: false, pueblos: [1,12], censadas: 150, viviendas: 41 },
      { nombre: "Diez Leguas - Karandilla", urbana: false, pueblos: [15,1], censadas: 162, viviendas: 32 },
      { nombre: "Diez Leguas - Centro", urbana: false, pueblos: [1,12], censadas: 110, viviendas: 24 },
      { nombre: "El Estribo - 20 de enero", urbana: false, pueblos: [4,5,1,12,14], censadas: 212, viviendas: 52 },
      { nombre: "El Estribo - Alegre", urbana: false, pueblos: [5], censadas: 145, viviendas: 49 },
      { nombre: "El Estribo - Dos palmas", urbana: false, pueblos: [4,5,15,1], censadas: 446, viviendas: 123 },
      { nombre: "El Estribo - Karanda oka", urbana: false, pueblos: [4,5,14], censadas: 179, viviendas: 71 },
      { nombre: "El Estribo - La Madrina", urbana: false, pueblos: [4,5,15,1,12,9], censadas: 95, viviendas: 22 },
      { nombre: "El Estribo - Palo Santo", urbana: false, pueblos: [4,5], censadas: 154, viviendas: 45 },
      { nombre: "El Estribo - Paratodo'i", urbana: false, pueblos: [5,1,16,19], censadas: 256, viviendas: 55 },
      { nombre: "El Estribo - San Carlos", urbana: false, pueblos: [4,5,16,9], censadas: 262, viviendas: 67 },
      { nombre: "El Estribo - Santa Fe", urbana: false, pueblos: [4,5,12,14], censadas: 269, viviendas: 79 },
      { nombre: "El Estribo - 3 Tamarino", urbana: false, pueblos: [4,5], censadas: 55, viviendas: 13 },
      { nombre: "La Armonia - Aldea 1", urbana: false, pueblos: [4,5,14,19], censadas: 64, viviendas: 29 },
      { nombre: "La Armonia - Aldea 2", urbana: false, pueblos: [4,5], censadas: 122, viviendas: 53 },
      { nombre: "La Armonia - Aldea 3", urbana: false, pueblos: [4,5,14], censadas: 45, viviendas: 20 },
      { nombre: "La Armonia - Aldea 4", urbana: false, pueblos: [4,5], censadas: 41, viviendas: 12 },
      { nombre: "La Armonia - Aldea 5", urbana: false, pueblos: [4,5,16,19], censadas: 109, viviendas: 35 },
      { nombre: "La Armonia - Aldea 7", urbana: false, pueblos: [4,5], censadas: 105, viviendas: 40 },
      { nombre: "Nich'a Toyish - Macedonia", urbana: false, pueblos: [12], censadas: 57, viviendas: 14 },
      { nombre: "Nich'a Toyish - 1° de Marzo", urbana: false, pueblos: [12], censadas: 27, viviendas: 7 },
      { nombre: "Nich'a Toyish - Boqueron", urbana: false, pueblos: [12], censadas: 34, viviendas: 10 },
      { nombre: "Nich'a Toyish - 12 de Octubre", urbana: false, pueblos: [12], censadas: 91, viviendas: 29 },
      { nombre: "Nich'a Toyish - 19 de Abril", urbana: false, pueblos: [12], censadas: 49, viviendas: 12 },
      { nombre: "Nich'a Toyish - 14 de Mayo", urbana: false, pueblos: [12,9,19], censadas: 87, viviendas: 19 },
      { nombre: "Nich'a Toyish - 12 de Junio", urbana: false, pueblos: [12], censadas: 87, viviendas: 25 },
      { nombre: "Nich'a Toyish - 1° de Mayo", urbana: false, pueblos: [12], censadas: 110, viviendas: 34 },
      { nombre: "Nich'a Toyish - Primavera", urbana: false, pueblos: [12], censadas: 89, viviendas: 20 },
      { nombre: "Nich'a Toyish - Paz del Chaco", urbana: false, pueblos: [12], censadas: 13, viviendas: 3 },
      { nombre: "Nueva Promesa - Aldea 1", urbana: false, pueblos: [15,1], censadas: 148, viviendas: 39 },
      { nombre: "Nueva Promesa - Aldea 2", urbana: false, pueblos: [5,15,1,19], censadas: 194, viviendas: 52 },
      { nombre: "Nueva Promesa - Aldea 3", urbana: false, pueblos: [5,15,1,6], censadas: 211, viviendas: 48 },
      { nombre: "Nueva Promesa - Aldea 4", urbana: false, pueblos: [15], censadas: 130, viviendas: 32 },
      { nombre: "Nueva Promesa - Aldea 6", urbana: false, pueblos: [4,5,15], censadas: 286, viviendas: 75 },
      { nombre: "Nueva Vida", urbana: false, pueblos: [4,5,15,19], censadas: 687, viviendas: 205 },
      { nombre: "Paz Del Chaco - Unida", urbana: false, pueblos: [4,5,15,6,14], censadas: 728, viviendas: 211 },
      { nombre: "Paz Del Chaco - Terrenal", urbana: false, pueblos: [0,4,5,15,1,6,9], censadas: 252, viviendas: 77 },
      { nombre: "Campo Largo", urbana: false, pueblos: [7,4,5,12], censadas: 347, viviendas: 88 },
      { nombre: "Campo Largo - Pozo Negro", urbana: false, pueblos: [4,12], censadas: 74, viviendas: 16 },
      { nombre: "Campo Largo - Campo Bajo", urbana: false, pueblos: [4,12,9,19], censadas: 250, viviendas: 61 },
      { nombre: "Campo Largo - Campo Arana", urbana: false, pueblos: [7,4,5], censadas: 135, viviendas: 35 },
      { nombre: "Campo Largo - 5 de Mayo", urbana: false, pueblos: [4,12], censadas: 144, viviendas: 33 },
      { nombre: "Anaconda", urbana: false, pueblos: [15,19], censadas: 429, viviendas: 81 },
      { nombre: "Nivacle Unida - Betania", urbana: false, pueblos: [12,19], censadas: 253, viviendas: 76 },
      { nombre: "Nivacle Unida - Jerico", urbana: false, pueblos: [4,12], censadas: 156, viviendas: 41 },
      { nombre: "Nivacle Unida - Jope", urbana: false, pueblos: [12], censadas: 398, viviendas: 107 },
      { nombre: "Nivacle Unida - Cana", urbana: false, pueblos: [12], censadas: 109, viviendas: 32 },
      { nombre: "Casanillo - Campo Aroma", urbana: false, pueblos: [5,15,1,16], censadas: 250, viviendas: 53 },
      { nombre: "Casanillo - Tres Palmas", urbana: false, pueblos: [13,15,6], censadas: 181, viviendas: 36 },
      { nombre: "Casanillo - Capiata", urbana: false, pueblos: [16,9], censadas: 121, viviendas: 38 },
      { nombre: "Casanillo - Casanillo", urbana: false, pueblos: [8,4,16,19], censadas: 757, viviendas: 246 },
      { nombre: "Casanillo - Linda Vista", urbana: false, pueblos: [16], censadas: 11, viviendas: 4 },
      { nombre: "Casanillo - San Rafael", urbana: false, pueblos: [4,5,1,6,16], censadas: 252, viviendas: 56 },
      { nombre: "La Esperanza - Centro", urbana: false, pueblos: [4,5,15,19], censadas: 145, viviendas: 38 },
      { nombre: "La Esperanza - Aldea 6", urbana: false, pueblos: [15,1,6], censadas: 259, viviendas: 57 },
      { nombre: "La Esperanza - Aldea 7", urbana: false, pueblos: [15], censadas: 76, viviendas: 19 },
      { nombre: "La Esperanza - Aldea 5", urbana: false, pueblos: [15,16], censadas: 95, viviendas: 21 },
      { nombre: "Pozo Amarillo - Centro", urbana: false, pueblos: [4,5,15,1,16], censadas: 194, viviendas: 58 },
      { nombre: "Pozo Amarillo - Tobat?", urbana: false, pueblos: [2,4,5,15,16], censadas: 150, viviendas: 44 },
      { nombre: "Pozo Amarillo - Rojas Silva", urbana: false, pueblos: [4,5], censadas: 64, viviendas: 17 },
      { nombre: "Pozo Amarillo - Nueva Union", urbana: false, pueblos: [4,5,15,16,12,19], censadas: 466, viviendas: 134 },
      { nombre: "Pozo Amarillo - Chaco'i", urbana: false, pueblos: [4,5,16,12], censadas: 37, viviendas: 10 },
      { nombre: "Pozo Amarillo - Colonia 1", urbana: false, pueblos: [4,5,16,19], censadas: 222, viviendas: 56 },
      { nombre: "Pozo Amarillo - 4 de Agosto", urbana: false, pueblos: [8,4,5,16], censadas: 261, viviendas: 64 },
      { nombre: "Pozo Amarillo - Ararat", urbana: false, pueblos: [0,4,16], censadas: 175, viviendas: 50 },
      { nombre: "Pozo Amarillo - Carpa Kue", urbana: false, pueblos: [4,5,15,16,19], censadas: 114, viviendas: 28 },
      { nombre: "Pozo Amarillo - Natem Pome", urbana: false, pueblos: [4], censadas: 110, viviendas: 25 },
      { nombre: "La Abundancia", urbana: false, pueblos: [12], censadas: 458, viviendas: 77 },
      { nombre: "Laguna Pora", urbana: false, pueblos: [16], censadas: 38, viviendas: 15 },
      { nombre: "Xakmok Kasek", urbana: false, pueblos: [11,7,4,5,15,1,14,19], censadas: 284, viviendas: 87 },
    ] },
    { distrito: "Villa Hayes", censadas: 5567, localidades: [
      { nombre: "Individualidades de Villa Hayes", urbana: true, pueblos: [4,5,12,19], censadas: 57, viviendas: 13 },
      { nombre: "La Herencia - Jerusalen", urbana: false, pueblos: [4,5,15,1,16,19], censadas: 561, viviendas: 178 },
      { nombre: "La Herencia - La Herencia", urbana: false, pueblos: [4,5,15,1,16,12,14,19], censadas: 564, viviendas: 176 },
      { nombre: "La Herencia - Larrosa Kue", urbana: false, pueblos: [13,4,5,15,1,6], censadas: 172, viviendas: 58 },
      { nombre: "La Herencia - Nazareth", urbana: false, pueblos: [5], censadas: 108, viviendas: 33 },
      { nombre: "La Herencia - Palo Blanco", urbana: false, pueblos: [2,4,5,1,12,10], censadas: 387, viviendas: 118 },
      { nombre: "La Herencia - Primavera", urbana: false, pueblos: [4,5,19], censadas: 93, viviendas: 26 },
      { nombre: "La Herencia - Palo Azul", urbana: false, pueblos: [4,5], censadas: 36, viviendas: 17 },
      { nombre: "La Herencia - Larrosa Kue 2 / Macedonia", urbana: false, pueblos: [5], censadas: 85, viviendas: 25 },
      { nombre: "Makxlawaya - Makxlawaya", urbana: false, pueblos: [7,4,5,1,19], censadas: 776, viviendas: 201 },
      { nombre: "Makxlawaya - Monte Alto", urbana: false, pueblos: [5,15,1,19], censadas: 118, viviendas: 31 },
      { nombre: "Makxlawaya - Isla Mainumby", urbana: false, pueblos: [5,19], censadas: 80, viviendas: 18 },
      { nombre: "Sawhoyamaxa - Santa Elisa", urbana: false, pueblos: [4,5,15,1,19], censadas: 497, viviendas: 138 },
      { nombre: "Sawhoyamaxa - km 16", urbana: false, pueblos: [8,4,5,12,19], censadas: 130, viviendas: 45 },
      { nombre: "Sawhoyamaxa - 24 de Enero", urbana: false, pueblos: [4,5,19], censadas: 70, viviendas: 24 },
      { nombre: "Sawhoyamaxa - 16 de Agosto", urbana: false, pueblos: [5,19], censadas: 59, viviendas: 21 },
      { nombre: "Yakye Axa", urbana: false, pueblos: [5,19], censadas: 156, viviendas: 41 },
      { nombre: "Yanekyaha Espinillo - 26 de Junio", urbana: false, pueblos: [13,4,5,1], censadas: 82, viviendas: 30 },
      { nombre: "Yanekyaha Espinillo - Espinillo", urbana: false, pueblos: [5,15,12], censadas: 193, viviendas: 61 },
      { nombre: "Yanekyaha Espinillo - Samaria", urbana: false, pueblos: [5], censadas: 51, viviendas: 17 },
      { nombre: "Yanekyaha Espinillo - Timboty", urbana: false, pueblos: [13,7,4,5,19], censadas: 173, viviendas: 60 },
      { nombre: "Buena Vista / Lamenxay", urbana: false, pueblos: [4,5,1,19], censadas: 40, viviendas: 9 },
      { nombre: "Naranjaty", urbana: false, pueblos: [4,5,14,19], censadas: 112, viviendas: 30 },
      { nombre: "Kelyenmagategma - Karaja Vuelta", urbana: false, pueblos: [7,4,5,1], censadas: 135, viviendas: 38 },
      { nombre: "Kelyenmagategma - Karaja Vuelta - Partillada", urbana: false, pueblos: [4,5,1], censadas: 70, viviendas: 15 },
      { nombre: "Kenkuket", urbana: false, pueblos: [5,12,9,19], censadas: 621, viviendas: 163 },
      { nombre: "Rodolfito - Alborada", urbana: false, pueblos: [5,19], censadas: 38, viviendas: 9 },
      { nombre: "Comunidad 96 / Payseyamexyempa'a", urbana: false, pueblos: [4,5,1], censadas: 76, viviendas: 15 },
      { nombre: "Nucleo de Familia Rancho 10", urbana: false, pueblos: [5,19], censadas: 27, viviendas: 12 },
    ] },
    { distrito: "Puerto Pinasco", censadas: 5498, localidades: [
      { nombre: "Ex Cora'i - Kenaten", urbana: false, pueblos: [5,15,1], censadas: 217, viviendas: 44 },
      { nombre: "Ex Cora'i - Nepoxen", urbana: false, pueblos: [8,5,15,1,14,19], censadas: 271, viviendas: 65 },
      { nombre: "Ex Cora'i - Saria", urbana: false, pueblos: [1,19], censadas: 184, viviendas: 52 },
      { nombre: "Ex Cora'i - Tajamar Kavaju", urbana: false, pueblos: [1], censadas: 57, viviendas: 17 },
      { nombre: "Ex Cora'i - 4 de Agosto", urbana: false, pueblos: [1], censadas: 40, viviendas: 12 },
      { nombre: "Ex Cora'i - 8 de Enero", urbana: false, pueblos: [1], censadas: 73, viviendas: 18 },
      { nombre: "Laguna Pato - La India", urbana: false, pueblos: [5,15], censadas: 27, viviendas: 6 },
      { nombre: "Laguna Pato - Laguna Pato", urbana: false, pueblos: [15], censadas: 118, viviendas: 27 },
      { nombre: "Laguna Pato - Lolaico'i", urbana: false, pueblos: [5,15,1], censadas: 58, viviendas: 16 },
      { nombre: "Laguna Pato - Lolaico Guasu", urbana: false, pueblos: [7,5,15,1,19], censadas: 132, viviendas: 29 },
      { nombre: "Laguna Pato - Brillante", urbana: false, pueblos: [15], censadas: 50, viviendas: 13 },
      { nombre: "Laguna Pato - Paisa Tempela", urbana: false, pueblos: [11,15,1], censadas: 91, viviendas: 14 },
      { nombre: "Laguna Pato - Salado", urbana: false, pueblos: [15], censadas: 20, viviendas: 6 },
      { nombre: "San Fernando - Paso Lima", urbana: false, pueblos: [5,1], censadas: 58, viviendas: 16 },
      { nombre: "San Fernando - Kurupa'yty", urbana: false, pueblos: [5,15,1,19], censadas: 111, viviendas: 33 },
      { nombre: "Yexwase Yet - San Fernando", urbana: false, pueblos: [5,1], censadas: 52, viviendas: 10 },
      { nombre: "Xakmok Kasek - 25 de Febrero", urbana: false, pueblos: [15,1], censadas: 44, viviendas: 10 },
      { nombre: "La Patria - Karoa Guasu", urbana: false, pueblos: [4,5,1,19], censadas: 106, viviendas: 30 },
      { nombre: "La Patria - Karoa'i", urbana: false, pueblos: [4,5,1], censadas: 150, viviendas: 41 },
      { nombre: "La Patria - Urundey", urbana: false, pueblos: [8,1], censadas: 119, viviendas: 30 },
      { nombre: "La Patria - Colonia 24", urbana: false, pueblos: [1,12,19], censadas: 152, viviendas: 36 },
      { nombre: "La Patria - La Leona", urbana: false, pueblos: [13,1,6], censadas: 315, viviendas: 55 },
      { nombre: "La Patria - La Paciencia", urbana: false, pueblos: [1,19], censadas: 232, viviendas: 59 },
      { nombre: "La Patria - Carpincho", urbana: false, pueblos: [1,19], censadas: 141, viviendas: 30 },
      { nombre: "La Patria - Las Flores", urbana: false, pueblos: [11,1,19], censadas: 292, viviendas: 62 },
      { nombre: "La Patria - Monte Kue", urbana: false, pueblos: [1], censadas: 107, viviendas: 25 },
      { nombre: "La Patria - Puente Kaigue", urbana: false, pueblos: [15,1], censadas: 53, viviendas: 11 },
      { nombre: "La Patria - Tatar?", urbana: false, pueblos: [1], censadas: 41, viviendas: 8 },
      { nombre: "La Patria - Laguna Teja", urbana: false, pueblos: [8,15,1], censadas: 121, viviendas: 29 },
      { nombre: "La Patria - Paraiso", urbana: false, pueblos: [5,1,19], censadas: 195, viviendas: 60 },
      { nombre: "La Patria - San Fernandez", urbana: false, pueblos: [13,5,15,1], censadas: 291, viviendas: 55 },
      { nombre: "La Patria - Laguna H?", urbana: false, pueblos: [4,1], censadas: 199, viviendas: 65 },
      { nombre: "La Patria - Tres Quebrachos", urbana: false, pueblos: [1], censadas: 39, viviendas: 10 },
      { nombre: "La Patria - 6 de Marzo", urbana: false, pueblos: [1,19], censadas: 58, viviendas: 19 },
      { nombre: "La Patria - 1° de Mayo", urbana: false, pueblos: [1], censadas: 56, viviendas: 15 },
      { nombre: "Riacho San Carlos - San Carlos", urbana: false, pueblos: [2,4,5,1,19], censadas: 477, viviendas: 124 },
      { nombre: "Riacho San Carlos - Hugua Chini", urbana: false, pueblos: [13,5,1,19], censadas: 457, viviendas: 124 },
      { nombre: "Riacho San Carlos - Mbokajaty", urbana: false, pueblos: [1], censadas: 71, viviendas: 20 },
      { nombre: "Gente Rory", urbana: false, pueblos: [5,1,14], censadas: 110, viviendas: 30 },
      { nombre: "La Palmera", urbana: false, pueblos: [15], censadas: 113, viviendas: 27 },
    ] },
    { distrito: "Benjamin Aceval", censadas: 2092, localidades: [
      { nombre: "Qomi Nayajnacta", urbana: false, pueblos: [4,6,14,19], censadas: 291, viviendas: 85 },
      { nombre: "Ndapiguen Santa Clara", urbana: false, pueblos: [4,5,17,14], censadas: 77, viviendas: 28 },
      { nombre: "Rosarino", urbana: false, pueblos: [11,4,5,15,1,16,12,3,14,19], censadas: 603, viviendas: 183 },
      { nombre: "San Francisco de Asis", urbana: false, pueblos: [14], censadas: 187, viviendas: 84 },
      { nombre: "Santa Rosa", urbana: false, pueblos: [4,5,14], censadas: 99, viviendas: 43 },
      { nombre: "Santa Lucia", urbana: false, pueblos: [8,14,19], censadas: 75, viviendas: 29 },
      { nombre: "Ngalec Qom", urbana: false, pueblos: [4,14], censadas: 197, viviendas: 66 },
      { nombre: "Cerriteno Kae Salecpi", urbana: false, pueblos: [8,7,5,14,19], censadas: 287, viviendas: 102 },
      { nombre: "Kemha Yat Sepo", urbana: false, pueblos: [4,5,15,1,14,19], censadas: 214, viviendas: 62 },
      { nombre: "Mango Sat", urbana: false, pueblos: [5,14,19], censadas: 62, viviendas: 24 },
    ] },
    { distrito: "Campo Aceval", censadas: 864, localidades: [
      { nombre: "Novòc'tas - Centro", urbana: false, pueblos: [12], censadas: 217, viviendas: 37 },
      { nombre: "Novòc'tas - Marcelo Kue", urbana: false, pueblos: [4,5,12], censadas: 169, viviendas: 36 },
      { nombre: "Paratodo", urbana: false, pueblos: [7,4,5,15,16,12,9,14], censadas: 478, viviendas: 124 },
    ] },
    { distrito: "Teniente Esteban Martinez", censadas: 788, localidades: [
      { nombre: "Fischat - San Leonardo", urbana: false, pueblos: [7,16,12,19], censadas: 706, viviendas: 139 },
      { nombre: "Cacique Sapo", urbana: false, pueblos: [12,19], censadas: 82, viviendas: 17 },
    ] },
    { distrito: "General Jose Maria Bruguez", censadas: 701, localidades: [
      { nombre: "La Esperanza - Centro", urbana: false, pueblos: [5,14], censadas: 69, viviendas: 24 },
      { nombre: "La Esperanza - La Promesa", urbana: false, pueblos: [5,15,14,19], censadas: 247, viviendas: 65 },
      { nombre: "La Esperanza - La Altura", urbana: false, pueblos: [4,5], censadas: 121, viviendas: 32 },
      { nombre: "La Esperanza - Tapiti", urbana: false, pueblos: [5], censadas: 60, viviendas: 23 },
      { nombre: "La Esperanza - Karaguata Poty", urbana: false, pueblos: [5,14,19], censadas: 82, viviendas: 32 },
      { nombre: "San Jose", urbana: false, pueblos: [4,5,14,19], censadas: 75, viviendas: 22 },
      { nombre: "Tooshec Qaltaq", urbana: false, pueblos: [14], censadas: 47, viviendas: 17 },
    ] },
    ],
  },
  {
    departamento: "Boqueron",
    indigena: 29443,
    noIndigena: 358,
    familias: [
      { familia: "Mataco Mataguayo", personas: 15145, pueblos: [
        { pueblo: "Nivacle", personas: 14703 },
        { pueblo: "Manjui", personas: 423 },
        { pueblo: "Maka", personas: 19 },
      ] },
      { familia: "Guarani", personas: 6802, pueblos: [
        { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 3716 },
        { pueblo: "Guarani Nandeva", personas: 3065 },
        { pueblo: "Ava Guarani", personas: 11 },
        { pueblo: "Pai Tavytera", personas: 6 },
        { pueblo: "Mbya Guarani", personas: 3 },
        { pueblo: "Ache", personas: 1 },
      ] },
      { familia: "Lengua Maskoy", personas: 5721, pueblos: [
        { pueblo: "Enlhet Norte", personas: 5124 },
        { pueblo: "Angaite", personas: 397 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 93 },
        { pueblo: "Enxet Sur", personas: 76 },
        { pueblo: "Guana", personas: 16 },
        { pueblo: "Sanapana", personas: 15 },
      ] },
      { familia: "Zamuco", personas: 1774, pueblos: [
        { pueblo: "Ayoreo", personas: 1769 },
        { pueblo: "Ybytoso", personas: 5 },
      ] },
      { familia: "Guaicuru", personas: 1, pueblos: [
        { pueblo: "Qom", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Filadelfia", censadas: 7961, localidades: [
      { nombre: "Cacique Mayeto", urbana: true, pueblos: [2,7,4,5,12,9], censadas: 763, viviendas: 156 },
      { nombre: "Uj'elhavos", urbana: true, pueblos: [2,8,7,4,5,12,9,3,19], censadas: 3107, viviendas: 455 },
      { nombre: "Yvopey Renda", urbana: true, pueblos: [8,7,4,5,1,16,12,19], censadas: 1333, viviendas: 278 },
      { nombre: "Campo Loro", urbana: false, pueblos: [8,3,18], censadas: 446, viviendas: 201 },
      { nombre: "Colonia 22", urbana: false, pueblos: [12,10], censadas: 99, viviendas: 21 },
      { nombre: "Ebetogue", urbana: false, pueblos: [10,3], censadas: 292, viviendas: 72 },
      { nombre: "Jesudi", urbana: false, pueblos: [8,3], censadas: 59, viviendas: 22 },
      { nombre: "San Loewen", urbana: false, pueblos: [8,4,5,1,16,12], censadas: 356, viviendas: 105 },
      { nombre: "San Martin", urbana: false, pueblos: [8,15,1,18,19], censadas: 177, viviendas: 50 },
      { nombre: "Santo Domingo", urbana: false, pueblos: [15,1,19], censadas: 170, viviendas: 50 },
      { nombre: "Tunucojai", urbana: false, pueblos: [3,19], censadas: 14, viviendas: 7 },
      { nombre: "Jogasui", urbana: false, pueblos: [3], censadas: 87, viviendas: 44 },
      { nombre: "10 de Febrero", urbana: false, pueblos: [3,19], censadas: 38, viviendas: 15 },
      { nombre: "15 de Setiembre", urbana: false, pueblos: [3], censadas: 17, viviendas: 11 },
      { nombre: "2 de Enero", urbana: false, pueblos: [3,19], censadas: 80, viviendas: 30 },
      { nombre: "Ijnapui", urbana: false, pueblos: [3,19], censadas: 68, viviendas: 26 },
      { nombre: "La Esquina", urbana: false, pueblos: [3,19], censadas: 49, viviendas: 16 },
      { nombre: "Colonia 5 - Obrero", urbana: false, pueblos: [8,7,4,15,12], censadas: 197, viviendas: 45 },
      { nombre: "Oleria Trebol", urbana: false, pueblos: [3,19], censadas: 131, viviendas: 38 },
      { nombre: "Amistad", urbana: false, pueblos: [3], censadas: 28, viviendas: 10 },
      { nombre: "Guida Ichai", urbana: false, pueblos: [3,19], censadas: 450, viviendas: 136 },
    ] },
    { distrito: "Mariscal Jose Felix Estigarribia", censadas: 7956, localidades: [
      { nombre: "Santa Teresita", urbana: true, pueblos: [8,19], censadas: 43, viviendas: 7 },
      { nombre: "Santa Teresita - Santa Rosa", urbana: true, pueblos: [8,19], censadas: 70, viviendas: 19 },
      { nombre: "Santa Teresita - Santa Elena", urbana: true, pueblos: [8,7,4,12,10,19], censadas: 147, viviendas: 28 },
      { nombre: "Santa Teresita - San Jose", urbana: true, pueblos: [13,12,19], censadas: 337, viviendas: 59 },
      { nombre: "Santa Teresita - Virgen del Carmen", urbana: true, pueblos: [8,7,10], censadas: 62, viviendas: 16 },
      { nombre: "Santa Teresita - Villa Belen", urbana: true, pueblos: [8,7,10], censadas: 123, viviendas: 29 },
      { nombre: "Santa Teresita - Virgen de Caacupe", urbana: true, pueblos: [13,8,7,5,1,12,19], censadas: 172, viviendas: 46 },
      { nombre: "Santa Teresita - Santa Maria", urbana: true, pueblos: [8,12,19], censadas: 109, viviendas: 31 },
      { nombre: "Santa Teresita - Santa Lucia", urbana: true, pueblos: [8,12], censadas: 87, viviendas: 29 },
      { nombre: "Santa Teresita - Maria Auxiliadora", urbana: true, pueblos: [8], censadas: 46, viviendas: 21 },
      { nombre: "Santa Teresita - Santa Isabel", urbana: true, pueblos: [8,9], censadas: 95, viviendas: 20 },
      { nombre: "Santa Teresita - Santa Cecilia", urbana: true, pueblos: [8,12], censadas: 61, viviendas: 12 },
      { nombre: "Santa Teresita - Virgen del Rosario", urbana: true, pueblos: [8,19], censadas: 178, viviendas: 46 },
      { nombre: "Santa Teresita - San Juan", urbana: true, pueblos: [8,19], censadas: 52, viviendas: 17 },
      { nombre: "Santa Teresita - San Lazaro", urbana: true, pueblos: [8,7,15], censadas: 134, viviendas: 34 },
      { nombre: "Abizais - Picada 500", urbana: true, pueblos: [7,10,19], censadas: 84, viviendas: 29 },
      { nombre: "Mariscal Estigarribia - Urbano", urbana: true, pueblos: [8,19], censadas: 502, viviendas: 123 },
      { nombre: "Campo Loa - Santisima Trinidad", urbana: false, pueblos: [12], censadas: 126, viviendas: 36 },
      { nombre: "Campo Loa - Jotoichat", urbana: false, pueblos: [12,10,19], censadas: 435, viviendas: 121 },
      { nombre: "Campo Loa - Primavera", urbana: false, pueblos: [8,12], censadas: 151, viviendas: 35 },
      { nombre: "Campo Loa - San Miguel", urbana: false, pueblos: [12,10], censadas: 199, viviendas: 50 },
      { nombre: "Campo Loa - San Pio 10", urbana: false, pueblos: [12], censadas: 77, viviendas: 16 },
      { nombre: "Campo Loa - San Ramon", urbana: false, pueblos: [8,12,9], censadas: 106, viviendas: 20 },
      { nombre: "Campo Loa - Nasuc", urbana: false, pueblos: [2,8,12], censadas: 211, viviendas: 36 },
      { nombre: "Campo Loa - San Antonio", urbana: false, pueblos: [8,7,12], censadas: 73, viviendas: 12 },
      { nombre: "Campo Loa - Noe", urbana: false, pueblos: [8,7,12], censadas: 42, viviendas: 10 },
      { nombre: "Campo Loa - San Pedro", urbana: false, pueblos: [12,10], censadas: 55, viviendas: 15 },
      { nombre: "Laguna Negra - Nueva Estrella", urbana: false, pueblos: [7,4,19], censadas: 54, viviendas: 15 },
      { nombre: "Laguna Negra - Canaan", urbana: false, pueblos: [8,7,5], censadas: 277, viviendas: 78 },
      { nombre: "Laguna Negra - Damasco", urbana: false, pueblos: [8,7,12], censadas: 269, viviendas: 95 },
      { nombre: "Laguna Negra - Emaus", urbana: false, pueblos: [8,7,19], censadas: 97, viviendas: 24 },
      { nombre: "Laguna Negra - Jerusalen", urbana: false, pueblos: [8,7,16,12], censadas: 62, viviendas: 23 },
      { nombre: "Laguna Negra - Ko'? Pyahu", urbana: false, pueblos: [7], censadas: 151, viviendas: 49 },
      { nombre: "Laguna Negra - Timoteo", urbana: false, pueblos: [11,8,7], censadas: 82, viviendas: 32 },
      { nombre: "Laguna Negra - Belen", urbana: false, pueblos: [7,5,10], censadas: 196, viviendas: 64 },
      { nombre: "Laguna Negra - Nueva Luna", urbana: false, pueblos: [7], censadas: 38, viviendas: 13 },
      { nombre: "Laguna Negra - Mbyja Ko'?", urbana: false, pueblos: [8,7,19], censadas: 88, viviendas: 28 },
      { nombre: "Laguna Negra - Villa Monte", urbana: false, pueblos: [7,1], censadas: 89, viviendas: 23 },
      { nombre: "Laguna Negra - Monte Sinai", urbana: false, pueblos: [8,7], censadas: 46, viviendas: 11 },
      { nombre: "Laguna Negra - San Blas", urbana: false, pueblos: [8,7,12], censadas: 86, viviendas: 32 },
      { nombre: "Laguna Negra - 8 de Enero", urbana: false, pueblos: [7], censadas: 96, viviendas: 21 },
      { nombre: "Machareti", urbana: false, pueblos: [11,13,8,7,5,12,19], censadas: 561, viviendas: 121 },
      { nombre: "Pykasu", urbana: false, pueblos: [11,7,15,1], censadas: 470, viviendas: 90 },
      { nombre: "San Agustin - San Eugenio", urbana: false, pueblos: [8,12,10,19], censadas: 102, viviendas: 28 },
      { nombre: "San Agustin - Sagrado Corazon de Jesus", urbana: false, pueblos: [8,19], censadas: 126, viviendas: 33 },
      { nombre: "San Agustin - San Roque", urbana: false, pueblos: [8,12,19], censadas: 193, viviendas: 56 },
      { nombre: "San Agustin - San Jose", urbana: false, pueblos: [8,12,19], censadas: 93, viviendas: 27 },
      { nombre: "San Agustin - Cristo Rey", urbana: false, pueblos: [8], censadas: 60, viviendas: 15 },
      { nombre: "San Agustin - Laguna", urbana: false, pueblos: [8,7,12], censadas: 119, viviendas: 35 },
      { nombre: "San Agustin - Maria Auxiliadora", urbana: false, pueblos: [8], censadas: 44, viviendas: 16 },
      { nombre: "Santa Rosa", urbana: false, pueblos: [9,10], censadas: 160, viviendas: 64 },
      { nombre: "Nu Guasu", urbana: false, pueblos: [7], censadas: 127, viviendas: 44 },
      { nombre: "Siracua", urbana: false, pueblos: [8,7], censadas: 86, viviendas: 27 },
      { nombre: "Jasy'endy", urbana: false, pueblos: [8,19], censadas: 123, viviendas: 32 },
      { nombre: "Cuyabia", urbana: false, pueblos: [8,3], censadas: 32, viviendas: 13 },
      { nombre: "Loma", urbana: false, pueblos: [8,7,19], censadas: 69, viviendas: 18 },
      { nombre: "Diez Kue Feliciano Saldivar", urbana: false, pueblos: [13,8,7,19], censadas: 113, viviendas: 33 },
      { nombre: "Nucleo de Familias La Patria", urbana: false, pueblos: [7], censadas: 70, viviendas: 12 },
    ] },
    { distrito: "Boqueron", censadas: 7886, localidades: [
      { nombre: "Cayin'o Clim", urbana: true, pueblos: [2,8,7,4,16,12,9,19], censadas: 1809, viviendas: 368 },
      { nombre: "Fischat - San Leonardo", urbana: false, pueblos: [12,19], censadas: 200, viviendas: 45 },
      { nombre: "Campo Largo - 6 de Octubre", urbana: false, pueblos: [2,7,4], censadas: 65, viviendas: 20 },
      { nombre: "Cacique Sapo", urbana: false, pueblos: [16,12,19], censadas: 112, viviendas: 21 },
      { nombre: "Cacique Sapo - Santa Rosa", urbana: false, pueblos: [12,19], censadas: 114, viviendas: 20 },
      { nombre: "San Jose Esteros", urbana: false, pueblos: [4,12], censadas: 528, viviendas: 78 },
      { nombre: "Quenjacloi", urbana: false, pueblos: [12,9], censadas: 83, viviendas: 25 },
      { nombre: "Yi'shinachat", urbana: false, pueblos: [4,12,19], censadas: 549, viviendas: 117 },
      { nombre: "Campo Alegre - Aldea 1", urbana: false, pueblos: [12], censadas: 159, viviendas: 43 },
      { nombre: "Campo Alegre - Aldea 2", urbana: false, pueblos: [12,19], censadas: 587, viviendas: 193 },
      { nombre: "Campo Alegre - Aldea 3", urbana: false, pueblos: [12], censadas: 179, viviendas: 56 },
      { nombre: "Campo Alegre - Aldea 4", urbana: false, pueblos: [12], censadas: 155, viviendas: 46 },
      { nombre: "Campo Alegre - Aldea 5", urbana: false, pueblos: [4,16,12], censadas: 207, viviendas: 57 },
      { nombre: "Campo Alegre - Aldea 6", urbana: false, pueblos: [12], censadas: 179, viviendas: 54 },
      { nombre: "Campo Alegre - Aldea 7", urbana: false, pueblos: [12,9], censadas: 98, viviendas: 33 },
      { nombre: "Campo Alegre - Aldea 8", urbana: false, pueblos: [12], censadas: 120, viviendas: 36 },
      { nombre: "Campo Alegre - Aldea 9", urbana: false, pueblos: [12,9], censadas: 117, viviendas: 38 },
      { nombre: "Campo Alegre - Aldea 10", urbana: false, pueblos: [12,10,19], censadas: 153, viviendas: 45 },
      { nombre: "Campo Alegre - Laguna Verde", urbana: false, pueblos: [12,10], censadas: 164, viviendas: 51 },
      { nombre: "Campo Ampu", urbana: false, pueblos: [12,10,19], censadas: 54, viviendas: 17 },
      { nombre: "Casuarina - La Serena", urbana: false, pueblos: [12], censadas: 61, viviendas: 21 },
      { nombre: "Casuarina - La Promesa", urbana: false, pueblos: [12], censadas: 110, viviendas: 37 },
      { nombre: "Casuarina - Campo Virgen", urbana: false, pueblos: [13,12], censadas: 182, viviendas: 73 },
      { nombre: "Casuarina - Campo Grande", urbana: false, pueblos: [12,10], censadas: 181, viviendas: 53 },
      { nombre: "Casuarina - La corona", urbana: false, pueblos: [12], censadas: 61, viviendas: 21 },
      { nombre: "Mistolar", urbana: false, pueblos: [12,10], censadas: 162, viviendas: 49 },
      { nombre: "Sandhorst", urbana: false, pueblos: [8,7,12], censadas: 475, viviendas: 104 },
      { nombre: "Yàcacvash", urbana: false, pueblos: [12,10], censadas: 242, viviendas: 58 },
      { nombre: "Media Luna", urbana: false, pueblos: [12,19], censadas: 46, viviendas: 8 },
      { nombre: "La Princesa", urbana: false, pueblos: [12], censadas: 351, viviendas: 71 },
      { nombre: "Paraiso", urbana: false, pueblos: [6,12,19], censadas: 310, viviendas: 83 },
      { nombre: "Pablo Sthall", urbana: false, pueblos: [4,12,19], censadas: 73, viviendas: 30 },
    ] },
    { distrito: "Loma Plata", censadas: 5998, localidades: [
      { nombre: "Pesempo'o", urbana: true, pueblos: [2,8,4,5,15,1,6,16,12,9,14,19], censadas: 2079, viviendas: 553 },
      { nombre: "Nivacle Unida - Centro", urbana: false, pueblos: [8,15,1,12,3,19], censadas: 158, viviendas: 33 },
      { nombre: "Nivacle Unida - Cesarea", urbana: false, pueblos: [5,12], censadas: 159, viviendas: 32 },
      { nombre: "Nivacle Unida - Samaria", urbana: false, pueblos: [5,12,19], censadas: 265, viviendas: 107 },
      { nombre: "Nivacle Unida  - Tiberia", urbana: false, pueblos: [8,4,12], censadas: 398, viviendas: 153 },
      { nombre: "Nivacle Unida - Betania", urbana: false, pueblos: [12], censadas: 66, viviendas: 25 },
      { nombre: "Nivacle Unida  - Galilea", urbana: false, pueblos: [5,12], censadas: 117, viviendas: 26 },
      { nombre: "Nivacle Unida  - Campo Salado", urbana: false, pueblos: [12], censadas: 179, viviendas: 45 },
      { nombre: "Nivacle Unida - Campo Nueve", urbana: false, pueblos: [7,12], censadas: 253, viviendas: 61 },
      { nombre: "Nivacle Unida - Jerico", urbana: false, pueblos: [4,12,19], censadas: 96, viviendas: 29 },
      { nombre: "Ya'alve Saanga - Centro", urbana: false, pueblos: [4,5], censadas: 255, viviendas: 67 },
      { nombre: "Ya'alve Saanga - Savaaya Amyep", urbana: false, pueblos: [4,5], censadas: 87, viviendas: 27 },
      { nombre: "Ya'alve Saanga - Setesves", urbana: false, pueblos: [4,19], censadas: 109, viviendas: 34 },
      { nombre: "Ya'alve Saanga - Naok Amyep", urbana: false, pueblos: [4,5,15,12,9], censadas: 186, viviendas: 51 },
      { nombre: "Ya'alve Saanga - Mariscal Lopez", urbana: false, pueblos: [4,16], censadas: 97, viviendas: 25 },
      { nombre: "Ya'alve Saanga - 10 de Agosto", urbana: false, pueblos: [7,4,5,16,12,9], censadas: 159, viviendas: 35 },
      { nombre: "Ya'alve Saanga - Caacupe", urbana: false, pueblos: [4,5,15,12], censadas: 141, viviendas: 34 },
      { nombre: "Ya'alve Saanga - Nazareth", urbana: false, pueblos: [0,4,5,1,12], censadas: 474, viviendas: 133 },
      { nombre: "Ya'alve Saanga - Efeso", urbana: false, pueblos: [4,1,16,19], censadas: 269, viviendas: 67 },
      { nombre: "Ya'alve Saanga - Tarso Amyep", urbana: false, pueblos: [4,5,19], censadas: 84, viviendas: 21 },
      { nombre: "Ya'alve Saanga - Madian", urbana: false, pueblos: [4,16], censadas: 96, viviendas: 27 },
      { nombre: "Ya'alve Saanga - Kanavsa", urbana: false, pueblos: [4,5], censadas: 85, viviendas: 26 },
      { nombre: "Ya'alve Saanga - Campo Bello", urbana: false, pueblos: [4], censadas: 54, viviendas: 21 },
      { nombre: "Ya'alve Saanga - Monte Palmera", urbana: false, pueblos: [4,12,3,19], censadas: 132, viviendas: 49 },
    ] },
    ],
  },
  {
    departamento: "Alto Paraguay",
    indigena: 4392,
    noIndigena: 24,
    familias: [
      { familia: "Zamuco", personas: 2778, pueblos: [
        { pueblo: "Ybytoso", personas: 1819 },
        { pueblo: "Ayoreo", personas: 750 },
        { pueblo: "Tomaraho", personas: 209 },
      ] },
      { familia: "Lengua Maskoy", personas: 1604, pueblos: [
        { pueblo: "Angaite", personas: 708 },
        { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 415 },
        { pueblo: "Guana", personas: 284 },
        { pueblo: "Sanapana", personas: 195 },
        { pueblo: "Enlhet Norte", personas: 1 },
        { pueblo: "Enxet Sur", personas: 1 },
      ] },
      { familia: "Mataco Mataguayo", personas: 5, pueblos: [
        { pueblo: "Nivacle", personas: 4 },
        { pueblo: "Maka", personas: 1 },
      ] },
      { familia: "Guarani", personas: 4, pueblos: [
        { pueblo: "Ava Guarani", personas: 2 },
        { pueblo: "Pai Tavytera", personas: 2 },
      ] },
      { familia: "Guaicuru", personas: 1, pueblos: [
        { pueblo: "Qom", personas: 1 },
      ] },
    ],
    distritos: [
    { distrito: "Puerto Casado", censadas: 1776, localidades: [
      { nombre: "Livio Farina", urbana: true, pueblos: [4,5,15,1,6,16,19], censadas: 276, viviendas: 64 },
      { nombre: "Riacho Mosquito", urbana: false, pueblos: [15,1,6,16,12,18], censadas: 435, viviendas: 120 },
      { nombre: "Castilla", urbana: false, pueblos: [15,1,6,16,12], censadas: 213, viviendas: 54 },
      { nombre: "San Isidro - Km 39", urbana: false, pueblos: [15,1,6,16], censadas: 93, viviendas: 23 },
      { nombre: "Maria Auxiliadora Km 40", urbana: false, pueblos: [1,16], censadas: 99, viviendas: 22 },
      { nombre: "Machete Vaina", urbana: false, pueblos: [13,15,1,6,16], censadas: 247, viviendas: 69 },
      { nombre: "Boqueron Kue", urbana: false, pueblos: [15,1,6,16], censadas: 252, viviendas: 63 },
      { nombre: "Arocojnadi", urbana: false, pueblos: [3,14], censadas: 43, viviendas: 14 },
      { nombre: "Chaidi", urbana: false, pueblos: [3,19], censadas: 118, viviendas: 34 },
    ] },
    { distrito: "Bahia Negra", censadas: 1322, localidades: [
      { nombre: "Karchabalut - 14 de Mayo", urbana: false, pueblos: [18], censadas: 67, viviendas: 25 },
      { nombre: "Puerto Diana", urbana: false, pueblos: [2,18,17,19], censadas: 820, viviendas: 263 },
      { nombre: "Inihta - Puerto Esperanza", urbana: false, pueblos: [2,3,18], censadas: 406, viviendas: 103 },
      { nombre: "Sabywut - Puerto Pollo", urbana: false, pueblos: [12,18], censadas: 29, viviendas: 8 },
    ] },
    { distrito: "Fuerte Olimpo", censadas: 728, localidades: [
      { nombre: "Virgen Santisima", urbana: true, pueblos: [3,18,19], censadas: 324, viviendas: 100 },
      { nombre: "Puerto Maria Elena - Pitiantuta", urbana: false, pueblos: [18,17,19], censadas: 211, viviendas: 71 },
      { nombre: "La Abundancia", urbana: false, pueblos: [3,18,19], censadas: 193, viviendas: 62 },
    ] },
    { distrito: "Carmelo Peralta", censadas: 590, localidades: [
      { nombre: "Guida Ichai", urbana: false, pueblos: [3,19], censadas: 52, viviendas: 20 },
      { nombre: "Puerto Maria Auxiliadora - Isla Alta", urbana: false, pueblos: [3,19], censadas: 56, viviendas: 21 },
      { nombre: "Cucaani", urbana: false, pueblos: [3], censadas: 25, viviendas: 9 },
      { nombre: "Nueva Esperanza", urbana: false, pueblos: [3], censadas: 59, viviendas: 27 },
      { nombre: "Punta", urbana: false, pueblos: [3,19], censadas: 109, viviendas: 48 },
      { nombre: "Tiogai", urbana: false, pueblos: [3], censadas: 48, viviendas: 23 },
      { nombre: "Atapi", urbana: false, pueblos: [9,3], censadas: 43, viviendas: 22 },
      { nombre: "Punta Euei", urbana: false, pueblos: [3], censadas: 97, viviendas: 37 },
      { nombre: "Dojobie", urbana: false, pueblos: [3], censadas: 35, viviendas: 15 },
      { nombre: "Ayugui", urbana: false, pueblos: [3], censadas: 66, viviendas: 31 },
    ] },
    ],
  },
];

/**
 * El país. `operativo` es lo que suman estas tablas; `total` es la cifra
 * oficial, que le agrega las 2.502 personas captadas por el Censo Nacional.
 */
export const CENSO_PY_PAIS = {
  total: 140049,
  operativo: 137547,
  porCarnet: 2502,
  indigena: 136302,
  noIndigena: 1245,
  /** Población del país según el Censo Nacional 2022, la otra punta del 2,3%. */
  poblacionPais: 6109903,
  pueblos: 19,
  familias: 5,
  localidades: 834,
  viviendas: 39093,
  viviendasColectivas: 20,
  /** Comunidades del Censo Comunitario, que es otra unidad y otro cuadro. */
  comunidades: 557,
  comunidadesConPersoneria: 494,
} as const;

/** El país abierto por pueblo, para contrastar con el departamento. */
export const CENSO_PY_PUEBLOS: CensoPyPueblo[] = [
  { pueblo: "Mbya Guarani", personas: 28278 },
  { pueblo: "Ava Guarani", personas: 22705 },
  { pueblo: "Nivacle", personas: 18280 },
  { pueblo: "Pai Tavytera", personas: 15705 },
  { pueblo: "Enlhet Norte", personas: 9874 },
  { pueblo: "Enxet Sur", personas: 8189 },
  { pueblo: "Angaite", personas: 7239 },
  { pueblo: "Guarani Occidental / Pueblo Guarani", personas: 4090 },
  { pueblo: "Sanapana", personas: 3523 },
  { pueblo: "Guarani Nandeva", personas: 3124 },
  { pueblo: "Ache", personas: 2604 },
  { pueblo: "Ayoreo", personas: 2520 },
  { pueblo: "Toba Maskoy / Toba Enenlhet", personas: 2371 },
  { pueblo: "Ybytoso", personas: 2236 },
  { pueblo: "Qom", personas: 2198 },
  { pueblo: "Maka", personas: 2166 },
  { pueblo: "Guana", personas: 556 },
  { pueblo: "Manjui", personas: 431 },
  { pueblo: "Tomaraho", personas: 213 },
];
