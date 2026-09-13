import { NextResponse, type NextRequest } from 'next/server';
import { ACEQUIA_PLANS, ACEQUIA_TRIAL_DAYS, type AcequiaPlanId } from '@arteytierra/config/acequia';
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

/** Un plan, tal como lo cobra y lo topa el sistema. */
export interface PlanPublicado {
  mensual: number | null;
  anual: number | null;
  /** Proyectos activos por cuenta; lo aplica el trigger de la migración 0057. */
  proyectos: number;
  /** Cuentas de usuario que incluye el plan. */
  cuentas: number;
  /** Si es false, el alta pasa por una persona y `/suscribir` rechaza el plan. */
  checkoutPropio: boolean;
}

export interface EstadoPagos {
  /** Si es false, el checkout responde 503 y no hay nada que ofrecer. */
  pagos: boolean;
  /** Si es true, el alta empieza con una prueba y el primer cobro se corre. */
  prueba: boolean;
  diasPrueba: number;
  arsPorUsd: number | null;
  /**
   * El catálogo completo, para que ninguna vidriera tenga que copiarlo a mano.
   *
   * `acequia.app` vive en otro repositorio y su `lib/plans.ts` es una copia
   * escrita a mano: ya anunció USD 12 mientras el cobro salía 15, "proyectos
   * ilimitados" con un tope de 10, y "hasta 50 proyectos" en Estudio cuando el
   * trigger corta en 10. Publicándolo acá, esa copia tiene contra qué
   * verificarse, y lo que verifica es lo que está desplegado cobrando, no un
   * archivo que también podría haber quedado viejo.
   */
  planes: Record<AcequiaPlanId, PlanPublicado>;
}

function publicarPlanes(): Record<AcequiaPlanId, PlanPublicado> {
  const salida = {} as Record<AcequiaPlanId, PlanPublicado>;
  for (const plan of Object.values(ACEQUIA_PLANS)) {
    salida[plan.id] = {
      mensual: plan.monthlyUsd,
      anual: plan.annualUsd,
      proyectos: plan.projects,
      cuentas: plan.seats,
      checkoutPropio: plan.selfCheckout,
    };
  }
  return salida;
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
    planes: publicarPlanes(),
  };
  return NextResponse.json(cuerpo, { headers });
}
