'use client';

/**
 * Las tres entregas de papel del informe: la planilla, la lista de materiales y
 * el plan por etapas.
 *
 * No son anexos y por eso no van al final con letra: son **lo que el productor
 * se lleva**. El informe explica el predio; estas tres hojas son con las que se
 * trabaja. La planilla va al lado del plano y se llena con un nivel, la lista se
 * lleva a la ferretería con el estado de cada renglón marcado a lápiz, y el plan
 * por etapas es la respuesta a la pregunta del lunes.
 *
 * Están pensadas para imprimirse: nada se despliega, todo se ve, y los cuadros
 * tienen líneas porque se escribe encima. El informe se baja en PDF y se lleva
 * al campo, y una tabla que hay que desplegar en el papel es una tabla que no
 * existe.
 *
 * La cuenta de cada una vive en `lib/planilla.ts`, `lib/materiales.ts` y
 * `lib/etapas.ts`, cada una con sus fuentes en el encabezado.
 */
import { ClipboardList, PackageCheck, CalendarRange, AlertTriangle } from 'lucide-react';

import { planillaDeCierre, type Planilla } from '../lib/planilla';
import { PlanillaBloque } from './PlanillaBloque';
import {
  armarLista, separacionDePostes, BASE_TEXTO, ESTADO_TEXTO, ESTADO_QUE_SIGNIFICA,
  type ListaDeMateriales, type EspecieCierre, type TipoDeCierre,
} from '../lib/materiales';
import {
  ordenarEtapas, obrasDelProyecto, CLASE_TEXTO, FACTOR_PERMANENCIA,
  type PlanPorEtapas, type QueHayEnElProyecto,
} from '../lib/etapas';
import { balanceCiclico, MESES_CORTOS } from '../lib/balanceHidrico';
import type { DatosTopografia } from '../lib/topografia';
import type { DatosClima } from '../lib/clima';
import type { DatosSuelo } from '../lib/suelos';
import type { MetricasPoligono } from '../lib/geometria';
import type { RedAguaResumen } from '../lib/hidraulica';
import type { Mojon } from '../lib/types';

/**
 * El cierre que el informe supone cuando nadie eligió uno.
 *
 * Púa para bovinos sin varillas es el caso más común y el que la tabla de la
 * especificación cubre primero. **Es un supuesto y va impreso**, porque cambia
 * la cantidad de postes casi al doble: un cierre de caprinos pide un 75 % más y
 * un eléctrico liso cuatro veces menos.
 */
const CIERRE_SUPUESTO: { especie: EspecieCierre; tipo: TipoDeCierre } = { especie: 'bovino', tipo: 'pua' };

/**
 * Cuántas estaciones se imprimen.
 *
 * `armarPlanilla` devuelve todas, que es lo correcto: un poste cada 6,10 m en un
 * perímetro de dos kilómetros son más de trescientas. Pero una planilla de
 * treinta páginas no se lleva a un alambrado, así que el informe imprime un
 * tramo y dice cuántas quedan. Replantear por tramos es lo que se hace igual: se
 * repone el mojón de referencia y se sigue.
 */
const MAX_RENGLONES = 150;

const fmt = (n: number, d = 0) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

function Encabezado({ numero, titulo, icono }: { numero: string; titulo: string; icono: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-bone-200 pb-2">
      <span className="text-xs font-bold text-moss-700 bg-moss-100 rounded px-1.5 py-0.5">{numero}</span>
      <h2 className="font-semibold text-base text-ink-950 uppercase tracking-wide flex items-center gap-1.5">
        <span className="text-moss-700">{icono}</span>{titulo}
      </h2>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-clay-800 bg-clay-500/5 border border-clay-500/20 rounded-lg px-2.5 py-2 leading-relaxed flex gap-1.5">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

// ─── 1 · La planilla de replanteo ─────────────────────────────────────────────

export function PlanillaDeReplanteo({
  mojones, topo, numero = 'P',
}: { mojones: readonly Mojon[]; topo?: DatosTopografia | null; numero?: string }) {
  if (mojones.length < 3) return null;

  const sep = separacionDePostes(CIERRE_SUPUESTO.especie, CIERRE_SUPUESTO.tipo);
  if (!sep) return null;

  // Las cotas de cada mojón las trae la topografía, en el mismo orden.
  const conCota = mojones.map((m, i) => ({
    lat: m.lat, lng: m.lng,
    cota_m: topo?.puntos?.[i]?.elevation ?? null,
  }));

  const planilla: Planilla | null = planillaDeCierre({
    mojones: conCota,
    separacionPostes_m: sep.maximo_m,
    ...(topo?.fuenteRelieve != null ? { fuenteRelieve: topo.fuenteRelieve } : {}),
    ...(topo?.pendiente_pct != null ? { pendienteTerreno_pct: topo.pendiente_pct } : {}),
  });
  if (!planilla) return null;

  const p = planilla.precision;

  return (
    <section className="space-y-3 page-break-before">
      <Encabezado numero={numero} titulo="Planilla de replanteo" icono={<ClipboardList className="w-4 h-4" />} />

      <p className="text-xs text-ink-700 leading-relaxed">
        Esta hoja va al lado del plano, no dentro del informe. Replantear es el acto de pasar el plano
        al suelo: lo que la planilla hace es decir dónde va cada estaca, qué mojón de referencia la
        gobierna y cuánto hay que subir o bajar desde ese mojón. El replanteo que trae el informe es el
        del <strong>cierre perimetral</strong>, que es el único que se puede armar con los mojones del
        predio y además es el primero que se hace en el campo. Los del muro de la represa, de cada swale
        y de la directriz keyline salen de las pestañas que tienen esa geometría, con la misma tabla.
      </p>

      {/* El mismo renderizador que usan los paneles: una planilla se lee igual
          siempre, así que la tabla, el orden de las columnas y el lugar de las
          dos celdas vacías son parte del contrato y no del estilo. Ver
          `PlanillaBloque`. */}
      <PlanillaBloque planilla={planilla} max={MAX_RENGLONES} descargable={false}>
        <div className="bg-bone-50 border border-bone-200 rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-ink-700/50 font-semibold">Lo que se asumió</p>
          <ul className="text-[11px] text-ink-800 space-y-1 leading-relaxed">
            <li>
              <strong>Cierre de púa para bovinos sin varillas</strong>, que da postes cada{' '}
              {fmt(sep.maximo_m, 2)} m. Es un supuesto: {sep.porque} Un cierre de caprinos o uno
              eléctrico cambian la cantidad de postes y por lo tanto las progresivas de esta planilla.
            </li>
            <li>
              Las estacas van cada <strong>{fmt(planilla.intervalo_m, 2)} m</strong> y los mojones de
              referencia cada <strong>150 m o menos</strong>: los dos son máximos publicados.
            </li>
            <li>
              Relieve: <strong>{p.disponible_m != null ? `± ${fmt(p.disponible_m, 2)} m punto a punto` : 'sin exactitud publicada'}</strong>.
            </li>
          </ul>
        </div>
      </PlanillaBloque>

      {planilla.renglones.length > MAX_RENGLONES && (
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          Un cierre de {fmt(planilla.largo_m)} m lleva {planilla.renglones.length} estaciones, que son más
          páginas de las que se llevan a un alambrado. El informe imprime las primeras {MAX_RENGLONES} y el
          resto se replantea por tramos, reponiendo el mojón de referencia: la planilla de un tramo se lee
          igual que la del primero.
        </p>
      )}
    </section>
  );
}

// ─── 2 · La lista de materiales ───────────────────────────────────────────────

export function ListaDeMaterialesSeccion({
  metricas, mojones, red, capacidadRepresa_m3, numero = 'M',
}: {
  metricas?: MetricasPoligono | null;
  mojones:   readonly Mojon[];
  red?:      RedAguaResumen | null;
  capacidadRepresa_m3?: number | null;
  numero?:   string;
}) {
  const lista: ListaDeMateriales = armarLista({
    metricas: metricas ?? null,
    mojones: mojones.length,
    cierre: metricas ? CIERRE_SUPUESTO : null,
    red: red ?? null,
    capacidadRepresa_m3: capacidadRepresa_m3 ?? null,
  });
  if (lista.renglones.length === 0) return null;

  return (
    <section className="space-y-3 page-break-before">
      <Encabezado numero={numero} titulo="Lista de materiales" icono={<PackageCheck className="w-4 h-4" />} />

      <p className="text-xs text-ink-700 leading-relaxed">
        No es el presupuesto. El presupuesto pone precios; esto pone <strong>cantidad, dónde se mide esa
        cantidad y qué calidad tiene que cumplir el material</strong>, que son las tres cosas con las
        que se compra. Un renglón que dice «cañería 480 m» es una longitud; lo que lo vuelve una lista
        de materiales es la clase de presión que ese caño tiene que aguantar.
      </p>

      <div className="flex flex-wrap gap-2 text-[10px]">
        {(['necesario', 'repuesto', 'pedido'] as const).map(e => (
          <span key={e} className="border border-bone-200 rounded px-1.5 py-0.5 bg-bone-50">
            <strong>{ESTADO_TEXTO[e]}</strong> · {ESTADO_QUE_SIGNIFICA[e]}
          </span>
        ))}
      </div>

      {lista.porRubro.map(g => (
        <div key={g.rubro}>
          <p className="text-[10px] uppercase tracking-wide text-moss-700 font-semibold mb-1">{g.rubro}</p>
          <div className="space-y-1.5">
            {g.renglones.map(r => (
              <div key={r.id} className="border border-bone-200 rounded-lg p-2 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold text-ink-950">{r.concepto}</p>
                  <p className="text-[11px] font-mono font-semibold text-ink-950 shrink-0">
                    {r.cantidad > 0 ? `${fmt(r.cantidad)} ${r.unidad}` : `— ${r.unidad}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-ink-700/70">
                  <span>Se mide: <strong>{BASE_TEXTO[r.base]}</strong></span>
                  {r.margen && <span>Margen: <strong>× {fmt(r.margen.factor, 2)}</strong></span>}
                  <span className="flex gap-1 items-center">
                    Estado:
                    {(['necesario', 'repuesto', 'pedido'] as const).map(e => (
                      <span key={e} className={`px-1 rounded border ${r.estado === e ? 'bg-ink-950 text-bone-50 border-ink-950' : 'border-bone-300'}`}>
                        {ESTADO_TEXTO[e]}
                      </span>
                    ))}
                  </span>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">De dónde sale: {r.deDonde}</p>
                {r.calidad
                  ? <p className="text-[10px] text-ink-800 leading-relaxed bg-moss-50 border border-moss-200 rounded px-1.5 py-1">
                      <strong>Calidad requerida:</strong> {r.calidad}
                    </p>
                  : <p className="text-[10px] text-clay-800 leading-relaxed">
                      <strong>Sin calidad declarada.</strong> La norma pide especificar la calidad del
                      material manufacturado; este renglón tiene cantidad y todavía no tiene
                      especificación.
                    </p>}
                {r.advertencia && <p className="text-[10px] text-clay-800 leading-relaxed">{r.advertencia}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {lista.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}

      {/* La verificación publicada */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 font-semibold mb-1">
          Las ocho preguntas con las que se revisa un juego de planos
        </p>
        <p className="text-[11px] text-ink-700 leading-relaxed mb-1.5">
          No son de acequia: son la lista con la que la norma dice que hay que revisar un plano antes de
          entregarlo. Va acá, con los puntos que un programa no puede contestar marcados como lo que son.
        </p>
        <table className="w-full text-[10px] border-collapse">
          <tbody>
            {lista.checklist.map(it => (
              <tr key={it.n} className={it.n % 2 ? 'bg-bone-50' : ''}>
                <td className="px-1.5 py-1 align-top font-mono border-b border-bone-200 w-5">{it.n}</td>
                <td className="px-1.5 py-1 align-top border-b border-bone-200">
                  <p className="text-ink-950">{it.pregunta}</p>
                  <p className="text-ink-700/60 leading-relaxed">{it.comoSeContesta}</p>
                </td>
                <td className="px-1.5 py-1 align-top border-b border-bone-200 w-16 text-right">
                  <span className={`px-1 rounded text-[9px] font-semibold ${
                    it.quien === 'acequia' ? 'bg-moss-100 text-moss-900'
                      : it.quien === 'parcial' ? 'bg-sun-500/20 text-ink-900'
                      : 'bg-clay-700/15 text-clay-800'}`}>
                    {it.quien === 'acequia' ? 'acequia' : it.quien === 'parcial' ? 'a medias' : 'una persona'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-bone-200 pt-2">
        <p className="text-[9px] uppercase tracking-wide text-ink-700/40 font-semibold mb-1">Fuentes</p>
        <ul className="text-[9px] text-ink-700/60 space-y-0.5 leading-relaxed">
          {lista.fuentes.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
    </section>
  );
}

// ─── 3 · El plan por etapas ───────────────────────────────────────────────────

export function PlanDeEtapas({
  clima, suelo, hay, numero = 'E',
}: {
  clima?: DatosClima | null;
  suelo?: DatosSuelo | null;
  hay:    QueHayEnElProyecto;
  numero?: string;
}) {
  const obras = obrasDelProyecto(hay);
  if (obras.length === 0) return null;

  const balance = clima && clima.meses.length === 12
    ? balanceCiclico(
        clima.meses.map(m => m.precip_mm),
        clima.meses.map(m => m.etp_mm),
        suelo?.agua_util?.total_mm_100 ?? 150,
      )
    : null;

  const plan: PlanPorEtapas | null = ordenarEtapas(obras, balance);
  if (!plan) return null;

  return (
    <section className="space-y-3 page-break-before">
      <Encabezado numero={numero} titulo="Master plan por etapas" icono={<CalendarRange className="w-4 h-4" />} />

      <p className="text-xs text-ink-700 leading-relaxed">
        El informe dice <em>dónde</em>. Esto dice <em>cuándo</em>, que es la pregunta del lunes. El orden
        no es una opinión: sale de la escala de permanencia —de lo más permanente a lo más cambiable— y
        de las precedencias que las normas publican, cada una con su fuente. Los meses salen del balance
        de agua del suelo del predio.
      </p>

      {/* La asimetría, que es lo que hay que entender antes de leer el calendario */}
      <div className="border border-sun-500/30 bg-sun-500/10 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wide text-ink-900/60 font-semibold mb-1">
          Los dos modos de equivocarse con el mes no cuestan lo mismo
        </p>
        <p className="text-[11px] text-ink-800 leading-relaxed">
          Si el suelo está <strong>demasiado seco</strong>, la norma dice mojarlo por aspersión: es una
          partida de la lista de materiales y un camión. Si está <strong>demasiado mojado</strong>, la
          norma dice esperar: es un mes perdido, y si el que sigue también está mojado, son dos. Por eso
          el calendario no es una banda de meses buenos con los costados peor: es un conjunto de meses
          bloqueados, que no se discuten, y un resto en el que algunos piden agua.
        </p>
      </div>

      {plan.etapas.map(e => (
        <div key={e.numero} className="border border-bone-200 rounded-xl overflow-hidden">
          <div className="bg-ink-950 text-bone-100 px-2.5 py-1.5 flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold">Etapa {e.numero}</p>
            <p className="text-[10px] text-bone-300">{CLASE_TEXTO[e.clase]}</p>
          </div>
          <div className="p-2.5 space-y-2">
            <ul className="text-[11px] text-ink-900 space-y-1">
              {e.obras.map(o => (
                <li key={o.id} className="flex gap-1.5">
                  <span className="text-[9px] font-mono bg-bone-100 border border-bone-200 rounded px-1 py-0.5 shrink-0 h-fit">
                    {o.permanencia} · {FACTOR_PERMANENCIA[o.permanencia]}
                  </span>
                  <span className="leading-relaxed">{o.nombre}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-ink-700/60 leading-relaxed">{e.porque}</p>

            {/* El calendario */}
            {e.ventana && (
              <div className="space-y-1">
                <div className="flex gap-0.5">
                  {e.ventana.meses.map(m => (
                    <div key={m.mesIndex} className="flex-1 text-center">
                      <div className={`h-4 rounded-sm border ${
                        m.estado === 'bloqueado' ? 'bg-clay-700/40 border-clay-700/50'
                          : m.estado === 'pide_agua' ? 'bg-sun-500/40 border-sun-500/50'
                          : 'bg-moss-500/40 border-moss-500/50'}`} />
                      <p className="text-[8px] text-ink-700/60 mt-0.5">{(MESES_CORTOS[m.mesIndex] ?? '').slice(0, 3)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] text-ink-700/60">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-moss-500/40 border border-moss-500/50 inline-block" /> se puede</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sun-500/40 border border-sun-500/50 inline-block" /> hay que mojar</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-clay-700/40 border border-clay-700/50 inline-block" /> bloqueado: se espera</span>
                </div>
                <p className="text-[10px] text-ink-800 leading-relaxed">{e.ventana.lectura}</p>
              </div>
            )}

            {/* La ventana compuesta, cuando la etapa tiene una obra que no termina con la tierra */}
            {e.compuesta && (
              <div className="bg-bone-50 border border-bone-200 rounded-lg p-2 space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-ink-700/50 font-semibold">
                  En qué meses se puede CERRAR la obra
                </p>
                <p className="text-[10px] text-ink-700 leading-relaxed">
                  {e.conCobertura.join('; ')} no está{e.conCobertura.length > 1 ? 'n' : ''} terminada
                  {e.conCobertura.length > 1 ? 's' : ''} sin su cobertura o su protección, así que hace
                  falta un mes en que se pueda mover la tierra <strong>y</strong> que la cobertura prenda
                  enseguida. No son los mismos meses.
                </p>
                <div className="flex flex-wrap gap-1">
                  {e.compuesta.cierran.length === 0
                    ? <span className="text-[10px] font-semibold text-clay-800">Ninguno</span>
                    : e.compuesta.cierran.map(i => (
                        <span key={i} className="text-[9px] font-mono bg-moss-100 border border-moss-200 rounded px-1 py-0.5">
                          {MESES_CORTOS[i]}
                        </span>
                      ))}
                </div>
                <p className="text-[10px] text-ink-800 leading-relaxed">{e.compuesta.lectura}</p>
              </div>
            )}

            {e.advertencias.map((a, i) => (
              <p key={i} className="text-[10px] text-clay-800 leading-relaxed">{a}</p>
            ))}
          </div>
        </div>
      ))}

      {/* Las precedencias, con su fuente */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 font-semibold mb-1">
          Por qué este orden y no otro
        </p>
        <ul className="text-[10px] text-ink-700 space-y-1 leading-relaxed">
          {[...new Map(plan.precedencias.map(p => [p.porque, p])).values()].map((p, i) => (
            <li key={i}>• {p.porque}</li>
          ))}
        </ul>
      </div>

      {plan.advertencias.map((a, i) => <Aviso key={i}>{a}</Aviso>)}

      <div className="border-t border-bone-200 pt-2">
        <p className="text-[9px] uppercase tracking-wide text-ink-700/40 font-semibold mb-1">Fuentes</p>
        <ul className="text-[9px] text-ink-700/60 space-y-0.5 leading-relaxed">
          {plan.fuentes.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
    </section>
  );
}
