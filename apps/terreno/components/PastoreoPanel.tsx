'use client';

/**
 * Pastoreo rotativo (C1) — diseño PRV / Voisin. Calcula el balance forrajero,
 * el número de potreros según el descanso estacional, el calendario de rotación
 * y la infraestructura (alambrado, postes, bebederos).
 */
import { useMemo, useState, useEffect } from 'react';
import { Beef, TriangleAlert, Fence, Droplet, Grid3x3, Eraser } from 'lucide-react';
import { calcularPastoreo, forrajePorLluvia, DESCANSO_DEFAULT, type ResultadoPastoreo } from '@/lib/pastoreo';
import { subdividirPotreros, type PotrerosLayout } from '@/lib/potreros';
import type { DatosClima } from '@/lib/clima';
import type { Mojon } from '@/lib/types';

interface Props {
  areaHa:     number;
  datosClima: DatosClima | null;
  mojones?:   Mojon[];
  tieneDibujo?: boolean;
  onDibujar?: (layout: PotrerosLayout | null) => void;
  onIrAClima: () => void;
}

export function PastoreoPanel({ areaHa, datosClima, mojones = [], tieneDibujo = false, onDibujar, onIrAClima }: Props) {
  const forrajeSugerido = datosClima ? forrajePorLluvia(datosClima.precip_anual_mm) : 3000;

  const [area,    setArea]    = useState(areaHa > 0 ? Math.round(areaHa * 10) / 10 : 50);
  const [animales, setAnimales] = useState(30);
  const [peso,    setPeso]    = useState(400);
  const [consumo, setConsumo] = useState(2.8);
  const [forraje, setForraje] = useState(forrajeSugerido);
  const [efic,    setEfic]    = useState(50);
  const [ocup,    setOcup]    = useState(3);

  useEffect(() => { if (areaHa > 0) setArea(Math.round(areaHa * 10) / 10); }, [areaHa]);
  useEffect(() => { setForraje(forrajeSugerido); }, [forrajeSugerido]);

  const res: ResultadoPastoreo | null = useMemo(() => calcularPastoreo({
    area_ha: area, n_animales: animales, peso_prom_kg: peso, consumo_pct_peso: consumo,
    prod_forraje_kg_ha: forraje, eficiencia: efic / 100, dias_ocupacion: ocup,
    descanso: DESCANSO_DEFAULT,
  }), [area, animales, peso, consumo, forraje, efic, ocup]);

  const balColor = !res ? 'ink' : res.balance_pct >= 130 ? 'verde' : res.balance_pct >= 100 ? 'amarillo' : 'rojo';

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Pastoreo rotativo (PRV / Voisin)
      </p>

      {/* Parámetros */}
      <div className="bg-white rounded-xl border border-bone-200 p-3 grid grid-cols-2 gap-2.5">
        <Campo label="Superficie (ha)"><Num v={area} set={setArea} step={1} /></Campo>
        <Campo label="Animales"><Num v={animales} set={setAnimales} step={5} /></Campo>
        <Campo label="Peso prom. (kg)"><Num v={peso} set={setPeso} step={20} /></Campo>
        <Campo label="Consumo (% peso)"><Num v={consumo} set={setConsumo} step={0.1} /></Campo>
        <Campo label="Forraje (kg MS/ha·año)"><Num v={forraje} set={setForraje} step={250} /></Campo>
        <Campo label="Aprovechamiento (%)"><Num v={efic} set={setEfic} step={5} /></Campo>
        <Campo label="Ocupación (días)"><Num v={ocup} set={setOcup} step={1} /></Campo>
      </div>
      {!datosClima && (
        <p className="text-[10px] text-ink-700/55 flex gap-1.5">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-sun-500" />
          Cargá el <button onClick={onIrAClima} className="underline text-moss-700">clima</button> para estimar el forraje según la lluvia. Mientras, editalo a mano.
        </p>
      )}

      {res && (
        <>
          {/* Balance + carga */}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Balance forrajero" value={`${res.balance_pct}%`} color={balColor}
              sub={res.balance_pct >= 100 ? 'oferta cubre demanda' : 'sobrepastoreo'} />
            <Stat label="Carga instantánea" value={`${res.carga_ins_ev_ha} EV/ha`} sub="en el potrero ocupado" />
            <Stat label="Potreros" value={String(res.n_potreros)} color="moss" sub="parcelas de rotación" />
            <Stat label="Área por potrero" value={`${res.area_potrero_ha} ha`} />
          </div>

          {/* Calendario de rotación */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs font-medium text-ink-700">Calendario de rotación</p>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {res.estaciones.map(e => (
                <div key={e.nombre} className="bg-bone-50 rounded-lg p-1.5">
                  <p className="text-[9px] text-ink-700/60">{e.nombre}</p>
                  <p className="font-mono text-xs font-bold text-moss-700">{e.ocupacion} d</p>
                  <p className="text-[8px] text-ink-700/50">ocup · desc {e.descanso}d</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-ink-700/55 leading-relaxed">
              Días de ocupación por potrero en cada estación (más cortos en primavera, más largos en invierno). Descanso = tiempo de rebrote.
            </p>
          </div>

          {/* Infraestructura */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Alambrado" value={`${res.alambrado_m.toLocaleString('es-AR')} m`} sub="subdivisión" icon="fence" />
            <Stat label="Postes" value={res.postes.toLocaleString('es-AR')} sub="~1 c/8 m" icon="fence" />
            <Stat label="Bebederos" value={String(res.bebederos)} sub={`${res.agua_l_dia.toLocaleString('es-AR')} L/día`} icon="water" />
          </div>

          {/* Dibujar sobre el mapa */}
          {onDibujar && mojones.length >= 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => onDibujar(subdividirPotreros(mojones, res.n_potreros, res.bebederos, 300))}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-moss-700 text-bone-50 rounded-lg px-3 py-2 hover:bg-moss-800 transition-colors">
                <Grid3x3 className="w-3.5 h-3.5" />
                {tieneDibujo ? 'Redibujar potreros' : 'Dibujar potreros en el mapa'}
              </button>
              {tieneDibujo && (
                <button
                  onClick={() => onDibujar(null)}
                  className="flex items-center justify-center gap-1 text-[11px] text-clay-700 bg-clay-100 border border-clay-200 rounded-lg px-3 py-2 hover:bg-clay-200 transition-colors">
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {onDibujar && mojones.length >= 3 && (
            <p className="text-[9px] text-ink-700/50 leading-relaxed -mt-2">
              Divide el predio en {res.n_potreros} parcelas de área ~igual y ubica los bebederos con su radio de cobertura (300 m). Esquema orientativo de planificación.
            </p>
          )}

          {/* Advertencias */}
          <div className={`rounded-xl border p-3 space-y-1.5 ${res.balance_pct < 100 ? 'bg-clay-100 border-clay-200' : 'bg-moss-50 border-moss-200'}`}>
            {res.advertencias.map((a, i) => (
              <p key={i} className={`text-[11px] flex gap-1.5 ${res.balance_pct < 100 ? 'text-clay-700' : 'text-moss-700'}`}>
                <span className="shrink-0 mt-0.5">→</span>{a}
              </p>
            ))}
          </div>

          <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
            PRV/Voisin · forraje estimado por lluvia (kg MS/ha·año) · alambrado y bebederos aproximados por área. Ajustá el descanso al rebrote real de tu pastura.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Internos ─────────────────────────────────────────────────────────────────

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-ink-700/60 block leading-tight">{label}</label>
      {children}
    </div>
  );
}

function Num({ v, set, step }: { v: number; set: (n: number) => void; step: number }) {
  return (
    <input type="number" value={v} min={0} step={step}
      onChange={e => { const n = parseFloat(e.target.value); if (Number.isFinite(n)) set(n); }}
      className="w-full text-xs rounded-lg border border-bone-200 px-2 py-1.5 font-mono" />
  );
}

function Stat({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string;
  color?: 'verde' | 'amarillo' | 'rojo' | 'moss' | 'ink'; icon?: 'fence' | 'water';
}) {
  const cls =
    color === 'verde' ? 'bg-moss-50 border-moss-200 text-moss-700' :
    color === 'amarillo' ? 'bg-sun-300/20 border-sun-300 text-clay-700' :
    color === 'rojo' ? 'bg-clay-100 border-clay-200 text-clay-700' :
    color === 'moss' ? 'bg-moss-700 border-moss-700 text-bone-50' :
    'bg-white border-bone-200 text-ink-900';
  const Ico = icon === 'fence' ? Fence : icon === 'water' ? Droplet : Beef;
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1"><Ico className="w-2.5 h-2.5" />{label}</p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
