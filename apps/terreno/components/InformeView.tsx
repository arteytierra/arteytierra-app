'use client';

import { FileDown, ArrowLeft } from 'lucide-react';
import type { InformeData } from '@/lib/informe';
import { calcularMetricas, formatearDistancia } from '@/lib/geometria';
import { MESES } from '@/lib/clima';
import { CATEGORIAS_ZONA } from '@/lib/zonificacion';

interface Props {
  datos: InformeData;
  compartido?: boolean; // true → oculta el botón "Volver al mapa"
}

export function InformeView({ datos, compartido = false }: Props) {
  const metricas = datos.metricas ?? calcularMetricas(datos.mojones);

  const fechaLarga = (() => {
    try {
      return new Date(datos.fecha).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return datos.fecha; }
  })();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 2cm; size: A4; }
          .page-break-before { page-break-before: always; }
        }
      `}</style>

      {/* ── Barra de acciones (no impresa) ──────────────────────────────────── */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-bone-200 px-6 py-3 flex items-center gap-3 shadow-sm">
        {!compartido && (
          <a
            href="/mapa"
            className="flex items-center gap-1.5 text-xs text-ink-700/60 hover:text-ink-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al mapa
          </a>
        )}
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-sm font-medium transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>

      {/* ── Cuerpo del informe ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8 text-ink-900">

        {/* Snapshot del mapa — primera página si existe */}
        {datos.mapaDataUrl && (
          <div className="page-break-before">
            <p className="text-xs font-semibold text-moss-700 uppercase tracking-widest mb-3">Plano del predio</p>
            <img
              src={datos.mapaDataUrl}
              alt="Plano del terreno"
              className="w-full rounded-xl border border-bone-200 shadow"
              style={{ pageBreakAfter: 'always' }}
            />
          </div>
        )}

        {/* Encabezado */}
        <header className="border-b-2 border-moss-700 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-moss-700 uppercase tracking-widest mb-1">
                Arte y Tierra
              </p>
              <h1 className="font-display text-3xl text-ink-950 leading-tight">
                Análisis de Terreno
              </h1>
              <p className="text-lg text-ink-700 mt-1">{datos.nombre}</p>
            </div>
            <div className="text-right text-xs text-ink-700/60 shrink-0">
              <p className="font-medium">{fechaLarga}</p>
              <p className="mt-1">arteytierra.org</p>
            </div>
          </div>
        </header>

        {/* ── 1. Datos del terreno ── */}
        <Section numero="1" titulo="Datos del terreno">
          {datos.mojones.length === 0 ? (
            <p className="text-sm text-ink-700/50">Sin mojones registrados.</p>
          ) : (
            <>
              {metricas && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <StatBlock label="Área" value={`${metricas.area_ha.toFixed(4)} ha`} sub={`${Math.round(metricas.area_m2).toLocaleString('es-AR')} m²`} />
                  <StatBlock label="Perímetro" value={formatearDistancia(metricas.perimetro_m)} sub={`${metricas.perimetro_m.toFixed(1)} m`} />
                  <StatBlock label="Mojones" value={`${datos.mojones.length}`} sub="vértices" />
                </div>
              )}

              <Table
                head={['#', 'Latitud', 'Longitud']}
                rows={datos.mojones.map(m => [
                  `M${m.numero}`,
                  m.lat.toFixed(6),
                  m.lng.toFixed(6),
                ])}
              />

              {metricas && metricas.linderos.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Linderos</p>
                  <Table
                    head={['Tramo', 'Longitud', 'Azimut', 'Rumbo cuadrantal']}
                    rows={metricas.linderos.map(l => [
                      `M${l.desde} → M${l.hasta}`,
                      formatearDistancia(l.longitud),
                      `${l.azimut.toFixed(1)}°`,
                      l.rumbo,
                    ])}
                  />
                </div>
              )}
            </>
          )}
        </Section>

        {/* ── 2. Clima ── */}
        {datos.clima && (
          <Section numero="2" titulo="Clima">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Precipitación" value={`${datos.clima.precip_anual_mm} mm`} sub="anual" />
              <StatBlock label="Temperatura" value={`${datos.clima.tmean_anual_c}°C`} sub="media anual" />
              <StatBlock label="ETP Hargreaves" value={`${datos.clima.etp_anual_mm} mm`} sub="anual" />
              <StatBlock label="Viento ppal." value={datos.clima.viento_dir_ppal} sub="dirección" />
            </div>
            <Table
              head={['Mes', 'Precip. (mm)', 'ETP (mm)', 'Balance (mm)', 'T media (°C)']}
              rows={datos.clima.meses.map(m => [
                m.mes,
                String(m.precip_mm),
                String(m.etp_mm),
                `${m.balance_mm > 0 ? '+' : ''}${m.balance_mm}`,
                `${m.tmean_c}°C`,
              ])}
              colAlign={['left', 'right', 'right', 'right', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Fuente: {datos.clima.fuente}. ETP por Hargreaves — orientativo.
            </p>
          </Section>
        )}

        {/* ── 3. Topografía ── */}
        {datos.topo && (
          <Section numero={datos.clima ? '3' : '2'} titulo="Topografía">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Elev. mínima" value={`${datos.topo.elev_min.toFixed(0)} m`} sub="s.n.m." />
              <StatBlock label="Elev. máxima" value={`${datos.topo.elev_max.toFixed(0)} m`} sub="s.n.m." />
              <StatBlock label="Desnivel" value={`${datos.topo.desnivel.toFixed(1)} m`} sub="máx − mín" />
              <StatBlock label="Pendiente" value={`${datos.topo.pendiente_pct.toFixed(1)}%`} sub={`${datos.topo.pendiente_grados.toFixed(1)}°`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBlock label="Elev. media" value={`${datos.topo.elev_media.toFixed(0)} m`} sub="centroide del terreno" />
              <StatBlock label="Escurrimiento" value={datos.topo.orientacion} sub={`fluye hacia el ${datos.topo.orientacion}`} />
            </div>
            <Table
              head={['Mojón', 'Elevación (m s.n.m.)']}
              rows={datos.topo.puntos.map(p => [p.etiqueta ?? '', `${p.elevation.toFixed(0)} m`])}
              colAlign={['left', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Fuente: {datos.topo.fuente}. Resolución {datos.topo.resolucion}.
              Datos de 2000 — orientativos. No apto para diseño de obras sin relevamiento GPS.
            </p>
          </Section>
        )}

        {/* ── 4. Captación pluvial ── */}
        {datos.captacion && (
          <Section
            numero={[datos.clima, datos.topo].filter(Boolean).length + 2}
            titulo="Captación de agua de lluvia"
          >
            {/* Consumo total */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBlock
                label="Consumo total"
                value={`${datos.captacion.resultado.consumo_total_litros_dia.toFixed(0)} L/día`}
                sub={`${datos.captacion.resultado.consumo_anual_m3.toFixed(1)} m³/año`}
              />
              <StatBlock
                label="Categorías"
                value={`${datos.captacion.consumoCategorias.length}`}
                sub="tipos de uso registrados"
              />
            </div>

            {/* Categorías de consumo */}
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Consumo por categoría</p>
            <Table
              head={['Categoría', 'Cantidad', 'L/día', 'Anual (m³)']}
              rows={datos.captacion.consumoCategorias.map(c => [
                c.nombre,
                `${c.cantidad} ${c.tipo === 'domestico' ? 'p' : c.tipo === 'huerta' || c.tipo === 'cultivo_extensivo' ? (c.tipo === 'huerta' ? 'm²' : 'ha') : 'anim.'}`,
                (c.cantidad * c.litros_dia_por_unidad).toFixed(1),
                ((c.cantidad * c.litros_dia_por_unidad * 365) / 1000).toFixed(1),
              ])}
              colAlign={['left', 'right', 'right', 'right']}
            />

            {/* Superficies */}
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2 mt-4">Superficies de captación</p>
            <Table
              head={['Nombre', 'Tipo', 'Área (m²)', 'Coef.', 'Anual (m³)']}
              rows={datos.captacion.resultado.captacion_por_superficie.map(s => {
                const sup = datos.captacion!.superficies.find(x => x.id === s.id);
                return [
                  s.nombre,
                  sup ? sup.tipo.replace(/_/g, ' ') : '—',
                  String(sup?.area_m2 ?? '—'),
                  String(sup?.coef ?? '—'),
                  s.anual_m3.toFixed(1),
                ];
              })}
              colAlign={['left', 'left', 'right', 'right', 'right']}
            />

            {/* Resultados anuales */}
            <div className="grid grid-cols-4 gap-3 mt-4 mb-4">
              <StatBlock label="Captación anual" value={`${datos.captacion.resultado.captacion_anual_m3.toFixed(1)} m³`} sub={`${datos.captacion.resultado.captacion_anual_litros.toLocaleString('es-AR')} L`} />
              <StatBlock label="Consumo anual" value={`${datos.captacion.resultado.consumo_anual_m3.toFixed(1)} m³`} sub="estimado" />
              <StatBlock label="Balance anual" value={`${datos.captacion.resultado.balance_anual_m3 > 0 ? '+' : ''}${datos.captacion.resultado.balance_anual_m3.toFixed(1)} m³`} sub={`${datos.captacion.resultado.meses_deficit} mes/es c/ déficit`} />
              <StatBlock label="Tanque recomendado" value={`${datos.captacion.resultado.tanque_recomendado_m3.toFixed(1)} m³`} sub={`${Math.round(datos.captacion.resultado.tanque_recomendado_m3 * 1000).toLocaleString('es-AR')} L`} />
            </div>

            {/* Balance estacional */}
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Balance estacional</p>
            <Table
              head={['Temporada', 'Meses', 'Captación (m³)', 'Consumo (m³)', 'Balance (m³)']}
              rows={datos.captacion.resultado.balance_trimestral.map(t => [
                t.nombre,
                t.meses_label,
                t.captacion_m3.toFixed(1),
                t.consumo_m3.toFixed(1),
                `${t.balance_m3 > 0 ? '+' : ''}${t.balance_m3.toFixed(1)}`,
              ])}
              colAlign={['left', 'left', 'right', 'right', 'right']}
            />

            {/* Tabla mensual */}
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2 mt-4">Detalle mensual</p>
            <Table
              head={['Mes', 'Captación (m³)', 'Consumo (m³)', 'Balance (m³)']}
              rows={MESES.map((mes, i) => {
                const b = datos.captacion!.resultado.balance_mensual_m3[i] ?? 0;
                return [
                  mes,
                  (datos.captacion!.resultado.captacion_mensual_m3[i] ?? 0).toFixed(1),
                  (datos.captacion!.resultado.consumo_mensual_m3[i] ?? 0).toFixed(1),
                  `${b > 0 ? '+' : ''}${b.toFixed(1)}`,
                ];
              })}
              colAlign={['left', 'right', 'right', 'right']}
            />
          </Section>
        )}

        {/* ── 5. Suelo ── */}
        {datos.suelo && (
          <Section
            numero={[datos.clima, datos.topo, datos.captacion].filter(Boolean).length + 2}
            titulo="Análisis de suelo"
          >
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="pH (0–5 cm)" value={String(datos.suelo.ph)} sub={datos.suelo.interp.ph.clase} />
              <StatBlock label="C. orgánico" value={`${datos.suelo.carbono_org} g/kg`} sub={datos.suelo.interp.carbono.clase} />
              <StatBlock label="Textura" value={datos.suelo.interp.textura.clase} sub={`${datos.suelo.arcilla}% arc · ${datos.suelo.arena}% are`} />
              <StatBlock label="Fertilidad" value={datos.suelo.interp.fertilidad.clase} sub="estimada" />
            </div>
            <Table
              head={['Propiedad', 'Valor', 'Detalle']}
              rows={[
                ['pH (0–5 cm)',       String(datos.suelo.ph),                         datos.suelo.interp.ph.descripcion],
                ['C. orgánico (SOC)', `${datos.suelo.carbono_org} g/kg`,              datos.suelo.interp.carbono.descripcion],
                ['Arcilla',          `${datos.suelo.arcilla}%`,                       '% vol. 0–5 cm'],
                ['Limo',             `${datos.suelo.limo}%`,                          '% vol. 0–5 cm'],
                ['Arena',            `${datos.suelo.arena}%`,                         '% vol. 0–5 cm'],
                ['Dens. aparente',   `${datos.suelo.densidad_ap} kg/dm³`,             '0–5 cm'],
                ['Nitrógeno total',  `${datos.suelo.nitrogeno} g/kg`,                 '0–5 cm'],
              ]}
              colAlign={['left', 'right', 'left']}
            />
            {datos.suelo.interp.recomendaciones.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Recomendaciones</p>
                {datos.suelo.interp.recomendaciones.map((r: string, i: number) => (
                  <p key={i} className="text-xs text-ink-700/80 flex gap-1.5">
                    <span className="text-moss-700 shrink-0">→</span>{r}
                  </p>
                ))}
              </div>
            )}
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Fuente: SoilGrids (ISRIC) — resolución ~250 m. Orientativo, no reemplaza análisis de laboratorio.
            </p>
          </Section>
        )}

        {/* ── 6. Zonificación ── */}
        {datos.zonas && datos.zonas.length > 0 && (
          <Section
            numero={[datos.clima, datos.topo, datos.captacion, datos.suelo].filter(Boolean).length + 2}
            titulo="Zonificación predial"
          >
            <Table
              head={['Zona', 'Categoría', 'Área (ha)', 'Área (m²)', 'Notas']}
              rows={datos.zonas.map(z => [
                z.nombre,
                CATEGORIAS_ZONA[z.categoria].label,
                z.area_ha.toFixed(4),
                Math.round(z.area_m2).toLocaleString('es-AR'),
                z.notas || '—',
              ])}
              colAlign={['left', 'left', 'right', 'right', 'left']}
            />
            {(() => {
              const total = datos.zonas.reduce((s, z) => s + z.area_m2, 0);
              const porCategoria: Record<string, number> = {};
              datos.zonas.forEach(z => {
                porCategoria[z.categoria] = (porCategoria[z.categoria] ?? 0) + z.area_m2;
              });
              return (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Resumen por categoría</p>
                  <Table
                    head={['Categoría', 'Área (ha)', '% del total']}
                    rows={Object.entries(porCategoria).map(([cat, area]) => [
                      CATEGORIAS_ZONA[cat as keyof typeof CATEGORIAS_ZONA]?.label ?? cat,
                      (area / 10000).toFixed(4),
                      total > 0 ? `${((area / total) * 100).toFixed(1)}%` : '—',
                    ])}
                    colAlign={['left', 'right', 'right']}
                  />
                </div>
              );
            })()}
          </Section>
        )}

        {/* Pie de página */}
        <footer className="border-t-2 border-bone-200 pt-6 text-xs text-ink-700/50 leading-relaxed">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-ink-700 mb-1">Arte y Tierra · arteytierra.org</p>
              <p>
                Informe generado con la herramienta Análisis de Terreno.
                Los datos son orientativos y no reemplazan un relevamiento topográfico
                o climático profesional.
              </p>
            </div>
            <p className="shrink-0">{fechaLarga}</p>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── Componentes internos ────────────────────────────────────────────────────

function Section({ numero, titulo, children }: { numero: number | string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 border-b border-bone-200 pb-2">
        <span className="text-xs font-bold text-moss-700 bg-moss-100 rounded px-1.5 py-0.5">{numero}</span>
        <h2 className="font-semibold text-base text-ink-950 uppercase tracking-wide">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-bone-50 rounded-lg p-3 border border-bone-200">
      <p className="text-xs text-ink-700/60 mb-0.5">{label}</p>
      <p className="font-mono font-bold text-sm text-ink-950">{value}</p>
      <p className="text-xs text-ink-700/40 mt-0.5">{sub}</p>
    </div>
  );
}

function Table({
  head, rows, colAlign,
}: {
  head: string[];
  rows: string[][];
  colAlign?: ('left' | 'right' | 'center')[];
}) {
  const align = (i: number) => colAlign?.[i] ?? 'left';
  const thCls = (i: number) => `py-1.5 px-3 text-xs font-semibold text-ink-700/60 ${align(i) === 'right' ? 'text-right' : align(i) === 'center' ? 'text-center' : 'text-left'}`;
  const tdCls = (i: number) => `py-1.5 px-3 text-xs font-mono text-ink-800 ${align(i) === 'right' ? 'text-right' : align(i) === 'center' ? 'text-center' : 'text-left'}`;

  return (
    <div className="rounded-lg border border-bone-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-bone-100">
            {head.map((h, i) => <th key={i} className={thCls(i)}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-t border-bone-100 ${ri % 2 === 1 ? 'bg-bone-50/60' : 'bg-white'}`}>
              {row.map((cell, ci) => <td key={ci} className={tdCls(ci)}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
