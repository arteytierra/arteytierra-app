'use client';

import { useState, useCallback, useEffect } from 'react';
import { Waypoints, Loader2, MapPin, Info, Grid3x3, TriangleAlert } from 'lucide-react';
import { obtenerGrillaDensa, grillaDesdeShader, type GrillaElevacion } from '@/lib/grillaElevacion';
import { analizarKeyline, generarPatronCultivo, type ResultadoKeyline, type ResultadoPatron } from '@/lib/keyline';
import type { Mojon } from '@/lib/types';
import type { DatosShader } from '@/lib/shaders';
import type { PoligonoCutFill } from './CutFillPanel';
import type { GrupoHidro } from '@/lib/cuenca';
import type { VeredictoPatron } from '@/lib/keylineGeometria';
import { ValidacionPatronBloque } from './ValidacionPatronBloque';

/**
 * Detectar el keypoint descarga relieve y tarda: se guarda el resultado, no
 * sólo los parámetros del patrón. La grilla de elevación no se guarda —pesa
 * demasiado— y se vuelve a pedir si hace falta.
 */
export interface KeylineInputs {
  res:         ResultadoKeyline | null;
  aplicado:    boolean;
  parcelaId:   string;
  espaciado:   number;
  /**
   * @deprecated El suavizado 0–100. Cortaba la esquina en proporción al tramo,
   * así que sobre una directriz simplificada se comía la forma. Lo reemplaza
   * `radio`, que es un radio de giro en metros. Se conserva en el tipo para no
   * romper la lectura de un proyecto viejo.
   */
  suavizado:   number;
  /**
   * Los cuatro campos que entraron el 04/10/2026 con la corrección de la
   * geometría. Son opcionales porque un proyecto guardado antes no los trae, y
   * ahí valen los defaults: la tolerancia sale del espaciado y el radio del
   * ancho del implemento. Lo que NO se supone es el veredicto del patrón
   * guardado —ver `patronAlDia`—.
   */
  tolerancia?: number;
  implemento?: number;
  radio?:      number;
  lado?:       'arriba' | 'abajo' | 'ambos';
  patron:      ResultadoPatron | null;
  patronAplic: boolean;
}

/** Rótulo y color de cada veredicto del patrón. */
const VEREDICTO: Record<VeredictoPatron, { rotulo: string; clase: string }> = {
  keyline:  { rotulo: 'patrón Keyline',   clase: 'bg-moss-100 text-moss-800' },
  contorno: { rotulo: 'sólo en contorno', clase: 'bg-sun-200 text-clay-800' },
  reversa:  { rotulo: 'deriva invertida', clase: 'bg-clay-100 text-clay-800' },
  excede:   { rotulo: 'deriva excedida',  clase: 'bg-clay-100 text-clay-800' },
};

interface Props {
  mojones:      Mojon[];
  datosShader:  DatosShader | null;
  parcelas:     PoligonoCutFill[];
  /**
   * Grupo hidrológico del suelo. Decide el piso de la banda de deriva: en un
   * suelo de infiltración lenta el surco tiene que correr con al menos 0,2 %
   * para no encharcar. El dato ya estaba en la app, en la pestaña de suelo.
   */
  grupoHidro?:  GrupoHidro | null;
  /**
   * Lámina de la tormenta de 10 años y 24 h (mm). Es un límite de efectividad
   * publicado y acequia ya lo calcula en la pestaña de tormenta.
   */
  lluvia10a24h_mm?: number | null;
  onAplicarGuias: (res: ResultadoKeyline) => void;
  /** Salida opcional: colocar también las guías como caminos transitables. */
  onAplicarComoCaminos?: (res: ResultadoKeyline) => void;
  onAplicarPatron: (res: ResultadoPatron) => void;
  inicial?:  KeylineInputs | null;
  onInputs?: (i: KeylineInputs) => void;
}

export function KeylinePanel({ mojones, datosShader, parcelas, grupoHidro = null, lluvia10a24h_mm = null, onAplicarGuias, onAplicarComoCaminos, onAplicarPatron, inicial, onInputs }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [res,      setRes]      = useState<ResultadoKeyline | null>(inicial?.res ?? null);
  const [aplicado, setAplicado] = useState(inicial?.aplicado ?? false);
  const [grilla,   setGrilla]   = useState<GrillaElevacion | null>(null);
  // Patrón de cultivo por parcela
  const [parcelaId,   setParcelaId]   = useState(inicial?.parcelaId ?? '');
  const [espaciado,   setEspaciado]   = useState(inicial?.espaciado ?? 12);
  // El suavizado 0–100 ya no se usa: lo reemplazó el radio de redondeo. El valor
  // guardado se arrastra tal cual para no perderlo si el proyecto se abre con una
  // versión anterior de la app.
  const suavizado = inicial?.suavizado ?? 50;
  const [cargandoPat, setCargandoPat] = useState(false);
  const [errorPat,    setErrorPat]    = useState<string | null>(null);
  const [patron,      setPatron]      = useState<ResultadoPatron | null>(inicial?.patron ?? null);
  const [patronAplic, setPatronAplic] = useState(inicial?.patronAplic ?? false);
  const [tolerancia,  setTolerancia]  = useState<number | null>(inicial?.tolerancia ?? null);
  const [implemento,  setImplemento]  = useState(inicial?.implemento ?? 3);
  const [radio,       setRadio]       = useState<number | null>(inicial?.radio ?? null);
  const [lado,        setLado]        = useState<'arriba' | 'abajo' | 'ambos'>(inicial?.lado ?? 'ambos');

  /**
   * Un patrón guardado antes del 04/10/2026 se dibujó haciendo el offset de la
   * curva de nivel cruda y se puntuó por la pendiente residual, que es el
   * criterio opuesto al del método. No se lo redibuja solo —las líneas que ya
   * están en el plano son del usuario— pero tampoco se le muestra un veredicto
   * que nunca se midió: se avisa y se ofrece recalcular.
   */
  const patronAlDia = patron != null && (patron as Partial<ResultadoPatron>).version === 2;

  useEffect(() => {
    onInputs?.({
      res, aplicado, parcelaId, espaciado, suavizado,
      tolerancia: tolerancia ?? undefined, implemento, radio: radio ?? undefined, lado,
      patron, patronAplic,
    });
  }, [res, aplicado, parcelaId, espaciado, suavizado, tolerancia, implemento, radio, lado, patron, patronAplic, onInputs]);

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
      const p = generarPatronCultivo(g, parcela.vertices, {
        espaciado_m: espaciado,
        toleranciaDirectriz_m: tolerancia ?? undefined,
        radioRedondeo_m: radio ?? undefined,
        anchoImplemento_m: implemento,
        grupoHidro,
        lluvia10a24h_mm,
        lado,
      });
      if (!p) { setErrorPat('No se pudo calcular el patrón (parcela muy chica o sin datos de elevación).'); return; }
      setPatron(p);
    } catch {
      setErrorPat('Error al calcular el patrón.');
    } finally {
      setCargandoPat(false);
    }
  }, [parcelas, parcelaId, espaciado, tolerancia, radio, implemento, lado, grupoHidro, lluvia10a24h_mm, obtenerGrilla]);

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
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Las guías van a su propia capa («Keyline — guías»), no a la lista de caminos: son líneas de
              referencia para arar y orientar cultivos, no trazas para transitar. El keypoint sí queda como pin.
            </p>
            {aplicado && onAplicarComoCaminos && (
              <button
                onClick={() => onAplicarComoCaminos(res)}
                className="w-full py-1 rounded-lg border border-bone-300 text-[10px] font-medium text-ink-700/70 hover:border-moss-500 hover:text-moss-700 transition-colors"
              >
                Además, colocarlas como caminos (si alguna se va a transitar)
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Patrón de cultivo por parcela ── */}
      <div className="border-t border-bone-200 pt-4">
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1">Patrón de cultivo por parcela</p>
        <p className="text-[10px] text-ink-700/55 mb-2 leading-relaxed">
          Líneas paralelas a una <b>directriz simplificada</b> —no a la curva de nivel cruda, que es lo que la fuente
          dice que no se haga—. Al correrse de la curva, el surco desarrolla una pendiente propia, y eso no es el error
          del método: es el método. Esa deriva es la que saca el agua del eje del valle y la reparte en el lomo.
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
              <span className="text-[10px] text-ink-700/60 shrink-0 w-16">Directriz</span>
              <input type="number" min={0} step={1} value={tolerancia ?? ''} placeholder={String(Math.max(2, Math.round(espaciado * 0.75)))}
                onChange={e => { const v = parseFloat(e.target.value); setTolerancia(Number.isFinite(v) && v >= 0 ? v : null); }}
                className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              <span className="text-[10px] text-ink-700/40">m de tolerancia</span>
              <span className="ml-auto text-[9px] text-ink-700/40">0 = la curva cruda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-700/60 shrink-0 w-16">Implemento</span>
              <input type="number" min={1} step={0.5} value={implemento}
                onChange={e => { const v = parseFloat(e.target.value); if (Number.isFinite(v) && v > 0) setImplemento(v); }}
                className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              <span className="text-[10px] text-ink-700/40">m de ancho</span>
              <span className="ml-auto text-[9px] text-ink-700/40">de ahí sale la maniobra</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-700/60 shrink-0 w-16">Pareo</span>
              <div className="flex-1 flex gap-1 bg-bone-100 rounded-lg p-0.5">
                {([['ambos', 'los dos lados'], ['arriba', 'hacia arriba'], ['abajo', 'hacia abajo']] as const).map(([v, rot]) => (
                  <button key={v} onClick={() => setLado(v)}
                    className={`flex-1 text-[9px] font-medium py-1 rounded-md transition-colors ${lado === v ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/55 hover:text-ink-700'}`}>
                    {rot}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-700/60 shrink-0 w-16">Redondeo</span>
              <input type="number" min={0} step={0.5} value={radio ?? ''} placeholder={String(implemento)}
                onChange={e => { const v = parseFloat(e.target.value); setRadio(Number.isFinite(v) && v >= 0 ? v : null); }}
                className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500" />
              <span className="text-[10px] text-ink-700/40">m de radio en los vértices</span>
            </div>
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Primero se simplifica la directriz a las formas principales del terreno y después se redondea: son dos
              pasos distintos y en ese orden. Suavizar sin simplificar deja los cincuenta vértices de la curva y el
              offset arrastra cada ondulación; y el redondeo tiene que ser <b>un radio acotado</b> y no un corte de
              esquina proporcional al tramo, porque sobre una directriz de tres vértices eso se come media arma y da
              vuelta la deriva. El radio por defecto es el ancho del implemento, que es más o menos lo que la máquina
              puede girar.
            </p>
            <p className="text-[9px] text-ink-700/45 leading-relaxed">
              Del lado del pareo las fuentes no coinciden: Yeomans pide parear hacia arriba en los lomos y hacia abajo
              en las vertientes por debajo de la keyline, porque de cada lado la deriva sale con el signo contrario;
              Pavlov dice que con una directriz bien elegida se cubren los dos a la vez. El default son los dos y abajo
              figura qué fracción terminó derivando para el lado que corresponde.
            </p>
            {errorPat && <p className="text-[10px] text-clay-600 leading-tight">{errorPat}</p>}

            {patron && !patronAlDia && (
              <div className="space-y-2 bg-white rounded-xl border border-clay-200 p-3">
                <p className="text-[10px] text-clay-700/90 leading-relaxed flex gap-1">
                  <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    Este patrón se generó con los criterios anteriores: el offset salía de la curva de nivel cruda y la
                    calidad se puntuaba por la pendiente residual, o sea premiando lo contrario de lo que el método
                    busca. <b>Las líneas que ya están en el plano no se tocaron</b> —son tuyas— pero el veredicto no se
                    puede mostrar porque nunca se midió así. Volvé a calcular para medirlo contra la fuente.
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Líneas</span><br /><span className="font-mono font-bold text-ink-900">{patron.lineas.length}</span></div>
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Orient.</span><br /><span className="font-mono font-bold text-ink-900">{patron.orientacion_deg}°</span></div>
                </div>
              </div>
            )}

            {patron && patronAlDia && (
              <div className="space-y-2 bg-white rounded-xl border border-bone-200 p-3">
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Líneas</span><br /><span className="font-mono font-bold text-ink-900">{patron.lineas.length}</span></div>
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Deriva media</span><br /><span className="font-mono font-bold text-ink-900">{patron.resumen.deriva_media_pct}%</span></div>
                  <div className="bg-bone-50 rounded px-2 py-1"><span className="text-ink-700/50">Maniobra</span><br /><span className="font-mono font-bold text-ink-900">{patron.headland_m} m</span></div>
                </div>
                <div className="flex items-center gap-2 text-[10px] flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${VEREDICTO[patron.resumen.veredicto].clase}`}>
                    {VEREDICTO[patron.resumen.veredicto].rotulo}
                  </span>
                  <span className="text-ink-700/45">
                    {Math.round(patron.resumen.fraccionHaciaLadera * 100)}% hacia la ladera · pend. {patron.pendiente_media_pct}% · directriz de {patron.verticesDirectriz} vértices
                  </span>
                </div>
                <p className="text-[10px] text-ink-700/70 leading-relaxed">{patron.lectura}</p>
                <p className="text-[9px] text-ink-700/55 leading-relaxed border-t border-bone-200 pt-2">{patron.banda.nota}</p>

                {/* Etapa I — el patrón validado contra el terreno, surco por surco.
                    Va DESPUÉS del veredicto del conjunto a propósito: lo primero
                    que hace es poner al lado de ese promedio el conteo por fila,
                    que es lo que el estándar limita. `undefined` es un patrón
                    guardado antes del 06/10/2026, que no se validó nunca: ahí no
                    se muestra nada en vez de inventarle un resultado. */}
                {patron.validacion !== undefined && (
                  <ValidacionPatronBloque
                    validacion={patron.validacion} banda={patron.banda} resumen={patron.resumen}
                  />
                )}
                {patron.verticesCerrados.length > 0 && (
                  <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
                    <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                    <span>
                      {patron.verticesCerrados.length} vértice(s) de la directriz piden hasta{' '}
                      {Math.max(...patron.verticesCerrados.map(v => v.giro_deg)).toFixed(0)}° de giro, más de los 50–55°
                      que puede la mayoría de los tractores. A campo esos vértices no se trazan: hay que redondearlos o
                      correr la directriz.
                    </span>
                  </p>
                )}
                {patron.aptitud.motivos.map((m, i) => (
                  <p key={i} className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
                    <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                    <span>{m}</span>
                  </p>
                ))}
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
