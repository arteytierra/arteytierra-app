import 'server-only';

/**
 * Orígenes de la app acequia que pueden hablar con las rutas `/api/terreno/*`.
 *
 * Estaba escrito tres veces, una por ruta, y las tres tenían que decir lo mismo
 * para que el checkout, la baja y el estado de pagos no se contradijeran. Ahora
 * está una sola vez.
 */
export const ORIGENES_ACEQUIA = new Set([
  'https://terreno.arteytierra.org',
  'https://app.acequia.app',
  'http://localhost:3001',
]);

export function esOrigenAcequia(origin: string | null): boolean {
  return Boolean(origin) && ORIGENES_ACEQUIA.has(origin!);
}

/** Cabeceras CORS para un origen dado. `metodos` es el Allow-Methods de la ruta. */
export function corsAcequia(origin: string | null, metodos: string): Record<string, string> {
  return {
    ...(esOrigenAcequia(origin) ? { 'Access-Control-Allow-Origin': origin! } : {}),
    'Access-Control-Allow-Methods': metodos,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
  };
}
