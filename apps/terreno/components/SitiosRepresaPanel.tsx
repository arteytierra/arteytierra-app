'use client';

/**
 * Sugerencia automática de sitios de represa, rankeados por EFICIENCIA
 * (agua embalsable ÷ volumen de muro). Prioriza los cuellos de botella entre
 * laderas, donde un muro corto embalsa mucho. Corre el buscador sobre la grilla
 * de hidrología del predio (client-side).
 */
import { useState, useCallback, useEffect } from 'react';
import { Loader2, Sparkles, MapPin, Waves, Check } from 'lucide-react';
import { sugerirSitiosRepresa, bboxDeMojones, type SitioRepresa } from '@/lib/cuencaHidro';
import { volumenM3, volumenEnLitros, miles } from '@/lib/unidades';
import type { Mojon } from '@/lib/types';

/**
 * La búsqueda de sitios tarda y pega contra el DEM: se guarda el resultado, no
 * sólo los parámetros, para no obligar a repetirla cada vez que se vuelve.
 */
export interface SitiosInputs {
  sitios:  SitioRepresa[] | null;
  puestos: number[];
}

interface Props {
  mojones: Mojon[];
  /** vuelca el sitio al mapa: deja el pin del muro (el espejo se dibuja a mano) */
  onPonerEnMapa?: (sitio: SitioRepresa, indice: number) => void;
  inicial?:  SitiosInputs | null;
  onInputs?: (i: SitiosInputs) => void;
}

export function SitiosRepresaPanel({ mojones, onPonerEnMapa, inicial, onInputs }: Props) {
  const [puestos, setPuestos] = useState<Set<number>>(new Set(inicial?.puestos ?? []));
  const [cargando, setCargando] = useState(false);
  const [sitios, setSitios]     = useState<SitioRepresa[] | null>(inicial?.sitios ?? null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => { onInputs?.({ sitios, puestos: [...puestos] }); }, [sitios, puestos, onInputs]);

  const buscar = useCallback(async () => {
    if (mojones.length < 3) { setError('Cargá el terreno (al menos 3 mojones) primero.'); return; }
    setCargando(true); setError(null); setSitios(null); setPuestos(new Set());
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
                <span className="text-[9px] text-ink-700/55 shrink-0">{volumenEnLitros(s.volumen_agua_m3)}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <Mini label="Agua" valor={volumenM3(s.volumen_agua_m3)} />
                <Mini label="Muro" valor={`${miles(s.volumen_muro_m3)} m³`} />
                <Mini label="Espejo" valor={`${s.area_ha} ha`} />
                <Mini label="Ancho muro" valor={`${s.ancho_muro_m} m`} />
                <Mini label="Altura" valor={`${s.altura_m} m`} />
                <Mini label="Cota" valor={`${s.elev} m`} />
              </div>
              {/* Sólo el pin del muro. El espejo se llegó a dibujar como
                  polígono, pero el contorno sale del relieve global (~30 m) y a
                  esa resolución es una escalera de píxeles: se leía como una
                  medición del vaso sin serlo. El pin dice dónde mirar, que es
                  lo que una sugerencia puede afirmar con honestidad. */}
              {onPonerEnMapa && (
                <button
                  onClick={() => { onPonerEnMapa(s, i); setPuestos(prev => new Set(prev).add(i)); }}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
                    puestos.has(i)
                      ? 'bg-moss-50 text-moss-700 border-moss-200'
                      : 'bg-water-500/15 hover:bg-water-500/25 text-water-700 border-water-500/40'
                  }`}
                >
                  {puestos.has(i)
                    ? <><Check className="w-3 h-3" /> Sitio puesto en el mapa</>
                    : <><MapPin className="w-3 h-3" /> Poner el sitio en el mapa</>}
                </button>
              )}
            </div>
          ))}
          <p className="text-[9px] text-ink-700/45 leading-relaxed flex gap-1">
            <Waves className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />
            Las cifras salen del relieve global (~30 m) con la altura de muro mejor rankeada: sirven para ordenar los sitios entre sí, no como proyecto. El pin marca dónde iría el muro; el espejo lo dibujás vos en «Cálculo de embalse», sobre las curvas de nivel finas.
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
