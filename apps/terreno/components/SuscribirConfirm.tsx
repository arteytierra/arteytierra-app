'use client';

import { useState } from 'react';
import { CreditCard, Wallet, Loader2, ArrowLeft } from 'lucide-react';
import { iniciarCheckout, type PlanPago, type Periodo, type Proveedor } from '@/lib/suscribir';

const PRECIO_USD: Record<PlanPago, Record<Periodo, number>> = {
  personal:  { mensual: 7,  anual: 70 },
  disenador: { mensual: 12, anual: 120 },
  estudio:   { mensual: 35, anual: 350 },
};
const NOMBRE: Record<PlanPago, string> = { personal: 'Personal', disenador: 'Diseñador', estudio: 'Estudio' };
const ARS_POR_USD = 1500;

export function SuscribirConfirm({ plan, periodo }: { plan: PlanPago; periodo: Periodo }) {
  const [cargando, setCargando] = useState<Proveedor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usd = PRECIO_USD[plan][periodo];
  const ars = usd * ARS_POR_USD;
  const sufijo = periodo === 'anual' ? '/año' : '/mes';

  async function pagar(provider: Proveedor) {
    setError(null);
    setCargando(provider);
    try {
      await iniciarCheckout(plan, periodo, provider);
      // iniciarCheckout redirige; si volvemos acá es que algo falló sin throw.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos iniciar el pago.');
      setCargando(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">acequia · Suscripción</p>
          <h1 className="font-display text-2xl text-ink-950">Plan {NOMBRE[plan]}</h1>
          <p className="text-sm text-ink-700/70 mt-2">
            Facturación {periodo === 'anual' ? 'anual' : 'mensual'}
            {periodo === 'anual' && ' (2 meses gratis)'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper space-y-4">
          <div className="text-center pb-4 border-b border-bone-200">
            <p className="font-display text-3xl text-ink-950">USD {usd}<span className="text-base text-ink-700/50 font-sans">{sufijo}</span></p>
            <p className="text-xs text-ink-700/60 mt-1">o AR$ {ars.toLocaleString('es-AR')}{sufijo} desde Argentina</p>
          </div>

          <p className="text-xs text-ink-700/70 text-center">Elegí cómo pagar:</p>

          <button
            onClick={() => pagar('mercadopago')}
            disabled={cargando !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#009EE3] hover:brightness-95 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {cargando === 'mercadopago' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Mercado Pago · Argentina (AR$)
          </button>

          <button
            onClick={() => pagar('paypal')}
            disabled={cargando !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ink-950 hover:bg-moss-800 text-bone-50 font-medium rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {cargando === 'paypal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            PayPal · Internacional (USD)
          </button>

          {error && (
            <p className="text-sm text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">{error}</p>
          )}

          <p className="text-[10px] text-center text-ink-700/45 leading-relaxed">
            La renovación es automática. Podés cancelar cuando quieras; tu cuenta vuelve a Semilla y conservás tus proyectos.
          </p>
        </div>

        <a href="/canjear" className="mt-4 block text-center text-xs text-moss-700 hover:underline">
          ¿Tenés un código de invitación?
        </a>
        <a href="/mapa" className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-700/60 hover:text-moss-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al mapa
        </a>
      </div>
    </div>
  );
}
