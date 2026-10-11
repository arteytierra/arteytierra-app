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
 * Devuelve `[]` mientras no llega, si falla, o si el plan no lo habilita. Acá el
 * `[]` es además el resultado normal: hay dos polígonos aprobados en todo el
 * registro, así que casi cualquier predio del mundo no activa ninguno.
 *
 * `listo` existe porque la compuerta del saber usa el ECO_ID, y el ECO_ID llega
 * después que el punto. Consultando igual, la ruta se llamaba dos veces —una sin
 * ecorregión y otra con ella— y la primera evaluaba la compuerta con un dato que
 * todavía no estaba. Se espera a que la ecorregión se asiente y se pregunta una
 * sola vez, con todo.
 */
export function useSaberes(
  lat: number | null,
  lng: number | null,
  opciones: { ecoId?: number; listo: boolean },
): SaberActivo[] {
  const { ecoId, listo } = opciones;
  const [saberes, setSaberes] = useState<SaberActivo[]>([]);

  // Redondeo a ~1 km, igual que la ecorregión: mover un mojón no reconsulta.
  const key = lat !== null && lng !== null ? `${lat.toFixed(2)},${lng.toFixed(2)}` : null;

  useEffect(() => {
    if (!key || !listo) { setSaberes([]); return; }
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
  }, [key, ecoId, listo]);

  return saberes;
}
