'use client';

import { useState, useCallback } from 'react';
import { Cloud, Loader2, ExternalLink, Wind, Thermometer, Droplets, Sun, Snowflake, Gauge, Navigation, CloudRain, TriangleAlert, CalendarClock } from 'lucide-react';
import { obtenerClima, centroide, weatherSparkURL, type DatosClima, type MesDato, type CalibracionPrecip } from '@/lib/clima';
import { obtenerExtremos, type Extremos } from '@/lib/climaExtremos';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:     Mojon[];
  datos:       DatosClima | null;
  onDatos:     (d: DatosClima) => void;
  extremos:    Extremos | null;
  onExtremos:  (e: Extremos | null) => void;
  /** Calibración manual de la lluvia (ver CalibracionPrecipBloque). */
  calibracion:   CalibracionPrecip | null;
  onCalibracion: (c: CalibracionPrecip | null) => void;
  /** Precipitación anual SIN calibrar, para mostrar la comparación. */
  precipCruda:   number | null;
  /** Pendiente media del predio: si es alta, avisamos del sesgo de la grilla. */
  pendientePct:  number | null;
}

export function ClimaPanel({ mojones, datos, onDatos, extremos, onExtremos, calibracion, onCalibracion, precipCruda, pendientePct }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [cargandoExt, setCargandoExt] = useState(false);
  const [errorExt,    setErrorExt]    = useState<string | null>(null);

  const centro = centroide(mojones);

  const handleCargarExtremos = useCallback(async () => {
    setCargandoExt(true);
    setErrorExt(null);
    try {
      onExtremos(await obtenerExtremos(centro.lat, centro.lng));
    } catch (e) {
      setErrorExt(e instanceof Error ? e.message : 'No se pudieron calcular los extremos.');
    } finally {
      setCargandoExt(false);
    }
  }, [centro.lat, centro.lng, onExtremos]);

  const handleCargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerClima(centro.lat, centro.lng);
      onDatos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener los datos climáticos.');
    } finally {
      setCargando(false);
    }
  }, [centro.lat, centro.lng, onDatos]);

  if (mojones.length < 3) {
    return (
      <div className="text-center py-8 px-4">
        <Cloud className="w-8 h-8 text-moss-700/40 mx-auto mb-2" />
        <p className="text-xs text-ink-700/50 leading-relaxed">
          Trazá al menos 3 mojones para consultar el clima del centroide del terreno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ubicación + botón */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
            Clima del terreno
          </p>
          <p className="text-xs font-mono text-ink-700/60 mt-0.5">
            {centro.lat.toFixed(4)}, {centro.lng.toFixed(4)}
          </p>
        </div>
        <button
          onClick={handleCargar}
          disabled={cargando}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
          {cargando ? 'Cargando…' : datos ? 'Actualizar' : 'Cargar'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">{error}</p>
      )}

      {datos && (
        <>
          {/* Banner Köppen + aridez */}
          {datos.koppen && (
            <div className="bg-gradient-to-br from-moss-700 to-moss-900 rounded-xl p-3 text-bone-50">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-bone-50/70">Clasificación climática</p>
                  <p className="text-lg font-bold leading-tight">
                    {datos.koppen.codigo}
                    <span className="text-xs font-normal text-bone-50/80 ml-2">{datos.koppen.grupo}</span>
                  </p>
                  <p className="text-xs text-bone-50/90">{datos.koppen.descripcion}</p>
                </div>
                {datos.aridez && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wide text-bone-50/70">Aridez</p>
                    <p className="text-sm font-bold">{datos.aridez.clase}</p>
                    <p className="text-[10px] font-mono text-bone-50/70">P/ETP {datos.aridez.valor}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumen anual */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Droplets className="w-3.5 h-3.5" />} label="Precipitación" value={`${datos.precip_anual_mm} mm`}  sub="anual" color="water" />
            <StatCard icon={<Thermometer className="w-3.5 h-3.5" />} label="Temperatura" value={`${datos.tmean_anual_c}°C`}    sub="media anual" color="sun" />
            {datos.rh_anual_pct !== undefined && (
              <StatCard icon={<Droplets className="w-3.5 h-3.5" />} label="Humedad rel." value={`${datos.rh_anual_pct}%`}    sub="media anual" color="water" />
            )}
            <StatCard icon={<Droplets className="w-3.5 h-3.5" />} label="ETP"           value={`${datos.etp_anual_mm} mm`}     sub="anual Hargreaves" color="clay" />
            {datos.rad_anual_kwh !== undefined && (
              <StatCard icon={<Sun className="w-3.5 h-3.5" />}    label="Radiación"      value={`${datos.rad_anual_kwh}`}        sub="kWh/m²/día" color="sun" />
            )}
            <StatCard icon={<Wind className="w-3.5 h-3.5" />}    label="Viento ppal."   value={datos.viento_dir_ppal}          sub={datos.viento_medio_ms !== undefined ? `${datos.viento_medio_ms} m/s medio` : 'dirección'} color="moss" />
          </div>

          {/* Indicadores agronómicos */}
          <div className="grid grid-cols-3 gap-2">
            {datos.gdd_anual !== undefined && (
              <MiniStat icon={<Gauge className="w-3 h-3" />} label="GDD" value={`${datos.gdd_anual}`} sub="base 10°C" />
            )}
            {datos.amplitud_anual_c !== undefined && (
              <MiniStat icon={<Thermometer className="w-3 h-3" />} label="Amplitud" value={`${datos.amplitud_anual_c}°C`} sub="térmica" />
            )}
            {datos.viento_max_ms !== undefined && (
              <MiniStat icon={<Wind className="w-3 h-3" />} label="Racha máx." value={`${datos.viento_max_ms}`} sub="m/s" />
            )}
          </div>

          <GraficoMensual meses={datos.meses} />
          <RosaVientos meses={datos.meses} />
          {datos.heladas && <Heladas heladas={datos.heladas} />}
          <BalanceHidrico meses={datos.meses} />

          {/* Extremos y riesgo (serie diaria Open-Meteo/ERA5) */}
          <ExtremosBloque
            extremos={extremos} cargando={cargandoExt} error={errorExt}
            onCargar={handleCargarExtremos}
          />

          <CalibracionPrecipBloque
            calibracion={calibracion}
            onCalibracion={onCalibracion}
            precipCruda={precipCruda}
            precipActual={datos.precip_anual_mm}
            pendientePct={pendientePct}
          />

          {/* Fuente + Weather Spark */}
          <div className="text-xs text-ink-700/50 leading-relaxed pt-1 border-t border-bone-200">
            <p className="mb-1">📡 {datos.fuente}</p>
            <p className="italic mb-2">ETP por Hargreaves y Köppen-Geiger (Peel et al. 2007) — orientativos.</p>
            <a
              href={weatherSparkURL(datos.lat, datos.lng)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-water-500 hover:text-water-700 font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Ver en Weather Spark
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: 'water' | 'sun' | 'clay' | 'moss';
}) {
  const colors = { water: 'text-water-500', sun: 'text-sun-500', clay: 'text-clay-700', moss: 'text-moss-700' };
  return (
    <div className="bg-white rounded-xl p-3 border border-bone-200">
      <div className={`flex items-center gap-1 mb-1 ${colors[color]}`}>{icon}<p className="text-xs">{label}</p></div>
      <p className="font-mono text-sm font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-700/50">{sub}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-bone-50 rounded-lg p-2 border border-bone-200 text-center">
      <div className="flex items-center justify-center gap-1 text-ink-700/60 mb-0.5">{icon}<span className="text-[9px] uppercase">{label}</span></div>
      <p className="font-mono text-xs font-bold text-ink-900">{value}</p>
      <p className="text-[9px] text-ink-700/50">{sub}</p>
    </div>
  );
}

// ─── Extremos y clima de riesgo ─────────────────────────────────────────────────

function ExtremosBloque({ extremos, cargando, error, onCargar }: {
  extremos: Extremos | null; cargando: boolean; error: string | null; onCargar: () => void;
}) {
  if (!extremos) {
    return (
      <div className="bg-water-500/5 rounded-xl border border-water-500/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <TriangleAlert className="w-3.5 h-3.5 text-water-700" />
          <p className="text-xs font-semibold text-ink-700">Extremos y clima de riesgo</p>
        </div>
        <p className="text-[11px] text-ink-700/60 leading-snug mb-2">
          Serie diaria (ERA5, 1991–2025): tormenta de diseño, heladas con percentiles, rachas
          secas y variabilidad — para dimensionar represas, vertederos y swales con criterio.
        </p>
        {error && <p className="text-[10px] text-clay-600 mb-2 leading-tight">{error}</p>}
        <button
          onClick={onCargar}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-water-700 hover:bg-water-800 disabled:opacity-50 text-bone-50 rounded-lg text-[11px] font-medium transition-colors"
        >
          {cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudRain className="w-3 h-3" />}
          {cargando ? 'Calculando 35 años…' : 'Calcular extremos y riesgo'}
        </button>
      </div>
    );
  }

  const { heladas, tormenta, sequia, precip_anual, calor } = extremos;

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 bg-ink-950 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TriangleAlert className="w-3.5 h-3.5 text-bone-300" />
          <p className="text-[11px] font-bold text-bone-100 uppercase tracking-wide">Extremos y riesgo</p>
        </div>
        <p className="text-[9px] font-mono text-bone-400">{extremos.periodo} · {extremos.anios} años</p>
      </div>

      <div className="p-3 space-y-3">
        {/* Tormenta de diseño */}
        <div>
          <div className="flex items-center gap-1 mb-1 text-water-700">
            <CloudRain className="w-3 h-3" />
            <p className="text-[11px] font-semibold">Tormenta de diseño (P24h)</p>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {tormenta.recurrencias.map(r => (
              <div key={r.periodo_retorno} className="bg-water-500/8 rounded-lg py-1.5 text-center">
                <p className="text-[9px] text-ink-700/60">T {r.periodo_retorno} años</p>
                <p className="font-mono text-xs font-bold text-water-800">{r.mm} mm</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-ink-700/50 mt-1 leading-tight">
            Máx. registrada {tormenta.p24h_max_registrada} mm. Base para vertederos, alcantarillas
            y separación de swales.
          </p>
        </div>

        {/* Heladas */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center gap-1 mb-1 text-ink-700">
            <Snowflake className="w-3 h-3" />
            <p className="text-[11px] font-semibold">Heladas (tmin ≤ 0 °C)</p>
          </div>
          {heladas.hay_heladas ? (
            <div className="space-y-1 text-[10px] text-ink-700/80">
              {heladas.ultima_helada && (
                <p><span className="text-ink-700/50">Última (fin invierno):</span>{' '}
                  <b className="font-mono">{heladas.ultima_helada.p50}</b>{' '}
                  <span className="text-ink-700/40">({heladas.ultima_helada.p10}–{heladas.ultima_helada.p90})</span></p>
              )}
              {heladas.primera_helada && (
                <p><span className="text-ink-700/50">Primera (otoño):</span>{' '}
                  <b className="font-mono">{heladas.primera_helada.p50}</b>{' '}
                  <span className="text-ink-700/40">({heladas.primera_helada.p10}–{heladas.primera_helada.p90})</span></p>
              )}
              {heladas.periodo_libre_dias && (
                <p><span className="text-ink-700/50">Período libre de heladas:</span>{' '}
                  <b className="font-mono">{heladas.periodo_libre_dias.p50} días</b>{' '}
                  <span className="text-ink-700/40">({heladas.periodo_libre_dias.p10}–{heladas.periodo_libre_dias.p90})</span></p>
              )}
              <p className="text-ink-700/50">{heladas.dias_helada_anio} días de helada/año promedio.</p>
              <p className="text-[9px] text-ink-700/40 italic leading-tight">El reanálisis (~10 km) suele
                subestimar heladas en valles y hondonadas — verificá con registros locales.</p>
            </div>
          ) : (
            <p className="text-[10px] text-ink-700/60">Sin heladas registradas en el período (zona libre de heladas según ERA5).</p>
          )}
        </div>

        {/* Sequía + variabilidad + calor */}
        <div className="border-t border-bone-200 pt-2 grid grid-cols-3 gap-2">
          <MiniStat icon={<CalendarClock className="w-3 h-3" />} label="Racha seca" value={`${sequia.racha_anual_p50}d`} sub={`máx ${sequia.racha_max_dias}d`} />
          <MiniStat icon={<Droplets className="w-3 h-3" />} label="Lluvia CV" value={`${precip_anual.cv_pct}%`} sub={`${precip_anual.min_mm}–${precip_anual.max_mm}mm`} />
          <MiniStat icon={<Thermometer className="w-3 h-3" />} label="Calor" value={`${calor.dias_ge_35}d`} sub="≥35°C/año" />
        </div>

        <p className="text-[9px] text-ink-700/45 italic leading-tight border-t border-bone-200 pt-2">
          {extremos.fuente}. Tormenta: {tormenta.metodo}. Precip. media {precip_anual.media_mm} mm/año,
          ET0 {extremos.et0_anual_mm} mm/año. Orientativo — verificar con estaciones locales.
        </p>
      </div>
    </div>
  );
}

// ─── Gráfico mensual ──────────────────────────────────────────────────────────

function GraficoMensual({ meses }: { meses: MesDato[] }) {
  const maxVal = Math.max(...meses.map(m => Math.max(m.precip_mm, m.etp_mm)), 1);
  const H = 72;
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-700">Precipitación vs ETP mensual</p>
        <div className="flex items-center gap-3 text-xs text-ink-700/60">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-water-500 inline-block" />Precip.</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-clay-500 inline-block" />ETP</span>
        </div>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-end gap-0.5" style={{ height: H }}>
          {meses.map((m, i) => (
            <div key={i} className="flex-1 flex items-end gap-px">
              <div className="flex-1 flex flex-col justify-end" title={`${m.mes}: ${m.precip_mm} mm`}>
                <div className="bg-water-500 rounded-t-sm opacity-80" style={{ height: (m.precip_mm / maxVal) * H, minHeight: 1 }} />
              </div>
              <div className="flex-1 flex flex-col justify-end" title={`ETP ${m.mes}: ${m.etp_mm} mm`}>
                <div className="bg-clay-500 rounded-t-sm opacity-80" style={{ height: (m.etp_mm / maxVal) * H, minHeight: 1 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex mt-1">
          {meses.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-[9px] text-ink-700/50">{m.mes.slice(0,1)}</span></div>)}
        </div>
      </div>
    </div>
  );
}

// ─── Rosa de vientos mensual ──────────────────────────────────────────────────

function RosaVientos({ meses }: { meses: MesDato[] }) {
  const hayDir = meses.some(m => m.viento_dir_deg !== undefined);
  if (!hayDir) return null;
  const maxV = Math.max(...meses.map(m => m.viento_ms), 1);
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200 flex items-center gap-1.5">
        <Navigation className="w-3.5 h-3.5 text-moss-700" />
        <p className="text-xs font-medium text-ink-700">Viento predominante por mes</p>
      </div>
      <div className="grid grid-cols-6 gap-1 p-2">
        {meses.map((m, i) => {
          const intensidad = m.viento_ms / maxV; // 0..1
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-1 rounded-lg bg-bone-50" title={`${m.mes}: ${m.viento_dir ?? '—'} · ${m.viento_ms} m/s${m.viento_max_ms ? ` (máx ${m.viento_max_ms})` : ''}`}>
              <span className="text-[9px] text-ink-700/60 font-medium">{m.mes}</span>
              {/* Flecha de procedencia del viento */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ transform: `rotate(${(m.viento_dir_deg ?? 0)}deg)` }}>
                <path d="M12 3 L12 21 M12 3 L8 8 M12 3 L16 8" stroke="#2E7D32" strokeWidth={2} fill="none"
                  strokeLinecap="round" strokeLinejoin="round" opacity={0.4 + intensidad * 0.6} />
              </svg>
              <span className="text-[9px] font-semibold text-moss-900">{m.viento_dir ?? '—'}</span>
              <span className="text-[8px] font-mono text-ink-700/50">{m.viento_ms}</span>
            </div>
          );
        })}
      </div>
      <p className="px-3 pb-2 text-[9px] text-ink-700/45 leading-tight">
        La flecha indica la dirección desde la que sopla el viento (procedencia). Intensidad de color ∝ velocidad media (m/s).
      </p>
    </div>
  );
}

// ─── Heladas ──────────────────────────────────────────────────────────────────

function Heladas({ heladas }: { heladas: NonNullable<DatosClima['heladas']> }) {
  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Snowflake className="w-3.5 h-3.5 text-water-500" />
        <p className="text-xs font-medium text-ink-700">Heladas (estimación)</p>
      </div>
      <p className="text-xs text-ink-700/70 mb-2">{heladas.periodo_libre}</p>
      {heladas.meses_riesgo.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {heladas.meses_riesgo.map(m => (
            <span key={m} className={`text-[9px] px-1.5 py-0.5 rounded ${heladas.meses_seguras.includes(m) ? 'bg-water-500/15 text-water-700 font-semibold' : 'bg-bone-100 text-ink-700/60'}`}>
              {m}
            </span>
          ))}
        </div>
      )}
      <p className="text-[9px] text-ink-700/45 mt-2 leading-tight">
        Riesgo estimado a partir de la temperatura mínima media mensual (azul intenso = mínima media ≤ 0 °C). Orientativo.
      </p>
    </div>
  );
}

// ─── Balance hídrico ──────────────────────────────────────────────────────────

function BalanceHidrico({ meses }: { meses: MesDato[] }) {
  const maxAbs = Math.max(...meses.map(m => Math.abs(m.balance_mm)), 1);
  const H = 48;
  const hayRH = meses.some(m => m.rh_pct !== undefined);
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200">
        <p className="text-xs font-medium text-ink-700">Balance hídrico mensual (P − ETP)</p>
      </div>
      <div className="px-2 pt-2 pb-1">
        <div className="relative" style={{ height: H * 2 }}>
          <div className="absolute w-full h-px bg-bone-200" style={{ top: H }} />
          <div className="flex items-stretch gap-0.5 h-full">
            {meses.map((m, i) => {
              const pos = m.balance_mm >= 0;
              const h = (Math.abs(m.balance_mm) / maxAbs) * H;
              return (
                <div key={i} className="flex-1 flex flex-col" title={`${m.mes}: ${m.balance_mm > 0 ? '+' : ''}${m.balance_mm} mm`}>
                  <div className="flex-none flex items-end justify-center" style={{ height: H }}>
                    {pos && <div className="w-full bg-moss-500 rounded-t-sm opacity-80" style={{ height: h, minHeight: pos ? 1 : 0 }} />}
                  </div>
                  <div className="flex-none flex items-start justify-center" style={{ height: H }}>
                    {!pos && <div className="w-full bg-clay-500 rounded-b-sm opacity-80" style={{ height: h, minHeight: !pos ? 1 : 0 }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex mt-0.5">
          {meses.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-[9px] text-ink-700/50">{m.mes.slice(0,1)}</span></div>)}
        </div>
        <div className="flex justify-between text-xs text-ink-700/50 mt-0.5 px-0.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-moss-500 inline-block opacity-80" />Superávit</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-clay-500 inline-block opacity-80" />Déficit</span>
        </div>
      </div>
      <div className="border-t border-bone-200 overflow-x-auto">
        <table className="w-full text-xs min-w-[440px]">
          <thead>
            <tr className="bg-bone-50">
              <th className="text-left px-3 py-1.5 text-ink-700/60 font-medium">Mes</th>
              <th className="text-right px-2 py-1.5 text-water-500 font-medium">Precip.</th>
              <th className="text-right px-2 py-1.5 text-clay-700 font-medium">ETP</th>
              <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">Balance</th>
              <th className="text-right px-2 py-1.5 text-ink-700/60 font-medium">T med.</th>
              {hayRH && <th className="text-right px-3 py-1.5 text-water-500 font-medium">HR</th>}
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => (
              <tr key={i} className={`border-t border-bone-200/50 ${i % 2 === 0 ? '' : 'bg-bone-50/60'}`}>
                <td className="px-3 py-1.5 font-medium text-ink-700">{m.mes}</td>
                <td className="px-2 py-1.5 text-right font-mono text-water-500">{m.precip_mm}</td>
                <td className="px-2 py-1.5 text-right font-mono text-clay-700">{m.etp_mm}</td>
                <td className={`px-2 py-1.5 text-right font-mono font-semibold ${m.balance_mm >= 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                  {m.balance_mm > 0 ? '+' : ''}{m.balance_mm}
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-ink-700/70">{m.tmean_c}°C</td>
                {hayRH && <td className="px-3 py-1.5 text-right font-mono text-water-500">{m.rh_pct !== undefined ? `${m.rh_pct}%` : '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Calibración manual de la precipitación.
 *
 * Por qué existe: la lluvia de los reanálisis de grilla gruesa (NASA POWER
 * ~50 km) borra el efecto orográfico. Medido en Aguas Buenas (PR): la grilla da
 * 1121 mm/año donde llueven ~1879 mm, y por eso el balance hídrico daba negativo
 * incluso en climas muy húmedos. El sesgo varía según el sitio (0.58×–1.42× en
 * las pruebas), así que no hay factor global: lo corrige el dato de la estación
 * que el profesional conoce.
 */
function CalibracionPrecipBloque({
  calibracion, onCalibracion, precipCruda, precipActual, pendientePct,
}: {
  calibracion:   CalibracionPrecip | null;
  onCalibracion: (c: CalibracionPrecip | null) => void;
  precipCruda:   number | null;
  precipActual:  number;
  pendientePct:  number | null;
}) {
  const [anual, setAnual]   = useState(calibracion?.anual_mm ? String(calibracion.anual_mm) : '');
  const [fuente, setFuente] = useState(calibracion?.fuente ?? '');
  const [abierto, setAbierto] = useState(false);
  const [mensual, setMensual] = useState<string[]>(
    calibracion?.mensual_mm?.map(String) ?? Array(12).fill(''),
  );

  const factor = calibracion && precipCruda ? precipActual / precipCruda : null;
  const quebrado = (pendientePct ?? 0) > 8;

  const aplicarAnual = () => {
    const v = parseFloat(anual.replace(',', '.'));
    if (Number.isFinite(v) && v > 0) onCalibracion({ modo: 'anual', anual_mm: v, fuente: fuente.trim() || undefined });
  };
  const aplicarMensual = () => {
    const vals = mensual.map(s => parseFloat(s.replace(',', '.')));
    if (vals.every(v => Number.isFinite(v) && v >= 0)) {
      onCalibracion({ modo: 'mensual', mensual_mm: vals, fuente: fuente.trim() || undefined });
    }
  };

  const inputCls = 'w-full px-2 py-1 rounded border border-bone-200 bg-white text-ink-900 text-xs placeholder-ink-700/30 focus:outline-none focus:border-moss-500';

  return (
    <div className="rounded-lg border border-bone-200 bg-bone-50/60 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <CloudRain className="w-3.5 h-3.5 text-water-500" />
        <p className="text-xs font-semibold text-ink-900">Calibrar precipitación</p>
      </div>

      {calibracion ? (
        <div className="rounded border border-moss-200 bg-moss-50 px-2 py-1.5 space-y-1">
          <p className="text-[11px] text-moss-900">
            Calibrada a <span className="font-semibold">{precipActual} mm/año</span>
            {precipCruda ? <> · la grilla daba {precipCruda} mm</> : null}
            {factor ? <> (×{factor.toFixed(2)})</> : null}
          </p>
          {calibracion.fuente && <p className="text-[10px] text-ink-700/60">Fuente: {calibracion.fuente}</p>}
          <button
            onClick={() => { onCalibracion(null); setAnual(''); }}
            className="text-[10px] text-clay-700 hover:underline"
          >
            Quitar calibración
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-ink-700/60 leading-relaxed">
            El dato satelital es de grilla gruesa (~50 km) y suele <strong>subestimar la lluvia</strong> en
            terreno quebrado. Si conocés el valor de una estación cercana, cargalo y se re-escala la curva mensual.
          </p>
          {quebrado && (
            <p className="text-[11px] text-clay-700 flex gap-1.5">
              <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Pendiente media {pendientePct!.toFixed(0)} %: terreno quebrado, conviene calibrar.
            </p>
          )}
          <div className="flex items-end gap-1.5">
            <label className="flex-1">
              <span className="block text-[10px] text-ink-700/50 uppercase tracking-wide mb-0.5">Lluvia anual conocida (mm)</span>
              <input className={inputCls} value={anual} onChange={e => setAnual(e.target.value)} placeholder={precipCruda ? String(precipCruda) : '850'} inputMode="decimal" />
            </label>
            <button onClick={aplicarAnual} className="px-2.5 py-1 rounded bg-moss-700 hover:bg-moss-900 text-bone-50 text-xs font-medium transition-colors">
              Aplicar
            </button>
          </div>
          <label className="block">
            <span className="block text-[10px] text-ink-700/50 uppercase tracking-wide mb-0.5">Fuente del dato (opcional)</span>
            <input className={inputCls} value={fuente} onChange={e => setFuente(e.target.value)} placeholder="Estación INTA, vecino, pluviómetro propio…" />
          </label>

          <button onClick={() => setAbierto(a => !a)} className="text-[10px] text-water-500 hover:underline">
            {abierto ? '− Ocultar' : '+ Cargar los 12 meses'} (más preciso)
          </button>
          {abierto && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-6 gap-1">
                {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m, i) => (
                  <label key={m} className="block">
                    <span className="block text-[9px] text-ink-700/40 text-center">{m}</span>
                    <input
                      className="w-full px-1 py-0.5 rounded border border-bone-200 bg-white text-ink-900 text-[10px] font-mono text-center focus:outline-none focus:border-moss-500"
                      value={mensual[i]}
                      onChange={e => setMensual(v => v.map((x, j) => (j === i ? e.target.value : x)))}
                      inputMode="decimal"
                    />
                  </label>
                ))}
              </div>
              <button onClick={aplicarMensual} className="w-full px-2.5 py-1 rounded bg-moss-700 hover:bg-moss-900 text-bone-50 text-xs font-medium transition-colors">
                Aplicar los 12 meses
              </button>
            </div>
          )}
        </>
      )}
      <p className="text-[10px] text-ink-700/40 leading-relaxed">
        Sólo cambia la lluvia. La ETP no se toca, y el balance, la aridez y el Köppen se recalculan.
      </p>
    </div>
  );
}
