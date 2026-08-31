'use client';

import { useEffect, useState } from 'react';
import type { Ecorregion } from './ecorregiones';

/**
 * Consulta la ecorregión RESOLVE del predio contra `/api/bioma`.
 *
 * No bloquea nada: mientras no llega (o si falla, o si el plan no la habilita)
 * devuelve null y quien la use se queda con la clasificación por Köppen, que es
 * exactamente lo que la app hacía antes. Cuando llega, el contexto se afina solo.
 */
export function useEcorregion(lat: number | null, lng: number | null): Ecorregion | null {
  const [eco, setEco] = useState<Ecorregion | null>(null);

  // Redondeo a ~1 km: mover un mojón no dispara una consulta nueva.
  const key = lat !== null && lng !== null ? `${lat.toFixed(2)},${lng.toFixed(2)}` : null;

  useEffect(() => {
    if (!key) { setEco(null); return; }
    let vivo = true;
    const [la, ln] = key.split(',').map(Number);

    fetch('/api/bioma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: la, lng: ln }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: Ecorregion | null) => { if (vivo && j && typeof j.eco_id === 'number') setEco(j); })
      .catch(() => { /* silencio: el fallback por Köppen ya cubre el caso */ });

    return () => { vivo = false; };
  }, [key]);

  return eco;
}
