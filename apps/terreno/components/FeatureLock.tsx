'use client';

/**
 * Candado de feature. Se muestra en lugar del panel cuando el plan del usuario
 * no alcanza. Principio: NUNCA ocultar la feature — mostrarla con un preview
 * borroso del resultado real, para que el free vea el wow y lo desee.
 *
 * Si hay una captura real se pasa por `previewSrc`; si no, se dibuja un mock
 * vectorial —por familia de feature y en colores de marca— que se parece al
 * output real (curvas de nivel, arco solar, cuenca, zonas…), nunca una caja
 * gris vacía.
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
      {/* Preview borroso del resultado (captura real o mock de marca) */}
      <div className="relative rounded-xl overflow-hidden border border-bone-200 bg-bone-50 aspect-[4/3]">
        {previewSrc ? (
          <Image src={previewSrc} alt="" fill sizes="304px"
            className="object-cover blur-[6px] scale-105 select-none pointer-events-none" />
        ) : (
          <div className="absolute inset-0 blur-[5px] scale-105 select-none pointer-events-none">
            <MockResultado tipo={mockDeFeature(feature)} />
          </div>
        )}
        <div className="absolute inset-0 bg-ink-900/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/85 backdrop-blur flex items-center justify-center shadow-paper">
            <Lock className="w-5 h-5 text-ink-900/70" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-ink-900 font-display">{titulo}</p>
        <p className="text-xs text-ink-700/70 leading-relaxed">{beneficio}</p>
      </div>

      <a
        href={`/suscribir?plan=${min}&periodo=anual`}
        onClick={() => registrarCandado(feature, plan, 'cta_click')}
        className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium bg-sun-500 text-ink-900 rounded-lg px-3 py-2.5 hover:brightness-95 transition-all"
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

// ─── Mocks de resultado por familia de feature ──────────────────────────────

type TipoMock = 'relieve' | 'agua' | 'sol' | 'zonas' | 'vida' | 'keyline' | 'negocio' | 'catastro' | 'entrega';

function mockDeFeature(f: Feature): TipoMock {
  if (f === 'catastro.rumbos') return 'catastro';
  if (f === 'diseno.keyline') return 'keyline';
  if (f === 'diseno.zonas' || f === 'diseno.sectores' || f === 'diseno.pastoreo' || f === 'diseno.caminos') return 'zonas';
  if (f === 'analisis.solar' || f === 'analisis.sombras' || f === 'analisis.visibilidad') return 'sol';
  if (f === 'analisis.contexto' || f === 'analisis.entorno' || f === 'analisis.carbono') return 'vida';
  if (f === 'analisis.produccion' || f === 'diseno.economia' || f === 'analisis.clima') return 'negocio';
  if (f.startsWith('informe') || f.startsWith('export') || f === 'colaboracion') return 'entrega';
  if (f === 'analisis.hidrico' || f === 'diseno.agua' || f === 'diseno.cuenca' || f === 'diseno.red' || f === 'diseno.riego' || f === 'diseno.aguadas') return 'agua';
  // topo, suelo, cobertura, aptitud
  return 'relieve';
}

const C = { moss: '#4A6741', water: '#2E6B8A', sun: '#D9A441', clay: '#C17F3A', bone: '#FBF8F3', ink: '#2A2622' };

function MockResultado({ tipo }: { tipo: TipoMock }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {tipo === 'relieve' && (
        <>
          <defs>
            <linearGradient id="hip" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor={C.water} /><stop offset="0.5" stopColor={C.moss} /><stop offset="1" stopColor={C.sun} />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#hip)" opacity="0.85" />
          {[0, 1, 2, 3, 4].map(i => (
            <ellipse key={i} cx={210} cy={150} rx={40 + i * 44} ry={26 + i * 30} fill="none" stroke={C.bone} strokeWidth="2.5" opacity="0.75" />
          ))}
        </>
      )}
      {tipo === 'agua' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          {[0, 1, 2, 3, 4].map(i => (
            <path key={i} d={`M ${20 + i * 20} 10 C ${60 + i * 18} 110, ${140 + i * 10} 150, 200 240`} fill="none" stroke={C.water} strokeWidth="3" opacity="0.55" />
          ))}
          <ellipse cx="205" cy="250" rx="70" ry="26" fill={C.water} opacity="0.85" />
          <ellipse cx="205" cy="250" rx="46" ry="15" fill={C.bone} opacity="0.35" />
        </>
      )}
      {tipo === 'sol' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          <rect y="220" width="400" height="80" fill={C.moss} opacity="0.35" />
          <circle cx="200" cy="120" r="26" fill={C.sun} />
          {[{ c: '#FF5722', r: 150 }, { c: C.sun, r: 110 }, { c: C.water, r: 72 }].map((a, i) => (
            <path key={i} d={`M ${200 - a.r} 220 A ${a.r} ${a.r} 0 0 1 ${200 + a.r} 220`} fill="none" stroke={a.c} strokeWidth="3" strokeDasharray="7 5" opacity="0.8" />
          ))}
        </>
      )}
      {tipo === 'zonas' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          <polygon points="30,40 170,20 200,130 60,160" fill={C.moss} opacity="0.55" />
          <polygon points="210,30 380,60 350,170 230,150" fill={C.sun} opacity="0.5" />
          <polygon points="70,180 220,170 260,280 40,270" fill={C.water} opacity="0.5" />
          <polygon points="270,180 380,190 370,285 250,285" fill={C.clay} opacity="0.5" />
        </>
      )}
      {tipo === 'vida' && (
        <>
          <rect width="400" height="300" fill={C.moss} opacity="0.3" />
          {Array.from({ length: 42 }).map((_, i) => {
            const x = (i * 97) % 390 + 8, y = (i * 53) % 285 + 8, r = 3 + (i % 5) * 2;
            const cols = [C.moss, C.sun, C.water, C.clay];
            return <circle key={i} cx={x} cy={y} r={r} fill={cols[i % 4]} opacity="0.8" />;
          })}
        </>
      )}
      {tipo === 'keyline' && (
        <>
          <rect width="400" height="300" fill={C.moss} opacity="0.28" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <path key={i} d={`M -10 ${30 + i * 42} Q 200 ${-10 + i * 42}, 410 ${30 + i * 42}`} fill="none" stroke={C.clay} strokeWidth="2.5" opacity="0.75" />
          ))}
        </>
      )}
      {tipo === 'negocio' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          {[120, 190, 90, 230, 160, 260].map((h, i) => (
            <rect key={i} x={30 + i * 60} y={280 - h} width="40" height={h} rx="3" fill={[C.moss, C.water, C.sun, C.clay][i % 4]} opacity="0.8" />
          ))}
          <line x1="10" y1="280" x2="390" y2="280" stroke={C.ink} strokeWidth="2" opacity="0.4" />
        </>
      )}
      {tipo === 'catastro' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          <polygon points="80,60 320,90 300,240 60,210" fill={C.sun} opacity="0.18" stroke={C.sun} strokeWidth="3" />
          {[[80, 60, 320, 90], [320, 90, 300, 240], [300, 240, 60, 210], [60, 210, 80, 60]].map((s, i) => (
            <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={C.clay} strokeWidth="2" strokeDasharray="6 4" />
          ))}
          {[[80, 60], [320, 90], [300, 240], [60, 210]].map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="5" fill={C.moss} />
          ))}
        </>
      )}
      {tipo === 'entrega' && (
        <>
          <rect width="400" height="300" fill={C.bone} />
          <rect x="110" y="30" width="180" height="240" rx="6" fill="#fff" stroke={C.bone} strokeWidth="2" />
          <rect x="130" y="52" width="90" height="12" rx="3" fill={C.moss} opacity="0.8" />
          {[80, 104, 128, 152, 176, 200, 224].map((y, i) => (
            <rect key={i} x="130" y={y} width={i % 2 ? 120 : 140} height="7" rx="3" fill={C.ink} opacity="0.25" />
          ))}
        </>
      )}
    </svg>
  );
}
