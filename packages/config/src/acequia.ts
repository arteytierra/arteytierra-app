export const ACEQUIA_TRIAL_DAYS = 3;

/** Los planes de acequia. El identificador es el mismo puertas adentro y de cara
 *  al publico: hasta el 11/09/2026 el plan "Profesional" se llamaba `disenador`
 *  internamente, y esa doble denominacion obligaba a traducir en los dos
 *  sentidos en cada borde del sistema (checkout, webhooks, codigos, informes).
 *  Ningun registro de la base usaba el valor viejo cuando se renombro, asi que
 *  el unico rastro que queda es `resolveAcequiaPaidPlan`, que sigue aceptando
 *  `disenador` por si vuelve en un link viejo o en la metadata de un pago que
 *  ya estaba en vuelo. */
export type AcequiaPlanId = 'semilla' | 'personal' | 'profesional' | 'estudio';
export type AcequiaPaidPlanId = Exclude<AcequiaPlanId, 'semilla'>;
export type AcequiaBillingPeriod = 'mensual' | 'anual';

/** @deprecated Quedan como alias para no romper importaciones; son el mismo tipo. */
export type AcequiaPublicPlanId = AcequiaPlanId;
/** @deprecated idem. */
export type AcequiaInternalPlanId = AcequiaPlanId;

export interface AcequiaPlanDefinition {
  id: AcequiaPlanId;
  name: string;
  monthlyUsd: number | null;
  annualUsd: number | null;
  /** Proyectos activos por cuenta. */
  projects: number;
  /** Cuentas de usuario que incluye el plan. Solo Estudio trae mas de una: son
   *  cinco cuentas independientes, cada una con su propio tope de proyectos, no
   *  cinco personas sobre el mismo proyecto. */
  seats: number;
  /** El plan se contrata solo, de punta a punta, sin que nadie intervenga.
   *
   *  Falso no significa "no se vende": significa que el alta pasa por una
   *  persona. Semilla es gratis y se resuelve con el registro. Estudio no se
   *  puede cobrar todavia porque sus cinco asientos se dan de alta a mano, y
   *  ofrecerlo con un boton de pago fue exactamente el problema: la vidriera de
   *  arteytierra.org/acequia lo anunciaba a 35/350 y mandaba al checkout, que
   *  rechaza cualquier plan que no sea Personal o Profesional. El visitante
   *  recorria la pantalla de confirmacion del plan mas caro para recibir un
   *  error al final. Con los pagos apagados eso no se notaba.
   *
   *  Cuando los asientos de Estudio esten implementados, esto pasa a true y el
   *  boton de la vidriera vuelve al checkout sin tocar nada mas. */
  selfCheckout: boolean;
}

export const ACEQUIA_PLANS: Record<AcequiaPlanId, AcequiaPlanDefinition> = {
  semilla:      { id: 'semilla',      name: 'Semilla',      monthlyUsd: null, annualUsd: null, projects: 1,  seats: 1, selfCheckout: false },
  personal:     { id: 'personal',     name: 'Personal',     monthlyUsd: 7,    annualUsd: 70,   projects: 2,  seats: 1, selfCheckout: true  },
  profesional:  { id: 'profesional',  name: 'Profesional',  monthlyUsd: 15,   annualUsd: 150,  projects: 10, seats: 1, selfCheckout: true  },
  estudio:      { id: 'estudio',      name: 'Estudio',      monthlyUsd: 35,   annualUsd: 350,  projects: 10, seats: 5, selfCheckout: false },
};

/** Los planes que una persona puede contratar sin que intervenga nadie. */
export function acequiaSelfCheckout(plan: string): boolean {
  const resuelto = resolveAcequiaPaidPlan(plan);
  return resuelto !== null && ACEQUIA_PLANS[resuelto].selfCheckout;
}

export function isAcequiaPaidPlan(value: string): value is AcequiaPaidPlanId {
  return value === 'personal' || value === 'profesional' || value === 'estudio';
}

export function isAcequiaBillingPeriod(value: string): value is AcequiaBillingPeriod {
  return value === 'mensual' || value === 'anual';
}

/** Acepta el identificador actual y el viejo `disenador`. */
export function resolveAcequiaPaidPlan(value: string): AcequiaPaidPlanId | null {
  if (isAcequiaPaidPlan(value)) return value;
  if (value === 'disenador') return 'profesional';
  return null;
}

export function acequiaPlanPrice(plan: AcequiaPaidPlanId, period: AcequiaBillingPeriod): number {
  const definition = ACEQUIA_PLANS[plan];
  return period === 'anual' ? definition.annualUsd! : definition.monthlyUsd!;
}

export function addAcequiaTrialDays(from = new Date()): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + ACEQUIA_TRIAL_DAYS);
  return end;
}


/* ─── Qué habilita cada plan ──────────────────────────────────────────────────
 *
 * La matriz vivía en `apps/terreno/lib/entitlements.ts`, que es donde se
 * aplica. Se mudó acá el 23/09/2026 por la razón de siempre en este repo: la
 * vidriera de arteytierra.org describe los planes en prosa escrita a mano, y la
 * prosa y el candado no tenían ningún punto de contacto por donde compararse.
 *
 * Los precios, los topes y los asientos ya salían de `ACEQUIA_PLANS`. Esto
 * termina el trabajo: también sale de acá QUÉ incluye cada plan.
 *
 * Por qué cada cosa está donde está. El plan pago mínimo es Personal, que
 * desbloquea todo el análisis y el diseño; Profesional hereda lo mismo y suma
 * proyectos y el informe con marca propia; lo de Estudio queda en el tier de
 * arriba. La regla de costo (26/07/2026) es que todo lo que llama a una API
 * externa está bloqueado en Semilla, con una excepción declarada el 15/08/2026:
 * clima, topografía, cuenca y sectores se abren como MUESTRA gratis del
 * producto aunque usen API.
 *
 * Ojo con esa excepción al escribir la vidriera: `analisis.topo` incluye las
 * curvas de nivel, el relieve y la vista 3D —el botón de 3D pregunta por ese
 * mismo permiso—, así que las tres están en Semilla.
 */

/** Cada cosa que un plan puede habilitar. Las claves son jerárquicas para que
 *  la telemetría del candado se lea sola. */
export type AcequiaFeature =
  | 'catastro.rumbos'
  | 'analisis.topo'
  | 'analisis.clima'
  | 'analisis.contexto'
  | 'analisis.entorno'
  | 'analisis.suelo'
  | 'analisis.cobertura'
  | 'analisis.hidrico'
  | 'analisis.solar'
  | 'analisis.sombras'
  | 'analisis.visibilidad'
  | 'analisis.produccion'
  | 'analisis.aptitud'
  | 'analisis.carbono'
  | 'diseno.agua'
  | 'diseno.zonas'
  | 'diseno.sectores'
  | 'diseno.aguadas'
  | 'diseno.caminos'
  | 'diseno.red'
  | 'diseno.cuenca'
  | 'diseno.pastoreo'
  | 'diseno.riego'
  | 'diseno.keyline'
  | 'diseno.economia'
  | 'sugerencias'
  | 'informe.sin_marca'
  | 'informe.white_label'
  | 'export.gis'
  | 'export.dxf'
  | 'colaboracion';

/** Orden de los planes: uno habilita todo lo de los inferiores. */
export const ACEQUIA_PLAN_ORDER: Record<AcequiaPlanId, number> = {
  semilla: 0, personal: 1, profesional: 2, estudio: 3,
};

/** El plan MÍNIMO que habilita cada feature. Lo que no está acá es libre. */
export const ACEQUIA_FEATURES: Record<AcequiaFeature, AcequiaPlanId> = {
  'catastro.rumbos':     'personal',
  // Análisis.
  'analisis.topo':       'semilla',   // muestra gratis (DEM)
  'analisis.clima':      'semilla',   // muestra gratis (Open-Meteo)
  'analisis.contexto':   'personal',
  'analisis.entorno':    'personal',
  'analisis.suelo':      'personal',
  'analisis.cobertura':  'personal',
  'analisis.hidrico':    'personal',
  'analisis.solar':      'personal',
  'analisis.sombras':    'personal',
  'analisis.visibilidad':'personal',
  'analisis.produccion': 'personal',
  'analisis.aptitud':    'personal',
  'analisis.carbono':    'personal',
  // Diseño.
  'diseno.agua':         'personal',
  'diseno.zonas':        'personal',
  'diseno.sectores':     'semilla',   // muestra gratis
  'diseno.aguadas':      'personal',
  'diseno.caminos':      'personal',
  'diseno.red':          'personal',
  'diseno.cuenca':       'semilla',   // muestra gratis (usa el DEM)
  'diseno.pastoreo':     'personal',
  'diseno.riego':        'personal',
  'diseno.keyline':      'personal',
  'diseno.economia':     'personal',
  'sugerencias':         'personal',
  // Entrega.
  'informe.sin_marca':   'personal',
  'informe.white_label': 'profesional',
  'export.gis':          'personal',
  'export.dxf':          'estudio',
  'colaboracion':        'estudio',
};

/** ¿El plan habilita la feature? Es la misma cuenta que hace `can()` en la app. */
export function acequiaPlanHabilita(plan: AcequiaPlanId, feature: AcequiaFeature): boolean {
  return ACEQUIA_PLAN_ORDER[plan] >= ACEQUIA_PLAN_ORDER[ACEQUIA_FEATURES[feature]];
}
