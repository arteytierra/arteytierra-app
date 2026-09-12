import 'server-only';

/**
 * A cuántos pesos se muestra el dólar en acequia.
 *
 * Es el mismo número con el que `crearPreapprovalMp` arma el importe que Mercado
 * Pago va a cobrar, y por eso es el único que puede aparecer en una pantalla. La
 * vidriera de /acequia tenía `const ARS_POR_USD = 1500` escrito a mano y hasta lo
 * imprimía en la letra chica ("Precios en pesos a 1500 $/USD"); la pantalla de
 * confirmación de la app tenía su propia copia del mismo 1500. Ninguna de las dos
 * miraba `ACEQUIA_ARS_PER_USD`, que es lo que se cobra.
 *
 * Vive en su propio módulo —y no en `suscripciones.ts`— para que una página
 * pueda preguntar la cotización sin arrastrar los SDK de Stripe y Mercado Pago.
 */

/** Lanza si no está configurada: el cobro no puede seguir sin cotización. */
export function tasaArsPorUsd(): number {
  const value = Number(process.env.ACEQUIA_ARS_PER_USD);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('ACEQUIA_ARS_PER_USD no está configurada con un valor válido.');
  }
  return value;
}

/**
 * La misma cotización para mostrar, o null si no está. Null no es un error: es
 * la instrucción de no mostrar ningún precio en pesos. Un precio en pesos
 * inventado es peor que no tenerlo, porque el visitante lo lee como una promesa.
 */
export function tasaArsPorUsdParaMostrar(): number | null {
  try {
    return tasaArsPorUsd();
  } catch {
    return null;
  }
}
