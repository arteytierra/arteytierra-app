import 'server-only';
import { URL_WEB } from './urlWeb';
import {
  ESTADO_PAGOS_POR_DEFECTO,
  normalizarEstadoPagos,
  type EstadoPagos,
} from './estadoPagosDato';

/**
 * Qué va a hacer el checkout, preguntado a quien cobra.
 *
 * acequia y la web son dos proyectos de Vercel con entornos separados. Leer acá
 * `ACEQUIA_TRIAL_ENABLED` no dice nada sobre el cobro: dice qué tiene cargado
 * este proyecto, que puede no ser lo que tiene cargado el que crea el plan en
 * PayPal. Eso ya pasó, y el resultado fue una pantalla que prometía tres días
 * gratis frente a un checkout que cobraba el mismo día.
 */

export type { EstadoPagos } from './estadoPagosDato';

/** Segundos de caché. Son banderas de entorno: cambian cuando alguien redeploya. */
const REVALIDAR = 300;

export async function leerEstadoPagos(): Promise<EstadoPagos> {
  try {
    const r = await fetch(`${URL_WEB}/api/terreno/estado-pagos`, {
      next: { revalidate: REVALIDAR },
      signal: AbortSignal.timeout(5_000),
    });
    if (!r.ok) return ESTADO_PAGOS_POR_DEFECTO;
    return normalizarEstadoPagos(await r.json());
  } catch {
    return ESTADO_PAGOS_POR_DEFECTO;
  }
}
