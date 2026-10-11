'use client';

/**
 * Anexo B del informe: el modelo declarado.
 *
 * El anexo A dice de dónde salió cada dato. Este dice otra cosa, que hasta hoy
 * el informe no decía en ninguna parte: **cuánto puede valer cada número**.
 *
 * Son dos magnitudes, elegidas porque son las que están arriba de todo el resto:
 * la superficie del predio —de la que cuelgan la receptividad, el agua, el
 * presupuesto— y el desnivel —del que cuelgan la pendiente, las curvas, los
 * swales, la represa—. Si estas dos tienen un intervalo, todo lo que se
 * multiplica por ellas lo hereda.
 *
 * Está pensado para imprimirse: nada se despliega, todo se ve. El informe se
 * baja en PDF y se lleva al campo, y un panel cerrado en el papel es un panel
 * que no existe.
 */
import { Ruler, MountainSnow, ClipboardCheck, Scale } from 'lucide-react';

import {
  declararSuperficie, declararDesnivel, incertidumbreDeCota, leerDeclaracion,
  FUENTE_GUM, K_95,
  type ModeloDeclarado, type RenglonRelevamiento,
} from '../lib/modeloDeclarado';
import type { DatosTopografia } from '../lib/topografia';
import type { Mojon } from '../lib/types';

/**
 * Cuánto puede estar corrido cada mojón dibujado sobre la imagen satelital.
 *
 * **Esto es un supuesto, no un dato publicado**, y por eso va impreso: no
 * existe una exactitud publicada para «un clic sobre una imagen satelital», que
 * mezcla el error de georreferenciación del mosaico con el pulso de quien
 * dibuja y con el zoom al que dibujó. Dos metros es del orden del píxel de la
 * imagen a los zooms con los que se trabaja.
 *
 * Va declarado para que se pueda discutir. Quien tenga la mensura del lote sabe
 * que su error es de centímetros y puede decirlo; quien dibujó a ojo sobre una
 * imagen vieja sabe que son más de dos metros. Con un supuesto escrito hay algo
 * que mover; sin él, no.
 */
const SIGMA_MOJON_ASUMIDO_M = 2;

interface Props {
  mojones:  readonly Mojon[];
  topo?:    DatosTopografia | null;
  /** número o letra de la sección, para encajar con la numeración del informe */
  numero?:  string;
}

export function ModeloDeclaradoAnexo({ mojones, topo, numero = 'B' }: Props) {
  const superficie = declararSuperficie({
    mojones, sigma_vertice_m: SIGMA_MOJON_ASUMIDO_M,
  });

  const inc = incertidumbreDeCota(topo?.fuenteRelieve, topo?.pendiente_pct);
  const desnivel = topo
    ? declararDesnivel({
        cota_alta_m: topo.elev_max,
        cota_baja_m: topo.elev_min,
        // La distancia entre el punto más alto y el más bajo del muestreo, que
        // es sobre lo que el desnivel del informe está medido.
        distancia_m: distanciaM(topo.escurrimiento.desde, topo.escurrimiento.hacia),
        fuente: topo.fuenteRelieve,
        pendiente_pct: topo.pendiente_pct,
      })
    : null;

  const declaradas = [superficie, desnivel].filter((d): d is ModeloDeclarado => d != null);
  if (declaradas.length === 0 && !topo) return null;

  // El pedido de relevamiento es uno solo: el productor hace un viaje, no dos.
  // Se juntan los renglones de las dos magnitudes y se ordenan por lo que cada
  // medición gana, que es lo que decide qué vale la pena cargar en la camioneta.
  const relevamiento: Array<RenglonRelevamiento & { de: string }> = declaradas.flatMap(d =>
    d.relevamiento.map(r => ({ ...r, de: d.magnitud })),
  );
  relevamiento.sort((a, b) => b.ganancia - a.ganancia);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 border-b border-bone-200 pb-2">
        <span className="text-xs font-bold text-moss-700 bg-moss-100 rounded px-1.5 py-0.5">{numero}</span>
        <h2 className="font-semibold text-base text-ink-950 uppercase tracking-wide">
          Anexo — el modelo declarado
        </h2>
      </div>

      <p className="text-xs text-ink-700/70 leading-relaxed">
        El anexo anterior dice de dónde salió cada dato. Este dice cuánto puede
        valer cada número. Los dos de abajo están arriba de todo el resto del
        informe: la superficie, de la que cuelgan la receptividad, el agua y el
        presupuesto, y el desnivel, del que cuelgan la pendiente, las curvas de
        nivel, los swales y la represa. Todo lo que se multiplica por ellos
        hereda su intervalo.
      </p>

      {/* ── La fuente de relieve y su exactitud, o la falta de ella ── */}
      <div className="rounded-lg border border-bone-200 bg-bone-50 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-moss-700 shrink-0" />
          Lo que se asumió
        </p>
        <ul className="text-xs text-ink-700/70 leading-relaxed list-disc pl-4 space-y-1">
          <li>
            <span className="font-medium text-ink-800">Modelo de elevación:</span>{' '}
            {inc.etiqueta}, celdas de {inc.paso_m} m.{' '}
            {inc.motivo
              ? <span className="text-clay-800">{inc.motivo}</span>
              : <>Exactitud vertical publicada: {inc.exactitud!.le90_abs_m} m absoluta
                 y {inc.exactitud!.le90_rel_m} m punto a punto, las dos al 90 %
                 ({inc.exactitud!.base_declarada}). Convertidas a incertidumbre
                 típica: {inc.u_absoluta!.toFixed(2)} m y {inc.u_relativa!.toFixed(2)} m.</>}
          </li>
          <li>
            <span className="font-medium text-ink-800">Corrimiento de cada mojón:</span>{' '}
            {SIGMA_MOJON_ASUMIDO_M} m. <span className="italic">Es un supuesto y no un
            dato publicado</span>: no existe una exactitud publicada para un clic sobre
            una imagen satelital. Va escrito para que se pueda corregir — con la mensura
            del lote son centímetros.
          </li>
          <li>
            <span className="font-medium text-ink-800">Factor de cobertura:</span>{' '}
            k&nbsp;=&nbsp;{K_95}, que da un intervalo de ≈95 % de confianza.
          </li>
        </ul>
      </div>

      {/* ── Las magnitudes ── */}
      {declaradas.map(d => (
        <Magnitud key={d.magnitud} d={d} icono={
          d.unidad === 'm²'
            ? <Ruler className="w-3.5 h-3.5 text-moss-700 shrink-0" />
            : <MountainSnow className="w-3.5 h-3.5 text-moss-700 shrink-0" />
        } />
      ))}

      {/* ── El pedido de relevamiento ── */}
      {relevamiento.length > 0 && (
        <div className="rounded-lg border border-water-500/30 bg-water-500/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5 text-water-500 shrink-0" />
            Lo que hay que ir a medir, y en qué orden
          </p>
          <p className="text-xs text-ink-700/70 leading-relaxed">
            El orden no es una preferencia: sale de la cuenta. Para cada medición
            se vuelve a propagar todo el modelo con la incertidumbre que quedaría
            después de medirla, y lo que se informa es cuánto baja el intervalo.
            Medir algo que pone el 2 % de la varianza es un viaje al campo que no
            cambia el resultado, y por eso no está en esta lista.
          </p>
          <div className="rounded-lg border border-bone-200 overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-bone-100">
                  <th className="py-1.5 px-3 text-xs font-semibold text-ink-700/60 text-left">Qué medir</th>
                  <th className="py-1.5 px-3 text-xs font-semibold text-ink-700/60 text-left">Con qué</th>
                  <th className="py-1.5 px-3 text-xs font-semibold text-ink-700/60 text-right">Baja el intervalo</th>
                </tr>
              </thead>
              <tbody>
                {relevamiento.map((r, i) => (
                  <tr key={`${r.de}-${r.id}`} className={`border-t border-bone-100 ${i % 2 === 1 ? 'bg-bone-50/60' : ''}`}>
                    <td className="py-1.5 px-3 text-xs text-ink-800">
                      {r.medicion.que}
                      <span className="block text-ink-700/50">para {r.de.toLowerCase()}</span>
                    </td>
                    <td className="py-1.5 px-3 text-xs text-ink-800">
                      {r.medicion.como}
                      {r.medicion.esfuerzo && (
                        <span className="block text-ink-700/50">{r.medicion.esfuerzo}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-xs font-mono text-ink-800 text-right align-top">
                      −{Math.round(r.ganancia * 100)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-700/60 leading-relaxed">
            Con eso medido, el cálculo siguiente no es el mismo cálculo con más
            decimales: es otro cálculo. Es lo que convierte esta entrega en un
            ciclo.
          </p>
        </div>
      )}

      {/* ── Cómo se declara ── */}
      <div className="rounded-lg border border-bone-200 bg-white p-3 space-y-2">
        <p className="text-xs font-semibold text-ink-900">Por qué los números vienen con un ±</p>
        <p className="text-xs text-ink-700/70 leading-relaxed">
          Porque hay un estándar internacional que dice cómo se declara un
          resultado medido, y es el mismo que usa un laboratorio de calibración.
          De ahí sale todo: una cota publicada como «±a» se convierte en
          incertidumbre típica dividiendo por √3; un intervalo publicado al 90 %
          se divide por 1,64; las incertidumbres de las entradas se combinan por
          la ley de propagación, que compone las derivadas del modelo y no los
          números sueltos; el resultado se expande por k para dar un intervalo de
          confianza; y la incertidumbre se imprime con dos cifras significativas
          y el valor se redondea al mismo lugar.
        </p>
        <p className="text-xs text-ink-700/70 leading-relaxed">
          Ese último punto es el que más cambia lo que se ve en pantalla. Escribir
          «1.247,38 m³» cuando la incertidumbre es de 600 m³ no es más preciso: es
          menos honesto, porque las cifras de la derecha son ruido con aspecto de
          dato. Y cuando el intervalo termina siendo más ancho que el propio
          valor, el número sirve para saber el orden de magnitud y para decidir
          qué medir, no para dimensionar una obra.
        </p>
        <p className="text-xs text-ink-700/50 leading-relaxed border-t border-bone-100 pt-2">
          {FUENTE_GUM}
          {inc.exactitud && <> · {inc.exactitud.fuente}</>}
        </p>
      </div>
    </section>
  );
}

// ─── Una magnitud declarada ───────────────────────────────────────────────────

function Magnitud({ d, icono }: { d: ModeloDeclarado; icono: React.ReactNode }) {
  const r = d.redondeo;
  return (
    <div className="rounded-lg border border-bone-200 bg-white p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
          {icono}
          {d.magnitud}
        </p>
        <p className="font-mono text-sm font-bold text-ink-950">
          {r.valorTexto} ± {r.uTexto} {d.unidad}
          {d.relativa != null && (
            <span className="font-sans font-normal text-xs text-ink-700/50">
              {' '}({(d.relativa * 100).toFixed(0)} %, k = {d.k})
            </span>
          )}
        </p>
      </div>

      {/* Los metros cuadrados son la unidad en la que trabaja la fórmula; las
          hectáreas son la unidad del campo, y el informe habla en hectáreas. */}
      {d.unidad === 'm²' && Math.abs(r.valor) >= 10_000 && (
        <p className="font-mono text-xs text-ink-700/60">
          = {(r.valor / 10_000).toFixed(2)} ± {(r.u / 10_000).toFixed(2)} ha
        </p>
      )}

      <p className="text-xs text-ink-700/60 leading-relaxed">
        <span className="font-medium text-ink-800">El modelo:</span> {d.modelo}.
      </p>

      <div className="rounded-lg border border-bone-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bone-100">
              <th className="py-1 px-2.5 text-xs font-semibold text-ink-700/60 text-left">Entrada</th>
              <th className="py-1 px-2.5 text-xs font-semibold text-ink-700/60 text-right">u</th>
              <th className="py-1 px-2.5 text-xs font-semibold text-ink-700/60 text-right">Aporta</th>
              <th className="py-1 px-2.5 text-xs font-semibold text-ink-700/60 text-left">De dónde sale</th>
            </tr>
          </thead>
          <tbody>
            {d.propagacion.contribuciones.map((c, i) => {
              const e = d.entradas.find(x => x.id === c.id);
              return (
                <tr key={c.id} className={`border-t border-bone-100 ${i % 2 === 1 ? 'bg-bone-50/60' : ''}`}>
                  <td className="py-1 px-2.5 text-xs text-ink-800">
                    {c.rotulo}
                    <span className="text-ink-700/40"> · tipo {e?.tipo ?? 'B'}</span>
                  </td>
                  <td className="py-1 px-2.5 text-xs font-mono text-ink-800 text-right">
                    {e ? `${fmt(e.u)} ${e.unidad}` : '—'}
                  </td>
                  <td className={`py-1 px-2.5 text-xs font-mono text-right ${
                    c.fraccion < 0.005 ? 'text-moss-800' : 'text-ink-800'
                  }`}>
                    {c.fraccion < 0.005 ? '0 %' : `${(c.fraccion * 100).toFixed(0)} %`}
                  </td>
                  <td className="py-1 px-2.5 text-xs text-ink-700/60 leading-snug">{e?.origen ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {d.advertencias.length > 0 && (
        <ul className="text-xs text-clay-800 leading-relaxed list-disc pl-4 space-y-1">
          {d.advertencias.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      )}

      <p className="text-xs text-ink-700/40 leading-relaxed">{leerDeclaracion(d)}</p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const dec = n < 0.1 ? 3 : n < 10 ? 2 : n < 1000 ? 1 : 0;
  return n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function distanciaM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const latMedia = ((a.lat + b.lat) / 2) * Math.PI / 180;
  const dx = (b.lng - a.lng) * 111_320 * Math.cos(latMedia);
  const dy = (b.lat - a.lat) * 111_320;
  return Math.hypot(dx, dy);
}
