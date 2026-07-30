'use client';

import { useState, useCallback } from 'react';
import { Waypoints, Loader2, MapPin, Info, Grid3x3 } from 'lucide-react';
import { obtenerGrillaDensa, grillaDesdeShader, type GrillaElevacion } from '@/lib/grillaElevacion';
import { analizarKeyline, generarPatronCultivo, type ResultadoKeyline, type ResultadoPatron } from '@/lib/keyline';
import type { Mojon } from '@/lib/types';
import type { DatosShader } from '@/lib/shaders';
import type { PoligonoCutFill } from './CutFillPanel';

interface Props {
  mojones:      Mojon[];
  datosShader:  DatosShader | null;
  parcelas:     PoligonoCutFill[];
  onAplicarGuias: (res: ResultadoKeyline) => void;
  onAplicarPatron: (res: ResultadoPatron) => void;
}

export function KeylinePanel({ mojones, datosShader, parcelas, onAplicarGuias, onAplicarPatron }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [res,      setRes]      = useState<ResultadoKeyline | null>(null);
  const [aplicado, setAplicado] = useState(false);
  const [grilla,   setGrilla]   = useState<GrillaElevacion | null>(null);
  // Patrón de cultivo por parcela
  const [parcelaId,   setParcelaId]   = useState('');
  const [espaciado,   setEspaciado]   = useState(12);
  const [suavizado,   setSuavizado]   = useState(50);
  const [cargandoPat, setCargandoPat] = useState(false);
  const [errorPat,    setErrorPat]    = useState<string | null>(null);
  const [patron,      setPatron]      = useState<ResultadoPatron | null>(null);
  const [patronAplic, setPatronAplic] = useState(false);

  const obtenerGrilla = useCallback(async (): Promise<GrillaElevacion | null> => {
    if (grilla) return grilla;
    const g = (await obtenerGrillaDensa(mojones)) ?? (datosShader ? grillaDesdeShader(datosShader) : null);
    if (g) setGrilla(g);
    return g;
  }, [grilla, mojones, datosShader]);

  const analizar = useCallback(async () => {
    if (mojones.length < 3) { setError('Necesitás al menos 3 mojones.'); return; }
    setCargando(true); setError(null); setRes(null); setAplicado(false);
    try {
      const g = await obtenerGrilla();
      if (!g) { setError('No se pudo obtener la elevación del terreno.'); return; }
      const r = analizarKeyline(g);
      if (!r) { setError('No se detectó un valle claro para trazar keyline (terreno muy plano o uniforme).'); return; }
      setRes(r);
    } catch {
      setError('Error al analizar la topografía.');
    } finally {
      setCargando(false);
    }
  }, [mojones, obtenerGrilla]);

  const calcularPatron = useCallback(async () => {
    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) { setErrorPat('Elegí una parcela.'); return; }
    setCargandoPat(true); setErrorPat(null); setPatron(null); setPatronAplic(false);
    try {
      const g = await obtenerGrilla();
      if (!g) { setErrorPat('No se pudo obtener la elevación del terreno.'); return; }
      const p = generarPatronCultivo(g, parcela.vertices, espaciado, suavizado);
      if (!p) { setErrorPat('No se pudo calcular el patrón (parcela muy chica o sin datos de elevación).'); return; }
      setPatron(p);
    } catch {
      setErrorPat('Error al calcular el patrón.');
    } finally {
      setCargandoPat(false);
    }
  }, [parcelas, parcelaId, espaciado, suavizado, obtenerGrilla]);

  return (
    <div className="space-y-4">
      {/* ── Keyline real desde topografía ── */}
      <div>
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Keyline desde topografía</p>
        <button
          onClick={analizar}
          disabled={cargando || mojones.length < 3}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-xl text-xs font-medium transition-colors"
        >
          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Waypoints className="w-3.5 h-3.5" />}
          {cargando ? 'Analizando relieve…' : 'Detectar keypoint y keylines'}
        </button>
        {mojones.length < 3 && <p className="text-[10px] text-ink-700/40 text-center mt-1">Necesitás al menos 3 mojones.</p>}
        {error && <p className="text-[10px] text-clay-600 mt-2 leading-tight">{error}</p>}

        {res && (
          <div className="mt-3 space-y-2 bg-white rounded-xl border border-bone-200 p-3">
            <p className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-moss-700" /> Keypoint ~{res.keypoint.elevation.toFixed(0)} m
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Pend. arriba</span><br /><span className="font-mono font-bold text-ink-900">{res.pendienteArriba_pct}%</span></div>
              <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Pend. abajo</span><br /><span className="font-mono font-bold text-ink-900">{res.pendienteAbajo_pct}%</span></div>
            </div>
            <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1"><Info className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />{res.nota}</p>
            <button
              onClick={() => { onAplicarGuias(res); setAplicado(true); }}
              disabled={aplicado}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${aplicado ? 'bg-moss-100 text-moss-700' : 'bg-ink-900 hover:bg-ink-700 text-bone-50'}`}
            >
              {aplicado ? 'Guías aplicadas al plano ✓' : `Aplicar ${res.guias.length} guías + keypoint al plano`}
            </button>
          </div>
        )}
      </div>

      {/* ── Patrón de cultivo por parcela ── */}
      <div className="border-t border-bone-200 pt-4">
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1">Patrón de cultivo por parcela</p>
        <p className="text-[10px] text-ink-700/55 mb-2 leading-relaxed">
          Un solo patrón de líneas paralelas a espaciado fijo, orientado al mejor promedio de todas las curvas de la parcela — para sembrar/plantar sin seguir cada curva, minimizando arreglos y movimiento de suelo. Sirve para máquinas en poca pendiente o espalderas de vid en mucha.
        </p>
        {parcelas.length === 0 ? (
          <p className="text-[11px] text-ink-700/50 bg-bone-100 rounded-lg px-3 py-2">Dibujá un polígono o zona (la parcela) para calcular su patrón.</p>
        ) : (
          <div className="space-y-2">
            <select value={parcelaId} onChange={e => setParcelaId(e.target.value)}
              className="w-full text-xs bg-white border border-bone-200 rounded-lg px-2 py-1.5 text-ink-900 focus:outline-none focus:border-moss-500">
              <option value="">Elegí la parcela…</option>
              {parcelas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-700/60 shrink-0">Espaciado</span>
              <input type="number" min={2} step={1} value={espaciado}
                onChange={e => { const v = parseFloat(e.target.value); if (Number.isFinite(v) && v >= 2) setEspaciado(v); }}
                className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              <span className="text-[10px] text-ink-700/40">m</span>
              <button onClick={calcularPatron} disabled={cargandoPat || !parcelaId}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-lg text-xs font-medium transition-colors">
                {cargandoPat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Grid3x3 className="w-3.5 h-3.5" />}
                {cargandoPat ? '…' : 'Calcular'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-700/60 shrink-0 w-16">Suavizado</span>
              <input type="range" min={0} max={100} step={10} value={suavizado}
                onChange={e => setSuavizado(parseInt(e.target.value))}
                className="flex-1 h-1.5 accent-moss-700 cursor-pointer" />
              <span className="text-[10px] font-mono text-ink-700/60 w-16 text-right">{suavizado <= 20 ? 'sigue curva' : suavizado >= 80 ? 'recto/suave' : `${suavizado}%`}</span>
            </div>
            {errorPat && <p className="text-[10px] text-clay-600 leading-tight">{errorPat}</p>}

            {patron && (
              <div className="space-y-2 bg-white rounded-xl border border-bone-200 p-3">
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Líneas</span><br /><span className="font-mono font-bold text-ink-900">{patron.lineas.length}</span></div>
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Orient.</span><br /><span className="font-mono font-bold text-ink-900">{patron.orientacion_deg}°</span></div>
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Pend. residual</span><br /><span className="font-mono font-bold text-ink-900">{patron.pendiente_residual_pct}%</span></div>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-ink-700/50">Encaje:</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${patron.calidad === 'excelente' ? 'bg-moss-100 text-moss-800' : patron.calidad === 'buena' ? 'bg-sun-200 text-clay-800' : 'bg-clay-100 text-clay-800'}`}>{patron.calidad}</span>
                  <span className="text-ink-700/45">desvío {patron.desvio_medio_deg}° · pend. {patron.pendiente_media_pct}%</span>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1"><Info className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />{patron.nota}</p>
                <button onClick={() => { onAplicarPatron(patron); setPatronAplic(true); }} disabled={patronAplic}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${patronAplic ? 'bg-moss-100 text-moss-700' : 'bg-ink-900 hover:bg-ink-700 text-bone-50'}`}>
                  {patronAplic ? 'Patrón aplicado al plano ✓' : 'Aplicar patrón al plano'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
