/**
 * Tipos de las fichas de ecosistema.
 *
 * Viven separados de `lib/contexto.ts` porque los tres catálogos de fichas
 * (sudamericanas, regionales y globales) los necesitan, y contexto importa a
 * los tres. Acá no hay datos ni lógica: sólo formas.
 */

export interface SaberCultural {
  cultura: string;   // pueblo o tradición
  practicas: string; // descripción de prácticas y sistemas productivos
}

export interface Fuente { label: string; url: string }

export interface BiomaFicha {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  resumen: string;
  vegetacion: string;
  fauna: string;
  suelos: string;
  /** Puede venir vacío: las fichas de bioma global no atribuyen saberes a
   *  ninguna cultura en particular, porque a esa escala sería inventar. */
  saberes: SaberCultural[];
  /** Puede venir vacío por la misma razón: las especies son regionales. */
  especies: string[];
  fuentes: Fuente[];
}
