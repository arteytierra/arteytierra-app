'use client';

/**
 * Sugerencia automática de sitios de represa, rankeados por EFICIENCIA
 * (agua embalsable ÷ volumen de muro). Prioriza los cuellos de botella entre
 * laderas, donde un muro corto embalsa mucho. Corre el buscador sobre la grilla
 * de hidrología del predio (client-side).
 */
import { useState, useCallback } from 'react';
import { Loader2, Sparkles, MapPin, Waves } from 'lucide-react';
import { sugerirSitiosRepresa, bboxDeMojones, type SitioRepresa } from '@/lib/cuencaHidro';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones: Mojon[];
  onUbicar?: (lat: number, lng: number, nombre: string) => void;
}

export function SitiosRepresaPanel({ mojones, onUbicar }: Props) {
  const [cargando, setCargando] = useState(false);
  const [sitios, setSitios]     = useState<SitioRepresa[] | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const buscar = useCallback(async () => {
    if (mojones.length < 3) { setError('Cargá el terreno (al menos 3 mojones) primero.'); return; }
    setCargando(true); setError(null); setSitios(null);
    try {
      const s = await sugerirSitiosRepresa(bboxDeMojones(mojones), mojones);
      setSitios(s);
      if (s.length === 0) setError('No se encontraron sitios claros dentro del terreno. Probá con la cuenca a mano.');
    } catch {
      setError('Hubo un error al buscar sitios. Reintentá.');
    } finally {
      setCargando(false);
    }
  }, [mojones]);

  return (
    <div className="space-y-2">
      <button
        onClick={buscar}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-xl text-xs font-medium transition-colors"
      >
        {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {cargando ? 'Buscando sitios…' : 'Sugerir mejores sitios de represa'}
      </button>
      <p className="text-[10px] text-ink-700/55 leading-relaxed">
        Rankeados por eficiencia (agua embalsable ÷ muro): prioriza los cuellos de botella entre laderas, donde poco muro embalsa mucho.
      </p>

      {error && <p className="text-[10px] text-clay-700 leading-relaxed">{error}</p>}

      {sitios && sitios.length > 0 && (
        <div className="space-y-1.5">
          {sitios.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-moss-700 text-bone-50 text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="font-mono text-sm font-bold text-moss-700">{s.eficiencia} : 1</span>
                  <span className="text-[9px] text-ink-700/50">agua/muro</span>
                </span>
                {onUbicar && (
                  <button
                    onClick={() => onUbicar(s.lat, s.lng, `Represa sugerida #${i + 1} (ef. ${s.eficiencia}:1)`)}
                    className="text-[10px] text-water-700 hover:text-water-900 flex items-center gap-1 shrink-0"
                  >
                    <MapPin className="w-3 h-3" /> Ubicar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <Mini label="Agua" valor={`${(s.volumen_agua_m3 / 1000).toFixed(1)} dam³`} />
                <Mini label="Muro" valor={`${s.volumen_muro_m3.toLocaleString('es-AR')} m³`} />
                <Mini label="Espejo" valor={`${s.area_ha} ha`} />
                <Mini label="Ancho muro" valor={`${s.ancho_muro_m} m`} />
                <Mini label="Altura" valor={`${s.altura_m} m`} />
                <Mini label="Cota" valor={`${s.elev} m`} />
              </div>
            </div>
          ))}
          <p className="text-[9px] text-ink-700/45 leading-relaxed flex gap-1">
            <Waves className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />
            Estimación sobre SRTM ~30 m (muro de ladera estándar). Orientativo para elegir dónde mirar; dibujá el espejo y calculá el embalse para el detalle.
          </p>
        </div>
      )}
    </div>
  );
}

function Mini({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-bone-50 rounded px-1.5 py-1">
      <span className="text-ink-700/50 block leading-none">{label}</span>
      <span className="font-mono font-bold text-ink-900 leading-tight">{valor}</span>
    </div>
  );
}
