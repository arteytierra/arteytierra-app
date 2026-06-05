'use client';

import { useState, useRef } from 'react';
import { MapPin, Navigation, MousePointerClick, Upload, ChevronDown, List } from 'lucide-react';
import { parsearDecimal, parsearGMS, parsearUTM } from '@/lib/coordenadas';
import { importarKML, importarKMZ, importarCSV } from '@/lib/importar';
import type { Mojon } from '@/lib/types';

type Formato = 'decimal' | 'gms' | 'utm';

interface Props {
  modoClick:         boolean;
  onToggleModoClick: () => void;
  onAgregar:         (lat: number, lng: number) => void;
  onCargarMojones?:  (mojones: Mojon[]) => void;
}

export function MojonForm({ modoClick, onToggleModoClick, onAgregar, onCargarMojones }: Props) {
  const [formato,   setFormato]   = useState<Formato>('decimal');
  const [error,     setError]     = useState<string | null>(null);
  const [geoLoad,   setGeoLoad]   = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [pegando,   setPegando]   = useState(false);
  const [textCoords, setTextCoords] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Decimal
  const [decLat, setDecLat] = useState('');
  const [decLng, setDecLng] = useState('');

  // GMS
  const [gmsLat, setGmsLat] = useState('');
  const [gmsLng, setGmsLng] = useState('');

  // UTM
  const [utmZona,  setUtmZona]  = useState('20S');
  const [utmEste,  setUtmEste]  = useState('');
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
      if (!coord) { setError('Coordenadas inválidas. Ejemplo: -31.234567 / -64.123456'); return; }
    } else if (formato === 'gms') {
      coord = parsearGMS(gmsLat, gmsLng);
      if (!coord) { setError('Formato inválido. Ejemplo: 31°14\'04"S / 64°07\'24"O'); return; }
    } else {
      const este  = parseFloat(utmEste.replace(',', '.'));
      const norte = parseFloat(utmNorte.replace(',', '.'));
      if (isNaN(este) || isNaN(norte)) { setError('Ingresá Este y Norte como números.'); return; }
      coord = parsearUTM(utmZona, este, norte);
      if (!coord) { setError('Zona o coordenadas UTM inválidas. Ejemplo: Zona 20S, Este 398700, Norte 6541200'); return; }
    }

    onAgregar(coord.lat, coord.lng);
    limpiarCampos();
  }

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoad(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onAgregar(pos.coords.latitude, pos.coords.longitude);
        setGeoLoad(false);
      },
      (err) => {
        setGeoLoad(false);
        if (err.code === 1) setError('Permiso de ubicación denegado. Habilitalo en la configuración del navegador.');
        else if (err.code === 2) setError('Posición no disponible. Revisá que el GPS o la red estén activos.');
        else setError('Tiempo agotado al obtener la ubicación. Intentá de nuevo.');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function handleImportarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onCargarMojones) return;
    setImportErr(null);
    try {
      let mojones: Mojon[] = [];
      if (file.name.endsWith('.kmz'))      mojones = await importarKMZ(file);
      else if (file.name.endsWith('.kml')) mojones = await importarKML(file);
      else if (file.name.endsWith('.csv')) mojones = await importarCSV(file);
      else { setImportErr('Formato no soportado. Usá .kml, .kmz o .csv'); return; }
      onCargarMojones(mojones);
    } catch (err) {
      setImportErr(err instanceof Error ? err.message : 'Error al importar el archivo.');
    } finally {
      e.target.value = '';
    }
  }

  function handlePegarCoords() {
    setImportErr(null);
    const lineas = textCoords.split(/\r?\n/).filter(l => l.trim());
    const puntos: Array<{ lat: number; lng: number }> = [];

    for (const linea of lineas) {
      // Acepta: "lat, lng" / "lat lng" / "lat;lng" con cualquier separador
      const partes = linea.trim().split(/[\s,;]+/);
      if (partes.length < 2) continue;
      const a = parseFloat(partes[0]!.replace(',', '.'));
      const b = parseFloat(partes[1]!.replace(',', '.'));
      if (!isNaN(a) && !isNaN(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180)
        puntos.push({ lat: a, lng: b });
    }

    if (puntos.length === 0) { setImportErr('No se encontraron coordenadas válidas. Usá formato: lat, lng (una por línea).'); return; }

    if (onCargarMojones) {
      onCargarMojones(puntos.map((p, i) => ({ id: crypto.randomUUID(), numero: i + 1, lat: p.lat, lng: p.lng })));
    } else {
      puntos.forEach(p => onAgregar(p.lat, p.lng));
    }
    setTextCoords('');
    setPegando(false);
  }

  const tabClass = (f: Formato) =>
    `flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
      formato === f ? 'bg-white text-moss-900 shadow-paper' : 'text-ink-700/60 hover:text-ink-700'
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
          disabled={geoLoad}
          title="Usar mi ubicación GPS"
          className="flex items-center gap-1 text-xs text-moss-700 hover:text-moss-900 disabled:opacity-50 transition-colors"
        >
          {geoLoad
            ? <span className="w-3 h-3 border border-moss-700 border-t-transparent rounded-full animate-spin" />
            : <Navigation className="w-3 h-3" />
          }
          <span>{geoLoad ? 'Buscando…' : 'Mi ubicación'}</span>
        </button>
      </div>

      {/* Formato tabs */}
      <div className="flex gap-1 bg-bone-100 p-1 rounded-lg">
        <button type="button" className={tabClass('decimal')} onClick={() => { setFormato('decimal'); setError(null); }}>Decimal</button>
        <button type="button" className={tabClass('gms')}     onClick={() => { setFormato('gms');     setError(null); }}>GMS</button>
        <button type="button" className={tabClass('utm')}     onClick={() => { setFormato('utm');     setError(null); }}>UTM</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {formato === 'decimal' && (
          <>
            <input className={inputClass} placeholder="Latitud: -31.234567"   value={decLat} onChange={e => setDecLat(e.target.value)} />
            <input className={inputClass} placeholder="Longitud: -64.123456"  value={decLng} onChange={e => setDecLng(e.target.value)} />
          </>
        )}
        {formato === 'gms' && (
          <>
            <input className={inputClass} placeholder={`Lat: 31°14'04"S`} value={gmsLat} onChange={e => setGmsLat(e.target.value)} />
            <input className={inputClass} placeholder={`Lng: 64°07'24"O`} value={gmsLng} onChange={e => setGmsLng(e.target.value)} />
          </>
        )}
        {formato === 'utm' && (
          <>
            <input className={inputClass} placeholder="Zona: 20S"        value={utmZona}  onChange={e => setUtmZona(e.target.value)} />
            <input className={inputClass} placeholder="Este: 398700"      value={utmEste}  onChange={e => setUtmEste(e.target.value)} />
            <input className={inputClass} placeholder="Norte: 6541200"    value={utmNorte} onChange={e => setUtmNorte(e.target.value)} />
          </>
        )}
        {error && <p className="text-xs text-danger-500 leading-snug">{error}</p>}
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors">
          <MapPin className="w-3.5 h-3.5" />
          Agregar mojón
        </button>
      </form>

      {/* Clic en mapa */}
      <button
        type="button"
        onClick={onToggleModoClick}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors border ${
          modoClick ? 'bg-sun-500 border-sun-500 text-ink-950' : 'bg-transparent border-bone-200 text-moss-700 hover:border-moss-300'
        }`}
      >
        <MousePointerClick className="w-3.5 h-3.5" />
        {modoClick ? 'Hacé clic en el mapa…' : 'Clic en el mapa'}
      </button>

      {/* ─── Importar archivo (KML/KMZ/CSV) ─────────────────────────── */}
      {onCargarMojones && (
        <div className="space-y-1.5 border-t border-bone-200 pt-3">
          <p className="text-[10px] text-ink-700/50 uppercase tracking-wide font-semibold">Importar límites del terreno</p>
          <label className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-dashed border-bone-200 hover:border-moss-300 text-moss-700 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Abrir KML / KMZ / CSV
            <input ref={fileRef} type="file" accept=".kml,.kmz,.csv" className="hidden" onChange={handleImportarArchivo} />
          </label>

          {/* Pegar lista de coordenadas */}
          <button
            type="button"
            onClick={() => { setPegando(p => !p); setImportErr(null); }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-bone-200 hover:border-moss-300 text-moss-700 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <List className="w-3.5 h-3.5" />
              Pegar lista de coordenadas
            </span>
            <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${pegando ? 'rotate-180' : ''}`} />
          </button>

          {pegando && (
            <div className="space-y-1.5">
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/30 focus:outline-none focus:ring-2 focus:ring-moss-500/30 focus:border-moss-500 transition-colors text-xs font-mono resize-none"
                rows={6}
                placeholder={`Una coordenada por línea:\n-31.234567, -64.123456\n-31.235678, -64.133456\n-31.243567, -64.143456`}
                value={textCoords}
                onChange={e => setTextCoords(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePegarCoords}
                disabled={!textCoords.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                Cargar coordenadas
              </button>
            </div>
          )}

          {importErr && <p className="text-xs text-danger-500 leading-snug">{importErr}</p>}
        </div>
      )}
    </div>
  );
}
