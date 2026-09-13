/**
 * Cómo se llama cada parte del año según dónde está el predio.
 *
 * Tres módulos tenían las estaciones escritas para el hemisferio sur —captación,
 * solar y arco solar—, cada uno con su copia y ninguno con la latitud a la vista.
 * La app se usa en Puerto Rico, Canadá, España y los Países Bajos: a un predio de
 * Ámsterdam el panel solar le rotulaba "Invierno" el arco del 21 de junio, que es
 * su día más largo. La astronomía estaba bien; el nombre estaba al revés, y en
 * una herramienta con la que alguien orienta un invernadero o una cortina el
 * nombre es la mitad del dato.
 *
 * Entre los trópicos no hay cuatro estaciones que nombrar: hay seca y lluvias, y
 * cuándo caen no lo decide la latitud sino el régimen del lugar. Ahí no se
 * afirma ninguna estación y se nombra el período por sus meses.
 */

/** Grados de latitud dentro de los cuales no se nombra ninguna estación. */
export const LATITUD_TROPICO = 10;

export type Hemisferio = 'norte' | 'sur' | 'tropico';

export function hemisferioDe(lat: number | null | undefined): Hemisferio {
  if (lat === null || lat === undefined || !Number.isFinite(lat)) return 'tropico';
  if (Math.abs(lat) <= LATITUD_TROPICO) return 'tropico';
  return lat < 0 ? 'sur' : 'norte';
}

/**
 * Los cuatro trimestres del año, siempre los mismos meses: el primero es
 * diciembre-enero-febrero. Lo único que cambia con la latitud es el nombre.
 */
export const MESES_POR_TRIMESTRE: readonly (readonly number[])[] = [
  [11, 0, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10],
];

export const ETIQUETAS_TRIMESTRE = [
  'Dic · Ene · Feb', 'Mar · Abr · May', 'Jun · Jul · Ago', 'Sep · Oct · Nov',
] as const;

const NOMBRES_SUR     = ['Verano', 'Otoño', 'Invierno', 'Primavera'] as const;
const NOMBRES_NORTE   = ['Invierno', 'Primavera', 'Verano', 'Otoño'] as const;
const NOMBRES_TROPICO = ['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov'] as const;

/** Nombre de cada trimestre, en el orden de `MESES_POR_TRIMESTRE`. */
export function nombresDeTemporada(lat: number | null | undefined): readonly string[] {
  switch (hemisferioDe(lat)) {
    case 'sur':   return NOMBRES_SUR;
    case 'norte': return NOMBRES_NORTE;
    default:      return NOMBRES_TROPICO;
  }
}

/** Estación de un mes, con índice 0 = enero. */
export function estacionDelMes(mesIdx: number, lat: number | null | undefined): string {
  const trimestre = MESES_POR_TRIMESTRE.findIndex((meses) => meses.includes(mesIdx));
  const nombres = nombresDeTemporada(lat);
  return nombres[trimestre] ?? ETIQUETAS_TRIMESTRE[Math.max(0, trimestre)] ?? '';
}

/**
 * Cómo se llama cada solsticio. El del 21 de diciembre es de verano en el sur y
 * de invierno en el norte; el del 21 de junio, al revés. En el trópico son los
 * extremos del recorrido del sol y no estaciones, así que se nombran por su mes.
 *
 * Devuelve la etiqueta larga y la corta —la corta va sobre el mapa, al lado del
 * mediodía— para que las dos digan lo mismo.
 */
export function nombreDelSolsticio(
  mes: 'diciembre' | 'junio',
  lat: number | null | undefined,
): { label: string; labelCorto: string } {
  const fecha = mes === 'diciembre' ? '21 dic' : '21 jun';
  const h = hemisferioDe(lat);
  if (h === 'tropico') {
    const corto = mes === 'diciembre' ? 'Diciembre' : 'Junio';
    return { label: `Solsticio de ${corto.toLowerCase()} (${fecha})`, labelCorto: corto };
  }
  const esVerano = (h === 'sur') === (mes === 'diciembre');
  const corto = esVerano ? 'Verano' : 'Invierno';
  return { label: `Solsticio de ${corto.toLowerCase()} (${fecha})`, labelCorto: corto };
}
