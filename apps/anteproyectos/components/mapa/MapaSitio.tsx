'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const MapaSitioInterno = dynamic(() => import('./MapaSitioInterno').then(m => m.MapaSitioInterno), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-ink-500">Cargando mapa…</div>,
});

interface Props {
  lat: string;
  lng: string;
  onCambiar: (lat: string, lng: string) => void;
}

/**
 * Selector de sitio en mapa real (Fase A4) — reemplaza cargar lat/lng a
 * mano por un click en el mapa, con el recorrido del sol del año dibujado
 * en cuanto hay un punto elegido.
 */
export function MapaSitio({ lat, lng, onCambiar }: Props) {
  const [errorGeo, setErrorGeo] = useState<string | null>(null);

  const latN = lat.trim() === '' ? null : Number.parseFloat(lat);
  const lngN = lng.trim() === '' ? null : Number.parseFloat(lng);

  function usarMiUbicacion() {
    setErrorGeo(null);
    if (!('geolocation' in navigator)) {
      setErrorGeo('Este navegador no puede compartir tu ubicación.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => onCambiar(String(pos.coords.latitude), String(pos.coords.longitude)),
      () => setErrorGeo('No se pudo obtener tu ubicación. Elegí el punto en el mapa.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-ink-600">Hacé click en el mapa para ubicar el sitio.</p>
        <button
          type="button"
          onClick={usarMiUbicacion}
          className="rounded border border-bone-200 bg-white px-2 py-1 text-xs text-moss-700 hover:bg-bone-50"
        >
          Usar mi ubicación
        </button>
      </div>
      {errorGeo && <p className="mb-2 text-xs text-red-700">{errorGeo}</p>}
      <div className="h-72 w-full overflow-hidden rounded border border-bone-200">
        <MapaSitioInterno
          lat={latN !== null && !Number.isNaN(latN) ? latN : null}
          lng={lngN !== null && !Number.isNaN(lngN) ? lngN : null}
          onSeleccionar={(nuevaLat, nuevaLng) => onCambiar(nuevaLat.toFixed(6), nuevaLng.toFixed(6))}
        />
      </div>
    </div>
  );
}
