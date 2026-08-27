/**
 * Cómo se escriben los números en pantalla.
 *
 * Salió de una confusión concreta y evitable: el volumen escurrido se mostraba
 * como "19.0 dam³" con "19.041 m³" abajo. El decámetro cúbico no lo usa nadie
 * fuera de un manual de hidráulica, y los dos números se leían como el mismo
 * valor mal escrito. Peor: en castellano el punto separa los miles, así que
 * "19.041 m³" se lee como diecinueve coma cero cuarenta y uno.
 *
 * La regla de la casa, entonces:
 *   · nada de dam³ — metros cúbicos, y al lado la equivalencia en litros, que
 *     es la unidad con la que la gente piensa el agua;
 *   · todo caudal lleva su equivalente en litros por segundo;
 *   · todo número que sea un total lleva dicho de qué período es el total.
 */

const AR = 'es-AR';

/** Entero con separador de miles (1.234.567). */
export function miles(n: number): string {
  return Math.round(n).toLocaleString(AR);
}

/** Volumen en m³, con la precisión que corresponde a su magnitud. */
export function volumenM3(m3: number): string {
  if (!Number.isFinite(m3)) return '—';
  if (Math.abs(m3) < 10)  return `${(Math.round(m3 * 10) / 10).toLocaleString(AR)} m³`;
  return `${miles(m3)} m³`;
}

/**
 * El mismo volumen en litros, que es como se piensa el agua en el campo.
 * Arriba del millón se redondea a millones: "19 millones de litros" dice más
 * que "19.041.000 litros".
 */
export function volumenEnLitros(m3: number): string {
  if (!Number.isFinite(m3) || m3 <= 0) return '—';
  const litros = m3 * 1000;
  if (litros >= 1e6) {
    const M = litros / 1e6;
    return `${(Math.round(M * (M < 10 ? 10 : 1)) / (M < 10 ? 10 : 1)).toLocaleString(AR)} millones de litros`;
  }
  return `${miles(litros)} litros`;
}

/** Caudal en m³/s. Abajo de 1 m³/s el número interesante es el de litros. */
export function caudalM3s(m3s: number): string {
  if (!Number.isFinite(m3s)) return '—';
  if (m3s < 1) return `${miles(m3s * 1000)} L/s`;
  return `${(Math.round(m3s * 100) / 100).toLocaleString(AR)} m³/s`;
}

/** El mismo caudal en litros por segundo (vacío si el principal ya son litros). */
export function caudalEnLitros(m3s: number): string {
  if (!Number.isFinite(m3s) || m3s < 1) return '';
  return `${miles(m3s * 1000)} litros por segundo`;
}

/** Duración en minutos escrita como la diría una persona. */
export function duracionMin(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return '—';
  if (min < 60) return `${Math.round(min * 10) / 10} min`;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
