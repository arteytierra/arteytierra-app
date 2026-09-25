'use client';

import { useMemo } from 'react';
import { Mountain, Leaf } from 'lucide-react';
import { calcularAptitud, LABELS_APTITUD, COLORES_APTITUD, type TipoAptitud, type ResultadoAptitud } from '@/lib/aptitud';
import { superficie, superficieEnHa } from '@/lib/unidades';
import type { DatosShader } from '@/lib/shaders';
import type { DatosEscorrentia } from '@/lib/escorrentias';
import type { DatosClima } from '@/lib/clima';
import { useFichaBioma } from '@/lib/useFichaBioma';

interface Props {
  datosShader:     DatosShader | null;
  datosEscorrentia: DatosEscorrentia | null;
  /** Sólo para resolver la ficha del ecosistema, que corrige los puntajes. Sin
   *  clima la aptitud se calcula igual, con el relieve solo. */
  datosClima?:     DatosClima | null;
  onIrATopo:       () => void;
}

export function AptitudPanel({ datosShader, datosEscorrentia, datosClima, onIrATopo }: Props) {
  const { ficha, resolviendo } = useFichaBioma(
    datosClima ?? null,
    datosShader ? (datosShader.elev_min + datosShader.elev_max) / 2 : undefined,
  );

  const resultado = useMemo<ResultadoAptitud | null>(
    () => datosShader ? calcularAptitud(datosShader, datosEscorrentia, ficha?.aptitud) : null,
    [datosShader, datosEscorrentia, ficha],
  );

  /**
   * La corrección por ecosistema cambia los puntajes, los porcentajes y el
   * mapa. Mientras la ecorregión está en vuelo, `ficha` sale de la heurística
   * Köppen y puede no ser la del predio: en Sorata la tabla mostraba primero
   * "−20 huerta / −25 frutales / −10 pasturas / +10 reserva" con 99,7 % forestal
   * y después "+10 forestal / −10 huerta" con 99,8 %. Dos lecturas del mismo
   * terreno, la primera con cara de definitiva.
   *
   * Se espera. En la práctica casi no se nota: la ecorregión se consulta apenas
   * hay clima, se cachea por punto y para cuando alguien abre esta pestaña ya
   * suele estar resuelta.
   */
  if (datosShader && resolviendo) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Leaf className="w-8 h-8 text-moss-700/40 mx-auto animate-pulse" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Identificando la ecorregión para corregir la aptitud. El relieve ya está calculado;
          falta saber en qué ecosistema cae, que es lo que decide si una ladera de este porte
          es para huerta, para pastura o para monte.
        </p>
      </div>
    );
  }

  if (!datosShader || !resultado) {
    return (
      <div className="text-center py-8 px-4 space-y-3">
        <Mountain className="w-8 h-8 text-moss-700/40 mx-auto" />
        <p className="text-xs text-ink-700/60 leading-relaxed">
          Calculá la topografía del predio para obtener la aptitud de uso del suelo.
        </p>
        <button onClick={onIrATopo} className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors">
          <Mountain className="w-3.5 h-3.5" />Calcular topografía
        </button>
      </div>
    );
  }

  const tipos: TipoAptitud[] = ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'];
  const ajustes = resultado.ajustes;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Aptitud de uso del suelo</p>

      {/* ── Lo que corrigió el ecosistema ──────────────────────────────────────
          Los puntajes de abajo NO son sólo relieve: si la ficha del bioma pide
          una corrección, ya está aplicada y el mapa está pintado con ella. Por
          eso el ajuste se muestra arriba y con su razón, no en una nota al pie:
          el usuario tiene que poder discutirlo, y sabe más del lugar que la app. */}
      {ajustes.length > 0 && (
        <div className="rounded-xl border border-moss-200 bg-moss-50/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-moss-200 flex items-center gap-1.5 text-moss-700">
            <Leaf className="w-3.5 h-3.5" />
            <p className="text-xs font-medium text-ink-700">Corregido por el ecosistema</p>
          </div>
          <div className="p-3 space-y-2">
            {ajustes.map((m, i) => (
              <div key={i} className="flex gap-2">
                {/* Un delta 0 no es un ajuste que no pasó: es la región diciendo que la
                    advertencia del bioma acá no aplica, y por qué. Va en neutro para que
                    no se lea ni como premio ni como castigo. */}
                <span className={`font-mono text-[10px] font-bold shrink-0 w-8 text-right ${m.delta === 0 ? 'text-ink-700/50' : m.delta > 0 ? 'text-moss-700' : 'text-clay-700'}`}>
                  {m.delta > 0 ? '+' : ''}{m.delta}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-ink-700">{LABELS_APTITUD[m.uso]}</p>
                  <p className="text-[9px] text-ink-700/60 leading-relaxed">{m.razon}</p>
                </div>
              </div>
            ))}
            <p className="text-[9px] text-ink-700/45 leading-relaxed border-t border-moss-200 pt-2">
              El relieve no sabe en qué bioma está: una loma suave es igual de suave en cualquier
              parte del mundo. Estos ajustes ya están aplicados en los porcentajes y en el mapa.
            </p>
          </div>
        </div>
      )}

      {/* Resumen visual */}
      <div className="bg-white rounded-xl border border-bone-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Distribución por aptitud</p>
          {/* La superficie analizada, no la del predio: la grilla del relieve
              puede no llegar a los bordes. Decirlo acá evita que alguien reste
              esto contra la superficie del plano y crea que falta tierra. */}
          <p className="text-[9px] text-ink-700/50 leading-tight mt-0.5">
            {superficie(resultado.area_total_m2)}
            {superficieEnHa(resultado.area_total_m2) && ` · ${superficieEnHa(resultado.area_total_m2)}`} analizados,
            en celdas de {Math.round(resultado.area_celda_m2)} m²
          </p>
        </div>
        <div className="p-3 space-y-2">
          {tipos.map(tipo => {
            const r = resultado.resumen[tipo];
            return (
              <div key={tipo} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORES_APTITUD[tipo] }} />
                <span className="text-[9px] text-ink-700 flex-1 leading-tight">{LABELS_APTITUD[tipo]}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-mono text-ink-700/55 w-16 text-right">{superficie(r.area_m2)}</span>
                  <div className="w-14 h-1.5 bg-bone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: COLORES_APTITUD[tipo] }} />
                  </div>
                  <span className="text-[9px] font-mono text-ink-700/60 w-8 text-right">{r.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Descripción por tipo */}
      <div className="space-y-2">
        {tipos.filter(t => resultado.resumen[t].pct > 0).map(tipo => (
          <div key={tipo} className="bg-white rounded-xl border border-bone-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORES_APTITUD[tipo] }} />
              <p className="text-[10px] font-semibold text-ink-700">{LABELS_APTITUD[tipo]}</p>
              <span className="ml-auto text-[9px] font-mono text-ink-700/60 text-right shrink-0">
                {superficie(resultado.resumen[tipo].area_m2)}
                {superficieEnHa(resultado.resumen[tipo].area_m2) && ` · ${superficieEnHa(resultado.resumen[tipo].area_m2)}`}
                {' · '}{resultado.resumen[tipo].pct}%
              </span>
            </div>
            <p className="text-[9px] text-ink-700/60 leading-relaxed">{DESCRIPCION_APTITUD[tipo]}</p>
          </div>
        ))}
      </div>

      <p className="text-[8px] text-ink-700/40 italic px-1">
        Crea zonas por aptitud dominante en base a pendiente, orientación y acumulación hídrica.
        No reemplaza relevamiento agronómico/edafológico profesional.
      </p>
    </div>
  );
}

const DESCRIPCION_APTITUD: Record<TipoAptitud, string> = {
  huerta:   'Zonas planas con buena orientación norte y acceso al agua. Aptas para horticultura intensiva, jardines productivos y cultivos de ciclo corto.',
  frutales: 'Laderas suaves con orientación norte-noroeste. Buenas condiciones de temperatura y drenaje para árboles frutales y viña.',
  pasturas: 'Áreas moderadamente planas a inclinadas. Adecuadas para pasturas naturales o implantadas, silvopastoril y cultivos extensivos.',
  forestal: 'Pendientes pronunciadas y laderas con menos insolación. Conservación de monte nativo, forestación productiva o cortafuegos.',
  reserva:  'Zonas con limitaciones severas: pendiente muy alta, fondos de valle inundables o posición expuesta. Reserva ecológica o sin uso.',
};
