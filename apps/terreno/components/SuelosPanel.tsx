'use client';

import { useCallback } from 'react';
import { Layers, MapPin, Droplets, Waves, AlertTriangle, Cloud, Sprout, Bug, TreePine, Mountain } from 'lucide-react';
import { obtenerSuelo, type DatosSuelo, type InterpItem, type CapaSuelo } from '@/lib/suelos';
import {
  porQueEsteSuelo, ROTULO_HUMEDAD, ROTULO_TERMICO, ROTULO_INTENSIDAD, FUENTES_POR_QUE,
  type PorQueEsteSuelo, type LecturaSuelo,
} from '@/lib/sueloPorQue';
import {
  CONSECUENCIA, confianzaDelMapa, ladoEquivalenteKm,
  ROTULO_CONFIANZA, ROCA_NO_ES_MATERIAL_PARENTAL, FUENTE_MACROSTRAT,
  type RocaMadre,
} from '@/lib/rocaMadre';
import { centroide, type DatosClima } from '@/lib/clima';
import { Cautela } from './Cautela';
import type { Mojon } from '@/lib/types';

interface Props {
  mojones:    Mojon[];
  datos:      DatosSuelo | null;
  onDatos:    (d: DatosSuelo) => void;
  cargando:   boolean;
  onCargando: (v: boolean) => void;
  error:      string | null;
  onError:    (e: string | null) => void;
  /** Para explicar por qué el suelo es así. Sin esto la sección no aparece. */
  datosClima:  DatosClima | null;
  onIrAClima:  () => void;
}

export function SuelosPanel({
  mojones, datos, onDatos, cargando, onCargando, error, onError, datosClima, onIrAClima,
}: Props) {

  const centro = mojones.length > 0 ? centroide(mojones) : null;
  const porQue = porQueEsteSuelo(datos, datosClima);

  const handleAnalizar = useCallback(async () => {
    if (!centro) return;
    onCargando(true);
    onError(null);
    try {
      const d = await obtenerSuelo(centro.lat, centro.lng);
      onDatos(d);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al consultar SoilGrids');
    } finally {
      onCargando(false);
    }
  }, [centro, onDatos, onCargando, onError]);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Análisis de suelo
      </p>

      {/* ── Sin mojones ──────────────────────────────────────────────────────── */}
      {!centro ? (
        <div className="text-center py-8 px-4 space-y-2">
          <MapPin className="w-8 h-8 text-moss-700/40 mx-auto" />
          <p className="text-xs text-ink-700/60">
            Agregá mojones al terreno para analizar su suelo.
          </p>
        </div>
      ) : (
        <>
          {/* Encabezado del análisis */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs text-ink-700/60">
              Centroide del predio
            </p>
            <p className="font-mono text-xs text-ink-900">
              {centro.lat.toFixed(5)}, {centro.lng.toFixed(5)}
            </p>
            <p className="text-[10px] text-ink-700/50 leading-relaxed">
              Fuente: ISRIC SoilGrids v2.0 · 0–5 cm · ~250 m resolución.
              Valores orientativos — no reemplazan análisis de laboratorio.
            </p>
            <button
              onClick={handleAnalizar}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-50 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              {cargando ? 'Consultando SoilGrids…' : datos ? 'Actualizar datos' : 'Analizar suelo'}
            </button>
            {error && (
              <p className="text-xs text-clay-700 bg-clay-100 rounded-lg p-2">{error}</p>
            )}
          </div>

          {/* ── Resultados ───────────────────────────────────────────────────── */}
          {datos && !cargando && (
            <>
              {/* Propiedades principales */}
              <div className="grid grid-cols-2 gap-2">
                <SueloStat label="pH" value={datos.ph.toFixed(1)} interp={datos.interp.ph} />
                <SueloStat label="Carbono org." value={`${datos.carbono_org.toFixed(1)} g/kg`} interp={datos.interp.carbono} />
                <SueloStat label="Fertilidad" value={datos.interp.fertilidad.clase} interp={datos.interp.fertilidad} />
                <SueloStat label="Densidad ap." value={`${datos.densidad_ap.toFixed(2)} g/cm³`} interp={null} />
              </div>

              {/* Textura */}
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <p className="text-xs font-medium text-ink-700">Textura del suelo</p>
                <p className="font-mono text-base font-bold text-ink-900">
                  {datos.clase_textura}
                </p>
                <div className="space-y-1">
                  <TexturaBar label="Arcilla" valor={datos.arcilla} color="bg-clay-500" />
                  <TexturaBar label="Limo"    valor={datos.limo}    color="bg-sun-500" />
                  <TexturaBar label="Arena"   valor={datos.arena}   color="bg-bone-400" />
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">
                  {datos.interp.textura.descripcion}
                </p>
              </div>

              {/* Nitrógeno */}
              <div className="bg-white rounded-xl border border-bone-200 p-3">
                <p className="text-xs font-medium text-ink-700 mb-1">Nitrógeno total</p>
                <p className="font-mono text-sm font-bold text-ink-900">
                  {datos.nitrogeno.toFixed(2)} g/kg
                </p>
                <p className="text-[10px] text-ink-700/50 mt-0.5">
                  {datos.nitrogeno >= 1 ? 'Nivel adecuado' : datos.nitrogeno >= 0.5 ? 'Nivel medio — incorporar leguminosas' : 'Nivel bajo — enriquecer con N orgánico'}
                </p>
              </div>

              {/* Turba o suelo orgánico — antes que el perfil a propósito: si el
                  predio está sobre turba, eso manda sobre todos los demás
                  números del panel. */}
              {datos.organico && (
              <div className={`rounded-xl border p-3 space-y-1.5 ${
                datos.organico.nivel === 'turba'
                  ? 'bg-clay-100 border-clay-300'
                  : 'bg-sun-300/20 border-sun-300'
              }`}>
                <p className="text-xs font-semibold text-clay-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {datos.organico.nivel === 'turba' ? 'Turba: no drenar' : 'Suelo orgánico'}
                </p>
                <p className="text-[11px] text-ink-900 leading-relaxed">{datos.organico.cautela}</p>
                <p className="text-[10px] text-ink-700/70 leading-relaxed">{datos.organico.detalle}</p>
              </div>
              )}

              {/* Perfil vertical 0–200 cm */}
              {datos.perfil?.length > 0 && <PerfilSueloChart perfil={datos.perfil} />}

              {/* La roca de abajo. Va antes del «por qué» y no después porque es
                  una de las respuestas que el «por qué» anda buscando: cuando el
                  suelo no sigue al clima, el material parental suele ser la
                  explicación, y conviene tenerla leída. */}
              {datos.roca && <RocaMadreCard r={datos.roca} />}

              {/* Por qué este suelo es así. Va acá, después de los números y del
                  perfil, porque explica los dos: el pH y la textura de arriba, y
                  la forma de la curva de carbono del perfil. */}
              {porQue
                ? <PorQueSuelo p={porQue} />
                : (
                  <div className="bg-bone-50 rounded-xl border border-bone-200 p-3 text-center space-y-2">
                    <p className="text-xs text-ink-700/70 leading-relaxed">
                      Con el clima del predio esta pantalla puede explicar <strong>por qué</strong> el
                      suelo es así: por qué tiene ese pH, esa textura y esa materia orgánica.
                    </p>
                    <button
                      onClick={onIrAClima}
                      className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Ir a Clima
                    </button>
                  </div>
                )}

              {/* Agua útil */}
              {datos.agua_util && (
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-moss-700" /> Agua útil disponible
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    datos.agua_util.color === 'verde' ? 'bg-moss-50 text-moss-700' :
                    datos.agua_util.color === 'amarillo' ? 'bg-sun-300/30 text-clay-700' : 'bg-clay-100 text-clay-700'
                  }`}>
                    {datos.agua_util.clase}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-bone-50 rounded-lg p-2">
                    <p className="text-[9px] text-ink-700/60">0–100 cm · zona radicular</p>
                    <p className="font-mono text-sm font-bold text-moss-700">{datos.agua_util.total_mm_100} mm</p>
                  </div>
                  <div className="bg-bone-50 rounded-lg p-2">
                    <p className="text-[9px] text-ink-700/60">0–200 cm · perfil total</p>
                    <p className="font-mono text-sm font-bold text-ink-900">{datos.agua_util.total_mm_200} mm</p>
                  </div>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">{datos.agua_util.descripcion}</p>
              </div>
              )}

              {/* Grupo hidrológico SCS */}
              {datos.grupo_hidro && (
              <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-1.5">
                <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-moss-700" /> Grupo hidrológico (SCS)
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold font-mono leading-none ${
                    datos.grupo_hidro.grupo === 'A' ? 'text-moss-700' :
                    datos.grupo_hidro.grupo === 'B' ? 'text-moss-900' :
                    datos.grupo_hidro.grupo === 'C' ? 'text-clay-700' : 'text-clay-700'
                  }`}>
                    {datos.grupo_hidro.grupo}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-800">Infiltración {datos.grupo_hidro.infiltracion.toLowerCase()}</p>
                    <p className="font-mono text-[10px] text-ink-700/60">
                      Ksat mín {datos.grupo_hidro.ksat_min} mm/h · capa {datos.grupo_hidro.capa_limitante}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-ink-700/60 leading-relaxed">{datos.grupo_hidro.descripcion}</p>
                <p className="text-[10px] text-ink-700/50 bg-bone-50 rounded-lg p-1.5">
                  CN referencia (pastura en buen estado): <span className="font-mono font-semibold text-ink-800">{datos.grupo_hidro.cn_pastura}</span> — base para cálculo de escorrentía y diseño hidrológico.
                </p>
              </div>
              )}

              {/* Recomendaciones */}
              <div className="bg-moss-50 rounded-xl border border-moss-200 p-3 space-y-1.5">
                <p className="text-xs font-medium text-moss-900">Recomendaciones</p>
                {datos.interp.recomendaciones.map((r, i) => (
                  <p key={i} className="text-xs text-moss-700 flex gap-1.5">
                    <span className="shrink-0 mt-0.5">→</span>
                    {r}
                  </p>
                ))}
              </div>

              <p className="text-[9px] text-ink-700/40 italic">{datos.fuente}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componentes internos ─────────────────────────────────────────────────────

/** Coma decimal, que es como se escribe un número en castellano. */
const coma = (n: number, dec = 2) => n.toFixed(dec).replace('.', ',');

/**
 * Una lectura: lo que el clima predice, lo que el dato mide, y qué significa que
 * no coincidan.
 *
 * El acuerdo se pinta, y se pinta al revés de lo que uno esperaría: la
 * discrepancia **no es roja**. Que el suelo no siga al clima no es un problema
 * del predio ni un error del dato; es el material parental hablando, y suele ser
 * la parte más informativa de toda la sección. Rojo diría "esto está mal".
 */
function Lectura({ l }: { l: LecturaSuelo }) {
  return (
    <div className="bg-bone-50 rounded-lg p-2.5 space-y-1.5">
      <p className="text-[11px] font-semibold text-ink-800 leading-snug">{l.titulo}</p>
      <p className="text-[10px] text-ink-700/70 leading-relaxed">{l.porque}</p>

      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <div className="bg-white rounded-md border border-bone-200 p-1.5">
          <p className="text-[9px] text-ink-700/50 mb-0.5">Lo que haría este clima</p>
          <p className="text-[10px] text-ink-800 leading-snug">{l.esperado}</p>
        </div>
        <div className="bg-white rounded-md border border-bone-200 p-1.5">
          <p className="text-[9px] text-ink-700/50 mb-0.5">Lo que mide el predio</p>
          <p className="text-[10px] text-ink-800 leading-snug">{l.medido}</p>
        </div>
      </div>

      {l.acuerdo === 'coincide' && (
        <p className="text-[10px] text-moss-700">
          Coinciden: acá el clima alcanza para explicar el número.
        </p>
      )}
      {l.acuerdo === 'sin_prediccion' && (
        <p className="text-[10px] text-ink-700/55">
          En este régimen el clima no permite predecir esta propiedad, así que no se predice.
        </p>
      )}
      {l.acuerdo === 'discrepa' && l.quienManda && (
        <Cautela claim="No coinciden, y ahí está lo interesante.">
          {l.quienManda}
        </Cautela>
      )}
    </div>
  );
}

/**
 * La roca de abajo, y qué le heredaría al suelo.
 *
 * Tres cosas tienen que leerse sí o sí, y por eso ninguna está detrás de un
 * clic: qué unidad es, **de qué mapa salió y con qué detalle**, y que la roca de
 * base no es necesariamente el material parental del suelo. Las dos últimas son
 * las que impiden que alguien lea un polígono de 16.000 km² como el dato de su
 * campo.
 */
function RocaMadreCard({ r }: { r: RocaMadre }) {
  const conf = confianzaDelMapa(r.mapa.poligono_km2);
  const cons = r.familia ? CONSECUENCIA[r.familia] : null;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2.5">
      <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
        <Mountain className="w-3.5 h-3.5 text-clay-700" /> La roca de abajo
      </p>

      <div>
        <p className="text-sm font-semibold text-ink-900 leading-snug">{r.unidad}</p>
        {r.formacion && r.formacion !== r.unidad && (
          <p className="text-[10px] text-ink-700/60">{r.formacion}</p>
        )}
        <p className="text-[10px] text-ink-700/60 mt-0.5">
          {r.edad.periodo ? `${r.edad.periodo} · ` : ''}
          {r.edad.desde_ma != null && r.edad.hasta_ma != null
            ? `entre ${Math.round(r.edad.desde_ma)} y ${Math.round(r.edad.hasta_ma)} millones de años`
            : 'edad no declarada por el mapa'}
        </p>
      </div>

      {r.litologias.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {r.litologias.map((l, i) => (
            <span key={i} className="text-[10px] bg-bone-100 text-ink-700/80 rounded-full px-2 py-0.5">{l}</span>
          ))}
        </div>
      )}

      {cons ? (
        <div className="bg-bone-50 rounded-lg p-2.5 space-y-1.5">
          <p className="text-[11px] font-semibold text-ink-800 leading-snug">{cons.titulo}</p>
          <p className="text-[10px] text-ink-700/70 leading-relaxed">{cons.hereda}</p>
          <p className="text-[10px] text-clay-700 leading-relaxed flex gap-1.5">
            <span className="shrink-0 mt-0.5">→</span>{cons.cuidado}
          </p>
        </div>
      ) : (
        <p className="text-[10px] text-ink-700/60 leading-relaxed bg-bone-50 rounded-lg p-2">
          El mapa nombra la unidad pero no alcanza a decir de qué familia de roca es, así que
          no se anuncia ninguna herencia. Queda el nombre, que sirve para buscarlo.
        </p>
      )}

      {/* El detalle del mapa, que es lo que decide cuánto de todo esto se puede
          creer. Nunca detrás de un clic. */}
      <div className={`rounded-lg p-2 text-[10px] leading-relaxed ${
        conf === 'predio' ? 'bg-moss-50 text-moss-900' : 'bg-sun-300/20 text-ink-800'
      }`}>
        {ROTULO_CONFIANZA[conf]}
        {r.mapa.poligono_km2 != null && (
          <> En este mapa el polígono promedio cubre{' '}
            <span className="font-mono">{r.mapa.poligono_km2.toLocaleString('es-AR')} km²</span>,
            {' '}unos {ladoEquivalenteKm(r.mapa.poligono_km2)} km de lado.
          </>
        )}
      </div>

      <Cautela claim="Esto es la roca de base, no necesariamente el material del suelo.">
        {ROCA_NO_ES_MATERIAL_PARENTAL}
      </Cautela>

      {r.descripcion && (
        <details className="group">
          <summary className="list-none cursor-pointer text-[10px] text-water-500 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver la descripción del mapa original</span>
            <span className="hidden group-open:inline">Cerrar la descripción</span>
          </summary>
          <p className="text-[10px] text-ink-700/55 leading-relaxed mt-1">{r.descripcion}</p>
        </details>
      )}

      <p className="text-[9px] text-ink-700/40 leading-relaxed italic">
        {r.mapa.nombre} · {r.mapa.cita} — vía {FUENTE_MACROSTRAT.label}, {FUENTE_MACROSTRAT.licencia}.
      </p>
    </div>
  );
}

/**
 * «Por qué este suelo es así»: el eslabón que faltaba entre el panel de clima y
 * el de suelo.
 *
 * El panel contestaba muy bien *qué* hay y nunca *por qué*, y el por qué es lo
 * único que permite anticipar. La sección entera se apoya en `lib/sueloPorQue.ts`
 * y no decide nada por su cuenta: acá sólo se elige el orden de lectura, que va
 * del marco (los cinco factores) al mecanismo (agua y calor), de ahí a las dos
 * propiedades que se pueden contrastar, y termina en lo que el propio perfil
 * delata sobre la vegetación que lo construyó.
 */
function PorQueSuelo({ p }: { p: PorQueEsteSuelo }) {
  const v = p.biologia.velocidad;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-3">
      <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
        <Sprout className="w-3.5 h-3.5 text-moss-700" /> Por qué este suelo es así
      </p>

      <p className="text-[10px] text-ink-700/70 leading-relaxed">
        Un suelo es el resultado de cinco factores: clima, organismos, relieve, material
        parental y tiempo (Jenny, 1941). De los cinco, acequia conoce bien uno —el clima—,
        así que <strong>no explica: predice y compara</strong>. Dice qué suelo haría este
        clima, muestra el que hay, y cuando no coinciden nombra a los sospechosos.
      </p>

      {/* ── Los dos manubrios ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-water-500/10 rounded-lg p-2">
          <p className="text-[9px] text-ink-700/60">Agua · P/ETP</p>
          <p className="font-mono text-sm font-bold text-water-500">{coma(p.aridez.valor)}</p>
          <p className="text-[9px] text-ink-700/70 leading-snug mt-0.5">{ROTULO_HUMEDAD[p.humedad]}</p>
        </div>
        <div className="bg-sun-300/20 rounded-lg p-2">
          <p className="text-[9px] text-ink-700/60">Calor · media anual</p>
          <p className="font-mono text-sm font-bold text-clay-700">{coma(p.tmedia_c, 1)} °C</p>
          <p className="text-[9px] text-ink-700/70 leading-snug mt-0.5">{ROTULO_TERMICO[p.termico]}</p>
        </div>
      </div>
      <p className="text-[9px] text-ink-700/50 leading-relaxed">
        {Math.round(p.precip_mm)} mm de lluvia contra {Math.round(p.etp_mm)} mm que el sol y el
        aire pueden evaporar{p.koppen ? ` · Köppen ${p.koppen}` : ''} · {ROTULO_INTENSIDAD[p.intensidad].toLowerCase()}.
      </p>

      {/* ── Las lecturas contrastables ──────────────────────────────────────── */}
      {p.lecturas.map((l, i) => <Lectura key={i} l={l} />)}

      {/* `div` y no `p`: adentro va una Cautela, que es un `<details>`, y un
          `details` dentro de un `p` es HTML inválido que React desarma. */}
      {p.bt && (
        <div className="bg-bone-50 rounded-lg p-2">
          <p className="text-[10px] text-ink-700/70 leading-relaxed">
            <strong className="text-ink-800">La arcilla bajó.</strong> La capa {p.bt.capa} tiene{' '}
            {coma(p.bt.razon, 1)} veces la arcilla de la superficie. Eso es el agua arrastrando
            arcilla hacia abajo durante mucho tiempo, y donde se deposita arma una capa más pesada
            que frena el agua y las raíces.
          </p>
          <Cautela claim="Es una sospecha, no un diagnóstico.">
            El criterio del horizonte argílico de la taxonomía del USDA pide un aumento de al
            menos 1,2× y que ocurra dentro de 30 cm verticales, sobre horizontes descriptos a
            campo. Acá se compara entre las seis profundidades fijas de la fuente, que ya vienen
            suavizadas. Confirmarlo requiere abrir una calicata.
          </Cautela>
        </div>
      )}

      {/* ── La vida del suelo ───────────────────────────────────────────────── */}
      <div className="bg-moss-50 rounded-lg border border-moss-200 p-2.5 space-y-1.5">
        <p className="text-[11px] font-semibold text-moss-900 flex items-center gap-1.5">
          <Bug className="w-3.5 h-3.5 shrink-0" /> La vida del suelo: {p.biologia.regimen.toLowerCase()}
        </p>
        {v && (
          <p className="text-[10px] text-moss-700">
            A esta temperatura la materia orgánica se descompone{' '}
            <span className="font-mono font-semibold">{coma(v.min)}× a {coma(v.max)}×</span>{' '}
            respecto de un sitio de 10 °C.
          </p>
        )}
        <p className="text-[10px] text-ink-700/70 leading-relaxed">{p.biologia.detalle}</p>
        <p className="text-[10px] text-moss-700 leading-relaxed flex gap-1.5">
          <span className="shrink-0 mt-0.5">→</span>{p.biologia.manejo}
        </p>
        {v && (
          <Cautela claim="La banda es ancha a propósito.">
            La descomposición aproximadamente se duplica cada 10 °C, pero el factor exacto (Q10)
            está entre 1,5 y 2,5 según el sustrato y el sitio, y además baja a temperaturas
            altas. Un solo número acá sería precisión falsa: se informan los dos extremos.
          </Cautela>
        )}
      </div>

      {/* ── La huella de la vegetación ──────────────────────────────────────── */}
      {p.huella && (
        <div className="bg-bone-50 rounded-lg p-2.5 space-y-1.5">
          <p className="text-[11px] font-semibold text-ink-800 flex items-center gap-1.5">
            <TreePine className="w-3.5 h-3.5 shrink-0 text-moss-700" />
            Este suelo lo construyó {p.huella.parecido === 'bosque' ? 'el monte'
              : p.huella.parecido === 'pastizal' ? 'el pasto'
              : p.huella.parecido === 'matorral' ? 'un matorral de raíz profunda'
              : 'algo que no es la vegetación de arriba'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white rounded-md border border-bone-200 p-1.5">
              <p className="text-[9px] text-ink-700/50">Carbono en los primeros 20 cm</p>
              <p className="font-mono text-sm font-bold text-ink-900">{p.huella.fraccion_0_20_pct} %</p>
              <p className="text-[9px] text-ink-700/50">del primer metro</p>
            </div>
            <div className="bg-white rounded-md border border-bone-200 p-1.5">
              <p className="text-[9px] text-ink-700/50">Stock 0–100 cm</p>
              <p className="font-mono text-sm font-bold text-moss-700">{p.huella.stock_t_ha_100} t/ha</p>
              <p className="text-[9px] text-ink-700/50">de carbono orgánico</p>
            </div>
          </div>
          <p className="text-[10px] text-ink-700/70 leading-relaxed">{p.huella.lectura}</p>
          <Cautela claim="La referencia son 2.700 perfiles, no este predio.">
            Jobbágy y Jackson (2000) midieron que del carbono del primer metro está en los
            primeros 20 cm cerca del 50 % en bosques, el 42 % en pastizales y el 33 % en
            matorrales. Acá se compara contra esos valores. La distribución dice quién puso el
            carbono, no qué especie había: un suelo arado durante décadas puede haber perdido la
            firma original.
          </Cautela>
        </div>
      )}

      {/* ── De dónde sale cada afirmación ───────────────────────────────────── */}
      <details className="group">
        <summary className="list-none cursor-pointer text-[10px] text-water-500 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Ver las fuentes de esta sección</span>
          <span className="hidden group-open:inline">Cerrar las fuentes</span>
        </summary>
        <ul className="mt-1.5 space-y-1">
          {FUENTES_POR_QUE.map((f, i) => (
            <li key={i} className="text-[9px] text-ink-700/55 leading-relaxed">
              <span className="text-ink-700/80">{f.tema}:</span> {f.cita}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function SueloStat({
  label, value, interp,
}: {
  label: string;
  value: string;
  interp: InterpItem | null;
}) {
  const colorMap = {
    verde:    'bg-moss-50 border-moss-200',
    amarillo: 'bg-sun-300/20 border-sun-300',
    rojo:     'bg-clay-100 border-clay-200',
  };
  const txtMap = {
    verde: 'text-moss-700', amarillo: 'text-clay-700', rojo: 'text-clay-700',
  };
  const cls   = interp ? colorMap[interp.color] : 'bg-white border-bone-200';
  const txtcl = interp ? txtMap[interp.color] : 'text-ink-900';

  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] text-ink-700/60 mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-bold leading-tight ${txtcl}`}>{value}</p>
      {interp && (
        <p className={`text-[9px] mt-0.5 ${txtcl} opacity-80`}>{interp.clase}</p>
      )}
    </div>
  );
}

// Color de banda según composición textural (perfil vertical).
function colorTextura(c: CapaSuelo): string {
  if (c.arena >= 65)   return '#e0cfa0';  // arenoso
  if (c.arcilla >= 40) return '#b5765a';  // arcilloso
  if (c.arcilla >= 27) return '#c39070';  // franco-arcilloso
  if (c.limo >= 50)    return '#cbb489';  // franco-limoso
  return '#a8ad7a';                         // franco
}

function PerfilSueloChart({ perfil }: { perfil: CapaSuelo[] }) {
  const H = 232, top = 6;
  const cmToPx = (H - top * 2) / 200;
  const yTop = (cm: number) => top + cm * cmToPx;

  return (
    <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
      <p className="text-xs font-medium text-ink-700">Perfil del suelo · 0–200 cm</p>
      <div className="flex gap-3">
        {/* Columna a escala de profundidad */}
        <svg viewBox={`0 0 60 ${H}`} width={56} height={H} className="shrink-0">
          {perfil.map((c, i) => {
            const y = yTop(c.prof_top);
            const h = (c.prof_bot - c.prof_top) * cmToPx;
            return (
              <rect key={i} x={16} y={y} width={40} height={h}
                fill={colorTextura(c)} stroke="#fff" strokeWidth={0.75} />
            );
          })}
          {[0, 30, 60, 100, 200].map(d => (
            <g key={d}>
              <line x1={12} x2={16} y1={yTop(d)} y2={yTop(d)} stroke="#9a958c" strokeWidth={0.75} />
              <text x={10} y={yTop(d) + 3} textAnchor="end" fontSize={7.5} fill="#9a958c" fontFamily="monospace">{d}</text>
            </g>
          ))}
        </svg>

        {/* Detalle por capa */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {perfil.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colorTextura(c) }} />
              <span className="font-mono text-ink-700/70 w-[52px] shrink-0">{c.label}</span>
              <span className="flex-1 truncate text-ink-800" title={c.clase_textura}>{c.clase_textura}</span>
              <span className="font-mono text-moss-700 shrink-0 w-12 text-right">{c.awc_mm} mm</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[9px] text-ink-700/50 leading-relaxed">
        Franja izquierda a escala de profundidad (cm). Color por textura; mm = agua útil de cada capa.
      </p>
    </div>
  );
}

function TexturaBar({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-ink-700/60 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-bone-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(valor, 100)}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-ink-700/70 w-8 text-right">{valor.toFixed(0)}%</span>
    </div>
  );
}
