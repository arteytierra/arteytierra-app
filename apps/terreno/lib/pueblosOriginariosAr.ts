import type { RegistroProvincia } from './pueblosOriginarios';

/**
 * GENERADO. No editar a mano.
 *
 * Lo arma `_research/pueblos-originarios-argentina/build-pueblos-argentina.mjs`
 * desde el listado de comunidades indígenas del INAI (distribución del
 * 23/02/2024, CC BY 4.0). Las decisiones de normalización —qué se parte, qué se
 * corrige y qué se deja como está— viven en ese script y están explicadas ahí.
 *
 * 1878 comunidades registradas, 23 provincias, 229 departamentos,
 * 50 rótulos de pueblo.
 *
 * Lo que este archivo NO dice, y hay que decirlo cada vez que se muestra: una
 * provincia o un departamento que no figura acá no es un territorio sin pueblos
 * originarios. Es un territorio sin comunidades **registradas** en el Re.Na.C.I.
 * ni relevadas por el Re.Te.C.I. El registro depende de que la comunidad haya
 * iniciado y sostenido un trámite, así que su ausencia habla del trámite y no
 * de la gente.
 */
export const REGISTRO_AR: RegistroProvincia[] = [
  {
    provincia: "Buenos Aires",
    comunidades: 70,
    conPersoneria: 66,
    relevamiento: { culminado: 34, iniciado: 1, en_tramite: 1, sin_relevar: 34, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mapuche", comunidades: 19 },
      { pueblo: "Qom (Toba)", comunidades: 16 },
      { pueblo: "Guaraní", comunidades: 8 },
      { pueblo: "Tupí Guaraní", comunidades: 7 },
      { pueblo: "Kolla", comunidades: 5 },
      { pueblo: "Mapuche Tehuelche", comunidades: 5 },
      { pueblo: "Ava Guaraní", comunidades: 3 },
      { pueblo: "Quechua", comunidades: 2 },
      { pueblo: "kolla - Qom - otros (Multietnica)", comunidades: 1 },
      { pueblo: "Mbya Guaraní", comunidades: 1 },
      { pueblo: "Moqoit (Mocoví)", comunidades: 1 },
      { pueblo: "Multiétnica (Diaguita - Kolla - Quechua - Guaraní - Mapuche, Qom y otros)", comunidades: 1 },
      { pueblo: "Rankel", comunidades: 1 },
      { pueblo: "Tonokoté", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "25 de Mayo",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Adolfo Alsina",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Almirante Brown",
        comunidades: 4,
        pueblos: [{ pueblo: "Ava Guaraní", comunidades: 1 }, { pueblo: "Kolla", comunidades: 1 }, { pueblo: "Qom (Toba)", comunidades: 1 }, { pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Azul",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Bahía Blanca",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Berisso",
        comunidades: 2,
        pueblos: [{ pueblo: "Kolla", comunidades: 1 }, { pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "Bragado",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Escobar",
        comunidades: 1,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Esteban Echeverría",
        comunidades: 2,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }, { pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Florencio Varela",
        comunidades: 1,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }],
      },
      {
        departamento: "General San Martín",
        comunidades: 1,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }],
      },
      {
        departamento: "General Viamonte",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche", comunidades: 6 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Hurlingham",
        comunidades: 1,
        pueblos: [{ pueblo: "Quechua", comunidades: 1 }],
      },
      {
        departamento: "José C. Paz",
        comunidades: 3,
        pueblos: [{ pueblo: "Guaraní", comunidades: 2 }, { pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Junín",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "La Matanza",
        comunidades: 7,
        pueblos: [{ pueblo: "Tupí Guaraní", comunidades: 3 }, { pueblo: "Ava Guaraní", comunidades: 1 }, { pueblo: "Guaraní", comunidades: 1 }, { pueblo: "Kolla", comunidades: 1 }, { pueblo: "Multiétnica (Diaguita - Kolla - Quechua - Guaraní - Mapuche, Qom y otros)", comunidades: 1 }],
      },
      {
        departamento: "La Plata",
        comunidades: 10,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 6 }, { pueblo: "Ava Guaraní", comunidades: 1 }, { pueblo: "Kolla", comunidades: 1 }, { pueblo: "Mapuche", comunidades: 1 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Lanús",
        comunidades: 1,
        pueblos: [{ pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Lincoln",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }, { pueblo: "Rankel", comunidades: 1 }],
      },
      {
        departamento: "Malvinas Argentinas",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Marcos Paz",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Moreno",
        comunidades: 1,
        pueblos: [{ pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Olavarría",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Patagones",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Pilar",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Quilmes",
        comunidades: 7,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 4 }, { pueblo: "Guaraní", comunidades: 2 }, { pueblo: "Tonokoté", comunidades: 1 }],
      },
      {
        departamento: "San Miguel",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "San Nicolás",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "San Pedro",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Tigre",
        comunidades: 2,
        pueblos: [{ pueblo: "kolla - Qom - otros (Multietnica)", comunidades: 1 }, { pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Trenque Lauquen",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Vicente López",
        comunidades: 1,
        pueblos: [{ pueblo: "Quechua", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Catamarca",
    comunidades: 11,
    conPersoneria: 11,
    relevamiento: { culminado: 2, iniciado: 0, en_tramite: 0, sin_relevar: 9, sin_dato: 0 },
    pueblos: [
      { pueblo: "Diaguita", comunidades: 7 },
      { pueblo: "Diaguita Calchaquí", comunidades: 3 },
      { pueblo: "Kolla Atacameño", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Andalgalá",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita", comunidades: 1 }],
      },
      {
        departamento: "Antofagasta de la Sierra",
        comunidades: 1,
        pueblos: [{ pueblo: "Kolla Atacameño", comunidades: 1 }],
      },
      {
        departamento: "Belén",
        comunidades: 7,
        pueblos: [{ pueblo: "Diaguita", comunidades: 5 }, { pueblo: "Diaguita Calchaquí", comunidades: 2 }],
      },
      {
        departamento: "Santa María",
        comunidades: 2,
        pueblos: [{ pueblo: "Diaguita", comunidades: 1 }, { pueblo: "Diaguita Calchaquí", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Chaco",
    comunidades: 122,
    conPersoneria: 97,
    relevamiento: { culminado: 40, iniciado: 11, en_tramite: 8, sin_relevar: 63, sin_dato: 0 },
    pueblos: [
      { pueblo: "Qom (Toba)", comunidades: 83 },
      { pueblo: "Wichí", comunidades: 23 },
      { pueblo: "Moqoit (Mocoví)", comunidades: 16 },
    ],
    departamentos: [
      {
        departamento: "12 de Octubre",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "1º de Mayo",
        comunidades: 2,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "25 de Mayo",
        comunidades: 2,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "Almirante Brown",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "Bermejo",
        comunidades: 14,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 14 }],
      },
      {
        departamento: "Chacabuco",
        comunidades: 2,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 2 }],
      },
      {
        departamento: "General Donovan",
        comunidades: 6,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 6 }],
      },
      {
        departamento: "General Güemes",
        comunidades: 42,
        pueblos: [{ pueblo: "Wichí", comunidades: 23 }, { pueblo: "Qom (Toba)", comunidades: 19 }],
      },
      {
        departamento: "Libertad",
        comunidades: 2,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "Libertador General San Martín",
        comunidades: 18,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 18 }],
      },
      {
        departamento: "Maipú",
        comunidades: 2,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "Mayor Luis J. Fontana",
        comunidades: 6,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 5 }, { pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "O' Higgins",
        comunidades: 4,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 4 }],
      },
      {
        departamento: "Presidencia de la Plaza",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "Quitilipi",
        comunidades: 3,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }, { pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "San Fernando",
        comunidades: 14,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 14 }],
      },
      {
        departamento: "San Lorenzo",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "Tapenagá",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Chubut",
    comunidades: 113,
    conPersoneria: 109,
    relevamiento: { culminado: 54, iniciado: 6, en_tramite: 9, sin_relevar: 44, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mapuche", comunidades: 70 },
      { pueblo: "Mapuche Tehuelche", comunidades: 30 },
      { pueblo: "Tehuelche", comunidades: 11 },
      { pueblo: "Günün a küna", comunidades: 1 },
      { pueblo: "Tehuelche Mapuche", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Biedma",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 4 }, { pueblo: "Günün a küna", comunidades: 1 }, { pueblo: "Mapuche", comunidades: 1 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Cushamen",
        comunidades: 40,
        pueblos: [{ pueblo: "Mapuche", comunidades: 32 }, { pueblo: "Mapuche Tehuelche", comunidades: 8 }],
      },
      {
        departamento: "Escalante",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Futaleufú",
        comunidades: 11,
        pueblos: [{ pueblo: "Mapuche", comunidades: 10 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Gaiman",
        comunidades: 5,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 2 }, { pueblo: "Tehuelche", comunidades: 2 }, { pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Gastre",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }, { pueblo: "Mapuche Tehuelche", comunidades: 2 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Languiñeo",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 5 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Paso de Indios",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }, { pueblo: "Mapuche Tehuelche", comunidades: 3 }],
      },
      {
        departamento: "Rawson",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 4 }, { pueblo: "Mapuche", comunidades: 2 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Río Senguer",
        comunidades: 9,
        pueblos: [{ pueblo: "Mapuche", comunidades: 4 }, { pueblo: "Tehuelche", comunidades: 3 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }, { pueblo: "Tehuelche Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Sarmiento",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }, { pueblo: "Mapuche Tehuelche", comunidades: 3 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Tehuelches",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Telsen",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
    ],
  },
  {
    provincia: "Córdoba",
    comunidades: 14,
    conPersoneria: 10,
    relevamiento: { culminado: 12, iniciado: 0, en_tramite: 0, sin_relevar: 2, sin_dato: 0 },
    pueblos: [
      { pueblo: "Comechingón", comunidades: 12 },
      { pueblo: "Kolla", comunidades: 1 },
      { pueblo: "Ranquel", comunidades: 1 },
      { pueblo: "Sanavirón", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Capital",
        comunidades: 3,
        pueblos: [{ pueblo: "Comechingón", comunidades: 2 }, { pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Colón",
        comunidades: 2,
        pueblos: [{ pueblo: "Comechingón", comunidades: 2 }],
      },
      {
        departamento: "Cruz del Eje",
        comunidades: 3,
        pueblos: [{ pueblo: "Comechingón", comunidades: 3 }, { pueblo: "Sanavirón", comunidades: 1 }],
      },
      {
        departamento: "General Roca",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "General San Martín",
        comunidades: 1,
        pueblos: [{ pueblo: "Comechingón", comunidades: 1 }],
      },
      {
        departamento: "Punilla",
        comunidades: 3,
        pueblos: [{ pueblo: "Comechingón", comunidades: 3 }],
      },
      {
        departamento: "Río Cuarto",
        comunidades: 1,
        pueblos: [{ pueblo: "Comechingón", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Corrientes",
    comunidades: 4,
    conPersoneria: 4,
    relevamiento: { culminado: 0, iniciado: 2, en_tramite: 0, sin_relevar: 2, sin_dato: 0 },
    pueblos: [
      { pueblo: "Guaraní", comunidades: 4 },
    ],
    departamentos: [
      {
        departamento: "Concepción",
        comunidades: 1,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Ituzaingó",
        comunidades: 2,
        pueblos: [{ pueblo: "Guaraní", comunidades: 2 }],
      },
      {
        departamento: "San Miguel",
        comunidades: 1,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Entre Ríos",
    comunidades: 3,
    conPersoneria: 3,
    relevamiento: { culminado: 2, iniciado: 0, en_tramite: 0, sin_relevar: 1, sin_dato: 0 },
    pueblos: [
      { pueblo: "Charrúa", comunidades: 3 },
    ],
    departamentos: [
      {
        departamento: "Federal",
        comunidades: 1,
        pueblos: [{ pueblo: "Charrúa", comunidades: 1 }],
      },
      {
        departamento: "Tala",
        comunidades: 1,
        pueblos: [{ pueblo: "Charrúa", comunidades: 1 }],
      },
      {
        departamento: "Villaguay",
        comunidades: 1,
        pueblos: [{ pueblo: "Charrúa", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Formosa",
    comunidades: 160,
    conPersoneria: 150,
    relevamiento: { culminado: 1, iniciado: 62, en_tramite: 24, sin_relevar: 73, sin_dato: 0 },
    pueblos: [
      { pueblo: "Wichí", comunidades: 69 },
      { pueblo: "Qom (Toba)", comunidades: 66 },
      { pueblo: "Pilagá", comunidades: 27 },
    ],
    departamentos: [
      {
        departamento: "Bermejo",
        comunidades: 25,
        pueblos: [{ pueblo: "Wichí", comunidades: 15 }, { pueblo: "Qom (Toba)", comunidades: 9 }, { pueblo: "Pilagá", comunidades: 1 }],
      },
      {
        departamento: "Formosa",
        comunidades: 16,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 16 }],
      },
      {
        departamento: "Laishi",
        comunidades: 7,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 7 }],
      },
      {
        departamento: "Matacos",
        comunidades: 17,
        pueblos: [{ pueblo: "Wichí", comunidades: 15 }, { pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "Patiño",
        comunidades: 46,
        pueblos: [{ pueblo: "Pilagá", comunidades: 26 }, { pueblo: "Qom (Toba)", comunidades: 13 }, { pueblo: "Wichí", comunidades: 9 }],
      },
      {
        departamento: "Pilagás",
        comunidades: 2,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 2 }],
      },
      {
        departamento: "Pilcomayo",
        comunidades: 8,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 8 }],
      },
      {
        departamento: "Pirané",
        comunidades: 6,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 6 }],
      },
      {
        departamento: "Ramón Lista",
        comunidades: 33,
        pueblos: [{ pueblo: "Wichí", comunidades: 30 }, { pueblo: "Qom (Toba)", comunidades: 3 }],
      },
    ],
  },
  {
    provincia: "Jujuy",
    comunidades: 298,
    conPersoneria: 270,
    relevamiento: { culminado: 178, iniciado: 11, en_tramite: 30, sin_relevar: 79, sin_dato: 0 },
    pueblos: [
      { pueblo: "Kolla", comunidades: 150 },
      { pueblo: "Omaguaca", comunidades: 47 },
      { pueblo: "Guaraní", comunidades: 45 },
      { pueblo: "Quechua", comunidades: 21 },
      { pueblo: "Atacama", comunidades: 10 },
      { pueblo: "Ocloya", comunidades: 10 },
      { pueblo: "Ava Guaraní", comunidades: 5 },
      { pueblo: "Tilián", comunidades: 4 },
      { pueblo: "Fiscara", comunidades: 2 },
      { pueblo: "Chané", comunidades: 1 },
      { pueblo: "Chicha", comunidades: 1 },
      { pueblo: "Chulupí (Nivaclé)", comunidades: 1 },
      { pueblo: "Qom (Toba)", comunidades: 1 },
      { pueblo: "Toara", comunidades: 1 },
      { pueblo: "Tupí Guaraní", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Cochinoca",
        comunidades: 43,
        pueblos: [{ pueblo: "Kolla", comunidades: 41 }, { pueblo: "Omaguaca", comunidades: 1 }, { pueblo: "Toara", comunidades: 1 }],
      },
      {
        departamento: "Dr. Manuel Belgrano",
        comunidades: 13,
        pueblos: [{ pueblo: "Kolla", comunidades: 7 }, { pueblo: "Ocloya", comunidades: 6 }],
      },
      {
        departamento: "El Carmen",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Humahuaca",
        comunidades: 45,
        pueblos: [{ pueblo: "Omaguaca", comunidades: 43 }, { pueblo: "Kolla", comunidades: 2 }, { pueblo: "Chulupí (Nivaclé)", comunidades: 1 }],
      },
      {
        departamento: "Ledesma",
        comunidades: 24,
        pueblos: [{ pueblo: "Guaraní", comunidades: 18 }, { pueblo: "Kolla", comunidades: 3 }, { pueblo: "Ava Guaraní", comunidades: 2 }, { pueblo: "Chané", comunidades: 1 }, { pueblo: "Ocloya", comunidades: 1 }],
      },
      {
        departamento: "Palpalá",
        comunidades: 2,
        pueblos: [{ pueblo: "Guaraní", comunidades: 1 }, { pueblo: "Ocloya", comunidades: 1 }],
      },
      {
        departamento: "Rinconada",
        comunidades: 15,
        pueblos: [{ pueblo: "Kolla", comunidades: 14 }, { pueblo: "Quechua", comunidades: 1 }],
      },
      {
        departamento: "San Pedro",
        comunidades: 17,
        pueblos: [{ pueblo: "Guaraní", comunidades: 15 }, { pueblo: "Ava Guaraní", comunidades: 1 }, { pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Santa Bárbara",
        comunidades: 12,
        pueblos: [{ pueblo: "Guaraní", comunidades: 10 }, { pueblo: "Ava Guaraní", comunidades: 2 }],
      },
      {
        departamento: "Santa Catalina",
        comunidades: 21,
        pueblos: [{ pueblo: "Quechua", comunidades: 20 }, { pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Susques",
        comunidades: 10,
        pueblos: [{ pueblo: "Atacama", comunidades: 10 }],
      },
      {
        departamento: "Tilcara",
        comunidades: 27,
        pueblos: [{ pueblo: "Kolla", comunidades: 23 }, { pueblo: "Fiscara", comunidades: 2 }, { pueblo: "Ocloya", comunidades: 1 }, { pueblo: "Omaguaca", comunidades: 1 }],
      },
      {
        departamento: "Tumbaya",
        comunidades: 21,
        pueblos: [{ pueblo: "Kolla", comunidades: 14 }, { pueblo: "Tilián", comunidades: 4 }, { pueblo: "Omaguaca", comunidades: 2 }, { pueblo: "Ocloya", comunidades: 1 }],
      },
      {
        departamento: "Valle Grande",
        comunidades: 6,
        pueblos: [{ pueblo: "Kolla", comunidades: 5 }, { pueblo: "Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Yavi",
        comunidades: 41,
        pueblos: [{ pueblo: "Kolla", comunidades: 40 }, { pueblo: "Chicha", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "La Pampa",
    comunidades: 19,
    conPersoneria: 19,
    relevamiento: { culminado: 12, iniciado: 0, en_tramite: 1, sin_relevar: 6, sin_dato: 0 },
    pueblos: [
      { pueblo: "Ranquel", comunidades: 18 },
      { pueblo: "Mapuche", comunidades: 2 },
    ],
    departamentos: [
      {
        departamento: "Capital",
        comunidades: 6,
        pueblos: [{ pueblo: "Ranquel", comunidades: 5 }, { pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Chalileo",
        comunidades: 2,
        pueblos: [{ pueblo: "Ranquel", comunidades: 2 }],
      },
      {
        departamento: "Chical Co",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Conhelo",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Loventué",
        comunidades: 2,
        pueblos: [{ pueblo: "Ranquel", comunidades: 2 }],
      },
      {
        departamento: "Puelén",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Rancul",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Realicó",
        comunidades: 1,
        pueblos: [{ pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Toay",
        comunidades: 2,
        pueblos: [{ pueblo: "Ranquel", comunidades: 2 }, { pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Utracán",
        comunidades: 2,
        pueblos: [{ pueblo: "Ranquel", comunidades: 2 }],
      },
    ],
  },
  {
    provincia: "La Rioja",
    comunidades: 1,
    conPersoneria: 1,
    relevamiento: { culminado: 0, iniciado: 0, en_tramite: 0, sin_relevar: 1, sin_dato: 0 },
    pueblos: [
      { pueblo: "Diaguita", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Coronel Felipe Varela",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Mendoza",
    comunidades: 35,
    conPersoneria: 26,
    relevamiento: { culminado: 12, iniciado: 4, en_tramite: 4, sin_relevar: 15, sin_dato: 0 },
    pueblos: [
      { pueblo: "Huarpe", comunidades: 15 },
      { pueblo: "Mapuche", comunidades: 15 },
      { pueblo: "Mapuche Pehuenche", comunidades: 3 },
      { pueblo: "Kolla", comunidades: 1 },
      { pueblo: "Ranquel", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Junín",
        comunidades: 1,
        pueblos: [{ pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Las Heras",
        comunidades: 4,
        pueblos: [{ pueblo: "Huarpe", comunidades: 2 }, { pueblo: "Mapuche Pehuenche", comunidades: 1 }, { pueblo: "Ranquel", comunidades: 1 }],
      },
      {
        departamento: "Lavalle",
        comunidades: 12,
        pueblos: [{ pueblo: "Huarpe", comunidades: 12 }],
      },
      {
        departamento: "Malargüe",
        comunidades: 14,
        pueblos: [{ pueblo: "Mapuche", comunidades: 12 }, { pueblo: "Mapuche Pehuenche", comunidades: 2 }],
      },
      {
        departamento: "San Rafael",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Santa Rosa",
        comunidades: 1,
        pueblos: [{ pueblo: "Huarpe", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Misiones",
    comunidades: 126,
    conPersoneria: 86,
    relevamiento: { culminado: 93, iniciado: 2, en_tramite: 6, sin_relevar: 25, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mbya Guaraní", comunidades: 126 },
    ],
    departamentos: [
      {
        departamento: "25 de mayo",
        comunidades: 2,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 2 }],
      },
      {
        departamento: "25 de Mayo",
        comunidades: 2,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 2 }],
      },
      {
        departamento: "Cainguás",
        comunidades: 11,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 11 }],
      },
      {
        departamento: "Candelaria",
        comunidades: 5,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 5 }],
      },
      {
        departamento: "Concepción",
        comunidades: 3,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 3 }],
      },
      {
        departamento: "Eldorado",
        comunidades: 4,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 4 }],
      },
      {
        departamento: "General Manuel Belgrano",
        comunidades: 2,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 2 }],
      },
      {
        departamento: "Guaraní",
        comunidades: 21,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 21 }],
      },
      {
        departamento: "Iguazú",
        comunidades: 10,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 10 }],
      },
      {
        departamento: "Libertador Grl. San Martín",
        comunidades: 25,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 25 }],
      },
      {
        departamento: "Montecarlo",
        comunidades: 9,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 9 }],
      },
      {
        departamento: "Oberá",
        comunidades: 2,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 2 }],
      },
      {
        departamento: "San Ignacio",
        comunidades: 19,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 19 }],
      },
      {
        departamento: "San Javier",
        comunidades: 1,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 1 }],
      },
      {
        departamento: "San Pedro",
        comunidades: 10,
        pueblos: [{ pueblo: "Mbya Guaraní", comunidades: 10 }],
      },
    ],
  },
  {
    provincia: "Neuquén",
    comunidades: 57,
    conPersoneria: 57,
    relevamiento: { culminado: 31, iniciado: 12, en_tramite: 3, sin_relevar: 11, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mapuche", comunidades: 56 },
      { pueblo: "Tehuelche", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Aluminé",
        comunidades: 9,
        pueblos: [{ pueblo: "Mapuche", comunidades: 9 }],
      },
      {
        departamento: "Añelo",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Catán Lil",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 6 }],
      },
      {
        departamento: "Collón Curá",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Confluencia",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 6 }],
      },
      {
        departamento: "Huiliches",
        comunidades: 6,
        pueblos: [{ pueblo: "Mapuche", comunidades: 6 }],
      },
      {
        departamento: "Lácar",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Loncopué",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Los Lagos",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Minas",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Ñorquin",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Ñorquín",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Pehuenches",
        comunidades: 1,
        pueblos: [{ pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Picún Leufú",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Picunches",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "Zapala",
        comunidades: 9,
        pueblos: [{ pueblo: "Mapuche", comunidades: 9 }],
      },
    ],
  },
  {
    provincia: "Río Negro",
    comunidades: 108,
    conPersoneria: 76,
    relevamiento: { culminado: 55, iniciado: 12, en_tramite: 10, sin_relevar: 31, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mapuche", comunidades: 104 },
      { pueblo: "Mapuche Tehuelche", comunidades: 3 },
      { pueblo: "Tehuelche", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "25 de Mayo",
        comunidades: 17,
        pueblos: [{ pueblo: "Mapuche", comunidades: 17 }],
      },
      {
        departamento: "9 de Julio",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Adolfo Alsina",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 2 }],
      },
      {
        departamento: "Avellaneda",
        comunidades: 3,
        pueblos: [{ pueblo: "Mapuche", comunidades: 3 }],
      },
      {
        departamento: "Bariloche",
        comunidades: 25,
        pueblos: [{ pueblo: "Mapuche", comunidades: 25 }],
      },
      {
        departamento: "El Cuy",
        comunidades: 5,
        pueblos: [{ pueblo: "Mapuche", comunidades: 5 }],
      },
      {
        departamento: "General Roca",
        comunidades: 18,
        pueblos: [{ pueblo: "Mapuche", comunidades: 16 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Ñorquincó",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche", comunidades: 6 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Pilcaniyeu",
        comunidades: 14,
        pueblos: [{ pueblo: "Mapuche", comunidades: 14 }],
      },
      {
        departamento: "San Antonio",
        comunidades: 5,
        pueblos: [{ pueblo: "Mapuche", comunidades: 5 }],
      },
      {
        departamento: "Valcheta",
        comunidades: 9,
        pueblos: [{ pueblo: "Mapuche", comunidades: 8 }, { pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Salta",
    comunidades: 521,
    conPersoneria: 476,
    relevamiento: { culminado: 301, iniciado: 12, en_tramite: 21, sin_relevar: 183, sin_dato: 4 },
    pueblos: [
      { pueblo: "Wichí", comunidades: 204 },
      { pueblo: "Kolla", comunidades: 92 },
      { pueblo: "Guaraní", comunidades: 90 },
      { pueblo: "Diaguita Calchaquí", comunidades: 37 },
      { pueblo: "Chorote", comunidades: 27 },
      { pueblo: "Ava Guaraní", comunidades: 23 },
      { pueblo: "Qom (Toba)", comunidades: 19 },
      { pueblo: "Tastil", comunidades: 12 },
      { pueblo: "Atacama", comunidades: 9 },
      { pueblo: "Chané", comunidades: 7 },
      { pueblo: "Tupí Guaraní", comunidades: 5 },
      { pueblo: "Iogys", comunidades: 3 },
      { pueblo: "Tapiete", comunidades: 3 },
      { pueblo: "Chulupí (Nivaclé)", comunidades: 2 },
      { pueblo: "Diaguita", comunidades: 2 },
      { pueblo: "Lule", comunidades: 2 },
      { pueblo: "Chiriguano", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Anta",
        comunidades: 10,
        pueblos: [{ pueblo: "Wichí", comunidades: 10 }, { pueblo: "Diaguita Calchaquí", comunidades: 1 }, { pueblo: "Lule", comunidades: 1 }],
      },
      {
        departamento: "Cachi",
        comunidades: 8,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 8 }],
      },
      {
        departamento: "Cafayate",
        comunidades: 3,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 3 }],
      },
      {
        departamento: "Capital",
        comunidades: 3,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 2 }, { pueblo: "Lule", comunidades: 1 }],
      },
      {
        departamento: "Chicoana",
        comunidades: 2,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 2 }],
      },
      {
        departamento: "Grl. José de San Martín",
        comunidades: 242,
        pueblos: [{ pueblo: "Wichí", comunidades: 126 }, { pueblo: "Guaraní", comunidades: 69 }, { pueblo: "Chorote", comunidades: 17 }, { pueblo: "Qom (Toba)", comunidades: 16 }, { pueblo: "Chané", comunidades: 7 }, { pueblo: "Tupí Guaraní", comunidades: 4 }, { pueblo: "Iogys", comunidades: 3 }, { pueblo: "Tapiete", comunidades: 3 }, { pueblo: "Ava Guaraní", comunidades: 2 }, { pueblo: "Kolla", comunidades: 2 }, { pueblo: "Chiriguano", comunidades: 1 }, { pueblo: "Chulupí (Nivaclé)", comunidades: 1 }],
      },
      {
        departamento: "Iruya",
        comunidades: 25,
        pueblos: [{ pueblo: "Kolla", comunidades: 25 }],
      },
      {
        departamento: "La Caldera",
        comunidades: 1,
        pueblos: [{ pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "La Poma",
        comunidades: 10,
        pueblos: [{ pueblo: "Atacama", comunidades: 7 }, { pueblo: "Diaguita Calchaquí", comunidades: 2 }, { pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Los Andes",
        comunidades: 11,
        pueblos: [{ pueblo: "Kolla", comunidades: 9 }, { pueblo: "Atacama", comunidades: 2 }],
      },
      {
        departamento: "Metán",
        comunidades: 2,
        pueblos: [{ pueblo: "Wichí", comunidades: 2 }],
      },
      {
        departamento: "Molinos",
        comunidades: 14,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 13 }, { pueblo: "Diaguita", comunidades: 1 }],
      },
      {
        departamento: "Orán",
        comunidades: 57,
        pueblos: [{ pueblo: "Ava Guaraní", comunidades: 21 }, { pueblo: "Guaraní", comunidades: 21 }, { pueblo: "Kolla", comunidades: 11 }, { pueblo: "Wichí", comunidades: 5 }, { pueblo: "Chorote", comunidades: 1 }, { pueblo: "Tupí Guaraní", comunidades: 1 }],
      },
      {
        departamento: "Rivadavia",
        comunidades: 72,
        pueblos: [{ pueblo: "Wichí", comunidades: 61 }, { pueblo: "Chorote", comunidades: 9 }, { pueblo: "Qom (Toba)", comunidades: 3 }, { pueblo: "Chulupí (Nivaclé)", comunidades: 1 }, { pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "Rosario de Lerma",
        comunidades: 17,
        pueblos: [{ pueblo: "Tastil", comunidades: 12 }, { pueblo: "Kolla", comunidades: 4 }, { pueblo: "Diaguita Calchaquí", comunidades: 1 }],
      },
      {
        departamento: "San Carlos",
        comunidades: 6,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 5 }, { pueblo: "Diaguita", comunidades: 1 }],
      },
      {
        departamento: "Santa Victoria",
        comunidades: 38,
        pueblos: [{ pueblo: "Kolla", comunidades: 38 }],
      },
    ],
  },
  {
    provincia: "San Juan",
    comunidades: 13,
    conPersoneria: 6,
    relevamiento: { culminado: 11, iniciado: 2, en_tramite: 0, sin_relevar: 0, sin_dato: 0 },
    pueblos: [
      { pueblo: "Huarpe", comunidades: 10 },
      { pueblo: "Diaguita", comunidades: 3 },
    ],
    departamentos: [
      {
        departamento: "25 de Mayo",
        comunidades: 3,
        pueblos: [{ pueblo: "Huarpe", comunidades: 3 }],
      },
      {
        departamento: "Caucete",
        comunidades: 4,
        pueblos: [{ pueblo: "Huarpe", comunidades: 4 }],
      },
      {
        departamento: "Rivadavia",
        comunidades: 1,
        pueblos: [{ pueblo: "Huarpe", comunidades: 1 }],
      },
      {
        departamento: "Sarmiento",
        comunidades: 1,
        pueblos: [{ pueblo: "Huarpe", comunidades: 1 }],
      },
      {
        departamento: "Valle Fértil",
        comunidades: 4,
        pueblos: [{ pueblo: "Diaguita", comunidades: 3 }, { pueblo: "Huarpe", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "San Luis",
    comunidades: 3,
    conPersoneria: 3,
    relevamiento: { culminado: 0, iniciado: 0, en_tramite: 0, sin_relevar: 3, sin_dato: 0 },
    pueblos: [
      { pueblo: "Ranquel", comunidades: 2 },
      { pueblo: "Huarpe", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Belgrano",
        comunidades: 1,
        pueblos: [{ pueblo: "Huarpe", comunidades: 1 }],
      },
      {
        departamento: "General Pedernera",
        comunidades: 2,
        pueblos: [{ pueblo: "Ranquel", comunidades: 2 }],
      },
    ],
  },
  {
    provincia: "Santa Cruz",
    comunidades: 10,
    conPersoneria: 8,
    relevamiento: { culminado: 7, iniciado: 0, en_tramite: 1, sin_relevar: 2, sin_dato: 0 },
    pueblos: [
      { pueblo: "Mapuche Tehuelche", comunidades: 4 },
      { pueblo: "Mapuche", comunidades: 3 },
      { pueblo: "Tehuelche", comunidades: 3 },
    ],
    departamentos: [
      {
        departamento: "Corpen Aike",
        comunidades: 1,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 1 }],
      },
      {
        departamento: "Deseado",
        comunidades: 7,
        pueblos: [{ pueblo: "Mapuche Tehuelche", comunidades: 3 }, { pueblo: "Mapuche", comunidades: 2 }, { pueblo: "Tehuelche", comunidades: 2 }],
      },
      {
        departamento: "Güer Aike",
        comunidades: 2,
        pueblos: [{ pueblo: "Mapuche", comunidades: 1 }, { pueblo: "Tehuelche", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Santa Fe",
    comunidades: 67,
    conPersoneria: 58,
    relevamiento: { culminado: 34, iniciado: 6, en_tramite: 3, sin_relevar: 24, sin_dato: 0 },
    pueblos: [
      { pueblo: "Moqoit (Mocoví)", comunidades: 48 },
      { pueblo: "Qom (Toba)", comunidades: 16 },
      { pueblo: "Kolla", comunidades: 3 },
      { pueblo: "Corundí", comunidades: 1 },
      { pueblo: "Diaguita", comunidades: 1 },
      { pueblo: "Mapuche", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "9 de Julio",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "Castellanos",
        comunidades: 1,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 1 }],
      },
      {
        departamento: "Constitución",
        comunidades: 2,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 2 }],
      },
      {
        departamento: "Garay",
        comunidades: 10,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 10 }],
      },
      {
        departamento: "General López",
        comunidades: 8,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 7 }, { pueblo: "Kolla", comunidades: 1 }],
      },
      {
        departamento: "General Obligado",
        comunidades: 10,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 7 }, { pueblo: "Qom (Toba)", comunidades: 5 }],
      },
      {
        departamento: "Iriondo",
        comunidades: 1,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 1 }],
      },
      {
        departamento: "La Capital",
        comunidades: 6,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 3 }, { pueblo: "Qom (Toba)", comunidades: 2 }, { pueblo: "Diaguita", comunidades: 1 }],
      },
      {
        departamento: "Rosario",
        comunidades: 17,
        pueblos: [{ pueblo: "Qom (Toba)", comunidades: 8 }, { pueblo: "Moqoit (Mocoví)", comunidades: 7 }, { pueblo: "Kolla", comunidades: 2 }, { pueblo: "Mapuche", comunidades: 1 }],
      },
      {
        departamento: "San Javier",
        comunidades: 6,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 6 }],
      },
      {
        departamento: "San Jerónimo",
        comunidades: 1,
        pueblos: [{ pueblo: "Corundí", comunidades: 1 }],
      },
      {
        departamento: "San Justo",
        comunidades: 2,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 2 }],
      },
      {
        departamento: "Vera",
        comunidades: 2,
        pueblos: [{ pueblo: "Moqoit (Mocoví)", comunidades: 2 }],
      },
    ],
  },
  {
    provincia: "Santiago del Estero",
    comunidades: 103,
    conPersoneria: 71,
    relevamiento: { culminado: 93, iniciado: 2, en_tramite: 5, sin_relevar: 3, sin_dato: 0 },
    pueblos: [
      { pueblo: "Tonokoté", comunidades: 46 },
      { pueblo: "Diaguita (Cacano)", comunidades: 30 },
      { pueblo: "Lule Vilela", comunidades: 14 },
      { pueblo: "Vilela", comunidades: 9 },
      { pueblo: "Guaycurú", comunidades: 3 },
      { pueblo: "Sanavirón", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Alberdi",
        comunidades: 3,
        pueblos: [{ pueblo: "Lule Vilela", comunidades: 2 }, { pueblo: "Tonokoté", comunidades: 1 }],
      },
      {
        departamento: "Atamisqui",
        comunidades: 16,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 16 }],
      },
      {
        departamento: "Avellaneda",
        comunidades: 18,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 16 }, { pueblo: "Diaguita (Cacano)", comunidades: 2 }],
      },
      {
        departamento: "Banda",
        comunidades: 1,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 1 }],
      },
      {
        departamento: "Capital",
        comunidades: 2,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 2 }],
      },
      {
        departamento: "Choya",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 1 }],
      },
      {
        departamento: "Copo",
        comunidades: 8,
        pueblos: [{ pueblo: "Lule Vilela", comunidades: 8 }],
      },
      {
        departamento: "Figueroa",
        comunidades: 13,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 13 }],
      },
      {
        departamento: "General Taboada",
        comunidades: 1,
        pueblos: [{ pueblo: "Vilela", comunidades: 1 }],
      },
      {
        departamento: "Guasayán",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 1 }],
      },
      {
        departamento: "Juan F. Ibarra",
        comunidades: 5,
        pueblos: [{ pueblo: "Guaycurú", comunidades: 3 }, { pueblo: "Vilela", comunidades: 2 }],
      },
      {
        departamento: "Loreto",
        comunidades: 5,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 5 }],
      },
      {
        departamento: "Mitre",
        comunidades: 1,
        pueblos: [{ pueblo: "Sanavirón", comunidades: 1 }],
      },
      {
        departamento: "Moreno",
        comunidades: 7,
        pueblos: [{ pueblo: "Vilela", comunidades: 6 }, { pueblo: "Tonokoté", comunidades: 1 }],
      },
      {
        departamento: "Pellegrini",
        comunidades: 4,
        pueblos: [{ pueblo: "Lule Vilela", comunidades: 4 }],
      },
      {
        departamento: "Río Hondo",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 1 }],
      },
      {
        departamento: "Salavina",
        comunidades: 2,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 2 }],
      },
      {
        departamento: "San Martín",
        comunidades: 10,
        pueblos: [{ pueblo: "Tonokoté", comunidades: 10 }],
      },
      {
        departamento: "Silípica",
        comunidades: 4,
        pueblos: [{ pueblo: "Diaguita (Cacano)", comunidades: 4 }],
      },
    ],
  },
  {
    provincia: "Tierra del Fuego",
    comunidades: 2,
    conPersoneria: 2,
    relevamiento: { culminado: 1, iniciado: 0, en_tramite: 0, sin_relevar: 1, sin_dato: 0 },
    pueblos: [
      { pueblo: "Selk´Nam (Onas)", comunidades: 1 },
      { pueblo: "Yagán", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Río Grande",
        comunidades: 1,
        pueblos: [{ pueblo: "Selk´Nam (Onas)", comunidades: 1 }],
      },
      {
        departamento: "Ushuaia",
        comunidades: 1,
        pueblos: [{ pueblo: "Yagán", comunidades: 1 }],
      },
    ],
  },
  {
    provincia: "Tucumán",
    comunidades: 18,
    conPersoneria: 17,
    relevamiento: { culminado: 16, iniciado: 1, en_tramite: 1, sin_relevar: 0, sin_dato: 0 },
    pueblos: [
      { pueblo: "Diaguita Calchaquí", comunidades: 9 },
      { pueblo: "Diaguita", comunidades: 8 },
      { pueblo: "Lule", comunidades: 1 },
    ],
    departamentos: [
      {
        departamento: "Chicligasta",
        comunidades: 1,
        pueblos: [{ pueblo: "Diaguita", comunidades: 1 }],
      },
      {
        departamento: "Lules",
        comunidades: 1,
        pueblos: [{ pueblo: "Lule", comunidades: 1 }],
      },
      {
        departamento: "Tafí del Valle",
        comunidades: 8,
        pueblos: [{ pueblo: "Diaguita Calchaquí", comunidades: 6 }, { pueblo: "Diaguita", comunidades: 2 }],
      },
      {
        departamento: "Tafí Viejo",
        comunidades: 4,
        pueblos: [{ pueblo: "Diaguita", comunidades: 2 }, { pueblo: "Diaguita Calchaquí", comunidades: 2 }],
      },
      {
        departamento: "Trancas",
        comunidades: 4,
        pueblos: [{ pueblo: "Diaguita", comunidades: 3 }, { pueblo: "Diaguita Calchaquí", comunidades: 1 }],
      },
    ],
  },
];
