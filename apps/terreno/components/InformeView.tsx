'use client';

import { FileDown, ArrowLeft } from 'lucide-react';
import type { InformeData } from '@/lib/informe';
import { calcularMetricas, formatearDistancia, type MetricasPoligono } from '@/lib/geometria';
import { MESES, centroide } from '@/lib/clima';
import { CATEGORIAS_ZONA } from '@/lib/zonificacion';
import { determinarBioma, fichaBioma, analogosDeKoppen } from '@/lib/contexto';
import { formatearMoneda } from '@/lib/economia';

interface Props {
  datos: InformeData;
  compartido?: boolean; // true → oculta el botón "Volver al mapa"
}

export function InformeView({ datos, compartido = false }: Props) {
  const metricas = datos.metricas ?? calcularMetricas(datos.mojones);

  // Numeración dinámica de secciones según las presentes
  const presente = {
    clima:     !!datos.clima,
    extremos:  !!datos.extremos,
    contexto:  !!(datos.clima?.koppen && datos.mojones.length >= 3),
    topo:      !!datos.topo,
    captacion: !!datos.captacion,
    suelo:     !!datos.suelo,
    cobertura: !!datos.cobertura,
    entorno:   !!datos.entorno,
    carbono:   !!datos.carbono,
    redAgua:   !!datos.redAgua,
    represa:   !!datos.represa,
    riego:     !!datos.riego,
    economia:  !!datos.economia,
    zonas:     !!(datos.zonas && datos.zonas.length),
  };
  const sec: Record<string, number> = {};
  let _c = 1; // 1 = Datos del terreno
  (['clima', 'extremos', 'contexto', 'entorno', 'topo', 'captacion', 'suelo', 'cobertura', 'redAgua', 'represa', 'riego', 'zonas', 'carbono', 'economia'] as const).forEach(k => {
    if (presente[k]) sec[k] = ++_c;
  });

  // Índice de secciones (título + número), para la tabla de contenidos.
  const TITULOS: Record<string, string> = {
    clima: 'Clima', extremos: 'Extremos y riesgo climático', contexto: 'Contexto ecológico y cultural',
    entorno: 'Contexto vivo (biodiversidad)', topo: 'Topografía', captacion: 'Captación de agua de lluvia',
    suelo: 'Suelo', cobertura: 'Cobertura del suelo', carbono: 'Carbono', redAgua: 'Red de agua por tubería',
    represa: 'Represa / reservorio', riego: 'Riego por sector', economia: 'Presupuesto y retorno',
    zonas: 'Zonificación predial',
  };
  const indice = Object.entries(sec).sort((a, b) => a[1] - b[1]).map(([k, n]) => ({ n, titulo: TITULOS[k] ?? k }));

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

        {/* Portada + resumen ejecutivo */}
        <Portada datos={datos} metricas={metricas} fechaLarga={fechaLarga} />
        <ResumenEjecutivo datos={datos} metricas={metricas} />

        {/* Índice */}
        {indice.length > 0 && (
          <div className="space-y-2">
            <p className="eyebrow">Contenido</p>
            <ul className="text-sm text-ink-800">
              <li className="flex items-baseline gap-2 py-0.5">
                <span className="font-mono text-ink-700/50 w-5">1</span>
                <span>Datos del terreno</span>
              </li>
              {indice.map(({ n, titulo }) => (
                <li key={n} className="flex items-baseline gap-2 py-0.5">
                  <span className="font-mono text-ink-700/50 w-5">{n}</span>
                  <span>{titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Encabezado */}
        <header className="border-b-2 border-moss-700 pb-6 page-break-before">
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
          <Section numero={sec.clima!} titulo="Clima">
            {datos.clima.koppen && (
              <div className="mb-4 rounded-lg border border-moss-200 bg-moss-50 p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-ink-700/60 uppercase tracking-wide">Clasificación climática</p>
                  <p className="font-mono font-bold text-lg text-moss-900">{datos.clima.koppen.codigo}
                    <span className="text-sm font-normal text-ink-700 ml-2">{datos.clima.koppen.descripcion}</span></p>
                </div>
                {datos.clima.aridez && (
                  <div className="text-right">
                    <p className="text-xs text-ink-700/60 uppercase tracking-wide">Aridez (P/ETP)</p>
                    <p className="font-mono font-bold text-sm text-ink-950">{datos.clima.aridez.clase} · {datos.clima.aridez.valor}</p>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Precipitación" value={`${datos.clima.precip_anual_mm} mm`} sub="anual" />
              <StatBlock label="Temperatura" value={`${datos.clima.tmean_anual_c}°C`} sub="media anual" />
              <StatBlock label="ETP Hargreaves" value={`${datos.clima.etp_anual_mm} mm`} sub="anual" />
              {datos.clima.rh_anual_pct !== undefined
                ? <StatBlock label="Humedad rel." value={`${datos.clima.rh_anual_pct}%`} sub="media anual" />
                : <StatBlock label="Viento ppal." value={datos.clima.viento_dir_ppal} sub="dirección" />}
              {datos.clima.rad_anual_kwh !== undefined && <StatBlock label="Radiación" value={`${datos.clima.rad_anual_kwh}`} sub="kWh/m²/día" />}
              {datos.clima.gdd_anual !== undefined && <StatBlock label="GDD (base 10)" value={`${datos.clima.gdd_anual}`} sub="grados-día anuales" />}
              {datos.clima.viento_medio_ms !== undefined && <StatBlock label="Viento" value={`${datos.clima.viento_dir_ppal}`} sub={`${datos.clima.viento_medio_ms} m/s medio`} />}
              {datos.clima.amplitud_anual_c !== undefined && <StatBlock label="Amplitud térmica" value={`${datos.clima.amplitud_anual_c}°C`} sub="media diaria" />}
            </div>
            <Table
              head={['Mes', 'Precip.', 'ETP', 'Balance', 'T med.', 'HR', 'Viento']}
              rows={datos.clima.meses.map(m => [
                m.mes,
                String(m.precip_mm),
                String(m.etp_mm),
                `${m.balance_mm > 0 ? '+' : ''}${m.balance_mm}`,
                `${m.tmean_c}°`,
                m.rh_pct !== undefined ? `${m.rh_pct}%` : '—',
                m.viento_dir ? `${m.viento_dir} ${m.viento_ms}` : `${m.viento_ms}`,
              ])}
              colAlign={['left', 'right', 'right', 'right', 'right', 'right', 'right']}
            />
            {datos.clima.heladas && (
              <p className="text-xs text-ink-700/70 mt-2">
                <span className="font-semibold">Heladas:</span> {datos.clima.heladas.periodo_libre}
                {datos.clima.heladas.meses_riesgo.length > 0 && ` Meses con riesgo: ${datos.clima.heladas.meses_riesgo.join(', ')}.`}
              </p>
            )}
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Fuente: {datos.clima.fuente}. ETP por Hargreaves y Köppen-Geiger (Peel et al. 2007) — orientativos.
            </p>
          </Section>
        )}

        {/* ── Extremos y riesgo climático ── */}
        {datos.extremos && (() => {
          const ex = datos.extremos;
          const mmT = (n: number) => ex.tormenta.recurrencias.find(r => r.periodo_retorno === n)?.mm;
          return (
            <Section numero={sec.extremos!} titulo="Extremos y riesgo climático">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <StatBlock label="Tormenta T10" value={mmT(10) != null ? `${mmT(10)} mm` : '—'} sub="24 h · retorno 10 años" />
                <StatBlock label="Tormenta T100" value={mmT(100) != null ? `${mmT(100)} mm` : '—'} sub="24 h · retorno 100 años" />
                <StatBlock label="Racha seca máx." value={`${ex.sequia.racha_max_dias} d`} sub="sin lluvia (histórica)" />
                <StatBlock label="Días ≥ 35 °C" value={`${ex.calor.dias_ge_35}`} sub="media anual" />
              </div>

              <Table
                head={['Período de retorno', 'Lluvia máx. 24 h (mm)']}
                rows={ex.tormenta.recurrencias.map(r => [`T${r.periodo_retorno} (1 en ${r.periodo_retorno} años)`, String(r.mm)])}
                colAlign={['left', 'right']}
              />

              {ex.heladas.hay_heladas ? (
                <p className="text-sm text-ink-700/80 mt-3">
                  <span className="font-semibold">Heladas:</span> ~{ex.heladas.dias_helada_anio} días/año (tmín ≤ {ex.heladas.umbral_c} °C).
                  {ex.heladas.ultima_helada && ` Última típica: ${ex.heladas.ultima_helada.p50}.`}
                  {ex.heladas.primera_helada && ` Primera típica: ${ex.heladas.primera_helada.p50}.`}
                  {ex.heladas.periodo_libre_dias && ` Período libre de heladas: ~${ex.heladas.periodo_libre_dias.p50} días.`}
                </p>
              ) : (
                <p className="text-sm text-ink-700/80 mt-3"><span className="font-semibold">Heladas:</span> sin heladas significativas en el registro.</p>
              )}

              <p className="text-sm text-ink-700/80 mt-1">
                <span className="font-semibold">Precipitación interanual:</span> media {ex.precip_anual.media_mm} mm
                (mín {ex.precip_anual.min_mm} · máx {ex.precip_anual.max_mm} · variabilidad CV {ex.precip_anual.cv_pct} %).
              </p>

              <p className="text-xs text-ink-700/50 mt-2 italic">
                Fuente: {ex.fuente} ({ex.periodo}, {ex.anios} años). Tormenta de diseño por {ex.tormenta.metodo}.
                ERA5 (~10 km) puede subestimar heladas en valles — orientativo.
              </p>
            </Section>
          );
        })()}

        {/* ── Contexto ecológico y cultural ── */}
        {presente.contexto && datos.clima?.koppen && (() => {
          const centro = centroide(datos.mojones);
          const bioma = fichaBioma(determinarBioma(datos.clima.koppen, centro.lat, centro.lng, datos.topo?.elev_media));
          const analogos = analogosDeKoppen(datos.clima.koppen);
          return (
            <Section numero={sec.contexto!} titulo="Contexto ecológico y cultural">
              <div className="mb-3">
                <p className="font-semibold text-base text-ink-950">{bioma.emoji} {bioma.nombre}</p>
                <p className="text-sm text-ink-700/80 mt-0.5">{bioma.resumen}</p>
              </div>
              <Table
                head={['Aspecto', 'Descripción']}
                rows={[
                  ['Vegetación', bioma.vegetacion],
                  ['Fauna', bioma.fauna],
                  ['Suelos', bioma.suelos],
                  ['Especies clave', bioma.especies.join(', ')],
                ]}
                colAlign={['left', 'left']}
              />
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2 mt-4">Saberes ancestrales y tradicionales</p>
              <div className="space-y-2">
                {bioma.saberes.map((s, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold text-moss-700">{s.cultura}: </span>
                    <span className="text-ink-700/80">{s.practicas}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2 mt-4">Análogos en el mundo · {analogos.titulo}</p>
              <p className="text-sm text-ink-700/80"><span className="font-semibold">Regiones similares:</span> {analogos.regiones.join(', ')}.</p>
              <ul className="mt-1 space-y-0.5">
                {analogos.tecnicas.map((t, i) => (
                  <li key={i} className="text-sm text-ink-700/80 flex gap-1.5"><span className="text-moss-700 shrink-0">→</span>{t}</li>
                ))}
              </ul>
              <p className="text-xs text-ink-700/50 mt-3 italic">
                Contenido de divulgación derivado del clima y la ubicación. Orientativo — verificá los saberes locales con las comunidades de la zona.
              </p>
            </Section>
          );
        })()}

        {/* ── Contexto vivo (biodiversidad y entorno) ── */}
        {datos.entorno && (
          <Section numero={sec.entorno!} titulo="Contexto vivo (biodiversidad y entorno)">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Registros GBIF" value={datos.entorno.total_bio.toLocaleString('es-AR')} sub={`en ${datos.entorno.radio_km} km`} />
              <StatBlock label="Fauna" value={datos.entorno.fauna.toLocaleString('es-AR')} sub="registros" />
              <StatBlock label="Flora" value={datos.entorno.flora.toLocaleString('es-AR')} sub="registros" />
              <StatBlock label="Amenazadas" value={String(datos.entorno.amenazadas)} sub="registros IUCN" />
            </div>
            {datos.entorno.ubicacion && (
              <p className="text-sm text-ink-700/80 mb-3">Ubicación: {datos.entorno.ubicacion}.</p>
            )}
            {datos.entorno.especies_top.length > 0 && (
              <Table
                head={['Especie más observada', 'Registros']}
                rows={datos.entorno.especies_top.map(e => [e.nombre, e.obs.toLocaleString('es-AR')])}
                colAlign={['left', 'right']}
              />
            )}
            {datos.entorno.areas_protegidas.length > 0 && (
              <p className="text-xs text-ink-700/70 mt-2">Áreas protegidas cercanas: {datos.entorno.areas_protegidas.slice(0, 4).join(', ')}.</p>
            )}
            <p className="text-xs text-ink-700/50 mt-2 italic">
              GBIF (biodiversidad) + OpenStreetMap — datos abiertos de ciencia ciudadana, orientativos.
            </p>
          </Section>
        )}

        {/* ── 3. Topografía ── */}
        {datos.topo && (
          <Section numero={sec.topo!} titulo="Topografía">
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
            numero={sec.captacion!}
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
            numero={sec.suelo!}
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

            {/* Agua útil y grupo hidrológico (perfil completo) */}
            {datos.suelo.agua_util && datos.suelo.grupo_hidro && (
              <>
                <div className="grid grid-cols-4 gap-3 mt-4 mb-3">
                  <StatBlock label="Agua útil 0–100 cm" value={`${datos.suelo.agua_util.total_mm_100} mm`} sub={datos.suelo.agua_util.clase} />
                  <StatBlock label="Agua útil 0–200 cm" value={`${datos.suelo.agua_util.total_mm_200} mm`} sub="perfil total" />
                  <StatBlock label="Grupo hidrológico" value={datos.suelo.grupo_hidro.grupo} sub={`Infiltr. ${datos.suelo.grupo_hidro.infiltracion.toLowerCase()}`} />
                  <StatBlock label="CN referencia" value={String(datos.suelo.grupo_hidro.cn_pastura)} sub="pastura buena" />
                </div>
                {datos.suelo.perfil && datos.suelo.perfil.length > 0 && (
                  <Table
                    head={['Profundidad', 'Textura', 'Arc/Are %', 'Agua útil', 'Ksat mm/h']}
                    rows={datos.suelo.perfil.map(c => [
                      c.label,
                      c.clase_textura,
                      `${c.arcilla}/${c.arena}`,
                      `${c.awc_mm} mm`,
                      String(c.ksat),
                    ])}
                    colAlign={['left', 'left', 'right', 'right', 'right']}
                  />
                )}
              </>
            )}

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
              Fuente: SoilGrids (ISRIC) — resolución ~250 m. Agua útil, Ksat y grupo hidrológico
              estimados por pedotransferencia Saxton-Rawls (2006). Orientativo, no reemplaza análisis de laboratorio.
            </p>
          </Section>
        )}

        {/* ── Red de agua por tubería ── */}
        {/* ── Cobertura del suelo ── */}
        {datos.cobertura && (
          <Section numero={sec.cobertura!} titulo="Cobertura del suelo (satelital)">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Dominante" value={datos.cobertura.dominante} sub={`ESA WorldCover ${datos.cobertura.anio}`} />
              <StatBlock label="Vegetación" value={`${datos.cobertura.veg_pct}%`} sub="cobertura vegetal" />
              <StatBlock label="Arbolado" value={`${datos.cobertura.arbolado_pct}%`} sub="bosque/arbolado" />
              <StatBlock label="Suelo desnudo" value={`${datos.cobertura.suelo_pct}%`} sub="ralo/expuesto" />
            </div>
            <Table
              head={['Clase de cobertura', '% del predio']}
              rows={datos.cobertura.top.map(t => [t.nombre, `${t.pct} %`])}
              colAlign={['left', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              ESA WorldCover 10 m ({datos.cobertura.anio}) vía Microsoft Planetary Computer — clasificación satelital, orientativo.
            </p>
          </Section>
        )}

        {datos.redAgua && (
          <Section numero={sec.redAgua!} titulo="Red de agua por tubería">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Presión en extremo" value={`${datos.redAgua.presion_final_mca} m.c.a.`} sub="dinámica residual" />
              <StatBlock label="Presión mínima" value={`${datos.redAgua.presion_min_mca} m.c.a.`} sub="punto más exigido" />
              <StatBlock label="Velocidad" value={`${datos.redAgua.velocidad_ms} m/s`} sub="en la tubería" />
              <StatBlock label="Clase de caño" value={`PN ${datos.redAgua.pn_recomendado}`} sub="recomendada" />
            </div>
            <Table
              head={['Parámetro', 'Valor']}
              rows={[
                ['Traza (camino)', datos.redAgua.camino],
                ['Material', datos.redAgua.material],
                ['Diámetro nominal', `DN ${datos.redAgua.diametro}`],
                ['Caudal de diseño', datos.redAgua.caudal],
                ['Longitud', `${datos.redAgua.longitud_m} m`],
                ...(datos.redAgua.bomba_kw != null ? [['Bombeo requerido', `${datos.redAgua.bomba_kw} kW`]] : []),
              ]}
              colAlign={['left', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Pérdida de carga por Hazen-Williams · cotas SRTM ~30 m. Diseño preliminar.
            </p>
          </Section>
        )}

        {/* ── Simulación de represa ── */}
        {datos.represa && (
          <Section numero={sec.represa!} titulo="Represa / reservorio — balance anual">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Confiabilidad" value={`${datos.represa.confiabilidad_pct}%`} sub={datos.represa.aguanta ? 'aguanta el año' : 'con déficit'} />
              <StatBlock label="Capacidad" value={`${(datos.represa.capacidad_m3 / 1000).toFixed(1)} dam³`} sub={`${datos.represa.capacidad_m3.toLocaleString('es-AR')} m³`} />
              <StatBlock label="Cuenca de aporte" value={`${datos.represa.cuenca_ha} ha`} sub="escurrimiento" />
              <StatBlock label="Demanda" value={`${datos.represa.demanda_m3_mes} m³`} sub="por mes" />
            </div>
            <Table
              head={['Parámetro', 'Valor']}
              rows={[
                ['Aporte anual estimado', `${datos.represa.aporte_anual_m3.toLocaleString('es-AR')} m³`],
                ['Volumen mínimo (mes crítico)', `${datos.represa.volumen_min_m3.toLocaleString('es-AR')} m³`],
                ['Demanda anual', `${(datos.represa.demanda_m3_mes * 12).toLocaleString('es-AR')} m³`],
              ]}
              colAlign={['left', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              Balance mensual SCS + evaporación (ETP) + infiltración − demanda, convergido a ciclo estable. Clima NASA POWER — orientativo.
            </p>
          </Section>
        )}

        {/* ── Riego por sector ── */}
        {datos.riego && (
          <Section numero={sec.riego!} titulo="Riego por sector">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBlock label="Necesidad pico" value={`${datos.riego.neto_pico_mm_dia} mm/d`} sub={`neto · ${datos.riego.mes_pico}`} />
              <StatBlock label="Caudal continuo" value={`${datos.riego.caudal_continuo_ls} L/s`} sub="nodo de consumo (red)" />
              <StatBlock label="Volumen anual" value={`${datos.riego.volumen_anual_m3.toLocaleString('es-AR')} m³`} sub="bruto de riego" />
              <StatBlock label="Turno de riego" value={`c/${datos.riego.intervalo_dias} d`} sub={`lámina ${datos.riego.lamina_neta_mm} mm`} />
            </div>
            <Table
              head={['Parámetro', 'Valor']}
              rows={[
                ['Cultivo', datos.riego.cultivo],
                ['Sistema de riego', datos.riego.sistema],
                ['Superficie del sector', `${datos.riego.area_ha} ha`],
                ['Mes de mayor demanda', datos.riego.mes_pico],
                ['Lámina neta por turno', `${datos.riego.lamina_neta_mm} mm`],
              ]}
              colAlign={['left', 'right']}
            />
            <p className="text-xs text-ink-700/50 mt-2 italic">
              FAO-56 · ETc = ETo·Kc, precipitación efectiva y lámina según agua útil del suelo. El caudal continuo dimensiona el consumo en la red de agua — orientativo.
            </p>
          </Section>
        )}

        {/* ── 6. Zonificación ── */}
        {datos.zonas && datos.zonas.length > 0 && (
          <Section
            numero={sec.zonas!}
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

        {/* ── Carbono ── */}
        {datos.carbono && (
          <Section numero={sec.carbono!} titulo="Carbono">
            <div className="grid grid-cols-3 gap-4 mb-3">
              {datos.carbono.stock_suelo_tCO2e != null && (
                <StatBlock label="Stock en suelo" value={`${Math.round(datos.carbono.stock_suelo_tCO2e).toLocaleString('es-AR')} t`} sub="CO₂e (0–30 cm)" />
              )}
              <StatBlock label="Captura potencial" value={`${datos.carbono.captura_anual_tCO2e.toFixed(1)} t/año`} sub="CO₂e" />
              <StatBlock label="En 10 años" value={`${Math.round(datos.carbono.captura_10anios_tCO2e).toLocaleString('es-AR')} t`} sub="CO₂e" />
            </div>
            {datos.carbono.practicas.length > 0 && (
              <p className="text-sm text-ink-700/80">
                <span className="font-semibold">Prácticas consideradas:</span> {datos.carbono.practicas.join(', ')}.
              </p>
            )}
            <p className="text-xs text-ink-700/50 mt-2">Estimación orientativa con coeficientes medios de literatura; para créditos de carbono se requiere muestreo y metodología certificada.</p>
          </Section>
        )}

        {/* ── Presupuesto y retorno ── */}
        {datos.economia && (
          <Section numero={sec.economia!} titulo="Presupuesto y retorno">
            <Table
              head={['Concepto', 'Cantidad', 'Precio', 'Subtotal']}
              rows={datos.economia.rubros.map(r => [
                r.concepto || '—',
                `${r.cantidad.toLocaleString('es-AR')} ${r.unidad}`,
                formatearMoneda(r.precioUnit, datos.economia!.moneda),
                formatearMoneda(r.subtotal, datos.economia!.moneda),
              ])}
              colAlign={['left', 'right', 'right', 'right']}
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <StatBlock label="Inversión total" value={formatearMoneda(datos.economia.total, datos.economia.moneda)} sub="obras" />
              {datos.economia.margenAnual > 0 && (
                <StatBlock label="Margen anual" value={formatearMoneda(datos.economia.margenAnual, datos.economia.moneda)} sub="ingreso − costo" />
              )}
              {datos.economia.payback_anios != null && (
                <StatBlock label="Recuperación" value={`${datos.economia.payback_anios.toFixed(1)} años`} sub="repago de la inversión" />
              )}
            </div>
            <p className="text-xs text-ink-700/50 mt-2">Precios orientativos; validar con proveedores de la zona.</p>
          </Section>
        )}

        {/* ── Anexo: fuentes y metodología ── */}
        <Section numero="A" titulo="Anexo — fuentes y metodología">
          <ul className="text-xs text-ink-700/70 space-y-1 leading-relaxed list-disc pl-4">
            <li><span className="font-medium">Imagen satelital:</span> Esri World Imagery.</li>
            <li><span className="font-medium">Topografía:</span> modelo de elevación SRTM/Terrarium (~30 m).</li>
            {datos.clima && <li><span className="font-medium">Clima:</span> {datos.clima.fuente ?? 'NASA POWER / Open-Meteo'}.</li>}
            {datos.extremos && <li><span className="font-medium">Extremos:</span> {datos.extremos.fuente} ({datos.extremos.periodo}).</li>}
            {datos.suelo && <li><span className="font-medium">Suelo:</span> SoilGrids (ISRIC); agua útil por pedotransferencia Saxton-Rawls (2006).</li>}
            {datos.cobertura && <li><span className="font-medium">Cobertura:</span> ESA WorldCover 10 m ({datos.cobertura.anio}).</li>}
            {datos.entorno && <li><span className="font-medium">Biodiversidad:</span> GBIF; entorno OpenStreetMap.</li>}
            {datos.carbono && <li><span className="font-medium">Carbono:</span> coeficientes medios de literatura (orientativo).</li>}
          </ul>
          <p className="text-xs text-ink-700/50 mt-3 leading-relaxed">
            Los valores son orientativos y no reemplazan un relevamiento topográfico, edafológico o climático profesional.
            Verificar en campo antes de ejecutar obras.
          </p>
        </Section>

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

/** Página de portada: marca, nombre del predio, ubicación, plano y datos clave. */
function Portada({ datos, metricas, fechaLarga }: { datos: InformeData; metricas: MetricasPoligono | null; fechaLarga: string }) {
  const c = datos.mojones.length >= 3 ? centroide(datos.mojones) : null;
  const ubic = datos.entorno?.ubicacion ?? (c ? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}` : null);
  return (
    <div style={{ pageBreakAfter: 'always' }} className="min-h-[86vh] flex flex-col">
      <div className="flex items-start justify-between">
        <p className="eyebrow">Arte y Tierra</p>
        <p className="text-xs text-ink-700/50">{fechaLarga}</p>
      </div>

      <div className="mt-10">
        <p className="text-sm uppercase tracking-[0.22em] text-ink-700/50">Análisis de Terreno</p>
        <h1 className="font-display text-4xl text-ink-950 leading-tight mt-2">{datos.nombre}</h1>
        {ubic && <p className="text-base text-ink-700 mt-2">{ubic}</p>}
      </div>

      {datos.mapaDataUrl && (
        <img
          src={datos.mapaDataUrl}
          alt="Plano del predio"
          className="mt-8 w-full rounded-xl border border-bone-200 shadow object-cover"
          style={{ maxHeight: '46vh' }}
        />
      )}

      <div className="mt-8 grid grid-cols-3 gap-4">
        {metricas && <StatBlock label="Superficie" value={`${metricas.area_ha.toFixed(2)} ha`} sub={`${Math.round(metricas.area_m2).toLocaleString('es-AR')} m²`} />}
        {metricas && <StatBlock label="Perímetro" value={formatearDistancia(metricas.perimetro_m)} sub={`${datos.mojones.length} mojones`} />}
        {datos.clima?.koppen && <StatBlock label="Clima" value={datos.clima.koppen.codigo} sub={datos.clima.koppen.descripcion} />}
      </div>

      <div className="flex-1" />

      <div className="mt-10 pt-6 border-t border-bone-200 flex items-end justify-between gap-6">
        <div className="flex items-center gap-3">
          {datos.profesional?.logoDataUrl && (
            <img src={datos.profesional.logoDataUrl} alt="" className="h-12 w-12 object-contain shrink-0" />
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-700/40">Elaborado por</p>
            {datos.profesional ? (
              <>
                <p className="text-sm font-semibold text-ink-950 mt-0.5">{datos.profesional.nombre}</p>
                {datos.profesional.matricula && <p className="text-xs text-ink-700/70">{datos.profesional.matricula}</p>}
                {(datos.profesional.contacto || datos.profesional.web) && (
                  <p className="text-xs text-ink-700/60">{[datos.profesional.contacto, datos.profesional.web].filter(Boolean).join(' · ')}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink-950 mt-0.5">Arte y Tierra</p>
                <p className="text-xs text-ink-700/60">arteytierra.org</p>
              </>
            )}
          </div>
        </div>
        <p className="text-[10px] text-ink-700/40 text-right max-w-[45%]">
          {datos.profesional ? 'Con tecnología de Arte y Tierra · Terreno. ' : ''}Análisis orientativo a partir de imágenes satelitales y modelos públicos. Verificar en campo antes de ejecutar obras.
        </p>
      </div>
    </div>
  );
}

/** Segunda página: indicadores clave del predio + aspectos a considerar. */
function ResumenEjecutivo({ datos, metricas }: { datos: InformeData; metricas: MetricasPoligono | null }) {
  const ind: Array<{ label: string; value: string; sub: string; tono?: Tono }> = [];
  if (metricas) ind.push({ label: 'Superficie', value: `${metricas.area_ha.toFixed(2)} ha`, sub: 'del predio' });
  if (datos.clima) {
    ind.push({ label: 'Precipitación', value: `${Math.round(datos.clima.precip_anual_mm)} mm`, sub: 'media anual' });
    if (datos.clima.aridez) {
      const seco = /árid|arid|semi/.test(datos.clima.aridez.clase.toLowerCase());
      ind.push({ label: 'Aridez', value: datos.clima.aridez.clase, sub: `índice ${datos.clima.aridez.valor.toFixed(2)}`, tono: seco ? 'warn' : 'ok' });
    }
  }
  if (datos.topo) {
    const p = datos.topo.pendiente_pct;
    ind.push({ label: 'Pendiente media', value: `${p.toFixed(1)} %`, sub: datos.topo.orientacion ?? 'orientación s/d', tono: p > 15 ? 'alert' : p > 8 ? 'warn' : 'ok' });
  }
  if (datos.suelo) {
    const aw = datos.suelo.agua_util.total_mm_100;
    ind.push({ label: 'Agua útil', value: `${Math.round(aw)} mm`, sub: datos.suelo.agua_util.clase, tono: aw < 100 ? 'warn' : 'ok' });
    const g = datos.suelo.grupo_hidro.grupo;
    ind.push({ label: 'Suelo', value: datos.suelo.interp.textura.clase, sub: `grupo hidro. ${g}`, tono: g === 'D' ? 'alert' : g === 'C' ? 'warn' : 'ok' });
  }
  if (datos.cobertura) ind.push({ label: 'Cobertura', value: datos.cobertura.dominante, sub: `veg. ${Math.round(datos.cobertura.veg_pct)} %` });

  // Aspectos a considerar, derivados de umbrales sobre los datos presentes.
  const notas: string[] = [];
  const ar = datos.clima?.aridez?.clase?.toLowerCase() ?? '';
  if (datos.clima?.aridez && (ar.includes('árid') || ar.includes('arid') || ar.includes('semi')))
    notas.push(`Clima ${datos.clima.aridez.clase.toLowerCase()}: priorizar captación, almacenamiento y retención de agua (represas, keyline, cobertura).`);
  const mh = datos.clima?.heladas?.meses_riesgo;
  if (mh && mh.length) notas.push(`Riesgo de heladas (${mh.join(', ')}): elegir especies y fechas de siembra acordes.`);
  if (datos.topo) {
    const p = datos.topo.pendiente_pct;
    if (p > 15) notas.push(`Pendiente media pronunciada (${p.toFixed(0)} %): riesgo de erosión; considerar terrazas, keyline o cobertura permanente.`);
    else if (p > 8) notas.push(`Pendiente media moderada (${p.toFixed(0)} %): manejar el escurrimiento con trazados a nivel.`);
  }
  if (datos.suelo) {
    if (datos.suelo.agua_util.total_mm_100 < 100) notas.push(`Baja capacidad de agua útil (${Math.round(datos.suelo.agua_util.total_mm_100)} mm): suelos de poca retención; aportar materia orgánica.`);
    const g = datos.suelo.grupo_hidro.grupo;
    if (g === 'C' || g === 'D') notas.push(`Grupo hidrológico ${g}: baja infiltración y mayor escurrimiento; dimensionar drenajes y reservorios en consecuencia.`);
  }
  if (datos.extremos && datos.extremos.sequia.racha_max_dias > 30)
    notas.push(`Racha seca histórica de ${datos.extremos.sequia.racha_max_dias} días: prever reserva de agua para el período crítico.`);
  if (datos.cobertura && datos.cobertura.suelo_pct > 30)
    notas.push(`Suelo descubierto en ${Math.round(datos.cobertura.suelo_pct)} % del predio: oportunidad de aumentar la cobertura vegetal.`);

  if (!ind.length) return null;

  return (
    <div className="page-break-before space-y-5">
      <div>
        <p className="eyebrow">Síntesis</p>
        <h2 className="font-display text-2xl text-ink-950 mt-1">Resumen ejecutivo</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ind.map((it, i) => <StatBlock key={i} label={it.label} value={it.value} sub={it.sub} tono={it.tono} />)}
      </div>

      {notas.length > 0 && (
        <div className="rounded-lg border border-moss-200 bg-moss-50 p-4">
          <p className="text-xs font-semibold text-moss-900 uppercase tracking-wide mb-2">Aspectos a considerar</p>
          <ul className="space-y-1.5">
            {notas.map((n, i) => (
              <li key={i} className="text-sm text-ink-800 flex gap-2">
                <span className="text-moss-700 mt-0.5">•</span><span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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

type Tono = 'ok' | 'warn' | 'alert';
const TONO_STAT: Record<Tono, string> = {
  ok:    'bg-moss-50 border-moss-200',
  warn:  'bg-sun-500/10 border-sun-500/30',
  alert: 'bg-clay-700/10 border-clay-700/30',
};

function StatBlock({ label, value, sub, tono }: { label: string; value: string; sub: string; tono?: Tono }) {
  return (
    <div className={`rounded-lg p-3 border ${tono ? TONO_STAT[tono] : 'bg-bone-50 border-bone-200'}`}>
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
