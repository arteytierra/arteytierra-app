'use client';

import { useCallback, useState } from 'react';
import type { Cuenca } from '@/lib/cuenca';
import { cuencaAdaptativa, bboxDeMojones, cuencaManualDesdePoligono } from '@/lib/cuencaHidro';
import type { Mojon } from '@/lib/types';

type Vertice = { lat: number; lng: number };

interface Params {
  mojones: Mojon[];
}

/**
 * Delineación de la cuenca de aporte (Fase B del refactor de MapaTerrenoApp).
 * Dueño del modo/resultado/carga/aviso de cuenca y de los tres flujos de cálculo
 * (adaptativa por clic, extender hasta la divisoria, manual desde polígono).
 * Lee `mojones` para acotar/bbox. Devuelve estado+setters con los mismos nombres.
 * `handleEditarCuenca` NO vive acá: vuelca la cuenca a un dibujo editable y navega,
 * así que queda en el padre (toca el doc de diseño y setTab) y lee `cuenca` de acá.
 * Extraído tal cual: misma lógica y mismas dependencias de los handlers.
 */
export function useCuenca({ mojones }: Params) {
  const [cuenca,          setCuenca]          = useState<Cuenca | null>(null);
  const [cuencaLoading,   setCuencaLoading]   = useState(false);
  const [cuencaAviso,     setCuencaAviso]     = useState<string | null>(null);
  const [cuencaExpandida, setCuencaExpandida] = useState(false);

  // Por defecto la acota al terreno; con expand=true sube hasta la divisoria real.
  const procesarCuenca = useCallback(async (lat: number, lng: number, expand = false) => {
    if (mojones.length < 3) {
      setCuencaAviso('Cargá primero el terreno (al menos 3 mojones) para calcular la cuenca.');
      return;
    }
    setCuencaLoading(true);
    setCuencaAviso(null);
    try {
      const res = await cuencaAdaptativa({ lat, lng }, bboxDeMojones(mojones), {
        expand,
        clip: expand ? undefined : mojones,
      });
      if (res) {
        setCuenca(res.cuenca);
        setCuencaExpandida(expand);
        if (expand && !res.completa) {
          setCuencaAviso('La cuenca puede estar incompleta: la divisoria llega al límite del área analizada.');
        }
      } else {
        setCuencaAviso('No se pudo delinear la cuenca en ese punto. Marcá sobre un cauce o cañada (donde concentraría el agua).');
      }
    } catch {
      setCuencaAviso('Hubo un error al calcular la cuenca. Reintentá.');
    } finally {
      setCuencaLoading(false);
    }
  }, [mojones]);

  // Extender la cuenca actual hasta la divisoria real (desde su punto de salida).
  const handleExtenderCuenca = useCallback(() => {
    if (cuenca) void procesarCuenca(cuenca.outlet.lat, cuenca.outlet.lng, true);
  }, [cuenca, procesarCuenca]);

  // Cuenca manual: usar un polígono dibujado como cuenca de aporte.
  const handleUsarPoligonoCuenca = useCallback(async (vertices: Vertice[]) => {
    if (vertices.length < 3) return;
    setCuencaLoading(true); setCuencaAviso(null);
    try {
      const c = await cuencaManualDesdePoligono(vertices);
      if (c) { setCuenca(c); setCuencaExpandida(false); }
      else setCuencaAviso('No se pudo calcular la cuenca del polígono. Fijate que tenga relieve cargado.');
    } catch {
      setCuencaAviso('Hubo un error al calcular la cuenca manual. Reintentá.');
    } finally {
      setCuencaLoading(false);
    }
  }, []);

  return {
    cuenca, setCuenca,
    cuencaLoading,
    cuencaAviso, setCuencaAviso,
    cuencaExpandida, setCuencaExpandida,
    procesarCuenca,
    handleExtenderCuenca,
    handleUsarPoligonoCuenca,
  };
}
