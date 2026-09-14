/**
 * El buzon al que llegan los formularios publicos del sitio.
 *
 * Estaba escrito a mano en cuatro archivos. No es una credencial —viaja en el
 * bundle del navegador y cualquiera lo ve en el HTML—, pero si cambia el buzon
 * y una copia se queda atras, el formulario sigue diciendo "mensaje enviado" y
 * el mensaje no llega a ningun lado.
 *
 * Los leads viven solamente en este correo: no hay copia en la base. Mientras
 * siga asi, perder un mensaje es perderlo del todo.
 */
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvzlarvb';
