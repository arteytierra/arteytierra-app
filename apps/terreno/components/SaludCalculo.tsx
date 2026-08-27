'use client';

import { useState } from 'react';
import { ShieldCheck, TriangleAlert, OctagonAlert, ChevronDown } from 'lucide-react';
import type { Confianza, NivelAviso } from '@/lib/hidrologiaPredio';

/**
 * Salud del cálculo (H2).
 *
 * El patrón que InfoDrainage llama "health check" y que acá no existía: la app
 * siempre devuelve un número, y hasta ahora no decía cuánto valía ese número.
 * Un swale dimensionado con la lluvia real de 40 años de serie y un swale
 * dimensionado con los 50 mm inventados por defecto se veían exactamente igual.
 *
 * Este bloque muestra qué datos entraron de verdad, qué se asumió y qué avisos
 * hay sobre la validez del método. Se estrena en Swales; el contrato es
 * `Confianza`, así que replicarlo a Cuenca, Represa y Erosión es pasarle otro
 * objeto.
 */

const ESTILO: Record<Confianza['nivel'], {
  label: string; borde: string; fondo: string; texto: string; Icono: typeof ShieldCheck;
}> = {
  alta:  { label: 'Confianza alta',  borde: 'border-teal-200',  fondo: 'bg-teal-50/60',  texto: 'text-teal-800',  Icono: ShieldCheck },
  media: { label: 'Confianza media', borde: 'border-amber-200', fondo: 'bg-amber-50/60', texto: 'text-amber-800', Icono: TriangleAlert },
  baja:  { label: 'Confianza baja',  borde: 'border-orange-300', fondo: 'bg-orange-50/70', texto: 'text-orange-800', Icono: OctagonAlert },
};

const ICONO_AVISO: Record<NivelAviso, { Icono: typeof ShieldCheck; color: string }> = {
  ok:     { Icono: ShieldCheck,  color: 'text-teal-600' },
  aviso:  { Icono: TriangleAlert, color: 'text-amber-600' },
  alerta: { Icono: OctagonAlert,  color: 'text-orange-600' },
};

export function SaludCalculo({ confianza, titulo = 'Salud del cálculo' }: {
  confianza: Confianza;
  titulo?: string;
}) {
  const [abierto, setAbierto] = useState(confianza.nivel !== 'alta');
  const est = ESTILO[confianza.nivel];
  const { Icono } = est;

  const pendientes = confianza.avisos.filter(a => a.nivel !== 'ok').length;

  return (
    <div className={`rounded-lg border ${est.borde} ${est.fondo} overflow-hidden`}>
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        aria-expanded={abierto}
      >
        <Icono className={`w-3.5 h-3.5 shrink-0 ${est.texto}`} />
        <span className={`text-[11px] font-semibold ${est.texto}`}>{est.label}</span>
        <span className="text-[10px] text-ink-700/55 ml-auto mr-1">
          {pendientes === 0 ? 'sin observaciones' : `${pendientes} ${pendientes === 1 ? 'observación' : 'observaciones'}`}
        </span>
        <ChevronDown className={`w-3 h-3 text-ink-700/45 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="px-3 pb-3 space-y-2">
          <Fuentes fuentes={confianza.fuentes} />
          <p className="text-[9px] uppercase tracking-wide text-ink-700/45 font-semibold pt-0.5">{titulo}</p>
          <ul className="space-y-1.5">
            {confianza.avisos.map(a => {
              const { Icono: I, color } = ICONO_AVISO[a.nivel];
              return (
                <li key={a.id} className="flex gap-1.5">
                  <I className={`w-3 h-3 shrink-0 mt-[2px] ${color}`} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-ink-900 leading-snug">{a.titulo}</p>
                    <p className="text-[9px] text-ink-700/65 leading-snug mt-0.5">{a.detalle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Fuentes({ fuentes }: { fuentes: Confianza['fuentes'] }) {
  const items: Array<[string, boolean]> = [
    ['Suelo', fuentes.suelo],
    ['Cobertura', fuentes.cobertura],
    ['Clima', fuentes.clima],
  ];
  return (
    <div className="flex gap-1.5">
      {items.map(([nombre, ok]) => (
        <span
          key={nombre}
          title={ok ? `${nombre}: dato del predio` : `${nombre}: sin cargar, se asumió un valor neutro`}
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
            ok ? 'bg-teal-100 text-teal-800' : 'bg-bone-200 text-ink-700/50 line-through'
          }`}
        >
          {nombre}
        </span>
      ))}
    </div>
  );
}
