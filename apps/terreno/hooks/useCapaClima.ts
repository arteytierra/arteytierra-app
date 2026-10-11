'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  aplicarCalibracionPrecip, aplicarCorreccionAltura, obtenerPrecipCHIRPS, centroide,
  type DatosClima, type CalibracionPrecip,
} from '@/lib/clima';
// `lib/elevacion` NO se importa acá: lee los COG de Copernicus directo del
// bucket de AWS, y ese bucket no manda cabecera CORS, así que desde el navegador
// la lectura falla SIEMPRE y cae al respaldo. La app seguía andando —por eso no
// se notaba— pero la altura con la que se corrige la temperatura venía de GLO-90
// y no de GLO-30, con un error de red y un round trip de regalo en cada predio.
// Del lado del servidor no hay CORS: `/api/elevacion` hace exactamente esto,
// con caché de 30 días.
import { calibrarExtremos } from '@/lib/climaCalibracionSerie';
import type { Extremos } from '@/lib/climaExtremos';

/**
 * Capa de clima del terreno: el dato crudo de POWER (`datosClimaRaw`), la
 * calibración de precipitación (manual o automática por CHIRPS), la corrección
 * de temperatura por altura y los extremos.
 *
 * `datosClima` — lo que consume toda la app — es el derivado de encadenar las dos
 * correcciones sobre el crudo, **en este orden y no en el otro**:
 *
 *   1. `aplicarCalibracionPrecip` arregla la lluvia, que la grilla de ~50 km
 *      subestima en terreno quebrado.
 *   2. `aplicarCorreccionAltura` arregla la temperatura, que la misma grilla
 *      devuelve para la altura media de la celda y no para la del predio.
 *
 * El orden importa porque el balance hídrico mensual es `precip − ETP` y las dos
 * correcciones mueven un término cada una: la altura tiene que ver la lluvia ya
 * calibrada para recomputar el balance bien. Al revés, la calibración pisaría la
 * ETP corregida con la vieja.
 *
 * La **serie diaria** sigue el mismo patrón y por el mismo motivo. Hasta el
 * 10/10/2026 la calibración llegaba sólo a la climatología, así que cargar el
 * pluviómetro del predio arreglaba la aridez, la receptividad y la captación y
 * dejaba el balance hídrico corriendo sobre la lluvia del reanálisis: media app
 * calibrada y la otra mitad no. Ahora `datosExtremosRaw` es lo que se guarda y
 * lo que el servidor devuelve, y `datosExtremos` —lo que consume la app— es el
 * derivado.
 *
 * El factor NO es el mismo que el de la climatología aunque el objetivo sea el
 * mismo: son dos fuentes con dos totales distintos sobre el mismo punto, así que
 * `calibrarExtremos` se saca el suyo contra la media de su propia serie. Y
 * escala las acumulaciones, no los extremos: la tormenta de diseño queda cruda a
 * propósito. El porqué está en `lib/climaCalibracionSerie.ts`.
 *
 * Apenas hay clima crudo, el hook busca CHIRPS (~5 km) y lo aplica como
 * calibración automática, **sin pisar nunca** una calibración cargada a mano. Se
 * intenta una sola vez por celda (~5 km): si el usuario la quita, no vuelve sola.
 *
 * La altura del predio entra por dos caminos, y el mejor gana. Si el análisis de
 * relieve ya corrió, manda `alturaTopoM` —la media de todo el predio, que es el
 * dato bueno—. Si no corrió, el hook pide la elevación del centroide, que es una
 * sola consulta y alcanza para corregir: sin esto la corrección no existiría
 * hasta que alguien abriera la pestaña de topografía, y el clima se mira antes.
 *
 * Extraído de `MapaTerrenoApp` (Fase 1, etapa 2).
 */
export function useCapaClima(
  mojones: Array<{ lat: number; lng: number }>,
  alturaTopoM?: number | null,
) {
  const [datosClimaRaw, setDatosClimaRaw] = useState<DatosClima | null>(null);
  const [calibracionPrecip, setCalibracionPrecip] = useState<CalibracionPrecip | null>(null);
  const [datosExtremosRaw, setDatosExtremosRaw] = useState<Extremos | null>(null);
  const [buscandoCHIRPS, setBuscandoCHIRPS] = useState(false);
  const [alturaPunto, setAlturaPunto] = useState<number | null>(null);

  // La celda redondeada (~5 km) evita reintentar con cada mojón que se mueve.
  const celdaClima = useMemo(() => {
    if (mojones.length === 0) return null;
    const c = centroide(mojones);
    return { lat: Math.round(c.lat / 0.05) * 0.05, lng: Math.round(c.lng / 0.05) * 0.05 };
  }, [mojones]);

  // El relieve gana cuando está: es la media del predio y no un punto suelto.
  const alturaPredioM = alturaTopoM ?? alturaPunto;

  const datosClima = useMemo(
    () => {
      if (!datosClimaRaw) return null;
      return aplicarCorreccionAltura(
        aplicarCalibracionPrecip(datosClimaRaw, calibracionPrecip),
        alturaPredioM,
      );
    },
    [datosClimaRaw, calibracionPrecip, alturaPredioM],
  );

  const datosExtremos = useMemo(
    () => calibrarExtremos(datosExtremosRaw, calibracionPrecip),
    [datosExtremosRaw, calibracionPrecip],
  );

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

  // Altura del centroide, sólo si hace falta: si el relieve ya la dio, no se
  // pide. Se reintenta al cambiar de celda y se queda en null si falla, que es
  // lo mismo que no tenerla: sin altura no se corrige y la pantalla lo aclara.
  const necesitaAltura = hayClimaCrudo && alturaTopoM == null;
  useEffect(() => { setAlturaPunto(null); }, [celdaClima]);

  useEffect(() => {
    if (!necesitaAltura || !celdaClima) return;
    let vivo = true;
    const c = centroide(mojones);
    fetch(`/api/elevacion?locations=${c.lat.toFixed(5)},${c.lng.toFixed(5)}`, {
      signal: AbortSignal.timeout(20_000),
    })
      .then(r => (r.ok ? r.json() as Promise<{ results?: Array<{ elevation: number | null }> }> : null))
      .then(j => {
        const z = j?.results?.[0]?.elevation;
        if (vivo && typeof z === 'number' && Number.isFinite(z)) setAlturaPunto(z);
      })
      .catch(() => { /* sin altura no se corrige; no es un error que mostrar */ });
    return () => { vivo = false; };
    // `mojones` cambia de identidad con cada arrastre: la dependencia es la celda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [necesitaAltura, celdaClima]);

  return {
    datosClima, datosClimaRaw, setDatosClimaRaw,
    calibracionPrecip, setCalibracionPrecip,
    datosExtremos, datosExtremosRaw, setDatosExtremos: setDatosExtremosRaw,
    buscandoCHIRPS,
  };
}
