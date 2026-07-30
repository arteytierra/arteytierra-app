'use client';

/**
 * Red de agua — dimensionado de tubería (B1a).
 * La tubería sigue la traza de un camino (que ya toma cota del DEM por vértice).
 * Calcula pérdida de carga (Hazen-Williams), presión estática y dinámica en
 * m.c.a., línea piezométrica sobre el perfil, velocidad, clase de caño (PN) y
 * el diámetro mínimo recomendado.
 */
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Droplet, Loader2, TriangleAlert, Gauge, Ruler, ArrowLeftRight, Zap } from 'lucide-react';
import type { Camino, PerfilElevacion } from '@/lib/caminos';
import {
  analizarLinea, diametroMinimo, calcularBomba, MATERIALES, DIAMETROS, CAUDAL_UNIDADES,
  type ResultadoLinea, type RedAguaResumen, type RedAguaInputs,
} from '@/lib/hidraulica';

interface Props {
  caminos:        Camino[];
  onCargarPerfil: (id: string) => Promise<PerfilElevacion | null>;
  onIrACaminos:   () => void;
  onResumen?:     (r: RedAguaResumen | null) => void;
  /** Campos guardados: al volver a la pestaña vuelve lo que había, no se resetea. */
  inicial?:       RedAguaInputs | null;
  onInputs?:      (i: RedAguaInputs) => void;
}

export function RedAguaPanel({ caminos, onCargarPerfil, onIrACaminos, onResumen, inicial, onInputs }: Props) {
  const [caminoId, setCaminoId]   = useState<string>(inicial?.caminoId ?? '');
  const [cargando, setCargando]   = useState(false);
  const [invertir, setInvertir]   = useState(inicial?.invertir ?? false);

  // Parámetros hidráulicos
  const [caudal, setCaudal]       = useState(inicial?.caudal ?? '1');
  const [unidad, setUnidad]       = useState<string>(inicial?.unidad ?? 'lmin');
  const [materialId, setMaterialId] = useState(inicial?.materialId ?? 'pvc');
  const [dn, setDn]               = useState(inicial?.dn ?? 50);
  const [cargaOrigen, setCargaOrigen] = useState(inicial?.cargaOrigen ?? '10');
  const [perdidasLocal, setPerdidasLocal] = useState(inicial?.perdidasLocal ?? '10');
  const [presionMin, setPresionMin] = useState(inicial?.presionMin ?? '10');

  useEffect(() => { onInputs?.({ caminoId, invertir, caudal, unidad, materialId, dn, cargaOrigen, perdidasLocal, presionMin }); },
    [caminoId, invertir, caudal, unidad, materialId, dn, cargaOrigen, perdidasLocal, presionMin, onInputs]);

  const camino = caminos.find(c => c.id === caminoId) ?? null;
  const material = MATERIALES.find(m => m.id === materialId)!;
  const diametro = DIAMETROS.find(d => d.dn === dn)!;
  const unidadCaudal = CAUDAL_UNIDADES.find(u => u.id === unidad)!;

  const Q_m3s = unidadCaudal.aM3s(parseFloat(caudal) || 0);

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
  const resumen: RedAguaResumen | null = useMemo(() =>
    camino && resultado && Q_m3s > 0 ? {
      camino:            camino.nombre,
      material:          material.nombre,
      diametro:          diametro.etiqueta,
      caudal:            `${caudal} ${unidadCaudal.label}`,
      longitud_m:        resultado.estaciones[resultado.estaciones.length - 1]?.distancia_m ?? 0,
      presion_final_mca: resultado.presion_final_mca,
      presion_min_mca:   resultado.presion_min_mca,
      velocidad_ms:      resultado.velocidad_ms,
      pn_recomendado:    resultado.pn_recomendado,
      bomba_kw:          necesitaBomba && bomba ? Math.round(bomba.potencia_elec_w / 10) / 100 : null,
    } : null,
    [camino, resultado, Q_m3s, material.nombre, diametro.etiqueta, caudal, unidadCaudal.label, necesitaBomba, bomba],
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

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Red de agua — dimensionado de tubería
      </p>

      {caminos.length === 0 ? (
        <div className="text-center py-8 px-4 space-y-2">
          <Droplet className="w-8 h-8 text-moss-700/40 mx-auto" />
          <p className="text-xs text-ink-700/60">
            La tubería sigue la traza de un camino. Dibujá el recorrido en la pestaña Caminos.
          </p>
          <button onClick={onIrACaminos} className="text-xs text-moss-700 hover:text-moss-900 underline">
            Ir a Caminos
          </button>
        </div>
      ) : (
        <>
          {/* Selección de traza */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <label className="text-[10px] text-ink-700/60">Traza de la tubería (camino)</label>
            <select
              value={caminoId}
              onChange={e => handleSeleccionar(e.target.value)}
              className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 bg-white"
            >
              <option value="">— Elegí un camino —</option>
              {caminos.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.longitud_m ?? '?'} m)</option>
              ))}
            </select>
            {cargando && (
              <p className="text-[10px] text-ink-700/60 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando cotas del terreno…
              </p>
            )}
            {camino && !camino.perfil && !cargando && (
              <button onClick={() => handleSeleccionar(camino.id)} className="text-[10px] text-moss-700 underline">
                Cargar cotas del DEM
              </button>
            )}
            {camino?.perfil && (
              <button
                onClick={() => setInvertir(v => !v)}
                className="text-[10px] text-ink-700/70 hover:text-ink-900 flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Origen: {invertir ? 'fin → inicio' : 'inicio → fin'} (invertir)
              </button>
            )}
          </div>

          {/* Parámetros */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 grid grid-cols-2 gap-2.5">
            <Campo label="Caudal">
              <div className="flex gap-1">
                <input type="number" value={caudal} onChange={e => setCaudal(e.target.value)} min="0" step="0.1"
                  className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
                <select value={unidad} onChange={e => setUnidad(e.target.value)}
                  className="text-xs rounded-lg border border-bone-200 px-1 py-1.5 bg-white">
                  {CAUDAL_UNIDADES.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </Campo>
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
            <Campo label="Presión mín. (m.c.a.)">
              <input type="number" value={presionMin} onChange={e => setPresionMin(e.target.value)} min="0" step="1"
                className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5" />
            </Campo>
          </div>

          {!camino?.perfil ? (
            <p className="text-[10px] text-ink-700/50 italic">Elegí una traza y cargá sus cotas para calcular.</p>
          ) : Q_m3s <= 0 ? (
            <p className="text-[10px] text-ink-700/50 italic">Ingresá un caudal mayor a cero.</p>
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
                    Para {presionMin} m.c.a. en el extremo, el mínimo comercial es{' '}
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
                Hazen-Williams (C={material.C}) · cotas SRTM ~30 m · valores orientativos de diseño preliminar.
              </p>
            </>
          ) : (
            <p className="text-[10px] text-ink-700/50 italic">Perfil insuficiente para calcular.</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componentes internos ─────────────────────────────────────────────────────

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
