import { ACEQUIA_TRIAL_DAYS } from '@arteytierra/config/acequia';

/**
 * El dato que la web contesta sobre el cobro, y cómo se lo lee.
 *
 * Vive separado de `estadoPagos.ts` —que hace el pedido y es `server-only`—
 * porque la pantalla de confirmación es un componente de cliente y porque la
 * parte que importa, decidir qué se hace con una respuesta incompleta, es una
 * función pura que se puede probar.
 */

export interface EstadoPagos {
  /** Si es false, el checkout responde 503 y no hay nada que ofrecer. */
  pagos: boolean;
  /** Si es true, el alta empieza con una prueba y el primer cobro se corre. */
  prueba: boolean;
  diasPrueba: number;
  /** null = la cotización no está configurada; no se muestra precio en pesos. */
  arsPorUsd: number | null;
}

/**
 * Lo que se asume cuando la web no contesta. Se degrada hacia el lado que no
 * promete de más: sin prueba y sin precio en pesos. El botón de pago sigue
 * estando, porque un problema de red de un lado no es motivo para dejar de
 * vender del otro; si los pagos estuvieran apagados de verdad, el checkout
 * responde 503 y la pantalla lo muestra.
 */
export const ESTADO_PAGOS_POR_DEFECTO: EstadoPagos = {
  pagos: true,
  prueba: false,
  diasPrueba: ACEQUIA_TRIAL_DAYS,
  arsPorUsd: null,
};

/** Lee la respuesta sin confiar en su forma: un campo raro vuelve al default. */
export function normalizarEstadoPagos(crudo: unknown): EstadoPagos {
  if (typeof crudo !== 'object' || crudo === null) return ESTADO_PAGOS_POR_DEFECTO;
  const j = crudo as Partial<Record<keyof EstadoPagos, unknown>>;
  const dias = Number(j.diasPrueba);
  const ars = Number(j.arsPorUsd);
  return {
    pagos: j.pagos !== false,
    prueba: j.prueba === true,
    diasPrueba: Number.isFinite(dias) && dias > 0 ? dias : ACEQUIA_TRIAL_DAYS,
    arsPorUsd: Number.isFinite(ars) && ars > 0 ? ars : null,
  };
}
