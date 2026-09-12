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
}

export const ACEQUIA_PLANS: Record<AcequiaPlanId, AcequiaPlanDefinition> = {
  semilla:      { id: 'semilla',      name: 'Semilla',      monthlyUsd: null, annualUsd: null, projects: 1,  seats: 1 },
  personal:     { id: 'personal',     name: 'Personal',     monthlyUsd: 7,    annualUsd: 70,   projects: 2,  seats: 1 },
  profesional:  { id: 'profesional',  name: 'Profesional',  monthlyUsd: 15,   annualUsd: 150,  projects: 10, seats: 1 },
  estudio:      { id: 'estudio',      name: 'Estudio',      monthlyUsd: 35,   annualUsd: 350,  projects: 10, seats: 5 },
};

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
