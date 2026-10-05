'use client';

/**
 * AleroBloque — el control solar de las aberturas, dentro del panel solar.
 *
 * Muestra cuatro cosas que el panel no tenía: en qué meses hay que dar sombra
 * según la serie del predio, cuánto alero pide cada rumbo de pared, qué hace el
 * alero que ya está construido, y el límite que ningún alero fijo puede pasar.
 *
 * Todo el cálculo vive en `lib/alero.ts`, con fuentes. Acá sólo se elige y se
 * escribe.
 */

import { useMemo, useState } from 'react';
import { Sun, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import {
  ALERO_NO_ES_AISLACION,
  ORIENTACIONES,
  aleroDeUnaPared,
  controlSolar,
  desempenoAlero,
  hhmm,
  relojDeHoraSolar,
} from '@/lib/alero';
import type { DatosClima } from '@/lib/clima';

interface Props {
  lat: number;
  lng: number;
  datosClima: DatosClima | null;
}

/** Los ocho rumbos que se ofrecen como botón; los dieciséis van en la tabla. */
const RUMBOS_BOTON = [0, 45, 90, 135, 180, 225, 270, 315];

export function AleroBloque({ lat, lng, datosClima }: Props) {
  const [alto, setAlto] = useState(1.5);
  const [rumbo, setRumbo] = useState<number | null>(null);
  const [utc, setUtc] = useState<number | null>(null);
  const [profundidad, setProfundidad] = useState('');
  const [porQue, setPorQue] = useState(false);

  const utcEfectivo = utc ?? Math.round(lng / 15);
  const meridiano = utcEfectivo * 15;

  const series = useMemo(() => {
    if (!datosClima || datosClima.meses.length !== 12) return null;
    return {
      tmean: datosClima.meses.map(m => m.tmean_c),
      tmax: datosClima.meses.map(m => m.tmax_c),
    };
  }, [datosClima]);

  const control = useMemo(() => {
    if (!series) return null;
    return controlSolar(lat, lng, series.tmean, series.tmax, alto, { meridiano });
  }, [series, lat, lng, alto, meridiano]);

  // Por defecto se elige la pared que mira al ecuador, que es la que todo el
  // mundo mira primero y la que el enunciado daba por única.
  const rumboEfectivo = rumbo ?? (lat < 0 ? 0 : 180);

  const pared = useMemo(() => {
    if (!control) return null;
    const meses = control.periodo.indices.length > 0 ? control.periodo.indices : undefined;
    return aleroDeUnaPared(lat, lng, rumboEfectivo, alto, { meses, meridiano });
  }, [control, lat, lng, rumboEfectivo, alto, meridiano]);

  const prof = Number(profundidad.replace(',', '.'));
  const desempeno = useMemo(() => {
    if (!control || !Number.isFinite(prof) || prof <= 0) return null;
    const meses = control.periodo.indices.length > 0 ? control.periodo.indices : undefined;
    return desempenoAlero(lat, lng, rumboEfectivo, alto, prof, { meses, meridiano });
  }, [control, lat, lng, rumboEfectivo, alto, prof, meridiano]);

  if (!datosClima) {
    return (
      <div className="rounded-xl border border-bone-200 bg-bone-50 p-3 space-y-1">
        <p className="text-xs font-semibold text-ink-700">Aleros y control solar</p>
        <p className="text-[11px] text-ink-700/70 leading-relaxed">
          Calculá primero el clima del predio. El alero no se dimensiona con el solsticio sino con los
          meses que realmente se calientan acá, y eso sale de la serie de temperaturas.
        </p>
      </div>
    );
  }

  if (!control || !pared) return null;

  const { periodo, simetria, dosLados, tabla, panel } = control;
  const nombreRumbo = ORIENTACIONES.find(o => o.az === rumboEfectivo)?.nombre ?? `${rumboEfectivo}°`;
  const pfMax = Math.max(...tabla.filas.map(f => f.pf));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-1.5">
        <Sun className="w-3.5 h-3.5" />
        Aleros y control solar
      </p>

      {/* ── Cuándo hay que dar sombra ───────────────────────────────────────── */}
      <div className="rounded-xl border border-sun-200 bg-sun-50 p-3 space-y-1.5">
        <p className="text-[10px] text-clay-700/70 uppercase tracking-wide">Meses que piden sombra</p>
        {periodo.indices.length === 0 ? (
          <p className="text-xs text-clay-800 leading-relaxed">
            Ninguno. Acá el alero no está para tapar calor sino para no tapar el sol de invierno, y el
            criterio se da vuelta: conviene el alero más corto que igual proteja la lluvia.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {periodo.meses.map(m => (
                <span
                  key={m.mes}
                  title={`máxima media ${m.tmax_c.toFixed(1)} °C · techo de confort ${m.limite_c.toFixed(1)} °C`}
                  className={
                    m.sobrecalentado
                      ? 'px-1.5 py-0.5 rounded text-[10px] font-medium bg-clay-500 text-bone-50'
                      : 'px-1.5 py-0.5 rounded text-[10px] bg-bone-200 text-ink-700/50'
                  }
                >
                  {m.nombre.slice(0, 3)}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-clay-700/80 leading-relaxed">
              Un mes pide sombra cuando su máxima media pasa el techo de confort adaptativo, que sube
              con el clima del lugar. En {periodo.meses[periodo.mes_pico ?? 0]!.nombre} el techo está en{' '}
              {periodo.meses[periodo.mes_pico ?? 0]!.limite_c.toFixed(1)} °C y la máxima media en{' '}
              {periodo.meses[periodo.mes_pico ?? 0]!.tmax_c.toFixed(1)} °C.
            </p>
          </>
        )}
        {control.costo_del_anio_entero && control.costo_del_anio_entero.factor > 1.2 && (
          <p className="text-[10px] text-clay-800 leading-relaxed border-t border-sun-200 pt-1.5">
            Dimensionar para los doce meses en vez de para estos pediría un alero{' '}
            <strong>{control.costo_del_anio_entero.factor.toFixed(1)} veces más profundo</strong>, porque
            el año entero incluye el sol rasante del invierno, que es justamente el que se quiere dejar
            entrar.
          </p>
        )}
      </div>

      {/* ── La pared elegida ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-bone-200 bg-white p-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {RUMBOS_BOTON.map(az => {
            const o = ORIENTACIONES.find(x => x.az === az)!;
            return (
              <button
                key={az}
                onClick={() => setRumbo(az)}
                className={
                  az === rumboEfectivo
                    ? 'px-2 py-1 rounded-lg text-[10px] font-semibold bg-moss-700 text-bone-50'
                    : 'px-2 py-1 rounded-lg text-[10px] bg-bone-100 text-ink-700 hover:bg-bone-200'
                }
              >
                {o.corto}
              </button>
            );
          })}
        </div>

        <div className="flex items-end gap-3">
          <div>
            <p className="text-[10px] text-ink-700/60">Alero para la pared al {nombreRumbo.toLowerCase()}</p>
            <p className="font-mono text-2xl font-bold text-ink-900 leading-none">
              {(pared.profundidad_m * 100).toFixed(0)} <span className="text-base">cm</span>
            </p>
          </div>
          <div className="text-[10px] text-ink-700/60 leading-tight pb-1">
            <p>corte {pared.vsa_corte.toFixed(0)}°</p>
            <p>{pared.pf.toFixed(2)} × el alto</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-[10px] text-ink-700/70">
          <Ruler className="w-3 h-3" />
          Alto a sombrear, del borde del alero al piso de la abertura
          <input
            type="number" step="0.1" min="0.3" max="6" value={alto}
            onChange={e => setAlto(Math.max(0.3, Math.min(6, Number(e.target.value) || 1.5)))}
            className="w-16 px-1.5 py-0.5 rounded border border-bone-300 font-mono text-[11px]"
          />
          m
        </label>

        <p className="text-[10px] text-ink-700/70 leading-relaxed border-t border-bone-100 pt-1.5">
          {pared.decidido_al_mediodia ? (
            <>
              Lo decide el sol del mediodía de {pared.critico.mes_nombre}, a{' '}
              {pared.critico.elevacion.toFixed(0)}° sobre el horizonte. Es el único caso en el que la
              latitud y la altura del mediodía alcanzan para dimensionar.
            </>
          ) : (
            <>
              Lo decide el sol de las {hhmm(pared.critico.hora_reloj)} de {pared.critico.mes_nombre}, a{' '}
              {Math.abs(pared.critico.hsa).toFixed(0)}° del eje de la pared y{' '}
              {pared.critico.elevacion.toFixed(0)}° sobre el horizonte. La altura del mediodía no ve ese
              rato.
            </>
          )}
        </p>
        {pared.mas_profundo_que_alto && (
          <p className="text-[10px] text-clay-700 leading-relaxed">
            El alero sale más profundo que el alto de la abertura. La fuente resuelve estos casos con
            celosías u ojos de buey, que mantienen el mismo ángulo de corte repartido en piezas chicas.
          </p>
        )}
      </div>

      {/* ── Los dieciséis rumbos ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-bone-200 bg-white overflow-hidden">
        <div className="px-3 py-2 border-b border-bone-200">
          <p className="text-xs font-medium text-ink-700">Lo que pide cada rumbo de pared</p>
          <p className="text-[10px] text-ink-700/60 leading-relaxed mt-0.5">
            El peor rumbo pide <strong>{tabla.factor.toFixed(1)} veces</strong> más alero que el mejor en
            este mismo predio: {tabla.peor.nombre.toLowerCase()} contra {tabla.mejor.nombre.toLowerCase()}.
            La pared que mira al ecuador no es la que manda.
          </p>
        </div>
        <div className="px-2 py-2 space-y-0.5">
          {tabla.filas.map(f => (
            <div key={f.az} className="flex items-center gap-1.5" title={`decide ${f.mes_critico} ${f.hora_critica}`}>
              <span
                className={
                  f.az === rumboEfectivo
                    ? 'w-8 text-[10px] font-bold text-moss-700 text-right'
                    : 'w-8 text-[10px] text-ink-700/60 text-right'
                }
              >
                {f.corto}
              </span>
              <div className="flex-1 h-3 bg-bone-100 rounded-sm overflow-hidden">
                <div
                  className={f.az === rumboEfectivo ? 'h-full bg-moss-600' : 'h-full bg-moss-300'}
                  style={{ width: `${(f.pf / pfMax) * 100}%` }}
                />
              </div>
              <span className="w-20 text-[10px] font-mono text-ink-700/70 text-right">
                {(f.profundidad_m * 100).toFixed(0)} cm
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── El límite del alero fijo ────────────────────────────────────────── */}
      {simetria && (
        <div className="rounded-xl border border-water-200 bg-water-50 p-3 space-y-1">
          <p className="text-[10px] text-water-700 uppercase tracking-wide">
            Lo que ningún alero fijo puede hacer
          </p>
          <p className="text-xs text-water-800 leading-relaxed">{simetria.nota}</p>
          <p className="text-[10px] text-water-700/80 leading-relaxed">
            No se arregla con más profundidad: la geometría del sol es simétrica alrededor del solsticio
            y el clima no. Se arregla con una parte móvil, con una parra de hoja caduca, o aceptando el
            costo a sabiendas.
          </p>
        </div>
      )}

      {/* ── Trópicos ────────────────────────────────────────────────────────── */}
      {dosLados.tropico && (
        <div className="rounded-xl border border-moss-200 bg-moss-50 p-3 space-y-1">
          <p className="text-[10px] text-moss-700 uppercase tracking-wide">Las dos paredes, no una</p>
          <p className="text-xs text-moss-800 leading-relaxed">{dosLados.nota}</p>
        </div>
      )}

      {/* ── El alero que ya está ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-bone-200 bg-bone-50 p-3 space-y-1.5">
        <p className="text-[10px] text-ink-700/60 uppercase tracking-wide">
          ¿Y el alero que ya tengo?
        </p>
        <label className="flex items-center gap-2 text-[11px] text-ink-700">
          Profundidad medida
          <input
            type="text" inputMode="decimal" placeholder="0,60" value={profundidad}
            onChange={e => setProfundidad(e.target.value)}
            className="w-20 px-1.5 py-0.5 rounded border border-bone-300 font-mono text-[11px]"
          />
          m
        </label>
        {desempeno && (
          <p className="text-[11px] text-ink-700/80 leading-relaxed">
            Tapa el <strong>{desempeno.sombra_pesada_pct.toFixed(0)} %</strong> del sol directo del
            período sobre esa pared. {desempeno.nota}
          </p>
        )}
      </div>

      {/* ── Panel fotovoltaico ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-bone-200 bg-white p-3 space-y-1">
        <p className="text-[10px] text-ink-700/60 uppercase tracking-wide">Inclinación de panel</p>
        <p className="text-xs text-ink-700 leading-relaxed">
          <span className="font-mono font-bold text-base text-ink-900">{panel.grados.toFixed(0)}°</span>{' '}
          desde la horizontal, mirando al {panel.orientacion}, para el máximo anual.
        </p>
        <p className="text-[10px] text-ink-700/60 leading-relaxed">
          La app mostraba antes {panel.grados_regla_vieja.toFixed(0)}°, de una regla sin fuente que
          optimiza el invierno y no el año. El valor de acá sale del ajuste publicado sobre PVWatts, y
          sigue siendo una estimación por latitud: dos ciudades a la misma latitud pueden diferir once
          grados según la nubosidad.
        </p>
      </div>

      {/* ── Por qué ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setPorQue(v => !v)}
        className="flex items-center gap-1 text-[10px] text-ink-700/60 hover:text-ink-700"
      >
        {porQue ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Por qué sale este número
      </button>

      {porQue && (
        <div className="rounded-xl border border-bone-200 bg-bone-50 p-3 space-y-2 text-[10px] text-ink-700/80 leading-relaxed">
          <p>
            Lo que tapa un alero horizontal no es la altura del sol sino el <strong>ángulo de sombra
            vertical</strong>: la altura proyectada sobre el plano perpendicular a la pared. Son dos
            números distintos en cuanto la pared no mira exactamente al ecuador, y por eso la tabla de
            arriba tiene dieciséis filas y no una.
          </p>

          <div className="border-t border-bone-200 pt-2 space-y-1">
            <p className="font-medium text-ink-700">La hora es hora solar, no de reloj</p>
            <p>
              El mediodía solar de este punto cae a las <strong>{tabla.mediodia_reloj}</strong> del reloj
              de UTC{utcEfectivo >= 0 ? '+' : ''}{utcEfectivo}: {Math.abs(tabla.desfase_min).toFixed(0)}{' '}
              minutos de corrimiento. La ventana de sombra va de 9 a 16 de reloj, así que no está
              centrada en el sol, y eso cambia qué pared manda.
            </p>
            <label className="flex items-center gap-2">
              Huso horario del predio (UTC)
              <input
                type="number" step="1" min="-12" max="14" value={utcEfectivo}
                onChange={e => setUtc(Math.max(-12, Math.min(14, Number(e.target.value) || 0)))}
                className="w-14 px-1.5 py-0.5 rounded border border-bone-300 font-mono text-[10px]"
              />
            </label>
            <p>
              Por defecto se usa el huso nominal de la longitud. Varios países usan otro por ley —la
              Argentina entre ellos, con el huso de 45° O para un territorio que llega a 73° O—, y ahí el
              mediodía solar puede caer pasadas las 13:30. Con hora solar el mediodía estaría a las{' '}
              {hhmm(relojDeHoraSolar(12, lng, Math.round(lng / 15) * 15))} del huso nominal.
            </p>
          </div>

          <div className="border-t border-bone-200 pt-2 space-y-1">
            <p className="font-medium text-ink-700">Lo que este cálculo no mira</p>
            <p>{ALERO_NO_ES_AISLACION}</p>
            <p>
              Es sombra geométrica del sol directo: sin radiación difusa, sin reflejo del piso ni de una
              pared vecina, y sin obstrucción del horizonte. Si hay monte alto al{' '}
              {dosLados.pared_ecuador}, el alero puede sobrar y eso lo ve la cuenca visual, no esto.
              También supone que el alero sobresale a los costados de la abertura: si no, el sol entra de
              flanco.
            </p>
          </div>

          {control.advertencias.length > 0 && (
            <div className="border-t border-bone-200 pt-2 space-y-1">
              {control.advertencias.map((a, i) => (
                <p key={i}>· {a}</p>
              ))}
            </div>
          )}

          {pared.advertencias.length > 0 && (
            <div className="border-t border-bone-200 pt-2 space-y-1">
              {pared.advertencias.map((a, i) => (
                <p key={i}>· {a}</p>
              ))}
            </div>
          )}

          <div className="border-t border-bone-200 pt-2 space-y-1">
            <p className="font-medium text-ink-700">Fuentes</p>
            {control.fuentes.map((f, i) => (
              <p key={i}>· {f}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
