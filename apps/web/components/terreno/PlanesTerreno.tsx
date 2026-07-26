'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANES, REGISTRO_URL, ARS_POR_USD, type Plan } from '@/lib/terreno/planes';

const SUSCRIBIR_BASE = 'https://terreno.arteytierra.org/suscribir';

type Moneda = 'ARS' | 'USD';

function fmt(usd: number, moneda: Moneda): string {
  return moneda === 'ARS'
    ? `AR$ ${Math.round(usd * ARS_POR_USD).toLocaleString('es-AR')}`
    : `USD ${usd}`;
}

export function PlanesTerreno({ paisInicial }: { paisInicial?: string }) {
  const [anual, setAnual] = useState(true);
  const [moneda, setMoneda] = useState<Moneda>(paisInicial === 'AR' ? 'ARS' : 'USD');

  return (
    <div>
      {/* Controles: moneda + periodo */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="inline-flex rounded-full border border-bone-200 p-1 bg-bone-50">
          {(['ARS', 'USD'] as Moneda[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMoneda(m)}
              className={`font-sans text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-colors ${
                moneda === m ? 'bg-ink-950 text-bone-50' : 'text-ink-700/70 hover:text-ink-950'
              }`}
            >
              {m === 'ARS' ? 'AR$ Argentina' : 'USD Internacional'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
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
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-water-500 transition-all ${anual ? 'left-8' : 'left-1'}`} />
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
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {PLANES.map(plan => (
          <PlanCard key={plan.id} plan={plan} anual={anual} moneda={moneda} />
        ))}
      </div>

      <p className="text-center font-sans text-xs text-ink-700/60 mt-8 max-w-2xl mx-auto">
        {moneda === 'ARS'
          ? `Precios en pesos a ${ARS_POR_USD} $/USD. Pagás por Mercado Pago con renovación automática; cancelás cuando quieras.`
          : 'Precios en USD. Pagás por PayPal con renovación automática; cancelás cuando quieras.'}
      </p>
    </div>
  );
}

function PlanCard({ plan, anual, moneda }: { plan: Plan; anual: boolean; moneda: Moneda }) {
  const gratis = plan.precioMensualUSD == null;
  const usd = anual ? plan.precioAnualUSD : plan.precioMensualUSD;
  const periodo = anual ? '/año' : '/mes';

  const proveedor = moneda === 'ARS' ? 'mercadopago' : 'paypal';
  const pagoHref = gratis
    ? REGISTRO_URL
    : `${SUSCRIBIR_BASE}?plan=${plan.id}&periodo=${anual ? 'anual' : 'mensual'}&pago=${proveedor}`;
  const pagoLabel = gratis ? 'Empezá gratis' : 'Suscribirme';

  return (
    <div
      className={`relative flex flex-col h-full p-6 border ${
        plan.destacado
          ? 'bg-ink-950 border-ink-950 text-bone-50 lg:-mt-4 lg:mb-4 shadow-xl shadow-ink-950/20'
          : 'bg-bone-50 border-bone-200 text-ink-950'
      }`}
    >
      {plan.destacado && (
        <span className="absolute -top-3 left-6 font-sans text-[11px] font-bold uppercase tracking-widest bg-water-500 text-bone-50 px-3 py-1">
          El más elegido
        </span>
      )}

      <h3 className="font-display text-2xl">{plan.nombre}</h3>
      <p className={`font-sans text-sm mt-1.5 min-h-[2.5rem] ${plan.destacado ? 'text-bone-200' : 'text-ink-700'}`}>
        {plan.tagline}
      </p>

      {/* Precio */}
      <div className="mt-5 mb-2 flex items-end gap-1.5 flex-wrap">
        {gratis ? (
          <span className="font-display text-3xl">Gratis</span>
        ) : (
          <>
            <span className="font-display text-3xl">{fmt(usd!, moneda)}</span>
            <span className={`font-sans text-sm mb-1 ${plan.destacado ? 'text-bone-200' : 'text-ink-700/60'}`}>{periodo}</span>
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
          Equivale a {fmt(Math.round((plan.precioAnualUSD! / 12) * 10) / 10, moneda)}/mes
        </p>
      )}

      {/* CTA */}
      <a
        href={pagoHref}
        className={`mt-5 inline-flex justify-center text-center font-sans font-bold text-[13px] uppercase tracking-wide px-5 py-3.5 transition-colors ${
          plan.destacado
            ? 'bg-water-500 text-bone-50 hover:bg-moss-700'
            : 'bg-ink-950 text-bone-50 hover:bg-moss-700'
        }`}
      >
        {pagoLabel}
      </a>
      {!gratis && (
        <p className={`font-sans text-[11px] mt-2 text-center ${plan.destacado ? 'text-bone-200/70' : 'text-ink-700/55'}`}>
          Renovación automática · cancelás cuando quieras.
        </p>
      )}

      {/* Incluye */}
      <div className="mt-6">
        {plan.hereda && (
          <p className={`font-sans text-sm font-semibold mb-3 ${plan.destacado ? 'text-bone-100' : 'text-ink-950'}`}>
            {plan.hereda}
          </p>
        )}
        <ul className="flex flex-col gap-2.5">
          {plan.incluye.map(item => (
            <li key={item} className="flex gap-2.5">
              <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.destacado ? 'text-water-300' : 'text-moss-700'}`} />
              <span className={`font-sans text-[13px] leading-snug ${plan.destacado ? 'text-bone-100' : 'text-ink-700'}`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
