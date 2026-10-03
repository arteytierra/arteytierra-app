'use client';

/**
 * Pastoreo rotativo: el menú de manejos de un predio.
 *
 * El panel no elige el manejo. Muestra **todos los que cumplen el descanso que
 * la pastura necesita** y lo que cada uno cuesta de alambre, de agua y de
 * tiempo, porque esa decisión es de bolsillo y de vida y no de agronomía.
 *
 * Las reglas, con sus fuentes, están en `lib/manejos.ts`. Acá se dibujan.
 */
import { useMemo, useState, useEffect, useRef } from 'react';
import { TriangleAlert, Fence, Droplet, Grid3x3, Eraser, Route, Loader2, Ruler } from 'lucide-react';
import {
  calcularPastoreo, forrajePorLluvia,
  type ResultadoPastoreo, type PastoreoInputs,
} from '@/lib/pastoreo';
import {
  diagnosticoPastura, calendarioRotacion, menuDeManejos, etapasIntensificacion,
  fusibleSequia, descansoObjetivo, pastura,
  ALTURAS_PASTOREO, remanente_cm, AGUA_INTENSIVA_M, TOPE_CONDUCTA_D, RELACION_MAX,
  FUENTE_A3529, FUENTE_GERRISH, FUENTE_ILLINOIS, FUENTE_HOLECHEK_99, FUENTE_COLLATZ, FUENTE_FOX,
  type TipoPastura, type Manejo, type TemporadaManejo,
} from '@/lib/manejos';
import { bandaUso, noPastoreable } from '@/lib/modulacion';
import { subdividirPotreros, type PotrerosLayout } from '@/lib/potreros';
import type { DatosClima } from '@/lib/clima';
import type { Mojon } from '@/lib/types';
import { ElectrificadorBloque } from './ElectrificadorBloque';

interface AreaSubdividible { id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }

interface Props {
  areaHa:     number;
  datosClima: DatosClima | null;
  mojones?:   Mojon[];
  tieneDibujo?: boolean;
  onDibujar?: (layout: PotrerosLayout | null) => void;
  onIrAClima: () => void;
  /** Polígonos ya dibujados (parcelas/zonas/sectores) para subdividir en vez de todo el predio. */
  parcelas?:  AreaSubdividible[];
  /** Traza caminos de acceso/servicio a los bebederos por lomas. Devuelve un aviso. */
  onCaminosAcceso?: (layout: PotrerosLayout) => Promise<{ ok: boolean; msg: string }>;
  /** Cobertura del predio, para descontar lo que no es tierra de pastoreo. */
  cobertura?: Array<{ valor: number; nombre: string; pct: number }> | null;
  /** Campos cargados antes: al cambiar de pestaña el panel se desmonta, así
   *  vuelve con lo que había en vez de reiniciarse a los valores por defecto. */
  inicial?:   PastoreoInputs | null;
  onInputs?:  (i: PastoreoInputs) => void;
}

export function PastoreoPanel({
  areaHa, datosClima, mojones = [], tieneDibujo = false, onDibujar, onIrAClima,
  parcelas = [], onCaminosAcceso, cobertura = null, inicial, onInputs,
}: Props) {
  const forrajeSugerido = datosClima ? forrajePorLluvia(datosClima.precip_anual_mm) : 3000;
  // El uso admisible sale de la banda de lluvia del predio (etapa A), no del
  // 50 % de «take half, leave half», que su propia fuente limita al pastizal
  // húmedo. Es el mismo número que usa la receptividad: una sola fuente.
  const banda = datosClima ? bandaUso(datosClima.precip_anual_mm) : null;
  const eficSugerida = banda ? Math.round(banda.inicial * 100) : 50;
  // Lo que no es tierra de pastoreo se resta en hectáreas; lo que el ganado no
  // usa igual —pendiente, distancia— es un factor y vive en la pestaña Producción.
  const noPast = useMemo(() => noPastoreable(cobertura), [cobertura]);
  const haPastoreables = useMemo(
    () => (areaHa > 0 ? Math.round(areaHa * (1 - noPast.fraccion) * 10) / 10 : 0),
    [areaHa, noPast.fraccion],
  );

  const diag = useMemo(() => diagnosticoPastura(datosClima?.meses ?? null), [datosClima]);
  const tipoSugerido: TipoPastura =
    diag?.sugerencia === 'tropical' ? 'tropical'
    : diag?.sugerencia === 'templada' ? 'templada'
    : 'templada';

  const [area,     setArea]     = useState(inicial?.area ?? (haPastoreables > 0 ? haPastoreables : 50));
  const [animales, setAnimales] = useState(inicial?.animales ?? 30);
  const [peso,     setPeso]     = useState(inicial?.peso ?? 400);
  const [consumo,  setConsumo]  = useState(inicial?.consumo ?? 2.8);
  const [forraje,  setForraje]  = useState(inicial?.forraje ?? forrajeSugerido);
  const [efic,     setEfic]     = useState(inicial?.efic ?? eficSugerida);
  const [ocup,     setOcup]     = useState(inicial?.ocup ?? 2);
  const [tipo,     setTipo]     = useState<TipoPastura>(inicial?.tipo ?? tipoSugerido);
  const [grupos,   setGrupos]   = useState(inicial?.grupos ?? 1);

  // Fase 4: área a subdividir (todo el predio o una parcela dibujada) + caminos de acceso.
  const [areaSel,      setAreaSel]      = useState<string>('predio');
  const [ultimoLayout, setUltimoLayout] = useState<PotrerosLayout | null>(null);
  const [trazando,     setTrazando]     = useState(false);
  const [caminosMsg,   setCaminosMsg]   = useState<{ ok: boolean; msg: string } | null>(null);

  // Los autocompletados (área, forraje, uso admisible, tipo de pastura) sólo
  // corren en un panel nuevo; con datos guardados mandan ellos y no se pisan.
  const autoLlenar = useRef(inicial == null);
  useEffect(() => { if (autoLlenar.current && haPastoreables > 0) setArea(haPastoreables); }, [haPastoreables]);
  useEffect(() => { if (autoLlenar.current) setForraje(forrajeSugerido); }, [forrajeSugerido]);
  useEffect(() => { if (autoLlenar.current) setEfic(eficSugerida); }, [eficSugerida]);
  useEffect(() => { if (autoLlenar.current) setTipo(tipoSugerido); }, [tipoSugerido]);

  useEffect(() => { onInputs?.({ area, animales, peso, consumo, forraje, efic, ocup, tipo, grupos }); },
    [area, animales, peso, consumo, forraje, efic, ocup, tipo, grupos, onInputs]);

  // El calendario, con las estaciones del hemisferio del predio.
  const calendario = useMemo<TemporadaManejo[]>(() => {
    if (!datosClima) return [];
    return calendarioRotacion({
      meses: datosClima.meses, lat: datosClima.lat, tipo,
      parcelas: Math.max(grupos + 1, 2), grupos,
    });
  }, [datosClima, tipo, grupos]);

  // Las parcelas las dimensiona la temporada más lenta: el descanso más largo.
  const descansoLargo = useMemo(() => {
    const porClima = calendario.length > 0 ? Math.max(...calendario.map(t => t.descanso_objetivo_d)) : 0;
    return porClima > 0 ? porClima : Math.max(descansoObjetivo(tipo, false), descansoObjetivo(tipo, true));
  }, [calendario, tipo]);

  const descansoCorto = useMemo(() => {
    const porClima = calendario.length > 0 ? Math.min(...calendario.map(t => t.descanso_objetivo_d)) : 0;
    return porClima > 0 ? porClima : Math.min(descansoObjetivo(tipo, false), descansoObjetivo(tipo, true));
  }, [calendario, tipo]);

  const res: ResultadoPastoreo | null = useMemo(() => calcularPastoreo({
    area_ha: area, n_animales: animales, peso_prom_kg: peso, consumo_pct_peso: consumo,
    prod_forraje_kg_ha: forraje, eficiencia: efic / 100, dias_ocupacion: ocup,
    descanso_objetivo_d: descansoLargo, grupos,
  }), [area, animales, peso, consumo, forraje, efic, ocup, descansoLargo, grupos]);

  const menu = useMemo(() => menuDeManejos({
    ha_pastoreables: area, descanso_objetivo_d: descansoLargo, grupos,
  }), [area, descansoLargo, grupos]);

  const etapas = useMemo(() => res ? etapasIntensificacion({
    ha_pastoreables: area, parcelas_objetivo: res.n_potreros, ocupacion_d: ocup, grupos,
  }) : [], [res, area, ocup, grupos]);

  const fusible = useMemo(() => res ? fusibleSequia({
    parcelas_total: res.n_potreros, descanso_rapido_d: descansoCorto,
    ocupacion_d: ocup, ha_pastoreables: area, grupos,
  }) : null, [res, descansoCorto, ocup, area, grupos]);

  const balColor = !res ? 'ink' : res.balance_pct >= 130 ? 'verde' : res.balance_pct >= 100 ? 'amarillo' : 'rojo';
  const alturas = ALTURAS_PASTOREO;
  const remanente = remanente_cm(tipo);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
        Pastoreo rotativo
      </p>

      {/* ── Lo primero, porque es lo que dice la literatura ── */}
      <p className="text-[10px] text-ink-700/60 leading-relaxed bg-bone-50 rounded-lg px-2.5 py-2 border border-bone-200">
        Antes de gastar en alambre: los estudios de pastizal de larga duración encontraron que
        <b> acertarle a la carga rinde más que rotar</b>. La rotación resuelve otras cosas —el parejo
        del pastoreo y la calidad de la dieta— pero si hay plata para una sola, va a ajustar la carga.
        Eso se hace en <span className="text-moss-700">Producción → Ganadería</span>.
      </p>

      {/* ── Qué pastura es ── */}
      <div className="bg-white rounded-xl border border-bone-200 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold text-ink-700">Qué pastura tenés</p>
          <div className="flex rounded-md overflow-hidden border border-bone-200">
            {([['templada', 'templada'], ['tropical', 'tropical'], ['leguminosa', 'leguminosa']] as const).map(([v, rotulo]) => (
              <button key={v} onClick={() => { autoLlenar.current = false; setTipo(v); }}
                className={`px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                  tipo === v ? 'bg-moss-700 text-bone-50' : 'bg-white text-ink-700/60 hover:bg-bone-50'
                }`}>
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Es la decisión que más mueve de esta pestaña, porque <b>las templadas y las tropicales
          piden lo contrario</b>: la templada necesita más descanso con calor —se frena— y la
          tropical menos, porque el calor es cuando crece. Un calendario copiado de un campo con
          una y aplicado a la otra queda exactamente al revés.
        </p>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Vos tenés: {pastura(tipo).ejemplos}. Descanso de {pastura(tipo).fresco_d[0]}
          {pastura(tipo).fresco_d[1] !== pastura(tipo).fresco_d[0] ? `-${pastura(tipo).fresco_d[1]}` : ''} días
          con tiempo fresco y {pastura(tipo).caluroso_d[0]}
          {pastura(tipo).caluroso_d[1] !== pastura(tipo).caluroso_d[0] ? `-${pastura(tipo).caluroso_d[1]}` : ''} con calor.
        </p>
        {diag && (
          <div className="border-t border-bone-100 pt-1.5 space-y-0.5">
            <p className="text-[9px] text-moss-700 leading-relaxed">
              Por el clima de este punto, acequia sugiere <b>{diag.sugerencia}</b>:
              de los {diag.meses_crecimiento} meses con lluvia suficiente para crecer,
              {' '}{diag.meses_c4} llegan a los 22 °C a los que las gramíneas tropicales le ganan a
              las templadas.
            </p>
            {diag.cautelas.map((c, i) => (
              <p key={i} className="text-[9px] text-clay-700/80 leading-relaxed flex gap-1">
                <span className="shrink-0">·</span><span>{c}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Parámetros */}
      <div className="bg-white rounded-xl border border-bone-200 p-3 grid grid-cols-2 gap-2.5">
        <Campo label="Superficie de pastoreo (ha)"><Num v={area} set={n => { autoLlenar.current = false; setArea(n); }} step={1} /></Campo>
        <Campo label="Animales"><Num v={animales} set={setAnimales} step={5} /></Campo>
        <Campo label="Peso prom. (kg)"><Num v={peso} set={setPeso} step={20} /></Campo>
        <Campo label="Consumo (% peso)"><Num v={consumo} set={setConsumo} step={0.1} /></Campo>
        <Campo label="Forraje (kg MS/ha·año)"><Num v={forraje} set={n => { autoLlenar.current = false; setForraje(n); }} step={250} /></Campo>
        <Campo label="Uso admisible (%)"><Num v={efic} set={n => { autoLlenar.current = false; setEfic(n); }} step={5} /></Campo>
        <Campo label="Ocupación (días)"><Num v={ocup} set={setOcup} step={1} /></Campo>
        <Campo label="Rodeos en la secuencia"><Num v={grupos} set={setGrupos} step={1} /></Campo>
      </div>

      {noPast.exclusiones.length > 0 && (
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Del plano salen {Math.round(noPast.fraccion * 100)} % que no es tierra de pastoreo
          ({noPast.exclusiones.map(e => `${e.nombre.toLowerCase()} ${e.pct} %`).join(', ')}), así que
          la superficie arranca en {haPastoreables.toLocaleString('es-AR')} ha y no en {areaHa.toLocaleString('es-AR')}.
        </p>
      )}
      {banda && (
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          El uso admisible del {eficSugerida} % sale de la banda «{banda.nombre.toLowerCase()}» de este
          predio. La regla de cosechar la mitad vale, dice su propia fuente, sólo para pastizal húmedo
          y de anuales.
        </p>
      )}
      {!datosClima && (
        <p className="text-[10px] text-ink-700/55 flex gap-1.5">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 text-sun-500" />
          Cargá el <button onClick={onIrAClima} className="underline text-moss-700">clima</button> para
          que el descanso, el uso admisible y el tipo de pastura salgan de este punto. Mientras, editalos a mano.
        </p>
      )}

      {res && (
        <>
          {/* Balance + carga */}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Balance forrajero" value={`${res.balance_pct}%`} color={balColor}
              sub={res.balance_pct >= 100 ? 'oferta cubre demanda' : 'sobrepastoreo'} />
            <Stat label="Carga instantánea" value={`${res.carga_ins_ev_ha} EV/ha`} sub="en la parcela ocupada" />
            <Stat label="Parcelas" value={String(res.n_potreros)} color="moss" sub={`descanso ${res.descanso_logrado_d} d`} />
            <Stat label="Cada una" value={`${res.area_potrero_ha} ha`} sub={`${res.grilla.filas} × ${res.grilla.columnas}`} />
          </div>

          {/* ── El calendario ── */}
          {calendario.length > 0 && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-xs font-medium text-ink-700">El año de esta pastura</p>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {calendario.map(t => (
                  <div key={t.nombre} className={`rounded-lg p-1.5 ${t.caluroso ? 'bg-sun-300/20' : 'bg-bone-50'}`}>
                    <p className="text-[9px] text-ink-700/60">{t.nombre}</p>
                    <p className="font-mono text-xs font-bold text-moss-700">{t.descanso_objetivo_d} d</p>
                    <p className="text-[8px] text-ink-700/50">descanso</p>
                    <p className={`text-[8px] mt-0.5 ${t.excede_rebrote ? 'text-clay-700 font-semibold' : 'text-ink-700/50'}`}>
                      tope {t.tope_rebrote_d} d
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                <b>Lo que nadie espera: el tope de días en la parcela es más corto cuando el pasto
                crece más rápido.</b> En plena temporada de crecimiento la planta vuelve a tener hoja
                a los cuatro días, y si el rodeo todavía está ahí se la come por segunda vez antes de
                que haya rearmado nada. Eso —comerla corta y comerle el rebrote— es lo único que la
                fuente llama forma segura de matar una pastura.
              </p>
              <p className="text-[9px] text-ink-700/50 leading-relaxed">
                Las parcelas se dimensionan con el descanso más largo del año
                ({descansoLargo} días), que es la temporada más lenta. Las temporadas en amarillo son
                las que pasan los 22 °C.
              </p>
            </div>
          )}

          {/* ── El menú ── */}
          {menu.length > 0 && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-xs font-medium text-ink-700">El menú: todos cumplen, cuestan distinto</p>
              <div className="space-y-1">
                {menu.map(m => (
                  <FilaManejo key={m.ocupacion_d} m={m} elegido={m.ocupacion_d === ocup}
                    onElegir={() => setOcup(m.ocupacion_d)} />
                ))}
              </div>
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                No hay una opción correcta: todas dan el mismo descanso. Lo que cambia es cuánto
                alambre, cuántos puntos de agua y cuántas veces al año hay que ir a abrir un portón.
                Arriba del menú no hay nada: pasar el tope de rebrote no es una opción más agresiva,
                es daño.
              </p>
            </div>
          )}

          {/* ── Las etapas ── */}
          {etapas.length > 1 && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-xs font-medium text-ink-700">No hace falta hacerlo todo de una</p>
              {etapas.map((e, i) => (
                <div key={e.parcelas} className="flex items-start gap-2">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-moss-700 text-bone-50 text-[8px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-ink-900">
                      <b>{e.parcelas} parcelas</b> · descanso de {e.descanso_d} días ·
                      {' '}{e.alambre_m.toLocaleString('es-AR')} m de alambre
                    </p>
                    <p className="text-[9px] text-ink-700/55 leading-relaxed">{e.nota}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── El fusible del año seco ── */}
          {fusible && (
            <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
              <p className="text-xs font-medium text-ink-700">El fusible del año seco</p>
              {fusible.parcelas_sobrantes > 0 ? (
                <p className="text-[10px] text-ink-700/70 leading-relaxed">
                  En la temporada de crecimiento rápido la rotación sólo necesita
                  {' '}<b>{fusible.parcelas_en_uso} de las {res.n_potreros} parcelas</b> para cubrir un
                  descanso de {descansoCorto} días. Las otras {fusible.parcelas_sobrantes}
                  {' '}—{fusible.ha_sobrantes.toLocaleString('es-AR')} ha, un {fusible.pct_sobrante} %—
                  no sobran: <b>ésas son el heno</b>, y vuelven a la rotación cuando el crecimiento
                  cae. Es el mismo potrero cumpliendo dos funciones según la época.
                </p>
              ) : (
                <p className="text-[10px] text-clay-700 leading-relaxed">
                  Con este manejo no sobra ninguna parcela ni en la temporada más rápida: no hay de
                  dónde sacar heno ni con qué amortiguar un año seco. Es señal de carga ajustada.
                </p>
              )}
              <p className="text-[9px] text-ink-700/55 leading-relaxed">
                La otra mitad del fusible no es superficie, es carga, y tiene números: el uso
                conservador del forraje —{fusible.uso_conservador_pct} %— resigna del
                {' '}{fusible.resigna_pct[0]} al {fusible.resigna_pct[1]} % de la ganancia en años
                normales y devuelve del {fusible.gana_en_sequia_pct[0]} al
                {' '}{fusible.gana_en_sequia_pct[1]} % más en una sequía severa. Se paga poco todos
                los años y se cobra mucho el año que importa.
              </p>
            </div>
          )}

          {/* ── Las alturas, que es lo único que se mide ── */}
          <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
            <p className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
              <Ruler className="w-3 h-3" /> Con qué se mide de verdad
            </p>
            <p className="text-[10px] text-ink-700/70 leading-relaxed">
              El descanso en días es una estimación; <b>la altura es una medición</b>. La fuente lo
              pone en una frase: movelo según el pasto y no según el calendario. Entrá y salí con
              estas alturas y el calendario se acomoda solo.
            </p>
            <div className="space-y-0.5">
              {alturas.map(a => (
                <div key={a.grupo} className="flex items-baseline justify-between gap-2 text-[9px]">
                  <span className="text-ink-700/70 min-w-0 truncate">{a.grupo}</span>
                  <span className="font-mono shrink-0 text-ink-900">
                    {a.entrar_cm[0]}–{a.entrar_cm[1]} → {a.salir_cm[0]}
                    {a.salir_cm[1] !== a.salir_cm[0] ? `–${a.salir_cm[1]}` : ''} cm
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-ink-700/55 leading-relaxed">
              La altura de salida es el fusible: comerla más abajo no ahorra superficie,
              <b> alarga el descanso</b>. En tu pastura dejá {remanente[0]}
              {remanente[1] !== remanente[0] ? ` a ${remanente[1]}` : ''} cm de hoja en pie.
            </p>
          </div>

          {/* Infraestructura */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Alambrado" value={`${res.alambrado_m.toLocaleString('es-AR')} m`} sub="subdivisión" icon="fence" />
            <Stat label="Forma" value={`${res.grilla.relacion.toFixed(1)} : 1`}
              sub={res.grilla.relacion > RELACION_MAX ? 'pasa el tope' : 'largo / ancho'} icon="fence" />
            <Stat label="Puntos de agua" value={String(res.bebederos)} sub={`radio ${AGUA_INTENSIVA_M} m`} icon="water" />
          </div>
          <p className="text-[9px] text-ink-700/50 leading-relaxed">
            La grilla más cuadrada no es sólo prolija: gasta menos alambre y se pastorea más pareja.
            Tanto que <b>dieciséis parcelas cuadradas pueden salir más baratas que doce en tiras</b> —un
            cuadrado tiene menos perímetro que un rectángulo de la misma superficie—. El agua se cuenta
            con un radio de {AGUA_INTENSIVA_M} m, que es el criterio del pastoreo manejado; los 1,6 km de
            la pestaña Producción contestan otra pregunta —si la hectárea cuenta para la carga— y por eso
            no se contradicen. Un bebedero en un cruce de alambres sirve a las cuatro parcelas que se tocan.
          </p>

          {/* El equipo que sostiene ese alambre: ver
              `components/ElectrificadorBloque.tsx`. */}
          <ElectrificadorBloque alambrado_m={res.alambrado_m} />

          {/* Dibujar sobre el mapa */}
          {onDibujar && mojones.length >= 3 && (
            <div className="space-y-2">
              {parcelas.length > 0 && (
                <label className="block">
                  <span className="text-[10px] text-ink-700/60 block mb-0.5">Área a subdividir</span>
                  <select
                    value={areaSel}
                    onChange={e => setAreaSel(e.target.value)}
                    className="w-full text-[11px] rounded-lg border border-bone-200 px-2 py-1.5 bg-white cursor-pointer">
                    <option value="predio">Todo el predio</option>
                    {parcelas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </label>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const sel = areaSel === 'predio' ? null : parcelas.find(p => p.id === areaSel);
                    const verts = sel ? sel.vertices : mojones;
                    const layout = subdividirPotreros(verts, res.n_potreros, res.bebederos, AGUA_INTENSIVA_M);
                    setUltimoLayout(layout);
                    setCaminosMsg(null);
                    onDibujar(layout);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-moss-700 text-bone-50 rounded-lg px-3 py-2 hover:bg-moss-800 transition-colors">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  {tieneDibujo ? 'Redibujar parcelas' : 'Dibujar parcelas en el mapa'}
                </button>
                {tieneDibujo && (
                  <button
                    onClick={() => { onDibujar(null); setUltimoLayout(null); setCaminosMsg(null); }}
                    className="flex items-center justify-center gap-1 text-[11px] text-clay-700 bg-clay-100 border border-clay-200 rounded-lg px-3 py-2 hover:bg-clay-200 transition-colors">
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-[9px] text-ink-700/50 leading-relaxed">
                Divide {areaSel === 'predio' ? 'el predio' : 'la parcela elegida'} en {res.n_potreros}
                {' '}parcelas de superficie parecida. <b>Y acá hay algo que el dibujo no puede hacer
                todavía:</b> lo que conviene igualar no es la superficie sino la comida —la parcela de
                bajo dulce tiene que llevar menos hectáreas que la de loma arenosa para dar lo mismo—.
                Para repartir así hace falta producción de forraje por ambiente, que es el número que
                a acequia le falta. El esquema es orientativo: corregí a ojo con lo que sabés de tu campo.
              </p>

              {onCaminosAcceso && tieneDibujo && ultimoLayout && (
                <button
                  onClick={async () => {
                    if (trazando) return;
                    setTrazando(true); setCaminosMsg(null);
                    try { setCaminosMsg(await onCaminosAcceso(ultimoLayout)); }
                    catch { setCaminosMsg({ ok: false, msg: 'Error al trazar los caminos.' }); }
                    finally { setTrazando(false); }
                  }}
                  disabled={trazando}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium bg-orange-700 text-white rounded-lg px-3 py-2 hover:bg-orange-900 disabled:opacity-50 transition-colors">
                  {trazando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Route className="w-3.5 h-3.5" />}
                  {trazando ? 'Trazando caminos…' : 'Trazar caminos de acceso (por lomas)'}
                </button>
              )}
              {caminosMsg && (
                <p className={`text-[10px] leading-tight rounded-lg px-2 py-1.5 ${caminosMsg.ok ? 'bg-moss-50 text-moss-800 border border-moss-200' : 'bg-clay-50 text-clay-700 border border-clay-200'}`}>
                  {caminosMsg.msg}
                </p>
              )}
            </div>
          )}

          {/* Advertencias */}
          <div className={`rounded-xl border p-3 space-y-1.5 ${res.balance_pct < 100 ? 'bg-clay-100 border-clay-200' : 'bg-moss-50 border-moss-200'}`}>
            {res.advertencias.map((a, i) => (
              <p key={i} className={`text-[11px] flex gap-1.5 ${res.balance_pct < 100 ? 'text-clay-700' : 'text-moss-700'}`}>
                <span className="shrink-0 mt-0.5">→</span>{a}
              </p>
            ))}
          </div>

          <details className="text-[9px]">
            <summary className="cursor-pointer select-none text-ink-700/45 hover:text-ink-700/70">de dónde salen estos números</summary>
            <div className="pt-1 space-y-1 text-ink-700/55 leading-relaxed">
              <p>
                <b>Parcelas, descanso, tope de rebrote y alturas:</b> {FUENTE_A3529} De ahí sale la
                cuenta —parcelas = descanso ÷ ocupación + rodeos en la secuencia—, los rangos de
                descanso por tipo de pastura, los cuatro y diez días de rebrote, la tabla 7 de alturas
                y la regla de igualar las parcelas por comida y no por superficie.
              </p>
              <p>
                <b>El tope de {TOPE_CONDUCTA_D} días, la forma y el alambre:</b> {FUENTE_GERRISH} El
                rodeo arma querencia a los tres días y la repite en las vueltas siguientes; la parcela
                larga se come por el frente; el cuadrado gasta menos alambre.
              </p>
              <p>
                <b>El trazado y la distancia al agua:</b> {FUENTE_ILLINOIS} El agua a menos de 800 pies
                y las parcelas lo más cuadradas posible, entre otros doce principios.
              </p>
              <p>
                <b>Que la carga importa más que la rotación, y el fusible del año seco:</b>
                {' '}{FUENTE_HOLECHEK_99}
              </p>
              <p>
                <b>Qué pastura sugiere el clima:</b> {FUENTE_COLLATZ} Un mes favorece a las gramíneas
                tropicales cuando su media llega a 22 °C y llueven 25 mm o más. El rango de validez
                —y que la temperatura de cruce se mueve con el CO2 de la atmósfera— sale de
                {' '}{FUENTE_FOX}
              </p>
              <p>
                <b>Lo que falta y conviene saber:</b> la producción de forraje por hectárea es una
                escalera por lluvia sin fuente, y multiplica el balance de arriba. Está marcada como
                sugerencia editable por eso. El tope de ocupación interpolado entre los cuatro y los
                diez días es un puente de acequia entre dos párrafos de A3529: lo publicado son los
                extremos.
              </p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

// ─── Internos ─────────────────────────────────────────────────────────────────

function FilaManejo({ m, elegido, onElegir }: { m: Manejo; elegido: boolean; onElegir: () => void }) {
  const EXIGENCIA: Record<Manejo['exigencia'], string> = {
    alta: 'todos los días', media: 'cada pocos días', baja: 'una vez por semana',
  };
  return (
    <button onClick={onElegir}
      className={`w-full text-left rounded-lg border px-2 py-1.5 transition-colors ${
        elegido ? 'bg-moss-50 border-moss-200' : 'bg-bone-50 border-bone-200 hover:border-moss-200'
      }`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold text-ink-900">
          {m.ocupacion_d} {m.ocupacion_d === 1 ? 'día' : 'días'} · {m.parcelas} parcelas
        </span>
        <span className="font-mono text-[9px] text-ink-700/60 shrink-0">
          {m.ha_parcela.toLocaleString('es-AR')} ha · {m.alambre_m.toLocaleString('es-AR')} m
        </span>
      </div>
      <p className="text-[9px] text-ink-700/55">
        {m.grilla.filas} × {m.grilla.columnas} · {m.bebederos} {m.bebederos === 1 ? 'punto' : 'puntos'} de agua ·
        {' '}mover {EXIGENCIA[m.exigencia]}
      </p>
      {m.avisos.map((a, i) => (
        <p key={i} className="text-[9px] text-clay-700/80 leading-relaxed mt-0.5">· {a}</p>
      ))}
    </button>
  );
}

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
  const Ico = icon === 'fence' ? Fence : icon === 'water' ? Droplet : null;
  return (
    <div className={`rounded-xl border p-2.5 ${cls}`}>
      <p className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1">
        {Ico ? <Ico className="w-2.5 h-2.5" /> : <span className="text-[10px] leading-none">🐄</span>}
        {label}
      </p>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
