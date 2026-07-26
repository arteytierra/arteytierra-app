'use client';

/**
 * Candado de feature. Se muestra en lugar del panel cuando el plan del usuario
 * no alcanza. Principio: NUNCA ocultar la feature — mostrarla con candado y un
 * preview borroso del resultado real, para que el free vea el wow y lo desee.
 *
 * El preview real (captura de la herramienta) se pasa por `previewSrc`; si no
 * hay, cae a un placeholder decorativo borroso (nada de imágenes rotas).
 */
import { useEffect } from 'react';
import Image from 'next/image';
import { Lock, ArrowRight } from 'lucide-react';
import { NOMBRE_PLAN, planMinimo, type Feature, type Plan } from '@/lib/entitlements';
import { registrarCandado } from '@/lib/telemetria';


interface Props {
  feature:    Feature;
  plan:       Plan;          // plan actual del usuario (para la telemetría)
  titulo:     string;        // nombre de la herramienta ("Análisis hídrico")
  beneficio:  string;        // una línea de qué desbloquea
  previewSrc?: string;       // captura real del resultado (opcional)
}

export function FeatureLock({ feature, plan, titulo, beneficio, previewSrc }: Props) {
  const min = planMinimo(feature);

  useEffect(() => {
    // Un intento por montaje del candado (abrir el tab bloqueado).
    registrarCandado(feature, plan, 'intento');
  }, [feature, plan]);

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Preview borroso del resultado real */}
      <div className="relative rounded-xl overflow-hidden border border-bone-200 bg-bone-50 aspect-[4/3]">
        {previewSrc ? (
          <Image src={previewSrc} alt="" fill sizes="304px"
            className="object-cover blur-[6px] scale-105 select-none pointer-events-none" />
        ) : (
          <div className="absolute inset-0 blur-[6px] scale-105 opacity-70"
            style={{ background: 'linear-gradient(135deg,#2E6B8A33,#4A674144,#C17F3A33), repeating-linear-gradient(45deg,#0000,#0000 10px,#0001 10px,#0001 20px)' }} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/85 backdrop-blur flex items-center justify-center shadow-paper">
            <Lock className="w-5 h-5 text-ink-900/70" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-ink-900">{titulo}</p>
        <p className="text-xs text-ink-700/70 leading-relaxed">{beneficio}</p>
      </div>

      <a
        href={`/suscribir?plan=${min}&periodo=anual`}
        onClick={() => registrarCandado(feature, plan, 'cta_click')}
        className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium bg-water-500 text-bone-50 rounded-lg px-3 py-2.5 hover:brightness-95 transition-all"
      >
        Desbloqueá con {NOMBRE_PLAN[min]}
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
      <p className="text-[10px] text-center text-ink-700/45">
        Tu plan actual es {NOMBRE_PLAN[plan]}.
      </p>
    </div>
  );
}
