'use client';

import { useEffect, useState } from 'react';
import type { SaberTerritorial } from './saberesTipos';

export interface SaberActivo {
  saber: SaberTerritorial;
  geometria: { fuente: string; url: string; licencia: string };
}

/**
 * Saberes territoriales activos sobre el predio, contra `/api/saberes`.
 *
 * Mismo contrato que `useEcorregion`: no bloquea nada y devuelve `[]` mientras
 * no llega, si falla, o si el plan no lo habilita. La diferencia es que acá el
 * `[]` es además el resultado normal: hoy hay un solo polígono aprobado en todo
 * el registro, así que casi cualquier predio del mundo no activa ninguno.
 */
export function useSaberes(
  lat: number | null,
  lng: number | null,
  ecoId?: number,
): SaberActivo[] {
  const [saberes, setSaberes] = useState<SaberActivo[]>([]);

  // Redondeo a ~1 km, igual que la ecorregión: mover un mojón no reconsulta.
  const key = lat !== null && lng !== null ? `${lat.toFixed(2)},${lng.toFixed(2)}` : null;

  useEffect(() => {
    if (!key) { setSaberes([]); return; }
    let vivo = true;
    const [la, ln] = key.split(',').map(Number);

    fetch('/api/saberes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: la, lng: ln, ecoId }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: { saberes?: SaberActivo[] } | null) => {
        if (vivo && Array.isArray(j?.saberes)) setSaberes(j.saberes);
      })
      .catch(() => { /* silencio: no mostrar saberes es el estado correcto */ });

    return () => { vivo = false; };
  }, [key, ecoId]);

  return saberes;
}
