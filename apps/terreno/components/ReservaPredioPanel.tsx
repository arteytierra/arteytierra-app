'use client';

/**
 * «¿Alcanza el agua?» — el panel de resumen que cruza todo lo que entra, todo lo
 * que se guarda y todo lo que se gasta.
 *
 * Es el único panel de acequia cuyo trabajo es *no* calcular nada nuevo: la
 * captación la calcula `captacion.ts`, el consumo también, la racha seca
 * `climaExtremos.ts`, la ETP `clima.ts` y el vaciado `reservaPredio.ts`. Lo que
 * hace es ponerlos en la misma pantalla, que es donde la pregunta del dueño del
 * predio existe y donde no estaba.
 *
 * El orden de lectura es deliberado y es el inverso del que tendría un panel de
 * cálculo: primero el veredicto —cuántos días aguanta y si eso alcanza—, después
 * el inventario que lo produjo, y al final los cuatro trimestres. Un panel que
 * abre con una tabla de fuentes obliga a cargar seis campos para recién entonces
 * enterarse de qué pregunta estaba contestando.
 */

import { useMemo, useState } from 'react';
import {
  ChevronDown, Droplets, Info, Plus, Trash2, TriangleAlert, Waves,
} from 'lucide-react';
import type { DatosClima } from '@/lib/clima';
import type { Extremos } from '@/lib/climaExtremos';
import type { CaptacionSnapshot } from '@/lib/captacion';
import { MESES_POR_TRIMESTRE } from '@/lib/estaciones';
import {
  ROTULO_ORIGEN, contrastarRed, mesAbr, reunirDemandas, reunirFuentes,
} from '@/lib/balanceAgua';
import type { Rodeo } from '@/lib/rodeo';
import type { RiegoResumen } from '@/lib/riego';
import type { RedAguaResumen } from '@/lib/hidraulica';
import type { RepresaGuardada } from '@/lib/represasGuardadas';
import type { ElementoAguada } from '@/lib/aguadas';
import {
  ESCENARIOS_RACHA, FUENTE_AH590_RESERVA, FUENTE_FAO56_ESPEJO, FUENTE_RACHA,
  TIPOS_FUENTE, etpCritica, nuevaFuenteDefault, rachaDeDiseno, resumenReserva,
  volumenUtil_m3,
  type EscenarioRacha, type FuenteAgua, type ReservaSnapshot, type TipoFuente,
} from '@/lib/reservaPredio';
import { Cautela } from './Cautela';

interface Props {
  clima:     DatosClima | null;
  extremos:  Extremos | null;
  captacion: CaptacionSnapshot | null;
  /** El rodeo del predio, que es quien manda en el agua de la hacienda. */
  rodeo?:    Rodeo | null;
  /** El riego calculado mes a mes, que manda sobre la fila «huerta». */
  riego?:    RiegoResumen | null;
  /** La traza de agua, para cruzar el caño contra el día pico. */
  red?:      RedAguaResumen | null;
  /** Las represas ya dimensionadas, para traerlas al inventario. */
  represas?: readonly RepresaGuardada[] | null;
  /** Los marcadores del plano: se cuentan, no se convierten. */
  aguadas?:  readonly ElementoAguada[] | null;
  snapshotInicial?: ReservaSnapshot | null;
  onSnapshot?: (s: ReservaSnapshot | null) => void;
  /** Para mandar al usuario a traer lo que falta. */
  onIrAClima?: () => void;
  onIrACaptacion?: () => void;
}

const n0 = (x: number) => Math.round(x).toLocaleString('es-AR');
const n1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Los tipos agrupados, para que el selector no sea una lista de nueve. */
const GRUPOS: ReadonlyArray<{ titulo: string; tipos: readonly TipoFuente[] }> = [
  { titulo: 'Almacenaje al aire',  tipos: ['represa', 'tajamar', 'aguada'] },
  { titulo: 'Almacenaje cerrado',  tipos: ['cisterna', 'ecocisterna', 'tanque'] },
  { titulo: 'Caudal',              tipos: ['naciente', 'vertiente', 'pozo'] },
];

function NumeroCampo({ label, valor, sufijo, onCambio, paso = 1 }: {
  label: string; valor: number; sufijo: string; onCambio: (v: number) => void; paso?: number;
}) {
  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] uppercase text-ink-700/55 tracking-wide truncate">{label}</span>
      <span className="flex items-baseline gap-1">
        <input
          type="number" min={0} step={paso} value={Number.isFinite(valor) ? valor : 0}
          onChange={e => {
            const v = Number(e.target.value);
            onCambio(Number.isFinite(v) && v >= 0 ? v : 0);
          }}
          className="w-full min-w-0 text-[11px] font-mono rounded border border-bone-300 px-1.5 py-1 focus:border-water-500 focus:outline-none"
        />
        <span className="text-[9px] text-ink-700/45 shrink-0">{sufijo}</span>
      </span>
    </label>
  );
}

export function ReservaPredioPanel({
  clima, extremos, captacion, rodeo, riego, red, represas, aguadas,
  snapshotInicial, onSnapshot, onIrAClima, onIrACaptacion,
}: Props) {
  const [fuentes, setFuentes] = useState<FuenteAgua[]>(() => snapshotInicial?.fuentes ?? []);
  const [escenario, setEscenario] = useState<EscenarioRacha>(() => snapshotInicial?.escenario ?? 'seco');
  const [abierta, setAbierta] = useState<string | null>(null);
  const [porQue, setPorQue] = useState(false);
  const [verSerie, setVerSerie] = useState(false);

  /** Toda mutación pasa por acá, así el snapshot nunca se olvida de emitirse. */
  const aplicar = (fs: FuenteAgua[], esc: EscenarioRacha = escenario) => {
    setFuentes(fs);
    setEscenario(esc);
    onSnapshot?.(fs.length > 0 ? { fuentes: fs, escenario: esc } : null);
  };

  const etp = useMemo(() => etpCritica(clima?.meses ?? null), [clima]);
  const racha = useMemo(() => rachaDeDiseno(extremos?.sequia ?? null, escenario), [extremos, escenario]);

  // La demanda ya no sale de una sola pestaña: se reúne de todas y se
  // reconcilia, para que las mismas vacas no se cuenten dos veces. Ver
  // `lib/balanceAgua.ts`.
  const demanda = useMemo(() => reunirDemandas({
    captacion,
    rodeo,
    tmean_c: clima?.meses.map(m => m.tmean_c) ?? null,
    riego,
  }), [captacion, rodeo, clima, riego]);

  const egresoTrimestral_m3 = useMemo(
    () => MESES_POR_TRIMESTRE.map(meses =>
      meses.reduce((s, mi) => s + (demanda.mensual_m3[mi] ?? 0), 0)),
    [demanda],
  );

  const contRed = useMemo(
    () => contrastarRed(red, demanda.pico_l_dia),
    [red, demanda.pico_l_dia],
  );

  const delPredio = useMemo(
    () => reunirFuentes({ represas, aguadas, yaCargadas: fuentes }),
    [represas, aguadas, fuentes],
  );

  const r = useMemo(() => resumenReserva({
    fuentes,
    // El PICO y no el promedio: una racha seca cae en la seca, que es cuando
    // el riego está al máximo y la hacienda toma más.
    demanda_l_dia: demanda.pico_l_dia,
    etp_mm_dia: etp?.mm_dia ?? 0,
    racha,
    trimestresCaptacion: captacion?.resultado?.balance_trimestral ?? null,
    egresoTrimestral_m3,
  }), [fuentes, demanda.pico_l_dia, etp, racha, captacion, egresoTrimestral_m3]);

  const v = r.gastandoEspejo;

  return (
    <div className="space-y-3">
      {/* ── El veredicto ── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 bg-water-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-bone-200" />
            <p className="text-[11px] font-bold text-bone-50 uppercase tracking-wide">¿Alcanza el agua?</p>
          </div>
          {racha && (
            <p className="text-[9px] font-mono text-bone-300">racha de {racha.dias} días</p>
          )}
        </div>

        <div className="p-3 space-y-3">
          {racha && v.dias !== null ? (
            <div>
              <div className={v.aguanta
                ? 'rounded-lg p-2.5 bg-moss-500/8 border border-moss-500/25'
                : 'rounded-lg p-2.5 bg-clay-500/8 border border-clay-500/25'}>
                <p className="text-[11px] font-semibold text-ink-700 leading-snug">
                  {v.aguanta
                    ? <>La reserva aguanta los <b className="font-mono">{racha.dias} días</b> de racha seca{v.llegoAlTope ? ' y bastante más' : <> y da para <b className="font-mono">{v.dias} días</b></>}.</>
                    : <>La reserva aguanta <b className="font-mono">{v.dias} {v.dias === 1 ? 'día' : 'días'}</b> y la racha seca de este predio es de <b className="font-mono">{racha.dias}</b>.</>}
                </p>
                {!v.aguanta && (
                  <p className="text-[10px] text-clay-800 mt-0.5 leading-snug">
                    Faltan {racha.dias - (v.dias ?? 0)} días de reserva. Eso se cubre con más volumen, con
                    menos espejo por metro cúbico —un vaso más hondo pierde menos— o bajando la demanda del
                    período seco.
                  </p>
                )}
                {v.aguanta && v.queda_al_final_m3 != null && (
                  <p className="text-[10px] text-ink-700/65 mt-0.5 leading-snug">
                    Al terminar la racha quedarían <b className="font-mono">{n1(v.queda_al_final_m3)} m³</b> útiles.
                  </p>
                )}
              </div>

              {/* El número que la cuenta ingenua deja afuera. */}
              {v.perdida_dia1_m3 > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="rounded-lg p-2 bg-bone-100 border border-bone-300">
                    <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Se consume</p>
                    <p className="font-mono text-sm font-bold text-ink-700">{n1(r.demanda_m3_dia)}</p>
                    <p className="text-[9px] text-ink-700/50">m³ el día pico</p>
                  </div>
                  <div className="rounded-lg p-2 bg-clay-500/8 border border-clay-500/20">
                    <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Se pierde</p>
                    <p className="font-mono text-sm font-bold text-clay-800">{n1(v.perdida_dia1_m3)}</p>
                    <p className="text-[9px] text-ink-700/50">m³ el primer día</p>
                  </div>
                  <div className="rounded-lg p-2 bg-moss-500/8 border border-moss-500/20">
                    <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Entra firme</p>
                    <p className="font-mono text-sm font-bold text-moss-800">{n1(r.caudal_firme_m3_dia)}</p>
                    <p className="text-[9px] text-ink-700/50">m³ por día</p>
                  </div>
                </div>
              )}

              {v.perdida_dia1_m3 > r.demanda_m3_dia && r.demanda_m3_dia > 0 && (
                <p className="text-[10px] text-clay-800 leading-snug mt-1.5 flex gap-1">
                  <TriangleAlert className="w-3 h-3 shrink-0 mt-px" />
                  <span>
                    El espejo pierde más de lo que consume todo el predio. Acá la autonomía no se
                    arregla gastando menos: se arregla tapando la reserva o haciéndola más honda.
                  </span>
                </p>
              )}

              <Cautela claim="La autonomía no es el volumen dividido por el consumo.">
                Dividir los <b className="font-mono">{n1(r.util_m3)} m³</b> útiles por los{' '}
                <b className="font-mono">{n1(r.demanda_m3_dia)} m³</b> que se consumen por día daría{' '}
                <b className="font-mono">{r.demanda_m3_dia > 0 ? n0(r.util_m3 / r.demanda_m3_dia) : '—'} días</b>,
                y es optimista: deja afuera la evaporación del espejo y la infiltración del vaso, que
                son superficie por lámina y no dependen de cuánta agua haya debajo. Con{' '}
                <b className="font-mono">{n0(r.espejo_total_m2)} m²</b> de espejo al aire
                {etp && <> y la ETP de {etp.mes}</>}, el primer día se van{' '}
                <b className="font-mono">{n1(v.perdida_dia1_m3)} m³</b> sin que nadie abra una canilla. La
                pérdida baja a medida que el espejo se encoge, y por eso la cuenta va día por día.
              </Cautela>

              {r.dias_por_el_orden != null && r.dias_por_el_orden !== 0 && (
                <Cautela claim={`Gastar primero la reserva al aire da ${Math.abs(r.dias_por_el_orden)} ${Math.abs(r.dias_por_el_orden) === 1 ? 'día' : 'días'} más, con la misma agua.`}>
                  El litro que queda en una represa abierta se evapora en parte; el que queda en una
                  cisterna, no. Así que el orden de uso cambia el resultado sin cambiar el agua:
                  gastando primero el espejo aguanta <b className="font-mono">{v.dias}</b> días y
                  guardándolo para el final, <b className="font-mono">{r.gastandoCerrado.dias}</b>. La
                  cuenta de arriba usa el orden que rinde más, así que supone que el manejo se hace así.
                </Cautela>
              )}

              {v.serie.length > 0 && (
                <>
                  <button
                    onClick={() => setVerSerie(s => !s)}
                    className="text-[10px] text-water-600 hover:underline font-semibold"
                  >
                    {verSerie ? 'Ocultar' : 'Ver'} el vaciado día por día
                  </button>
                  {verSerie && (
                    <div className="overflow-x-auto mt-1 rounded-lg border border-bone-200">
                      <table className="w-full text-[9px]">
                        <thead className="bg-bone-100">
                          <tr className="text-ink-700/60 text-left">
                            <th className="px-1.5 py-1 font-semibold">Día</th>
                            <th className="px-1.5 py-1 font-semibold">Queda</th>
                            <th className="px-1.5 py-1 font-semibold">Evap.</th>
                            <th className="px-1.5 py-1 font-semibold">Infiltr.</th>
                            <th className="px-1.5 py-1 font-semibold">Consumo</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {v.serie.slice(0, Math.max(racha.dias + 2, 10)).map(d => (
                            <tr key={d.dia} className={d.falto ? 'bg-clay-500/8' : 'border-t border-bone-200'}>
                              <td className="px-1.5 py-0.5">{d.dia}</td>
                              <td className="px-1.5 py-0.5">{n1(d.queda_m3)}</td>
                              <td className="px-1.5 py-0.5 text-ink-700/60">{n1(d.evaporado_m3)}</td>
                              <td className="px-1.5 py-0.5 text-ink-700/60">{n1(d.infiltrado_m3)}</td>
                              <td className="px-1.5 py-0.5">{n1(d.consumido_m3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-ink-700/65 leading-snug">
              {fuentes.length === 0
                ? 'Cargá abajo las fuentes de agua del predio —las represas que ya diseñaste, las cisternas, y las nacientes o pozos con su caudal— y acá aparece cuántos días aguantan la racha seca de este lugar.'
                : v.dias === null
                  ? 'No hay demanda declarada ni pérdidas, así que la autonomía no es un número grande: es una pregunta sin plantear. Cargá los consumos en Captación.'
                  : 'Falta la racha seca medida. Traé los extremos climáticos desde Clima.'}
            </p>
          )}

          {/* El período de diseño */}
          <div className="border-t border-bone-200 pt-2">
            <p className="text-[10px] font-semibold text-ink-700 mb-1">
              ¿Contra qué racha seca se compara?
            </p>
            <div className="flex flex-wrap gap-1">
              {(['tipico', 'seco', 'peor'] as const).map(k => {
                const dias = rachaDeDiseno(extremos?.sequia ?? null, k)?.dias ?? null;
                return (
                  <button
                    key={k}
                    onClick={() => aplicar(fuentes, k)}
                    disabled={dias === null}
                    className={escenario === k
                      ? 'text-[9px] px-1.5 py-0.5 rounded border font-medium bg-water-500/15 text-water-800 border-water-500/40'
                      : 'text-[9px] px-1.5 py-0.5 rounded border font-medium bg-white text-ink-700/60 border-bone-300 hover:border-bone-400 disabled:opacity-40'}
                  >
                    {ESCENARIOS_RACHA[k].rotulo}{dias !== null && <> · {dias} d</>}
                  </button>
                );
              })}
            </div>
            {racha && (
              <p className="text-[9px] text-ink-700/55 mt-1 leading-snug">{racha.lectura}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Lo que ya está cargado en otros paneles ──
          Jonatan, 10/10/2026: «cuando la abre debería tener toda la data de los
          paneles anteriores precargada y ahí ver la unificación de todos los
          sistemas de captación de agua y todas las necesidades de
          abastecimiento». Esto es eso, y la parte que no se ve es la que más
          importa: los aportes que NO suman porque otra pestaña ya los cuenta
          mejor quedan listados igual, con el motivo. */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 bg-bone-100 border-b border-bone-200 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-ink-700">Lo que el predio consume</p>
          <p className="text-[9px] font-mono text-ink-700/55">
            {n0(demanda.total_l_dia)} L/día · pico {n0(demanda.pico_l_dia)}
          </p>
        </div>

        <div className="p-3 space-y-2">
          {demanda.aportes.length === 0 ? (
            <p className="text-[10px] text-ink-700/65 leading-snug">
              Todavía no hay ningún consumo declarado. Sale solo de tres lados: los consumos de{' '}
              <b>Captación</b>, el rodeo de <b>Producción</b> y la lámina de <b>Riego</b>. Lo que
              cargues allá aparece acá sin volver a escribirlo.
            </p>
          ) : (
            <div className="space-y-1">
              {demanda.aportes.map(ap => (
                <div key={ap.id}
                  className={`rounded-lg border px-2 py-1.5 ${ap.descartado
                    ? 'border-bone-200 bg-bone-50'
                    : 'border-bone-200 bg-white'}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-[10px] min-w-0 truncate ${ap.descartado
                      ? 'text-ink-700/40 line-through'
                      : 'font-semibold text-ink-700'}`}>
                      {ap.rotulo}
                    </span>
                    <span className={`font-mono text-[10px] shrink-0 ${ap.descartado
                      ? 'text-ink-700/35 line-through'
                      : 'text-ink-900'}`}>
                      {n0(ap.l_dia)} L/día
                    </span>
                  </div>
                  <p className="text-[9px] text-ink-700/45">
                    {ROTULO_ORIGEN[ap.origen]}
                    {!ap.descartado && ap.pico_l_dia > ap.l_dia * 1.05 && (
                      <> · pico {n0(ap.pico_l_dia)} L/día{ap.mes_pico !== null && <> en {mesAbr(ap.mes_pico)}</>}</>
                    )}
                  </p>
                  {ap.descartado && (
                    <p className="text-[9px] text-clay-800 leading-snug mt-0.5">{ap.descartado}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {demanda.advertencias.map((t, i) => (
            <p key={i} className="text-[9px] text-ink-700/60 leading-snug flex gap-1">
              <Info className="w-3 h-3 shrink-0 mt-px text-ink-700/40" />
              <span>{t}</span>
            </p>
          ))}

          {/* El caño, que no es un consumo pero puede ser el cuello. */}
          {contRed && (
            <p className={`text-[9px] leading-snug flex gap-1 ${contRed.estrangula
              ? 'text-clay-800' : 'text-ink-700/60'}`}>
              {contRed.estrangula
                ? <TriangleAlert className="w-3 h-3 shrink-0 mt-px" />
                : <Waves className="w-3 h-3 shrink-0 mt-px text-ink-700/40" />}
              <span>
                <b>La red de servicios.</b> {contRed.lectura} El caudal de una traza es un caudal de
                diseño del caño y no un consumo: no se suma a lo de arriba.
              </span>
            </p>
          )}

          {/* Las represas ya diseñadas, a un clic. */}
          {delPredio.sugeridas.length > 0 && (
            <div className="rounded-lg border border-water-500/30 bg-water-500/5 px-2 py-1.5">
              <p className="text-[10px] text-ink-800 leading-snug">
                Hay {delPredio.sugeridas.length}{' '}
                {delPredio.sugeridas.length === 1 ? 'represa dimensionada' : 'represas dimensionadas'}{' '}
                que todavía no {delPredio.sugeridas.length === 1 ? 'está' : 'están'} en el inventario
                de abajo.
              </p>
              <button
                onClick={() => aplicar([...fuentes, ...delPredio.sugeridas.map(x => x.fuente)])}
                className="mt-1 text-[10px] px-2 py-1 rounded-lg bg-water-700 hover:bg-water-800 text-bone-50 font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Traer {delPredio.sugeridas.map(x => x.fuente.nombre).join(', ')}
              </button>
              <p className="text-[9px] text-ink-700/50 leading-snug mt-1">
                Entra el volumen y el espejo que calculó Represas. El <b>volumen muerto</b> hay que
                ponerlo a mano: es la lámina que no se puede usar y sale de la misma pestaña.
              </p>
            </div>
          )}
          {delPredio.advertencias.map((t, i) => (
            <p key={i} className="text-[9px] text-ink-700/60 leading-snug flex gap-1">
              <Info className="w-3 h-3 shrink-0 mt-px text-ink-700/40" />
              <span>{t}</span>
            </p>
          ))}
        </div>
      </div>

      {/* ── El inventario ── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 bg-bone-100 border-b border-bone-200 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-ink-700">Las fuentes del predio</p>
          <p className="text-[9px] font-mono text-ink-700/55">
            {n1(r.util_m3)} m³ útiles{r.muerto_m3 > 0 && <> · {n1(r.muerto_m3)} muertos</>}
          </p>
        </div>

        <div className="p-3 space-y-2">
          {fuentes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2 bg-water-500/8 border border-water-500/20">
                <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Al aire</p>
                <p className="font-mono text-sm font-bold text-water-800">{n1(r.util_abierto_m3)}</p>
                <p className="text-[9px] text-ink-700/50">m³ útiles · {n0(r.espejo_total_m2)} m² de espejo</p>
              </div>
              <div className="rounded-lg p-2 bg-moss-500/8 border border-moss-500/20">
                <p className="text-[9px] uppercase text-ink-700/55 tracking-wide">Tapado</p>
                <p className="font-mono text-sm font-bold text-moss-800">{n1(r.util_cerrado_m3)}</p>
                <p className="text-[9px] text-ink-700/50">m³ útiles · no evapora</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {fuentes.map(f => {
              const ficha = TIPOS_FUENTE[f.tipo];
              const open = abierta === f.id;
              const cambiar = (patch: Partial<FuenteAgua>) =>
                aplicar(fuentes.map(x => (x.id === f.id ? { ...x, ...patch } : x)));
              return (
                <div key={f.id} className="rounded-lg border border-bone-200 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAbierta(open ? null : f.id)}
                      className="flex-1 min-w-0 px-2 py-1.5 flex items-center justify-between gap-2 hover:bg-bone-50 text-left"
                    >
                      <span className="min-w-0">
                        <span className="text-[10px] font-semibold text-ink-700 block truncate">{f.nombre}</span>
                        <span className="text-[9px] text-ink-700/55">
                          {ficha.label} ·{' '}
                          {ficha.clase === 'caudal'
                            ? <>{n1(f.caudal_l_min)} L/min{!f.medidoEnSeca && <span className="text-clay-800"> · sin medir en la seca</span>}</>
                            : <>{n1(volumenUtil_m3(f))} m³ útiles{ficha.abierta && <> · {n0(f.espejo_m2)} m² de espejo</>}</>}
                        </span>
                      </span>
                      <ChevronDown className={`w-3 h-3 text-ink-700/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={() => aplicar(fuentes.filter(x => x.id !== f.id))}
                      className="px-2 text-ink-700/30 hover:text-clay-700 transition-colors"
                      title="Quitar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {open && (
                    <div className="px-2 pb-2 space-y-2">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase text-ink-700/55 tracking-wide">Nombre</span>
                        <input
                          type="text" value={f.nombre}
                          onChange={e => cambiar({ nombre: e.target.value })}
                          className="text-[11px] rounded border border-bone-300 px-1.5 py-1 focus:border-water-500 focus:outline-none"
                        />
                      </label>

                      {ficha.clase === 'almacenaje' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <NumeroCampo label="Volumen" sufijo="m³" valor={f.volumen_m3}
                            onCambio={volumen_m3 => cambiar({ volumen_m3 })} />
                          <NumeroCampo label="Volumen muerto" sufijo="m³" valor={f.volumenMuerto_m3}
                            onCambio={volumenMuerto_m3 => cambiar({ volumenMuerto_m3 })} />
                          {ficha.abierta && (
                            <>
                              <NumeroCampo label="Espejo" sufijo="m²" valor={f.espejo_m2}
                                onCambio={espejo_m2 => cambiar({ espejo_m2 })} paso={10} />
                              <NumeroCampo label="Infiltración" sufijo="mm/día" valor={f.infiltracion_mm_dia}
                                onCambio={infiltracion_mm_dia => cambiar({ infiltracion_mm_dia })} paso={0.5} />
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <NumeroCampo label="Caudal" sufijo="L/min" valor={f.caudal_l_min}
                            onCambio={caudal_l_min => cambiar({ caudal_l_min })} paso={0.5} />
                          <label className="flex items-start gap-1.5 text-[10px] text-ink-700/80 leading-snug">
                            <input
                              type="checkbox" checked={f.medidoEnSeca}
                              onChange={e => cambiar({ medidoEnSeca: e.target.checked })}
                              className="w-3 h-3 accent-water-600 mt-0.5 shrink-0"
                            />
                            <span>
                              Este caudal se midió <b>en la época seca</b>. Sin esto no entra en la cuenta
                              de autonomía: lo que da en primavera no dice nada de febrero.
                            </span>
                          </label>
                        </div>
                      )}

                      <p className="text-[9px] text-ink-700/55 leading-snug">{ficha.nota}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wide text-ink-700/45 mb-1">Agregar</p>
            {GRUPOS.map(g => (
              <div key={g.titulo} className="mb-1">
                <p className="text-[9px] text-ink-700/40">{g.titulo}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {g.tipos.map(t => (
                    <button
                      key={t}
                      onClick={() => aplicar([...fuentes, nuevaFuenteDefault(t)])}
                      className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-white text-ink-700/70 border-bone-300 hover:border-water-500 hover:text-water-800 transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {TIPOS_FUENTE[t].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Los cuatro trimestres ── */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 bg-bone-100 border-b border-bone-200">
          <p className="text-[11px] font-semibold text-ink-700">Ingresos y egresos, por trimestre</p>
        </div>
        <div className="p-3">
          {r.trimestres.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-bone-200">
                <table className="w-full text-[10px]">
                  <thead className="bg-bone-100">
                    <tr className="text-ink-700/60 text-left">
                      <th className="px-2 py-1 font-semibold">Trimestre</th>
                      <th className="px-2 py-1 font-semibold text-right">Lluvia</th>
                      <th className="px-2 py-1 font-semibold text-right">Caudal firme</th>
                      <th className="px-2 py-1 font-semibold text-right">Egreso</th>
                      <th className="px-2 py-1 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.trimestres.map(t => (
                      <tr key={t.nombre} className="border-t border-bone-200">
                        <td className="px-2 py-1">
                          <span className="font-semibold text-ink-700">{t.nombre}</span>
                          <span className="text-ink-700/45"> {t.meses_label}</span>
                        </td>
                        <td className="px-2 py-1 text-right font-mono text-ink-700/70">{n1(t.captado_m3)}</td>
                        <td className="px-2 py-1 text-right font-mono text-ink-700/70">{n1(t.caudales_firmes_m3)}</td>
                        <td className="px-2 py-1 text-right font-mono text-ink-700/70">{n1(t.egreso_m3)}</td>
                        <td className={`px-2 py-1 text-right font-mono font-bold ${t.balance_m3 < 0 ? 'text-clay-800' : 'text-moss-800'}`}>
                          {t.balance_m3 > 0 ? '+' : ''}{n1(t.balance_m3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] text-ink-700/50 mt-1 leading-snug">
                Todo en m³. Un trimestre negativo no es un problema por sí mismo: es lo que la reserva
                tiene que cubrir, y es exactamente para eso que existe. El problema aparece cuando la
                suma del año no cierra, o cuando el déficit de un trimestre supera lo guardado.
              </p>
              {/* Un saldo positivo grande es casi siempre un caudal, y un caudal
                  que pasa no es agua guardada: lo que no entra en la reserva se
                  va igual. Sin esta línea, una naciente de 4 L/min pintaba los
                  cuatro trimestres en verde con +500 m³ sobre un predio que
                  guarda 570 en total, y el verde se lee como «alcanza». */}
              {r.trimestres.some(t => t.balance_m3 > r.util_m3 && r.util_m3 > 0) && (
                <p className="text-[9px] text-ink-700/55 mt-1 leading-snug">
                  Hay trimestres cuyo saldo positivo supera todo lo que el predio puede guardar
                  ({n1(r.util_m3)} m³). Un caudal que pasa no es agua almacenada: lo que no
                  entra en la reserva sigue de largo, así que ese sobrante no se acumula para el
                  trimestre siguiente. Para aprovecharlo hay que agrandar el almacenaje o usarlo
                  cuando pasa.
                </p>
              )}
              {r.caudal_declarado_m3_dia > r.caudal_firme_m3_dia && (
                <p className="text-[9px] text-clay-800 mt-1 leading-snug">
                  La columna de caudal cuenta sólo lo medido en la seca. Declarado hay{' '}
                  {n1(r.caudal_declarado_m3_dia)} m³/día y firme {n1(r.caudal_firme_m3_dia)}.
                </p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-ink-700/65 leading-snug">
              Los trimestres salen de las superficies y los consumos de{' '}
              {onIrACaptacion
                ? <button onClick={onIrACaptacion} className="text-water-600 hover:underline font-semibold">Captación</button>
                : <b>Captación</b>}
              , que es la pestaña que los tiene. Sin eso acá sólo está la reserva, y falta la mitad de
              la pregunta.
            </p>
          )}
        </div>
      </div>

      {/* ── Lo que hay que saber ── */}
      {r.advertencias.length > 0 && (
        <div className="bg-clay-500/5 rounded-xl border border-clay-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TriangleAlert className="w-3.5 h-3.5 text-clay-700" />
            <p className="text-[11px] font-semibold text-ink-700">Lo que hay que saber antes de creerle</p>
          </div>
          <ul className="space-y-1">
            {r.advertencias.map((a, i) => (
              <li key={i} className="text-[10px] text-ink-700/75 leading-snug">· {a}</li>
            ))}
          </ul>
          {!clima && onIrAClima && (
            <button onClick={onIrAClima} className="text-[10px] text-water-600 hover:underline font-semibold mt-1.5">
              Traer el clima
            </button>
          )}
        </div>
      )}

      {/* ── Por qué ── */}
      <button
        onClick={() => setPorQue(v2 => !v2)}
        className="w-full flex items-center justify-center gap-1 pt-1 text-[10px] text-ink-700/60 hover:text-ink-700"
      >
        <Info className="w-3 h-3" />
        Por qué estos números
        <ChevronDown className={`w-3 h-3 transition-transform ${porQue ? 'rotate-180' : ''}`} />
      </button>

      {porQue && (
        <div className="space-y-2 text-[9px] text-ink-700/70 leading-relaxed border-t border-bone-200 pt-2">
          <p>
            <b>Este panel no calcula nada nuevo.</b> La captación y el consumo salen de la pestaña
            Captación con sus fuentes publicadas; la racha seca, de la serie diaria del predio; la ETP,
            del clima; y la evaporación del espejo, del coeficiente de FAO-56 que la pestaña Represas ya
            usaba. Lo único que estaba faltando era sumarlos.
          </p>
          <p>
            <b>La autonomía no es volumen sobre consumo.</b> La evaporación y la infiltración son
            superficie por lámina: no les importa cuánta agua haya abajo. En una represa somera de verano
            pueden superar la demanda de todo el predio, y una cuenta que las ignora da un número grande
            y equivocado del lado peligroso.
          </p>
          <p>
            <b>El volumen útil no es el volumen.</b> {FUENTE_AH590_RESERVA} Esa lámina permanente no es
            reserva: es lo que tiene que seguir habiendo para que la represa no se arruine. La pestaña
            Represas calcula cuánta pide este clima.
          </p>
          <p>
            <b>Una naciente no es firme hasta que se mide en la seca.</b> Es la fuente que más se
            sobreestima, y el error va del lado caro: se dimensiona la reserva contando con un caudal que
            en febrero no está. Medirla es barato —un balde de volumen conocido y un reloj— y hay que
            hacerlo dos veces en la parte seca del año.
          </p>
          <p>
            <b>El período de diseño sale del dato.</b> {FUENTE_RACHA}
          </p>
          {etp && <p><b>La ETP que se usa.</b> {etp.lectura}</p>}
          <p>
            <b>Lo que este panel no sabe.</b> No modela la napa que puede alimentar un vaso ni la que
            puede vaciarlo, no sabe la calidad del agua —dos represas con el mismo volumen pueden no
            servir para lo mismo—, no considera la pérdida en la conducción entre la fuente y el punto de
            uso, y toma el espejo proporcional al llenado, que es la misma aproximación de la simulación
            anual de la represa.
          </p>
          <div className="pt-1 border-t border-bone-200 space-y-0.5">
            <p className="font-semibold text-ink-700/80">Fuentes</p>
            <p className="text-ink-700/55">· {FUENTE_AH590_RESERVA}</p>
            <p className="text-ink-700/55">· {FUENTE_FAO56_ESPEJO}</p>
            <p className="text-ink-700/55">
              · Los consumos por categoría y la captación por superficie se delegan a{' '}
              <span className="font-mono">captacion.ts</span>, con sus propias fuentes publicadas.
            </p>
          </div>
        </div>
      )}

      <p className="text-[9px] text-ink-700/40 leading-snug flex items-start gap-1">
        <Waves className="w-3 h-3 shrink-0 mt-px" />
        <span>
          Las fuentes cargadas acá se guardan con el proyecto. La autonomía se recalcula al abrirlo,
          porque depende del clima y de la captación: guardar el número sería guardar una conclusión
          vieja.
        </span>
      </p>
    </div>
  );
}
