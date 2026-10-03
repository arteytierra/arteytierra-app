/**
 * La alcantarilla del cruce, colgada del caudal pico de la cuenca.
 *
 * Vive como bloque aparte y no dentro de `CuencaPanel` porque la cuenca es
 * hidrología —cuánta agua llega— y esto es obra —qué caño se compra—. El panel
 * de cuenca le pasa el único dato que comparten, que es el pico.
 *
 * Ver `lib/alcantarilla.ts` para el método y las fuentes.
 */
'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, TriangleAlert } from 'lucide-react';
import { diametroAlcantarilla, BOCAS, HW_SOBRE_D_HABITUAL, FUENTE_HDS5 } from '@/lib/alcantarilla';

export function AlcantarillaBloque({ caudal_pico_m3s }: { caudal_pico_m3s: number }) {
  const [largo, setLargo]   = useState('12');
  const [pend, setPend]     = useState('2');
  const [carga, setCarga]   = useState('0.8');
  const [bocaId, setBocaId] = useState('hormigon_campana');

  const res = useMemo(() => diametroAlcantarilla({
    caudal_m3s:        caudal_pico_m3s,
    largo_m:           Math.max(1, Number(largo) || 12),
    pendiente_m_m:     Math.max(0, (Number(pend) || 0) / 100),
    carga_admisible_m: Math.max(0.1, Number(carga) || 0.8),
    boca_id:           bocaId,
  }), [caudal_pico_m3s, largo, pend, carga, bocaId]);

  if (caudal_pico_m3s <= 0) return null;
  const e = res.elegido;

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden group">
      <summary className="px-3 py-2 text-[11px] font-medium text-ink-700 cursor-pointer select-none flex items-center gap-1.5 hover:bg-bone-50">
        <ArrowRightLeft className="w-3 h-3 text-[#1565C0]" />
        Si acá cruza un camino: ¿qué caño va?
      </summary>

      <div className="px-3 pb-3 space-y-3">
        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          Con el caudal pico de esta cuenca, el método estándar de alcantarillas devuelve el
          diámetro. Calcula las <b>dos</b> formas de ahogarse que tiene un caño —que la boca no
          deje entrar el agua, o que el caño no la pueda sacar— y manda la peor, porque es la
          razón por la que un caño que «da bien» por una cuenta rebalsa el camino.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Campo label="Largo del caño (m)">
            <input type="number" min={1} step={1} value={largo} onChange={ev => setLargo(ev.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
          <Campo label="Pendiente (%)">
            <input type="number" min={0} step={0.5} value={pend} onChange={ev => setPend(ev.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
          <Campo label="Agua admisible (m)">
            <input type="number" min={0.1} step={0.1} value={carga} onChange={ev => setCarga(ev.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
        </div>
        <p className="text-[9px] text-ink-700/50 leading-relaxed -mt-1">
          «Agua admisible» es cuánto se puede dejar embalsar arriba del cruce antes de que moje
          la calzada: la altura del terraplén menos una revancha. El manual usa 0,61 m de
          revancha bajo el hombro del camino.
        </p>

        <Campo label="Boca del caño">
          <select value={bocaId} onChange={ev => setBocaId(ev.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
            {BOCAS.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </Campo>
        <p className="text-[9px] text-ink-700/55 leading-relaxed -mt-1">
          {res.boca.nota}
        </p>

        {e ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border bg-[#1565C0] border-[#1565C0] text-bone-50 p-2.5">
                <p className="text-[10px] opacity-70 mb-0.5">Diámetro</p>
                <p className="font-mono text-sm font-bold leading-tight">{e.diametro_mm} mm</p>
                <p className="text-[9px] opacity-70 mt-0.5">
                  {(e.diametro_mm / 25.4).toFixed(0)}″ · el menor de la serie que cumple
                </p>
              </div>
              <div className="rounded-xl border border-bone-200 bg-white p-2.5">
                <p className="text-[10px] text-ink-700/60 mb-0.5">Agua arriba del cruce</p>
                <p className="font-mono text-sm font-bold leading-tight">{e.hw_m.toFixed(2)} m</p>
                <p className="text-[9px] text-ink-700/60 mt-0.5">
                  {e.hw_sobre_d.toFixed(2)} veces el diámetro
                  {e.hw_sobre_d > HW_SOBRE_D_HABITUAL[1] ? ' — alto' : ''}
                </p>
              </div>
              <div className="rounded-xl border border-bone-200 bg-white p-2.5">
                <p className="text-[10px] text-ink-700/60 mb-0.5">Manda</p>
                <p className="font-mono text-sm font-bold leading-tight">
                  {e.manda === 'entrada' ? 'La boca' : 'El caño'}
                </p>
                <p className="text-[9px] text-ink-700/60 mt-0.5">
                  entrada {e.entrada.hw_m.toFixed(2)} m · salida {e.salida.hw_m.toFixed(2)} m
                </p>
              </div>
              <div className="rounded-xl border border-bone-200 bg-white p-2.5">
                <p className="text-[10px] text-ink-700/60 mb-0.5">Sale a</p>
                <p className="font-mono text-sm font-bold leading-tight">
                  {e.vel_salida_ms ? `${e.vel_salida_ms.toFixed(1)} m/s` : '—'}
                </p>
                <p className="text-[9px] text-ink-700/60 mt-0.5">
                  al tirante normal, no a sección llena ({e.salida.vel_llena_ms.toFixed(1)} m/s)
                </p>
              </div>
            </div>

            {e.vel_salida_ms !== null && e.vel_salida_ms > 3 && (
              <p className="text-[10px] text-ink-700/70 leading-relaxed bg-bone-50 rounded-lg px-2.5 py-2">
                A {e.vel_salida_ms.toFixed(1)} m/s el agua sale con fuerza suficiente para cavar
                la salida. Ahí va enrocado, un cuenco disipador o un caño más rugoso — y el
                número que importa es éste, no el de sección llena, que da un tercio menos.
              </p>
            )}

            {e.avisos.map((a, i) => (
              <p key={i} className="text-[10px] text-ink-700/70 leading-relaxed flex gap-1.5">
                <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />{a}
              </p>
            ))}
          </>
        ) : (
          <p className="text-[10px] text-ink-700/70 leading-relaxed bg-amber-50 rounded-lg px-2.5 py-2">
            Ningún diámetro de la serie entra con esa agua admisible.
          </p>
        )}

        {res.avisos.map((a, i) => (
          <p key={i} className="text-[10px] text-ink-700/70 leading-relaxed">{a}</p>
        ))}

        <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
          {FUENTE_HDS5}. Control de entrada por las ecuaciones del apéndice A con los
          coeficientes de la tabla A.1; control de salida por la ecuación 3.5 con los ke de la
          tabla C.2; n de Manning de la tabla B.1, en el extremo rugoso del rango. El manual
          avisa que el tope de agua embalsada —entre 1 y 1,5 diámetros— lo fija cada repartición
          de caminos; en un camino interno lo decide el dueño. Diseño preliminar.
        </p>
      </div>
    </details>
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
