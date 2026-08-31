export const ACEQUIA_TRIAL_DAYS = 3;

export type AcequiaPublicPlanId = 'semilla' | 'personal' | 'profesional' | 'estudio';
export type AcequiaInternalPlanId = 'semilla' | 'personal' | 'disenador' | 'estudio';
export type AcequiaPaidPlanId = Exclude<AcequiaInternalPlanId, 'semilla'>;
export type AcequiaBillingPeriod = 'mensual' | 'anual';

export interface AcequiaPlanDefinition {
  publicId: AcequiaPublicPlanId;
  internalId: AcequiaInternalPlanId;
  name: string;
  monthlyUsd: number | null;
  annualUsd: number | null;
}

export const ACEQUIA_PLANS: Record<AcequiaInternalPlanId, AcequiaPlanDefinition> = {
  semilla: { publicId: 'semilla', internalId: 'semilla', name: 'Semilla', monthlyUsd: null, annualUsd: null },
  personal: { publicId: 'personal', internalId: 'personal', name: 'Personal', monthlyUsd: 7, annualUsd: 70 },
  disenador: { publicId: 'profesional', internalId: 'disenador', name: 'Profesional', monthlyUsd: 12, annualUsd: 120 },
  estudio: { publicId: 'estudio', internalId: 'estudio', name: 'Estudio', monthlyUsd: 35, annualUsd: 350 },
};

export const ACEQUIA_PUBLIC_TO_INTERNAL: Record<AcequiaPublicPlanId, AcequiaInternalPlanId> = {
  semilla: 'semilla',
  personal: 'personal',
  profesional: 'disenador',
  estudio: 'estudio',
};

export function isAcequiaPaidPlan(value: string): value is AcequiaPaidPlanId {
  return value === 'personal' || value === 'disenador' || value === 'estudio';
}

export function isAcequiaBillingPeriod(value: string): value is AcequiaBillingPeriod {
  return value === 'mensual' || value === 'anual';
}

export function resolveAcequiaPaidPlan(value: string): AcequiaPaidPlanId | null {
  if (isAcequiaPaidPlan(value)) return value;
  if (value === 'profesional') return 'disenador';
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
