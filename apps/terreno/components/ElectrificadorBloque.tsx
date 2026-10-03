/**
 * El electrificador, colgado de los metros de alambrado del menú de manejos.
 *
 * Bloque aparte de `PastoreoPanel` porque es la otra mitad de la compra: el
 * panel dice cuántos metros de alambre, esto dice qué equipo los sostiene y las
 * dos cosas que lo hacen fallar aunque el equipo esté bien.
 *
 * Ver `lib/electrificador.ts` para las fuentes y para la contradicción entre dos
 * de ellas, que acá se muestra en pantalla en vez de resolverse a escondidas.
 */
'use client';

import { useMemo, useState } from 'react';
import { Zap, TriangleAlert } from 'lucide-react';
import {
  dimensionarElectrificador, ALAMBRES, VOLTAJE_PUNTA, BANDAS_VEGETACION,
  type CargaVegetacion,
  FUENTE_NRCS_382, FUENTE_KURTZ_FREY, FUENTE_BOOHER, FUENTE_ONTARIO,
} from '@/lib/electrificador';

export function ElectrificadorBloque({ alambrado_m }: { alambrado_m: number }) {
  const [hilos, setHilos]   = useState('2');
  const [veg, setVeg]       = useState<CargaVegetacion>('media');
  const [alam, setAlam]     = useState('cal12_5');
  const [animal, setAnimal] = useState('vacunos');

  const r = useMemo(() => dimensionarElectrificador({
    largo_cerco_m: Math.max(0, alambrado_m),
    hilos:         Math.max(1, Number(hilos) || 1),
    vegetacion:    veg,
    alambre_id:    alam,
    animal_id:     animal,
  }), [alambrado_m, hilos, veg, alam, animal]);

  if (alambrado_m <= 0) return null;

  return (
    <details className="bg-white rounded-xl border border-bone-200 overflow-hidden group">
      <summary className="px-3 py-2 text-[11px] font-medium text-ink-700 cursor-pointer select-none flex items-center gap-1.5 hover:bg-bone-50">
        <Zap className="w-3 h-3 text-amber-600" />
        El electrificador para esos {alambrado_m.toLocaleString('es-AR')} m
      </summary>

      <div className="px-3 pb-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Hilos electrificados">
            <input type="number" min={1} max={12} step={1} value={hilos} onChange={e => setHilos(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
          </Campo>
          <Campo label="Vegetación sobre el alambre">
            <select value={veg} onChange={e => setVeg(e.target.value as CargaVegetacion)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
              {BANDAS_VEGETACION.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Alambre">
            <select value={alam} onChange={e => setAlam(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
              {ALAMBRES.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Animal a contener">
            <select value={animal} onChange={e => setAnimal(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white">
              {VOLTAJE_PUNTA.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            </select>
          </Campo>
        </div>

        {/* ── Energía: las dos cotas publicadas, y por qué son dos ───────── */}
        <div className="grid grid-cols-3 gap-2">
          <Caja label="Equipo" valor={`${r.joules.recomendado_j.toFixed(1)} J`}
            sub="joules de SALIDA, no almacenados" fuerte />
          <Caja label="Varilla de tierra" valor={`${r.tierra.metros_varilla.toFixed(1)} m`}
            sub={`${r.tierra.varillas} varillas de ${r.tierra.largo_varilla_m.toFixed(2)} m, cada ${r.tierra.separacion_m.toFixed(1)} m`} />
          <Caja label="A medir en la punta" valor={`${r.objetivo.volts.toLocaleString('es-AR')} V`}
            sub="con voltímetro, no con la cuenta" />
        </div>

        <p className="text-[10px] text-ink-700/70 leading-relaxed bg-bone-50 rounded-lg px-2.5 py-2">
          <b>Las dos fuentes publicadas no coinciden, y las dos tienen razón.</b> Por recorrido de
          cerco —hilos unidos en las puntas, que trabajan en paralelo— dan{' '}
          <b>{r.joules.cota_cerco_j.toFixed(1)} J</b>; por alambre energizado y fuga de vegetación
          dan <b>{r.joules.cota_alambre_j.toFixed(1)} J</b>. La primera mira la resistencia del
          conductor, la segunda la fuga: con el alambre limpio manda una y con pasto encima manda
          la otra. {r.joules.explicacion} Se recomienda la mayor.
        </p>

        <p className="text-[10px] text-ink-700/70 leading-relaxed">
          <b>El alambre pesa más que el equipo en una tirada larga.</b> Este alambre tiene{' '}
          {r.conductor.veces_referencia < 1.05
            ? 'la resistencia de referencia'
            : `${r.conductor.veces_referencia < 10
                ? r.conductor.veces_referencia.toFixed(1)
                : Math.round(r.conductor.veces_referencia)} veces la resistencia`}{' '}
          del calibre 12,5 que la fuente recomienda para alambrado permanente. Con{' '}
          {r.conductor.alambre_total_m.toLocaleString('es-AR')} m de alambre energizado, el
          circuito queda en <b>{r.conductor.resistencia_ohm.toFixed(0)} Ω</b>.
        </p>

        <p className="text-[10px] text-ink-700/70 leading-relaxed">{r.a_medir}</p>

        <p className="text-[10px] text-ink-700/70 leading-relaxed bg-bone-50 rounded-lg px-2.5 py-2">
          <b>El ensayo de la tierra</b>, que es la única verificación publicada que existe y la
          que casi nadie hace: {r.tierra.ensayo}
        </p>

        {r.avisos.map((a, i) => (
          <p key={i} className="text-[10px] text-ink-700/70 leading-relaxed flex gap-1.5">
            <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />{a}
          </p>
        ))}

        <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
          Voltaje en la punta, salida mínima bajo carga y mínimo de varillas: {FUENTE_NRCS_382}.
          Resistencia por calibre, regla de varilla por joule y ensayo de la tierra:{' '}
          {FUENTE_KURTZ_FREY}. Las dos lecturas sobre los hilos: {FUENTE_BOOHER} y{' '}
          {FUENTE_ONTARIO}. El equipo tiene que entregar al menos{' '}
          {r.salida_min_bajo_carga_v.toLocaleString('es-AR')} V con el alambrado cargado, y los
          aisladores aguantar 10.000 V.
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

function Caja({ label, valor, sub, fuerte }: {
  label: string; valor: string; sub: string; fuerte?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 ${fuerte ? 'bg-moss-700 border-moss-700 text-bone-50' : 'bg-white border-bone-200 text-ink-900'}`}>
      <p className="text-[10px] opacity-70 mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{valor}</p>
      <p className="text-[9px] opacity-70 mt-0.5 leading-tight">{sub}</p>
    </div>
  );
}
