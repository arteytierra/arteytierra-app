/**
 * La suscripción tal cual está en la base, y qué hay que decir sobre ella.
 *
 * Vive fuera de `lib/auth/plan.ts` porque ese módulo es `server-only` y el panel
 * de "Mi cuenta" es un componente de cliente. Lo que importa es que el estado
 * que se muestra y el acceso que se otorga salgan de la misma regla: la fila
 * puede decir `activa` con `vigente_hasta` en el pasado —pasa cuando el
 * proveedor deja de avisar una baja—, y ahí `planEfectivo` ya devuelve
 * 'semilla' mientras la pantalla seguía diciendo "Al día". Hoy hay una fila así
 * en producción.
 */

export interface SuscripcionActual {
  plan: string;
  estado: string;
  periodo: string | null;
  provider: string | null;
  vigenteHasta: string | null;
  finDePrueba: string | null;
  seDaDeBajaAlFinal: boolean;
}

export type EstadoEfectivo = 'sin_suscripcion' | 'prueba' | 'activa' | 'vencida' | 'cancelada';

function futura(iso: string | null, ahora: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t > ahora;
}

export function estadoEfectivo(
  s: SuscripcionActual | null,
  ahora: number = Date.now(),
): EstadoEfectivo {
  if (!s) return 'sin_suscripcion';
  if (s.estado === 'cancelada') return 'cancelada';
  if (s.estado === 'prueba') return futura(s.finDePrueba, ahora) ? 'prueba' : 'vencida';
  // Sin fecha de vigencia no hay vencimiento conocido: se recalcula en cada
  // renovación, y mientras tanto el acceso vale. Es el mismo criterio que usa
  // `planEfectivo` para no degradar una suscripción que el proveedor mantiene.
  if (s.estado === 'activa') return s.vigenteHasta === null || futura(s.vigenteHasta, ahora) ? 'activa' : 'vencida';
  return 'vencida';
}

/** Rótulo del estado, el mismo en la tarjeta de arriba y en el panel de abajo. */
export function rotuloEstado(estado: EstadoEfectivo, seDaDeBajaAlFinal: boolean): string {
  switch (estado) {
    case 'sin_suscripcion': return 'Sin cargo';
    case 'prueba':          return 'En prueba';
    case 'activa':          return seDaDeBajaAlFinal ? 'Activa, sin renovación' : 'Activa';
    case 'vencida':         return 'Vencida';
    case 'cancelada':       return 'Dada de baja';
  }
}
