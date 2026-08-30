'use client';

/**
 * Red de servicios — trazado y dimensionado (B1a).
 *
 * Una misma traza sirve para cualquier servicio del predio: agua, riego, gas,
 * electricidad, cloacas o datos. Cada uno se dibuja con su color de obra y se
 * mide su recorrido. El dimensionado hidráulico —caudal, diámetro, presión,
 * bombeo— corre sólo para las redes de agua y riego: gas y electricidad se
 * rigen por otra física y otras normas, y preferimos no dar un número que no
 * podamos sostener.
 *
 * El caudal ya no se escribe a ojo: se arma con los artefactos que van a
 * colgar de la red y la app calcula cuánto tiene que circular por el caño.
 */
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Droplet, Loader2, TriangleAlert, Gauge, Ruler, ArrowLeftRight, Zap,
  Plus, Minus, Calculator, Pencil, Sprout,
} from 'lucide-react';
import type { Camino, PerfilElevacion } from '@/lib/caminos';
import {
  analizarLinea, diametroMinimo, calcularBomba, MATERIALES, DIAMETROS, CAUDAL_UNIDADES,
  type ResultadoLinea, type RedAguaResumen, type RedAguaInputs,
} from '@/lib/hidraulica';
import { SERVICIOS, servicioPorId, type TipoServicio } from '@/lib/servicios';
import {
  ARTEFACTOS_DOMESTICOS, ARTEFACTOS_PRODUCCION, ARTEFACTOS_RIEGO,
  artefactoPorId, demandaRed, type ItemArtefacto, type Artefacto,
} from '@/lib/artefactos';

interface Props {
  caminos:        Camino[];
  onCargarPerfil: (id: string) => Promise<PerfilElevacion | null>;
  onIrACaminos:   () => void;
  /** Marca una traza como red de un servicio (le pone el color que le toca). */
  onMarcarServicio?: (id: string, servicio: TipoServicio) => void;
  /** Caudal continuo del sector de riego ya calculado, para sumarlo como nodo. */
  riego?:         { nombre: string; caudal_ls: number } | null;
  onIrARiego?:    () => void;
  onResumen?:     (r: RedAguaResumen | null) => void;
  /** Campos guardados: al volver a la pestaña vuelve lo que había, no se resetea. */
  inicial?:       RedAguaInputs | null;
  onInputs?:      (i: RedAguaInputs) => void;
}

export function RedServiciosPanel({
  caminos, onCargarPerfil, onIrACaminos, onMarcarServicio, riego, onIrARiego,
  onResumen, inicial, onInputs,
}: Props) {
  const [servicio, setServicio]   = useState<TipoServicio>((inicial?.servicio as TipoServicio) ?? 'agua');
  const [caminoId, setCaminoId]   = useState<string>(inicial?.caminoId ?? '');
  const [cargando, setCargando]   = useState(false);
  const [invertir, setInvertir]   = useState(inicial?.invertir ?? false);

  // Caudal: de los artefactos conectados o escrito a mano.
  const [modoCaudal, setModoCaudal] = useState<'artefactos' | 'manual'>(inicial?.modoCaudal ?? 'artefactos');
  const [items, setItems]           = useState<ItemArtefacto[]>(inicial?.artefactos ?? []);
  const [sumarRiego, setSumarRiego] = useState(inicial?.sumarRiego ?? false);

  // Parámetros hidráulicos
  const [caudal, setCaudal]       = useState(inicial?.caudal ?? '1');
  const [unidad, setUnidad]       = useState<string>(inicial?.unidad ?? 'lmin');
  const [materialId, setMaterialId] = useState(inicial?.materialId ?? 'pvc');
  const [dn, setDn]               = useState(inicial?.dn ?? 50);
  const [cargaOrigen, setCargaOrigen] = useState(inicial?.cargaOrigen ?? '10');
  const [perdidasLocal, setPerdidasLocal] = useState(inicial?.perdidasLocal ?? '10');
  const [presionMinManual, setPresionMinManual] = useState(inicial?.presionMin ?? '10');

  const ficha = servicioPorId(servicio)!;

  // ── Demanda desde los artefactos ────────────────────────────────────────────
  const demanda = useMemo(() => demandaRed(items), [items]);
  const riegoLs = sumarRiego && riego ? riego.caudal_ls : 0;
  const disenoLs = Math.round((demanda.diseno_ls + riegoLs) * 1000) / 1000;

  // Presión requerida: la del artefacto más exigente, salvo que se pise a mano.
  const presionMin = modoCaudal === 'artefactos' && demanda.presion_min_mca > 0
    ? String(demanda.presion_min_mca)
    : presionMinManual;

  useEffect(() => {
    onInputs?.({
      caminoId, invertir, caudal, unidad, materialId, dn, cargaOrigen, perdidasLocal,
      presionMin: presionMinManual, servicio, modoCaudal, artefactos: items, sumarRiego,
    });
  }, [caminoId, invertir, caudal, unidad, materialId, dn, cargaOrigen, perdidasLocal,
      presionMinManual, servicio, modoCaudal, items, sumarRiego, onInputs]);

  const camino = caminos.find(c => c.id === caminoId) ?? null;
  const material = MATERIALES.find(m => m.id === materialId)!;
  const diametro = DIAMETROS.find(d => d.dn === dn)!;
  const unidadCaudal = CAUDAL_UNIDADES.find(u => u.id === unidad)!;

  const Q_m3s = modoCaudal === 'artefactos'
    ? disenoLs / 1000
    : unidadCaudal.aM3s(parseFloat(caudal) || 0);

  // Trazas: primero las ya marcadas para este servicio, después el resto.
  const trazasPropias = caminos.filter(c => c.servicio === servicio);
  const trazasOtras   = caminos.filter(c => c.servicio !== servicio);

  // Perfil orientado según sentido de flujo elegido
  const perfilOrientado = useMemo(() => {
    if (!camino?.perfil) return null;
    const pts = camino.perfil.puntos;
    if (!invertir) return pts;
    const total = camino.perfil.longitud_m;
    return [...pts].reverse().map(p => ({ distancia_m: total - p.distancia_m, elevation: p.elevation }));
  }, [camino, invertir]);

  const base = useMemo(() => perfilOrientado ? {
    perfil:            perfilOrientado,
    cargaOrigen_m:     parseFloat(cargaOrigen) || 0,
    Q_m3s,
    C:                 material.C,
    perdidasLocal_pct: parseFloat(perdidasLocal) || 0,
    presionMin_mca:    parseFloat(presionMin) || 0,
  } : null, [perfilOrientado, cargaOrigen, Q_m3s, material.C, perdidasLocal, presionMin]);

  const resultado: ResultadoLinea | null = useMemo(() =>
    base ? analizarLinea({ ...base, D_interior_m: diametro.interior_mm / 1000 }) : null,
    [base, diametro],
  );

  const sugerencia = useMemo(() =>
    base && Q_m3s > 0 ? diametroMinimo(base, parseFloat(presionMin) || 0) : null,
    [base, Q_m3s, presionMin],
  );

  // Bombeo: dimensiona una bomba para vencer la subida + fricción + presión requerida.
  const bomba = useMemo(() =>
    resultado && Q_m3s > 0 ? calcularBomba(
      Q_m3s, -resultado.desnivel_m, resultado.perdida_total_m, parseFloat(presionMin) || 0,
    ) : null,
    [resultado, Q_m3s, presionMin],
  );

  // Emite el resumen hacia arriba (para informe/snapshot).
  const necesitaBomba = !!resultado && resultado.presion_min_mca < (parseFloat(presionMin) || 0);
  const caudalTexto = modoCaudal === 'artefactos'
    ? `${disenoLs} L/s (${demanda.n_total} artefactos)`
    : `${caudal} ${unidadCaudal.label}`;
  const resumen: RedAguaResumen | null = useMemo(() =>
    camino && resultado && Q_m3s > 0 ? {
      camino:            camino.nombre,
      servicio:          ficha.nombre,
      material:          material.nombre,
      diametro:          diametro.etiqueta,
      caudal:            caudalTexto,
      longitud_m:        resultado.estaciones[resultado.estaciones.length - 1]?.distancia_m ?? 0,
      presion_final_mca: resultado.presion_final_mca,
      presion_min_mca:   resultado.presion_min_mca,
      velocidad_ms:      resultado.velocidad_ms,
      pn_recomendado:    resultado.pn_recomendado,
      bomba_kw:          necesitaBomba && bomba ? Math.round(bomba.potencia_elec_w / 10) / 100 : null,
    } : null,
    [camino, resultado, Q_m3s, ficha.nombre, material.nombre, diametro.etiqueta, caudalTexto, necesitaBomba, bomba],
  );
  useEffect(() => { onResumen?.(resumen); }, [resumen, onResumen]);

  const handleSeleccionar = useCallback(async (id: string) => {
    setCaminoId(id);
    if (!id) return;
    const c = caminos.find(x => x.id === id);
    if (c && !c.perfil) {
      setCargando(true);
      await onCargarPerfil(id);
      setCargando(false);
    }
  }, [caminos, onCargarPerfil]);

  const cambiarCantidad = useCallback((artefactoId: string, delta: number) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.artefactoId === artefactoId);
      if (i === -1) return delta > 0 ? [...prev, { artefactoId, cantidad: delta }] : prev;
      const n = prev[i]!.cantidad + delta;
      if (n <= 0) return prev.filter((_, j) => j !== i);
      return prev.map((x, j) => j === i ? { ...x, cantidad: n } : x);
    });
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Red de servicios
      </p>

      {/* ── Qué servicio se está trazando ── */}
      <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
        <label className="text-[10px] text-ink-700/60">Servicio</label>
        <div className="flex flex-wrap gap-1.5">
          {SERVICIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setServicio(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                servicio === s.id ? 'border-ink-900 bg-ink-900 text-bone-50' : 'border-bone-300 text-ink-700/70 hover:border-ink-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-white/40" style={{ background: s.color }} />
              {s.nombre}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-700/55 leading-relaxed">{ficha.nota}</p>
      </div>

      {caminos.length === 0 ? (
        <div className="text-center py-8 px-4 space-y-2">
          <Droplet className="w-8 h-8 text-moss-700/40 mx-auto" />
          <p className="text-xs text-ink-700/60">
            La red sigue una traza dibujada sobre el mapa. Dibujá el recorrido en la pestaña Caminos.
          </p>
          <button onClick={onIrACaminos} className="text-xs text-moss-700 hover:text-moss-900 underline">
            Ir a Caminos
          </button>
        </div>
      ) : (
        <>
          {/* Selección de traza */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <label className="text-[10px] text-ink-700/60">Traza de la red</label>
            <select
              value={caminoId}
              onChange={e => handleSeleccionar(e.target.value)}
              className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white"
            >
              <option value="">— Elegí una traza —</option>
              {trazasPropias.length > 0 && (
                <optgroup label={`Red de ${ficha.nombre.toLowerCase()}`}>
                  {trazasPropias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.longitud_m ?? '?'} m)</option>
                  ))}
                </optgroup>
              )}
              {trazasOtras.length > 0 && (
                <optgroup label="Otras trazas del predio">
                  {trazasOtras.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.longitud_m ?? '?'} m){c.servicio ? ` · ${servicioPorId(c.servicio)?.nombre ?? c.servicio}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {cargando && (
              <p className="text-[10px] text-ink-700/60 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando cotas del terreno…
              </p>
            )}
            {camino && camino.servicio !== servicio && onMarcarServicio && (
              <button
                onClick={() => onMarcarServicio(camino.id, servicio)}
                className="w-full py-1.5 rounded-lg border border-bone-300 text-[10px] font-medium text-ink-700/75 hover:border-moss-500 hover:text-moss-700 transition-colors"
              >
                Marcar esta traza como red de {ficha.nombre.toLowerCase()} (se dibuja en su color)
              </button>
            )}
            {camino && !camino.perfil && !cargando && (
              <button onClick={() => handleSeleccionar(camino.id)} className="text-[10px] text-moss-700 underline">
                Cargar cotas del DEM
              </button>
            )}
            {camino?.perfil && ficha.calcula && (
              <button
                onClick={() => setInvertir(v => !v)}
                className="text-[10px] text-ink-700/70 hover:text-ink-900 flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Origen: {invertir ? 'fin → inicio' : 'inicio → fin'} (invertir)
              </button>
            )}
          </div>

          {!ficha.calcula ? (
            <div className="bg-bone-50 border border-bone-200 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-medium text-ink-900">Sólo trazado</p>
              <p className="text-[11px] text-ink-700/65 leading-relaxed">{ficha.nota}</p>
              {camino && (
                <p className="text-[11px] text-ink-700/75">
                  <span className="font-mono font-bold text-ink-900">{camino.longitud_m ?? '?'} m</span> de recorrido
                  {camino.perfil ? ` · desnivel ${Math.round(camino.perfil.elev_max - camino.perfil.elev_min)} m` : ''}.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* ── Caudal: de los artefactos o a mano ── */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-700/60 mr-auto">¿Cuánta agua pide la red?</span>
                  <button onClick={() => setModoCaudal('artefactos')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors ${modoCaudal === 'artefactos' ? 'border-moss-700 bg-moss-700 text-bone-50' : 'border-bone-300 text-ink-700/70'}`}>
                    <Calculator className="w-2.5 h-2.5" /> Por artefactos
                  </button>
                  <button onClick={() => setModoCaudal('manual')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors ${modoCaudal === 'manual' ? 'border-moss-700 bg-moss-700 text-bone-50' : 'border-bone-300 text-ink-700/70'}`}>
                    <Pencil className="w-2.5 h-2.5" /> A mano
                  </button>
                </div>

                {modoCaudal === 'manual' ? (
                  <>
                    <div className="flex gap-1">
                      <input type="number" value={caudal} onChange={e => setCaudal(e.target.value)} min="0" step="0.1"
                        className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                      <select value={unidad} onChange={e => setUnidad(e.target.value)}
                        className="text-xs rounded-lg border border-bone-200 px-1 py-1.5 bg-white">
                        {CAUDAL_UNIDADES.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-ink-700/55 leading-relaxed">
                      Este número es el que <strong>circula por el caño</strong>: el caudal de diseño, no lo que
                      entrega la fuente. Si no sabés cuánto poner, armalo con los artefactos.
                    </p>
                  </>
                ) : (
                  <>
                    <ListaArtefactos titulo="Uso doméstico" artefactos={ARTEFACTOS_DOMESTICOS} items={items} onCambiar={cambiarCantidad} />
                    <ListaArtefactos titulo="Producción" artefactos={ARTEFACTOS_PRODUCCION} items={items} onCambiar={cambiarCantidad} />
                    <ListaArtefactos titulo="Riego" artefactos={ARTEFACTOS_RIEGO} items={items} onCambiar={cambiarCantidad} />

                    {riego && riego.caudal_ls > 0 && (
                      <label className="flex items-start gap-2 text-[11px] text-ink-700/75 bg-moss-50 border border-moss-200 rounded-lg px-2.5 py-2 cursor-pointer">
                        <input type="checkbox" checked={sumarRiego} onChange={e => setSumarRiego(e.target.checked)}
                          className="mt-0.5 accent-moss-700" />
                        <span className="flex items-center gap-1 flex-wrap">
                          <Sprout className="w-3 h-3 text-moss-700" />
                          Sumar el sector de riego ya calculado: <strong>{riego.nombre}</strong>,{' '}
                          <span className="font-mono">{riego.caudal_ls} L/s</span> continuos.
                        </span>
                      </label>
                    )}

                    <ResumenDemanda demanda={demanda} riegoLs={riegoLs} disenoLs={disenoLs} />

                    {demanda.n_total === 0 && (
                      <p className="text-[10px] text-ink-700/50 italic">
                        Sumá lo que va a colgar de esta red y la app calcula el caudal.
                        {onIrARiego && ' Los sectores de riego se cargan en la pestaña Riego.'}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Parámetros */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 grid grid-cols-2 gap-2.5">
                <Campo label="Material">
                  <select value={materialId} onChange={e => setMaterialId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white">
                    {MATERIALES.map(m => <option key={m.id} value={m.id}>{m.nombre} (C={m.C})</option>)}
                  </select>
                </Campo>
                <Campo label="Diámetro nominal">
                  <select value={dn} onChange={e => setDn(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white">
                    {DIAMETROS.map(d => <option key={d.dn} value={d.dn}>{d.etiqueta} · int {d.interior_mm}mm</option>)}
                  </select>
                </Campo>
                <Campo label="Carga en origen (m)">
                  <input type="number" value={cargaOrigen} onChange={e => setCargaOrigen(e.target.value)} min="0" step="1"
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                </Campo>
                <Campo label="Pérdidas locales (%)">
                  <input type="number" value={perdidasLocal} onChange={e => setPerdidasLocal(e.target.value)} min="0" step="5"
                    className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                </Campo>
                <div className="col-span-2">
                  <Campo label="Presión mínima en el extremo (m.c.a.)">
                    {modoCaudal === 'artefactos' && demanda.presion_min_mca > 0 ? (
                      <p className="text-[11px] text-ink-700/75 bg-bone-50 border border-bone-200 rounded-lg px-2.5 py-1.5">
                        <span className="font-mono font-bold text-ink-900">{demanda.presion_min_mca} m.c.a.</span>
                        {demanda.presion_manda && <> — la pide {demanda.presion_manda.toLowerCase()}, que es lo más exigente de la lista.</>}
                      </p>
                    ) : (
                      <input type="number" value={presionMinManual} onChange={e => setPresionMinManual(e.target.value)} min="0" step="1"
                        className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                    )}
                  </Campo>
                </div>
              </div>

              {!camino?.perfil ? (
                <p className="text-[10px] text-ink-700/50 italic">Elegí una traza y cargá sus cotas para calcular.</p>
              ) : Q_m3s <= 0 ? (
                <p className="text-[10px] text-ink-700/50 italic">
                  {modoCaudal === 'artefactos' ? 'Agregá al menos un artefacto.' : 'Ingresá un caudal mayor a cero.'}
                </p>
              ) : resultado ? (
                <>
                  {/* Resultados */}
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Presión en extremo" value={`${resultado.presion_final_mca} m`}
                      color={resultado.presion_final_mca >= (parseFloat(presionMin) || 0) ? 'verde' : 'rojo'} />
                    <Stat label="Presión mínima" value={`${resultado.presion_min_mca} m`}
                      sub={`@ ${Math.round(resultado.estacion_min)} m`}
                      color={resultado.presion_min_mca >= (parseFloat(presionMin) || 0) ? 'verde' : 'rojo'} />
                    <Stat label="Velocidad" value={`${resultado.velocidad_ms} m/s`}
                      color={resultado.velocidad_ms > 2 ? 'rojo' : resultado.velocidad_ms < 0.5 ? 'amarillo' : 'verde'} />
                    <Stat label="Pérdida de carga" value={`${resultado.perdida_total_m} m`} />
                    <Stat label="Estática máx." value={`${resultado.presion_estatica_max} m`} sub="para clase de caño" />
                    <Stat label="Caño recomendado" value={`PN ${resultado.pn_recomendado}`} color="moss" />
                  </div>

                  {/* Línea piezométrica */}
                  <PiezometricaChart resultado={resultado} />

                  {/* Advertencias */}
                  {resultado.advertencias.length > 0 && (
                    <div className="bg-sun-300/15 border border-sun-300/50 rounded-xl p-3 space-y-1.5">
                      {resultado.advertencias.map((a, i) => (
                        <p key={i} className="text-[11px] text-clay-700 flex gap-1.5">
                          <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {a}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Dimensionado inverso */}
                  <div className="bg-moss-50 rounded-xl border border-moss-200 p-3 space-y-1">
                    <p className="text-xs font-medium text-moss-900 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> ¿Qué diámetro comprar?
                    </p>
                    {sugerencia ? (
                      <p className="text-xs text-moss-700">
                        Para {presionMin} m.c.a. en el extremo con {Math.round(Q_m3s * 1000 * 100) / 100} L/s, el mínimo comercial es{' '}
                        <span className="font-mono font-bold">DN {sugerencia.diametro.etiqueta}</span>{' '}
                        ({sugerencia.resultado.velocidad_ms} m/s, presión final {sugerencia.resultado.presion_final_mca} m).
                      </p>
                    ) : (
                      <p className="text-xs text-clay-700">
                        Ningún diámetro comercial alcanza {presionMin} m.c.a. sin superar 2 m/s. Necesitás más carga (tanque más alto o bombeo) o dividir el caudal.
                      </p>
                    )}
                  </div>

                  {/* Bombeo */}
                  {bomba && (
                    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                      <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-sun-500" /> Bombeo (si hiciera falta subir el agua)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Stat label="Altura dinámica (TDH)" value={`${bomba.altura_dinamica_m} m`} sub="subida + fricción + presión" />
                        <Stat label="Potencia eléctrica" value={`${(bomba.potencia_elec_w / 1000).toFixed(2)} kW`} sub={`≈ ${bomba.potencia_hp} HP`} />
                        <Stat label="Energía diaria" value={`${(bomba.energia_dia_wh / 1000).toFixed(1)} kWh`} sub="a 6 h/día" />
                        <Stat label="Solar FV" value={`${bomba.paneles_wp} Wp`} sub="~5 h sol pico" />
                      </div>
                      <p className="text-[9px] text-ink-700/50">
                        η bomba 60% × motor 90%. Referencia para bomba centrífuga / solar; para ariete o sifón el criterio cambia.
                      </p>
                    </div>
                  )}

                  <p className="text-[9px] text-ink-700/40 italic">
                    Hazen-Williams (C={material.C}) · cotas del DEM · valores orientativos de diseño preliminar.
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-ink-700/50 italic">Perfil insuficiente para calcular.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componentes internos ─────────────────────────────────────────────────────

function ListaArtefactos({ titulo, artefactos, items, onCambiar }: {
  titulo: string;
  artefactos: Artefacto[];
  items: ItemArtefacto[];
  onCambiar: (id: string, delta: number) => void;
}) {
  const [abierto, setAbierto] = useState(titulo === 'Uso doméstico');
  const cuenta = artefactos.reduce((s, a) => s + (items.find(i => i.artefactoId === a.id)?.cantidad ?? 0), 0);

  return (
    <div className="border border-bone-200 rounded-lg overflow-hidden">
      <button onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-bone-50 text-[11px] font-medium text-ink-700">
        <span>{titulo}</span>
        <span className="text-[10px] text-ink-700/55">{cuenta > 0 ? `${cuenta} conectados` : 'ninguno'} {abierto ? '−' : '+'}</span>
      </button>
      {abierto && (
        <div className="divide-y divide-bone-100">
          {artefactos.map(a => {
            const n = items.find(i => i.artefactoId === a.id)?.cantidad ?? 0;
            return (
              <div key={a.id} className={`flex items-center gap-2 px-2.5 py-1.5 ${n > 0 ? 'bg-moss-50/50' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-ink-900 leading-tight truncate">{a.nombre}</p>
                  <p className="text-[9px] text-ink-700/50 font-mono">
                    {a.caudal_ls < 0.1 ? `${Math.round(a.caudal_ls * 3600)} L/h` : `${a.caudal_ls} L/s`}
                    {a.continuo ? ' · continuo' : ` · ${a.ug} UG`} · {a.presion_min_mca} m.c.a.
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onCambiar(a.id, -1)} disabled={n === 0}
                    className="w-5 h-5 rounded border border-bone-300 flex items-center justify-center disabled:opacity-30 hover:border-ink-400">
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="w-6 text-center font-mono text-[11px] text-ink-900">{n}</span>
                  <button onClick={() => onCambiar(a.id, 1)}
                    className="w-5 h-5 rounded border border-bone-300 flex items-center justify-center hover:border-moss-500 hover:text-moss-700">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResumenDemanda({ demanda, riegoLs, disenoLs }: {
  demanda: ReturnType<typeof demandaRed>;
  riegoLs: number;
  disenoLs: number;
}) {
  const [porQue, setPorQue] = useState(false);
  if (demanda.n_total === 0 && riegoLs === 0) return null;
  const maximo = Math.round((demanda.maximo_ls + riegoLs) * 100) / 100;

  return (
    <div className="bg-moss-50 border border-moss-200 rounded-lg p-2.5 space-y-1.5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-moss-700/70">Todas las llaves abiertas</p>
          <p className="font-mono text-sm font-bold text-ink-900">{maximo} L/s</p>
          <p className="text-[9px] text-ink-700/50">{Math.round(maximo * 60 * 10) / 10} L/min</p>
        </div>
        <div>
          <p className="text-[9px] text-moss-700/70">Caudal de diseño del caño</p>
          <p className="font-mono text-sm font-bold text-moss-800">{disenoLs} L/s</p>
          <p className="text-[9px] text-ink-700/50">{Math.round(disenoLs * 60 * 10) / 10} L/min</p>
        </div>
      </div>
      <p className="text-[10px] text-ink-700/65 leading-relaxed">{demanda.nota}</p>
      <button onClick={() => setPorQue(v => !v)} className="text-[10px] text-moss-700 underline">
        {porQue ? 'ocultar' : 'por qué no se suma todo'}
      </button>
      {porQue && (
        <div className="text-[10px] text-ink-700/70 leading-relaxed space-y-1 pt-1 border-t border-moss-200">
          <p>
            El caño no se dimensiona por la suma de todas las canillas: la probabilidad de que se abran
            todas en el mismo segundo es ínfima, y ese caño sería caro, pesado y tan lento por dentro que
            sedimenta. Se dimensiona por el caudal que sí tiene chance de darse.
          </p>
          <p>
            <strong>Hunter</strong> (unidades de gasto): {demanda.ug_total} UG de {demanda.n_intermitentes} artefactos
            intermitentes → <span className="font-mono">{demanda.hunter_ls} L/s</span>.
          </p>
          <p>
            <strong>K = 1/√(n−1)</strong> sobre los caudales instantáneos → <span className="font-mono">{demanda.raiz_ls} L/s</span>.
            Se muestra para contrastar; el diseño toma el de Hunter.
          </p>
          {demanda.continuo_ls > 0 && (
            <p>
              <strong>Consumo continuo</strong> (riego, llenado de tanque):{' '}
              <span className="font-mono">{Math.round((demanda.continuo_ls + riegoLs) * 1000) / 1000} L/s</span>, se suma
              entero — mientras corre, corre.
            </p>
          )}
          <p className="text-ink-700/50">
            Fuente: Hunter, «Methods for Estimating Loads in Plumbing Systems», NBS BMS65 (1940), base de los
            códigos de instalaciones sanitarias. El coeficiente de simultaneidad es NF P 41-201.
          </p>
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-ink-700/60 block">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, color }: {
  label: string; value: string; sub?: string;
  color?: 'verde' | 'amarillo' | 'rojo' | 'moss';
}) {
  const cls =
    color === 'verde' ? 'bg-moss-50 border-moss-200 text-moss-700' :
    color === 'amarillo' ? 'bg-sun-300/20 border-sun-300 text-clay-700' :
    color === 'rojo' ? 'bg-clay-100 border-clay-200 text-clay-700' :
    color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' :
    'bg-white border-bone-200 text-ink-900';
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1"><Gauge className="w-2.5 h-2.5" />{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

function PiezometricaChart({ resultado }: { resultado: ResultadoLinea }) {
  const W = 320, H = 150, PAD_L = 30, PAD_R = 8, PAD_T = 10, PAD_B = 20;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const est = resultado.estaciones;
  const distMax = est[est.length - 1]!.distancia_m || 1;

  const elevs = est.map(e => e.elevacion_m);
  const piezos = est.map(e => e.piezo_m);
  const yMin = Math.min(...elevs);
  const yMax = Math.max(...piezos, ...elevs);
  const rango = Math.max(1, yMax - yMin);

  const xAt = (d: number) => PAD_L + (d / distMax) * plotW;
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / rango) * plotH;

  const terreno = est.map(e => `${xAt(e.distancia_m).toFixed(1)},${yAt(e.elevacion_m).toFixed(1)}`).join(' ');
  const terrenoArea = `${PAD_L},${H - PAD_B} ${terreno} ${(PAD_L + plotW)},${H - PAD_B}`;
  const piezo = est.map(e => `${xAt(e.distancia_m).toFixed(1)},${yAt(e.piezo_m).toFixed(1)}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-2">
      <p className="text-[10px] text-ink-700/60 px-1 pb-1">Línea piezométrica (azul) sobre el terreno (marrón)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: 150 }}>
        {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="#eee7dc" strokeWidth={1} />
            <text x={PAD_L - 3} y={yAt(v) + 3} textAnchor="end" fontSize={7} fill="#9a958c" fontFamily="monospace">{Math.round(v)}</text>
          </g>
        ))}
        <polygon points={terrenoArea} fill="#8B4513" fillOpacity={0.12} />
        <polyline points={terreno} fill="none" stroke="#8B4513" strokeWidth={1.5} />
        <polyline points={piezo} fill="none" stroke="#1565C0" strokeWidth={1.5} strokeDasharray="none" />
        {/* Punto de presión mínima */}
        {(() => {
          const m = est.reduce((a, b) => b.presion_mca < a.presion_mca ? b : a, est[0]!);
          return <circle cx={xAt(m.distancia_m)} cy={yAt(m.elevacion_m)} r={2.5} fill="#C62828" />;
        })()}
        <text x={PAD_L} y={H - 6} fontSize={7} fill="#9a958c" fontFamily="monospace">0</text>
        <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize={7} fill="#9a958c" fontFamily="monospace">
          {distMax >= 1000 ? `${(distMax / 1000).toFixed(1)} km` : `${Math.round(distMax)} m`}
        </text>
      </svg>
    </div>
  );
}
