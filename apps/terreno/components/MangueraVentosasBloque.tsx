/**
 * Dos piezas que cuelgan de la misma traza de cañería: la manguera móvil y las
 * trampas de aire.
 *
 * Van juntas en un bloque porque comparten la fuente —la norma de cañerías de
 * riego del NRCS— y porque se leen una después de la otra: primero qué diámetro
 * llega, después dónde se va a tapar con aire.
 *
 * Ver `lib/manguera.ts` y `lib/ventosas.ts`.
 */
'use client';

import { useMemo, useState } from 'react';
import { Wind, Waves, TriangleAlert } from 'lucide-react';
import type { PuntoPerfilElevacion } from '@/lib/caminos';
import {
  dimensionarManguera, C_CATALOGO_PLASTICO, VEL_MAX_NRCS_MS, FUENTE_TAJRISHY,
} from '@/lib/manguera';
import {
  ventosasEnPerfil, PROMINENCIA_MIN_M, ESPACIADO_MAX_M, QUIEBRE_DESCENDENTE_GRADOS,
  ORIFICIO_CAV_MM, FUENTE_NRCS_430,
} from '@/lib/ventosas';

const ROTULO_MOTIVO: Record<string, string> = {
  punto_alto:          'Punto alto',
  quiebre_descendente: 'Quiebre hacia abajo',
  tramo_largo:         'Tramo largo',
  entrada:             'Entrada',
  extremo:             'Extremo',
};

export function MangueraVentosasBloque({ perfil, caudal_m3s, carga_origen_m }: {
  perfil:          readonly PuntoPerfilElevacion[];
  caudal_m3s:      number;
  carga_origen_m:  number;
}) {
  const [largo, setLargo] = useState('200');
  const [prom, setProm]   = useState(String(PROMINENCIA_MIN_M));

  const desnivel = useMemo(() => {
    if (perfil.length < 2) return 0;
    return perfil[perfil.length - 1]!.elevation - perfil[0]!.elevation;
  }, [perfil]);

  const mang = useMemo(() => dimensionarManguera({
    caudal_m3s,
    largo_m:            Math.max(1, Number(largo) || 200),
    carga_disponible_m: Math.max(0, carga_origen_m),
    desnivel_m:         desnivel,
    carga_min_punta_m:  2,
  }), [caudal_m3s, largo, carga_origen_m, desnivel]);

  const vent = useMemo(() => ventosasEnPerfil({
    perfil,
    prominencia_min_m: Math.max(0.05, Number(prom) || PROMINENCIA_MIN_M),
  }), [perfil, prom]);

  return (
    <div className="space-y-2">
      {/* ── Manguera móvil ──────────────────────────────────────────────── */}
      {caudal_m3s > 0 && (
        <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
          <summary className="px-3 py-2 text-[11px] font-medium text-ink-700 cursor-pointer select-none flex items-center gap-1.5 hover:bg-bone-50">
            <Waves className="w-3 h-3 text-[#1565C0]" />
            Si el tramo final es manguera móvil
          </summary>
          <div className="px-3 pb-3 space-y-2">
            <p className="text-[10px] text-ink-700/70 leading-relaxed">
              Una manguera no es un caño nuevo de catálogo. El único ensayo publicado que la midió
              da un coeficiente de rugosidad más desfavorable que el del caño, y la diferencia no
              es menor: la fórmula va a la potencia 1,852, así que pasar de{' '}
              {C_CATALOGO_PLASTICO} a 135 es un <b>21 % más de pérdida</b> sobre la misma
              manguera. Y el error está del lado peligroso: el número de catálogo hace parecer
              suficiente una manguera que no alcanza.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-ink-700/60 block">Largo de la manguera (m)</label>
              <input type="number" min={1} step={10} value={largo} onChange={e => setLargo(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
            </div>

            {mang.elegida ? (
              <div className="grid grid-cols-3 gap-2">
                <Caja label="Diámetro" valor={mang.elegida.diametro.pulgadas}
                  sub={`${mang.elegida.diametro.interior_mm} mm interior`} fuerte />
                <Caja label="Pierde" valor={`${mang.elegida.perdida.perdida_m.toFixed(1)} m`}
                  sub={`con el caño de catálogo daría ${mang.elegida.perdida.perdida_catalogo_m.toFixed(1)} m`} />
                <Caja label="Queda en la punta" valor={`${mang.elegida.carga_final_m.toFixed(1)} m`}
                  sub={`a ${mang.elegida.perdida.velocidad_ms.toFixed(2)} m/s · techo ${VEL_MAX_NRCS_MS.toFixed(2)}`} />
              </div>
            ) : (
              <p className="text-[10px] text-ink-700/70 bg-amber-50 rounded-lg px-2.5 py-2 leading-relaxed">
                Con esa carga y ese largo no llega ningún diámetro de la serie.
              </p>
            )}

            {mang.avisos.map((a, i) => (
              <p key={i} className="text-[10px] text-ink-700/70 leading-relaxed flex gap-1.5">
                <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />{a}
              </p>
            ))}

            <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
              {FUENTE_TAJRISHY}. El ensayo midió 76 y 102 mm: para una manguera más fina acequia
              usa el más desfavorable de los dos en vez de extrapolar un valor que nadie midió.
              Los límites de velocidad y de presión de trabajo son de {FUENTE_NRCS_430}.
            </p>
          </div>
        </details>
      )}

      {/* ── Trampas de aire ─────────────────────────────────────────────── */}
      {perfil.length >= 3 && (
        <details className="bg-white rounded-xl border border-bone-200 overflow-hidden">
          <summary className="px-3 py-2 text-[11px] font-medium text-ink-700 cursor-pointer select-none flex items-center gap-1.5 hover:bg-bone-50">
            <Wind className="w-3 h-3 text-moss-700" />
            Trampas de aire: {vent.puntos.length} {vent.puntos.length === 1 ? 'ventosa' : 'ventosas'} sobre esta traza
          </summary>
          <div className="px-3 pb-3 space-y-2">
            <p className="text-[10px] text-ink-700/70 leading-relaxed">
              Una cañería que sube y baja junta aire en los puntos altos, y una burbuja atrapada
              estrangula la sección: la línea pierde caudal sin que se rompa nada y sin que haya
              nada que ver. Es la falla más difícil de encontrar de una red rural, porque el
              síntoma es «llega menos que antes» y la causa está enterrada en una loma. La norma
              da tres criterios geométricos y acequia los aplica sobre este perfil.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-ink-700/60 block">
                Prominencia mínima para contar como punto alto (m)
              </label>
              <input type="number" min={0.05} step={0.1} value={prom} onChange={e => setProm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-bone-200 bg-white" />
              <p className="text-[9px] text-ink-700/45 leading-relaxed">
                Este umbral es de acequia, no de la norma: la norma dice «todos los puntos altos»
                porque quien la escribió tenía un plano, no un modelo de elevación con ruido. Con
                un DEM de 30 m, bajarlo mucho marca ventosas que no existen; con un DEM de dron se
                puede bajar.
              </p>
            </div>

            <div className="rounded-xl border border-bone-200 overflow-hidden">
              {vent.puntos.map((q, i) => (
                <div key={i} className={`px-2.5 py-1.5 text-[10px] flex items-baseline gap-2 ${i % 2 ? 'bg-bone-50' : 'bg-white'}`}>
                  <span className="font-mono text-ink-900 tabular-nums w-16 shrink-0">
                    {Math.round(q.distancia_m)} m
                  </span>
                  <span className="font-medium text-moss-800 w-10 shrink-0">{q.tipo}</span>
                  <span className="text-ink-700/75 leading-snug">
                    <b>{ROTULO_MOTIVO[q.motivo] ?? q.motivo}</b> — {q.detalle}
                  </span>
                </div>
              ))}
            </div>

            {vent.avisos.map((a, i) => (
              <p key={i} className="text-[10px] text-ink-700/70 leading-relaxed flex gap-1.5">
                <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />{a}
              </p>
            ))}

            <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
              {FUENTE_NRCS_430}: ventosa en todos los puntos altos; una cada{' '}
              {Math.round(ESPACIADO_MAX_M)} m (2.500 pies) en tramos parejos; y de doble efecto en
              los quiebres hacia abajo de más de {QUIEBRE_DESCENDENTE_GRADOS}°. El orificio de
              purga continua va de {ORIFICIO_CAV_MM[0]} a {ORIFICIO_CAV_MM[1]} mm. <b>CAV</b> purga
              aire con la línea en presión, <b>AVR</b> lo saca al llenar y lo deja entrar al
              vaciar. Si en un punto alto ya hay un bebedero o un hidrante, la salida ventea y la
              norma no pide ventosa. El perfil es el del terreno: la cañería se supone enterrada a
              tapada constante.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}

function Caja({ label, valor, sub, fuerte }: {
  label: string; valor: string; sub: string; fuerte?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 ${fuerte ? 'bg-[#1565C0] border-[#1565C0] text-bone-50' : 'bg-white border-bone-200 text-ink-900'}`}>
      <p className="text-[10px] opacity-70 mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{valor}</p>
      <p className="text-[9px] opacity-70 mt-0.5 leading-tight">{sub}</p>
    </div>
  );
}
