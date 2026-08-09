'use client';

import { useCallback, useState } from 'react';
import type { CapasVisibles } from '@/components/MapLeaflet';

const CAPAS_INICIAL: CapasVisibles = {
  terreno: true, zonas: true, sectores: true, pines: true, caminos: true,
  shaderElev: false, shaderPend: false, terrariumElev: false, escorrentias: false, sugerencias: false, analisisPredio: true, aguadas: true, dibujos: true, arcSolar: false,
  linderoLabels: false, curvasNivel: false, cotas: true, cotasAuto: false, medidas: true,
};

/**
 * Estado de visibilidad del mapa (Fase A del refactor de MapaTerrenoApp):
 *  - `capas`: qué capas se muestran (checkboxes del panel de Capas).
 *  - `ocultosIds`: elementos individuales ocultos (por id).
 *  - `capasOcultas`: capas de usuario ocultas (no-undoable).
 * Extraído tal cual, mismos setters y mismos nombres para el padre.
 */
export function useCapas() {
  const [capas, setCapas] = useState<CapasVisibles>(CAPAS_INICIAL);
  const [ocultosIds, setOcultosIds] = useState<Set<string>>(new Set());
  const [capasOcultas, setCapasOcultas] = useState<Set<string>>(new Set());

  const toggleOculto = useCallback((id: string) => {
    setOcultosIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return { capas, setCapas, ocultosIds, setOcultosIds, capasOcultas, setCapasOcultas, toggleOculto };
}
