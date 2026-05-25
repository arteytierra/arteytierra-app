'use client';

import { useState } from 'react';
import { MapPin, Navigation, MousePointerClick } from 'lucide-react';
import { parsearDecimal, parsearGMS, parsearUTM } from '@/lib/coordenadas';

type Formato = 'decimal' | 'gms' | 'utm';

interface Props {
  modoClick: boolean;
  onToggleModoClick: () => void;
  onAgregar: (lat: number, lng: number) => void;
}

export function MojonForm({ modoClick, onToggleModoClick, onAgregar }: Props) {
  const [formato, setFormato] = useState<Formato>('decimal');
  const [error, setError] = useState<string | null>(null);

  // Decimal
  const [decLat, setDecLat] = useState('');
  const [decLng, setDecLng] = useState('');

  // GMS
  const [gmsLat, setGmsLat] = useState('');
  const [gmsLng, setGmsLng] = useState('');

  // UTM
  const [utmZona, setUtmZona] = useState('20S');
  const [utmEste, setUtmEste] = useState('');
  const [utmNorte, setUtmNorte] = useState('');

  function limpiarCampos() {
    setDecLat(''); setDecLng('');
    setGmsLat(''); setGmsLng('');
    setUtmEste(''); setUtmNorte('');
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let coord = null;

    if (formato === 'decimal') {
      coord = parsearDecimal(decLat, decLng);
      if (!coord) {
        setError('Coordenadas inválidas. Ejemplo: -31.234567 / -64.123456');
        return;
      }
    } else if (formato === 'gms') {
      coord = parsearGMS(gmsLat, gmsLng);
      if (!coord) {
        setError('Formato inválido. Ejemplo: 31°14\'04"S / 64°07\'24"O');
        return;
      }
    } else {
      const este = parseFloat(utmEste.replace(',', '.'));
      const norte = parseFloat(utmNorte.replace(',', '.'));
      if (isNaN(este) || isNaN(norte)) {
        setError('Ingresá Este y Norte como números.');
        return;
      }
      coord = parsearUTM(utmZona, este, norte);
      if (!coord) {
        setError('Zona o coordenadas UTM inválidas. Ejemplo: Zona 20S, Este 398700, Norte 6541200');
        return;
      }
    }

    onAgregar(coord.lat, coord.lng);
    limpiarCampos();
  }

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onAgregar(pos.coords.latitude, pos.coords.longitude);
        setError(null);
      },
      () => setError('No se pudo obtener tu ubicación.'),
    );
  }

  const tabClass = (f: Formato) =>
    `flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
      formato === f
        ? 'bg-white text-moss-900 shadow-paper'
        : 'text-ink-700/60 hover:text-ink-700'
    }`;

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/30 focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors text-xs font-mono';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
          Agregar mojón
        </h3>
        <button
          type="button"
          onClick={usarUbicacion}
          title="Usar mi ubicación GPS"
          className="flex items-center gap-1 text-xs text-moss-700 hover:text-moss-900 transition-colors"
        >
          <Navigation className="w-3 h-3" />
          <span>Mi ubicación</span>
        </button>
      </div>

      {/* Formato tabs */}
      <div className="flex gap-1 bg-bone-100 p-1 rounded-lg">
        <button type="button" className={tabClass('decimal')} onClick={() => { setFormato('decimal'); setError(null); }}>
          Decimal
        </button>
        <button type="button" className={tabClass('gms')} onClick={() => { setFormato('gms'); setError(null); }}>
          GMS
        </button>
        <button type="button" className={tabClass('utm')} onClick={() => { setFormato('utm'); setError(null); }}>
          UTM
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {formato === 'decimal' && (
          <>
            <input
              className={inputClass}
              placeholder="Latitud: -31.234567"
              value={decLat}
              onChange={e => setDecLat(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Longitud: -64.123456"
              value={decLng}
              onChange={e => setDecLng(e.target.value)}
            />
          </>
        )}

        {formato === 'gms' && (
          <>
            <input
              className={inputClass}
              placeholder={`Lat: 31°14'04"S`}
              value={gmsLat}
              onChange={e => setGmsLat(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder={`Lng: 64°07'24"O`}
              value={gmsLng}
              onChange={e => setGmsLng(e.target.value)}
            />
          </>
        )}

        {formato === 'utm' && (
          <>
            <input
              className={inputClass}
              placeholder="Zona: 20S"
              value={utmZona}
              onChange={e => setUtmZona(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Este: 398700"
              value={utmEste}
              onChange={e => setUtmEste(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Norte: 6541200"
              value={utmNorte}
              onChange={e => setUtmNorte(e.target.value)}
            />
          </>
        )}

        {error && (
          <p className="text-xs text-danger-500 leading-snug">{error}</p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          Agregar mojón
        </button>
      </form>

      {/* Clic en mapa */}
      <button
        type="button"
        onClick={onToggleModoClick}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors border ${
          modoClick
            ? 'bg-sun-500 border-sun-500 text-ink-950'
            : 'bg-transparent border-bone-200 text-moss-700 hover:border-moss-300'
        }`}
      >
        <MousePointerClick className="w-3.5 h-3.5" />
        {modoClick ? 'Hacé clic en el mapa…' : 'Clic en el mapa'}
      </button>
    </div>
  );
}
