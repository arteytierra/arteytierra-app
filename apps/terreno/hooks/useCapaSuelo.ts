'use client';

import { useState } from 'react';
import type { DatosSuelo } from '@/lib/suelos';

/**
 * Capa de suelo del terreno: el dato consultado a la fuente (`datosSuelo`)
 * más su estado de carga y error. El fetch en sí vive en `SuelosPanel`, que
 * escribe acá vía los setters; este hook sólo agrupa el estado que antes estaba
 * suelto en `MapaTerrenoApp` y que consumen el informe, el autosave, CutFill y
 * Riego (grupo hidrológico, textura, etc.).
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 3). No cambia comportamiento.
 */
export function useCapaSuelo() {
  const [datosSuelo, setDatosSuelo] = useState<DatosSuelo | null>(null);
  const [sueloLoading, setSueloLoading] = useState(false);
  const [sueloError, setSueloError] = useState<string | null>(null);

  return {
    datosSuelo, setDatosSuelo,
    sueloLoading, setSueloLoading,
    sueloError, setSueloError,
  };
}
