/**
 * Categorías de hacienda, con su equivalente vaca y su fuente.
 *
 * Por qué existe este archivo. Hasta acá la app tenía seis filas —«Bovinos
 * adultos», «Bovinos jóvenes», «Equinos», «Ovinos», «Caprinos», «Porcinos»— con
 * un coeficiente EV cada una y sin fuente. Eso no alcanza para nada de lo que un
 * productor hace: un campo no se carga con «bovinos adultos», se carga con 77
 * vacas, 23 vaquillonas de 2 a 3 años, 24 de 1 a 2, 24 terneras y 4 toros, y cada
 * una de esas categorías come distinto. La diferencia no es cosmética: entre una
 * vaca con cría al pie (1,40 EV) y una vaca seca (0,60 EV) hay un factor 2,3 en
 * el mismo animal según el mes del año.
 *
 * ## La fuente
 *
 * Cocimano, M., Lange, A. y Menvielle, E. (1975), «Estudio sobre equivalencias
 * ganaderas», *Producción Animal*, Buenos Aires, 4:161-190 (AACREA; hay una
 * versión previa de 1973). Las tablas detalladas dan el EV en función del peso
 * vivo y de la ganancia diaria; las que usamos acá son las **simplificadas por
 * categoría**, adaptadas del sistema de Coop (1965) y en uso en la Reserva 6 de
 * la EEA Balcarce del INTA, tal como las recopila Bavera, G.A. (2006),
 * «Equivalencias ganaderas», Curso de Producción Bovina de Carne, FAV UNRC.
 *
 * La propia fuente las presenta como «no tan exactas pero sí prácticas y
 * sencillas», y es la decisión correcta para acequia: el usuario sabe cuántas
 * vaquillonas tiene, no cuántos gramos por día aumentan.
 *
 * ## Qué es 1 EV
 *
 * El promedio anual de los requerimientos de una vaca de 400 kg que gesta y cría
 * un ternero hasta el destete a los 6 meses con 160 kg, **incluido el forraje que
 * come el ternero**. Equivale a un novillo de 410 kg que aumenta 500 g por día, y
 * en energía son **18,54 Mcal de energía metabolizable por día** (ver
 * `EV_MCAL_EM_DIA` en `produccion.ts`, que es la misma fuente).
 *
 * ## Rango de validez
 *
 * Es la unidad de la ganadería pastoril del Cono Sur, calibrada en la pampa
 * argentina. Fuera de ahí sigue sirviendo como relación entre categorías, pero el
 * valor absoluto hay que mirarlo con cuidado. No cubre:
 *   • **Vaca lechera en producción**, que pide mucho más que 1,40 EV.
 *   • **Feedlot**, donde el animal no cosecha forraje.
 *   • **Aves y cerdos**, que no cubren su requerimiento con pasto. Ver abajo.
 *
 * ## La UG no es el EV
 *
 * Son dos unidades distintas y se confunden todo el tiempo. El **EV** se define
 * en energía (18,54 Mcal EM/día). La **UG** (unidad ganadera) se define en peso
 * vivo y cambia de país: 380 kg en Uruguay, 400 kg en Paraguay. Una carga de
 * «2,5 UG/ha» de un informe uruguayo no es «2,5 EV/ha». Esta tabla es EV; cuando
 * la app muestre UG tiene que convertir y decir con qué peso.
 *
 * ## Quién lee esto
 *
 * `rodeo.ts` (el rodeo del predio, que es uno solo para toda la app),
 * `produccion.ts` (receptividad) y por esa vía el balance de agua de la represa.
 * Cambiar un coeficiente de acá cambia cuántos animales dice la app que entran en
 * el campo y cuánta agua hay que guardar.
 */

import { EV_MCAL_EM_DIA } from './produccion';

export type Especie = 'bovino' | 'ovino' | 'equino' | 'caprino' | 'porcino';

export const ESPECIES: Array<{ id: Especie; nombre: string }> = [
  { id: 'bovino',  nombre: 'Bovinos'  },
  { id: 'ovino',   nombre: 'Ovinos'   },
  { id: 'equino',  nombre: 'Equinos'  },
  { id: 'caprino', nombre: 'Caprinos' },
  { id: 'porcino', nombre: 'Porcinos' },
];

export interface CategoriaAnimal {
  id:      string;
  especie: Especie;
  nombre:  string;
  /**
   * Equivalentes vaca por cabeza.
   *
   * `null` significa **no pastorea**: el animal no cubre su requerimiento con
   * forraje, así que sumarlo a la carga del campo sería un error de categoría.
   * Las funciones de agregación lo excluyen del EV y lo cuentan aparte.
   */
  ev:      number | null;
  /** Peso vivo de referencia, en kg. Lo usa la conversión a UG y el agua. */
  pesoVivo_kg: number;
  /** Litros de agua por cabeza y por día. Orientativo y sin temperatura todavía. */
  agua_l_dia:  number;
  /** De dónde sale el `ev`. Va a pantalla. */
  fuente:  string;
  /** Cautela a mostrar cuando el número no es del todo defendible. */
  nota?:   string;
}

/** Atribución corta, para no repetir el párrafo entero en cada fila. */
const AACREA = 'Cocimano, Lange y Menvielle (1975), AACREA — tabla simplificada por categoría';

export const CATEGORIAS: CategoriaAnimal[] = [
  // ── Bovinos: cría ──────────────────────────────────────────────────────────
  {
    id: 'bovino_vaca_prom', especie: 'bovino', nombre: 'Vaca de cría (promedio anual)',
    ev: 1.00, pesoVivo_kg: 400, agua_l_dia: 50, fuente: AACREA,
    nota: 'Es la definición de 1 EV: promedia los seis meses con ternero al pie y los seis secos.',
  },
  {
    id: 'bovino_vaca_cria', especie: 'bovino', nombre: 'Vaca con cría al pie',
    ev: 1.40, pesoVivo_kg: 400, agua_l_dia: 60, fuente: AACREA,
    nota: 'Del parto al destete (6 meses). Incluye el forraje que come el ternero.',
  },
  {
    id: 'bovino_vaca_seca', especie: 'bovino', nombre: 'Vaca seca',
    ev: 0.60, pesoVivo_kg: 400, agua_l_dia: 45, fuente: AACREA,
    nota: 'Del destete al parto (6 meses).',
  },
  {
    id: 'bovino_vaquillona_1_2', especie: 'bovino', nombre: 'Vaquillona de 1 a 2 años',
    ev: 0.70, pesoVivo_kg: 250, agua_l_dia: 35, fuente: AACREA,
  },
  {
    id: 'bovino_vaquillona_2_3', especie: 'bovino', nombre: 'Vaquillona de 2 a 3 años o preñada',
    ev: 0.80, pesoVivo_kg: 330, agua_l_dia: 40, fuente: AACREA,
    nota: 'Desde los 2 años, más de 300 kg o preñada.',
  },
  {
    id: 'bovino_ternero', especie: 'bovino', nombre: 'Ternero o ternera de destete a 1 año',
    ev: 0.60, pesoVivo_kg: 200, agua_l_dia: 30, fuente: AACREA,
  },
  // ── Bovinos: invernada ─────────────────────────────────────────────────────
  {
    id: 'bovino_novillito', especie: 'bovino', nombre: 'Novillito de 1 a 2 años',
    ev: 0.70, pesoVivo_kg: 250, agua_l_dia: 35, fuente: AACREA,
  },
  {
    id: 'bovino_novillo', especie: 'bovino', nombre: 'Novillo de más de 300 kg',
    ev: 0.80, pesoVivo_kg: 350, agua_l_dia: 40, fuente: AACREA,
    nota: 'Desde los 2 años o más de 300 kg.',
  },
  {
    id: 'bovino_novillo_engorde', especie: 'bovino', nombre: 'Novillo en engorde',
    ev: 1.00, pesoVivo_kg: 430, agua_l_dia: 50, fuente: AACREA,
    nota: 'Desde los 400 kg hasta terminación.',
  },
  {
    id: 'bovino_toro', especie: 'bovino', nombre: 'Toro',
    ev: 1.30, pesoVivo_kg: 700, agua_l_dia: 60, fuente: AACREA,
    nota: 'En lotes de toros adultos en descanso entre servicios, la fuente recomienda contarlos como 2 EV: no sólo por lo que comen, también por el pasto que destruyen y los pozos que hacen al pelear.',
  },

  // ── Ovinos ─────────────────────────────────────────────────────────────────
  // La tabla da el EV para cada 10 ovinos; acá está dividido por 10. El
  // equivalente oveja (EO) es el promedio anual de una oveja de 50 kg que gesta y
  // cría un cordero hasta el destete a los 3 meses, y la fuente fija 1 EO = 0,16 EV.
  {
    id: 'ovino_oveja', especie: 'ovino', nombre: 'Oveja de cría (promedio anual)',
    ev: 0.16, pesoVivo_kg: 50, agua_l_dia: 6, fuente: `${AACREA}; 1 equivalente oveja = 0,16 EV`,
    nota: 'La relación 1 EV = 6,3 ovejas sirve para sumar la carga, no para reemplazar: el vacuno tiene menos aptitud que el ovino para usar pastos cortos y duros.',
  },
  {
    id: 'ovino_borrego', especie: 'ovino', nombre: 'Borrego o capón de 40 kg',
    ev: 0.10, pesoVivo_kg: 40, agua_l_dia: 5, fuente: `${AACREA} — 1,00 EV cada 10 animales sin ganancia`,
  },
  {
    id: 'ovino_carnero', especie: 'ovino', nombre: 'Carnero de 70 kg',
    ev: 0.15, pesoVivo_kg: 70, agua_l_dia: 8, fuente: `${AACREA} — 1,47 EV cada 10, en mantenimiento`,
  },

  // ── Equinos ────────────────────────────────────────────────────────────────
  {
    id: 'equino_adulto', especie: 'equino', nombre: 'Equino adulto',
    ev: 1.20, pesoVivo_kg: 450, agua_l_dia: 50, fuente: `${AACREA} — valor general del yeguarizo`,
    nota: 'Con trabajo pesado la tabla llega a 1,6–2,0 EV según el peso.',
  },
  {
    id: 'equino_crecimiento', especie: 'equino', nombre: 'Equino en crecimiento (hasta 3 años)',
    ev: 1.04, pesoVivo_kg: 350, agua_l_dia: 40, fuente: `${AACREA} — promedio del destete a los 3 años, peso adulto 600 kg`,
  },
  {
    id: 'equino_potrillo', especie: 'equino', nombre: 'Potrillo hasta el destete',
    ev: 0.60, pesoVivo_kg: 150, agua_l_dia: 25, fuente: `${AACREA} — incluye leche y pasto`,
  },

  // ── Sin fuente auditada ────────────────────────────────────────────────────
  // Las dos filas que siguen vienen de la tabla anterior de la app y no están en
  // la fuente de equivalencias. Se conservan para no romper los proyectos
  // guardados, pero lo dicen en pantalla.
  {
    id: 'caprino', especie: 'caprino', nombre: 'Caprinos',
    ev: 0.12, pesoVivo_kg: 45, agua_l_dia: 5,
    fuente: 'Sin fuente publicada — valor heredado de la tabla anterior de acequia',
    nota: 'El coeficiente no está auditado. El caprino además ramonea: come arbustos que el EV, pensado para forraje de pastizal, no representa bien.',
  },
  {
    id: 'porcino', especie: 'porcino', nombre: 'Porcinos',
    ev: null, pesoVivo_kg: 120, agua_l_dia: 20,
    fuente: 'Sin fuente publicada',
    nota: 'No se cuenta en la carga del campo: el cerdo casi no pastorea y cubre su requerimiento con grano o descarte, así que un coeficiente EV diría que compite por el pasto cuando no lo hace. Suma en el agua, no en el forraje.',
  },
];

export function categoriaPorId(id: string): CategoriaAnimal | null {
  return CATEGORIAS.find(c => c.id === id) ?? null;
}

export function categoriasDeEspecie(especie: Especie): CategoriaAnimal[] {
  return CATEGORIAS.filter(c => c.especie === especie);
}

/** Las que entran en la carga del campo, es decir las que pastorean. */
export function categoriasQuePastorean(): CategoriaAnimal[] {
  return CATEGORIAS.filter(c => c.ev !== null);
}

/**
 * Requerimiento de una categoría en Mcal de EM por día.
 *
 * Es derivado, no declarado: `ev × 18,54`. Está así a propósito y no al revés.
 * La fuente publica el coeficiente EV, no las Mcal por categoría, y escribir los
 * dos números en la tabla sería dejar que se desincronicen. Si algún día entra una
 * categoría cuya fuente da directamente las Mcal —una vaca lechera, por ejemplo—,
 * ese día se invierte la dirección para esa fila y se documenta por qué.
 */
export function mcalEM_dia(cat: CategoriaAnimal): number | null {
  return cat.ev === null ? null : cat.ev * EV_MCAL_EM_DIA;
}

/**
 * Peso de una UG, en kg, según el país. La unidad ganadera se define en peso
 * vivo y no es la misma en todas partes; el EV, que se define en energía, sí.
 */
export const UG_KG = {
  uruguay:   380,
  paraguay:  400,
  argentina: 400,
} as const;

export type PaisUG = keyof typeof UG_KG;
