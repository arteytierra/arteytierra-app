'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Loader2, Waves, Info, PenLine, CalendarClock, Droplets } from 'lucide-react';
import { obtenerGrillaDensa, grillaDesdeShader, type GrillaElevacion } from '@/lib/grillaElevacion';
import { calcularEmbalse, rangoElevacionPoligono, dimensionarMuro, type ResultadoEmbalse } from '@/lib/cutfill';
import { simularRepresaAnual, demandaMensual, MESES_NOMBRE, type RepresaResumen } from '@/lib/represa';
import { cuencaAdaptativa, bboxDeMojones, puntoMasBajoEnArista } from '@/lib/cuencaHidro';
import { COBERTURAS, coefEscorrentiaAnual } from '@/lib/cuenca';
import type { Cuenca, GrupoHidro } from '@/lib/cuenca';
import type { Mojon } from '@/lib/types';
import type { DatosShader } from '@/lib/shaders';
import type { DatosClima } from '@/lib/clima';


export interface PoligonoCutFill { id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }

// Presets de geometría del muro según el tipo de obra. La base = corona + alto×
// (talud int + talud ext), así que los taludes mandan el ancho:
//  · aguada/tajamar excavado → taludes suaves, corona angosta (base chica).
//  · represa de ladera        → taludes de seguridad (más tendidos) para un
//    terraplén que retiene varios metros; base más ancha pero estable.
type ParamsMuroUI = { anchoCorona: number; taludInterno: number; taludExterno: number; revancha: number };
const PRESETS_MURO: Record<'aguada' | 'ladera', ParamsMuroUI> = {
  aguada: { anchoCorona: 1, taludInterno: 2, taludExterno: 1.5, revancha: 0.3 },
  ladera: { anchoCorona: 3, taludInterno: 3, taludExterno: 2,   revancha: 0.5 },
};
type TipoMuro = keyof typeof PRESETS_MURO;

interface Props {
  mojones:     Mojon[];
  datosShader: DatosShader | null;
  poligonos:   PoligonoCutFill[];
  onDibujarEspejo: () => void;
  datosClima?:   DatosClima | null;
  cuencaHa?:     number | null;   // área de la cuenca de aporte (B2), si existe
  grupoHidro?:   GrupoHidro | null;   // grupo hidrológico del suelo (A4), si existe
  onResumenRepresa?: (r: RepresaResumen | null) => void;
  onCuencaCalculada?: (c: Cuenca | null) => void;   // empuja la cuenca del muro al mapa/pestaña Cuenca
  onMuroLinea?: (linea: [{ lat: number; lng: number }, { lat: number; lng: number }] | null) => void;
}

export function CutFillPanel({ mojones, datosShader, poligonos, onDibujarEspejo, datosClima = null, cuencaHa = null, grupoHidro = null, onResumenRepresa, onCuencaCalculada, onMuroLinea }: Props) {
  const [selId,    setSelId]    = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [grilla,   setGrilla]   = useState<GrillaElevacion | null>(null);
  const [rango,    setRango]    = useState<{ min: number; max: number; celdas: number } | null>(null);
  const [nivel,    setNivel]    = useState<number | null>(null);
  const [res,      setRes]      = useState<ResultadoEmbalse | null>(null);
  // Parámetros de diseño del muro (trapecio). Por defecto una aguada/tajamar;
  // el selector cambia a represa de ladera (taludes de seguridad).
  const [tipoMuro, setTipoMuro] = useState<TipoMuro>('aguada');
  const [muroP,    setMuroP]    = useState<ParamsMuroUI>({ ...PRESETS_MURO.aguada });
  const [longMuro, setLongMuro] = useState<number | null>(null);
  const aplicarPresetMuro = useCallback((t: TipoMuro) => { setTipoMuro(t); setMuroP({ ...PRESETS_MURO[t] }); }, []);
  // Cuenca de aporte desde el muro (C): lado elegido + resultado.
  const [muroIdx,      setMuroIdx]      = useState<number | null>(null);
  const [cuencaMuro,   setCuencaMuro]   = useState<Cuenca | null>(null);
  const [cuencaMuroLoad, setCuencaMuroLoad] = useState(false);
  const [cuencaMuroAviso, setCuencaMuroAviso] = useState<string | null>(null);

  const sel = poligonos.find(p => p.id === selId) ?? null;

  // Sugerir el lado más bajo del polígono como muro (donde iría la presa).
  useEffect(() => {
    if (!sel || sel.vertices.length < 3 || !grilla) { setMuroIdx(null); return; }
    const vs = sel.vertices;
    let best = -1, bestE = Infinity;
    for (let i = 0; i < vs.length; i++) {
      const p = puntoMasBajoEnArista(grilla, vs[i]!, vs[(i + 1) % vs.length]!);
      if (p && p.elev < bestE) { bestE = p.elev; best = i; }
    }
    setMuroIdx(best >= 0 ? best : null);
    setCuencaMuro(null); setCuencaMuroAviso(null);
  }, [sel, grilla]);

  // Dibujar el lado-muro elegido en el mapa.
  useEffect(() => {
    if (sel && muroIdx !== null && sel.vertices.length >= 3) {
      const vs = sel.vertices;
      onMuroLinea?.([vs[muroIdx]!, vs[(muroIdx + 1) % vs.length]!]);
    } else {
      onMuroLinea?.(null);
    }
  }, [sel, muroIdx, onMuroLinea]);

  const calcularCuencaMuro = useCallback(async () => {
    if (!sel || muroIdx === null || !grilla || mojones.length < 3) return;
    const vs = sel.vertices;
    const outlet = puntoMasBajoEnArista(grilla, vs[muroIdx]!, vs[(muroIdx + 1) % vs.length]!);
    if (!outlet) { setCuencaMuroAviso('El lado elegido no cae sobre datos de elevación.'); return; }
    setCuencaMuroLoad(true); setCuencaMuroAviso(null);
    try {
      const r = await cuencaAdaptativa({ lat: outlet.lat, lng: outlet.lng }, bboxDeMojones(mojones), { clip: mojones });
      if (r) {
        setCuencaMuro(r.cuenca);
        onCuencaCalculada?.(r.cuenca);
        if (!r.completa) setCuencaMuroAviso('La cuenca puede estar incompleta: la divisoria llega al límite del área analizada.');
      } else {
        setCuencaMuroAviso('No se pudo delinear la cuenca desde ese muro. Probá con otro lado.');
      }
    } catch {
      setCuencaMuroAviso('Error al calcular la cuenca. Reintentá.');
    } finally {
      setCuencaMuroLoad(false);
    }
  }, [sel, muroIdx, grilla, mojones, onCuencaCalculada]);

  // Largo del muro = longitud de la arista elegida como muro (el cierre del cuello
  // de botella), no el eje mayor del vaso. Ese era el error que inflaba el muro.
  const muroEdgeLength = useMemo(() => {
    if (!sel || muroIdx === null || sel.vertices.length < 3) return null;
    const vs = sel.vertices;
    const a = vs[muroIdx]!, b = vs[(muroIdx + 1) % vs.length]!;
    const latMid = (a.lat + b.lat) / 2 * Math.PI / 180;
    return Math.round(Math.hypot((b.lng - a.lng) * 111320 * Math.cos(latMid), (b.lat - a.lat) * 111320));
  }, [sel, muroIdx]);

  const longitud = longMuro ?? muroEdgeLength ?? res?.ancho_max_m ?? 0;
  const muro = useMemo(() => res ? dimensionarMuro({
    profMax_m: res.prof_max_m, revancha_m: muroP.revancha, anchoCorona_m: muroP.anchoCorona,
    taludInterno: muroP.taludInterno, taludExterno: muroP.taludExterno, longitud_m: longitud,
  }) : null, [res, muroP, longitud]);

  // Eficiencia del sitio = agua embalsada ÷ tierra del muro (terraplén). Cuanto
  // más agua se embalsa con menos muro —un buen cuello de botella entre laderas—
  // más eficiente el emplazamiento.
  const eficiencia = muro && res && muro.volumenTierra_m3 > 0 ? res.volumen_m3 / muro.volumenTierra_m3 : 0;

  // Reset al cambiar de polígono
  useEffect(() => { setRango(null); setNivel(null); setRes(null); setError(null); setLongMuro(null); }, [selId]);

  const analizar = useCallback(async () => {
    if (!sel || sel.vertices.length < 3) { setError('Elegí un polígono cerrado.'); return; }
    setCargando(true); setError(null);
    try {
      let g = grilla;
      if (!g) {
        g = (await obtenerGrillaDensa(mojones)) ?? (datosShader ? grillaDesdeShader(datosShader) : null);
        if (!g) { setError('No se pudo obtener la elevación del terreno.'); return; }
        setGrilla(g);
      }
      const rg = rangoElevacionPoligono(g, sel.vertices);
      if (!rg) { setError('El polígono no contiene suficientes datos de elevación.'); return; }
      setRango(rg);
      const nivelInicial = nivel ?? (rg.min + (rg.max - rg.min) * 0.6);
      setNivel(Math.round(nivelInicial * 10) / 10);
      setRes(calcularEmbalse(g, sel.vertices, nivelInicial));
    } catch {
      setError('Error al calcular el embalse.');
    } finally {
      setCargando(false);
    }
  }, [sel, grilla, mojones, datosShader, nivel]);

  // Recalcular al mover el nivel (si ya hay grilla y polígono)
  const onNivel = useCallback((v: number) => {
    setNivel(v);
    if (grilla && sel) setRes(calcularEmbalse(grilla, sel.vertices, v));
  }, [grilla, sel]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Cut &amp; fill de represa</p>
      <p className="text-[10px] text-ink-700/55 leading-relaxed">
        Estima el volumen de agua y el movimiento de suelo de una represa dibujada (polígono o zona), integrando la elevación SRTM.
      </p>

      <button
        onClick={onDibujarEspejo}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-water-500/15 hover:bg-water-500/25 text-water-700 border border-water-500/40 rounded-xl text-xs font-medium transition-colors"
      >
        <PenLine className="w-3.5 h-3.5" /> Dibujar espejo de agua
      </button>

      {poligonos.length === 0 ? (
        <p className="text-[11px] text-ink-700/50 bg-bone-100 rounded-lg px-3 py-2">
          Dibujá un polígono (o zona) sobre el sitio de la represa para poder calcular.
        </p>
      ) : (
        <select
          value={selId}
          onChange={e => setSelId(e.target.value)}
          className="w-full text-xs bg-white border border-bone-200 rounded-lg px-2 py-1.5 text-ink-900 focus:outline-none focus:border-moss-500"
        >
          <option value="">Elegí el polígono de la represa…</option>
          {poligonos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      )}

      {sel && (
        <button
          onClick={analizar}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-xl text-xs font-medium transition-colors"
        >
          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Waves className="w-3.5 h-3.5" />}
          {cargando ? 'Calculando…' : 'Calcular embalse'}
        </button>
      )}

      {error && <p className="text-[10px] text-clay-600 leading-tight">{error}</p>}

      {rango && nivel !== null && res && (
        <div className="space-y-2 bg-white rounded-xl border border-bone-200 p-3">
          {/* Nivel de agua */}
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-ink-700/55">Nivel de agua</span>
              <span className="font-mono font-bold text-ink-900">{nivel.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={rango.min} max={rango.max} step={0.1}
              value={nivel}
              onChange={e => onNivel(parseFloat(e.target.value))}
              className="w-full accent-moss-700"
            />
            <div className="flex justify-between text-[8px] font-mono text-ink-700/40">
              <span>{rango.min.toFixed(0)} m (fondo)</span><span>{rango.max.toFixed(0)} m (borde)</span>
            </div>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <Stat label="Volumen agua" valor={`${res.volumen_m3.toLocaleString('es-AR')} m³`} />
            <Stat label="Área inundada" valor={`${(res.area_inundada_m2 / 10000).toFixed(2)} ha`} />
            <Stat label="Prof. máxima" valor={`${res.prof_max_m} m`} />
            <Stat label="Prof. media" valor={`${res.prof_media_m} m`} />
          </div>

          <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />
            Volumen embalsado integrando la elevación SRTM bajo el nivel de agua (orientativo). El movimiento de tierra y la eficiencia del sitio están más abajo, según el tipo de obra.
          </p>

          {/* ── Muro de la represa (trapecio) ── */}
          {muro && (
            <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-2">
              <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Muro / terraplén</p>

              {/* Tipo de obra: fija los taludes/corona por defecto */}
              <div className="flex gap-1 bg-bone-100 rounded-lg p-0.5">
                {(['aguada', 'ladera'] as TipoMuro[]).map(t => (
                  <button
                    key={t}
                    onClick={() => aplicarPresetMuro(t)}
                    className={`flex-1 text-[9px] font-medium py-1 rounded-md transition-colors ${
                      tipoMuro === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/55 hover:text-ink-700'
                    }`}
                  >
                    {t === 'aguada' ? 'Aguada / tajamar' : 'Represa de ladera'}
                  </button>
                ))}
              </div>

              {/* Sección trapezoidal */}
              <svg viewBox="0 0 120 60" className="w-full h-16">
                {/* agua */}
                <rect x="0" y="34" width="46" height="20" fill="#1E88E5" opacity="0.25" />
                {/* trapecio del muro: corona arriba, base abajo (aguas arriba a la izq) */}
                <polygon points="46,12 74,12 92,54 28,54" fill="#A1887F" stroke="#6D4C41" strokeWidth="1" />
                <line x1="46" y1="12" x2="74" y2="12" stroke="#4E342E" strokeWidth="1.5" />
                {/* cotas */}
                <text x="60" y="9" textAnchor="middle" fontSize="6" fill="#5D4037">corona {muro.anchoCorona_m} m</text>
                <text x="60" y="59.5" textAnchor="middle" fontSize="6" fill="#5D4037">base {muro.anchoBase_m} m</text>
                <text x="20" y="36" textAnchor="middle" fontSize="6" fill="#1565C0">agua</text>
                <text x="98" y="36" textAnchor="start" fontSize="6" fill="#5D4037">h {muro.alto_m} m</text>
              </svg>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <Stat label="Alto (con revancha)" valor={`${muro.alto_m} m`} />
                <Stat label="Ancho de base" valor={`${muro.anchoBase_m} m`} />
                <Stat label="Áng. interno" valor={`${muro.anguloInterno_deg}°`} />
                <Stat label="Áng. externo" valor={`${muro.anguloExterno_deg}°`} />
                <Stat label="Sección" valor={`${muro.seccion_m2} m²`} />
                <Stat label="Vol. terraplén" valor={`${muro.volumenTierra_m3.toLocaleString('es-AR')} m³`} />
              </div>

              {/* Parámetros de diseño */}
              <div className="space-y-1.5 bg-bone-50 rounded-lg p-2">
                <ParamRow label="Largo del muro (m)" value={longitud} onChange={v => setLongMuro(v)} step={1} />
                <ParamRow label="Ancho corona (m)"  value={muroP.anchoCorona} onChange={v => setMuroP(p => ({ ...p, anchoCorona: v }))} step={0.5} />
                <ParamRow label="Talud interno (H:1V)" value={muroP.taludInterno} onChange={v => setMuroP(p => ({ ...p, taludInterno: v }))} step={0.5} />
                <ParamRow label="Talud externo (H:1V)" value={muroP.taludExterno} onChange={v => setMuroP(p => ({ ...p, taludExterno: v }))} step={0.5} />
                <ParamRow label="Revancha (m)" value={muroP.revancha} onChange={v => setMuroP(p => ({ ...p, revancha: v }))} step={0.1} />
              </div>

              <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-ink-700/40" />
                El ancho de base = corona + alto × (talud int. + talud ext.). Taludes más tendidos (número mayor, ej. 3 = 3&nbsp;m horizontales por metro de alto) hacen el muro más seguro pero más ancho. Para un tajamar chico alcanza «Aguada»; para retener varios metros de agua usá «Represa de ladera».
              </p>

              {/* Eficiencia del sitio: agua embalsada / muro (terraplén) */}
              <div className="rounded-lg border border-moss-200 bg-moss-50 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-ink-700/70">
                  Eficiencia del sitio (agua ÷ muro)
                </span>
                <span className="font-mono text-sm font-bold text-moss-700">{eficiencia.toFixed(1)} : 1</span>
              </div>
              <p className="text-[9px] text-ink-700/50 leading-relaxed">
                {res.volumen_m3.toLocaleString('es-AR')} m³ de agua ÷ {muro.volumenTierra_m3.toLocaleString('es-AR')} m³ de muro.
              </p>
              <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-moss-700/50" />
                m³ de agua embalsada ÷ m³ del muro (terraplén). Cuanto más agua se embalsa con menos muro —un buen cuello de botella entre laderas— mayor la eficiencia y mejor el sitio elegido.
              </p>
            </div>
          )}

          {/* ── Cuenca de aporte desde el muro (C) ── */}
          <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-2">
            <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Cuenca de aporte</p>
            {muroIdx === null ? (
              <p className="text-[10px] text-ink-700/55 leading-relaxed">Calculá el embalse para detectar el muro y su cuenca de aporte.</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-ink-700/70">
                    Muro: <b>lado {muroIdx + 1}</b>/{sel?.vertices.length} <span className="text-ink-700/45">(el más bajo)</span>
                  </span>
                  <button
                    onClick={() => { setMuroIdx(i => (sel && i !== null) ? (i + 1) % sel.vertices.length : i); setCuencaMuro(null); }}
                    className="text-[10px] text-moss-700 hover:text-moss-900 underline"
                  >
                    cambiar lado
                  </button>
                </div>
                <button
                  onClick={calcularCuencaMuro}
                  disabled={cuencaMuroLoad}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1565C0]/12 hover:bg-[#1565C0]/20 text-[#1565C0] border border-[#1565C0]/35 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {cuencaMuroLoad ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Waves className="w-3.5 h-3.5" />}
                  {cuencaMuroLoad ? 'Delineando cuenca…' : 'Calcular cuenca desde el muro'}
                </button>
                {cuencaMuro && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <Stat label="Área de cuenca" valor={`${cuencaMuro.area_ha} ha`} />
                    <Stat label="Recorrido flujo" valor={`${cuencaMuro.long_flujo_m} m`} />
                  </div>
                )}
                {cuencaMuroAviso && <p className="text-[10px] text-clay-700 leading-relaxed">{cuencaMuroAviso}</p>}
                <p className="text-[9px] text-ink-700/45 leading-relaxed">
                  La salida es el punto más bajo del muro; la cuenca sube hasta la divisoria real y se dibuja en el mapa. El área alimenta el balance de abajo.
                </p>
              </>
            )}
          </div>

          {/* ── Simulación anual (B3) ── */}
          <RepresaSimSection res={res} datosClima={datosClima} cuencaHa={cuencaMuro?.area_ha ?? cuencaHa} grupoHidro={grupoHidro} onResumen={onResumenRepresa} />
        </div>
      )}
    </div>
  );
}

// ─── Simulación mensual del embalse (B3) ──────────────────────────────────────

function RepresaSimSection({ res, datosClima, cuencaHa, grupoHidro = null, onResumen }: {
  res: ResultadoEmbalse; datosClima: DatosClima | null; cuencaHa: number | null; grupoHidro?: GrupoHidro | null;
  onResumen?: (r: RepresaResumen | null) => void;
}) {
  const [cobertura, setCobertura] = useState('pastura_regular');
  const [coef,    setCoef]    = useState(String(coefEscorrentiaAnual(grupoHidro ?? 'B', 'pastura_regular')));
  const [ha,      setHa]      = useState(cuencaHa ? String(cuencaHa) : '10');
  const [cabezas, setCabezas] = useState('40');
  const [litros,  setLitros]  = useState('45');
  const [riego,   setRiego]   = useState('0');
  const [seep,    setSeep]    = useState('3');

  // Autocompleta el área de cuenca (desde el muro o B2) y el coef según suelo+cobertura.
  useEffect(() => { if (cuencaHa) setHa(String(cuencaHa)); }, [cuencaHa]);
  useEffect(() => { setCoef(String(coefEscorrentiaAnual(grupoHidro ?? 'B', cobertura))); }, [grupoHidro, cobertura]);

  const demanda = demandaMensual(parseFloat(cabezas) || 0, parseFloat(litros) || 0, parseFloat(riego) || 0);

  const sim = useMemo(() => {
    if (!datosClima) return null;
    return simularRepresaAnual({
      capacidad_m3:        res.volumen_m3,
      area_espejo_m2:      res.area_inundada_m2,
      cuencaArea_m2:       (parseFloat(ha) || 0) * 10000,
      coefEscorrentia:     parseFloat(coef) || 0,
      meses:               datosClima.meses.map(m => ({ precip_mm: m.precip_mm, etp_mm: m.etp_mm })),
      demanda_m3_mes:      demanda,
      infiltracion_mm_dia: parseFloat(seep) || 0,
    });
  }, [res, datosClima, ha, coef, demanda, seep]);

  // Emite el resumen hacia arriba (para informe/snapshot); limpia al desmontar.
  const resumen: RepresaResumen | null = useMemo(() => sim ? {
    capacidad_m3:      res.volumen_m3,
    cuenca_ha:         parseFloat(ha) || 0,
    demanda_m3_mes:    demanda,
    confiabilidad_pct: sim.confiabilidad_pct,
    aguanta:           sim.aguanta,
    volumen_min_m3:    sim.volumen_min_m3,
    mes_critico:       sim.mes_critico,
    aporte_anual_m3:   sim.aporte_anual_m3,
  } : null, [sim, res.volumen_m3, ha, demanda]);
  useEffect(() => { onResumen?.(resumen); }, [resumen, onResumen]);
  useEffect(() => () => { onResumen?.(null); }, [onResumen]);

  return (
    <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-2">
      <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-1">
        <CalendarClock className="w-3 h-3" /> Simulación anual del embalse
      </p>

      {!datosClima ? (
        <p className="text-[10px] text-ink-700/55 bg-bone-50 rounded-lg px-2 py-1.5">
          Cargá el clima (pestaña Clima) para simular el balance mensual de agua.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 bg-bone-50 rounded-lg px-2 py-1.5">
            <span className="text-[10px] text-ink-700/60 shrink-0">Cobertura de la cuenca</span>
            <select
              value={cobertura}
              onChange={e => setCobertura(e.target.value)}
              className="text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
            >
              {COBERTURAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-bone-50 rounded-lg p-2">
            <ParamRow label="Cuenca aporte (ha)" value={parseFloat(ha) || 0} onChange={v => setHa(String(v))} step={1} />
            <ParamRow label="Coef. escorrentía" value={parseFloat(coef) || 0} onChange={v => setCoef(String(v))} step={0.05} />
            <ParamRow label="Cabezas (hacienda)" value={parseFloat(cabezas) || 0} onChange={v => setCabezas(String(v))} step={5} />
            <ParamRow label="Litros/cab./día" value={parseFloat(litros) || 0} onChange={v => setLitros(String(v))} step={5} />
            <ParamRow label="Riego (m³/mes)" value={parseFloat(riego) || 0} onChange={v => setRiego(String(v))} step={10} />
            <ParamRow label="Infiltr. (mm/día)" value={parseFloat(seep) || 0} onChange={v => setSeep(String(v))} step={1} />
          </div>

          {sim && (
            <>
              <div className={`rounded-xl border p-2.5 ${sim.aguanta ? 'bg-moss-50 border-moss-200' : 'bg-clay-100 border-clay-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-700/60 flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> {sim.aguanta ? 'Aguanta todo el año' : 'No cubre la demanda'}
                  </span>
                  <span className={`font-mono text-base font-bold ${sim.aguanta ? 'text-moss-700' : 'text-clay-700'}`}>
                    {sim.confiabilidad_pct}%
                  </span>
                </div>
                <p className="text-[9px] text-ink-700/55 mt-0.5">
                  confiabilidad · mín {sim.volumen_min_m3.toLocaleString('es-AR')} m³ ({MESES_NOMBRE[sim.mes_critico]})
                  {sim.meses_deficit > 0 ? ` · ${sim.meses_deficit} mes(es) con déficit` : ''}
                </p>
              </div>

              {/* Curva mensual de llenado */}
              <svg viewBox="0 0 240 90" className="w-full" style={{ height: 84 }}>
                {[0, 50, 100].map(p => (
                  <line key={p} x1={18} y1={8 + (100 - p) * 0.6} x2={238} y2={8 + (100 - p) * 0.6} stroke="#eee7dc" strokeWidth={0.5} />
                ))}
                {sim.meses.map((m, i) => {
                  const bw = 16, gap = 2.4;
                  const x = 20 + i * (bw + gap);
                  const h = Math.max(1, m.llenado_pct * 0.6);
                  const y = 8 + (100 - m.llenado_pct) * 0.6;
                  const col = m.deficit_m3 > 0 ? '#C62828' : m.derrame_m3 > 0 ? '#64B5F6' : '#2E7D32';
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={bw} height={h} fill={col} rx={1} />
                      <text x={x + bw / 2} y={80} textAnchor="middle" fontSize={5.5} fill="#9a958c">{MESES_NOMBRE[i]!.slice(0, 1)}</text>
                    </g>
                  );
                })}
                <text x={15} y={11} textAnchor="end" fontSize={5.5} fill="#9a958c" fontFamily="monospace">100</text>
                <text x={15} y={68} textAnchor="end" fontSize={5.5} fill="#9a958c" fontFamily="monospace">0</text>
              </svg>
              <div className="flex items-center gap-3 text-[8px] text-ink-700/55">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#2E7D32' }} />normal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#64B5F6' }} />derrama</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#C62828' }} />déficit</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <Stat label="Aporte anual" valor={`${sim.aporte_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Demanda anual" valor={`${sim.demanda_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Evaporación anual" valor={`${sim.meses.reduce((s, m) => s + m.evap_m3, 0).toLocaleString('es-AR')} m³`} />
                <Stat label="Infiltración anual" valor={`${sim.meses.reduce((s, m) => s + m.infiltr_m3, 0).toLocaleString('es-AR')} m³`} />
                <Stat label="Derrame anual" valor={`${sim.derrame_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Demanda mensual" valor={`${demanda.toLocaleString('es-AR')} m³`} />
              </div>
              <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                Balance mensual: escorrentía − evaporación (ETP×espejo) − infiltración − demanda, convergido a ciclo estable. Clima NASA POWER · orientativo.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ParamRow({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-ink-700/60">{label}</span>
      <input
        type="number" step={step} min={0} value={value}
        onChange={e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) onChange(v); }}
        className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
      />
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-bone-50 rounded px-2 py-1">
      <span className="text-ink-700/50">{label}</span><br />
      <span className="font-mono font-bold text-ink-900">{valor}</span>
    </div>
  );
}
