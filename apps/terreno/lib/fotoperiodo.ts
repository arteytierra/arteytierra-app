/**
 * Fotoperiodo: cuántas horas de luz hay cada mes, y desde cuándo eso deja de
 * alcanzar.
 *
 * El calendario decidía la ventana de cada familia sólo con temperatura —media,
 * mínima y helada—. En latitud alta eso sobrestima el año: hay meses de hombro
 * en que la temperatura todavía da y la luz ya no. Una lechuga a 56° de latitud
 * en noviembre tiene 8 °C de media, que le sirven, y nueve horas de luz, que no:
 * se queda parada esperando la primavera.
 *
 * El umbral es el que la horticultura llama *período de Perséfone*: por debajo
 * de **diez horas** de luz el crecimiento vegetativo prácticamente se detiene, y
 * lo que está en la tierra se conserva pero no engorda. No es un invento
 * nuestro ni un número calibrado por nosotros; es el criterio con el que se
 * planifica la huerta de invierno en el hemisferio norte desde hace décadas.
 *
 * Importa que el umbral no dependa de la familia: por debajo de 10 h ninguna
 * planta de huerta crece, tropical o templada. Y como a menos de ~40° de
 * latitud el día nunca baja de 10 h, la regla no toca jamás un predio
 * subtropical o tropical — sólo corrige donde el error existía.
 *
 * Sin APIs: sale de la latitud y del día del año.
 */

/** Debajo de esto el crecimiento vegetativo se detiene. */
export const LUZ_MINIMA_H = 10;

/** Debajo de esto no hay nada que hacer a cielo abierto. */
export const LUZ_NULA_H = 9;

/** Día del año del punto medio de cada mes (año no bisiesto). */
const DIA_MEDIO_MES = [15, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349] as const;

/**
 * Duración del día en horas, modelo CBM (Forsythe et al. 1995), con el
 * coeficiente de 0,8333° que incluye el disco solar y la refracción —o sea,
 * de salida a puesta, como lo mide cualquiera parado en el campo.
 */
export function horasLuz(lat: number, diaDelAnio: number): number {
  const p = 0.8333;
  const theta = 0.2163108 + 2 * Math.atan(0.9671396 * Math.tan(0.00860 * (diaDelAnio - 186)));
  const phi = Math.asin(0.39795 * Math.cos(theta));

  const radLat = (lat * Math.PI) / 180;
  const num = Math.sin((p * Math.PI) / 180) + Math.sin(radLat) * Math.sin(phi);
  const den = Math.cos(radLat) * Math.cos(phi);
  const cociente = num / den;

  // Adentro de los círculos polares el cociente se sale de [-1, 1]: es el sol
  // de medianoche o la noche polar, y ahí el día dura 24 h o 0 h.
  if (cociente >= 1) return 24;
  if (cociente <= -1) return 0;

  return 24 - (24 / Math.PI) * Math.acos(cociente);
}

export interface Fotoperiodo {
  /** Horas de luz al mediodía de cada mes, redondeadas a una decimal. */
  por_mes: number[];
  /** Índices de los meses por debajo de `LUZ_MINIMA_H`. */
  meses_cortos: number[];
  /** El día más corto y el más largo del año, en horas. */
  min: number;
  max: number;
  /** Si la luz llega a limitar algo en este lugar. */
  limita: boolean;
  lectura: string;
}

const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

export function calcularFotoperiodo(lat: number): Fotoperiodo {
  const por_mes = DIA_MEDIO_MES.map(d => Math.round(horasLuz(lat, d) * 10) / 10);
  const meses_cortos = por_mes
    .map((h, i) => (h < LUZ_MINIMA_H ? i : -1))
    .filter(i => i >= 0);

  const min = Math.min(...por_mes);
  const max = Math.max(...por_mes);
  const limita = meses_cortos.length > 0;

  const nombres = meses_cortos.map(i => MES_CORTO[i]).join(', ');
  const lectura = !limita
    ? `El día nunca baja de ${min.toFixed(1)} h: acá la luz no manda, mandan la temperatura y el agua.`
    : meses_cortos.length >= 5
      ? `Cinco meses o más por debajo de las 10 h de luz (${nombres}). Es medio año en que lo sembrado se conserva pero no engorda: la huerta de invierno se planta en otoño, con la planta ya hecha.`
      : `Luz corta en ${nombres}: menos de 10 h de día. La temperatura de esos meses puede engañar —da para sembrar y la planta no crece—, así que la ventana real arranca cuando vuelve la luz.`;

  return { por_mes, meses_cortos, min, max, limita, lectura };
}
