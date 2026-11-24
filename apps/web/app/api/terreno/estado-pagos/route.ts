import { NextResponse, type NextRequest } from 'next/server';
import {
  ACEQUIA_FEATURES,
  ACEQUIA_FEATURES_VITRINA,
  ACEQUIA_LIBRE,
  ACEQUIA_PLANS,
  ACEQUIA_TOPO_SEMILLA_HA,
  ACEQUIA_TRIAL_DAYS,
  ACEQUIA_TRIAL_PLAN,
  acequiaTrialDays,
  type AcequiaFeature,
  type AcequiaPlanId,
} from '@arteytierra/config/acequia';
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
  /**
   * Días de prueba de ESTE plan. Cero significa que se cobra desde el primer
   * día, y desde el 23/11/2026 es el caso de todos menos Personal.
   *
   * Va plan por plan porque el error que esto previene es de una sola frase:
   * un botón que diga "Probar 3 días" en la tarjeta de Profesional manda a una
   * pantalla que cobra hoy. El número de arriba, `diasPrueba`, no alcanza para
   * decidir eso —es el de Personal—, así que cada tarjeta tiene que mirar el
   * suyo.
   */
  pruebaDias: number;
}

export interface EstadoPagos {
  /** Si es false, el checkout responde 503 y no hay nada que ofrecer. */
  pagos: boolean;
  /** Si es true, hay prueba; de qué plan lo dice `planPrueba`. */
  prueba: boolean;
  /** Los días de la prueba de `planPrueba`. No es "la prueba de acequia". */
  diasPrueba: number;
  /** El único plan que se prueba sin pagar. Los demás cobran desde el día uno. */
  planPrueba: AcequiaPlanId;
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
  /**
   * Cada feature con candado: desde qué plan va, cómo se dice y qué salvedad
   * no se puede omitir al anunciarla.
   *
   * Publicar los precios no alcanzó. El 15/10/2026 la vidriera de `acequia.app`
   * seguía ofreciéndole a Semilla «Informe con marca de agua» dos semanas
   * después de que `informe.descarga` pasara a Personal, y ningún número estaba
   * mal: la FRASE estaba mal. Así que acá van también las frases, al lado del
   * candado que las hace verdaderas.
   */
  features: FeaturePublicada[];
  /**
   * Lo que no pide ningún plan, que es de lo que está hecha la tarjeta de
   * Semilla. Sin esto una vidriera no tiene con qué armarla y la inventa.
   */
  libre: Array<{ id: string; etiqueta: string; salvedad: string | null }>;
  /** El tope de superficie de la muestra de topografía, en hectáreas. */
  topoSemillaHa: number;
}

/** Una feature con candado, tal como se puede anunciar. */
export interface FeaturePublicada {
  id: AcequiaFeature;
  /** El plan MÍNIMO que la habilita. Uno superior la habilita también. */
  desde: AcequiaPlanId;
  etiqueta: string;
  /** Lo que hay que decir junto con la etiqueta. Omitirlo es prometer de más. */
  salvedad: string | null;
  /** Si va en la tarjeta corta; el resto es para la tabla comparativa. */
  tarjeta: boolean;
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
      pruebaDias: plan.id === 'semilla' ? 0 : acequiaTrialDays(plan.id),
    };
  }
  return salida;
}

function publicarFeatures(): FeaturePublicada[] {
  return (Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[]).map(id => ({
    id,
    desde: ACEQUIA_FEATURES[id],
    ...ACEQUIA_FEATURES_VITRINA[id],
  }));
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
    planPrueba: ACEQUIA_TRIAL_PLAN,
    // Sin cotización no se muestra el precio en pesos. Es la regla de siempre:
    // degradar avisando antes que rellenar con un número plausible.
    arsPorUsd: tasaArsPorUsdParaMostrar(),
    planes: publicarPlanes(),
    features: publicarFeatures(),
    libre: ACEQUIA_LIBRE.map(l => ({ ...l })),
    topoSemillaHa: ACEQUIA_TOPO_SEMILLA_HA,
  };
  return NextResponse.json(cuerpo, { headers });
}
