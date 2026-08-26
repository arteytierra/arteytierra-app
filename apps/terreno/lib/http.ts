/**
 * Origen propio de la app terreno, para CORS.
 *
 * Las rutas /api/* con datos de plan sólo las consume el mapa desde el mismo
 * origen, así que respondemos `Access-Control-Allow-Origin` con este valor en vez
 * de `*`. En pedidos same-origin el navegador ignora el header (no hay chequeo
 * CORS), con lo cual esto NO afecta al mapa; sólo cierra la lectura cross-origin
 * de esos endpoints desde sitios de terceros. Defensa en profundidad.
 *
 * Los proxies de datos públicos (terrarium, wayback, zoom-satelital, geocoder)
 * quedan en `*` a propósito: sirven datos abiertos y terrarium se lee a canvas
 * con `img.crossOrigin`, donde un CORS restrictivo podría estorbar.
 *
 * ⚠️ Se limpia el valor: Vercel a veces inyecta un BOM (U+FEFF), zero-width
 * space, comillas o espacios en las env vars. Como este string va como VALOR de
 * un header HTTP (ByteString), un solo carácter >255 hace que undici aborte con
 * "Cannot convert argument to a ByteString" y la ruta entera devuelve 500.
 */
function limpiarEnv(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

export const SITE_ORIGIN = limpiarEnv(process.env.NEXT_PUBLIC_SITE_URL) || 'https://arteytierra.org';
