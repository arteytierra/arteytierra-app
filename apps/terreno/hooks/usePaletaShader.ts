'use client';

import { useState, useEffect } from 'react';
import { normalizarPaletaShader, PALETA_SHADER_POR_DEFECTO, type PaletaShader } from '@/lib/shaders';

const LS_KEY = 'terreno.paletaShader';

function leer(): PaletaShader {
  if (typeof window === 'undefined') return PALETA_SHADER_POR_DEFECTO;
  try {
    return normalizarPaletaShader(JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'));
  } catch {
    return PALETA_SHADER_POR_DEFECTO;
  }
}

/**
 * Qué rampa de color usa cada shader, recordada por dispositivo.
 *
 * No es sólo gusto: en un cerro el semáforo de pendiente satura y de la mitad
 * para arriba es todo rojo, y una rampa fuerte de elevación tapa las curvas y
 * los dibujos que van encima. Quien eligió otra rampa lo hizo para poder leer
 * *su* terreno, y esa elección se perdía en cada recarga —justo en la pantalla
 * donde uno recarga seguido, porque la topografía se vuelve a calcular.
 *
 * Va en `localStorage` y no en el documento del predio a propósito: es una
 * preferencia de cómo mirar, no un dato del campo. Misma convención que el tema
 * y los anchos de panel en `useVistaShell`.
 */
export function usePaletaShader() {
  const [paletaShader, setPaletaShader] = useState<PaletaShader>(leer);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(paletaShader)); } catch { /* ignore */ }
  }, [paletaShader]);

  return { paletaShader, setPaletaShader };
}
