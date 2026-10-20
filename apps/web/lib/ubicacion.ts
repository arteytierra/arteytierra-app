/**
 * Dónde queda Tay Pichín y cómo se llega.
 *
 * Estaba escrito sólo en la prosa de `/hospedaje`, y las estadías largas
 * —Inmersión Viva, el voluntariado— lo necesitan también: quien viene de otra
 * provincia o de otro país pregunta esto antes que cualquier otra cosa.
 *
 * Vive acá para que haya un solo lugar donde corregirlo. Si mañana aparece una
 * combinación de transporte, o cambia el acceso, se toca una vez y lo dicen
 * todas las páginas. Dos copias de una indicación de cómo llegar es alguien
 * parado en una terminal a 150 km.
 */

export const UBICACION = {
  localidad: 'San Marcos Sierras, Córdoba',
  barrio: 'Barrio La Loma, a 4 cuadras de la plaza principal de San Marcos Sierras',
  distancia: 'A 150 km de la ciudad de Córdoba, en plena sierra chica',
  acceso: 'El acceso final tiene una subida de algunos metros',
  /**
   * Se dice que NO hay transporte público hasta la puerta porque es lo que
   * arruina una llegada, y porque no publicamos horarios de colectivo que no
   * controlamos: una combinación mal anotada deja a alguien varado.
   */
  transporte: 'No hay transporte público hasta la puerta — lo más fácil es llegar en auto, remis o coordinar traslado con nosotros',
} as const;

/** Las cuatro líneas, para una lista. El orden es el de quien está viajando. */
export const COMO_LLEGAR: string[] = [
  UBICACION.distancia,
  UBICACION.barrio,
  UBICACION.transporte,
  `${UBICACION.acceso}: conviene no traer valija de rueditas`,
];
