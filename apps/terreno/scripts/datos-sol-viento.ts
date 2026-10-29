/**
 * El dato del ENCARGO 04, pieza A — «Lo que no se ve»: el sol y el viento.
 *
 *   pnpm --filter @arteytierra/terreno datos-sol-viento
 *
 * Escribe `packages/placas/generado/cuetiepa-sol-viento.json`.
 *
 * Mismo predio, mismo margen y mismo relieve en caché que los encargos 02 y 03
 * —todo eso vive en `predio-portada.ts`—, así que las capas nuevas caen
 * exactamente sobre las viejas y las dos secciones de la página miran el mismo
 * paisaje.
 *
 * Tres motores, tres actos:
 *
 *   01  LOS ARCOS   `calcularArcoSolar` — las tres trayectorias del sol en
 *                   proyección azimutal equidistante (centro = cénit, borde =
 *                   horizonte). Puro cálculo, sin red.
 *   02  LAS HORAS   `calcularInsolacion` — horas de sol acumuladas, los dos
 *                   solsticios sobre el mismo terreno, con el relieve haciendo
 *                   su propia sombra.
 *   03  EL VIENTO   `obtenerClima` — los doce meses de WD10M, y
 *                   `construirCortina` para la banda con su zona protegida.
 *
 * ── Las tres cosas que esta pieza no puede equivocar ───────────────────────
 *
 * 1. **El hemisferio lo decide la latitud.** Las CLAVES de `fechasMeta` dicen
 *    `solsticio_verano` para el 21 de diciembre y `solsticio_invierno` para el
 *    21 de junio: nombran el día del año, que no se mueve. Lo que se mueve es
 *    qué estación es cada uno, y eso lo resuelve `nombreDelSolsticio` en el
 *    `label`. A 17,33° N el alto del año es JUNIO, así que el JSON guarda el
 *    label y la composición rotula por label: rotular por clave pondría
 *    «Invierno» encima del arco más alto del año, que es justo el defecto que
 *    `estaciones.ts` existe para no repetir.
 *    Y el hecho geométrico se guarda aparte, calculado por la app:
 *    `azimutsSolsticio().porElNorte` es `declinación > latitud`, verdadero en
 *    junio acá. Que el mediodía de junio caiga al NORTE del centro del círculo
 *    es la prueba de que se leyó el lugar, y se comprueba abajo sobre el dato.
 *
 * 2. **El viento va mes a mes.** `viento_dir_ppal` de la app es
 *    `gradosADireccion(WD10M['ANN'])`, o sea el promedio anual de una
 *    dirección: exactamente lo que el encargo prohíbe mostrar como flecha. Acá
 *    se guardan los doce `viento_dir_deg`, y el promedio anual se guarda al
 *    lado SÓLO para poder decir si coincide o no con lo que miden los meses.
 *
 * 3. **El mapa de insolación no lleva número.** El JSON guarda el mínimo, el
 *    máximo y el promedio porque sin ellos no se puede normalizar el color ni
 *    verificar nada, pero la composición NO los dibuja: `insolacion.ts` avisa
 *    en su cabecera que es sin nubes, sin refracción y sobre un modelo de
 *    ~30 m.
 *
 * ── Por qué la insolación corre en una grilla más gruesa que todo lo demás ──
 *
 * Porque ésa es la resolución del dato. `calcularInsolacion` recorre, por cada
 * paso de tiempo y cada celda, un rayo sobre el DEM hasta el borde de la
 * grilla: en la grilla de los encargos 02 y 03 —300 × 277 = 83.100 celdas— eso
 * son unos 1.200 millones de iteraciones por día y no termina nunca. Bajar el
 * paso a ~30 m deja 123 × 114 y entra en menos de un minuto, y no es un atajo:
 * 30 m es el paso nativo del GLO-30, así que un mapa de sombras más fino que su
 * fuente sería resolución inventada. El relieve de los otros actos sigue siendo
 * el de 11 m, que es el que ya está aprobado.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calcularArcoSolar, calcularRadioArco } from '../lib/arco_solar';
import { calcularInsolacion, colorInsolacion } from '../lib/insolacion';
import { azimutsSolsticio, cuña, doyDelSolsticio, rumboDeAzimut } from '../lib/sectores';
import { azimutVientoFrio, construirCortina } from '../lib/cortinas';
import { shaderDesdeGrilla } from '../lib/shaders';
import { atribucionDe } from '../lib/elevacion/atribucion';
import { obtenerClima } from '../lib/clima';
import { BITACORA, instalarApisDeNode } from './apis-node';
import { MOJONES, PREDIO, grillaDelPredio, red } from './predio-portada';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const GENERADO = path.resolve(aqui, '../../../packages/placas/generado');

type Par = [number, number];
type Punto = { lat: number; lng: number };

/**
 * El lado de la grilla de insolación. 123 columnas sobre los ~3.686 m del bbox
 * dan ~30 m por celda, que es el paso del GLO-30. Ver la cabecera.
 */
const LADO_INSOLACION = 123;

/**
 * El paso de tiempo del mapa de sombras, en minutos: el de la app por defecto.
 * El error máximo es medio paso (±10 min) por celda.
 */
const PASO_MIN = 20;

/** Las clases de color del mapa de horas. Ver `claseDeHoras`. */
const CLASES_HORAS = 24;

/**
 * Ancho y alto de diseño de la cortina: los que la app trae por defecto
 * (`cortinaParamsRef` en `MapaTerrenoApp`). 10 m × 15 = 150 m de resguardo.
 */
const CORTINA = { ancho_m: 8, alto_m: 10 };

const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;
const r1e6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Un punto `{lat,lng}` a par GeoJSON redondeado. */
const par = (p: Punto): Par => red(p);

async function main() {
  // ── El relieve, dos veces: el fino aprobado y el de la insolación ────────
  //
  // El fino no dibuja nada nuevo —esta pieza no trae curvas ni shader de cota—
  // pero sí informa el bbox y el centro EXACTOS que usan las piezas ya
  // aprobadas. Si la pieza A encuadrara otro rectángulo, la página mostraría
  // dos predios distintos.
  const fino = await grillaDelPredio(GENERADO);
  const [w, s, e, n] = fino.bbox;
  const centro: Punto = { lat: (s + n) / 2, lng: (w + e) / 2 };

  console.log('');
  console.log(`centro     ${centro.lat.toFixed(5)}, ${centro.lng.toFixed(5)}`);

  const grueso = await grillaDelPredio(GENERADO, LADO_INSOLACION);
  const pasoM = grueso.anchoM / grueso.cols;
  console.log(`insolación grilla ${grueso.cols}×${grueso.rows} · paso ${pasoM.toFixed(1)} m ` +
    `· fuente ${grueso.paso_fuente_m} m`);

  // ── 01 · LOS ARCOS ───────────────────────────────────────────────────────
  const radio_m = calcularRadioArco(MOJONES, centro.lat);
  const arco = calcularArcoSolar(centro.lat, centro.lng, radio_m);
  console.log(`arcos      radio ${radio_m} m`);

  const arcos = arco.arcos.map(a => {
    // `porElNorte` es `declinación > latitud`: NO es el hemisferio. Es el dato
    // que hace que este predio no se parezca a una plantilla.
    const g = azimutsSolsticio(centro.lat, a.doy);
    return {
      // La clave se guarda sólo para trazar de dónde salió. Lo que se rotula es
      // el label, que es el que resuelve la latitud.
      clave: a.fecha,
      label: a.label,
      corto: a.labelCorto,
      color: a.color,
      doy: a.doy,
      horas_luz: r2(a.horas_luz),
      por_el_norte: g.porElNorte,
      // El arco, muestreado cada 10 minutos por la app. El cuarto número es el
      // avance de 0 a 1 a lo largo del día, que es lo que permite DIBUJARLO en
      // vez de encenderlo entero.
      puntos: a.puntos.map((p, i) => ([
        ...red(p),
        r1(p.elevacion),
        Math.round((i / Math.max(1, a.puntos.length - 1)) * 1000) / 1000,
      ] as [number, number, number, number])),
      amanecer: { p: par(a.amanecer), az: r1(a.amanecer.azimut), hora: r2(a.amanecer.hora) },
      atardecer: { p: par(a.atardecer), az: r1(a.atardecer.azimut), hora: r2(a.atardecer.hora) },
      mediodia: {
        p: par(a.mediodia), az: r1(a.mediodia.azimut), elev: r1(a.mediodia.elevacion),
        // Positivo = el mediodía cae al NORTE del centro del círculo.
        norte_m: Math.round((a.mediodia.lat - centro.lat) * 111_320),
      },
    };
  });

  for (const a of arcos) {
    console.log(`           ${a.corto.padEnd(10)} doy ${String(a.doy).padStart(3)} · ` +
      `mediodía ${String(a.mediodia.elev).padStart(5)}° az ${String(a.mediodia.az).padStart(5)}° · ` +
      `${a.mediodia.norte_m >= 0 ? 'al NORTE' : 'al sur  '} ${String(Math.abs(a.mediodia.norte_m)).padStart(4)} m · ` +
      `porElNorte=${String(a.por_el_norte).padEnd(5)} · luz ${a.horas_luz} h`);
  }
  if (!arcos.some(a => a.por_el_norte)) {
    throw new Error(
      'Ningún arco pasa por el norte y el encargo pide justamente que eso se vea. ' +
      'A 17,33° N la declinación de junio (23,45°) supera la latitud, así que tiene que ' +
      'dar verdadero: si no da, cambió la efemérides o cambió el predio.',
    );
  }

  // ── 02 · LAS HORAS ───────────────────────────────────────────────────────
  //
  // El shader se arma con la grilla ENTERA, halo incluido, y se recorta recién
  // al dibujar. No es un detalle: la sombra que recibe una celda del borde la
  // tira el cerro del vecino, y si ese cerro no está en la grilla la celda sale
  // iluminada todo el día. Es el mismo error que el halo de las hectáreas.
  const ds = shaderDesdeGrilla(grueso.grilla, MOJONES);
  if (!ds) throw new Error('shaderDesdeGrilla devolvió null sobre la grilla gruesa');

  const dias = (['verano', 'invierno'] as const).map(cual => {
    const doy = doyDelSolsticio(cual, centro.lat);
    const t0 = Date.now();
    const r = calcularInsolacion(ds, centro.lat, doy, [], PASO_MIN);
    if (!r) throw new Error(`calcularInsolacion devolvió null para doy ${doy}`);
    // El rótulo sale del arco que comparte el día del año, o sea de
    // `nombreDelSolsticio`: la estación ya viene resuelta por latitud dentro de
    // `doyDelSolsticio`, así que acá no se decide nada, se lee.
    const delArco = arcos.find(a => a.doy === doy);
    console.log(`horas      ${cual.padEnd(9)} doy ${String(doy).padStart(3)} · ` +
      `luz ${r.horas_luz.toFixed(2)} h · terreno ${r.min.toFixed(2)}–${r.max.toFixed(2)} h ` +
      `(media ${r.promedio.toFixed(2)}) · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return { cual, doy, label: delArco?.label ?? cual, corto: delArco?.corto ?? cual, r };
  });

  // ── El máximo COMÚN, que es lo que hace que la comparación exista ────────
  //
  // `colorInsolacion(horas, max)` normaliza contra el máximo que se le pasa, y
  // por eso lo pide: si cada día se normalizara contra el suyo, los dos mapas
  // saldrían con el mismo recorrido de color y el invierno se vería igual de
  // soleado que el verano. El encargo pide «invierno contra verano sobre el
  // mismo terreno», así que los dos se miden contra el mismo techo —el del día
  // largo— y entonces el invierno SE VE más oscuro, que es el dato.
  const maxComun = Math.max(...dias.map(d => d.r.max));
  console.log(`           techo común de color: ${maxComun.toFixed(2)} h (el del día largo)`);

  /** La clase de color de una celda, de 0 a CLASES_HORAS−1, contra el techo común. */
  const claseDeHoras = (horas: number) =>
    Math.min(CLASES_HORAS - 1, Math.max(0, Math.floor((horas / maxComun) * CLASES_HORAS)));

  const { cols, rows } = grueso.grilla;
  const dentro = new Uint8Array(cols * rows);
  for (const c of ds.celdas) if (c.dentro) dentro[c.row * cols + c.col] = 1;
  const celdasDentro = dentro.reduce((a: number, b) => a + b, 0);
  console.log(`           celdas dentro del predio: ${celdasDentro} de ${cols * rows}`);

  const mapas = dias.map(d => {
    const horas = new Float64Array(cols * rows).fill(NaN);
    for (const c of d.r.celdas) horas[c.row * cols + c.col] = c.horas;
    // Las celdas contiguas de la misma clase se juntan en un rectángulo por
    // fila, igual que el shader de cota del encargo 02: sin eso son 14.000
    // polígonos y cada borde interno es una costura que el antialias dibuja.
    const fc = porFilas(grueso.grilla, i => {
      if (!dentro[i]) return null;
      const h = horas[i]!;
      return Number.isFinite(h) ? claseDeHoras(h) : null;
    }, k => {
      const [R, G, B] = colorInsolacion(((k + 0.5) / CLASES_HORAS) * maxComun, maxComun);
      return {
        c: `rgb(${R},${G},${B})`,
        // La clase normalizada: con ella el mapa se puede encender de las
        // celdas de sombra a las de sol, que es el orden en que se lee.
        n: Math.round((k / (CLASES_HORAS - 1)) * 1000) / 1000,
      };
    });
    return {
      cual: d.cual, doy: d.doy, label: d.label, corto: d.corto,
      horas_luz: r2(d.r.horas_luz),
      salida: r2(d.r.salida), puesta: r2(d.r.puesta),
      min: r2(d.r.min), max: r2(d.r.max), promedio: r2(d.r.promedio),
      rectangulos: fc.features.length,
      rects: fc,
    };
  });
  for (const m of mapas) console.log(`           ${m.corto.padEnd(10)} ${m.rectangulos} rectángulos`);

  // ── 03 · EL VIENTO ───────────────────────────────────────────────────────
  instalarApisDeNode();
  const clima = await obtenerClima(centro.lat, centro.lng);
  console.log(`viento     ${clima.fuente}`);

  // El radio del sector es el mismo que el del arco del sol, para que los tres
  // actos ocupen el mismo círculo: así el tercero se lee como otra vuelta al
  // mismo cielo y no como otra escala.
  const meses = clima.meses.map((m, i) => {
    const az = m.viento_dir_deg ?? 0;
    return {
      i,
      nombre: m.mes,
      dir: m.viento_dir ?? rumboDeAzimut(az),
      dir_deg: r1(az),
      vel_ms: m.viento_ms,
      vel_max_ms: m.viento_max_ms ?? null,
      // La MISMA cuña que dibuja el panel de sectores de la app, con la misma
      // amplitud de 70°: ver `generarVerticesSector`, caso `viento_ppal`.
      sector: cuña(centro, az, 70, radio_m).map(par),
    };
  });
  for (const m of meses) {
    console.log(`           ${m.nombre.padEnd(4)} ${String(m.dir).padEnd(4)} ${String(m.dir_deg).padStart(5)}° ` +
      `· ${m.vel_ms} m/s (máx ${m.vel_max_ms})`);
  }

  // ── Contra qué viento se pone la cortina, y por qué contra ése ───────────
  //
  // NO es `viento_dir_ppal` —el promedio anual de una dirección, que es lo que
  // el encargo prohíbe— ni el default de `azimutVientoFrio`, que en el
  // hemisferio norte devuelve N (0°) porque el aire frío viene del polo. Acá
  // POWER mide el viento entrando por el cuadrante NE–E los doce meses: del
  // norte no sopla nunca, así que una cortina al norte protegería de un viento
  // que no existe. Se usa el rumbo MODAL de los doce meses, que es la respuesta
  // que el dato sostiene.
  const cuenta = new Map<string, number>();
  for (const m of meses) {
    const r = rumboDeAzimut(m.dir_deg);
    cuenta.set(r, (cuenta.get(r) ?? 0) + 1);
  }
  const [rumboModal, vecesModal] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]!;
  const azModal = r1(meses
    .filter(m => rumboDeAzimut(m.dir_deg) === rumboModal)
    .reduce((a, m) => a + m.dir_deg, 0) / vecesModal);
  const masFuerte = meses.reduce((a, m) => (m.vel_ms > a.vel_ms ? m : a), meses[0]!);
  const azDefault = azimutVientoFrio(centro.lat);
  const rango = {
    min: Math.min(...meses.map(m => m.dir_deg)),
    max: Math.max(...meses.map(m => m.dir_deg)),
  };
  const anualDentro = meses.some(m => rumboDeAzimut(m.dir_deg) === clima.viento_dir_ppal);

  console.log(`           modal ${rumboModal} (${vecesModal}/12, ${azModal}°) · ` +
    `más fuerte ${masFuerte.nombre} ${masFuerte.vel_ms} m/s desde ${masFuerte.dir_deg}°`);
  console.log(`           rango ${rango.min}–${rango.max}° · default de la app ${azDefault}° · ` +
    `anual «${clima.viento_dir_ppal}» ${anualDentro ? 'coincide con algún mes' : 'NO coincide con ningún mes'}`);

  const cortina = construirCortina(
    ejePerpendicular(centro, azModal, MOJONES),
    { ...CORTINA, vientoFrioAz: azModal },
    MOJONES,
    'sugerida',
  );
  if (!cortina) throw new Error('construirCortina devolvió null');
  console.log(`cortina    eje ${cortina.longitud_m} m · banda ${cortina.ancho_m} m ` +
    `(${cortina.area_banda_ha} ha) · alto ${cortina.alto_m} m → resguardo ` +
    `${cortina.proteccion_m} m (${cortina.area_protegida_ha} ha) · ` +
    `${cortina.estratos.length} estratos · viento de ${cortina.dir_viento_frio}`);

  // ── El archivo ───────────────────────────────────────────────────────────
  const datos = {
    predio: PREDIO,
    lat: r1e6(centro.lat), lng: r1e6(centro.lng),
    bbox: fino.bbox.map(r1e6) as [number, number, number, number],
    mojones: MOJONES.map(m => red(m)),
    relieve: {
      fuente: fino.fuente,
      resolucion_m: fino.paso_fuente_m,
      // La atribución la indexa `FuenteDEM`, que es el tipo del lector de
      // elevación; `FuenteRelieve` agrega «terrarium», que ese lector no
      // devuelve nunca. Se le pasa la fuente tal como vino del DEM.
      atribucion: atribucionDe(fino.dem.fuente),
    },
    sol: {
      radio_m,
      brujula: {
        N: par(arco.brujula.N), S: par(arco.brujula.S),
        E: par(arco.brujula.E), O: par(arco.brujula.O),
      },
      arcos,
      proyeccion:
        'Azimutal equidistante: el centro del círculo es el cénit y el borde es el horizonte, ' +
        'así que el radio vale (1 − elevación/90) y el ángulo es el azimut desde el norte. ' +
        'Declinación por Cooper (1969), error < 0,5°. Hora solar verdadera, sin refracción.',
      nota_hemisferio:
        `A ${r2(centro.lat)}° de latitud norte la declinación de junio (23,45°) supera a la ` +
        'latitud, así que el sol del mediodía pasa por el NORTE parte del año. Lo decide ' +
        'azimutsSolsticio().porElNorte, que es declinación > latitud y no el hemisferio.',
    },
    insolacion: {
      paso_min: PASO_MIN,
      clases: CLASES_HORAS,
      grilla: { cols, rows, paso_m: r1(pasoM) },
      resolucion_fuente_m: grueso.paso_fuente_m,
      celdas_dentro: celdasDentro,
      max_comun_h: r2(maxComun),
      dias: mapas,
      // Va al JSON para poder verificar y para el documento. NO se dibuja.
      limites:
        'Orientativo. Sin nubes y sin refracción atmosférica, sobre un modelo de elevación de ' +
        `${grueso.paso_fuente_m} m remuestreado a ${r1(pasoM)} m. Se muestra dónde hay más sol y ` +
        'dónde menos; las horas NO se publican como número.',
    },
    viento: {
      fuente: clima.fuente,
      meses,
      rango_deg: rango,
      modal: { rumbo: rumboModal, veces: vecesModal, az: azModal },
      mes_mas_fuerte: { nombre: masFuerte.nombre, vel_ms: masFuerte.vel_ms, az: masFuerte.dir_deg },
      anual_de_la_app: clima.viento_dir_ppal,
      anual_coincide_con_algun_mes: anualDentro,
      default_de_la_app_deg: azDefault,
      por_que_modal:
        'La cortina se orienta contra el rumbo MODAL de los doce meses, y no contra el promedio ' +
        'anual de dirección (que es lo que el encargo prohíbe mostrar) ni contra el default de ' +
        `azimutVientoFrio, que en el hemisferio norte devuelve ${azDefault}° porque el aire frío ` +
        `viene del polo: acá POWER mide el viento entrando entre ${rango.min}° y ${rango.max}° los ` +
        'doce meses, así que del norte no sopla nunca y una cortina al norte protegería de un ' +
        'viento que no existe.',
      cortina: {
        eje: cortina.eje.map(par),
        banda: cortina.banda.map(par),
        zona: cortina.zonaProtegida.map(par),
        ancho_m: cortina.ancho_m,
        alto_m: cortina.alto_m,
        longitud_m: cortina.longitud_m,
        proteccion_m: cortina.proteccion_m,
        factor: r1(cortina.proteccion_m / cortina.alto_m),
        area_banda_ha: cortina.area_banda_ha,
        area_protegida_ha: cortina.area_protegida_ha,
        dir_viento: cortina.dir_viento_frio,
        // Cuántos estratos tiene la cortina, NO cuáles. `ESTRATOS_CORTINA`
        // nombra especies del espinal argentino —algarrobo, quebracho blanco,
        // jarilla— y este predio está en Chiapas: publicar esa lista sobre una
        // selva de montaña mexicana sería exactamente la plantilla que la
        // pieza A existe para desmentir. Lo que la pieza muestra es la
        // estructura: una banda de tres alturas, no una línea.
        estratos: cortina.estratos.length,
        aviso_estratos:
          'ESTRATOS_CORTINA lista especies del espinal argentino y este predio está en Chiapas: ' +
          'la pieza dibuja la estructura de tres estratos y NO nombra especies.',
      },
    },
    bitacora_red: BITACORA,
  };

  mkdirSync(GENERADO, { recursive: true });
  const destino = path.join(GENERADO, `${PREDIO}-sol-viento.json`);
  const texto = JSON.stringify(datos);
  writeFileSync(destino, texto);
  console.log('');
  console.log(`escrito    ${destino}  (${(Buffer.byteLength(texto) / 1024).toFixed(0)} KB)`);
}

/**
 * El eje de la cortina: perpendicular al viento, por el centro del predio y
 * largo como su diagonal.
 *
 * `sugerirCortina` haría esto mismo, pero ubica el eje a barlovento de la CASA
 * —un offset de 12 a 45 m del centro— y este predio no tiene casa declarada,
 * así que la sugerencia caería a 30 m del centroide y el resguardo de 150 m
 * taparía una porción minúscula de 428 ha. Lo que se dibuja acá es la geometría
 * de `construirCortina`, que es la que el encargo pide —banda + zona
 * protegida—, sobre un eje que cruza el predio: la cortina como obra posible y
 * no como recomendación para una casa que nadie declaró. `recortarEje` la corta
 * al polígono.
 */
function ejePerpendicular(centro: Punto, azViento: number, mojones: Punto[]): Punto[] {
  const kx = 111_320 * Math.cos(centro.lat * Math.PI / 180);
  const ky = 111_320;
  const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
  const largo = Math.hypot(
    (Math.max(...lngs) - Math.min(...lngs)) * kx,
    (Math.max(...lats) - Math.min(...lats)) * ky,
  );
  const azPerp = (azViento + 90) * Math.PI / 180;
  const px = Math.sin(azPerp), py = Math.cos(azPerp);
  return [
    { lat: centro.lat - (py * largo / 2) / ky, lng: centro.lng - (px * largo / 2) / kx },
    { lat: centro.lat + (py * largo / 2) / ky, lng: centro.lng + (px * largo / 2) / kx },
  ];
}

/**
 * Celdas contiguas de la misma clase, juntadas en un rectángulo por fila.
 *
 * Es la misma técnica que el shader de cota del encargo 02 y las bandas de
 * caminata del 03, y por la misma razón: un polígono por celda convierte cada
 * borde interno en una costura que el antialias dibuja, y son miles.
 */
function porFilas<T extends string | number>(
  g: { rows: number; cols: number; latMin: number; latMax: number; lngMin: number; lngMax: number },
  valor: (i: number) => T | null,
  props: (v: T) => Record<string, unknown>,
) {
  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLng = (g.lngMax - g.lngMin) / (g.cols - 1);
  const features: Array<{
    type: 'Feature'; properties: Record<string, unknown>;
    geometry: { type: 'Polygon'; coordinates: Par[][] };
  }> = [];
  for (let r = 0; r < g.rows; r++) {
    const lat = g.latMin + r * dLat;
    const y0 = r1e6(lat - dLat / 2), y1 = r1e6(lat + dLat / 2);
    let actual: T | null = null, desde = 0;
    // Una columna de más, siempre vacía, para cerrar el último tramo de la fila.
    for (let c = 0; c <= g.cols; c++) {
      const v = c < g.cols ? valor(r * g.cols + c) : null;
      if (v === actual) continue;
      if (actual !== null) {
        const x0 = r1e6(g.lngMin + (desde - 0.5) * dLng);
        const x1 = r1e6(g.lngMin + (c - 0.5) * dLng);
        features.push({
          type: 'Feature',
          properties: props(actual),
          geometry: {
            type: 'Polygon',
            coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]],
          },
        });
      }
      actual = v; desde = c;
    }
  }
  return { type: 'FeatureCollection' as const, features };
}

main().catch(e => { console.error(e); process.exit(1); });
