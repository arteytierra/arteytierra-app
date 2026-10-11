'use client';

/**
 * La planilla de replanteo, impresa.
 *
 * Un solo renderizador para las cuatro planillas que acequia arma —el cierre
 * perimetral, el muro de la represa, el swale y la directriz keyline—, y por una
 * razón que no es ahorrar líneas: **una planilla se lee igual siempre**. La
 * cuadrilla que replantea un alambrado y la que replantea un muro usan la misma
 * cinta, el mismo nivel y la misma convención de izquierda y derecha, así que si
 * cada pantalla dibujara su propia tabla la app estaría enseñando cuatro papeles
 * distintos para la misma tarea. Las columnas, el orden y el lugar donde van las
 * dos celdas vacías son parte del contrato, no del estilo.
 *
 * Lo único que cambia entre una y otra es lo que la obra define: la rasante, la
 * lista de entrega y los avisos. Todo eso viene resuelto en el objeto `Planilla`
 * que devuelve `lib/planilla.ts`; acá no se calcula nada.
 *
 * Las dos últimas columnas van **vacías y con línea**, porque se escribe encima:
 * la lectura de mira y el corte o relleno los pone el que está parado en el
 * terreno. Una planilla que trae esas dos columnas llenas con lo que dice un
 * modelo de elevación satelital es una planilla que invita a no medir.
 */
import { useMemo } from 'react';
import { ClipboardList, Ruler, TriangleAlert, Download } from 'lucide-react';

import { type Planilla } from '@/lib/planilla';
import { exportarPlanillaCSV } from '@/lib/exportar';

/**
 * Cuántas estaciones se muestran si quien llama no dice otra cosa.
 *
 * En un panel no hay página: una planilla de trescientos renglones empuja todo
 * lo demás fuera de la vista y no se puede leer en una columna de 360 px. Se
 * muestra un tramo, se dice cuántos quedan y el CSV los trae todos, que es lo
 * que se lleva al campo.
 */
const MAX_DEFAULT = 40;

const fmt = (n: number, d = 0) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

export interface Props {
  planilla: Planilla;
  /** Cuántas estaciones se imprimen. El resto se replantea por tramos. */
  max?: number;
  /** Botón de descarga del CSV. Se apaga en el informe, que ya es un papel. */
  descargable?: boolean;
  /** Nombre base del archivo, sin extensión. */
  nombreArchivo?: string;
  /** Texto propio de la pantalla que la usa, arriba de la tabla. */
  children?: React.ReactNode;
}

export function PlanillaBloque({
  planilla, max = MAX_DEFAULT, descargable = true, nombreArchivo, children,
}: Props) {
  const p = planilla.precision;
  const recortada = Math.max(0, planilla.renglones.length - max);
  const visibles = useMemo(() => planilla.renglones.slice(0, max), [planilla.renglones, max]);

  // La columna Δ sólo tiene sentido si hay rasante de diseño: la directriz
  // keyline no la tiene y una columna de guiones no es información.
  const conAltura = planilla.renglones.some(r => r.altura_sobre_mojon_m != null);

  return (
    <div className="space-y-2.5">
      {children}

      {/* Cabecera que TR-62 exige: práctica, propósito, fecha */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-ink-900 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-moss-700 shrink-0" />
            <span className="truncate">{planilla.practica}</span>
          </p>
          <p className="text-[9px] text-ink-700/55 mt-0.5">
            {planilla.propositoTexto} · {planilla.fecha} · {fmt(planilla.largo_m)} m de eje ·
            {' '}estacas cada {fmt(planilla.intervalo_m, 2)} m · {planilla.renglones.length} estaciones
          </p>
        </div>
        {descargable && (
          <button
            onClick={() => exportarPlanillaCSV(planilla, nombreArchivo ?? planilla.practica)}
            className="shrink-0 flex items-center gap-1 rounded-lg border border-moss-200 text-moss-800 text-[10px] font-semibold px-2 py-1 hover:bg-moss-50 transition-colors"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        )}
      </div>

      {/* Qué manda: el dato o la norma */}
      <div className="border border-sun-500/30 bg-sun-500/10 rounded-lg p-2 space-y-1">
        <p className="text-[9px] uppercase tracking-wide text-ink-900/60 font-semibold flex items-center gap-1">
          <Ruler className="w-2.5 h-2.5" /> Qué manda: el dato o la norma
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div>
            <p className="text-ink-700/55">Pide la norma</p>
            <p className="font-mono font-semibold text-ink-950">{fmt(p.pedida_m * 100, p.pedida_m < 0.01 ? 2 : 1)} cm</p>
          </div>
          <div>
            <p className="text-ink-700/55">Trae el dato</p>
            <p className="font-mono font-semibold text-ink-950">
              {p.disponible_m != null ? `${fmt(p.disponible_m * 100, 0)} cm` : '—'}
            </p>
          </div>
          <div>
            <p className="text-ink-700/55">Razón</p>
            <p className="font-mono font-semibold text-ink-950">
              {p.razon != null ? `${fmt(p.razon, 0)} ×` : '—'}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-ink-800 leading-relaxed">{p.motivo}</p>
      </div>

      {/* Lo que se entrega además de la tabla (TR-62, fig. 2-1) */}
      {planilla.entrega.length > 0 && (
        <div className="bg-bone-50 border border-bone-200 rounded-lg p-2">
          <p className="text-[9px] uppercase tracking-wide text-ink-700/50 font-semibold mb-1">
            Lo que se entrega con la planilla
          </p>
          <dl className="space-y-0.5">
            {planilla.entrega.map((it, i) => (
              <div key={i} className="flex items-baseline justify-between gap-2">
                <dt className="text-[10px] text-ink-700/70">{it.que}</dt>
                <dd className="text-[10px] text-ink-900 font-medium text-right">{it.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Mojones de referencia */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-ink-700/50 font-semibold mb-1">
          Mojones de referencia ({planilla.mojones.length})
        </p>
        <p className="text-[10px] text-ink-700/70 leading-relaxed mb-1">
          Se clavan a ras de suelo antes de empezar y toda la planilla se lee contra ellos. Por eso no hace
          falta ninguna cota absoluta: una altura sobre un mojón es una resta, y en una resta el error común
          del modelo de elevación se cancela entero.
        </p>
        <div className="flex flex-wrap gap-1">
          {planilla.mojones.map(m => (
            <span key={m.id} className="text-[9px] font-mono bg-moss-50 border border-moss-200 rounded px-1 py-0.5">
              {m.rotulo}
            </span>
          ))}
        </div>
      </div>

      {/* La tabla */}
      <div>
        {recortada > 0 && (
          <p className="text-[9px] text-ink-700/65 leading-relaxed mb-1">
            Se muestran las primeras {max} estaciones —hasta la progresiva{' '}
            {visibles[visibles.length - 1]?.rotulo}— y quedan {recortada} más. El CSV las trae todas; en el
            terreno se replantea por tramos, reponiendo el mojón de referencia.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] border-collapse">
            <thead>
              <tr className="bg-ink-950 text-bone-100">
                <th className="text-left px-1 py-1 font-semibold">Progr.</th>
                <th className="text-left px-1 py-1 font-semibold">Qué hay</th>
                <th className="text-right px-1 py-1 font-semibold">Mojón</th>
                {conAltura && <th className="text-right px-1 py-1 font-semibold">Δ mojón</th>}
                <th className="text-right px-1 py-1 font-semibold">Cota gab.</th>
                <th className="text-right px-1 py-1 font-semibold">Mira</th>
                <th className="text-right px-1 py-1 font-semibold">Corte/rell.</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r, i) => (
                <tr key={r.rotulo + i} className={r.tipo === 'cruce' ? 'bg-sun-500/10 font-semibold' : i % 2 ? 'bg-bone-50' : ''}>
                  <td className="px-1 py-1 font-mono border-b border-bone-200">{r.rotulo}</td>
                  <td className="px-1 py-1 border-b border-bone-200">{r.nota ?? '—'}</td>
                  <td className="px-1 py-1 text-right font-mono border-b border-bone-200">{r.mojon ?? '—'}</td>
                  {conAltura && (
                    <td className="px-1 py-1 text-right font-mono border-b border-bone-200 font-semibold">
                      {r.altura_sobre_mojon_m != null ? fmt(r.altura_sobre_mojon_m, 2) : '—'}
                    </td>
                  )}
                  <td className="px-1 py-1 text-right font-mono border-b border-bone-200 text-ink-700/55">
                    {r.cota_terreno_m != null ? fmt(r.cota_terreno_m, p.decimales) : '—'}
                  </td>
                  <td className="px-1 py-1 border-b border-l border-bone-300" />
                  <td className="px-1 py-1 border-b border-l border-bone-300" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-ink-700/55 mt-1 leading-relaxed">
          Las dos últimas columnas van vacías a propósito: se llenan en el campo con el nivel. La cota de
          gabinete es la del modelo de elevación y está para ubicarse, no para replantear.
          {conAltura && ' La columna Δ es la cota de diseño menos la del mojón, y es la que se usa para sacar la varilla de rasante.'}
        </p>
      </div>

      {/* Instrucciones de campo */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-ink-700/50 font-semibold mb-1">
          Cómo se llena, según la norma
        </p>
        <ol className="text-[10px] text-ink-800 space-y-1 leading-relaxed list-decimal pl-4">
          {planilla.notas.map((n, i) => <li key={i}>{n}</li>)}
        </ol>
      </div>

      {planilla.advertencias.map((a, i) => (
        <p key={i} className="text-[10px] text-clay-800 bg-clay-500/5 border border-clay-500/20 rounded-lg px-2 py-1.5 leading-relaxed flex gap-1.5">
          <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{a}</span>
        </p>
      ))}

      <div className="border-t border-bone-200 pt-1.5">
        <p className="text-[8px] uppercase tracking-wide text-ink-700/40 font-semibold mb-0.5">Fuentes</p>
        <ul className="text-[8px] text-ink-700/55 space-y-0.5 leading-relaxed">
          {planilla.fuentes.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
    </div>
  );
}
