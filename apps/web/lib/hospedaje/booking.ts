/**
 * El puntaje de Booking del Ecohostel, en un solo lugar.
 *
 * Estaba escrito a mano en cinco pantallas y ninguna decía lo mismo: la pagina
 * de hospedaje anunciaba 9,7 sobre 10 cuando el puntaje real nunca llego a 8, y
 * las otras cuatro repetian un 7,5 con 59 comentarios que ya habia quedado
 * viejo. Un numero inventado en la vidriera es una promesa que el huesped
 * verifica en dos clics, del otro lado, antes de reservar.
 *
 * No se lee en vivo: booking.com bloquea a los robots y una pagina que depende
 * de un scraping se cae sola. Se copia a mano, con la fecha en que se leyo, y se
 * vuelve a mirar cuando se acumulan comentarios nuevos. Lo que si queda cerrado
 * es que haya una sola copia: `tests/unit/booking-puntaje.test.ts` falla si
 * alguna pagina vuelve a escribir el numero adentro de una frase.
 */

/** Leido de booking.com/hotel/ar/ecohostel-tay-pichin el 13/09/2026. */
export const BOOKING_TAY_PICHIN = {
  /** Puntuacion global sobre 10. Booking la llama "Bien" a partir de 7. */
  puntaje: 7.4,
  comentarios: 60,
  verificado: '2026-09-13',
} as const;

type Idioma = 'es' | 'en' | 'fr';

/** La ficha tiene una URL por idioma; todas llevan al mismo alojamiento. */
export const BOOKING_URL: Record<Idioma, string> = {
  es: 'https://www.booking.com/hotel/ar/ecohostel-tay-pichin.es-ar.html',
  en: 'https://www.booking.com/hotel/ar/ecohostel-tay-pichin.en.html',
  fr: 'https://www.booking.com/hotel/ar/ecohostel-tay-pichin.fr.html',
};

/** 7,4 en castellano y frances; 7.4 en ingles. La coma no es decorativa. */
export function puntajeBooking(idioma: Idioma = 'es'): string {
  const texto = BOOKING_TAY_PICHIN.puntaje.toFixed(1);
  return idioma === 'en' ? texto : texto.replace('.', ',');
}

export function comentariosBooking(): number {
  return BOOKING_TAY_PICHIN.comentarios;
}
