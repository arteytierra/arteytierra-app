/**
 * Entitlements de Anteproyectos — misma forma que `apps/terreno/lib/
 * entitlements.ts` (Fase A3, ver PLAN-DOS-PISTAS.md), reducida a lo que la
 * app usa hoy: el único límite real es cuántos proyectos puede tener
 * guardados un usuario. No hay todavía funciones pagas separadas del
 * generador — cuando las haya, se agrega un mapa `Feature → Plan` igual
 * que en terreno, no antes.
 */

export type Plan = 'semilla' | 'disenador' | 'estudio';

export const PLANES: Plan[] = ['semilla', 'disenador', 'estudio'];

export const NOMBRE_PLAN: Record<Plan, string> = {
  semilla: 'Semilla',
  disenador: 'Diseñador',
  estudio: 'Estudio',
};

/** Proyectos guardados en simultáneo por plan (Infinity = sin tope). */
export const LIMITE_PROYECTOS: Record<Plan, number> = {
  semilla: 2,
  disenador: 10,
  estudio: Infinity,
};
