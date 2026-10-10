'use client';

import { useMemo, useState } from 'react';
import { Droplets, Sprout, Scale, Info, ChevronDown, Gauge } from 'lucide-react';
import type { Extremos } from '@/lib/climaExtremos';
import {
  balanceCiclico, balanceDeLosAnios, compararReglas, costoDeNoIterar,
  periodoDeCrecimiento, lluviasDependientes, contrastarEtp, contrastarPrecip, fechaDeDekada,
  DIF_PRECIP_SIGNIFICATIVA_PCT,
  AWC_POR_DEFECTO_MM, AWC_REFERENCIA_GAEZ_MM, FRAC_AGOTAMIENTO_FAO56,
  FUENTE_TM, FUENTE_USGS_WB, FUENTE_SWB, FUENTE_DOURADO, FUENTE_FAO56,
  FUENTE_FAO52, FUENTE_GAEZ4, FUENTE_FAO25, EXCEDENTE_NO_ES_RECARGA, MESES_CORTOS,
  type AnioMensual, type ReglaAgotamiento, type SerieDekadal,
} from '@/lib/balanceHidrico';

interface Props {
  /** La serie diaria ya calculada. El bloque no tiene botón propio: usa ésta. */
  extremos:         Extremos | null;
  /** ETP anual de Hargreaves, la que muestra el panel de clima. */
  etpHargreaves_mm: number | null;
  viento_ms:        number | null;
  rh_pct:           number | null;
  /** Agua útil 0–100 cm del panel de suelo. `null` si el panel no corrió. */
  aguaUtil_mm:      number | null;
  /**
   * La lluvia anual que muestra el panel de clima, para poder contrastarla con
   * la de la serie que corre este balance. Son dos fuentes distintas y pueden
   * diferir mucho; sin este dato el bloque no puede avisarlo.
   */
  precipClimatologia_mm: number | null;
  /** La climatología está anclada a pluviómetros (CHIRPS o una estación). */
  precipCalibrada:       boolean;
}

const n0 = (x: number) => Math.round(x).toLocaleString('es-AR');
const n1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Suma las tres décadas de cada mes para pasar de 36 a 12. */
function mensualizar(dek: readonly number[]): number[] {
  return Array.from({ length: 12 }, (_, m) => (dek[m * 3] ?? 0) + (dek[m * 3 + 1] ?? 0) + (dek[m * 3 + 2] ?? 0));
}

export function BalanceHidricoBloque({
  extremos, etpHargreaves_mm, viento_ms, rh_pct, aguaUtil_mm,
  precipClimatologia_mm, precipCalibrada,
}: Props) {
  const [awcManual, setAwcManual] = useState<number | null>(null);
  const [regla, setRegla]         = useState<ReglaAgotamiento>('thornthwaite');
  const [porQue, setPorQue]       = useState(false);

  const awcSuelo = aguaUtil_mm !== null && aguaUtil_mm > 0 ? aguaUtil_mm : null;
  const awc = awcManual ?? awcSuelo ?? AWC_POR_DEFECTO_MM;
  const origenAwc = awcManual !== null ? 'editado a mano'
    : awcSuelo !== null ? 'del panel de suelo, 0–100 cm'
    : `valor por defecto del USGS (${AWC_POR_DEFECTO_MM} mm)`;

  const dek = extremos?.dekadal ?? null;

  // Años mensuales, que salen de sumar las décadas de tres en tres.
  const anios = useMemo<AnioMensual[]>(() => {
    if (!dek) return [];
    return dek.anios.map((anio, i) => ({
      anio,
      precip: mensualizar(dek.precip[i] ?? []),
      etp:    mensualizar(dek.etp[i] ?? []),
    }));
  }, [dek]);

  // Climatología dekadal: la media de cada década entre todos los años.
  const climDekadal = useMemo<SerieDekadal | null>(() => {
    if (!dek || dek.anios.length === 0) return null;
    const med = (xs: number[][], i: number) => xs.reduce((s, f) => s + (f[i] ?? 0), 0) / xs.length;
    return {
      precip: Array.from({ length: 36 }, (_, i) => med(dek.precip, i)),
      etp:    Array.from({ length: 36 }, (_, i) => med(dek.etp, i)),
      tmean:  Array.from({ length: 36 }, (_, i) => med(dek.tmean, i)),
    };
  }, [dek]);

  const climMensual = useMemo(() => {
    if (!climDekadal) return null;
    return { precip: mensualizar(climDekadal.precip), etp: mensualizar(climDekadal.etp) };
  }, [climDekadal]);

  const balance   = useMemo(() => (climMensual ? balanceCiclico(climMensual.precip, climMensual.etp, awc, { regla }) : null), [climMensual, awc, regla]);
  const porAnios  = useMemo(() => (anios.length >= 3 ? balanceDeLosAnios(anios, awc, { regla }) : null), [anios, awc, regla]);
  const reglas    = useMemo(() => (climMensual ? compararReglas(climMensual.precip, climMensual.etp, awc) : null), [climMensual, awc]);
  const costo     = useMemo(() => (climMensual ? costoDeNoIterar(climMensual.precip, climMensual.etp, awc, { regla }) : null), [climMensual, awc, regla]);
  const periodo   = useMemo(() => (climDekadal ? periodoDeCrecimiento(climDekadal, awc, { regla }) : null), [climDekadal, awc, regla]);
  const periodoRef = useMemo(() => (climDekadal ? periodoDeCrecimiento(climDekadal, AWC_REFERENCIA_GAEZ_MM, { regla }) : null), [climDekadal, regla]);
  const lluvias   = useMemo(() => {
    if (anios.length < 3) return [];
    return lluviasDependientes(anios.map(a => a.precip.reduce((s, x) => s + x, 0)));
  }, [anios]);
  const contraste = useMemo(
    () => (etpHargreaves_mm !== null && extremos ? contrastarEtp(etpHargreaves_mm, extremos.et0_anual_mm, viento_ms, rh_pct) : null),
    [etpHargreaves_mm, extremos, viento_ms, rh_pct],
  );
  // La misma verificación que la de la ETP, sobre la lluvia. Hace más falta
  // todavía: la de la ETP compara dos números que se muestran, y esta compara
  // dos que además se CALCULAN con, cada uno en la mitad de la app.
  const contPrecip = useMemo(
    () => (precipClimatologia_mm !== null && extremos
      ? contrastarPrecip(precipClimatologia_mm, extremos.precip_anual.media_mm, precipCalibrada)
      : null),
    [precipClimatologia_mm, extremos, precipCalibrada],
  );
  const lluviasDiscrepan = contPrecip !== null
    && Math.abs(contPrecip.dif_pct) > DIF_PRECIP_SIGNIFICATIVA_PCT;

  if (!extremos) {
    return (
      <div className="bg-moss-500/5 rounded-xl border border-moss-500/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Scale className="w-3.5 h-3.5 text-moss-700" />
          <p className="text-xs font-semibold text-ink-700">Balance hídrico y variabilidad entre años</p>
        </div>
        <p className="text-[11px] text-ink-700/60 leading-snug">
          Calculá primero los extremos (el botón de arriba): el balance se corre año por año sobre esa
          misma serie diaria, porque el balance del año promedio no es el promedio de los balances.
        </p>
      </div>
    );
  }

  if (!dek || !balance || !porAnios || !periodo) {
    return (
      <div className="bg-clay-500/5 rounded-xl border border-clay-500/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Scale className="w-3.5 h-3.5 text-clay-700" />
          <p className="text-xs font-semibold text-ink-700">Balance hídrico y variabilidad entre años</p>
        </div>
        <p className="text-[11px] text-ink-700/70 leading-snug">
          Esta serie se descargó antes de que el balance existiera y no trae los datos por década.
          Volvé a calcular los extremos para que aparezca.
        </p>
      </div>
    );
  }

  const maxBarra = Math.max(...balance.meses.map(m => Math.max(m.etp_mm, m.precip_mm)), 1);

  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 bg-moss-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-bone-200" />
          <p className="text-[11px] font-bold text-bone-50 uppercase tracking-wide">Balance hídrico del suelo</p>
        </div>
        <p className="text-[9px] font-mono text-bone-300">{porAnios.anios} años · {dek.anios[0]}–{dek.anios[dek.anios.length - 1]}</p>
      </div>

      <div className="p-3 space-y-3">
        {/* La discrepancia va ANTES de los números y a la vista, no detrás de
            «por qué»: lo que sigue está calculado con una lluvia distinta de la
            que el panel de arriba imprime como la del predio. El desarrollo
            completo —cuál conviene para qué— sí va en «por qué». */}
        {lluviasDiscrepan && contPrecip && (
          <div className="rounded-lg bg-sun-300/15 border border-sun-300/60 p-2">
            <p className="text-[10px] text-ink-800 leading-snug">
              <b>Esto corre sobre otra lluvia que el panel de arriba.</b> La climatología del
              predio da <span className="font-mono">{n0(contPrecip.climatologia_mm)} mm/año</span> y la
              serie diaria de este balance,{' '}
              <span className="font-mono">{n0(contPrecip.serie_mm)} mm/año</span>:{' '}
              <b>{n0(Math.abs(contPrecip.dif_pct))} % de diferencia</b>. Son dos fuentes para el mismo
              punto. La aridez, la receptividad y la captación usan la primera; el período de
              crecimiento y las lluvias dependientes de acá, la segunda.
            </p>
          </div>
        )}

        {/* ── El año que no es el promedio ── */}
        <div>
          <p className="text-[11px] font-semibold text-ink-700 mb-1.5">
            Déficit y excedente: el año promedio contra los años
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Las clases van escritas enteras y no armadas con una variable:
                Tailwind lee el código fuente, así que una clase interpolada no
                genera CSS y el recuadro sale sin color ni borde. */}
            {([
              ['Déficit', porAnios.deficit, porAnios.anioPromedio.deficit_mm, porAnios.brecha_deficit_mm,
               'rounded-lg p-2 bg-clay-500/8 border border-clay-500/20', 'font-mono text-sm font-bold text-clay-800'],
              ['Excedente', porAnios.excedente, porAnios.anioPromedio.excedente_mm, porAnios.brecha_excedente_mm,
               'rounded-lg p-2 bg-water-500/8 border border-water-500/20', 'font-mono text-sm font-bold text-water-800'],
            ] as const).map(([rotulo, q, promedio, brecha, claseCaja, claseNumero]) => (
              <div key={rotulo} className={claseCaja}>
                <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">{rotulo}</p>
                <p className={claseNumero}>{n0(q.p50)} mm</p>
                <p className="text-[9px] text-ink-700/55 font-mono">
                  {n0(q.p10)}–{n0(q.p90)} entre el año de cada diez
                </p>
                <p className="text-[9px] text-ink-700/70 mt-1 leading-tight">
                  El año promedio dice <b className="font-mono">{n0(promedio)}</b>
                  {Math.abs(brecha) >= 5 && <> · esconde <b className="font-mono">{n0(Math.abs(brecha))} mm</b></>}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-ink-700/50 mt-1.5 leading-tight">
            Mismo clima y misma lluvia media: {n0(porAnios.precip.media)} mm/año contra{' '}
            {n0(porAnios.anioPromedio.precip_mm)} del año promedio. Lo que cambia es que acá los años
            existen de a uno. El año arranca en {MESES_CORTOS[porAnios.mesInicio]} y no en enero, para
            que la temporada seca entre entera en un año.
          </p>
        </div>

        {/* ── La forma del año ── */}
        <div className="border-t border-bone-200 pt-2">
          <p className="text-[11px] font-semibold text-ink-700 mb-1">
            La forma del año promedio (mm por mes)
          </p>
          <div className="flex items-stretch gap-0.5" style={{ height: 56 }}>
            {balance.meses.map(m => {
              const h = (v: number) => `${(v / maxBarra) * 100}%`;
              return (
                <div
                  key={m.mesIndex}
                  className="flex-1 flex flex-col justify-end gap-px"
                  title={`${MESES_CORTOS[m.mesIndex]}: ETR ${n1(m.etr_mm)} · déficit ${n1(m.deficit_mm)} · excedente ${n1(m.excedente_mm)} · reserva ${n1(m.almacenaje_mm)} mm`}
                >
                  {m.excedente_mm > 0 && <div className="w-full bg-water-500 rounded-t-sm" style={{ height: h(m.excedente_mm) }} />}
                  {m.deficit_mm > 0 && <div className="w-full bg-clay-500/80" style={{ height: h(m.deficit_mm) }} />}
                  <div className="w-full bg-moss-500/80" style={{ height: h(m.etr_mm) }} />
                </div>
              );
            })}
          </div>
          <div className="flex mt-0.5">
            {balance.meses.map(m => (
              <div key={m.mesIndex} className="flex-1 text-center">
                <span className="text-[9px] text-ink-700/50">{(MESES_CORTOS[m.mesIndex] ?? '').slice(0, 1).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-ink-700/60 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-moss-500/80 inline-block" />Lo que se evaporó de verdad</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-clay-500/80 inline-block" />Déficit (ETP − ETR)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-water-500 inline-block" />Excedente</span>
          </div>
          <p className="text-[9px] text-ink-700/50 mt-1 leading-tight">
            Reserva del suelo al cierre de cada mes, en mm:{' '}
            <span className="font-mono">{balance.meses.map(m => n0(m.almacenaje_mm)).join(' · ')}</span>.
            Convergió en {balance.ciclos} {balance.ciclos === 1 ? 'vuelta' : 'vueltas'} al año.
          </p>
        </div>

        {/* ── Período de crecimiento ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center gap-1 mb-1 text-moss-700">
            <Sprout className="w-3 h-3" />
            <p className="text-[11px] font-semibold">Cuándo se puede sembrar</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-sm font-bold text-moss-800">{periodo.dias} días</p>
            <p className="text-[10px] text-ink-700/70">{periodo.regimen}</p>
          </div>
          {periodo.tramos.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-[10px] text-ink-700/80">
              {periodo.tramos.map((t, i) => (
                <li key={i} className="font-mono">
                  {fechaDeDekada(t.desde_dekada)} → {fechaDeDekada(t.hasta_dekada)}{' '}
                  <span className="text-ink-700/50">({t.dias} días)</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-ink-700/70 mt-1">
              Sin período de crecimiento de secano: la lluvia nunca llega a la mitad de la demanda.
            </p>
          )}
          {periodo.dif_criterios_dekadas !== null && periodo.dif_criterios_dekadas !== 0 && (
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              El criterio de 1983 (lluvia ≥ media ETP) arrancaría el{' '}
              <span className="font-mono">{fechaDeDekada(periodo.inicio_fao52!)}</span>, o sea{' '}
              {Math.abs(periodo.dif_criterios_dekadas)}{' '}
              {Math.abs(periodo.dif_criterios_dekadas) === 1 ? 'década' : 'décadas'}{' '}
              {periodo.dif_criterios_dekadas > 0 ? 'más tarde' : 'más temprano'} que el vigente.
              Son dos criterios publicados de FAO sobre esta misma serie.
            </p>
          )}
          {periodoRef && periodoRef.dias !== periodo.dias && (
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              Con el suelo de referencia de los mapas globales ({AWC_REFERENCIA_GAEZ_MM} mm) serían{' '}
              <b className="font-mono">{periodoRef.dias} días</b> y régimen {periodoRef.regimen.toLowerCase()}.
              La diferencia es el suelo de este predio, que el mapa no conoce.
            </p>
          )}
        </div>

        {/* ── Lluvia con chance de ocurrencia ── */}
        {lluvias.length > 0 && (
          <div className="border-t border-bone-200 pt-2">
            <div className="flex items-center gap-1 mb-1 text-water-700">
              <Droplets className="w-3 h-3" />
              <p className="text-[11px] font-semibold">Con qué lluvia conviene dimensionar</p>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {lluvias.map(l => (
                <div key={l.chance_pct} className="bg-water-500/8 rounded-lg py-1.5 text-center" title={l.para}>
                  <p className="text-[9px] text-ink-700/60">{l.chance_pct} % chance</p>
                  <p className="font-mono text-xs font-bold text-water-800">{l.mm === null ? '—' : `${n0(l.mm)} mm`}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-ink-700/50 mt-1 leading-tight">
              El 80 % de chance es un número <b>chico</b>: es la lluvia que se iguala o supera en cuatro
              años de cada cinco. La media anual ({n0(porAnios.precip.media)} mm) se supera en menos de
              la mitad de los años, así que dimensionar con la media deja el proyecto corto la mitad
              del tiempo.
            </p>
          </div>
        )}

        {/* ── Las dos reglas ── */}
        {reglas && (
          <div className="border-t border-bone-200 pt-2">
            <p className="text-[11px] font-semibold text-ink-700 mb-1">Las dos reglas publicadas</p>
            <div className="grid grid-cols-2 gap-2 text-center">
              {([
                ['Thornthwaite-Mather', reglas.thornthwaite, 'thornthwaite'],
                [`FAO-56 (p = ${n1(FRAC_AGOTAMIENTO_FAO56).replace('.', ',')})`, reglas.fao56, 'fao56'],
              ] as const).map(([rotulo, b, id]) => (
                <button
                  key={id}
                  onClick={() => setRegla(id)}
                  className={`rounded-lg p-2 border text-left transition-colors ${
                    regla === id ? 'bg-ink-950 border-ink-950 text-bone-50' : 'bg-bone-50 border-bone-200 hover:border-ink-700/30'
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wide opacity-70">{rotulo}</p>
                  <p className="font-mono text-xs font-bold">{n0(b.deficit_mm)} mm de déficit</p>
                  <p className="text-[9px] opacity-60 font-mono">{n0(b.excedente_mm)} mm de excedente</p>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
              {reglas.factor_deficit !== null && reglas.factor_deficit > 1.2
                ? <>Difieren por un factor <b>{n1(reglas.factor_deficit).replace('.', ',')}</b>. </>
                : <>Acá las dos casi coinciden. </>}
              {reglas.porque}
            </p>
          </div>
        )}

        {/* ── El agua útil del suelo ── */}
        <div className="border-t border-bone-200 pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-ink-700">
              <Gauge className="w-3 h-3" />
              <p className="text-[11px] font-semibold">Agua útil del suelo</p>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number" min={0} max={600} step={10}
                value={Math.round(awc)}
                onChange={e => setAwcManual(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
                className="w-16 px-1.5 py-0.5 text-right font-mono text-[11px] border border-bone-300 rounded"
              />
              <span className="text-[10px] text-ink-700/60">mm</span>
            </div>
          </div>
          <p className="text-[9px] text-ink-700/55 mt-1 leading-tight">
            {origenAwc}. Es el número que más mueve el resultado: con un suelo más profundo el déficit
            baja, el excedente baja y la temporada se estira.
            {awcManual !== null && awcSuelo !== null && (
              <> <button onClick={() => setAwcManual(null)} className="underline">Volver al {n0(awcSuelo)} mm del panel de suelo</button>.</>
            )}
          </p>
        </div>

        {/* ── Por qué ── */}
        <button
          onClick={() => setPorQue(v => !v)}
          className="w-full flex items-center justify-center gap-1 pt-1 text-[10px] text-ink-700/60 hover:text-ink-700"
        >
          <Info className="w-3 h-3" />
          Por qué estos números
          <ChevronDown className={`w-3 h-3 transition-transform ${porQue ? 'rotate-180' : ''}`} />
        </button>

        {porQue && (
          <div className="space-y-2 text-[9px] text-ink-700/70 leading-relaxed border-t border-bone-200 pt-2">
            {costo && Math.abs(costo.agua_fantasma_mm) >= 1 && (
              <p>
                <b>El suelo que se regala.</b> El balance se itera hasta que la reserva deja de moverse
                de un año al siguiente. Corrido una sola vez desde capacidad de campo —que es lo que
                sale de no iterar— inventaría <b className="font-mono">{n0(costo.agua_fantasma_mm)} mm</b> de
                evapotranspiración por año y daría un déficit de {n0(costo.deficit_sin_iterar_mm)} mm en
                vez de {n0(costo.deficit_mm)}.
              </p>
            )}
            {contraste && (
              <p>
                <b>Las dos ETP de la app.</b> El panel de clima usa Hargreaves (FAO-56 ec. 52):{' '}
                <span className="font-mono">{n0(contraste.hargreaves_mm)} mm/año</span>. Esta serie trae
                Penman-Monteith, que usa además viento, humedad y radiación:{' '}
                <span className="font-mono">{n0(contraste.penman_mm)} mm/año</span>. Difieren{' '}
                <b>{n0(Math.abs(contraste.dif_pct))} %</b>. El balance de acá usa la segunda.
                {contraste.sesgo_esperado && <> {contraste.sesgo_esperado}</>}
                {contraste.coincide === false && <> Acá el sesgo medido va para el otro lado que el anticipado.</>}
              </p>
            )}
            <p>
              <b>La columna «P − ETP» del gráfico de arriba no es esto.</b> Es lluvia menos demanda, el
              primer paso del procedimiento. El déficit es ETP menos lo que el agua del suelo alcanzó a
              satisfacer, y el excedente es lo que pasó la capacidad del suelo. Un mes con P − ETP muy
              negativo sobre un suelo lleno puede no tener déficit.
            </p>
            <p>{EXCEDENTE_NO_ES_RECARGA}</p>
            {[...porAnios.advertencias, ...periodo.advertencias, ...balance.advertencias,
              ...(reglas?.advertencias ?? []), ...(contraste?.advertencias ?? []),
              ...(contPrecip?.advertencias ?? [])].map((a, i) => (
              <p key={i}>{a}</p>
            ))}
            <div className="pt-1 border-t border-bone-200 space-y-0.5">
              <p className="font-semibold text-ink-700/80">Fuentes</p>
              {[FUENTE_TM, FUENTE_USGS_WB, FUENTE_SWB, FUENTE_DOURADO, FUENTE_FAO56, FUENTE_FAO52, FUENTE_GAEZ4, FUENTE_FAO25].map(f => (
                <p key={f} className="text-ink-700/55">· {f}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
