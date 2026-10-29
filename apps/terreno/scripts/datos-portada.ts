/**
 * El dato de la animación de la portada de acequia.app, generado una vez.
 *
 *   pnpm --filter @arteytierra/terreno portada
 *
 * Escribe `packages/placas/generado/<predio>.json` con el relieve, el color por
 * cota, las curvas de nivel y las cadenas de escorrentía de un predio real.
 * La composición de Remotion lo lee y no vuelve a tocar la red.
 *
 * POR QUÉ NO PASA POR `/api/dem`. La ruta es una cáscara: parsea el bbox,
 * aplica `requiereTopoDe()` —que sin sesión devuelve 401 y con plan Semilla
 * corta por superficie—, mira la caché y llama a `obtenerGrillaDEM()`. Esa
 * función lee los COG de Copernicus por *range request* y no toca ni la base ni
 * la sesión, así que llamándola directo sale el mismo dato del mismo código.
 * El candado está para que un usuario Semilla no le pegue al endpoint, no para
 * el que compila el repo.
 *
 * LA REGLA DEL ENCARGO, que es la que justifica todo este archivo: la animación
 * muestra un predio real leído con los datos de la app, o no se publica. Un
 * relieve modelado con ruido Perlin en una página que promete trazabilidad es
 * la única mentira que acá hace daño.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { atribucionDe } from '../lib/elevacion/atribucion';
import { shaderDesdeGrilla, colorElevacion, PALETA_SHADER_POR_DEFECTO } from '../lib/shaders';
import { calcularEscorrentias } from '../lib/escorrentias';
import { calcularCurvas, intervaloAutomatico } from '../lib/curvasNivel';
import { calcularAptitud, agruparAptitud, COLORES_APTITUD } from '../lib/aptitud';
import { calcularSwales, diagnosticarSwales } from '../lib/swales';
import { separacionVerticalZanjas } from '../lib/criterios';
import { analizarKeyline } from '../lib/keyline';
import { buscarSitiosRepresa } from '../lib/cuencaHidro';
import * as turf from '@turf/turf';
// El predio y sus constantes viven en un solo lugar: los comparte con
// `datos-mesa.ts`, el generador del encargo 03.
import {
  INTERVALO_M, LADO, MOJONES, PREDIO, grillaDelPredio, metros, red, rumbo,
} from './predio-portada';


const aqui = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.resolve(aqui, '../../../packages/placas/generado');


async function main() {
  const lado = Number(process.argv[2]) || LADO;
  const { grilla, dem, bbox, anchoM } = await grillaDelPredio(
    SALIDA, lado, process.argv.includes('--refrescar'));
  const cols = dem.cols;

  const ds = shaderDesdeGrilla(grilla, MOJONES);
  if (!ds) throw new Error('shaderDesdeGrilla devolvió null');
  const adentro = ds.celdas.filter(c => c.dentro !== false);

  // El punto más alto y el más bajo DEL PREDIO, que es lo que informa el panel.
  let alto = adentro[0]!, bajo = adentro[0]!;
  for (const c of adentro) {
    if (c.elevation > alto.elevation) alto = c;
    if (c.elevation < bajo.elevation) bajo = c;
  }
  const centro = (c: typeof alto) => ({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 });
  const dist = metros(centro(alto), centro(bajo));
  const pendienteGeneral = ((alto.elevation - bajo.elevation) / dist) * 100;

  console.log('');
  console.log('CONTRA EL PANEL DE LA APP (captura del 23/10/2026)');
  console.log(`  elevación mín.    ${ds.elev_min.toFixed(0)} m        el panel dice 74 m`);
  console.log(`  elevación máx.    ${ds.elev_max.toFixed(0)} m       el panel dice 391 m`);
  console.log(`  desnivel          ${(ds.elev_max - ds.elev_min).toFixed(1)} m     el panel dice 317,1 m`);
  console.log(`  pendiente general ${pendienteGeneral.toFixed(1)} %      el panel dice 20,2 %`);
  console.log(`  escurre hacia     ${rumbo(centro(alto), centro(bajo))}         el panel dice NNE`);
  console.log('');

  const t1 = Date.now();
  const esc = calcularEscorrentias(ds);
  console.log(`agua       ${esc.cadenas.length} cadenas · acumulación máxima ${esc.acum_max} · ${((Date.now() - t1) / 1000).toFixed(1)} s`);

  // Las cadenas se recortan al predio. El D8 corre sobre la grilla entera
  // —necesita ver de dónde baja el agua— pero el halo es andamio: sin recortar,
  // el acto 02 enciende líneas de agua flotando en el negro, afuera del predio,
  // que es justo lo que la app NO dibuja.
  const anillo = MOJONES.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  const poligono = turf.polygon([anillo]);
  const adentroDelPredio = (p: { lat: number; lng: number }) =>
    turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poligono);

  const recortadas: Array<{ acum: number; puntos: Array<{ lat: number; lng: number }> }> = [];
  for (const c of esc.cadenas) {
    let tramo: Array<{ lat: number; lng: number }> = [];
    for (const p of c.puntos) {
      if (adentroDelPredio(p)) tramo.push(p);
      else { if (tramo.length >= 3) recortadas.push({ acum: c.acum_max, puntos: tramo }); tramo = []; }
    }
    if (tramo.length >= 3) recortadas.push({ acum: c.acum_max, puntos: tramo });
  }
  console.log(`           ${recortadas.length} tramos quedan dentro del predio`);

  const intervalo = INTERVALO_M;
  console.log(`           (el automático para este desnivel habría dado ${intervaloAutomatico(ds.elev_max - ds.elev_min, 417.8)} m)`);
  const curvas = calcularCurvas(grilla, intervalo);
  const tramos = curvas.reduce((a, c) => a + c.lineas.length, 0);
  console.log(`curvas     ${curvas.length} cotas cada ${intervalo} m · ${tramos} tramos`);

  // ── Las capas del encargo 02 ───────────────────────────────────────────────
  //
  // Las tres lecturas que la primera animación no tenía. Ninguna la decide este
  // script: cada una sale de una función del repo que ya existía, con el predio
  // y el relieve como única entrada. Donde hubo que elegir un número está
  // dicho, y donde la app necesita algo que el predio no tiene —un programa
  // declarado— no hay capa, que es lo que corresponde.

  // Aptitud de uso. OJO CON EL NOMBRE: la app la calcula de pendiente,
  // orientación, agua acumulada y altura relativa —puro relieve—, no de datos
  // de suelo. Si la página rotula este estado «Suelo», promete un análisis
  // edafológico que la pieza no trae. Son cinco clases, no tres, y son las de
  // la app con sus colores.
  const apt = calcularAptitud({ ...ds, celdas: adentro }, esc);
  const clusters = agruparAptitud(apt, 4);
  const porTipo = Object.entries(apt.resumen)
    .filter(([, v]) => v.celdas > 0)
    .map(([t, v]) => `${t} ${v.pct}%`)
    .join(' · ');
  console.log(`aptitud    ${clusters.length} manchones · ${porTipo}`);

  // Zanjas de infiltración. El intervalo vertical lo recomienda `criterios`
  // desde la pendiente medida, que es el mismo número que la app pone por
  // defecto en el panel.
  //
  // `precipMm` y `coef` hay que pasarlos y NO afectan al dibujo: en
  // `calcularSwales` la lluvia de diseño y el coeficiente sólo entran en
  // `volumen_m3` y en la sección de la zanja. La planta —por dónde pasa cada
  // zanja— sale del relieve y del intervalo vertical. El video muestra la
  // planta y ningún número, así que no hay una tormenta de diseño elegida acá
  // que se pueda leer en pantalla.
  const sep = separacionVerticalZanjas({ pendiente_pct: pendienteGeneral });
  const diag = sep.aplica ? diagnosticarSwales(grilla, sep.valor) : null;
  const swales = sep.aplica && diag?.puede
    ? calcularSwales(grilla, MOJONES, {
        intervaloV: sep.valor,
        precipMm: 50,
        coef: 0.3,
        pendiente_pct: pendienteGeneral,
      })
    : null;
  if (swales) {
    console.log(`zanjas     ${swales.swales.length} zanjas cada ${sep.valor} m de desnivel`);
  } else if (!sep.aplica) {
    console.log(`zanjas     la tabla de separación no cubre ${pendienteGeneral.toFixed(1)} % de pendiente`);
  } else {
    // El tope lo pone la herramienta, no esta animación, y esto es lo que hay
    // que escribir en el documento: no es que las zanjas no se puedan dibujar,
    // es que la app se niega a proponer ciento veintitrés sobre un solo predio.
    console.log(
      `zanjas     LA APP SE NIEGA: ${diag?.motivo} · a ${sep.valor} m de desnivel salen ` +
      `${diag?.niveles} zanjas y el tope de diseño son ${diag?.max_niveles}` +
      (diag?.intervalo_sugerido ? ` (entraría cada ${diag.intervalo_sugerido} m, que ya no es lo que pide la tabla)` : ''),
    );
  }

  // Keyline. Es la capa de diseño que no necesita que nadie declare nada: el
  // keypoint y las guías salen del relieve y de nada más.
  const kl = analizarKeyline(grilla);
  console.log(kl
    ? `keyline    keypoint en ${kl.keypoint.lat.toFixed(5)}, ${kl.keypoint.lng.toFixed(5)} · ${kl.guias.length} guías · ${kl.nota.slice(0, 70)}`
    : 'keyline    el relieve no define un keypoint acá');

  // Retención. `buscarSitiosRepresa` recorre los cauces, prueba muros a varias
  // alturas y rankea por eficiencia agua/muro. El sitio lo elige el terreno; lo
  // único que se le pasa es el recorte al predio.
  const represas = buscarSitiosRepresa(grilla, { clip: MOJONES, max: 3 });
  console.log(represas.length
    ? `retención  ${represas.length} sitios · el mejor: muro de ${represas[0]!.ancho_muro_m.toFixed(0)} m, espejo de ${represas[0]!.area_ha.toFixed(2)} ha`
    : 'retención  el relieve no encuentra un cierre dentro del predio');

  // Los puntos de juntura, leídos de las cadenas que devolvió la app: el primer
  // punto que dos cadenas comparten es donde se juntan. No se vuelve a aplicar
  // ningún umbral —el de cauce ya lo aplicó `calcularEscorrentias`— porque
  // repetir acá una constante privada de la librería es garantizar que un día
  // dejen de coincidir.
  const junturas = (() => {
    const visto = new Map<string, number>();
    const puntos: Array<{ lat: number; lng: number }> = [];
    esc.cadenas.forEach((cadena, i) => {
      for (const p of cadena.puntos) {
        const k = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
        const dueño = visto.get(k);
        if (dueño === undefined) { visto.set(k, i); continue; }
        if (dueño !== i) { if (adentroDelPredio(p)) puntos.push(p); break; }
      }
    });
    return puntos;
  })();
  console.log(`junturas   ${junturas.length} confluencias dentro del predio`);

  // ── El JSON ────────────────────────────────────────────────────────────────
  // Las cotas van redondeadas a 0,1 m: el GLO-30 tiene error de varios metros,
  // así que el decimal que importa es uno y los otros son peso de archivo.
  const paleta = PALETA_SHADER_POR_DEFECTO.elev;
  const datos = {
    predio: PREDIO,
    generado: new Date().toISOString().slice(0, 10),
    fuente: dem.fuente,
    atribucion: atribucionDe(dem.fuente),
    resolucion_m: 30,
    bbox,
    cols: dem.cols,
    rows: dem.rows,
    paso_m: Math.round((anchoM / cols) * 10) / 10,
    elev_min: Math.round(ds.elev_min * 10) / 10,
    elev_max: Math.round(ds.elev_max * 10) / 10,
    pendiente_general_pct: Math.round(pendienteGeneral * 10) / 10,
    escurre_hacia: rumbo(centro(alto), centro(bajo)),
    mojones: MOJONES,
    paleta,
    /**
     * La rampa de color entera, muestreada en 256 pasos entre la cota mínima y
     * la máxima DEL PREDIO. Va acá y no se recalcula en el render por una razón
     * de principio: la paleta es la de la app (`colorElevacion`), y si el video
     * la reimplementara, el día que la app cambie de rampa la portada mostraría
     * una que ya no existe.
     */
    rampa: Array.from({ length: 256 }, (_, i) =>
      colorElevacion(
        ds.elev_min + (i / 255) * (ds.elev_max - ds.elev_min),
        ds.elev_min, ds.elev_max, paleta,
      )),
    /** row-major, fila 0 = sur. `null` = sin dato. */
    elev: Array.from(grilla.elev, v => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null)),
    /** 1 = el nodo cae dentro del polígono del predio. */
    dentro: (() => {
      const m = new Uint8Array(dem.rows * dem.cols);
      for (const c of ds.celdas) if (c.dentro !== false) m[c.row * dem.cols + c.col] = 1;
      return Array.from(m);
    })(),
    intervalo_curvas_m: intervalo,
    // Las curvas tambien se recortan al predio, por la misma razon que el agua
    // y con el mismo metodo: la app las dibuja adentro del perimetro y no sobre
    // el campo del vecino. Ademas es lo que hace reconocible al predio en el
    // ultimo cuadro, que es el que queda fijo.
    curvas: curvas.map(c => ({
      cota: c.cota,
      lineas: c.lineas.flatMap(l => {
        const tramos: Array<Array<[number, number]>> = [];
        let tramo: Array<[number, number]> = [];
        for (const p of l.puntos) {
          if (adentroDelPredio(p)) {
            tramo.push([Math.round(p.lng * 1e6) / 1e6, Math.round(p.lat * 1e6) / 1e6]);
          } else {
            if (tramo.length >= 2) tramos.push(tramo);
            tramo = [];
          }
        }
        if (tramo.length >= 2) tramos.push(tramo);
        return tramos.map(puntos => ({ cerrada: false, puntos }));
      }),
    })).filter(c => c.lineas.length > 0),
    /** Ordenadas de menor a mayor acumulación: el acto 02 las enciende así. */
    cadenas: recortadas
      .slice()
      .sort((a, b) => a.acum - b.acum)
      .map(c => ({
        acum: c.acum,
        puntos: c.puntos.map(p => [
          Math.round(p.lng * 1e6) / 1e6,
          Math.round(p.lat * 1e6) / 1e6,
        ]),
      })),
    acum_max: esc.acum_max,

    /** Las confluencias: donde dos cadenas de la app se juntan. */
    junturas: junturas.map(p => red(p)),

    /**
     * Aptitud de uso, agrupada en manchones contiguos por `agruparAptitud`.
     *
     * Van como polígonos y no como una grilla pintada en un canvas por la
     * restricción que ordenó toda la primera animación: MapLibre dibuja una
     * fuente `canvas` como un cuadrilátero de cuatro vértices y NO la drapea
     * sobre el relieve, así que con la cámara inclinada se corre de su lugar.
     * Las capas vectoriales sí van drapeadas. Ése era el defecto principal de
     * la primera entrega —«dos rectángulos superpuestos con otro ángulo»— y
     * acá no puede volver a pasar porque no hay ráster propio.
     */
    aptitud: {
      colores: COLORES_APTITUD,
      resumen: apt.resumen,
      manchones: clusters.map(c => ({
        tipo: c.tipo,
        celdas: c.celdas,
        anillo: c.anillo.map(p => red(p)),
      })),
    },

    /** Zanjas de infiltración a nivel, con el intervalo que recomienda la app. */
    zanjas: swales
      ? {
          intervalo_vertical_m: sep.valor,
          criterio: sep.criterio,
          fuente: sep.fuente,
          lineas: swales.swales.map(l => ({
            cota: l.cota,
            puntos: l.puntos.map(p => red(p)),
          })),
        }
      : null,

    /** El keypoint y las guías de keyline, derivados del relieve y de nada más. */
    keyline: kl
      ? {
          nota: kl.nota,
          keypoint: red(kl.keypoint),
          valle: kl.valle.map(p => red(p)),
          // Las guías se recortan al predio, por la misma razón que el agua y
          // las curvas: `analizarKeyline` corre sobre la grilla entera —el
          // halo del 8 % es andamio que el relieve necesita para calcular— y
          // sin recortar, la guía sigue de largo sobre el campo del vecino.
          guias: kl.guias.flatMap(g => {
            const tramos: Array<[number, number][]> = [];
            let tramo: [number, number][] = [];
            for (const p of g.puntos) {
              if (adentroDelPredio(p)) tramo.push(red(p));
              else { if (tramo.length >= 2) tramos.push(tramo); tramo = []; }
            }
            if (tramo.length >= 2) tramos.push(tramo);
            return tramos.map(puntos => ({ principal: g.principal, puntos }));
          }),
        }
      : null,

    /** Los cierres que encuentra el terreno, con el espejo de agua de cada uno. */
    represas: represas.map(r => ({
      lat: r.lat, lng: r.lng,
      altura_m: Math.round(r.altura_m * 10) / 10,
      ancho_muro_m: Math.round(r.ancho_muro_m),
      area_ha: Math.round(r.area_ha * 100) / 100,
      espejo: r.espejo.map(p => red(p)),
    })),
  };

  mkdirSync(SALIDA, { recursive: true });
  const destino = path.join(SALIDA, `${PREDIO}.json`);
  writeFileSync(destino, JSON.stringify(datos));
  const kb = (Buffer.byteLength(JSON.stringify(datos)) / 1024).toFixed(0);
  console.log('');
  console.log(`escrito    ${destino}  (${kb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
