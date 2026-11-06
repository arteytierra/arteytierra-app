/**
 * El corte de pasto del predio, que es de dónde sale el forraje medido.
 *
 * El campo «Forraje (kg MS/ha·año)» del panel arranca con una **escalera de
 * cinco escalones por lluvia anual que no tiene ninguna fuente**, y ese número
 * multiplica todo lo que viene después: la oferta de pasto, la carga animal, el
 * tamaño del rodeo y el agua que hay que almacenar. Este bloque es la vía para
 * reemplazarlo por una medición del propio campo.
 *
 * Pide un corte y hace tres cosas con él:
 *
 * 1. **Lo revisa.** Lo que el modelo necesita es una magnitud estrecha —materia
 *    en pie herbácea, a nivel del suelo, una sola vez, al llegar las gramíneas a
 *    madurez, seca en estufa— y cualquier otra cosecha devuelve un número
 *    equivocado por un factor. Las reglas y los rechazos están en
 *    `lib/forrajeCorte.ts`, con la magnitud medida de cada error.
 * 2. **Calcula cuánta sed tuvo esa temporada**, con el balance hídrico diario de
 *    Wight y Hanks sobre la serie del punto y el agua útil del perfil de suelo.
 * 3. **Despeja el potencial del sitio**, `Yp = Y·Tp/T`, que es el techo: lo que
 *    ese campo daría en un año en que el agua no limite.
 *
 * Lo que el bloque **no** hace es escribir el potencial en el campo de forraje.
 * El `Yp` es el techo y no el pasto de un año; lo que se ofrece para el campo es
 * el corte, que es el forraje medido de esa temporada.
 */
'use client';

import { useMemo, useState } from 'react';
import { Scissors, TriangleAlert, Loader2, ArrowDownToLine } from 'lucide-react';
import {
  evaluarCorte, aguaUtilEnTresCapas, ventanaDeBalance, ypDelCorte, kgHaDeAro,
  EL_PICO_NO_ES_LA_PRODUCCION_ANUAL,
  type CorteDeclarado, type CuandoSeCorto, type QueSeCorto, type BaseDePeso,
  type QueHabia, type DiaDeSerie, type YpDelCorte,
} from '@/lib/forrajeCorte';
import type { Insumos } from '@/lib/forrajeMedido';
import type { DatosSuelo } from '@/lib/suelos';

/**
 * Cuántos días antes del rebrote se trae la serie para calentar el perfil.
 *
 * Son 180 porque es donde está medido que la banda del `Yp` se cierra del todo
 * en una temporada húmeda (1,00×). En una temporada seca no se cierra con
 * ningún plazo —a 270 días sigue en 2,82×— así que pedir más días no compra
 * nada y sí cuesta serie. Ver `EL_AGUA_INICIAL_NO_SE_OLVIDA`.
 */
const DIAS_CALENTAMIENTO = 180;

const CUANDO: Array<{ v: CuandoSeCorto; t: string }> = [
  { v: 'madurez_de_las_gramineas', t: 'En madurez de las gramíneas' },
  { v: 'antes_del_pico', t: 'Antes, todavía crecía' },
  { v: 'despues_de_la_senescencia', t: 'Después, ya estaba seco' },
  { v: 'no_se', t: 'No sé' },
];

const QUE_SE_CORTO: Array<{ v: QueSeCorto; t: string }> = [
  { v: 'todo_lo_herbaceo', t: 'Todo lo herbáceo' },
  { v: 'solo_las_forrajeras', t: 'Sólo las forrajeras' },
  { v: 'incluye_lenosas', t: 'Incluye ramas de arbustos' },
];

const PESO: Array<{ v: BaseDePeso; t: string }> = [
  { v: 'estufa', t: 'Seco en estufa' },
  { v: 'aire_seco', t: 'Seco al aire' },
  { v: 'verde', t: 'Verde, recién cortado' },
];

const QUE_HABIA: Array<{ v: QueHabia; t: string }> = [
  { v: 'pastizal_natural', t: 'Pastizal natural' },
  { v: 'pastura_sembrada', t: 'Pastura sembrada' },
  { v: 'verdeo_anual', t: 'Verdeo anual' },
];

const INSUMOS: Array<{ v: Insumos; t: string }> = [
  { v: 'secano', t: 'Nada: secano' },
  { v: 'fertilizado', t: 'Fertilizado' },
  { v: 'riego', t: 'Riego' },
  { v: 'riego_y_fertilizado', t: 'Riego y fertilizante' },
  { v: 'desconocido', t: 'No sé' },
];

function sumarDias(iso: string, dias: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return iso;
  return new Date(t + dias * 86_400_000).toISOString().slice(0, 10);
}

interface Props {
  datosSuelo: DatosSuelo | null;
  /** Lo que hoy dice el campo de forraje, para poder contrastar. */
  forrajeActual: number;
  /** Escribe el corte medido en el campo de forraje del panel. */
  onForraje: (kg_ha: number) => void;
  onIrASuelo: () => void;
}

export function CorteDeForrajeBloque({ datosSuelo, forrajeActual, onForraje, onIrASuelo }: Props) {
  const [modo, setModo] = useState<'kg_ha' | 'aro'>('aro');
  const [kgHa, setKgHa] = useState(2000);
  const [gramos, setGramos] = useState(60);
  const [areaAro, setAreaAro] = useState(0.25);

  const [cuando, setCuando] = useState<CuandoSeCorto>('madurez_de_las_gramineas');
  const [cortes, setCortes] = useState(1);
  const [esSuma, setEsSuma] = useState(false);
  const [orden, setOrden] = useState(1);
  const [queSeCorto, setQueSeCorto] = useState<QueSeCorto>('todo_lo_herbaceo');
  const [peso, setPeso] = useState<BaseDePeso>('estufa');
  const [remanente, setRemanente] = useState(0);
  const [queHabia, setQueHabia] = useState<QueHabia>('pastizal_natural');
  const [insumos, setInsumos] = useState<Insumos>('secano');

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [cargando, setCargando] = useState(false);
  const [errorSerie, setErrorSerie] = useState<string | null>(null);
  const [res, setRes] = useState<(YpDelCorte & { lluvia_mm: number; dias: number }) | null>(null);

  const rendimiento = modo === 'aro' ? (kgHaDeAro(gramos, areaAro) ?? 0) : kgHa;

  const corte: CorteDeclarado = useMemo(() => ({
    rendimiento_kg_ha: rendimiento,
    cuando,
    cortes_en_la_temporada: Math.max(1, Math.round(cortes)),
    informa: esSuma
      ? { es: 'la_suma_de_la_temporada' }
      : { es: 'un_corte', orden: Math.max(1, Math.round(orden)) },
    que_se_corto: queSeCorto,
    peso,
    remanente_cm: Math.max(0, remanente),
    que_habia: queHabia,
    insumos,
  }), [rendimiento, cuando, cortes, esSuma, orden, queSeCorto, peso, remanente, queHabia, insumos]);

  // La compuerta corre sola, sin pedir la serie: si el corte no es la magnitud
  // del modelo no tiene sentido gastar un pedido a la API para enterarse.
  const compuerta = useMemo(() => evaluarCorte(corte), [corte]);

  const agua = useMemo(
    () => (datosSuelo ? aguaUtilEnTresCapas(datosSuelo.perfil) : null),
    [datosSuelo],
  );

  const fechasListas = desde !== '' && hasta !== '' && desde < hasta;

  async function calcular() {
    if (!datosSuelo || agua === null || !fechasListas) return;
    setCargando(true);
    setErrorSerie(null);
    setRes(null);
    try {
      const arranque = sumarDias(desde, -DIAS_CALENTAMIENTO);
      const url = `/api/clima-diario/ventana?lat=${datosSuelo.lat}&lng=${datosSuelo.lng}`
        + `&desde=${arranque}&hasta=${hasta}`;
      const r = await fetch(url);
      const j = await r.json() as { dias?: DiaDeSerie[]; error?: string; nulos?: number };
      if (!r.ok || !j.dias) {
        setErrorSerie(j.error ?? 'No se pudo traer la serie diaria de este punto.');
        return;
      }
      if ((j.nulos ?? 0) > 0) {
        setErrorSerie(
          `La serie tiene ${j.nulos} días incompletos en esa ventana. El reanálisis llega con unos `
          + 'días de atraso, así que si el corte es muy reciente hay que esperar; '
          + 'rellenar esos días con cero convertiría un hueco en una seca.',
        );
        return;
      }

      const temporada = ventanaDeBalance(j.dias, desde, hasta);
      const previos = ventanaDeBalance(j.dias, arranque, sumarDias(desde, -1));
      if (temporada === null) {
        setErrorSerie('La serie no cubre completa la temporada que declaraste.');
        return;
      }

      const salida = ypDelCorte({
        corte,
        dias: temporada.dias,
        aw_por_capa_mm: agua,
        ...(previos !== null ? { dias_previos: previos.dias } : {}),
        avisos_previos: temporada.avisos,
      });
      setRes({
        ...salida,
        lluvia_mm: temporada.dias.reduce((s, d) => s + d.pptn_mm, 0),
        dias: temporada.dias.length,
      });
    } catch {
      setErrorSerie('Falló el pedido de la serie diaria. Reintentá en unos segundos.');
    } finally {
      setCargando(false);
    }
  }

  const banda = res?.banda_kg_ha ?? null;
  const anchoBanda = banda && banda.perfil_lleno > 0 ? banda.perfil_seco / banda.perfil_lleno : null;

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <summary className="px-3 py-2 text-[11px] font-medium text-ink-700 cursor-pointer select-none flex items-center gap-1.5 hover:bg-bone-50">
        <Scissors className="w-3 h-3 text-moss-700" />
        ¿Cortaste pasto en el predio? El forraje puede salir de ahí
      </summary>

      <div className="px-3 pb-3 space-y-3">
        <p className="text-[10px] text-ink-700/60 leading-relaxed">
          Los {forrajeActual.toLocaleString('es-AR')} kg MS/ha·año de arriba salen de una escalera
          por lluvia anual <b>sin fuente</b>, y ese número multiplica la carga, el rodeo y el agua.
          Un corte de pasto de este campo lo reemplaza por una medición, y además deja despejar el
          techo del sitio con el balance hídrico diario de Wight y Hanks.
        </p>

        {!datosSuelo && (
          <p className="text-[10px] text-ink-700/55 flex gap-1.5">
            <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-sun-500" />
            Hace falta el <button onClick={onIrASuelo} className="underline text-moss-700">suelo</button>:
            el balance necesita el agua útil del perfil, capa por capa.
          </p>
        )}
        {datosSuelo && agua === null && (
          <p className="text-[10px] text-clay-700 flex gap-1.5">
            <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
            El perfil de este punto no llega a los 90 cm que el modelo reparte en tres capas, o
            alguna capa quedó sin agua útil. No se puede correr el balance acá.
          </p>
        )}

        {/* ── Cuánto ── */}
        <div className="space-y-2">
          <div className="flex gap-1">
            {([['aro', 'Pesé aros'], ['kg_ha', 'Tengo kg/ha']] as const).map(([v, t]) => (
              <button key={v} onClick={() => setModo(v)}
                className={`flex-1 text-[10px] rounded-lg border px-2 py-1 ${
                  modo === v ? 'bg-moss-50 border-moss-200 text-moss-700' : 'bg-bone-50 border-bone-200 text-ink-700/60'
                }`}>{t}</button>
            ))}
          </div>
          {modo === 'aro' ? (
            <div className="grid grid-cols-2 gap-2">
              <Campo label="Materia seca del aro (g)">
                <Num v={gramos} set={setGramos} step={5} />
              </Campo>
              <Campo label="Superficie del aro (m²)">
                <Num v={areaAro} set={setAreaAro} step={0.05} />
              </Campo>
            </div>
          ) : (
            <Campo label="Materia seca cosechada (kg/ha)">
              <Num v={kgHa} set={setKgHa} step={100} />
            </Campo>
          )}
          {modo === 'aro' && (
            <p className="text-[9px] text-ink-700/50">
              Son {rendimiento.toLocaleString('es-AR', { maximumFractionDigits: 0 })} kg MS/ha. Un
              aro solo no alcanza: cortá varios y promedialos antes de cargar el número.
            </p>
          )}
        </div>

        {/* ── Qué corte fue ── */}
        <div className="grid grid-cols-2 gap-2">
          <Campo label="¿Cuándo se cortó?">
            <Sel v={cuando} set={setCuando} ops={CUANDO} />
          </Campo>
          <Campo label="Cortes del paño en la temporada">
            <Num v={cortes} set={n => { setCortes(n); if (n <= 1) { setEsSuma(false); setOrden(1); } }} step={1} />
          </Campo>
          {cortes > 1 && (
            <>
              <Campo label="El número de arriba es…">
                <select value={esSuma ? 'suma' : 'uno'} onChange={e => setEsSuma(e.target.value === 'suma')}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
                  <option value="uno">Un corte solo</option>
                  <option value="suma">La suma de la temporada</option>
                </select>
              </Campo>
              {!esSuma && (
                <Campo label="¿Qué corte de la temporada?">
                  <Num v={orden} set={setOrden} step={1} />
                </Campo>
              )}
            </>
          )}
          <Campo label="¿Qué se levantó?">
            <Sel v={queSeCorto} set={setQueSeCorto} ops={QUE_SE_CORTO} />
          </Campo>
          <Campo label="¿Cómo se pesó?">
            <Sel v={peso} set={setPeso} ops={PESO} />
          </Campo>
          <Campo label="Remanente en pie (cm)">
            <Num v={remanente} set={setRemanente} step={1} />
          </Campo>
          <Campo label="¿Qué había en el paño?">
            <Sel v={queHabia} set={setQueHabia} ops={QUE_HABIA} />
          </Campo>
          <Campo label="¿Recibió algo?">
            <Sel v={insumos} set={setInsumos} ops={INSUMOS} />
          </Campo>
        </div>

        {/* ── Las dos fechas ── */}
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Arrancó a crecer">
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
          <Campo label="Día del corte">
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
        </div>
        <p className="text-[9px] text-ink-700/50 leading-relaxed">
          Esas dos fechas son la temporada que el balance va a correr día por día. Además se traen
          los {DIAS_CALENTAMIENTO} días anteriores para arrancar el perfil con la lluvia real que
          hubo, en vez de suponer cuánta agua tenía.
        </p>

        {/* ── Lo que la compuerta ya puede decir sin la serie ── */}
        {!compuerta.sirve && (
          <div className="rounded-lg border border-clay-200 bg-clay-100/40 p-2.5 space-y-2">
            <p className="text-[10px] font-medium text-clay-700 flex items-center gap-1">
              <TriangleAlert className="w-3 h-3" />
              Ese corte no es la magnitud que el modelo necesita
            </p>
            {compuerta.rechazos.map(r => (
              <div key={r.motivo} className="space-y-0.5">
                <p className="text-[9px] text-clay-700 leading-relaxed">{r.por_que}</p>
                <p className="text-[9px] text-ink-700/70 leading-relaxed">
                  <b>Qué medir:</b> {r.que_medir}
                </p>
              </div>
            ))}
          </div>
        )}

        <button onClick={calcular}
          disabled={cargando || !compuerta.sirve || !datosSuelo || agua === null || !fechasListas}
          className="w-full text-xs rounded-lg bg-moss-700 text-bone-50 px-3 py-2 disabled:opacity-40 flex items-center justify-center gap-1.5">
          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
          {cargando ? 'Corriendo el balance día por día…' : 'Correr el balance de esa temporada'}
        </button>

        {errorSerie && (
          <p className="text-[10px] text-clay-700 leading-relaxed flex gap-1.5">
            <TriangleAlert className="w-3.5 h-3.5 shrink-0" />{errorSerie}
          </p>
        )}

        {/* ── El resultado ── */}
        {res && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Dato label="El corte medido"
                valor={`${Math.round(rendimiento).toLocaleString('es-AR')} kg/ha`}
                sub={`${res.dias} días, ${Math.round(res.lluvia_mm)} mm de lluvia`} />
              <Dato label="Sed de la temporada" valor={res.indice !== null ? res.indice.toFixed(2) : '—'}
                sub="T/Tp: 1,00 es agua sin limitar" />
            </div>

            {banda && (
              <div className="rounded-lg border border-bone-200 bg-bone-50 p-2.5 space-y-1">
                <p className="text-[10px] text-ink-700/60">El techo del sitio (Yp), según el agua que tuviera el perfil</p>
                <p className="font-mono text-sm text-ink-900">
                  {Math.round(banda.perfil_lleno).toLocaleString('es-AR')} a{' '}
                  {Math.round(banda.perfil_seco).toLocaleString('es-AR')} kg MS/ha
                </p>
                <p className="text-[9px] text-ink-700/60 leading-relaxed">
                  La punta baja es la conservadora.
                  {anchoBanda !== null && anchoBanda > 1.3 && (
                    <>
                      {' '}La banda salió <b>{anchoBanda.toFixed(1)} veces ancha</b> porque la
                      temporada fue seca: ahí el perfil no se recarga y recuerda con qué empezó, así
                      que ningún mes extra de historia la cierra. Lo que la cierra es medir el agua
                      del suelo cuando arranca el rebrote.
                    </>
                  )}
                </p>
              </div>
            )}

            <button onClick={() => onForraje(Math.round(rendimiento))}
              className="w-full text-[11px] rounded-lg border border-moss-200 bg-moss-50 text-moss-700 px-3 py-1.5 flex items-center justify-center gap-1.5">
              <ArrowDownToLine className="w-3 h-3" />
              Usar los {Math.round(rendimiento).toLocaleString('es-AR')} kg/ha del corte arriba
            </button>
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              Se ofrece el corte y no el techo: el Yp es lo que el campo daría con el agua sin
              limitar, y cargarlo como forraje del año dimensionaría el rodeo para un año que puede
              no llegar. Y un corte es una temporada: con la de otro año el número cambia.
            </p>
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              <b>El campo dice «por año» y esto es materia en pie</b>, que no es lo mismo: un pico
              de materia en pie es el{' '}
              {Math.round(EL_PICO_NO_ES_LA_PRODUCCION_ANUAL.fraccion.minima * 100)} a{' '}
              {Math.round(EL_PICO_NO_ES_LA_PRODUCCION_ANUAL.fraccion.maxima * 100)} % de lo que el
              pastizal produjo en la temporada, porque el resto murió o se cayó antes del corte.
              <b> Igual no hay que multiplicarlo</b>: el uso admisible que viene después está
              calibrado contra ensayos definidos por el forraje que dejan en pie, y corregir hacia
              arriba sumaría a la carga el pasto que se descompuso antes de que llegara el animal.
            </p>

            {res.avisos.length > 0 && (
              <div className="space-y-1">
                {res.avisos.map((a, i) => (
                  <p key={i} className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
                    <span className="shrink-0">·</span>
                    <span>{a.aviso}</span>
                  </p>
                ))}
              </div>
            )}

            {res.advertencias.length > 0 && (
              <details className="text-[9px]">
                <summary className="text-ink-700/55 cursor-pointer select-none">
                  Los {res.advertencias.length} supuestos que el balance no pudo traer
                </summary>
                <div className="pt-1 space-y-1">
                  {res.advertencias.map((a, i) => (
                    <p key={i} className="text-ink-700/60 leading-relaxed flex gap-1">
                      <span className="shrink-0">·</span><span>{a}</span>
                    </p>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </details>
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

function Sel<T extends string>({ v, set, ops }: {
  v: T; set: (x: T) => void; ops: Array<{ v: T; t: string }>;
}) {
  return (
    <select value={v} onChange={e => set(e.target.value as T)}
      className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
      {ops.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
    </select>
  );
}

function Dato({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="rounded-xl border border-bone-200 bg-white p-2.5">
      <p className="text-[10px] text-ink-700/60 mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold text-ink-900 leading-tight">{valor}</p>
      <p className="text-[9px] text-ink-700/55 mt-0.5">{sub}</p>
    </div>
  );
}
