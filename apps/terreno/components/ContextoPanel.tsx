'use client';

import { Leaf, Sprout, Users, Globe2, ExternalLink, Cloud, BookOpen, Bird, Mountain, Compass, AlertTriangle, MapPin, History, Landmark } from 'lucide-react';
import { centroide, type DatosClima } from '@/lib/clima';
import { resolverBioma, analogosDeKoppen } from '@/lib/contexto';
import { fichaClimaFuturo } from '@/lib/climaFuturo';
import { ATRIBUCION_RESOLVE } from '@/lib/ecorregiones';
import { useEcorregion } from '@/lib/useEcorregion';
import { useSaberes } from '@/lib/useSaberes';
import { registroDelPunto, FECHA_REGISTRO_AR, FUENTE_REGISTRO_AR, MAPA_INAI } from '@/lib/pueblosOriginarios';
import type { DatosTopografia } from '@/lib/topografia';
import type { Mojon } from '@/lib/types';
import type { Ubicacion } from '@/lib/entorno';
import type { VigenciaPractica } from '@/lib/biomaTipos';

interface Props {
  mojones:    Mojon[];
  datosClima: DatosClima | null;
  datosTopo:  DatosTopografia | null;
  /** La resuelve el análisis de Entorno con Nominatim. `null` hasta que se corra. */
  ubicacion:  Ubicacion | null;
  onIrAClima: () => void;
  onIrAEntorno: () => void;
}

export function ContextoPanel({ mojones, datosClima, datosTopo, ubicacion, onIrAClima, onIrAEntorno }: Props) {
  // La ecorregión se pide antes de los cortes de arriba porque es un hook y no
  // puede quedar detrás de un return condicional.
  const listo = mojones.length >= 3;
  const centro = listo ? centroide(mojones) : null;
  const { eco, resolviendo: resolviendoEco } = useEcorregion(centro?.lat ?? null, centro?.lng ?? null);
  // Los saberes territoriales no salen de la ficha: se activan por polígono.
  // Devuelve [] en casi todo el planeta y eso no es una falla. Espera a que la
  // ecorregión se asiente porque la compuerta del saber usa el ECO_ID.
  const saberesTerritorio = useSaberes(centro?.lat ?? null, centro?.lng ?? null, {
    ecoId: eco?.eco_id,
    listo: !resolviendoEco,
  });

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

  /**
   * Hasta que la ecorregión no se asiente no hay ecosistema que nombrar.
   *
   * Sin ella `resolverBioma` arma la ficha por la heurística Köppen, y esa
   * ficha se mostraba entera —nombre, vegetación, fauna, suelos, saberes—
   * durante el segundo que tardaba la consulta. En Sorata el predio decía
   * "Puna y altoandino" y después pasaba a "Puna húmeda central": dos
   * ecosistemas distintos, los dos con cara de definitivos, y el segundo
   * además con otra lista de especies y sin la sección de saberes. Un dato
   * provisorio que no se anuncia como provisorio es un dato equivocado.
   *
   * Lo que sí está firme desde el principio es la clase climática: sale del
   * mapa de Köppen y no depende de esta consulta. Se muestra, y el resto
   * espera. Cuando la ecorregión falla, `resolverBioma` devuelve el respaldo
   * por Köppen con su aviso, que es un estado final y sí se muestra.
   */
  if (resolviendoEco) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-3 text-bone-50 bg-moss-700">
          <div className="flex items-start gap-2">
            <Globe2 className="w-6 h-6 shrink-0 animate-pulse text-bone-50/80" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-bone-50/70">Ecosistema de base</p>
              <p className="text-base font-bold leading-tight">Identificando la ecorregión…</p>
              <p className="text-xs text-bone-50/90 mt-0.5">
                El ecosistema del predio sale de su ecorregión, no del clima. Un segundo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-bone-50/20 text-[10px] text-bone-50/80">
            <span className="font-mono font-bold">{datosClima.koppen.codigo}</span>
            <span>· {datosClima.koppen.descripcion}</span>
            {elev !== undefined && <span className="ml-auto flex items-center gap-0.5"><Mountain className="w-3 h-3" />{Math.round(elev)} m</span>}
          </div>
        </div>
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map(i => (
            <div key={i} className="h-14 rounded-xl border border-bone-200 bg-white/70 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const bioma = resolverBioma(datosClima.koppen, centro.lat, centro.lng, elev, eco);
  const ficha = bioma.ficha;
  const color = ficha?.color ?? '#5b6b52'; // sin ficha: verde neutro de marca
  // Las inyecta fichaPorId desde lib/practicasHistoricas.ts; la ficha generada
  // nunca las trae. Vacío es el estado normal mientras se releva el resto.
  const practicas = ficha?.practicas ?? [];
  const analogos = analogosDeKoppen(datosClima.koppen);
  // Qué pueblos tienen comunidades registradas acá. No sale de la ecorregión ni
  // del clima: sale de la provincia y el departamento, que los resuelve el
  // análisis de Entorno. Argentina por ahora.
  const registro = registroDelPunto(ubicacion);
  // A dónde va el predio, y quién vive hoy en ese clima. Puede faltar: sin la
  // clase futura del mapa de Beck no hay nada honesto que decir.
  const futuro = fichaClimaFuturo(datosClima.koppen, datosClima.koppen_deriva);

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

      {/* Prácticas documentadas en el territorio.

          La respuesta al agujero que dejaban los `saberes: []`. Una ecorregión
          no permite decir de quién es una práctica, pero sí qué se hizo acá y
          cuándo: el registro fecha el rasgo —el camellón, el muro, el canal—,
          no la identidad de quien lo levantó. Ver lib/practicasHistoricas.ts. */}
      {practicas.length > 0 && <Seccion icon={<History className="w-3.5 h-3.5" />} titulo="Prácticas documentadas en el territorio">
        <div className="space-y-2">
          {practicas.map((p, i) => (
            <div key={i} className="bg-bone-50 rounded-lg p-2.5 border border-bone-200">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-moss-900">{p.practica}</p>
                <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border ${ESTILO_VIGENCIA[p.vigencia]}`}>
                  {ROTULO_VIGENCIA[p.vigencia]}
                </span>
              </div>
              <p className="text-[10px] text-ink-700/55 mt-0.5">{p.periodo}</p>
              <p className="text-xs text-ink-700/75 leading-relaxed mt-1.5">{p.detalle}</p>
              <div className="mt-2 flex flex-col gap-1">
                {p.fuentes.map(f => (
                  <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer"
                     className="text-[10px] text-moss-700 hover:text-moss-900 inline-flex items-start gap-1 leading-snug">
                    <ExternalLink className="w-2.5 h-2.5 mt-0.5 shrink-0" />{f.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-700/50 leading-relaxed mt-2.5">
          Van fechadas y sin atribuir: lo que una excavación data es la obra, no quién la hizo, y a
          escala de ecorregión —que abarca muchos pueblos y ninguno la ocupa entera— ponerle un
          nombre sería inventarlo. Donde la fuente sí lo dice, está en el texto.
        </p>
      </Seccion>}

      {/* Saberes atribuidos de la ficha.

          Vienen vacíos en 188 de las 210 fichas regionales, y no es que falte
          cargarlos: los tres bloques generados desde los paquetes de
          investigación no atribuyen prácticas a ninguna cultura. Las únicas que
          los traen son las 22 fichas argentinas escritas a mano antes de ese
          criterio.

          Cuando no hay, se dice qué falta. La explicación se acorta si arriba
          ya salieron prácticas documentadas: ahí la sección dejó de ser un
          agujero y no hace falta justificarla dos veces. */}
      {ficha.saberes.length > 0 ? <Seccion icon={<Users className="w-3.5 h-3.5" />} titulo="Saberes ancestrales y tradicionales">
        <div className="space-y-2">
          {ficha.saberes.map((s, i) => (
            <div key={i} className="bg-bone-50 rounded-lg p-2.5 border border-bone-200">
              <p className="text-xs font-semibold text-moss-900 mb-0.5">{s.cultura}</p>
              <p className="text-xs text-ink-700/75 leading-relaxed">{s.practicas}</p>
            </div>
          ))}
        </div>
      </Seccion> : (
        <Seccion icon={<Users className="w-3.5 h-3.5" />} titulo="Saberes atribuidos a una cultura">
          <p className="text-xs text-ink-700/70 leading-relaxed">
            Acá va un saber cuando se puede decir <strong>de quién es</strong>, y eso necesita
            territorio, procedencia y acuerdo verificados. Se resuelve por polígono, no por
            ecorregión: aparece más abajo, y sólo si el predio cae adentro del territorio
            documentado.
          </p>
          {practicas.length === 0 && (
            <p className="text-xs text-ink-700/70 leading-relaxed mt-2">
              Para esta ecorregión tampoco tenemos todavía prácticas fechadas sin atribuir, que es
              el otro modo de contarlo. Que no haya no significa que no existan: significa que
              todavía no tenemos con qué afirmarlo acá.
            </p>
          )}
        </Seccion>
      )}
      </>}

      {/* Pueblos originarios con comunidades registradas.

          La tercera capa, y la única que no sale del mapa físico: sale de un
          registro del Estado. Contesta qué pueblos tienen hoy comunidades
          inscriptas o relevadas por la Ley 26.160 en esta provincia y en este
          departamento — no qué pueblos habitaron la zona, que es otra pregunta
          y la contestan las prácticas fechadas de más arriba.

          Va afuera del bloque de la ficha a propósito: depende de la ubicación
          administrativa y no de la ecorregión, así que aparece incluso donde no
          hay ficha de bioma. Ver lib/pueblosOriginarios.ts. */}
      <Seccion icon={<Landmark className="w-3.5 h-3.5" />} titulo="Pueblos originarios con comunidades registradas">
        {registro.estado === 'sin_ubicacion' && (
          <div className="space-y-2">
            <p className="text-xs text-ink-700/70 leading-relaxed">
              Esto se resuelve por provincia y departamento, no por clima ni por ecorregión, y
              todavía no sabemos en cuál está el predio. Lo ubica el análisis de Entorno.
            </p>
            <button
              onClick={onIrAEntorno}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-xs font-medium transition-colors"
            >
              <MapPin className="w-3 h-3" /> Ir a Entorno
            </button>
          </div>
        )}

        {registro.estado === 'fuera_de_argentina' && (
          <p className="text-xs text-ink-700/70 leading-relaxed">
            El predio está en {registro.pais}, y este registro es argentino: sale del INAI. Que no
            haya nada acá no dice nada sobre {registro.pais} — dice que todavía no relevamos el
            registro equivalente de ese país.
          </p>
        )}

        {registro.estado === 'jurisdiccion_desconocida' && (
          <p className="text-xs text-ink-700/70 leading-relaxed">
            El geocodificador devolvió «{registro.provincia}» y no es ninguna de las 24
            jurisdicciones argentinas que conocemos, así que preferimos no contestar antes que
            contestar de más. No significa que no haya comunidades registradas.
          </p>
        )}

        {registro.estado === 'sin_comunidades' && (
          <p className="text-xs text-ink-700/70 leading-relaxed">
            En {registro.jurisdiccion} el registro del INAI no tiene comunidades inscriptas ni
            relevadas, y es la única jurisdicción del país en esa situación. Es un dato del
            registro, no del territorio: dice que ninguna comunidad hizo ahí el trámite.
          </p>
        )}

        {registro.estado === 'con_registro' && <>
          {/* El departamento primero, cuando se pudo casar: es la escala a la
              que el dato sirve. La provincia queda de marco. */}
          {registro.departamento ? (
            <div className="bg-bone-50 rounded-lg p-2.5 border border-bone-200">
              <p className="text-[10px] uppercase tracking-wide text-ink-700/50">
                {registro.departamento.departamento} · {registro.provincia.provincia}
              </p>
              <p className="text-xs text-ink-700/80 leading-relaxed mt-1">
                {registro.departamento.comunidades === 1
                  ? 'Una comunidad registrada'
                  : `${registro.departamento.comunidades} comunidades registradas`}
                {registro.departamento.pueblos.length === 1 ? ', de un pueblo:' : ', de estos pueblos:'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {registro.departamento.pueblos.map(p => (
                  <span key={p.pueblo} className="text-[10px] px-2 py-0.5 rounded-full bg-moss-100 text-moss-900 border border-moss-200">
                    {p.pueblo} <span className="text-moss-700/70">· {p.comunidades}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-ink-700/60 leading-relaxed bg-bone-50 border border-bone-200 rounded-lg p-2.5">
              El departamento que devolvió el geocodificador no coincide con ninguno del registro,
              así que la respuesta es provincial. Preferimos eso a elegir un departamento parecido.
            </p>
          )}

          <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mt-3 mb-1">
            En toda la provincia de {registro.provincia.provincia}
          </p>
          <p className="text-xs text-ink-700/80 leading-relaxed">
            {registro.provincia.comunidades} comunidades registradas, {registro.provincia.conPersoneria} con
            personería jurídica inscripta, y estos pueblos:
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {registro.provincia.pueblos.map(p => (
              <span key={p.pueblo} className="text-[10px] px-2 py-0.5 rounded-full bg-bone-100 text-ink-700/80 border border-bone-300">
                {p.pueblo} <span className="text-ink-700/50">· {p.comunidades}</span>
              </span>
            ))}
          </div>

          {/* El relevamiento de la Ley 26.160 es el dato que le sirve a quien va
              a intervenir: dice si el territorio de al lado está medido o no. */}
          <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mt-3 mb-1">
            Relevamiento territorial (Ley 26.160)
          </p>
          <p className="text-xs text-ink-700/75 leading-relaxed">
            {registro.provincia.relevamiento.culminado} culminado
            {' · '}{registro.provincia.relevamiento.iniciado + registro.provincia.relevamiento.en_tramite} en curso
            {' · '}{registro.provincia.relevamiento.sin_relevar} sin relevar
            {registro.provincia.relevamiento.sin_dato > 0 && <> · {registro.provincia.relevamiento.sin_dato} sin dato</>}
          </p>

          <p className="text-[10px] text-ink-700/55 leading-relaxed mt-2.5">
            Es una lista, no un mapa: no decimos dónde está cada comunidad. Los pueblos van
            escritos como los escribe el registro, con sus variantes, porque decidir cómo se llama
            un pueblo no es trabajo de una app. Y los números cuentan comunidades en las que el
            registro anota a ese pueblo, así que la columna puede sumar más que el total: hay
            comunidades anotadas con más de un pueblo.
          </p>

          <p className="text-[10px] text-ink-700/55 leading-relaxed mt-2">
            <strong className="text-ink-700/70">Un departamento que no figura no es un territorio
            sin pueblos originarios:</strong> es un territorio sin comunidades <em>registradas</em>.
            El registro depende de que una comunidad haya iniciado y sostenido un trámite ante el
            Estado, así que su ausencia habla del trámite y no de la gente.
          </p>

          <div className="mt-2 pt-2 border-t border-bone-200 space-y-1">
            <a href={FUENTE_REGISTRO_AR.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-water-500 hover:text-water-700 transition-colors">
              <ExternalLink className="w-3 h-3 shrink-0" /> {FUENTE_REGISTRO_AR.label}
            </a>
            <a href={MAPA_INAI.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-water-500 hover:text-water-700 transition-colors">
              <ExternalLink className="w-3 h-3 shrink-0" /> {MAPA_INAI.label}
            </a>
            <p className="text-[10px] text-ink-700/50 leading-relaxed">
              Foto del registro al {FECHA_REGISTRO_AR} · {FUENTE_REGISTRO_AR.licencia}. El registro
              se mueve; esta tabla no.
            </p>
          </div>
        </>}
      </Seccion>

      {/* Saberes territoriales — capa 2. Separada de los saberes de la ficha a
          propósito: aquéllos describen un bioma, éstos son de comunidades
          concretas y sólo aparecen si el predio cae dentro de un polígono con
          procedencia y licencia verificadas. */}
      {saberesTerritorio.length > 0 && <Seccion icon={<MapPin className="w-3.5 h-3.5" />} titulo="Saber territorial documentado acá">
        <div className="space-y-2">
          {saberesTerritorio.map(({ saber, geometria }) => (
            <div key={saber.id} className="bg-white rounded-lg p-3 border border-clay-200">
              <p className="text-xs font-semibold text-ink-700">{saber.nombre}</p>
              <p className="text-[10px] text-ink-700/60 mt-0.5">Portan: {saber.portadores}</p>
              <p className="text-xs text-ink-700/80 leading-relaxed mt-1.5">{saber.sintesisPublica}</p>
              {saber.cautelas.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {saber.cautelas.map((c, i) => (
                    <li key={i} className="text-[11px] text-clay-700 leading-relaxed flex gap-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /><span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 pt-2 border-t border-bone-200 space-y-1">
                {saber.fuentes.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-water-500 hover:text-water-700 transition-colors">
                    <ExternalLink className="w-3 h-3 shrink-0" /> {f.label}
                  </a>
                ))}
                <p className="text-[10px] text-ink-700/50 leading-relaxed">
                  Territorio según <a href={geometria.url} target="_blank" rel="noreferrer" className="underline">{geometria.fuente}</a> · {geometria.licencia}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-700/55 leading-relaxed mt-2">
          Aparece porque el predio cae dentro del territorio documentado, no por el país ni por
          la ecorregión. Es una descripción publicada, no una recomendación de manejo: lo que
          corresponda hacer se conversa con quienes portan el saber.
        </p>
      </Seccion>}

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

      {/* ── El clima al que va el predio ────────────────────────────────────
          Va después de los análogos del presente y no antes: primero dónde
          está el predio, después a dónde se dirige. Y muestra los análogos de
          la clase FUTURA, que es el aporte que ninguna otra pantalla hace:
          quién cultiva hoy, en algún lugar del mundo, en el clima que este
          predio va a tener. */}
      {futuro && (
        <div className="rounded-xl border border-water-200 bg-water-50/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-water-200 flex items-center gap-1.5 text-water-700">
            <Compass className="w-3.5 h-3.5" />
            <p className="text-xs font-medium text-ink-700">A dónde va este clima</p>
          </div>

          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="font-mono text-sm font-bold text-ink-700">{futuro.presente.codigo}</p>
                <p className="text-[9px] text-ink-700/50">hoy</p>
              </div>
              <span className="text-ink-700/30">→</span>
              <div className="text-center">
                <p className={`font-mono text-sm font-bold ${futuro.estable ? 'text-ink-700' : 'text-clay-700'}`}>
                  {futuro.futuro.codigo}
                </p>
                <p className="text-[9px] text-ink-700/50">2071-2099</p>
              </div>
              <p className="text-[10px] text-ink-700/65 leading-tight ml-1">{futuro.futuro.descripcion}</p>
            </div>

            {futuro.estable ? (
              <p className="text-[11px] text-ink-700/75 leading-relaxed">
                La clase no cambia. Eso es una buena noticia y vale escribirla: el sistema que
                diseñes hoy sigue siendo el que le corresponde al lugar dentro de varias décadas.
              </p>
            ) : (
              <>
                {futuro.queCambia && (
                  <p className="text-[11px] text-ink-700/80 leading-relaxed">
                    Lo que se mueve es <b>{futuro.queCambia}</b>.
                  </p>
                )}
                <ul className="space-y-1">
                  {futuro.consecuencias.map((c, i) => (
                    <li key={i} className="text-[11px] text-ink-700/75 leading-relaxed flex gap-1.5">
                      <span className="text-water-700 mt-0.5">→</span><span>{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Los análogos del futuro: el puente entre un código y una decisión. */}
            {futuro.analogos && (
              <div className="border-t border-water-200 pt-2">
                <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1">
                  Ese clima hoy existe en · {futuro.analogos.titulo}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {futuro.analogos.regiones.map(r => (
                    <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-white text-water-700 border border-water-200">{r}</span>
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-wide text-ink-700/50 mb-1">Y ahí se cultiva así</p>
                <ul className="space-y-1">
                  {futuro.analogos.tecnicas.map((t, i) => (
                    <li key={i} className="text-xs text-ink-700/75 leading-relaxed flex gap-1.5">
                      <span className="text-moss-700 mt-0.5">→</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
                {futuro.analogos.aviso && (
                  <p className="text-[10px] text-ink-700/60 leading-relaxed mt-2">{futuro.analogos.aviso}</p>
                )}
              </div>
            )}

            {/* El desfasaje de horizonte y las tres advertencias. No son letra
                chica: sin ellas el bloque se lee como un pronóstico, y no lo es. */}
            <div className="border-t border-water-200 pt-2 space-y-1.5">
              <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-clay-700/60" />
                {futuro.horizonte}
              </p>
              {futuro.advertencias.map((t, i) => (
                <p key={i} className="text-[9px] text-ink-700/50 leading-relaxed pl-4">{t}</p>
              ))}
            </div>
          </div>
        </div>
      )}

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

const ROTULO_VIGENCIA: Record<VigenciaPractica, string> = {
  en_uso:       'En uso',
  en_retroceso: 'En retroceso',
  historica:    'Documentada',
};

/** `historica` no lleva color de alarma: que una práctica no se haga más es un
 *  dato del registro, no una falla del predio. */
const ESTILO_VIGENCIA: Record<VigenciaPractica, string> = {
  en_uso:       'bg-moss-100 text-moss-900 border-moss-200',
  en_retroceso: 'bg-clay-100 text-clay-900 border-clay-200',
  historica:    'bg-bone-100 text-ink-700/70 border-bone-300',
};

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
