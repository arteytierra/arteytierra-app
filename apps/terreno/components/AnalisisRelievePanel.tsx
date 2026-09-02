'use client';

/**
 * Análisis topográfico integral: en una sola pasada sobre la grilla de relieve
 * calcula y muestra JUNTOS los mejores sitios de represa (por eficiencia), las
 * zonas aptas para vivienda y los caminos de acceso por cresta que las conectan.
 * "Colocar en el plano" vuelca todo (pines + caminos + pins de cruce).
 */
import { useState, useCallback, useEffect } from 'react';
import { Loader2, Mountain, Droplets, MapPin, Sparkles } from 'lucide-react';
import { analizarTopografiaIntegral, type AnalisisTopoIntegral } from '@/lib/cuencaHidro';
import type { Mojon } from '@/lib/types';
import { volumenM3, miles } from '@/lib/unidades';
import { useTextoRelieve } from '@/lib/contextoRelieve';

/**
 * El análisis integral tarda y descarga relieve: se guarda el resultado para
 * que volver a la pestaña no obligue a repetirlo.
 */
export interface AnalisisInputs {
  res:      AnalisisTopoIntegral | null;
  colocado: boolean;
}

interface Props {
  mojones: Mojon[];
  onAplicar: (res: AnalisisTopoIntegral) => void;
  /** ¿Ya se calculó la topografía? (escorrentías/sugerencias dependen de ella). */
  topoLista?: boolean;
  /** Ir a la pestaña Topo (cuando falta la topografía). */
  onIrATopo?: () => void;
  /** Se dispara cuando el análisis termina bien: el padre enciende las capas de
   *  escorrentías + sugerencias y abre el panel de sugerencias. */
  onAnalizado?: () => void;
  inicial?:  AnalisisInputs | null;
  onInputs?: (i: AnalisisInputs) => void;
}

export function AnalisisRelievePanel({ mojones, onAplicar, topoLista = true, onIrATopo, onAnalizado, inicial, onInputs }: Props) {
  const relieve = useTextoRelieve();
  const [cargando, setCargando] = useState(false);
  const [res, setRes]           = useState<AnalisisTopoIntegral | null>(inicial?.res ?? null);
  const [error, setError]       = useState<string | null>(null);
  const [colocado, setColocado] = useState(inicial?.colocado ?? false);

  useEffect(() => { onInputs?.({ res, colocado }); }, [res, colocado, onInputs]);

  const analizar = useCallback(async () => {
    if (mojones.length < 3) { setError('Cargá el terreno (al menos 3 mojones) primero.'); return; }
    setCargando(true); setError(null); setRes(null); setColocado(false);
    try {
      const r = await analizarTopografiaIntegral(mojones);
      if (!r) { setError('No se pudo analizar el relieve (sin datos de elevación).'); return; }
      setRes(r);
      onAnalizado?.();
      if (r.represas.length === 0) {
        setError('El relieve es muy plano o uniforme: sin sitios de represa claros. Igual se calcularon las escorrentías.');
      }
    } catch {
      setError('Hubo un error al analizar el relieve. Reintentá.');
    } finally {
      setCargando(false);
    }
  }, [mojones, onAnalizado]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-ink-900">
        <Sparkles className="w-4 h-4 text-moss-700" />
        <h3 className="font-serif text-sm">Análisis del predio</h3>
      </div>
      <p className="text-[11px] text-ink-700/70 leading-relaxed">
        Acequia analiza el relieve de tu predio y sugiere los mejores sitios de <span className="text-water-700 font-medium">represas</span> por eficiencia agua/tierra, junto a un <span className="text-water-700 font-medium">análisis hídrico de escorrentías</span>. Son sugerencias orientativas: evaluá cuáles incorporás. <span className="text-ink-700/90">Las viviendas y los caminos los propone el <b>Master Plan</b>.</span>
      </p>

      {!topoLista ? (
        <div className="bg-sun-300/15 border border-sun-300 rounded-xl px-3 py-2.5 space-y-1.5">
          <p className="text-[11px] text-ink-900 leading-relaxed">
            Primero calculá la <b>topografía</b> del predio: de ahí salen las escorrentías y las sugerencias.
          </p>
          {onIrATopo && (
            <button onClick={onIrATopo}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-ink-950 hover:bg-ink-700 text-bone-50 rounded-lg text-[11px] font-medium transition-colors">
              <Mountain className="w-3.5 h-3.5" /> Ir a Topografía
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={analizar}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-ink-950 hover:bg-ink-700 disabled:opacity-50 text-bone-50 rounded-xl text-xs font-medium transition-colors"
        >
          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mountain className="w-3.5 h-3.5" />}
          {cargando ? 'Analizando el relieve…' : 'Analizar relieve completo'}
        </button>
      )}

      {error && <p className="text-[10px] text-clay-700 leading-relaxed">{error}</p>}

      {res && res.represas.length > 0 && (
        <div className="space-y-2">
          {/* Represas */}
          <Grupo icono={<Droplets className="w-3.5 h-3.5 text-water-600" />} titulo={`Represas (${res.represas.length})`}>
            {res.represas.map((s, i) => (
              <Fila key={i} izq={`#${i + 1} · ef. ${s.eficiencia}:1`} der={`${volumenM3(s.volumen_agua_m3)} de agua · muro ${miles(s.volumen_muro_m3)} m³`} />
            ))}
          </Grupo>

          <button
            onClick={() => { onAplicar(res); setColocado(true); }}
            disabled={colocado}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-xl text-xs font-semibold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {colocado ? 'Represas colocadas ✓' : 'Colocar represas en el plano'}
          </button>
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            Sobre {relieve} — orientativo. Verificá en campo antes de construir.
          </p>
        </div>
      )}
    </div>
  );
}

function Grupo({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-1">
      <p className="text-[11px] font-semibold text-ink-900 flex items-center gap-1.5">{icono}{titulo}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Fila({ izq, der }: { izq: string; der: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[10px]">
      <span className="font-mono font-bold text-ink-900 shrink-0">{izq}</span>
      <span className="text-ink-700/60 text-right leading-tight">{der}</span>
    </div>
  );
}
