'use client';

/**
 * Riego por sector (C2) — diseño de riego a partir de la evapotranspiración.
 * ETc = ETo·Kc → necesidad neta/bruta → caudal (nodo de consumo de la red B1),
 * diseño de goteo y calendario de riego según el agua útil del suelo.
 */
import { useMemo, useState, useEffect } from 'react';
import { Droplets, TriangleAlert, Gauge, CalendarClock } from 'lucide-react';
import {
  calcularRiego, seriesClima, aguaUtilPorMetro, CULTIVOS, SISTEMAS,
  type ResultadoRiego, type RiegoResumen,
} from '@/lib/riego';
import type { DatosClima } from '@/lib/clima';
import type { DatosSuelo } from '@/lib/suelos';

interface Props {
  areaHa:     number;
  datosClima: DatosClima | null;
  datosSuelo: DatosSuelo | null;
  onIrAClima: () => void;
  onResumen?: (r: RiegoResumen | null) => void;
}

export function RiegoPanel({ areaHa, datosClima, datosSuelo, onIrAClima, onResumen }: Props) {
  const [area,      setArea]      = useState(areaHa > 0 ? Math.round(areaHa * 100) / 100 : 0.5);
  const [cultivoId, setCultivoId] = useState(CULTIVOS[0]!.id);
  const [sistemaId, setSistemaId] = useState(SISTEMAS[0]!.id);
  const [horas,     setHoras]     = useState(8);

  useEffect(() => { if (areaHa > 0) setArea(Math.round(areaHa * 100) / 100); }, [areaHa]);

  const cultivo = CULTIVOS.find(c => c.id === cultivoId)!;
  const sistema = SISTEMAS.find(s => s.id === sistemaId)!;
  const aguaUtil = datosSuelo ? aguaUtilPorMetro(datosSuelo) : 120;

  const res: ResultadoRiego | null = useMemo(() => {
    if (!datosClima) return null;
    const { eto, precip } = seriesClima(datosClima);
    return calcularRiego({
      area_ha: area, cultivo, sistema,
      eto_mes_mm: eto, precip_mes_mm: precip,
      agua_util_mm_m: aguaUtil, horas_dia: horas,
    });
  }, [datosClima, area, cultivo, sistema, aguaUtil, horas]);

  const resumen: RiegoResumen | null = useMemo(() => res ? {
    cultivo: cultivo.nombre, sistema: sistema.nombre, area_ha: area,
    mes_pico: res.mes_pico, neto_pico_mm_dia: res.neto_pico_mm_dia,
    caudal_continuo_ls: res.caudal_continuo_ls, volumen_anual_m3: res.volumen_anual_m3,
    intervalo_dias: res.intervalo_dias, lamina_neta_mm: res.lamina_neta_mm,
  } : null, [res, cultivo.nombre, sistema.nombre, area]);

  useEffect(() => { onResumen?.(resumen); }, [resumen, onResumen]);
  useEffect(() => () => { onResumen?.(null); }, [onResumen]);

  const maxVol = res ? Math.max(...res.meses.map(m => m.volumen_m3), 1) : 1;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Riego por sector (ETc → caudal)
      </p>

      {!datosClima && (
        <p className="text-[11px] text-ink-700/60 bg-bone-50 border border-bone-200 rounded-xl p-3 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-sun-500" />
          <span>Cargá el <button onClick={onIrAClima} className="underline text-moss-700">clima</button> para tomar la evapotranspiración (ETo) y la lluvia mensual. El riego se calcula sobre esos datos.</span>
        </p>
      )}

      {/* Parámetros */}
      <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Campo label="Sector (ha)"><Num v={area} set={setArea} step={0.1} /></Campo>
          <Campo label="Horas de riego/día"><Num v={horas} set={setHoras} step={1} /></Campo>
        </div>
        <Campo label="Cultivo">
          <Sel v={cultivoId} set={setCultivoId} opts={CULTIVOS.map(c => ({ v: c.id, l: `${c.nombre} · Kc ${c.kc}` }))} />
        </Campo>
        <Campo label="Sistema de riego">
          <Sel v={sistemaId} set={setSistemaId} opts={SISTEMAS.map(s => ({ v: s.id, l: `${s.nombre} · ${Math.round(s.eficiencia * 100)} %` }))} />
        </Campo>
      </div>
      <p className="text-[10px] text-ink-700/55 flex gap-1.5">
        <Droplets className="w-3.5 h-3.5 shrink-0 text-moss-600" />
        {datosSuelo
          ? `Agua útil del suelo: ${aguaUtil} mm/m (de Suelo → agua útil 0–100 cm).`
          : 'Agua útil asumida 120 mm/m. Cargá Suelo para afinar el turno de riego.'}
      </p>

      {res && (
        <>
          {/* Diseño en el mes pico */}
          <div className="grid grid-cols-2 gap-2">
            <Stat label={`Pico (${res.mes_pico})`} value={`${res.neto_pico_mm_dia} mm/d`} color="moss" sub="necesidad neta de riego" icon="drop" />
            <Stat label="Caudal continuo" value={`${res.caudal_continuo_ls} L/s`} sub="nodo de consumo (red B1)" icon="gauge" />
            <Stat label={`Caudal en ${horas} h`} value={`${res.caudal_operativo_ls} L/s`} sub="si regás por turnos" icon="gauge" />
            <Stat label="Volumen anual" value={`${res.volumen_anual_m3.toLocaleString('es-AR')} m³`} sub={`${res.neto_anual_mm} mm/año netos`} icon="drop" />
          </div>

          {/* Turno de riego */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-moss-600" />Turno de riego (mes pico)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Cada" value={`${res.intervalo_dias} d`} />
              <MiniStat label="Lámina neta" value={`${res.lamina_neta_mm} mm`} />
              <MiniStat label="Lámina bruta" value={`${res.lamina_bruta_mm} mm`} />
            </div>
            <p className="text-[9px] text-ink-700/55 leading-relaxed">
              La lámina neta = agua útil de la zona radicular × agotamiento permitido ({Math.round(cultivo.agotamiento * 100)} %). El intervalo se ajusta al consumo del mes de mayor demanda.
            </p>
          </div>

          {/* Diseño de emisores */}
          {res.n_emisores !== null && (
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Emisores" value={res.n_emisores.toLocaleString('es-AR')} sub={`${sistema.caudal_lh} L/h c/u`} />
              <Stat label="Caudal sistema" value={`${((res.caudal_sistema_lh ?? 0) / 1000).toLocaleString('es-AR')} m³/h`} sub={`${(res.caudal_sistema_lh ?? 0).toLocaleString('es-AR')} L/h`} />
              <Stat label="Riego/día pico" value={res.horas_riego_dia !== null ? `${res.horas_riego_dia} h` : '—'} sub={res.tiempo_turno_h !== null ? `${res.tiempo_turno_h} h/turno` : undefined} />
            </div>
          )}

          {/* Balance mensual */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
            <p className="text-xs font-medium text-ink-700">Necesidad de riego por mes</p>
            <div className="space-y-1">
              {res.meses.map(m => (
                <div key={m.mes} className="flex items-center gap-2 text-[10px]">
                  <span className="w-7 text-ink-700/60">{m.mes}</span>
                  <div className="flex-1 h-3 bg-bone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-moss-500 rounded-full" style={{ width: `${(m.volumen_m3 / maxVol) * 100}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-ink-700/70">{m.neto_mm} mm</span>
                  <span className="w-16 text-right font-mono text-ink-700/50">{m.volumen_m3.toLocaleString('es-AR')} m³</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advertencias */}
          <div className="rounded-xl border border-moss-200 bg-moss-50 p-3 space-y-1.5">
            {res.advertencias.map((a, i) => (
              <p key={i} className="text-[11px] text-moss-700 flex gap-1.5"><span className="shrink-0 mt-0.5">→</span>{a}</p>
            ))}
          </div>

          <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
            FAO-56 · ETc = ETo·Kc, precipitación efectiva USDA-SCS, lámina por agua útil (Saxton-Rawls). El caudal continuo puede cargarse como consumo en la Red de agua para dimensionar la cañería.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Internos ─────────────────────────────────────────────────────────────────

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-ink-700/60 block leading-tight">{label}</label>
      {children}
    </div>
  );
}

function Num({ v, set, step }: { v: number; set: (n: number) => void; step: number }) {
  return (
    <input type="number" value={v} min={0} step={step}
      onChange={e => { const n = parseFloat(e.target.value); if (Number.isFinite(n)) set(n); }}
      className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 font-mono" />
  );
}

function Sel({ v, set, opts }: { v: string; set: (s: string) => void; opts: Array<{ v: string; l: string }> }) {
  return (
    <select value={v} onChange={e => set(e.target.value)}
      className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white">
      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bone-50 rounded-lg p-1.5">
      <p className="text-[9px] text-ink-700/60">{label}</p>
      <p className="font-mono text-xs font-bold text-moss-700">{value}</p>
    </div>
  );
}

function Stat({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string;
  color?: 'moss'; icon?: 'drop' | 'gauge';
}) {
  const cls = color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' : 'bg-white border-bone-200 text-ink-900';
  const Ico = icon === 'gauge' ? Gauge : Droplets;
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1"><Ico className="w-2.5 h-2.5" />{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
