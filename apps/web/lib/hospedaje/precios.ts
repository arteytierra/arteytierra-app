/**
 * Las tarifas del ecohostel Tay Pichín, decididas en un solo lugar.
 *
 * Hasta el 20/11/2026 estaban tipeadas tres veces, una por idioma, y ya se
 * habían desfasado. En castellano y en francés la cama compartida costaba
 * $17.000 y la privada de dos $45.000; la página en inglés —la única que lee
 * un huésped extranjero— vendía «Shared dorm $15,000» y «Double room $35,000»,
 * más un camping por noche y dos tarifas semanales que el hostel no ofrece.
 * Tres páginas, tres precios, y ninguna forma de notarlo leyendo una sola.
 *
 * Acá el importe vive una vez y cada idioma lo formatea. El test
 * `tarifas.test.ts` comprueba que ninguna página vuelva a tipear un precio.
 *
 * Lo que pasa por noche es esto. Las estadías largas —la Inmersión Viva, la
 * Formación— se cobran por semana y las decide el catálogo de cursos
 * (`lib/courses/data.ts`), no este archivo.
 */
import type { Locale } from '@/lib/i18n/config';
import { precioLocalizado } from '@/lib/courses/formato';

/** Los tres idiomas en los que está publicado el hostel. */
export type IdiomaHospedaje = 'es' | 'en' | 'fr';

export type TarifaHospedaje = {
  /** Clave estable para el `key` del JSX y para los tests: no se traduce. */
  readonly id: string;
  /**
   * Una cama suelta en el dormitorio mixto o una habitación entera. Son dos
   * productos distintos y por eso no comparten escala: la cama se cobra por
   * persona y la privada por habitación, así que a partir de tres personas la
   * privada sale más barata que las camas sueltas equivalentes.
   */
  readonly tipo: 'cama' | 'privada';
  /** Pesos argentinos por noche. Lo único que se cambia cuando cambia un precio. */
  readonly porNoche: number;
  /** Cuánta gente duerme. En la cama suelta, una. */
  readonly personas: number;
  /** La única card que la página en inglés resalta. */
  readonly destacada?: true;
  readonly icono: string;
  readonly nombre: Record<IdiomaHospedaje, string>;
  readonly detalle: Record<IdiomaHospedaje, string>;
};

const POR_NOCHE: Record<IdiomaHospedaje, string> = {
  es: 'por noche',
  en: 'per night',
  fr: 'par nuit',
};

export const TARIFAS_HOSPEDAJE: readonly TarifaHospedaje[] = [
  {
    id: 'cama-compartida',
    tipo: 'cama',
    porNoche: 22000,
    personas: 1,
    icono: '◈',
    nombre: {
      es: 'Cama en dormitorio compartido',
      en: 'Bed in a shared dorm',
      fr: 'Lit en dortoir partagé',
    },
    detalle: {
      es: 'por noche · mixto',
      en: 'per night · mixed',
      fr: 'par nuit · mixte',
    },
  },
  {
    id: 'privada-1',
    tipo: 'privada',
    porNoche: 45000,
    personas: 1,
    icono: '◉',
    nombre: {
      es: 'Habitación privada · 1 persona',
      en: 'Private room · 1 guest',
      fr: 'Chambre privée · 1 personne',
    },
    detalle: POR_NOCHE,
  },
  {
    id: 'privada-2',
    tipo: 'privada',
    porNoche: 55000,
    personas: 2,
    destacada: true,
    icono: '◉',
    nombre: {
      es: 'Habitación privada · 2 personas',
      en: 'Private room · 2 guests',
      fr: 'Chambre privée · 2 personnes',
    },
    detalle: POR_NOCHE,
  },
  {
    id: 'privada-3',
    tipo: 'privada',
    porNoche: 65000,
    personas: 3,
    icono: '◉',
    nombre: {
      es: 'Habitación privada · 3 personas',
      en: 'Private room · 3 guests',
      fr: 'Chambre privée · 3 personnes',
    },
    detalle: POR_NOCHE,
  },
  {
    id: 'privada-4',
    tipo: 'privada',
    porNoche: 75000,
    personas: 4,
    icono: '◉',
    nombre: {
      es: 'Habitación privada · 4 personas',
      en: 'Private room · 4 guests',
      fr: 'Chambre privée · 4 personnes',
    },
    detalle: POR_NOCHE,
  },
  {
    id: 'privada-5',
    tipo: 'privada',
    porNoche: 85000,
    personas: 5,
    icono: '◉',
    nombre: {
      es: 'Habitación privada · 5 personas',
      en: 'Private room · 5 guests',
      fr: 'Chambre privée · 5 personnes',
    },
    detalle: POR_NOCHE,
  },
];

/**
 * El importe con los separadores de miles del idioma: 22000 se lee «$22.000»
 * en castellano, «$22,000» en inglés y «$22 000» en francés. Cambia la forma,
 * nunca el número — el mismo criterio que ya usan las fichas de los cursos.
 */
export function importePorNoche(tarifa: TarifaHospedaje, locale: Locale): string {
  return precioLocalizado(`$${tarifa.porNoche}`, locale);
}
