'use client';

/**
 * La ficha de ecosistema del predio, en un solo llamado.
 *
 * Resolverla son tres pasos —el centro del predio, la ecorregión de ese punto,
 * y la ficha que le corresponde a esa ecorregión con su clima— y hasta ahora los
 * hacía sólo el panel de contexto. Desde que la ficha también corrige la aptitud
 * de uso del suelo y aporta la lista de cultivos al calendario, los necesitan
 * tres pantallas, y repetir el encadenado en cada una es la forma de que se
 * desincronicen.
 *
 * El hook de ecorregión cachea por punto redondeado a ~1 km, así que llamarlo
 * desde varios paneles no multiplica las consultas: la primera pantalla que
 * pregunta paga la espera y las demás la reciben ya resuelta.
 */
import type { DatosClima } from './clima';
import { resolverBioma } from './contexto';
import { useEcorregion } from './useEcorregion';
import type { BiomaFicha } from './biomaTipos';

export interface FichaDelPredio {
  /**
   * `null` cuando todavía no hay clima —sin clase Köppen no hay ficha— o cuando
   * el punto no tiene ficha curada ni respaldo global. Los llamadores tienen que
   * seguir funcionando sin ella: la ficha suma, no habilita.
   */
  ficha: BiomaFicha | null;
  /**
   * `true` mientras la ecorregión está en vuelo. Importa porque la ficha que se
   * arma sin ella sale de la heurística Köppen y puede no ser la misma que la
   * de la ecorregión real: quien muestre algo derivado de la ficha no debería
   * presentarlo como definitivo mientras esto sea `true`.
   */
  resolviendo: boolean;
}

export function useFichaBioma(
  datosClima: DatosClima | null,
  elevacion?: number,
): FichaDelPredio {
  const lat = datosClima?.lat ?? null;
  const lng = datosClima?.lng ?? null;
  const { eco, resolviendo } = useEcorregion(lat, lng);

  if (!datosClima?.koppen || lat === null || lng === null) {
    return { ficha: null, resolviendo: false };
  }
  return {
    ficha: resolverBioma(datosClima.koppen, lat, lng, elevacion, eco).ficha,
    resolviendo,
  };
}
