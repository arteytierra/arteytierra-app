'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANES, REGISTRO_URL, type Plan } from '@/lib/terreno/planes';

export function PlanesTerreno() {
  const [anual, setAnual] = useState(true);

  return (
    <div>
      {/* Toggle mensual / anual */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          type="button"
          onClick={() => setAnual(false)}
          className={`font-sans text-sm font-semibold transition-colors ${!anual ? 'text-ink-950' : 'text-ink-700/60 hover:text-ink-700'}`}
        >
          Mensual
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={anual}
          onClick={() => setAnual(!anual)}
          className="relative w-14 h-7 rounded-full bg-water-500/20 transition-colors"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-water-500 transition-all ${anual ? 'left-8' : 'left-1'}`}
          />
        </button>
        <span className="flex items-center gap-2">
          <span className={`font-sans text-sm font-semibold transition-colors ${anual ? 'text-ink-950' : 'text-ink-700/60 hover:text-ink-700'}`}>
            Anual
          </span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-water-500 bg-water-500/10 px-2 py-0.5 rounded-full">
            2 meses gratis
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {PLANES.map(plan => (
          <PlanCard key={plan.id} plan={plan} anual={anual} />
        ))}
      </div>

      <p className="text-center font-sans text-xs text-ink-700/60 mt-8">
        Precios en USD. Se abona en moneda local al cambio del día (Mercado Pago en Argentina, tarjeta internacional en el resto).
      </p>
    </div>
  );
}

function PlanCard({ plan, anual }: { plan: Plan; anual: boolean }) {
  const gratis = plan.precioMensualUSD == null;
  const precio = anual ? plan.precioAnualUSD : plan.precioMensualUSD;
  const periodo = anual ? '/año' : '/mes';

  return (
    <div
      className={`relative flex flex-col h-full p-8 border ${
        plan.destacado
          ? 'bg-ink-950 border-ink-950 text-bone-50 lg:-mt-4 lg:mb-4 shadow-xl shadow-ink-950/20'
          : 'bg-bone-50 border-bone-200 text-ink-950'
      }`}
    >
      {plan.destacado && (
        <span className="absolute -top-3 left-8 font-sans text-[11px] font-bold uppercase tracking-widest bg-water-500 text-bone-50 px-3 py-1">
          El más elegido
        </span>
      )}

      <h3 className="font-display text-2xl">{plan.nombre}</h3>
      <p className={`font-sans text-sm mt-1.5 ${plan.destacado ? 'text-bone-200' : 'text-ink-700'}`}>
        {plan.tagline}
      </p>

      {/* Precio */}
      <div className="mt-6 mb-2 flex items-end gap-1.5">
        {gratis ? (
          <span className="font-display text-4xl">Gratis</span>
        ) : (
          <>
            <span className="font-display text-4xl">USD {precio}</span>
            <span className={`font-sans text-sm mb-1.5 ${plan.destacado ? 'text-bone-200' : 'text-ink-700/60'}`}>{periodo}</span>
          </>
        )}
      </div>
      {!gratis && plan.lanzamiento && (
        <p className={`font-sans text-[11px] font-bold uppercase tracking-wide ${plan.destacado ? 'text-water-300' : 'text-water-500'}`}>
          Precio de lanzamiento
        </p>
      )}
      {!gratis && anual && (
        <p className={`font-sans text-xs mt-1 ${plan.destacado ? 'text-bone-200/80' : 'text-ink-700/60'}`}>
          Equivale a USD {Math.round((plan.precioAnualUSD! / 12) * 10) / 10}/mes
        </p>
      )}

      {/* CTA */}
      <a
        href={REGISTRO_URL}
        className={`mt-6 mb-7 inline-flex justify-center font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 transition-colors ${
          plan.destacado
            ? 'bg-water-500 text-bone-50 hover:bg-moss-700'
            : 'bg-ink-950 text-bone-50 hover:bg-moss-700'
        }`}
      >
        {plan.cta}
      </a>

      {/* Incluye */}
      {plan.hereda && (
        <p className={`font-sans text-sm font-semibold mb-3 ${plan.destacado ? 'text-bone-100' : 'text-ink-950'}`}>
          {plan.hereda}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {plan.incluye.map(item => (
          <li key={item} className="flex gap-2.5">
            <Check size={17} className={`mt-0.5 flex-shrink-0 ${plan.destacado ? 'text-water-300' : 'text-moss-700'}`} />
            <span className={`font-sans text-sm leading-snug ${plan.destacado ? 'text-bone-100' : 'text-ink-700'}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
