'use client';

import { useState } from 'react';
import type { DatosTopografia } from '@/lib/topografia';

/**
 * Capa de topografía del terreno: el dato consultado a la fuente
 * (`datosTopografia` — elevaciones, desnivel, pendiente) más su estado de carga
 * y error. El fetch en sí vive en `TopografiaPanel`, que escribe acá vía los
 * setters; este hook sólo agrupa el estado que antes estaba suelto en
 * `MapaTerrenoApp` y que consumen el informe, el autosave, Contexto y el rango
 * de elevación del mapa.
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 4). No cambia comportamiento.
 */
export function useCapaTopografia() {
  const [datosTopografia, setDatosTopografia] = useState<DatosTopografia | null>(null);
  const [topoLoading, setTopoLoading] = useState(false);
  const [topoError, setTopoError] = useState<string | null>(null);

  return {
    datosTopografia, setDatosTopografia,
    topoLoading, setTopoLoading,
    topoError, setTopoError,
  };
}
