'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  aplicarCalibracionPrecip, obtenerPrecipCHIRPS, centroide,
  type DatosClima, type CalibracionPrecip,
} from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';

/**
 * Capa de clima del terreno: el dato crudo de POWER (`datosClimaRaw`), la
 * calibración de precipitación (manual o automática por CHIRPS) y los extremos.
 *
 * `datosClima` — lo que consume toda la app — es el derivado
 * `aplicarCalibracionPrecip(crudo, calibración)`. Apenas hay clima crudo, el hook
 * busca CHIRPS (~5 km) y lo aplica como calibración automática, **sin pisar nunca**
 * una calibración cargada a mano. Se intenta una sola vez por celda (~5 km): si el
 * usuario la quita, no vuelve sola.
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 2). No cambia comportamiento.
 */
export function useCapaClima(mojones: Array<{ lat: number; lng: number }>) {
  const [datosClimaRaw, setDatosClimaRaw] = useState<DatosClima | null>(null);
  const [calibracionPrecip, setCalibracionPrecip] = useState<CalibracionPrecip | null>(null);
  const [datosExtremos, setDatosExtremos] = useState<Extremos | null>(null);
  const [buscandoCHIRPS, setBuscandoCHIRPS] = useState(false);

  const datosClima = useMemo(
    () => (datosClimaRaw ? aplicarCalibracionPrecip(datosClimaRaw, calibracionPrecip) : null),
    [datosClimaRaw, calibracionPrecip],
  );

  // La celda redondeada (~5 km) evita reintentar con cada mojón que se mueve.
  const celdaClima = useMemo(() => {
    if (mojones.length === 0) return null;
    const c = centroide(mojones);
    return { lat: Math.round(c.lat / 0.05) * 0.05, lng: Math.round(c.lng / 0.05) * 0.05 };
  }, [mojones]);

  const hayClimaCrudo = !!datosClimaRaw;
  const hayCalibracionManual = calibracionPrecip?.origen === 'manual';
  const [chirpsIntentado, setChirpsIntentado] = useState(false);
  useEffect(() => { setChirpsIntentado(false); }, [celdaClima]);

  useEffect(() => {
    if (!hayClimaCrudo || !celdaClima || chirpsIntentado || hayCalibracionManual) return;

    const ctrl = new AbortController();
    setBuscandoCHIRPS(true);
    obtenerPrecipCHIRPS(celdaClima.lat, celdaClima.lng, { señal: ctrl.signal })
      .then(cal => {
        if (ctrl.signal.aborted) return;
        if (cal) setCalibracionPrecip(cal);
        setChirpsIntentado(true);
      })
      .finally(() => { if (!ctrl.signal.aborted) setBuscandoCHIRPS(false); });

    return () => ctrl.abort();
  }, [hayClimaCrudo, celdaClima, chirpsIntentado, hayCalibracionManual]);

  return {
    datosClima, datosClimaRaw, setDatosClimaRaw,
    calibracionPrecip, setCalibracionPrecip,
    datosExtremos, setDatosExtremos,
    buscandoCHIRPS,
  };
}
