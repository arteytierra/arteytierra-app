'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Loader2, Waves, Info, PenLine, CalendarClock, Droplets, Check, Archive } from 'lucide-react';
import { obtenerGrillaDensa, grillaDesdeShader, type GrillaElevacion } from '@/lib/grillaElevacion';
import { calcularEmbalse, rangoElevacionPoligono, dimensionarMuro, perfilTerreno, balanceTierra, type ResultadoEmbalse } from '@/lib/cutfill';
import { simularRepresaAnual, MESES_NOMBRE, type RepresaResumen, type RepresaInputs } from '@/lib/represa';
import { yaArchivada, resumenRepresa, porEficiencia, type RepresaGuardada, type FichaRepresa } from '@/lib/represasGuardadas';
import { anchoCorona, taludesSugeridos, claseSueloSugerida, evaluar, type Recomendacion } from '@/lib/criterios';
import { demandaMensual_m3, demandaMensualPorTemperatura_m3, aguaRodeo, cabezasTotal, procedencia, type Rodeo } from '@/lib/rodeo';
import { caudalPico_l_h, factorContraPromedio, espaciosBebida, UMBRAL_DISTANCIA_M, FUENTE_CAUDAL, type LlegadaAlAgua } from '@/lib/abrevadero';
import { RodeoEditor } from './mapa/RodeoEditor';
import { cuencaAdaptativa, bboxDeMojones, puntoMasBajoEnArista } from '@/lib/cuencaHidro';
import { COBERTURAS, coefEscorrentiaAnual } from '@/lib/cuenca';
import { revanchaMinima, factorEvaporacionEspejo, TALUD_INTERNO_MIN_AH590, coronaMinima } from '@/lib/represaDiseno';
import { RepresaCriteriosBloque, ComparacionCandidatos } from './RepresaCriteriosBloque';
import { CONCEPTOS_SUGERIDOS } from '@/lib/economia';

/** Valor del desplegable de cobertura que significa "usá el motor compartido". */
const COBERTURA_PREDIO = 'predio';
import { confianzaRepresa } from '@/lib/saludCalculo';
import { volumen, UNIDADES_VOLUMEN, type UnidadVolumen } from '@/lib/unidades';
import { SaludCalculo } from './SaludCalculo';
import { EscurrimientoTabla } from './EscurrimientoTabla';
import type { Cuenca, GrupoHidro } from '@/lib/cuenca';
import type { Mojon } from '@/lib/types';
import type { DatosShader } from '@/lib/shaders';
import type { DatosClima } from '@/lib/clima';
import { useTextoRelieve } from '@/lib/contextoRelieve';


export interface PoligonoCutFill { id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }

// Tipo de obra. La base = corona + alto × (talud int + talud ext), así que la
// corona y los taludes mandan el ancho y, con él, todo el movimiento de suelo.
//
// Antes esto eran dos presets fijos —corona de 1 m para una aguada, de 3 m para
// una represa de ladera— que no miraban la altura del muro: uno de 1,5 m y uno
// de 6 m recibían la misma corona, y el error se propagaba al volumen de
// terraplén y a la eficiencia del sitio. Ahora la corona sale de la tabla de
// `lib/criterios` según el alto y el largo del coronamiento, los taludes salen
// del material del terraplén, y el usuario puede correrse dentro del rango que
// el criterio admite (y sólo dentro de él).
type ParamsMuroUI = { anchoCorona: number; taludInterno: number; taludExterno: number; revancha: number };
type TipoMuro = 'aguada' | 'ladera';
/** Lo único que decide el tipo de obra es la revancha; el resto sale del cálculo. */
const REVANCHA: Record<TipoMuro, number> = { aguada: 0.3, ladera: 0.5 };

/**
 * Qué parte del panel se muestra. El panel entero desplegado era una columna
 * larguísima —pasos, muro, cuenca, simulación, notas— y para llegar a la curva
 * de llenado había que pasar por todo lo demás. Se parte en pestañas, pero el
 * componente sigue siendo UNO: el cálculo del embalse alimenta a la simulación,
 * y separarlos en componentes hermanos obligaría a subir todo ese estado.
 */
export type SeccionRepresa = 'embalse' | 'simulacion' | 'observaciones';

interface Props {
  mojones:     Mojon[];
  datosShader: DatosShader | null;
  poligonos:   PoligonoCutFill[];
  onDibujarEspejo: () => void;
  /** Pestaña activa. Las otras se ocultan con CSS, no se desmontan: el embalse
   *  calculado tiene que seguir vivo cuando se mira la simulación. */
  seccion?: SeccionRepresa;
  datosClima?:   DatosClima | null;
  cuencaHa?:     number | null;   // área de la cuenca de aporte (B2), si existe
  grupoHidro?:   GrupoHidro | null;   // grupo hidrológico del suelo (A4), si existe
  onResumenRepresa?: (r: RepresaResumen | null) => void;
  onCuencaCalculada?: (c: Cuenca | null) => void;   // empuja la cuenca del muro al mapa/pestaña Cuenca
  onMuroLinea?: (linea: [{ lat: number; lng: number }, { lat: number; lng: number }] | null) => void;
  /** Textura del suelo (% arcilla / % arena) para sugerir los taludes del muro. */
  texturaSuelo?: { arcilla_pct: number; arena_pct: number } | null;
  /** Parámetros guardados con el proyecto, para no perder el trabajo al cambiar de pestaña. */
  inicial?:   RepresaInputs | null;
  onInputs?:  (i: RepresaInputs) => void;
  /**
   * Archivo de represas del proyecto. La pestaña calcula una sola y recalcula
   * arriba de la anterior; archivarlas es lo que permite comparar dos
   * emplazamientos sin anotar los números en un papel.
   */
  guardadas?:  RepresaGuardada[];
  onGuardar?:  (inputs: RepresaInputs, ficha: FichaRepresa, poligonoNombre: string) => void;
  onAbrir?:    (g: RepresaGuardada) => void;
  onEliminar?: (id: string) => void;
  /** Rodeo compartido con Producción: se lee y se escribe desde las dos pestañas. */
  rodeo:      Rodeo;
  onRodeo:    (r: Rodeo) => void;
  /**
   * Coeficiente de escorrentía ANUAL del predio, del motor compartido (H0):
   * la misma composición de cobertura que arma el CN, ponderada por área.
   *
   * Hasta acá el llenado de la represa salía de un desplegable con UNA cobertura
   * para toda la cuenca —"pastura regular"— aunque la app ya supiera, por
   * satélite, que arriba hay 40 % de monte. Ahora ese número es la opción por
   * defecto y el desplegable queda para pisarlo. `null` = sin datos de cobertura.
   */
  coefAnualPredio?: number | null;
  /** Las tres coberturas que más pesan, para poder leer de dónde salió el coef. */
  composicionPredio?: Array<{ nombre: string; pct: number }>;
}

export function CutFillPanel({ mojones, datosShader, poligonos, onDibujarEspejo, seccion = 'embalse', datosClima = null, cuencaHa = null, grupoHidro = null, texturaSuelo = null, inicial = null, onInputs, guardadas = [], onGuardar, onAbrir, onEliminar, rodeo, onRodeo, onResumenRepresa, onCuencaCalculada, onMuroLinea, coefAnualPredio = null, composicionPredio = [] }: Props) {
  const relieve = useTextoRelieve();
  const [selId,    setSelId]    = useState<string>(inicial?.poligonoId ?? '');
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [grilla,   setGrilla]   = useState<GrillaElevacion | null>(null);
  const [rango,    setRango]    = useState<{ min: number; max: number; celdas: number } | null>(null);
  const [nivel,    setNivel]    = useState<number | null>(inicial?.nivel ?? null);
  const [res,      setRes]      = useState<ResultadoEmbalse | null>(null);
  // Parámetros de diseño del muro (trapecio).
  const [tipoMuro, setTipoMuro] = useState<TipoMuro>(inicial?.tipoMuro ?? 'aguada');
  const [muroP,    setMuroP]    = useState<ParamsMuroUI>(inicial
    ? { anchoCorona: inicial.anchoCorona, taludInterno: inicial.taludInterno, taludExterno: inicial.taludExterno, revancha: inicial.revancha }
    // Los defaults del primer render también tienen que estar en norma: antes
    // eran 1,5 m de corona y 2,5:1 de talud interno, los dos por debajo del
    // mínimo de AH-590, y se veían un instante antes de que el criterio los
    // corrigiera. Un número fuera de norma en pantalla, aunque dure un frame,
    // es un número que alguien puede anotar.
    : { anchoCorona: coronaMinima(1.5).minimo_m, taludInterno: TALUD_INTERNO_MIN_AH590, taludExterno: 2, revancha: REVANCHA.aguada });
  /**
   * Carga sobre el vertedero cuando pasa la crecida de diseño (m).
   *
   * El término que faltaba en la cota del muro. AH-590 mide la revancha desde
   * el pelo de agua CON el vertedero descargando a su carga de diseño, así que
   * entre el nivel normal y la corona hay tres cosas apiladas. El default son
   * los 0,30 m que usa `analizarCuenca` en la pestaña Cuenca, para que los dos
   * paneles hablen del mismo vertedero.
   */
  const [cargaVertedero, setCargaVertedero] = useState<number>(inicial?.cargaVertedero ?? 0.3);
  /** Rolled fill: decide si el sobrealto por asentamiento es 5 % o 10 %. */
  const [compactadoEnCapas, setCompactadoEnCapas] = useState<boolean>(inicial?.compactadoEnCapas ?? false);
  /** Precio del m³ de tierra movida, del catálogo del presupuesto. */
  const [precioTierra, setPrecioTierra] = useState<number>(
    CONCEPTOS_SUGERIDOS.find(c => c.concepto === 'Movimiento de suelo (represa)')?.precioDefault ?? 4);
  const [longMuro, setLongMuro] = useState<number | null>(inicial?.longMuro ?? null);
  /** true mientras la corona y los taludes sigan siendo los que sugiere el criterio. */
  const [muroAuto, setMuroAuto] = useState(!inicial);
  // Cuenca de aporte desde el muro (C): lado elegido + resultado.
  const [muroIdx,      setMuroIdx]      = useState<number | null>(inicial?.muroIdx ?? null);
  const [cuencaMuro,   setCuencaMuro]   = useState<Cuenca | null>(null);
  const [cuencaMuroLoad, setCuencaMuroLoad] = useState(false);
  const [cuencaMuroAviso, setCuencaMuroAviso] = useState<string | null>(null);

  const sel = poligonos.find(p => p.id === selId) ?? null;

  /**
   * `inicial` cambia de identidad cada vez que el panel guarda sus campos: el
   * efecto de persistencia llama a `onInputs` con un objeto nuevo, el
   * contenedor lo pone en su estado y lo vuelve a bajar como prop. Por eso no
   * puede ir en las dependencias de un efecto — guardar dispararía el efecto, y
   * el efecto borraba lo que se acababa de calcular. Estos efectos sólo quieren
   * el valor con el que se montó el panel, y eso es exactamente una ref.
   */
  const inicialRef = useRef(inicial);

  // El lado del muro lo ELIGE el usuario, antes de calcular (paso 3).
  //
  // Hasta el 01/10/2026 lo elegía este efecto: tomaba el lado más bajo y lo
  // dejaba puesto en silencio. El problema no era el criterio —el lado más bajo
  // suele ser el bueno— sino que de ese lado dependen el largo del
  // coronamiento, el perfil del terreno bajo el eje, el volumen de terraplén y
  // la cuenca de aporte. O sea: la mitad de los números de la pestaña salían de
  // una decisión que la app había tomado sola y que el usuario descubría
  // después, en un renglón chico de la sección "Cuenca de aporte", con un
  // enlace que la rotaba de a uno. En un predio con dos vaguadas el lado más
  // bajo del polígono puede ser el que NO se va a cerrar.
  //
  // Ahora: el lado más bajo se sugiere (`muroSugerido`) y se marca, pero no se
  // selecciona. Lo único que se restaura solo es lo que el proyecto ya traía
  // guardado, que es una decisión que el usuario ya tomó.
  useEffect(() => {
    if (!sel || sel.vertices.length < 3) { setMuroIdx(null); return; }
    const guardado = inicialRef.current;
    if (guardado && guardado.poligonoId === sel.id && guardado.muroIdx !== null) {
      setMuroIdx(guardado.muroIdx);
      return;
    }
    setMuroIdx(null);
    setCuencaMuro(null); setCuencaMuroAviso(null);
  }, [sel]);

  /**
   * Los lados del polígono, con lo que hace falta para elegir uno: cuánto mide
   * y cuál es la cota más baja que toca.
   *
   * La cota sale `null` mientras no haya grilla de elevación. No es un error:
   * la grilla se trae al calcular, o ya está si se pasó por Topografía. Sin
   * ella el usuario elige por largo y por lo que ve en el mapa, que es
   * exactamente lo que hace en el campo.
   */
  const lados = useMemo(() => {
    if (!sel || sel.vertices.length < 3) return [];
    const vs = sel.vertices;
    return vs.map((a, i) => {
      const b = vs[(i + 1) % vs.length]!;
      const latMid = (a.lat + b.lat) / 2 * Math.PI / 180;
      const largo_m = Math.round(Math.hypot(
        (b.lng - a.lng) * 111_320 * Math.cos(latMid),
        (b.lat - a.lat) * 111_320,
      ));
      const bajo = grilla ? puntoMasBajoEnArista(grilla, a, b) : null;
      return { i, largo_m, cotaMin: bajo ? Math.round(bajo.elev * 10) / 10 : null };
    });
  }, [sel, grilla]);

  /** El lado más bajo: la sugerencia, no la elección. */
  const muroSugerido = useMemo(() => {
    const conCota = lados.filter(l => l.cotaMin !== null);
    if (conCota.length === 0) return null;
    return conCota.reduce((a, b) => (b.cotaMin! < a.cotaMin! ? b : a)).i;
  }, [lados]);

  // Dibujar el lado-muro elegido en el mapa.
  useEffect(() => {
    if (sel && muroIdx !== null && sel.vertices.length >= 3) {
      const vs = sel.vertices;
      onMuroLinea?.([vs[muroIdx]!, vs[(muroIdx + 1) % vs.length]!]);
    } else {
      onMuroLinea?.(null);
    }
  }, [sel, muroIdx, onMuroLinea]);

  const calcularCuencaMuro = useCallback(async () => {
    if (!sel || muroIdx === null || !grilla || mojones.length < 3) return;
    const vs = sel.vertices;
    const outlet = puntoMasBajoEnArista(grilla, vs[muroIdx]!, vs[(muroIdx + 1) % vs.length]!);
    if (!outlet) { setCuencaMuroAviso('El lado elegido no cae sobre datos de elevación.'); return; }
    setCuencaMuroLoad(true); setCuencaMuroAviso(null);
    try {
      const r = await cuencaAdaptativa({ lat: outlet.lat, lng: outlet.lng }, bboxDeMojones(mojones), { clip: mojones });
      if (r) {
        setCuencaMuro(r.cuenca);
        onCuencaCalculada?.(r.cuenca);
        if (!r.completa) setCuencaMuroAviso('La cuenca puede estar incompleta: la divisoria llega al límite del área analizada.');
      } else {
        setCuencaMuroAviso('No se pudo delinear la cuenca desde ese muro. Probá con otro lado.');
      }
    } catch {
      setCuencaMuroAviso('Error al calcular la cuenca. Reintentá.');
    } finally {
      setCuencaMuroLoad(false);
    }
  }, [sel, muroIdx, grilla, mojones, onCuencaCalculada]);

  // Largo del muro = longitud de la arista elegida como muro (el cierre del cuello
  // de botella), no el eje mayor del vaso. Ese era el error que inflaba el muro.
  const muroEdgeLength = useMemo(() => {
    if (!sel || muroIdx === null || sel.vertices.length < 3) return null;
    const vs = sel.vertices;
    const a = vs[muroIdx]!, b = vs[(muroIdx + 1) % vs.length]!;
    const latMid = (a.lat + b.lat) / 2 * Math.PI / 180;
    return Math.round(Math.hypot((b.lng - a.lng) * 111320 * Math.cos(latMid), (b.lat - a.lat) * 111320));
  }, [sel, muroIdx]);

  const longitud = longMuro ?? muroEdgeLength ?? res?.ancho_max_m ?? 0;

  // ── Qué corona y qué taludes pide el criterio ──────────────────────────────
  // El alto del muro no depende de la corona, así que se puede calcular primero
  // y de ahí sale todo lo demás. `transitable` para una represa de ladera: un
  // muro de ese porte se recorre con vehículo, y eso lleva el mínimo a 3 m.
  const altoMuro = res ? +(res.prof_max_m + cargaVertedero + muroP.revancha).toFixed(2) : 0;

  const claseSuelo = useMemo(
    () => texturaSuelo ? claseSueloSugerida(texturaSuelo.arcilla_pct, texturaSuelo.arena_pct) : null,
    [texturaSuelo],
  );

  const recCorona = useMemo<Recomendacion>(
    () => anchoCorona({ alto_m: altoMuro, largo_m: longitud || null, transitable: tipoMuro === 'ladera' }),
    [altoMuro, longitud, tipoMuro],
  );

  const recTaludes = useMemo(
    () => taludesSugeridos(claseSuelo?.clase ?? null, altoMuro),
    [claseSuelo, altoMuro],
  );

  /**
   * Revancha mínima publicada, que la fija **el largo del vaso** y no la altura
   * del muro: lo que la revancha frena es la ola, y la ola la arma el viento
   * sobre el agua libre. Los presets por tipo de obra (0,30 para una aguada,
   * 0,50 para una represa de ladera) se conservan como piso de uso, pero si el
   * espejo es largo manda la tabla de AH-590 — 1, 1,5 o 2 pies según el vaso
   * mida menos de 200 m, menos de 400 o hasta media milla.
   */
  const revMin = useMemo(() => revanchaMinima(res?.ancho_max_m ?? null), [res?.ancho_max_m]);

  // Mientras el usuario no toque nada, la geometría del muro sigue al criterio:
  // si sube el nivel de agua, el muro crece y la corona lo acompaña sola.
  useEffect(() => {
    if (!muroAuto || !recCorona.aplica) return;
    setMuroP(p => {
      const siguiente = {
        ...p,
        anchoCorona:  recCorona.valor,
        taludInterno: recTaludes.interno,
        taludExterno: recTaludes.externo,
        revancha:     Math.max(REVANCHA[tipoMuro], +revMin.minimo_m.toFixed(2)),
      };
      const igual = p.anchoCorona === siguiente.anchoCorona
        && p.taludInterno === siguiente.taludInterno
        && p.taludExterno === siguiente.taludExterno
        && p.revancha === siguiente.revancha;
      return igual ? p : siguiente;
    });
  }, [muroAuto, recCorona.aplica, recCorona.valor, recTaludes.interno, recTaludes.externo, revMin.minimo_m, tipoMuro]);

  const evalCorona = useMemo(() => evaluar(muroP.anchoCorona, recCorona), [muroP.anchoCorona, recCorona]);

  /**
   * Perfil del terreno natural bajo el eje del muro.
   *
   * Es lo que evita el error de fondo del cálculo anterior: sin esto el muro se
   * dimensionaba como un prisma de altura constante igual a la profundidad
   * MÁXIMA del vaso, cuando el muro real baja a cero contra los estribos. Como
   * la sección crece con el cuadrado de la altura, el terraplén salía entre 2,5
   * y 3 veces más grande de lo que es.
   */
  const perfilMuro = useMemo(() => {
    if (!grilla || !sel || muroIdx === null || sel.vertices.length < 3) return null;
    const vs = sel.vertices;
    return perfilTerreno(grilla, vs[muroIdx]!, vs[(muroIdx + 1) % vs.length]!);
  }, [grilla, sel, muroIdx]);

  // Cuánto banco hace falta por m³ compactado. Los arcillosos contraen más.
  const factorContraccion = claseSuelo?.clase === 'arenoso_superficial' ? 1.10
    : claseSuelo?.clase === 'areno_arcilloso' ? 1.15 : 1.25;

  const muro = useMemo(() => res ? dimensionarMuro({
    profMax_m: res.prof_max_m, revancha_m: muroP.revancha, anchoCorona_m: muroP.anchoCorona,
    taludInterno: muroP.taludInterno, taludExterno: muroP.taludExterno, longitud_m: longitud,
    perfilTerreno_m: perfilMuro ?? undefined,
    // La corona va al nivel normal MÁS la carga de la crecida sobre el
    // vertedero MÁS la revancha: es la definición de AH-590 y es lo que le
    // faltaba al cálculo. Ver `cargaVertedero`.
    cotaCorona_m: nivel != null ? nivel + cargaVertedero + muroP.revancha : undefined,
    cargaVertedero_m: cargaVertedero,
    compactadoEnCapas,
    factorContraccion,
  }) : null, [res, muroP, longitud, perfilMuro, nivel, cargaVertedero, compactadoEnCapas, factorContraccion]);

  /**
   * Balance de tierra. La tierra del terraplén sale de adentro del vaso, del
   * lado más alto, así que el mismo movimiento que cuesta plata también gana
   * capacidad: cada m³ excavado bajo el nivel de agua es un m³ más de agua.
   */
  const balance = useMemo(() => muro && res ? balanceTierra(muro, res) : null, [muro, res]);

  // Eficiencia del sitio = agua total ÷ tierra movida en banco. Cuanto más agua
  // se embalsa con menos movimiento —un buen cuello de botella entre laderas—
  // más eficiente el emplazamiento.
  const eficiencia = balance?.eficiencia ?? 0;

  // Reset al cambiar de polígono. La primera pasada se saltea cuando venimos de
  // un proyecto guardado: si no, el efecto borra el nivel que acabamos de
  // restaurar y el usuario vuelve a la pestaña para encontrarla en blanco, que
  // es justamente el problema que esta persistencia viene a resolver.
  const primeraPasada = useRef(true);
  /**
   * Polígono cuyo cambio viene de abrir una represa archivada, no de que el
   * usuario eligiera otro espejo. Sin esto, restaurar una archivada seteaba el
   * polígono y este efecto borraba el nivel y los parámetros un instante
   * después: el archivo no servía para nada.
   */
  const restaurado = useRef<string | null>(null);
  useEffect(() => {
    const vieneDelArchivo = restaurado.current === selId;
    restaurado.current = null;
    if (primeraPasada.current) { primeraPasada.current = false; if (inicialRef.current) return; }
    if (vieneDelArchivo) return;
    setRango(null); setNivel(null); setRes(null); setError(null); setLongMuro(null);
  }, [selId]);

  const analizar = useCallback(async () => {
    if (!sel || sel.vertices.length < 3) { setError('Elegí un polígono cerrado.'); return; }
    // Sin lado de muro no se calcula. De él salen el largo del coronamiento y el
    // perfil del terreno bajo el eje; sin eso `dimensionarMuro` cae al prisma de
    // altura constante, que sobredimensiona el terraplén entre 2,5 y 3 veces —y
    // lo informa en una nota que es fácil pasar de largo.
    if (muroIdx === null) { setError('Elegí de qué lado va el muro (paso 3).'); return; }
    setCargando(true); setError(null);
    try {
      let g = grilla;
      if (!g) {
        g = (await obtenerGrillaDensa(mojones)) ?? (datosShader ? grillaDesdeShader(datosShader) : null);
        if (!g) { setError('No se pudo obtener la elevación del terreno.'); return; }
        setGrilla(g);
      }
      const rg = rangoElevacionPoligono(g, sel.vertices);
      if (!rg) { setError('El polígono no contiene suficientes datos de elevación.'); return; }
      setRango(rg);
      const nivelInicial = nivel ?? (rg.min + (rg.max - rg.min) * 0.6);
      setNivel(Math.round(nivelInicial * 10) / 10);
      setRes(calcularEmbalse(g, sel.vertices, nivelInicial));
    } catch {
      setError('Error al calcular el embalse.');
    } finally {
      setCargando(false);
    }
  }, [sel, grilla, mojones, datosShader, nivel, muroIdx]);

  // Recalcular al mover el nivel (si ya hay grilla y polígono)
  const onNivel = useCallback((v: number) => {
    setNivel(v);
    if (grilla && sel) setRes(calcularEmbalse(grilla, sel.vertices, v));
  }, [grilla, sel]);

  // Al volver a la pestaña con un proyecto que ya tenía represa, se recalcula
  // solo: el usuario recupera su trabajo sin volver a apretar "Calcular".
  const yaRestauro = useRef(false);
  useEffect(() => {
    if (yaRestauro.current || !inicial?.poligonoId || !sel || res || cargando) return;
    // Un proyecto guardado antes del 01/10/2026 puede no traer lado de muro.
    // Sin esta guarda el panel se abriría solo con el error del paso 3 puesto,
    // que es decirle "te falta algo" a alguien que no hizo nada. Se espera a que
    // elija: `analizar` está en las dependencias y depende de `muroIdx`, así que
    // el cálculo arranca solo en cuanto lo haga.
    if (muroIdx === null) return;
    yaRestauro.current = true;
    void analizar();
  }, [inicial, sel, res, cargando, analizar, muroIdx]);

  // ── Persistencia de los campos ─────────────────────────────────────────────
  // Sube al contenedor todo lo que el usuario eligió, para que viaje con el
  // proyecto. Sólo cuando hay un polígono elegido: un panel vacío no tiene nada
  // que guardar y pisaría lo que ya había.
  const [coberturaCuenca, setCoberturaCuenca] = useState(inicial?.cobertura ?? COBERTURA_PREDIO);
  const [coefCuenca,      setCoefCuenca]      = useState(
    inicial?.coef ?? String(coefAnualPredio ?? coefEscorrentiaAnual(grupoHidro ?? 'B', 'pastura_regular')));
  const [haCuenca,        setHaCuenca]        = useState(inicial?.ha ?? (cuencaHa ? String(cuencaHa) : '10'));
  const [seep,            setSeep]            = useState(inicial?.seep ?? '3');
  // En qué unidad se muestra el volumen de agua. Selector y no equivalencia
  // entre paréntesis: dos números juntos se confunden, y con el punto de miles
  // del castellano la lectura se vuelve ambigua.
  const [unidadVol,       setUnidadVol]       = useState<UnidadVolumen>((inicial?.unidadVol as UnidadVolumen) ?? 'm3');

  /** Todo lo que el usuario eligió. Lo usan la persistencia y el archivo. */
  const inputsActuales = useMemo<RepresaInputs>(() => ({
    poligonoId: selId, nivel, muroIdx, tipoMuro,
    anchoCorona: muroP.anchoCorona, taludInterno: muroP.taludInterno,
    taludExterno: muroP.taludExterno, revancha: muroP.revancha,
    longMuro, cobertura: coberturaCuenca, coef: coefCuenca, ha: haCuenca, seep, unidadVol,
    cargaVertedero, compactadoEnCapas,
  }), [selId, nivel, muroIdx, tipoMuro, muroP, longMuro, coberturaCuenca, coefCuenca, haCuenca, seep, unidadVol, cargaVertedero, compactadoEnCapas]);

  useEffect(() => {
    if (!selId || !onInputs) return;
    onInputs(inputsActuales);
  }, [selId, inputsActuales, onInputs]);

  // ── Archivo de represas ────────────────────────────────────────────────────

  /**
   * El resumen de la simulación anual, que lo calcula la sección de abajo.
   * Se queda con una copia acá además de subirlo al contenedor porque la ficha
   * que se archiva lo incluye: una represa que aguanta el año al 91 % y otra al
   * 60 % no se comparan sólo por capacidad.
   */
  const [resumenSim, setResumenSim] = useState<RepresaResumen | null>(null);
  const recibirResumen = useCallback((r: RepresaResumen | null) => {
    setResumenSim(r);
    onResumenRepresa?.(r);
  }, [onResumenRepresa]);

  /**
   * Los resultados que se archivan. `null` mientras no haya un cálculo completo:
   * sin muro ni balance no hay nada que comparar contra otro emplazamiento.
   */
  const ficha = useMemo<FichaRepresa | null>(() => {
    if (!res || !muro || !balance || nivel === null) return null;
    return {
      nivel_m:        nivel,
      capacidad_m3:   Math.round(balance.volumenAgua_m3),
      area_espejo_m2: Math.round(res.area_inundada_m2),
      prof_max_m:     res.prof_max_m,
      alturaMuro_m:   muro.alto_m,
      largoMuro_m:    muro.longitud_m,
      compactado_m3:  Math.round(balance.compactado_m3),
      banco_m3:       Math.round(balance.banco_m3),
      eficiencia:     balance.eficiencia,
      viable:         balance.viable,
      perfilUsado:    muro.perfilUsado,
      ...(resumenSim ? { confiabilidad_pct: resumenSim.confiabilidad_pct, cuenca_ha: resumenSim.cuenca_ha } : {}),
    };
  }, [res, muro, balance, nivel, resumenSim]);

  const yaEsta = ficha ? yaArchivada(inputsActuales, guardadas) : null;

  /**
   * Abrir una archivada repone sus parámetros y la deja recalculando.
   *
   * No se guarda el resultado del cálculo —la grilla de elevación pesa megas—,
   * así que lo que vuelve son los inputs: el efecto de restauración de más
   * arriba se encarga de volver a integrar el embalse con ellos. De ahí el
   * `yaRestauro.current = false`, que es lo que le da permiso a correr de nuevo.
   */
  const abrirGuardada = useCallback((g: RepresaGuardada) => {
    const i = g.inputs;
    restaurado.current = i.poligonoId;
    setSelId(i.poligonoId);
    setNivel(i.nivel);
    setMuroIdx(i.muroIdx);
    setTipoMuro(i.tipoMuro);
    setMuroP({ anchoCorona: i.anchoCorona, taludInterno: i.taludInterno, taludExterno: i.taludExterno, revancha: i.revancha });
    // Lo archivado son valores fijos: dejar el automático prendido los pisaría
    // con los que sugiere el criterio hoy y la ficha dejaría de coincidir.
    setMuroAuto(false);
    setLongMuro(i.longMuro);
    setCoberturaCuenca(i.cobertura);
    setCoefCuenca(i.coef);
    setHaCuenca(i.ha);
    setSeep(i.seep);
    if (i.unidadVol) setUnidadVol(i.unidadVol as UnidadVolumen);
    // Las represas archivadas antes del 03/10/2026 no tienen carga de
    // vertedero: se repone el default y el bloque de criterios avisa que la
    // cota de corona de esa ficha salió sin ese término.
    setCargaVertedero(i.cargaVertedero ?? 0.3);
    setCompactadoEnCapas(i.compactadoEnCapas ?? false);
    setRes(null); setRango(null); setError(null);
    yaRestauro.current = false;
    onAbrir?.(g);
  }, [onAbrir]);

  return (
    <div className="space-y-3">
      <div className={seccion === 'embalse' ? 'space-y-3' : 'hidden'}>
      {/* La herramienta estaba escondida detrás de sus propios requisitos: el
          botón "Calcular embalse" no existía hasta tener el polígono elegido,
          así que había que dibujar y seleccionar A CIEGAS para descubrir que
          existía. Ahora los cuatro pasos están numerados y a la vista desde el
          primer momento, y el botón final se ve siempre —deshabilitado y con
          el motivo escrito— para que el destino sea visible desde el arranque. */}
      <div className="flex items-center gap-1.5">
        <Waves className="w-3.5 h-3.5 text-water-600" />
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">Calcular el embalse</p>
      </div>
      <p className="text-[10px] text-ink-700/55 leading-relaxed">
        Cuánta agua guarda y cuánta tierra hay que mover: integra la elevación bajo el pelo de agua y dimensiona el muro.
      </p>

      <Paso n={1} hecho={poligonos.length > 0} titulo="Poné el espejo de agua en el mapa">
        <button
          onClick={onDibujarEspejo}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-water-500/15 hover:bg-water-500/25 text-water-700 border border-water-500/40 rounded-xl text-xs font-medium transition-colors"
        >
          <PenLine className="w-3.5 h-3.5" /> Dibujar espejo de agua
        </button>
        <p className="text-[9px] text-ink-700/50 leading-relaxed">
          Los sitios sugeridos dejan un pin donde iría el muro: dibujá el espejo alrededor
          de ese pin, siguiendo las curvas de nivel.
        </p>
      </Paso>

      <Paso n={2} hecho={!!sel} titulo="Elegí cuál es">
        {poligonos.length === 0 ? (
          <p className="text-[10px] text-ink-700/50 bg-bone-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
            Todavía no hay ningún polígono ni zona sobre el mapa. Cuando dibujes uno, aparece acá.
          </p>
        ) : (
          <select
            value={selId}
            onChange={e => setSelId(e.target.value)}
            className="w-full text-xs bg-white border border-bone-200 rounded-lg px-2 py-1.5 text-ink-900 focus:outline-none focus:border-moss-500"
          >
            <option value="">Elegí el polígono de la represa…</option>
            {poligonos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        )}
      </Paso>

      {/* Paso 3: el lado del muro. Va ANTES de calcular porque de él dependen el
          largo del coronamiento, el perfil del terreno bajo el eje, el volumen
          de terraplén y la cuenca de aporte. Antes lo elegía la app sola. */}
      <Paso n={3} hecho={muroIdx !== null} titulo="Elegí de qué lado va el muro">
        {!sel ? (
          <p className="text-[10px] text-ink-700/50 bg-bone-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
            Primero elegí el polígono del espejo (paso 2).
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {lados.map(l => {
                const elegido = muroIdx === l.i;
                const sugerido = muroSugerido === l.i;
                return (
                  <button
                    key={l.i}
                    onClick={() => { setMuroIdx(l.i); setCuencaMuro(null); setCuencaMuroAviso(null); }}
                    onMouseEnter={() => onMuroLinea?.([sel.vertices[l.i]!, sel.vertices[(l.i + 1) % sel.vertices.length]!])}
                    // Al salir se repone lo elegido: el efecto que dibuja el
                    // muro depende de `muroIdx`, que el hover no cambia, así que
                    // sin esto la línea se quedaba sobre el último lado mirado.
                    onMouseLeave={() => onMuroLinea?.(muroIdx !== null
                      ? [sel.vertices[muroIdx]!, sel.vertices[(muroIdx + 1) % sel.vertices.length]!]
                      : null)}
                    title={`Lado ${l.i + 1} · ${l.largo_m} m${l.cotaMin !== null ? ` · cota mínima ${l.cotaMin} m` : ''}`}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-medium leading-tight transition-colors ${
                      elegido
                        ? 'border-moss-700 bg-moss-700 text-bone-50'
                        : 'border-bone-300 text-ink-700/70 hover:border-moss-500 hover:text-moss-700'
                    }`}
                  >
                    <span className="font-bold">Lado {l.i + 1}</span>
                    <span className={elegido ? 'text-bone-50/75' : 'text-ink-700/45'}> · {l.largo_m} m</span>
                    {l.cotaMin !== null && (
                      <span className={elegido ? 'text-bone-50/75' : 'text-ink-700/45'}> · {l.cotaMin} m</span>
                    )}
                    {sugerido && !elegido && <span className="block text-water-700">el más bajo</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              Es el lado que vas a cerrar: el cuello de botella entre las laderas. Pasá
              el mouse por encima para verlo en el mapa.
              {muroSugerido === null && ' Las cotas aparecen después de calcular, o si ya pasaste por Topografía.'}
            </p>
          </>
        )}
      </Paso>

      <Paso n={4} hecho={!!res} titulo="Calculá">
        <button
          onClick={analizar}
          disabled={cargando || !sel || muroIdx === null}
          title={!sel ? 'Primero elegí el polígono del espejo (paso 2)' : muroIdx === null ? 'Primero elegí el lado del muro (paso 3)' : undefined}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 disabled:cursor-not-allowed text-bone-50 rounded-xl text-xs font-medium transition-colors"
        >
          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Waves className="w-3.5 h-3.5" />}
          {cargando ? 'Calculando…' : 'Calcular embalse'}
        </button>
        {(!sel || muroIdx === null) && (
          <p className="text-[9px] text-ink-700/45 text-center">
            {poligonos.length === 0
              ? 'Falta el espejo (paso 1).'
              : !sel
                ? 'Falta elegir el polígono (paso 2).'
                : 'Falta elegir el lado del muro (paso 3).'}
          </p>
        )}
      </Paso>

      {error && <p className="text-[10px] text-clay-600 leading-tight">{error}</p>}

      {/* Archivo de represas. Va arriba de los resultados a propósito: se
          puede volver a una calculada sin tener ninguna activa, que es lo que
          pasa al abrir el proyecto al día siguiente. */}
      {guardadas.length > 0 && (
        <div className="bg-white rounded-xl border border-bone-200 p-3 space-y-2">
          <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-1">
            <Archive className="w-3 h-3" /> Represas calculadas ({guardadas.length})
          </p>
          {porEficiencia(guardadas).map((g, i) => {
            // El espejo de agua se puede haber borrado del mapa después de
            // archivar: la ficha sigue valiendo para comparar, pero sin
            // polígono no hay nada que recalcular.
            const existe = poligonos.some(pg => pg.id === g.inputs.poligonoId);
            return (
              <div key={g.id} className="flex items-start gap-2 border-t border-bone-100 pt-2 first:border-0 first:pt-0">
                <span className={`shrink-0 mt-0.5 w-3.5 text-center text-[9px] font-mono font-bold ${i === 0 && g.ficha.viable ? 'text-moss-700' : 'text-ink-700/35'}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-ink-900 truncate leading-tight">
                    {g.nombre}
                    {!g.ficha.viable && <span className="text-clay-700 font-normal"> · el balance no cierra</span>}
                  </p>
                  <p className="text-[9px] text-ink-700/55 leading-tight">{resumenRepresa(g)}</p>
                  <p className="text-[9px] text-ink-700/40 leading-tight">
                    {g.poligonoNombre} · nivel {g.ficha.nivel_m.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m
                    {g.ficha.confiabilidad_pct !== undefined && ` · aguanta el ${g.ficha.confiabilidad_pct} % de los meses`}
                    {!g.ficha.perfilUsado && ' · muro sin perfil del eje'}
                  </p>
                  {!existe && (
                    <p className="text-[9px] text-clay-700/80 leading-tight">
                      El espejo de agua ya no está en el mapa: la ficha queda, pero no se puede volver a abrir.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  {existe && (
                    <button onClick={() => abrirGuardada(g)} className="text-[9px] text-moss-700 hover:text-moss-900 font-medium">Abrir</button>
                  )}
                  {onEliminar && (
                    <button onClick={() => onEliminar(g.id)} className="text-[9px] text-clay-700/70 hover:text-clay-900">Borrar</button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-[9px] text-ink-700/40 leading-relaxed">
            Ordenadas por agua embalsada sobre tierra movida: la primera es la que mejor paga el movimiento de suelo, que no siempre es la más grande. Abrir una repone sus parámetros y la vuelve a calcular.
          </p>
        </div>
      )}

      {/* La otra mitad de la comparación: cuánta de esa agua se evapora. */}
      <ComparacionCandidatos
        guardadas={guardadas}
        datosClima={datosClima}
        precio_m3_tierra={precioTierra}
        onPrecio={setPrecioTierra}
      />

      {rango && nivel !== null && res && (
        <div className="space-y-2 bg-white rounded-xl border border-bone-200 p-3">
          {/* Nivel de agua */}
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-ink-700/55">Nivel de agua</span>
              <span className="font-mono font-bold text-ink-900">{nivel.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={rango.min} max={rango.max} step={0.1}
              value={nivel}
              onChange={e => onNivel(parseFloat(e.target.value))}
              className="w-full accent-moss-700"
            />
            <div className="flex justify-between text-[8px] font-mono text-ink-700/40">
              <span>{rango.min.toFixed(0)} m (fondo)</span><span>{rango.max.toFixed(0)} m (borde)</span>
            </div>
          </div>

          {/* Unidad en que se lee el agua embalsada */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-ink-700/50 mr-auto">Mostrar el agua en</span>
            {UNIDADES_VOLUMEN.map(u => (
              <button
                key={u.id}
                onClick={() => setUnidadVol(u.id)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium border transition-colors ${
                  unidadVol === u.id ? 'border-moss-700 bg-moss-700 text-bone-50' : 'border-bone-300 text-ink-700/65 hover:border-ink-400'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <Stat label="Volumen agua" valor={volumen(res.volumen_m3, unidadVol)} />
            <Stat label="Área inundada" valor={`${(res.area_inundada_m2 / 10000).toFixed(2)} ha`} />
            <Stat label="Prof. máxima" valor={`${res.prof_max_m} m`} />
            <Stat label="Prof. media" valor={`${res.prof_media_m} m`} />
          </div>

          <p className="text-[10px] text-ink-700/60 leading-relaxed flex gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5 text-water-500" />
            Volumen embalsado integrando la elevación de {relieve} bajo el nivel de agua (orientativo). El movimiento de tierra y la eficiencia del sitio están más abajo, según el tipo de obra.
          </p>

          {/* ── Muro de la represa (trapecio) ── */}
          {muro && (
            <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-2">
              <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Muro / terraplén</p>

              {/* Tipo de obra: define la revancha y si el muro se transita */}
              <div className="flex gap-1 bg-bone-100 rounded-lg p-0.5">
                {(['aguada', 'ladera'] as TipoMuro[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTipoMuro(t); setMuroP(p => ({ ...p, revancha: REVANCHA[t] })); }}
                    className={`flex-1 text-[9px] font-medium py-1 rounded-md transition-colors ${
                      tipoMuro === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700/55 hover:text-ink-700'
                    }`}
                  >
                    {t === 'aguada' ? 'Aguada / tajamar' : 'Represa de ladera'}
                  </button>
                ))}
              </div>

              {/* Sección trapezoidal */}
              <svg viewBox="0 0 120 60" className="w-full h-16">
                {/* agua */}
                <rect x="0" y="34" width="46" height="20" fill="#1E88E5" opacity="0.25" />
                {/* trapecio del muro: corona arriba, base abajo (aguas arriba a la izq) */}
                <polygon points="46,12 74,12 92,54 28,54" fill="#A1887F" stroke="#6D4C41" strokeWidth="1" />
                <line x1="46" y1="12" x2="74" y2="12" stroke="#4E342E" strokeWidth="1.5" />
                {/* cotas */}
                <text x="60" y="9" textAnchor="middle" fontSize="6" fill="#5D4037">corona {muro.anchoCorona_m} m</text>
                <text x="60" y="59.5" textAnchor="middle" fontSize="6" fill="#5D4037">base {muro.anchoBase_m} m (máx.)</text>
                <text x="20" y="36" textAnchor="middle" fontSize="6" fill="#1565C0">agua</text>
                <text x="98" y="36" textAnchor="start" fontSize="6" fill="#5D4037">h {muro.alto_m} m</text>
              </svg>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <Stat label="Alto máx. / medio" valor={`${muro.alto_m} / ${muro.altoMedio_m} m`} />
                <Stat label="Base máx. / media" valor={`${muro.anchoBase_m} / ${muro.anchoBaseMedio_m} m`} />
                <Stat label="Áng. interno" valor={`${muro.anguloInterno_deg}°`} />
                <Stat label="Áng. externo" valor={`${muro.anguloExterno_deg}°`} />
                <Stat label="Sección máx. / media" valor={`${muro.seccion_m2} / ${muro.seccionMedia_m2} m²`} />
                <Stat label="Vol. terraplén" valor={`${muro.volumenTierra_m3.toLocaleString('es-AR')} m³`} />
              </div>

              {/* Por qué hay dos números y no uno. El muro es una cuña en planta:
                  tiene su altura máxima en el punto más hondo del cuello y baja a
                  cero contra los estribos. Mostrar sólo el máximo —que es lo que
                  se hacía— hacía leer la base más ancha como si fuera el ancho
                  del muro en todo su largo. */}
              {muro.perfilUsado ? (
                <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5 text-moss-700/50" />
                  El muro se calcula punto por punto sobre el perfil del terreno bajo el eje elegido, no como un prisma de altura constante: por eso hay un máximo y un promedio. El volumen del terraplén es la integral de la sección a lo largo del eje.
                </p>
              ) : (
                <p className="text-[9px] text-clay-700/80 leading-relaxed flex gap-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  Sin perfil del terreno bajo el eje: el muro se estima como un prisma de altura constante, que sobredimensiona el terraplén. Elegí el lado del polígono que hace de muro para afinar el cálculo.
                </p>
              )}

              {muro.sinMuro && (
                <p className="text-[9px] text-moss-700 leading-relaxed font-medium">
                  Con este nivel de agua el terreno del eje ya está por encima: la obra es una excavación, no un muro. Todo el suelo que saques se convierte en capacidad.
                </p>
              )}

              {/* ── Partidas de obra, en el orden en que se ejecutan ── */}
              <div className="bg-bone-50 rounded-lg p-2 space-y-1">
                <p className="text-[10px] font-semibold text-ink-700">Movimiento de suelo, por partida</p>
                <Partida n={1} label="Destape de la huella" valor={muro.partidas.destape_m3}
                  nota="Suelo vegetal retirado bajo el muro. No va adentro del terraplén: se pudre y deja huecos. Se acopia." />
                <Partida n={2} label="Zanja de anclaje" valor={muro.partidas.zanjaExcavacion_m3}
                  nota="Se excava bajo el eje hasta material firme, antes de empezar el muro." />
                <Partida n={3} label="Relleno arcilloso de la zanja" valor={muro.partidas.zanjaArcilla_m3}
                  nota="Arcilla compactada en capas, para que el agua no se vaya por debajo del muro." />
                <Partida n={4} label="Núcleo impermeable" valor={muro.partidas.nucleo_m3}
                  nota="La tierra más profunda y arcillosa del préstamo, al centro de la contención." />
                <Partida n={5} label="Espaldones" valor={muro.partidas.espaldones_m3}
                  nota="La tierra de profundidad media hace el cuerpo de los dos taludes." />
                <Partida n={6} label="Revestimiento del talud externo" valor={muro.partidas.revestimiento_m3}
                  nota="El suelo vegetal del destape, devuelto sobre la cara de aguas abajo para que agarre pasto." />
              </div>

              {/* ── Ancho de corona: el parámetro que manda ── */}
              {recCorona.aplica && (
                <div className="bg-bone-50 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-ink-700/60">Ancho de corona</span>
                    <span className="font-mono font-bold text-ink-900">{muroP.anchoCorona} m</span>
                  </div>
                  <input
                    type="range"
                    min={recCorona.min} max={recCorona.max} step={0.5}
                    value={Math.min(recCorona.max, Math.max(recCorona.min, muroP.anchoCorona))}
                    onChange={e => { setMuroAuto(false); setMuroP(p => ({ ...p, anchoCorona: parseFloat(e.target.value) })); }}
                    className="w-full accent-moss-700"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-ink-700/40">
                    <span>{recCorona.min} m</span>
                    <span className={evalCorona.estado === 'recomendado' ? 'text-moss-700 font-bold' : ''}>
                      {evalCorona.estado === 'recomendado' ? 'sugerido' : `sugerido ${recCorona.valor} m`}
                    </span>
                    <span>{recCorona.max} m</span>
                  </div>
                  <p className="text-[9px] text-ink-700/55 leading-relaxed">{recCorona.criterio}</p>
                  {recCorona.ajustes.map((t, i) => (
                    <p key={i} className="text-[9px] text-ink-700/45 leading-relaxed">· {t}</p>
                  ))}
                  {evalCorona.estado === 'fuera_de_rango' && (
                    <p className="text-[9px] text-clay-700 leading-relaxed font-medium">{evalCorona.mensaje}</p>
                  )}
                  <p className="text-[9px] text-ink-700/45 leading-relaxed">
                    Al mover la corona cambia el ancho de base: base = corona + alto × (talud int. + talud ext.).
                    En la sección más honda, {muroP.anchoCorona} + {muro.alto_m} × ({muroP.taludInterno} + {muroP.taludExterno}) = <b>{muro.anchoBase_m} m</b>;
                    a lo largo del eje el promedio es <b>{muro.anchoBaseMedio_m} m</b>, porque el muro se afina hacia los estribos.
                  </p>
                </div>
              )}

              {/* Taludes y resto */}
              <div className="space-y-1.5 bg-bone-50 rounded-lg p-2">
                <ParamRow label="Largo del muro (m)" value={longitud} onChange={v => setLongMuro(v)} step={1} />
                <ParamRow label="Talud interno · lado del agua (H:1V)" value={muroP.taludInterno} onChange={v => { setMuroAuto(false); setMuroP(p => ({ ...p, taludInterno: v })); }} step={0.5} />
                <ParamRow label="Talud externo · lado seco (H:1V)" value={muroP.taludExterno} onChange={v => { setMuroAuto(false); setMuroP(p => ({ ...p, taludExterno: v })); }} step={0.5} />
                <ParamRow label="Revancha (m)" value={muroP.revancha} onChange={v => setMuroP(p => ({ ...p, revancha: v }))} step={0.1} />
              </div>

              {/* ── Qué quiere decir H:1V ───────────────────────────────────
                  Es la notación estándar de movimiento de suelo y no la conoce
                  nadie que no venga de la obra. Y no es un detalle: el talud
                  decide el ancho de base y con él todo el volumen de terraplén,
                  así que alguien lo va a mover. Se explica con el muro que está
                  dibujado, no en abstracto: qué se corre en horizontal, cuánta
                  pendiente es y cuántos metros de campo ocupa cada cara. */}
              <TaludExplicado interno={muroP.taludInterno} externo={muroP.taludExterno} alto={muro.alto_m} />

              <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-ink-700/40" />
                Taludes sugeridos {recTaludes.interno}:1 aguas arriba y {recTaludes.externo}:1 aguas abajo. {recTaludes.criterio}
                {claseSuelo && ` Material según el suelo del sitio: ${claseSuelo.nota}`}
                {!claseSuelo && ' Sin dato de suelo cargado: se asume una mezcla areno-arcillosa. Cargá el suelo (pestaña Suelo) para afinarlo.'}
              </p>

              {!muroAuto && (
                <button
                  onClick={() => setMuroAuto(true)}
                  className="w-full text-[10px] font-medium text-moss-700 border border-moss-300 rounded-lg py-1 hover:bg-moss-50 transition-colors"
                >
                  Volver a la geometría que sugiere el criterio
                </button>
              )}

              {/* Los criterios publicados: la cota de corona con sus cuatro
                  términos, la profundidad de agua que pide el clima y el factor
                  de evaporación del espejo. Ver `RepresaCriteriosBloque`. */}
              {nivel !== null && (
                <RepresaCriteriosBloque
                  res={res}
                  muro={muro}
                  nivel={nivel}
                  datosClima={datosClima}
                  cargaVertedero={cargaVertedero}
                  onCargaVertedero={setCargaVertedero}
                  compactadoEnCapas={compactadoEnCapas}
                  onCompactado={setCompactadoEnCapas}
                  infiltracion_mm_dia={parseFloat(seep) || null}
                />
              )}

              {/* Eficiencia del sitio: agua embalsada / muro (terraplén) */}
              <div className="rounded-lg border border-moss-200 bg-moss-50 px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-ink-700/70">
                  Eficiencia del sitio (agua ÷ muro)
                </span>
                <span className="font-mono text-sm font-bold text-moss-700">{eficiencia.toFixed(1)} : 1</span>
              </div>
              {balance && (
                <p className="text-[9px] text-ink-700/50 leading-relaxed">
                  {balance.volumenAgua_m3.toLocaleString('es-AR')} m³ de agua ÷ {balance.banco_m3.toLocaleString('es-AR')} m³ de tierra movida (en banco, con factor de contracción {muro.factorContraccion}).
                </p>
              )}

              {/* ── Balance de tierra: el préstamo sale de adentro del vaso ── */}
              {balance && !muro.sinMuro && (
                <div className="rounded-lg border border-water-200 bg-water-50/60 p-2 space-y-1">
                  <p className="text-[10px] font-semibold text-ink-700">Balance de tierra</p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <Stat label="Compactado en obra" valor={`${balance.compactado_m3.toLocaleString('es-AR')} m³`} />
                    <Stat label="A excavar (banco)" valor={`${balance.banco_m3.toLocaleString('es-AR')} m³`} />
                    <Stat label="Agua que gana el vaso" valor={`+${balance.capacidadExtra_m3.toLocaleString('es-AR')} m³`} />
                    <Stat label="Baja el fondo" valor={`${(balance.profundizacionMedia_m * 100).toFixed(0)} cm`} />
                  </div>
                  <p className={`text-[9px] leading-relaxed ${balance.viable ? 'text-ink-700/55' : 'text-clay-700 font-medium'}`}>
                    {balance.nota}
                  </p>
                  <p className="text-[9px] text-ink-700/45 leading-relaxed">
                    Agua sobre el terreno natural {res.volumen_m3.toLocaleString('es-AR')} m³ + {balance.capacidadExtra_m3.toLocaleString('es-AR')} m³ que gana la excavación del préstamo = <b>{balance.volumenAgua_m3.toLocaleString('es-AR')} m³</b>.
                  </p>
                </div>
              )}
              <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-moss-700/50" />
                m³ de agua embalsada ÷ m³ del muro (terraplén). Cuanto más agua se embalsa con menos muro —un buen cuello de botella entre laderas— mayor la eficiencia y mejor el sitio elegido.
              </p>
            </div>
          )}

          {/* ── Cuenca de aporte desde el muro (C) ── */}
          <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-2">
            <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Cuenca de aporte</p>
            {muroIdx === null ? (
              <p className="text-[10px] text-ink-700/55 leading-relaxed">Elegí el lado del muro (paso 3) para delinear su cuenca de aporte.</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-ink-700/70">
                    Muro: <b>lado {muroIdx + 1}</b>/{sel?.vertices.length}
                    {muroSugerido === muroIdx && <span className="text-ink-700/45"> (el más bajo)</span>}
                  </span>
                  <span className="text-[10px] text-ink-700/45">se cambia en el paso 3</span>
                </div>
                <button
                  onClick={calcularCuencaMuro}
                  disabled={cuencaMuroLoad}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1565C0]/12 hover:bg-[#1565C0]/20 text-[#1565C0] border border-[#1565C0]/35 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {cuencaMuroLoad ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Waves className="w-3.5 h-3.5" />}
                  {cuencaMuroLoad ? 'Delineando cuenca…' : 'Calcular cuenca desde el muro'}
                </button>
                {cuencaMuro && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <Stat label="Área de cuenca" valor={`${cuencaMuro.area_ha} ha`} />
                    <Stat label="Recorrido flujo" valor={`${cuencaMuro.long_flujo_m} m`} />
                  </div>
                )}
                {cuencaMuroAviso && <p className="text-[10px] text-clay-700 leading-relaxed">{cuencaMuroAviso}</p>}
                <p className="text-[9px] text-ink-700/45 leading-relaxed">
                  La salida es el punto más bajo del muro; la cuenca sube hasta la divisoria real y se dibuja en el mapa. El área alimenta el balance de abajo.
                </p>
              </>
            )}
          </div>

          {/* Archivar. Mover el nivel o cambiar de espejo recalcula arriba de lo
              anterior, así que comparar dos emplazamientos obligaba a anotar los
              números en un papel antes de tocar nada. Y comparar es el trabajo:
              un predio tiene tres o cuatro cuellos donde se podría cerrar un
              muro, y lo que decide no es si cada uno da, es cuál da más agua por
              metro cúbico de tierra movida. */}
          {onGuardar && ficha && (
            <div className="border-t border-bone-200 pt-2.5 mt-1 space-y-1">
              <button
                onClick={() => onGuardar(inputsActuales, ficha, sel?.nombre ?? 'Espejo de agua')}
                disabled={!!yaEsta}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  yaEsta
                    ? 'bg-moss-50 text-moss-700 border-moss-200 cursor-default'
                    : 'bg-moss-700 hover:bg-moss-900 text-bone-50 border-transparent'
                }`}
              >
                {yaEsta
                  ? <><Check className="w-3.5 h-3.5" /> Guardada como «{yaEsta.nombre}»</>
                  : <><Archive className="w-3.5 h-3.5" /> Guardar esta represa</>}
              </button>
              {!yaEsta && (
                <p className="text-[9px] text-ink-700/45 leading-relaxed text-center">
                  Queda en la lista con sus parámetros y sus números. Después podés mover el nivel o probar otro espejo sin perder ésta.
                </p>
              )}
            </div>
          )}

        </div>
      )}
      </div>

      {/* Simulación y observaciones.
          Va FUERA del bloque de arriba y se monta siempre que haya embalse
          calculado, aunque la pestaña visible sea otra: es esta sección la que
          emite el resumen de la represa hacia el informe y el escenario, y si se
          desmontara al cambiar de pestaña el informe se quedaría sin represa. */}
      {rango && nivel !== null && res ? (
        <RepresaSimSection
          seccion={seccion}
          res={res} datosClima={datosClima} cuencaHa={cuencaMuro?.area_ha ?? cuencaHa}
          grupoHidro={grupoHidro} texturaSuelo={texturaSuelo} fuenteDem={datosShader?.fuente ?? null} onResumen={recibirResumen}
          rodeo={rodeo} onRodeo={onRodeo}
          cobertura={coberturaCuenca} onCobertura={setCoberturaCuenca}
          coef={coefCuenca} onCoef={setCoefCuenca}
          coefAnualPredio={coefAnualPredio} composicionPredio={composicionPredio}
          coefGuardado={inicial?.coef ?? null}
          ha={haCuenca} onHa={setHaCuenca}
          seep={seep} onSeep={setSeep}
        />
      ) : seccion !== 'embalse' && (
        <p className="text-[10px] text-ink-700/55 bg-bone-50 rounded-lg px-2.5 py-2 leading-relaxed">
          Todavía no hay embalse calculado. Andá a <b>Cálculo de embalse</b>, dibujá el
          espejo de agua y calculalo: con eso se llena esta pestaña.
        </p>
      )}
    </div>
  );
}

// ─── Simulación mensual del embalse (B3) ──────────────────────────────────────

function RepresaSimSection({
  seccion,
  res, datosClima, cuencaHa, grupoHidro = null, texturaSuelo = null, fuenteDem = null, onResumen,
  rodeo, onRodeo, cobertura, onCobertura, coef, onCoef, ha, onHa, seep, onSeep,
  coefAnualPredio, composicionPredio, coefGuardado,
}: {
  seccion: SeccionRepresa;
  res: ResultadoEmbalse; datosClima: DatosClima | null; cuencaHa: number | null; grupoHidro?: GrupoHidro | null;
  texturaSuelo?: { arcilla_pct: number; arena_pct: number } | null;
  fuenteDem?: DatosShader['fuente'] | null;
  onResumen?: (r: RepresaResumen | null) => void;
  rodeo: Rodeo; onRodeo: (r: Rodeo) => void;
  cobertura: string; onCobertura: (v: string) => void;
  coef: string;      onCoef: (v: string) => void;
  ha: string;        onHa: (v: string) => void;
  seep: string;      onSeep: (v: string) => void;
  coefAnualPredio: number | null;
  composicionPredio: Array<{ nombre: string; pct: number }>;
  coefGuardado: string | null;
}) {
  /**
   * Cómo llega el rodeo al bebedero. Arranca en «todo junto», que es el criterio
   * conservador: pide el doble de espacios de bebida y por lo tanto el doble de
   * caudal. Entre quedarse corto y sobrar en un caño, sobra el caño.
   */
  const [llegada, setLlegada] = useState<LlegadaAlAgua>('rodeo');

  // Autocompleta el área de cuenca (desde el muro o B2).
  useEffect(() => { if (cuencaHa) onHa(String(cuencaHa)); }, [cuencaHa, onHa]);

  /**
   * El coeficiente sigue a la cobertura elegida — salvo la primera vuelta si el
   * proyecto traía uno guardado.
   *
   * Sin esa excepción, volver a la pestaña Represa disparaba este efecto al
   * montar y pisaba el coeficiente que la persona había ajustado a mano, aunque
   * `RepresaInputs` lo tuviera bien guardado: el trabajo se perdía sin aviso.
   */
  const respetarGuardado = useRef(coefGuardado !== null);
  useEffect(() => {
    if (respetarGuardado.current) { respetarGuardado.current = false; return; }
    onCoef(String(cobertura === COBERTURA_PREDIO
      ? (coefAnualPredio ?? coefEscorrentiaAnual(grupoHidro ?? 'B', 'pastura_regular'))
      : coefEscorrentiaAnual(grupoHidro ?? 'B', cobertura)));
  }, [grupoHidro, cobertura, coefAnualPredio, onCoef]);

  /**
   * La demanda sale del rodeo del predio —el mismo que usa Producción— y ahora
   * **mes a mes según la temperatura media de cada mes**. Antes era un número
   * repetido doce veces, que decía que el rodeo toma lo mismo en julio que en
   * enero: entre esos dos meses hay más de un 50 % de diferencia, y el error caía
   * del lado peligroso, porque enero es cuando la represa está más baja.
   *
   * Sin clima cargado no hay temperaturas, así que queda la demanda constante con
   * los valores declarados: es lo que había y no empeora nada.
   */
  const demandaMeses = useMemo(
    () => datosClima ? demandaMensualPorTemperatura_m3(rodeo, datosClima.meses.map(m => m.tmean_c)) : null,
    [rodeo, datosClima]);

  const demandaConstante = demandaMensual_m3(rodeo);

  /** Promedio de los doce. Por doce da la demanda anual exacta. */
  const demanda = demandaMeses
    ? Math.round((demandaMeses.reduce((a, b) => a + b, 0) / 12) * 10) / 10
    : demandaConstante;

  const mesPico = useMemo(() => {
    if (!demandaMeses) return null;
    let i = 0;
    for (let m = 1; m < 12; m++) if (demandaMeses[m]! > demandaMeses[i]!) i = m;
    return { mes: i, m3: demandaMeses[i]! };
  }, [demandaMeses]);

  /**
   * El factor de evaporación del espejo, mes a mes.
   *
   * Antes la simulación multiplicaba la ETP por un 1,05 fijo y sin fuente. El
   * 1,05 es correcto, pero es la PRIMERA fila de agua libre del cuadro 12 de
   * FAO-56 y vale para un vaso somero o para clima subhúmedo o tropical; un
   * embalse de más de 5 m en clima templado tiene dos valores, 0,65 mientras se
   * calienta y 1,25 cuando devuelve el calor. Acá sale del vaso y del clima de
   * este predio, hemisferio incluido.
   */
  const factorEspejo = useMemo(() => factorEvaporacionEspejo({
    profMedia_m:    res.prof_media_m,
    lat:            datosClima?.lat ?? null,
    claseAridez:    datosClima?.aridez?.clase ?? null,
    temp_mensual_c: datosClima ? datosClima.meses.map(m => m.tmean_c) : null,
  }), [res.prof_media_m, datosClima]);

  const sim = useMemo(() => {
    if (!datosClima) return null;
    return simularRepresaAnual({
      capacidad_m3:        res.volumen_m3,
      area_espejo_m2:      res.area_inundada_m2,
      cuencaArea_m2:       (parseFloat(ha) || 0) * 10000,
      coefEscorrentia:     parseFloat(coef) || 0,
      meses:               datosClima.meses.map(m => ({ precip_mm: m.precip_mm, etp_mm: m.etp_mm })),
      demanda_m3_mes:      demandaMeses ?? demandaConstante,
      infiltracion_mm_dia: parseFloat(seep) || 0,
      factorEvap_mensual:  factorEspejo.factor_mensual,
    });
  }, [res, datosClima, ha, coef, demandaMeses, demandaConstante, seep, factorEspejo]);

  // Emite el resumen hacia arriba (para informe/snapshot); limpia al desmontar.
  const resumen: RepresaResumen | null = useMemo(() => sim ? {
    capacidad_m3:      res.volumen_m3,
    cuenca_ha:         parseFloat(ha) || 0,
    demanda_m3_mes:    demanda,
    ...(mesPico ? { demanda_m3_mes_max: mesPico.m3, mes_demanda_max: mesPico.mes } : {}),
    confiabilidad_pct: sim.confiabilidad_pct,
    aguanta:           sim.aguanta,
    volumen_min_m3:    sim.volumen_min_m3,
    mes_critico:       sim.mes_critico,
    aporte_anual_m3:   sim.aporte_anual_m3,
  } : null, [sim, res.volumen_m3, ha, demanda, mesPico]);
  useEffect(() => { onResumen?.(resumen); }, [resumen, onResumen]);
  useEffect(() => () => { onResumen?.(null); }, [onResumen]);

  // El área de aporte cuenta como calculada mientras siga siendo la que trajo
  // el relieve (B2 o el muro); si la tocaste a mano, el llenado es tu supuesto.
  const salud = useMemo(() => confianzaRepresa({
    hayClima:            !!datosClima,
    area_espejo_m2:      res.area_inundada_m2,
    cuenca_ha:           parseFloat(ha) || 0,
    cuencaCalculada:     cuencaHa != null && Math.abs((parseFloat(ha) || 0) - cuencaHa) < 0.05,
    infiltracion_mm_dia: parseFloat(seep) || 0,
    grupo:               grupoHidro,
    fuenteDem,
  }), [datosClima, res.area_inundada_m2, ha, cuencaHa, seep, grupoHidro, fuenteDem]);

  return (
    <div className={seccion === 'embalse' ? 'hidden' : 'space-y-2'}>
      <p className="text-[10px] font-semibold text-ink-700 uppercase tracking-wide flex items-center gap-1">
        {seccion === 'simulacion'
          ? <><CalendarClock className="w-3 h-3" /> Simulación anual del embalse</>
          : <><Info className="w-3 h-3" /> De dónde salen estos números</>}
      </p>

      {!datosClima ? (
        <p className="text-[10px] text-ink-700/55 bg-bone-50 rounded-lg px-2 py-1.5">
          Cargá el clima (pestaña Clima) para simular el balance mensual de agua.
        </p>
      ) : (
        <>
          {/* Los parámetros del balance viven en Simulación: son las perillas
              del cálculo. Observaciones se queda con lo que dice cuánto vale
              ese resultado —el contraste, la salud y el método— que es lo que
              se lee una vez, no en cada ajuste. */}
          <div className={seccion === 'simulacion' ? 'space-y-2' : 'hidden'}>
          <div className="flex items-center justify-between gap-2 bg-bone-50 rounded-lg px-2 py-1.5">
            <span className="text-[10px] text-ink-700/60 shrink-0">Cobertura de la cuenca</span>
            <select
              value={cobertura}
              onChange={e => onCobertura(e.target.value)}
              className="text-[10px] bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
            >
              <option value={COBERTURA_PREDIO} disabled={coefAnualPredio === null}>
                {coefAnualPredio === null ? 'Como el predio (falta Cobertura)' : 'Como el predio (satélite)'}
              </option>
              {COBERTURAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {cobertura === COBERTURA_PREDIO && composicionPredio.length > 0 && (
            <p className="text-[9px] text-ink-700/55 leading-tight px-2 -mt-1">
              Ponderado por lo que ve el satélite: {composicionPredio.slice(0, 3).map(c => `${c.nombre} ${c.pct}%`).join(' · ')}
              {composicionPredio.length > 3 && ' …'}. Es el mismo criterio con el que se dimensionan swales y cuenca.
            </p>
          )}

          <div className="grid grid-cols-2 gap-1.5 bg-bone-50 rounded-lg p-2">
            <ParamRow label="Cuenca aporte (ha)" value={parseFloat(ha) || 0} onChange={v => onHa(String(v))} step={1} />
            <ParamRow label="Coef. escorrentía" value={parseFloat(coef) || 0} onChange={v => onCoef(String(v))} step={0.05} />
            <ParamRow label="Infiltr. (mm/día)" value={parseFloat(seep) || 0} onChange={v => onSeep(String(v))} step={1} />
          </div>

          {/* ── El consumo: es el mismo rodeo que Producción ── */}
          <div className="bg-bone-50 rounded-lg p-2 space-y-1.5">
            <span className="text-[10px] text-ink-700/60">Hacienda que bebe de acá</span>
            <RodeoEditor rodeo={rodeo} onRodeo={onRodeo} conRiego />
            <p className="text-[9px] text-ink-700/50 leading-relaxed">
              {procedencia(rodeo)} Es el mismo rodeo que usa Producción: lo que cambies acá se ve allá, y al revés.
            </p>
          </div>

          <AguaDelRodeo
            rodeo={rodeo} datosClima={datosClima} demandaMeses={demandaMeses} mesPico={mesPico}
            llegada={llegada} onLlegada={setLlegada}
          />

          {sim && (
            <>
              <div className={`rounded-xl border p-2.5 ${sim.aguanta ? 'bg-moss-50 border-moss-200' : 'bg-clay-100 border-clay-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-700/60 flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> {sim.aguanta ? 'Aguanta todo el año' : 'No cubre la demanda'}
                  </span>
                  <span className={`font-mono text-base font-bold ${sim.aguanta ? 'text-moss-700' : 'text-clay-700'}`}>
                    {sim.confiabilidad_pct}%
                  </span>
                </div>
                <p className="text-[9px] text-ink-700/55 mt-0.5">
                  confiabilidad · mín {sim.volumen_min_m3.toLocaleString('es-AR')} m³ ({MESES_NOMBRE[sim.mes_critico]})
                  {sim.meses_deficit > 0 ? ` · ${sim.meses_deficit} mes(es) con déficit` : ''}
                </p>
              </div>

              {/* Curva mensual de llenado */}
              <svg viewBox="0 0 240 90" className="w-full" style={{ height: 84 }}>
                {[0, 50, 100].map(p => (
                  <line key={p} x1={18} y1={8 + (100 - p) * 0.6} x2={238} y2={8 + (100 - p) * 0.6} stroke="#eee7dc" strokeWidth={0.5} />
                ))}
                {sim.meses.map((m, i) => {
                  const bw = 16, gap = 2.4;
                  const x = 20 + i * (bw + gap);
                  const h = Math.max(1, m.llenado_pct * 0.6);
                  const y = 8 + (100 - m.llenado_pct) * 0.6;
                  const col = m.deficit_m3 > 0 ? '#C62828' : m.derrame_m3 > 0 ? '#64B5F6' : '#2E7D32';
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={bw} height={h} fill={col} rx={1} />
                      <text x={x + bw / 2} y={80} textAnchor="middle" fontSize={5.5} fill="#9a958c">{MESES_NOMBRE[i]!.slice(0, 1)}</text>
                    </g>
                  );
                })}
                <text x={15} y={11} textAnchor="end" fontSize={5.5} fill="#9a958c" fontFamily="monospace">100</text>
                <text x={15} y={68} textAnchor="end" fontSize={5.5} fill="#9a958c" fontFamily="monospace">0</text>
              </svg>
              <div className="flex items-center gap-3 text-[8px] text-ink-700/55">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#2E7D32' }} />normal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#64B5F6' }} />derrama</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#C62828' }} />déficit</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <Stat label="Aporte anual" valor={`${sim.aporte_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Demanda anual" valor={`${sim.demanda_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Evaporación anual" valor={`${sim.meses.reduce((s, m) => s + m.evap_m3, 0).toLocaleString('es-AR')} m³`} />
                <Stat label="Infiltración anual" valor={`${sim.meses.reduce((s, m) => s + m.infiltr_m3, 0).toLocaleString('es-AR')} m³`} />
                <Stat label="Derrame anual" valor={`${sim.derrame_anual_m3.toLocaleString('es-AR')} m³`} />
                <Stat label="Demanda mensual" valor={`${demanda.toLocaleString('es-AR')} m³`} />
              </div>
            </>
          )}
          </div>

          {/* ── Observaciones ── */}
          <div className={seccion === 'observaciones' ? 'space-y-2' : 'hidden'}>
          {sim && (
            <>
              {/* El aporte anual de la simulación sale de un coeficiente; la
                  tabla 8.3 llega al mismo número por otro camino y con rango.
                  Es un contraste del resultado, no un parámetro: por eso acá. */}
              <EscurrimientoTabla
                precipAnualMm={datosClima.meses.reduce((s, m) => s + m.precip_mm, 0)}
                evapAnualMm={datosClima.meses.reduce((s, m) => s + m.etp_mm, 0)}
                areaHa={parseFloat(ha) || 0}
                texturaSuelo={texturaSuelo}
                comparar={{ label: 'coeficiente de escorrentía', m3: sim.aporte_anual_m3 }}
                queCapta="la cuenca de aporte"
              />

              <SaludCalculo key={salud.nivel} confianza={salud} />

              <p className="text-[9px] text-ink-700/45 italic leading-relaxed">
                Balance mensual: escorrentía − evaporación (ETP×espejo) − infiltración − demanda, convergido a ciclo estable. Clima NASA POWER · orientativo.
                {' '}El factor del espejo sobre la ETP sale del cuadro 12 de FAO-56 según la profundidad del vaso y el clima:{' '}
                {factorEspejo.regimen === 'profundo_templado'
                  ? <>varía entre <b>0,65</b> mientras el agua se calienta y <b>1,25</b> cuando devuelve el calor, porque un embalse hondo en clima templado guarda la radiación de una estación para la otra.</>
                  : <>acá es <b>{factorEspejo.factor_mensual[0]!.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</b> todo el año.</>}
              </p>
            </>
          )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Un paso del flujo del embalse. El número y el tilde no son decoración: acá
 * el orden sí importa —sin espejo no hay polígono que elegir, sin polígono no
 * hay qué calcular— y es justamente lo que no se veía.
 */
function Paso({ n, titulo, hecho, children }: {
  n: number; titulo: string; hecho: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 transition-colors ${
          hecho ? 'bg-moss-700 text-bone-50' : 'bg-bone-200 text-ink-700/60'
        }`}>
          {hecho ? <Check className="w-2.5 h-2.5" /> : n}
        </span>
        <span className={`text-[10px] font-semibold ${hecho ? 'text-moss-700' : 'text-ink-700/70'}`}>{titulo}</span>
      </div>
      <div className="pl-[22px] space-y-1.5">{children}</div>
    </div>
  );
}

function ParamRow({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-ink-700/60">{label}</span>
      <input
        type="number" step={step} min={0} value={value}
        onChange={e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) onChange(v); }}
        className="w-16 text-[10px] font-mono bg-white border border-bone-200 rounded px-1.5 py-0.5 text-ink-900 focus:outline-none focus:border-moss-500"
      />
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-bone-50 rounded px-2 py-1">
      <span className="text-ink-700/50">{label}</span><br />
      <span className="font-mono font-bold text-ink-900">{valor}</span>
    </div>
  );
}

/**
 * Una partida del movimiento de suelo, numerada por orden de ejecución.
 *
 * El número no es decorativo: la secuencia es parte del método. Si el suelo
 * vegetal no se retira antes de compactar, el muro se asienta; si el núcleo se
 * arma con la tierra de arriba en vez de la profunda, filtra.
 */
function Partida({ n, label, valor, nota }: { n: number; label: string; valor: number; nota: string }) {
  return (
    <div className="flex gap-1.5 items-baseline">
      <span className="font-mono text-[9px] text-ink-700/40 shrink-0 w-3">{n}.</span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <span className="text-[10px] text-ink-700/70">{label}</span>
          <span className="font-mono text-[10px] font-bold text-ink-900 shrink-0">
            {valor.toLocaleString('es-AR')} m³
          </span>
        </div>
        <p className="text-[9px] text-ink-700/45 leading-relaxed">{nota}</p>
      </div>
    </div>
  );
}

/**
 * Qué quiere decir «H:1V», con el muro que está dibujado.
 *
 * H:1V es cuántos metros HORIZONTALES por cada metro VERTICAL. Un talud 2,5
 * significa que por cada metro que sube el muro, la cara se corre 2,5 m: es una
 * pendiente de 1 en 2,5, o sea 40 %, unos 22°. Cuanto más grande el número, más
 * tendido el talud — al revés de lo que sugiere la intuición.
 *
 * No es un dato de ficha: el talud decide el ancho de base
 * (base = corona + alto × (interno + externo)) y con él todo el movimiento de
 * suelo y la superficie de campo que el muro se come. Por eso, además de la
 * definición, van los metros que ocupa cada cara en ESTE muro.
 *
 * Y el interno va siempre más tendido que el externo: está saturado, le pega el
 * oleaje y, sobre todo, la condición crítica es el vaciado rápido —cuando la
 * represa baja de golpe, el agua que quedó adentro del terraplén empuja hacia
 * afuera sin el agua del vaso que la contenía—. Ese es el lado que desliza.
 */
function TaludExplicado({ interno, externo, alto }: { interno: number; externo: number; alto: number }) {
  const pct = (h: number) => (h > 0 ? Math.round(100 / h) : 0);
  const grados = (h: number) => (h > 0 ? (Math.atan(1 / h) * 180 / Math.PI).toFixed(0) : '0');
  const corrida = (h: number) => Math.round(h * alto * 10) / 10;

  return (
    <details className="bg-white rounded-lg border border-bone-200 overflow-hidden">
      <summary className="px-2 py-1.5 text-[10px] font-medium text-ink-700 cursor-pointer select-none hover:bg-bone-50">
        ¿Qué es un talud «H:1V»?
      </summary>
      <div className="px-2 pb-2 space-y-1.5 text-[9px] text-ink-700/75 leading-relaxed">
        <p>
          <b>Metros horizontales por cada metro vertical.</b> Talud {interno} quiere decir que
          por cada metro que sube el muro, la cara se corre {interno} m hacia el costado.
          Número más grande = talud más tendido, no más parado.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-water-50/70 border border-water-200 rounded px-2 py-1.5">
            <p className="text-[9px] font-semibold text-ink-700">Interno · {interno}:1</p>
            <p className="text-ink-700/60">lado del agua</p>
            <p className="font-mono text-ink-900">{pct(interno)} % · {grados(interno)}°</p>
            <p className="text-ink-700/55">ocupa {corrida(interno)} m de ancho con {alto} m de alto</p>
          </div>
          <div className="bg-bone-50 border border-bone-200 rounded px-2 py-1.5">
            <p className="text-[9px] font-semibold text-ink-700">Externo · {externo}:1</p>
            <p className="text-ink-700/60">lado seco</p>
            <p className="font-mono text-ink-900">{pct(externo)} % · {grados(externo)}°</p>
            <p className="text-ink-700/55">ocupa {corrida(externo)} m de ancho con {alto} m de alto</p>
          </div>
        </div>
        <p className="text-ink-700/55">
          El interno va siempre más tendido. Está saturado, le pega el oleaje y la condición que
          lo hace deslizar es el <b>vaciado rápido</b>: cuando la represa baja de golpe, el agua
          que quedó adentro del terraplén empuja hacia afuera y ya no está la del vaso
          sosteniéndola. Parar ese talud para ahorrar tierra es donde se rompen los muros.
        </p>
      </div>
    </details>
  );
}


// ─── El agua del rodeo: por mes y por caudal de pico ──────────────────────────

/**
 * Dos cosas que la app calculaba mal y ahora salen de tablas publicadas.
 *
 * 1. **El consumo no es un litraje fijo por cabeza**: depende de la temperatura.
 *    Sale de `lib/aguaGanado.ts`, que reproduce la tabla del NASEM (2016).
 * 2. **El caudal de pico no es el consumo diario dividido 24.** El ganado va al
 *    agua dos veces por día y bebe unos cinco minutos; lo que elige el diámetro
 *    del caño es cuántos beben a la vez por el caudal al que bebe cada uno. Sale
 *    de `lib/abrevadero.ts`, que implementa dos normas de diseño del NRCS.
 */
function AguaDelRodeo({
  rodeo, datosClima, demandaMeses, mesPico, llegada, onLlegada,
}: {
  rodeo: Rodeo;
  datosClima: DatosClima | null;
  demandaMeses: number[] | null;
  mesPico: { mes: number; m3: number } | null;
  llegada: LlegadaAlAgua;
  onLlegada: (l: LlegadaAlAgua) => void;
}) {
  const cabezas = cabezasTotal(rodeo);

  // El mes más caluroso es el que manda el consumo, y casi nunca es el mismo que
  // el de menor lluvia: por eso se muestran los dos números y no uno.
  const tPico = useMemo(() => {
    if (!datosClima) return null;
    let i = 0;
    for (let m = 1; m < 12; m++) if (datosClima.meses[m]!.tmean_c > datosClima.meses[i]!.tmean_c) i = m;
    return { mes: i, t: datosClima.meses[i]!.tmean_c };
  }, [datosClima]);

  const detalle = useMemo(() => (tPico ? aguaRodeo(rodeo, tPico.t) : null), [rodeo, tPico]);

  const minMes = demandaMeses ? Math.min(...demandaMeses) : null;
  const caudal = cabezas > 0 ? caudalPico_l_h(cabezas, llegada) : 0;
  const factor = detalle ? factorContraPromedio(detalle.l_dia, cabezas, llegada) : null;
  const otrasSinCurva = detalle ? detalle.sinCurva.filter(n => !detalle.sinFuente.includes(n)) : [];

  if (cabezas === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-bone-200 p-2 space-y-1.5">
      <p className="text-[10px] font-semibold text-ink-700">El agua de esta hacienda</p>

      {demandaMeses && mesPico && minMes !== null && tPico ? (
        <>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <Stat label={`Mes de más calor (${MESES_NOMBRE[tPico.mes]})`} valor={`${mesPico.m3.toLocaleString('es-AR')} m³`} />
            <Stat label="Mes de menos" valor={`${minMes.toLocaleString('es-AR')} m³`} />
          </div>
          <p className="text-[9px] text-ink-700/55 leading-relaxed">
            El consumo sale de la <b>temperatura media de cada mes</b> y no de un litraje fijo por
            cabeza: entre el mes más fresco y el más caluroso hay{' '}
            <b>{minMes > 0 ? `${Math.round((mesPico.m3 / minMes - 1) * 100)} %` : '—'}</b> de
            diferencia. A {tPico.t.toLocaleString('es-AR', { maximumFractionDigits: 1 })} °C este
            rodeo toma {detalle ? detalle.l_dia.toLocaleString('es-AR') : '—'} L por día.
          </p>
        </>
      ) : (
        <p className="text-[9px] text-clay-700/80 leading-relaxed">
          Sin clima cargado el consumo queda en el valor declarado de cada categoría, igual todo el
          año. Calculá el clima del predio y pasa a salir de la temperatura de cada mes.
        </p>
      )}

      {/* ── Caudal de pico: lo que elige el caño y el bebedero ── */}
      <div className="border-t border-bone-100 pt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-ink-700/60">Llegan al agua</span>
          <div className="flex rounded-md overflow-hidden border border-bone-200">
            {([['rodeo', 'todo junto'], ['individual', 'de a poco']] as const).map(([v, rotulo]) => (
              <button
                key={v}
                onClick={() => onLlegada(v)}
                className={`px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                  llegada === v ? 'bg-moss-700 text-bone-50' : 'bg-white text-ink-700/60 hover:bg-bone-50'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <Stat label="Beben a la vez" valor={`${espaciosBebida(cabezas, llegada)} de ${cabezas}`} />
          <Stat label="Caudal de pico" valor={`${caudal.toLocaleString('es-AR')} L/h`} />
        </div>
        <p className="text-[9px] text-ink-700/55 leading-relaxed">
          Es el caudal que elige el diámetro del caño y el tamaño del bebedero, y{' '}
          <b>no es el consumo diario dividido 24</b>: así daría{' '}
          {factor ? `${factor.toLocaleString('es-AR', { maximumFractionDigits: 0 })} veces menos` : 'mucho menos'}.
          «De a poco» vale cuando hay agua en cada potrero y ningún animal camina más de{' '}
          {UMBRAL_DISTANCIA_M} m hasta ella; si el bebedero es uno solo y lejos, llegan juntos y se
          pelean el acceso.
        </p>
      </div>

      {detalle && (detalle.sinFuente.length > 0 || otrasSinCurva.length > 0 || detalle.aMano.length > 0 || detalle.extrapolado) && (
        <div className="border-t border-bone-100 pt-1.5 space-y-0.5">
          {detalle.sinFuente.length > 0 && (
            <p className="text-[9px] text-clay-700/80 leading-relaxed flex gap-1">
              <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span><b>{detalle.sinFuente.join(', ')}</b>: el consumo es el valor declarado, sin fuente publicada, y no se mueve con la temperatura.</span>
            </p>
          )}
          {otrasSinCurva.length > 0 && (
            <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
              <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span><b>{otrasSinCurva.join(', ')}</b>: la fuente publica un rango y no una curva, así que se toma el extremo alto y queda igual todo el año.</span>
            </p>
          )}
          {detalle.aMano.length > 0 && (
            <p className="text-[9px] text-ink-700/50 leading-relaxed flex gap-1">
              <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span><b>{detalle.aMano.join(', ')}</b>: los litros los escribiste vos, así que mandan sobre la tabla.</span>
            </p>
          )}
          {detalle.extrapolado && (
            <p className="text-[9px] text-clay-700/80 leading-relaxed flex gap-1">
              <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />
              <span>El mes más caluroso pasa los 32 °C, que es donde termina la tabla: arriba de ahí el valor queda acotado y puede quedar corto.</span>
            </p>
          )}
        </div>
      )}

      <details className="text-[9px]">
        <summary className="cursor-pointer select-none text-ink-700/45 hover:text-ink-700/70">de dónde salen estos números</summary>
        <div className="pt-1 space-y-1 text-ink-700/55 leading-relaxed">
          <p>
            <b>Consumo:</b> NASEM (2016), <i>Nutrient Requirements of Beef Cattle</i>, 8.ª edición
            revisada; tabla reproducida por NDSU Extension AS1763. Las guías del NRC vienen de las
            mediciones de Winchester y Morris (1956). Es consumo <b>total</b>: incluye el agua del
            alimento, así que con pasto verde el animal toma menos de la canilla. Se usa el total a
            propósito, que es el lado seguro para dimensionar una represa.
          </p>
          <p><b>Caudal y bebedero:</b> {FUENTE_CAUDAL}</p>
        </div>
      </details>
    </div>
  );
}
