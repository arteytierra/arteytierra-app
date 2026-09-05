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
 * El hook de ecorregión ya redondea el punto a ~1 km y cachea, así que llamarlo
 * desde varios paneles no multiplica las consultas.
 */
import type { DatosClima } from './clima';
import { resolverBioma } from './contexto';
import { useEcorregion } from './useEcorregion';
import type { BiomaFicha } from './biomaTipos';

/**
 * `null` cuando todavía no hay clima —sin clase Köppen no hay ficha— o cuando
 * el punto no tiene ficha curada ni respaldo global. Los llamadores tienen que
 * seguir funcionando sin ella: la ficha suma, no habilita.
 */
export function useFichaBioma(
  datosClima: DatosClima | null,
  elevacion?: number,
): BiomaFicha | null {
  const lat = datosClima?.lat ?? null;
  const lng = datosClima?.lng ?? null;
  const eco = useEcorregion(lat, lng);

  if (!datosClima?.koppen || lat === null || lng === null) return null;
  return resolverBioma(datosClima.koppen, lat, lng, elevacion, eco).ficha;
}
