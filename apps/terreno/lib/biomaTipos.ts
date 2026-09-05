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

/**
 * Un ajuste a la aptitud de uso del suelo, con nombre y motivo.
 *
 * La aptitud se calcula del relieve —pendiente, orientación, agua que junta la
 * celda— y el relieve no sabe en qué bioma está: una loma suave es igual de
 * suave en la Amazonia que en la Patagonia, pero abrir huerta intensiva no
 * significa lo mismo en las dos. Estos modificadores son el lugar donde eso se
 * dice.
 *
 * El `delta` se suma al score de 0 a 100 de ese uso en todas las celdas del
 * predio, y la `razon` viaja hasta la pantalla. Un puntaje que se mueve sin
 * decir por qué es peor que no moverlo, porque el usuario no puede discutirlo.
 */
export interface ModificadorAptitud {
  /** Id de `TipoAptitud` en `lib/aptitud.ts`. Va como unión literal y no
   *  importado para no arrastrar ese módulo —que trae turf— adentro de cada
   *  catálogo de fichas. */
  uso: 'huerta' | 'frutales' | 'pasturas' | 'forestal' | 'reserva';
  delta: number;
  razon: string;
}

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
  /** Puede venir vacío por la misma razón: las especies son regionales.
   *  Esto es **flora nativa**: lo que crece ahí sin que nadie lo plante. Lo que
   *  se cultiva va en `cultivos`, que es otra lista y otro catálogo. */
  especies: string[];
  /** Ids del catálogo de `lib/especies.ts`: qué se cultiva acá y con qué rol
   *  dentro del sistema. Opcional — la ficha que no lo declara cae al catálogo
   *  por clase Köppen, que es más grueso pero nunca deja la sección vacía. */
  cultivos?: string[];
  /** Correcciones a la aptitud de uso del suelo que impone el ecosistema. */
  aptitud?: ModificadorAptitud[];
  fuentes: Fuente[];
}
