/**
 * Dónde vive la aplicación de acequia, en un solo lugar.
 *
 * El valor por defecto era `https://terreno.arteytierra.org`, el dominio
 * anterior a la mudanza, repetido en cuatro archivos. `NEXT_PUBLIC_ACEQUIA_APP_URL`
 * nunca se cargó en el proyecto de Vercel (verificado el 13/09/2026 con
 * `vercel env ls production`), así que ese valor por defecto no era un respaldo:
 * era el que usaban en producción la vidriera, el checkout y los correos. El
 * dominio viejo redirige, de modo que nada se rompía a la vista — simplemente
 * todo el embudo pasaba por una redirección y mostraba la marca anterior.
 *
 * Si algún día hace falta apuntar a otro lado (una preview, por ejemplo), la
 * variable sigue mandando; lo que cambió es que no dependemos de que esté.
 */
export const ACEQUIA_APP_URL =
  process.env.NEXT_PUBLIC_ACEQUIA_APP_URL ?? 'https://app.acequia.app';

export const ACEQUIA_REGISTRO_URL = `${ACEQUIA_APP_URL}/registro`;
export const ACEQUIA_SUSCRIBIR_URL = `${ACEQUIA_APP_URL}/suscribir`;
export const ACEQUIA_MAPA_URL = `${ACEQUIA_APP_URL}/mapa`;
