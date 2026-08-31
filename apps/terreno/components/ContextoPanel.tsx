'use client';

import { Leaf, Sprout, Users, Globe2, ExternalLink, Cloud, BookOpen, Bird, Mountain } from 'lucide-react';
import { centroide, type DatosClima } from '@/lib/clima';
import { resolverBioma, analogosDeKoppen } from '@/lib/contexto';
import { ATRIBUCION_RESOLVE } from '@/lib/ecorregiones';
import { useEcorregion } from '@/lib/useEcorregion';
import type { DatosTopografia } from '@/lib/topografia';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:    Mojon[];
  datosClima: DatosClima | null;
  datosTopo:  DatosTopografia | null;
  onIrAClima: () => void;
}

export function ContextoPanel({ mojones, datosClima, datosTopo, onIrAClima }: Props) {
  // La ecorregión se pide antes de los cortes de arriba porque es un hook y no
  // puede quedar detrás de un return condicional.
  const listo = mojones.length >= 3;
  const centro = listo ? centroide(mojones) : null;
  const eco = useEcorregion(centro?.lat ?? null, centro?.lng ?? null);

  if (!listo || !centro) {
    return (
      <div className="text-center py-8 px-4">
        <Leaf className="w-8 h-8 text-moss-700/40 mx-auto mb-2" />
        <p className="text-xs text-ink-700/50 leading-relaxed">
          Trazá al menos 3 mojones para identificar el ecosistema y los saberes de la región.
        </p>
      </div>
    );
  }

  if (!datosClima?.koppen) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Cloud className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/50 leading-relaxed">
          El contexto se deriva de la clasificación climática. Cargá primero los datos de clima.
        </p>
        <button
          onClick={onIrAClima}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Cloud className="w-3 h-3" /> Ir a Clima
        </button>
      </div>
    );
  }

  const elev = datosTopo?.elev_media;
  const bioma = resolverBioma(datosClima.koppen, centro.lat, centro.lng, elev, eco);
  const ficha = bioma.ficha;
  const color = ficha?.color ?? '#5b6b52'; // sin ficha: verde neutro de marca
  const analogos = analogosDeKoppen(datosClima.koppen);

  return (
    <div className="space-y-4">
      {/* Banner de bioma */}
      <div className="rounded-xl p-3 text-bone-50" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="flex items-start gap-2">
          <span className="text-2xl leading-none">{bioma.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-bone-50/70">Ecosistema de base</p>
            <p className="text-base font-bold leading-tight">{bioma.titulo}</p>
            {ficha && <p className="text-xs text-bone-50/90 mt-0.5">{ficha.resumen}</p>}
          </div>
        </div>
        {bioma.ecorregion && (
          <p className="text-[10px] text-bone-50/80 mt-2 pt-2 border-t border-bone-50/20 flex items-center gap-1">
            <Globe2 className="w-3 h-3 shrink-0" /> Ecorregión {bioma.ecorregion.eco_id} · {bioma.ecorregion.eco_name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-bone-50/20 text-[10px] text-bone-50/80">
          <span className="font-mono font-bold">{datosClima.koppen.codigo}</span>
          <span>· {datosClima.koppen.descripcion}</span>
          {elev !== undefined && <span className="ml-auto flex items-center gap-0.5"><Mountain className="w-3 h-3" />{Math.round(elev)} m</span>}
        </div>
      </div>

      {bioma.aviso && (
        <p className="text-[11px] text-ink-700/70 leading-relaxed bg-bone-50 border border-bone-200 rounded-lg p-2.5">
          {bioma.aviso}
        </p>
      )}

      {ficha && <>
      {/* Ecosistema natural */}
      <Seccion icon={<Leaf className="w-3.5 h-3.5" />} titulo="Ecosistema natural">
        <DatoLinea icon={<Sprout className="w-3 h-3 text-moss-700" />} label="Vegetación" texto={ficha.vegetacion} />
        <DatoLinea icon={<Bird className="w-3 h-3 text-clay-700" />} label="Fauna" texto={ficha.fauna} />
        <DatoLinea icon={<Mountain className="w-3 h-3 text-ink-700/60" />} label="Suelos" texto={ficha.suelos} />
      </Seccion>

      {/* Especies clave — vacío en las fichas de bioma global, a esa escala no
          hay especies que sean ciertas en todo el bioma. */}
      {ficha.especies.length > 0 && <Seccion icon={<Sprout className="w-3.5 h-3.5" />} titulo="Especies nativas clave">
        <div className="flex flex-wrap gap-1">
          {ficha.especies.map(e => (
            <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-moss-100 text-moss-900 border border-moss-200">{e}</span>
          ))}
        </div>
      </Seccion>}

      {/* Saberes ancestrales */}
      {ficha.saberes.length > 0 && <Seccion icon={<Users className="w-3.5 h-3.5" />} titulo="Saberes ancestrales y tradicionales">
        <div className="space-y-2">
          {ficha.saberes.map((s, i) => (
            <div key={i} className="bg-bone-50 rounded-lg p-2.5 border border-bone-200">
              <p className="text-xs font-semibold text-moss-900 mb-0.5">{s.cultura}</p>
              <p className="text-xs text-ink-700/75 leading-relaxed">{s.practicas}</p>
            </div>
          ))}
        </div>
      </Seccion>}
      </>}

      {/* Análogos del mundo — dependen del clima, no de la ficha. Pueden faltar:
          el hielo permanente no tiene sistema agrícola análogo. */}
      {analogos && <Seccion icon={<Globe2 className="w-3.5 h-3.5" />} titulo={`Análogos en el mundo · ${analogos.titulo}`}>
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1">
          Regiones con clima parecido <span className="font-mono text-ink-700/40">{analogos.clase}</span>
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {analogos.regiones.map(r => (
            <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-water-500/10 text-water-700 border border-water-500/20">{r}</span>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1">Técnicas y sistemas análogos</p>
        <ul className="space-y-1">
          {analogos.tecnicas.map((t, i) => (
            <li key={i} className="text-xs text-ink-700/75 leading-relaxed flex gap-1.5">
              <span className="text-moss-700 mt-0.5">→</span><span>{t}</span>
            </li>
          ))}
        </ul>
        {/* Los sistemas van nombrados, sin explicar: las fuentes son el desarrollo. */}
        <div className="mt-2 pt-2 border-t border-bone-200 space-y-1">
          {analogos.fuentes.map((f, i) => (
            <a key={i} href={f.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-water-500 hover:text-water-700 transition-colors">
              <ExternalLink className="w-3 h-3 shrink-0" /> {f.label}
            </a>
          ))}
        </div>
        {analogos.aviso && <p className="text-[10px] text-ink-700/60 leading-relaxed mt-2">{analogos.aviso}</p>}
      </Seccion>}

      {/* Fuentes */}
      {ficha && <Seccion icon={<BookOpen className="w-3.5 h-3.5" />} titulo="Para profundizar">
        <div className="space-y-1">
          {ficha.fuentes.map((f, i) => (
            <a key={i} href={f.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-water-500 hover:text-water-700 font-medium transition-colors">
              <ExternalLink className="w-3 h-3 shrink-0" /> {f.label}
            </a>
          ))}
        </div>
      </Seccion>}

      <p className="text-[9px] text-ink-700/45 leading-tight pt-1 border-t border-bone-200">
        Contenido curado de divulgación, derivado del clima y la ubicación. Orientativo — verificá los saberes
        locales con las comunidades y fuentes de tu zona, que siempre tienen el conocimiento más preciso del lugar.
        {bioma.ecorregion && <> {ATRIBUCION_RESOLVE}</>}
      </p>
    </div>
  );
}

function Seccion({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-bone-200 flex items-center gap-1.5 text-moss-700">
        {icon}<p className="text-xs font-medium text-ink-700">{titulo}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function DatoLinea({ icon, label, texto }: { icon: React.ReactNode; label: string; texto: string }) {
  return (
    <div className="flex gap-1.5 mb-2 last:mb-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-xs text-ink-700/75 leading-relaxed">
        <span className="font-semibold text-ink-700">{label}: </span>{texto}
      </p>
    </div>
  );
}
