/**
 * Cut & fill de represas / embalses: estima el volumen de agua almacenable y el
 * movimiento de suelo de una represa dibujada, integrando la grilla densa de
 * elevación dentro del polígono a un nivel de agua dado.
 * Aproximación desde SRTM ~30 m — orientativa para predimensionar.
 */
import type { GrillaElevacion } from './grillaElevacion';

export interface ResultadoEmbalse {
  nivelAgua_m:      number;
  volumen_m3:       number;   // agua almacenada (= excavación en dugout)
  area_inundada_m2: number;
  prof_max_m:       number;
  prof_media_m:     number;
  elev_min:         number;   // fondo
  elev_max:         number;   // borde más alto dentro del polígono
  ancho_max_m:      number;   // span máximo del vaso (sugerencia de largo de coronamiento)
  celdas:           number;
}

// ── Dimensionamiento del muro de represa (sección trapezoidal) ──
export interface ParamsMuro {
  profMax_m:     number;   // profundidad máxima del agua (del embalse)
  revancha_m:    number;   // borde libre sobre el nivel de agua
  anchoCorona_m: number;   // ancho de la coronación
  taludInterno:  number;   // talud aguas arriba (H:1V), ej. 3
  taludExterno:  number;   // talud aguas abajo (H:1V), ej. 2
  longitud_m:    number;   // largo del coronamiento (eje del muro)
  /**
   * Elevación del terreno natural a lo largo del eje del muro, muestreada a
   * paso regular (`perfilTerreno`). Es lo que convierte el cálculo en algo
   * parecido a la obra: el muro no tiene la altura máxima en todo su largo,
   * baja a cero contra los estribos. Sin perfil se cae al prisma de altura
   * constante, que sobredimensiona (ver el comentario de `dimensionarMuro`).
   */
  perfilTerreno_m?: number[];
  /** Cota del coronamiento. Si falta, se deduce del perfil y de la altura máxima. */
  cotaCorona_m?:    number;
  /** Espesor del destape de suelo vegetal bajo la huella. */
  destape_m?:       number;
  /** Zanja de anclaje: profundidad y ancho. */
  zanjaProf_m?:     number;
  zanjaAncho_m?:    number;
  /** Espesor del revestimiento vegetal del talud externo. */
  revestimiento_m?: number;
  /** Banco necesario por m³ compactado. Arcilloso ~1,25; arenoso ~1,10. */
  factorContraccion?: number;
}

/**
 * Partidas de obra, en el orden en que se ejecutan.
 *
 * No es un desglose decorativo: cada partida sale de una profundidad distinta
 * y va a un lugar distinto del muro, y de eso depende que la obra funcione.
 * El suelo vegetal del destape no puede ir adentro del terraplén —se pudre y
 * deja huecos— así que se guarda y se devuelve como revestimiento del talud
 * externo, donde sí sirve para que agarre pasto. La tierra de profundidad
 * media hace el cuerpo de los dos espaldones. La más profunda y arcillosa va
 * al núcleo, que es lo que impermeabiliza. Y bajo la huella del muro, antes de
 * empezar, se abre la zanja de anclaje: se saca el suelo vegetal y se rellena
 * con arcilla compactada, para que el agua no se vaya por debajo.
 */
export interface PartidasMuro {
  destape_m3:          number;  // suelo vegetal retirado de la huella (se guarda)
  zanjaExcavacion_m3:  number;  // apertura de la zanja de anclaje
  zanjaArcilla_m3:     number;  // relleno arcilloso compactado de la zanja
  nucleo_m3:           number;  // material profundo y arcilloso, al centro
  espaldones_m3:       number;  // material de profundidad media, a los dos taludes
  revestimiento_m3:    number;  // el destape, devuelto sobre el talud externo
}

export interface ResultadoMuro {
  alto_m:           number;  // altura máxima (en la sección más honda)
  altoMedio_m:      number;  // altura media a lo largo del eje
  anchoCorona_m:    number;
  anchoBase_m:      number;  // base en la sección más honda
  anchoBaseMedio_m: number;  // base media a lo largo del eje
  anguloInterno_deg:number;  // inclinación del talud aguas arriba (desde la horizontal)
  anguloExterno_deg:number;  // inclinación del talud aguas abajo
  seccion_m2:       number;  // sección máxima
  seccionMedia_m2:  number;  // sección media (la que manda el volumen)
  longitud_m:       number;
  volumenTierra_m3: number;  // terraplén (núcleo + espaldones + revestimiento)
  partidas:         PartidasMuro;
  factorContraccion:number;
  /** true si se integró un perfil real; false si se usó el prisma constante. */
  perfilUsado:      boolean;
  /** true cuando el terreno ya contiene el agua y no hace falta muro. */
  sinMuro:          boolean;
}

function puntoEnPoligono(lat: number, lng: number, poly: Array<{ lat: number; lng: number }>): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.lng, yi = poly[i]!.lat;
    const xj = poly[j]!.lng, yj = poly[j]!.lat;
    const cruza = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/** Elevaciones del terreno dentro del polígono (muestreadas de la grilla). */
function elevacionesDentro(g: GrillaElevacion, poly: Array<{ lat: number; lng: number }>) {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 0; c < cols; c++) {
      const v = elev[r * cols + c]!;
      if (isNaN(v)) continue;
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (puntoEnPoligono(lat, lng, poly)) out.push(v);
    }
  }
  return out;
}

/**
 * Elevación del terreno en un punto, por interpolación bilineal sobre la grilla.
 * `null` fuera de la grilla o sobre celdas sin dato.
 */
export function elevacionEn(g: GrillaElevacion, lat: number, lng: number): number | null {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const fr = ((lat - latMin) / (latMax - latMin)) * (rows - 1);
  const fc = ((lng - lngMin) / (lngMax - lngMin)) * (cols - 1);
  if (!(fr >= 0 && fr <= rows - 1 && fc >= 0 && fc <= cols - 1)) return null;
  const r0 = Math.floor(fr), c0 = Math.floor(fc);
  const r1 = Math.min(rows - 1, r0 + 1), c1 = Math.min(cols - 1, c0 + 1);
  const tr = fr - r0, tc = fc - c0;
  const v00 = elev[r0 * cols + c0]!, v01 = elev[r0 * cols + c1]!;
  const v10 = elev[r1 * cols + c0]!, v11 = elev[r1 * cols + c1]!;
  if (isNaN(v00) || isNaN(v01) || isNaN(v10) || isNaN(v11)) return null;
  return (v00 * (1 - tc) + v01 * tc) * (1 - tr) + (v10 * (1 - tc) + v11 * tc) * tr;
}

/**
 * Perfil del terreno natural a lo largo del eje del muro.
 *
 * Es el dato que faltaba para dimensionar bien: con él se sabe cuánto muro hay
 * que levantar en cada punto, en vez de suponer la altura máxima en todo el
 * largo. Los puntos sin dato se saltean; si no queda casi nada, devuelve null y
 * el cálculo avisa que está usando la aproximación gruesa.
 */
export function perfilTerreno(
  g: GrillaElevacion,
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  muestras = 41,
): number[] | null {
  const n = Math.max(3, Math.floor(muestras));
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const v = elevacionEn(g, a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t);
    if (v != null) out.push(v);
  }
  return out.length >= 3 ? out : null;
}

/** Área de una celda de la grilla en m² (a la latitud media). */
function areaCelda(g: GrillaElevacion): number {
  const latMid = (g.latMin + g.latMax) / 2;
  const latStep = ((g.latMax - g.latMin) / (g.rows - 1)) * 111_320;
  const lngStep = ((g.lngMax - g.lngMin) / (g.cols - 1)) * 111_320 * Math.cos(latMid * Math.PI / 180);
  return Math.abs(latStep * lngStep);
}

/** Rango de elevación del terreno dentro del polígono (para sugerir niveles). */
export function rangoElevacionPoligono(g: GrillaElevacion, poly: Array<{ lat: number; lng: number }>): { min: number; max: number; celdas: number } | null {
  const es = elevacionesDentro(g, poly);
  if (es.length < 3) return null;
  return { min: Math.min(...es), max: Math.max(...es), celdas: es.length };
}

/**
 * Calcula el embalse para un nivel de agua dado. Si no se pasa, usa el 60% del
 * desnivel interno (un llenado razonable sin desbordar el borde más bajo).
 */
export function calcularEmbalse(
  g: GrillaElevacion,
  poly: Array<{ lat: number; lng: number }>,
  nivelAgua?: number,
): ResultadoEmbalse | null {
  const es = elevacionesDentro(g, poly);
  if (es.length < 3) return null;
  const elev_min = Math.min(...es);
  const elev_max = Math.max(...es);
  const nivel = nivelAgua ?? (elev_min + (elev_max - elev_min) * 0.6);

  const aCelda = areaCelda(g);
  let volumen = 0, area = 0, profMax = 0;
  for (const groundE of es) {
    if (groundE < nivel) {
      const prof = nivel - groundE;
      volumen += prof * aCelda;
      area    += aCelda;
      if (prof > profMax) profMax = prof;
    }
  }
  if (area === 0) return null;

  // Span máximo del vaso (distancia máxima entre vértices) → sugerencia de largo de muro
  let anchoMax = 0;
  const latMid = (g.latMin + g.latMax) / 2 * Math.PI / 180;
  for (let i = 0; i < poly.length; i++) {
    for (let j = i + 1; j < poly.length; j++) {
      const dx = (poly[j]!.lng - poly[i]!.lng) * 111_320 * Math.cos(latMid);
      const dy = (poly[j]!.lat - poly[i]!.lat) * 111_320;
      const d = Math.hypot(dx, dy);
      if (d > anchoMax) anchoMax = d;
    }
  }

  return {
    nivelAgua_m:      Math.round(nivel * 10) / 10,
    volumen_m3:       Math.round(volumen),
    area_inundada_m2: Math.round(area),
    prof_max_m:       Math.round(profMax * 10) / 10,
    prof_media_m:     Math.round((volumen / area) * 10) / 10,
    elev_min:         Math.round(elev_min * 10) / 10,
    elev_max:         Math.round(elev_max * 10) / 10,
    ancho_max_m:      Math.round(anchoMax),
    celdas:           es.length,
  };
}

/**
 * Dimensiona el muro integrando su sección a lo largo del eje.
 *
 * Por qué no alcanza con el trapecio de altura máxima. La sección crece con el
 * CUADRADO de la altura —el término de los taludes es h²·(ti+te)/2 y domina—
 * así que multiplicar la sección máxima por el largo del eje supone un muro que
 * tiene su punto más hondo en todo su recorrido. Un muro real baja a cero
 * contra los estribos: si la altura se afina linealmente, la media de h es
 * h_máx/2 pero la media de h² es h_máx²/3, y el volumen de terraplén sale entre
 * 2,5 y 3 veces mayor que el real. El ancho de base tenía el mismo problema: el
 * número que se mostraba era el de la sección más honda, presentado como si
 * fuera el ancho del muro en todo su largo, cuando en planta el muro es una
 * cuña. Ahora se informan los dos, máximo y medio.
 *
 * De paso esto resuelve solo el caso de la aguada. En un tajamar excavado el
 * agua la contiene el pozo, no el bordo, y el terreno del eje está cerca del
 * nivel de agua: el perfil da alturas chicas o nulas y el muro se dimensiona
 * como lo que es. Antes recibía la profundidad máxima entera y le calculaba un
 * terraplén que en obra no existe.
 *
 * Sin perfil se conserva el prisma constante, para no romper llamadas viejas,
 * pero `perfilUsado` queda en false y la interfaz lo dice.
 */
export function dimensionarMuro(p: ParamsMuro): ResultadoMuro {
  const ti = p.taludInterno, te = p.taludExterno;
  const corona = p.anchoCorona_m;
  const altoMax = Math.max(0.1, p.profMax_m + p.revancha_m);

  // Secciones por altura. Todas devuelven m² por metro corrido de eje.
  const base    = (h: number) => corona + h * (ti + te);
  const secTot  = (h: number) => h <= 0 ? 0 : corona * h + (h * h * (ti + te)) / 2;
  // Núcleo impermeable: trapecio central, corona de un tercio de la del muro
  // (nunca menos de 1 m, para que se pueda compactar) y taludes 0,5:1.
  const coronaNucleo = Math.max(1, corona / 3);
  const secNuc  = (h: number) => h <= 0 ? 0 : Math.min(secTot(h), coronaNucleo * h + h * h * 0.5);
  // Revestimiento: capa sobre la cara del talud externo, cuyo desarrollo por
  // metro de altura es la raíz de (1 + te²).
  const espRev  = p.revestimiento_m ?? 0.2;
  const secRev  = (h: number) => h <= 0 ? 0 : Math.min(Math.max(0, secTot(h) - secNuc(h)), espRev * h * Math.sqrt(1 + te * te));
  const espDest = p.destape_m ?? 0.3;
  const secDest = (h: number) => h <= 0 ? 0 : espDest * base(h);
  const zProf   = p.zanjaProf_m ?? 0.8;
  const zAncho  = p.zanjaAncho_m ?? Math.max(2, altoMax / 4);
  const secZan  = (h: number) => h <= 0 ? 0 : zProf * zAncho;

  // ── Alturas del muro a lo largo del eje ──────────────────────────────────
  let alturas: number[];
  let perfilUsado = false;
  const perfil = p.perfilTerreno_m;
  if (perfil && perfil.length >= 3) {
    // La corona va a la cota que el muro tiene que alcanzar: el nivel de agua
    // más la revancha. Si no viene explícita, se deduce del punto más bajo del
    // eje —el fondo del cuello de botella— más el alto.
    const cotaCorona = p.cotaCorona_m ?? (Math.min(...perfil) + altoMax);
    alturas = perfil.map(e => Math.max(0, cotaCorona - e));
    perfilUsado = true;
  } else {
    alturas = [altoMax, altoMax];
  }

  /** Integral de una sección a lo largo del eje, por regla del trapecio. */
  const integrar = (fn: (h: number) => number): number => {
    const n = alturas.length;
    if (n < 2 || p.longitud_m <= 0) return 0;
    const dx = p.longitud_m / (n - 1);
    let acc = 0;
    for (let k = 0; k < n - 1; k++) acc += ((fn(alturas[k]!) + fn(alturas[k + 1]!)) / 2) * dx;
    return acc;
  };

  const hMax   = Math.max(...alturas);
  const hMedia = alturas.reduce((a, b) => a + b, 0) / alturas.length;

  const volTot  = integrar(secTot);
  const volNuc  = integrar(secNuc);
  const volRev  = integrar(secRev);
  const volEsp  = Math.max(0, volTot - volNuc - volRev);
  const volDest = integrar(secDest);
  const volZan  = integrar(secZan);

  const seccionMedia = p.longitud_m > 0 ? volTot / p.longitud_m : 0;
  const r1 = (v: number) => Math.round(v * 10) / 10;

  return {
    alto_m:            r1(hMax),
    altoMedio_m:       r1(hMedia),
    anchoCorona_m:     corona,
    anchoBase_m:       r1(base(hMax)),
    anchoBaseMedio_m:  r1(base(hMedia)),
    anguloInterno_deg: Math.round(Math.atan2(1, ti) * 180 / Math.PI),
    anguloExterno_deg: Math.round(Math.atan2(1, te) * 180 / Math.PI),
    seccion_m2:        r1(secTot(hMax)),
    seccionMedia_m2:   r1(seccionMedia),
    longitud_m:        Math.round(p.longitud_m),
    volumenTierra_m3:  Math.round(volTot),
    partidas: {
      destape_m3:         Math.round(volDest),
      zanjaExcavacion_m3: Math.round(volZan),
      // La zanja se rellena con el mismo volumen que se abrió, compactado.
      zanjaArcilla_m3:    Math.round(volZan),
      nucleo_m3:          Math.round(volNuc),
      espaldones_m3:      Math.round(volEsp),
      revestimiento_m3:   Math.round(volRev),
    },
    factorContraccion: p.factorContraccion ?? 1.15,
    perfilUsado,
    sinMuro: hMax < 0.15,
  };
}

/**
 * Balance de tierra: de dónde sale el material y qué le pasa al vaso.
 *
 * El cálculo anterior contaba el agua por un lado y el terraplén por el otro,
 * como si la tierra viniera de afuera. En obra no viene de afuera: sale de
 * adentro del vaso, del lado más alto, y se pone del lado más bajo. Y ese
 * movimiento no es sólo costo: al sacar la tierra el vaso se hace más hondo, y
 * cada m³ excavado por debajo del nivel de agua es un m³ más de agua. El mismo
 * viaje de la máquina paga dos veces.
 *
 * Dos correcciones que van juntas:
 *
 *  - Contracción. Un m³ de terraplén compactado no sale de un m³ de banco: hace
 *    falta más material del que ocupa una vez compactado (alrededor de 1,10 en
 *    suelos arenosos y 1,25 en arcillosos), y ese excedente también se excava.
 *  - El revestimiento no se presta. Es el mismo suelo vegetal del destape,
 *    guardado y devuelto sobre el talud externo, así que no entra en el
 *    préstamo ni suma capacidad.
 *
 * La profundización media es el control de realidad: si para juntar el material
 * hay que bajar el fondo más de metro y medio en promedio, el sitio no da y hay
 * que buscar un préstamo afuera o achicar la obra.
 */
export interface BalanceTierra {
  compactado_m3:         number;  // lo que queda compactado en obra (muro + zanja)
  banco_m3:              number;  // volumen total a excavar, medido en sitio
  prestamoInterno_m3:    number;  // parte del banco que sale de adentro del vaso
  capacidadExtra_m3:     number;  // agua que gana el vaso por ese préstamo
  volumenAgua_m3:        number;  // agua total: la del terreno natural más el extra
  profundizacionMedia_m: number;  // cuánto baja el fondo, en promedio
  eficiencia:            number;  // m³ de agua por m³ de tierra movida
  viable:                boolean;
  nota:                  string;
}

export function balanceTierra(muro: ResultadoMuro, embalse: ResultadoEmbalse): BalanceTierra {
  const pt = muro.partidas;
  const fc = muro.factorContraccion;

  // Lo que se presta de adentro del vaso: núcleo, espaldones y el relleno
  // arcilloso de la zanja. El revestimiento sale del destape, no se presta.
  const compactado = pt.nucleo_m3 + pt.espaldones_m3 + pt.zanjaArcilla_m3;
  const prestamo   = compactado * fc;
  const banco      = prestamo + pt.destape_m3 + pt.zanjaExcavacion_m3;

  const area  = embalse.area_inundada_m2;
  const extra = prestamo;
  const prof  = area > 0 ? extra / area : 0;
  const agua  = embalse.volumen_m3 + extra;
  const efic  = banco > 0 ? agua / banco : 0;

  const viable = prof <= 1.5;
  const nota = muro.sinMuro
    ? 'El terreno del eje ya está por encima del nivel de agua: la obra es excavación, no muro. Todo el movimiento de suelo se convierte en capacidad.'
    : viable
      ? 'Sacando el material de adentro del vaso, del lado más alto, el fondo baja ' + (prof * 100).toFixed(0) + ' cm en promedio y el embalse gana ' + Math.round(extra).toLocaleString('es-AR') + ' m³.'
      : 'Para juntar el material habría que bajar el fondo ' + prof.toFixed(1) + ' m en promedio, que es demasiado para un préstamo interno: hay que traer material de un préstamo cercano o achicar el muro.';

  return {
    compactado_m3:         Math.round(compactado),
    banco_m3:              Math.round(banco),
    prestamoInterno_m3:    Math.round(prestamo),
    capacidadExtra_m3:     Math.round(extra),
    volumenAgua_m3:        Math.round(agua),
    profundizacionMedia_m: Math.round(prof * 100) / 100,
    eficiencia:            Math.round(efic * 10) / 10,
    viable,
    nota,
  };
}
