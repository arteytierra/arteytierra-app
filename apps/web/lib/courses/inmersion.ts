/**
 * El precio de una semana de Inmersión Viva, para las páginas que lo anuncian
 * fuera de la ficha del curso.
 *
 * Las tres portadas de Tay Pichín —castellano, inglés y francés— muestran las
 * dos modalidades en una card con el importe semanal, y hasta el 20/11/2026 lo
 * tenían tipeado: seis importes a mano que había que acordarse de cambiar los
 * seis. La base del chatbot los tenía escritos por séptima y octava vez.
 *
 * Acá salen de `data.ts`, donde se deciden. Si el precio cambia, cambia ahí y
 * en ningún otro lado.
 */
import type { Locale } from '@/lib/i18n/config';
import { getCourse } from './data';
import { precioLocalizado } from './formato';

/** Las dos formas de dormir durante la estadía. Los ids viven en `data.ts`. */
export type ModalidadInmersion = 'camping' | 'habitacion';

/**
 * El importe semanal con los separadores de miles del idioma: «$80.000» en
 * castellano, «$80,000» en inglés. Sin la unidad de tiempo, que cada página
 * escribe en su propio marcado («/ sem», «/week», «/ sem.»).
 *
 * Revienta si la modalidad no existe en el catálogo. Es a propósito: un precio
 * que no se encuentra tiene que romper el build, no salir vacío en pantalla.
 */
export function semanaDeInmersion(modalidad: ModalidadInmersion, locale: Locale): string {
  const curso = getCourse('inmersion-viva');
  const opcion = curso?.opciones.find(o => o.id === modalidad);
  if (!opcion) {
    throw new Error(`La Inmersión Viva no tiene la modalidad «${modalidad}» en data.ts`);
  }
  return precioLocalizado(opcion.precio, locale);
}
