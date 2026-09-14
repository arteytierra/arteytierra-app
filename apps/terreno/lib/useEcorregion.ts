'use client';

import { useEffect, useState } from 'react';
import type { Ecorregion } from './ecorregiones';
import {
  claveEcorregion,
  ecorregionCacheada,
  hayEcorregionCacheada,
  pedirEcorregion,
} from './ecorregionDelPunto';

/**
 * La ecorregión RESOLVE del predio.
 *
 * Antes devolvía `null` mientras la consulta estaba en vuelo, y quien la usaba
 * no podía distinguir ese `null` del de "no hay ecorregión acá". El panel de
 * contexto entonces armaba la ficha por la heurística Köppen y la mostraba
 * entera —nombre del ecosistema, vegetación, fauna, suelos, saberes, especies—
 * hasta que llegaba la respuesta y la reemplazaba por otra distinta. En Sorata
 * el predio era "Puna y altoandino" durante un segundo y después "Puna húmeda
 * central". Aptitud hacía lo mismo con los puntajes y el mapa, y calendario con
 * la lista de cultivos. Es la falla de siempre de esta app —un dato plausible y
 * equivocado— sólo que dura poco.
 *
 * Ahora el hook dice en qué estado está, y la caché de `ecorregionDelPunto`
 * hace que la segunda pantalla que pregunta ya tenga la respuesta en su primer
 * render, sin parpadeo y sin una consulta más.
 */

export type EstadoEcorregion =
  /** La consulta está en vuelo. No hay nada que afirmar todavía. */
  | 'resolviendo'
  /** Llegó una ecorregión. */
  | 'resuelta'
  /** No hay punto, o la consulta terminó sin ecorregión. Es un estado final:
   *  acá sí corresponde el respaldo por Köppen con su aviso. */
  | 'sin_dato';

export interface EcorregionDelPunto {
  eco: Ecorregion | null;
  estado: EstadoEcorregion;
  /** Atajo de `estado === 'resolviendo'`, que es lo que casi siempre se pregunta. */
  resolviendo: boolean;
}

const SIN_PUNTO: EcorregionDelPunto = { eco: null, estado: 'sin_dato', resolviendo: false };

function asentada(eco: Ecorregion | null): EcorregionDelPunto {
  return eco
    ? { eco, estado: 'resuelta', resolviendo: false }
    : { eco: null, estado: 'sin_dato', resolviendo: false };
}

function estadoInicial(clave: string | null): EcorregionDelPunto {
  if (!clave) return SIN_PUNTO;
  if (hayEcorregionCacheada(clave)) return asentada(ecorregionCacheada(clave));
  return { eco: null, estado: 'resolviendo', resolviendo: true };
}

export function useEcorregion(lat: number | null, lng: number | null): EcorregionDelPunto {
  const clave = claveEcorregion(lat, lng);
  const [estado, setEstado] = useState<EcorregionDelPunto>(() => estadoInicial(clave));

  useEffect(() => {
    if (!clave) { setEstado(SIN_PUNTO); return; }

    // Ya consultada en esta sesión: se asienta en el mismo render, sin parpadeo.
    if (hayEcorregionCacheada(clave)) { setEstado(asentada(ecorregionCacheada(clave))); return; }

    let vivo = true;
    setEstado({ eco: null, estado: 'resolviendo', resolviendo: true });
    pedirEcorregion(clave).then((eco) => { if (vivo) setEstado(asentada(eco)); });

    return () => { vivo = false; };
  }, [clave]);

  return estado;
}
