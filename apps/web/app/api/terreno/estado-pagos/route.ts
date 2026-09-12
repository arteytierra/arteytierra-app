import { NextResponse, type NextRequest } from 'next/server';
import { ACEQUIA_TRIAL_DAYS } from '@arteytierra/config/acequia';
import { corsAcequia } from '@/lib/terreno/cors';
import { tasaArsPorUsdParaMostrar } from '@/lib/terreno/cotizacion';
import {
  pagosAcequiaHabilitados,
  pruebaComercialHabilitada,
} from '@/lib/terreno/suscripciones';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Qué va a pasar realmente cuando alguien apriete el botón de pago.
 *
 * Existe porque el cobro y la pantalla que lo anuncia viven en dos proyectos de
 * Vercel distintos, con variables de entorno distintas. `ACEQUIA_TRIAL_ENABLED`
 * estaba cargada en `terreno` y no en `arteytierra-app-web`, así que
 * `/suscribir` prometía tres días gratis y el checkout, que es el que crea el
 * plan en PayPal y el preapproval en Mercado Pago, cobraba el mismo día. La
 * pantalla no puede leer el entorno del que cobra: tiene que preguntárselo.
 *
 * Lo mismo con la cotización: la confirmación mostraba un peso por dólar escrito
 * a mano en el componente, y el importe que Mercado Pago iba a cobrar salía de
 * `ACEQUIA_ARS_PER_USD`. Dos números para el mismo precio.
 *
 * No devuelve nada secreto: son las tres cosas que el usuario va a ver en la
 * pantalla siguiente. `arsPorUsd` es null si la cotización no está configurada,
 * y entonces la pantalla no muestra el precio en pesos en vez de inventarlo.
 */

export interface EstadoPagos {
  /** Si es false, el checkout responde 503 y no hay nada que ofrecer. */
  pagos: boolean;
  /** Si es true, el alta empieza con una prueba y el primer cobro se corre. */
  prueba: boolean;
  diasPrueba: number;
  arsPorUsd: number | null;
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsAcequia(req.headers.get('origin'), 'GET, OPTIONS'),
  });
}

export function GET(req: NextRequest) {
  const headers = corsAcequia(req.headers.get('origin'), 'GET, OPTIONS');

  const cuerpo: EstadoPagos = {
    pagos: pagosAcequiaHabilitados(),
    prueba: pruebaComercialHabilitada(),
    diasPrueba: ACEQUIA_TRIAL_DAYS,
    // Sin cotización no se muestra el precio en pesos. Es la regla de siempre:
    // degradar avisando antes que rellenar con un número plausible.
    arsPorUsd: tasaArsPorUsdParaMostrar(),
  };
  return NextResponse.json(cuerpo, { headers });
}
