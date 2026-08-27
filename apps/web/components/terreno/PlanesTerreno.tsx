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
        <div className="inline-flex rounded-full border border-[#E8D5A3]/60 p-1 bg-[#F5F0E8]">
          {(['ARS', 'USD'] as Moneda[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMoneda(m)}
              className={`font-sans text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-colors ${
                moneda === m ? 'bg-[#1A1210] text-[#F5F0E8]' : 'text-[#3D2010]/70 hover:text-[#1A1210]'
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
            className={`font-sans text-sm font-semibold transition-colors ${!anual ? 'text-[#1A1210]' : 'text-[#3D2010]/60 hover:text-[#3D2010]'}`}
          >
            Mensual
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={anual}
            onClick={() => setAnual(!anual)}
            className="relative w-14 h-7 rounded-full bg-[#2E6B8A]/20 transition-colors"
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-[#2E6B8A] transition-all ${anual ? 'left-8' : 'left-1'}`} />
          </button>
          <span className="flex items-center gap-2">
            <span className={`font-sans text-sm font-semibold transition-colors ${anual ? 'text-[#1A1210]' : 'text-[#3D2010]/60 hover:text-[#3D2010]'}`}>
              Anual
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-[#2E6B8A] bg-[#2E6B8A]/10 px-2 py-0.5 rounded-full">
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

      <p className="text-center font-sans text-xs text-[#3D2010]/60 mt-8 max-w-2xl mx-auto">
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
          ? 'bg-[#1A1210] border-[#1A1210] text-[#F5F0E8] lg:-mt-4 lg:mb-4 shadow-xl shadow-[#1A1210]/20'
          : 'bg-[#F5F0E8] border-[#E8D5A3]/60 text-[#1A1210]'
      }`}
    >
      {plan.destacado && (
        <span className="absolute -top-3 left-6 font-sans text-[11px] font-bold uppercase tracking-widest bg-[#2E6B8A] text-[#F5F0E8] px-3 py-1">
          El más elegido
        </span>
      )}

      <h3 className="font-display text-2xl">{plan.nombre}</h3>
      <p className={`font-sans text-sm mt-1.5 min-h-[2.5rem] ${plan.destacado ? 'text-[#E8D5A3]' : 'text-[#3D2010]'}`}>
        {plan.tagline}
      </p>

      {/* Precio */}
      <div className="mt-5 mb-2 flex items-end gap-1.5 flex-wrap">
        {gratis ? (
          <span className="font-display text-3xl">Gratis</span>
        ) : (
          <>
            <span className="font-display text-3xl font-mono">{fmt(usd!, moneda)}</span>
            <span className={`font-sans text-sm mb-1 ${plan.destacado ? 'text-[#E8D5A3]' : 'text-[#3D2010]/60'}`}>{periodo}</span>
          </>
        )}
      </div>
      {!gratis && plan.lanzamiento && (
        <p className={`font-sans text-[11px] font-bold uppercase tracking-wide ${plan.destacado ? 'text-[#7FB2CC]' : 'text-[#2E6B8A]'}`}>
          Precio de lanzamiento
        </p>
      )}
      {!gratis && anual && (
        <p className={`font-sans text-xs mt-1 font-mono ${plan.destacado ? 'text-[#E8D5A3]/80' : 'text-[#3D2010]/60'}`}>
          Equivale a {fmt(Math.round((plan.precioAnualUSD! / 12) * 10) / 10, moneda)}/mes
        </p>
      )}

      {/* CTA */}
      <a
        href={pagoHref}
        className={`mt-5 inline-flex justify-center text-center font-sans font-bold text-[13px] uppercase tracking-wide px-5 py-3.5 transition-colors ${
          plan.destacado
            ? 'bg-[#2E6B8A] text-[#F5F0E8] hover:bg-[#4A6741]'
            : 'bg-[#1A1210] text-[#F5F0E8] hover:bg-[#4A6741]'
        }`}
      >
        {pagoLabel}
      </a>
      {!gratis && (
        <p className={`font-sans text-[11px] mt-2 text-center ${plan.destacado ? 'text-[#E8D5A3]/70' : 'text-[#3D2010]/55'}`}>
          Renovación automática · cancelás cuando quieras.
        </p>
      )}

      {/* Incluye */}
      <div className="mt-6">
        {plan.hereda && (
          <p className={`font-sans text-sm font-semibold mb-3 ${plan.destacado ? 'text-[#F5F0E8]/90' : 'text-[#1A1210]'}`}>
            {plan.hereda}
          </p>
        )}
        <ul className="flex flex-col gap-2.5">
          {plan.incluye.map(item => (
            <li key={item} className="flex gap-2.5">
              <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.destacado ? 'text-[#7FB2CC]' : 'text-[#5A8A5E]'}`} />
              <span className={`font-sans text-[13px] leading-snug ${plan.destacado ? 'text-[#F5F0E8]/90' : 'text-[#3D2010]'}`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
