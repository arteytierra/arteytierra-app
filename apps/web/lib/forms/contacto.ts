/**
 * El buzon al que llegan los formularios publicos del sitio.
 *
 * Hasta septiembre de 2026 esto apuntaba a Formspree. Se trajo adentro por dos
 * razones: lo que entraba por ahi no quedaba guardado en la base —si el mail
 * se perdia, el lead se perdia— y el aviso llegaba con un remitente distinto
 * al de las inscripciones, asi que en la casilla los formularios del mismo
 * sitio parecian dos cosas distintas y no habia forma de filtrarlos juntos.
 *
 * La ruta guarda en `app.contacts` y despues avisa por mail.
 */
export const CONTACTO_ENDPOINT = '/api/contacto';
