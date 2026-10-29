/**
 * El dato del ENCARGO 04, pieza C — «Lo que te llevás»: el informe.
 *
 *   pnpm --filter @arteytierra/terreno datos-informe
 *
 * Escribe `packages/placas/generado/cuetiepa-informe.json`.
 *
 * ── Por qué esta pieza no puede ser el informe de verdad ──────────────────
 *
 * Porque el informe no es un dato, es una vista: `informe.ts` son sólo tipos y
 * dos helpers de localStorage, y lo que arma las páginas es `InformeView.tsx`
 * —2.049 líneas de React de cliente, con alias `@/`, íconos y hooks que salen a
 * la red—. Montar eso adentro de Remotion arrastraría medio Next. Y capturarlo
 * de pantalla está prohibido dos veces: `/informe/*` vive detrás del login, y
 * el contrato dice que no se graban pantallas porque se traban y pixelan.
 *
 * Así que la pieza es una **recomposición** del informe, y lo que hace este
 * generador es lo único que importa para que sea fiel: traer los NÚMEROS de los
 * mismos motores —`calcularMetricas`, `obtenerClima`, `obtenerSuelo`— sobre el
 * mismo predio, y armar la tabla de procedencias con la forma que usa la
 * página.
 *
 * ── La restricción de esta pieza, y sólo de ésta ──────────────────────────
 *
 * La landing NO nombra proveedores de datos. En el informe de verdad están con
 * nombre completo —ahí corresponde: quien paga tiene que saber de dónde salió
 * cada número—. Acá cada fila conserva su procedencia, su fecha y su
 * resolución, pero el proveedor se reemplaza por la forma genérica que ya usa
 * la página: «modelo de elevación global · 30 m». La columna NO se borra: que
 * haya una procedencia en cada fila es exactamente lo que la pieza tiene que
 * mostrar.
 *
 * Por eso cada fila de abajo lleva dos campos de origen: `fuente_real`, que es
 * lo que diría el informe, y `fuente`, que es lo que se dibuja. El primero
 * queda en el JSON para poder comprobar que el segundo no inventó nada.
 *
 * ── La topografía sale de la grilla densa y no del panel ──────────────────
 *
 * `obtenerTopografia` muestrea unos veinte puntos: es lo que el panel necesita
 * para contestar rápido mientras el usuario dibuja. Sobre este predio esa
 * muestra da 391 m de desnivel donde el relieve denso da 442, y 20,2 % de
 * pendiente general contra 30,4 %. La pieza muestra el número del relieve
 * denso, que es el mismo que ya usan las piezas aprobadas, con la fórmula de la
 * app: desnivel entre el punto más alto y el más bajo sobre la distancia entre
 * esos dos puntos.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calcularMetricas } from '../lib/geometria';
import { obtenerClima } from '../lib/clima';
import { obtenerSuelo } from '../lib/suelos';
import { PERIODOS } from '../lib/koppenBeck';
import { BITACORA, instalarApisDeNode } from './apis-node';
import { MOJONES, PREDIO, RUMBOS, grillaDelPredio, metros } from './predio-portada';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const GENERADO = path.resolve(aqui, '../../../packages/placas/generado');

const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;
const mil = (x: number) => Math.round(x).toLocaleString('es-AR');

/**
 * Un número para MOSTRAR, en castellano: punto de miles y coma decimal.
 *
 * No es un detalle de estilo. El informe de la app imprime las hectáreas con
 * `toFixed(2)`, que devuelve «427.67», y los miles con `toLocaleString('es-AR')`,
 * que devuelve «8.876». Las dos convenciones en la misma tabla hacen que
 * «8.876 m» se pueda leer como ocho metros con ochocientos setenta y seis, que
 * es un orden de magnitud de diferencia en una pieza cuyo tema es que los
 * números se puedan creer. Acá mandan las dos reglas del castellano juntas.
 */
const num = (x: number, dec = 0) =>
  x.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** Una fila de la página de números. */
interface Fila {
  dato: string;
  valor: string;
  /** Lo que se DIBUJA: la forma genérica que usa la landing. */
  fuente: string;
  /** Lo que diría el informe de verdad. Queda para poder comprobar. */
  fuente_real: string;
  fecha: string;
  resolucion: string;
}

async function main() {
  instalarApisDeNode();

  //  pide mojones NUMERADOS: el número es el que rotula
  // cada vértice en la planilla de replanteo del informe, y acá el orden de la
  // lista es el del polígono.
  const metricas = calcularMetricas(MOJONES.map((m, i) => ({ ...m, id: 'M' + (i + 1), numero: i + 1 })));
  if (!metricas) throw new Error('calcularMetricas devolvió null');
  const { grilla, fuente, paso_fuente_m, anchoM, cols } = await grillaDelPredio(GENERADO);
  const centro = {
    lat: (grilla.latMin + grilla.latMax) / 2,
    lng: (grilla.lngMin + grilla.lngMax) / 2,
  };

  // ── La topografía, sobre el relieve denso y recortada al predio ──────────
  //
  // `dentro` no viene en la grilla cruda, así que se recorta con el mismo
  // polígono: informar la cota más alta del HALO sería informar el cerro del
  // vecino, que es el error de las hectáreas del halo con otra cara.
  const dLat = (grilla.latMax - grilla.latMin) / (grilla.rows - 1);
  const dLng = (grilla.lngMax - grilla.lngMin) / (grilla.cols - 1);
  const anillo = MOJONES.map(m => [m.lng, m.lat] as [number, number]);
  const dentroDe = (lng: number, lat: number) => {
    let dentro = false;
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const [xi, yi] = anillo[i]!, [xj, yj] = anillo[j]!;
      if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
  };

  let alto = { lat: 0, lng: 0, z: -Infinity };
  let bajo = { lat: 0, lng: 0, z: Infinity };
  let suma = 0, n = 0;
  for (let r = 0; r < grilla.rows; r++) {
    const lat = grilla.latMin + r * dLat;
    for (let c = 0; c < grilla.cols; c++) {
      const z = grilla.elev[r * grilla.cols + c]!;
      if (!Number.isFinite(z)) continue;
      const lng = grilla.lngMin + c * dLng;
      if (!dentroDe(lng, lat)) continue;
      suma += z; n++;
      if (z > alto.z) alto = { lat, lng, z };
      if (z < bajo.z) bajo = { lat, lng, z };
    }
  }
  const distancia = metros(alto, bajo);
  const desnivel = alto.z - bajo.z;
  // La fórmula de la app: el desnivel entre las dos puntas sobre la distancia
  // ENTRE ESAS DOS PUNTAS, no la media de las pendientes celda a celda.
  const pendiente_pct = (desnivel / distancia) * 100;
  const dy = bajo.lat - alto.lat;
  const dx = (bajo.lng - alto.lng) * Math.cos(((alto.lat + bajo.lat) / 2) * Math.PI / 180);
  const orientacion = RUMBOS[Math.round((((Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360) / 22.5) % 16]!;

  console.log(`predio     ${mil(metricas.area_m2)} m² · ${r2(metricas.area_ha)} ha · ` +
    `perímetro ${mil(metricas.perimetro_m)} m · ${MOJONES.length} mojones`);
  console.log(`relieve    ${n} celdas dentro · cota ${r1(bajo.z)}–${r1(alto.z)} m · ` +
    `desnivel ${r1(desnivel)} m en ${mil(distancia)} m → ${r1(pendiente_pct)} % hacia el ${orientacion}`);
  console.log(`           grilla ${grilla.cols}×${grilla.rows} · paso ${r1(anchoM / cols)} m · ` +
    `fuente ${grilla.fuente} de ${paso_fuente_m} m`);

  // ── Clima y suelo, por los mismos motores que la app ─────────────────────
  const clima = await obtenerClima(centro.lat, centro.lng);
  console.log(`clima      ${clima.fuente} · ${mil(clima.precip_anual_mm)} mm · ` +
    `${r1(clima.tmean_anual_c)} °C · Köppen ${clima.koppen?.codigo ?? '—'}`);

  let suelo: Awaited<ReturnType<typeof obtenerSuelo>> | null = null;
  try {
    suelo = await obtenerSuelo(centro.lat, centro.lng);
    console.log(`suelo      ${suelo.clase_textura} · pH ${r1(suelo.ph)} · ` +
      `arcilla ${r1(suelo.arcilla)} % · grupo ${suelo.grupo_hidro.grupo} · ${suelo.fuente}`);
  } catch (e) {
    // La regla del silencio: si el dato no vino, la sección no aparece. No se
    // inventa un suelo para llenar el índice.
    console.log(`suelo      sin dato (${(e as Error).message}) — la sección no entra`);
  }

  // ── La página de números ─────────────────────────────────────────────────
  const CLIMA_GEN = 'climatología global';
  const CLIMA_FECHA = '1981–2023';
  const CLIMA_RES = 'celda de ~50 km';
  const DEM_GEN = 'modelo de elevación global';
  const DEM_RES = `${paso_fuente_m} m`;
  const SUELO_GEN = 'mapa global de suelos';
  // La resolución NO se escribe a mano: se lee de lo que la app declara en su
  // propia cadena de fuente. El primer borrador de este archivo decía «~250 m»
  // porque es lo que dice la API de consulta de ISRIC, y el camino que de
  // verdad contestó fue el de los rásters locales, que la app declara a ~1 km.
  // Una pieza cuyo tema es la procedencia de cada fila no puede equivocar
  // justamente la resolución.
  const SUELO_RES = suelo ? (/~\s*[\d.,]+\s*(?:k?m)/.exec(suelo.fuente)?.[0] ?? 'sin declarar') : '—';
  const PROPIO = 'polígono del proyecto';

  const filas: Fila[] = [
    {
      dato: 'Superficie', valor: `${num(metricas.area_ha, 2)} ha`,
      fuente: PROPIO, fuente_real: 'Polígono dibujado por el usuario',
      fecha: 'del proyecto', resolucion: '—',
    },
    {
      dato: 'Perímetro', valor: `${num(metricas.perimetro_m)} m`,
      fuente: PROPIO, fuente_real: 'Polígono dibujado por el usuario',
      fecha: 'del proyecto', resolucion: '—',
    },
    {
      dato: 'Cota mínima y máxima', valor: `${num(bajo.z, 1)} – ${num(alto.z, 1)} m`,
      fuente: DEM_GEN, fuente_real: fuente, fecha: '2011–2015', resolucion: DEM_RES,
    },
    {
      dato: 'Desnivel', valor: `${num(desnivel, 1)} m`,
      fuente: DEM_GEN, fuente_real: fuente, fecha: '2011–2015', resolucion: DEM_RES,
    },
    {
      dato: 'Pendiente general', valor: `${num(pendiente_pct, 1)} %`,
      fuente: DEM_GEN, fuente_real: fuente, fecha: '2011–2015', resolucion: DEM_RES,
    },
    {
      dato: 'Escurrimiento', valor: `hacia el ${orientacion}`,
      fuente: DEM_GEN, fuente_real: fuente, fecha: '2011–2015', resolucion: DEM_RES,
    },
    {
      dato: 'Precipitación anual', valor: `${num(clima.precip_anual_mm)} mm`,
      fuente: CLIMA_GEN, fuente_real: clima.fuente, fecha: CLIMA_FECHA, resolucion: CLIMA_RES,
    },
    {
      dato: 'Temperatura media', valor: `${num(clima.tmean_anual_c, 1)} °C`,
      fuente: CLIMA_GEN, fuente_real: clima.fuente, fecha: CLIMA_FECHA, resolucion: CLIMA_RES,
    },
    {
      dato: 'ETP anual (Hargreaves)', valor: `${num(clima.etp_anual_mm)} mm`,
      fuente: `${CLIMA_GEN} · Hargreaves`, fuente_real: `${clima.fuente} · Hargreaves-Samani`,
      fecha: CLIMA_FECHA, resolucion: CLIMA_RES,
    },
    {
      dato: 'Viento predominante', valor: clima.viento_dir_ppal,
      fuente: CLIMA_GEN, fuente_real: clima.fuente, fecha: CLIMA_FECHA, resolucion: CLIMA_RES,
    },
  ];

  if (clima.koppen) {
    filas.push({
      dato: 'Clima (Köppen-Geiger)',
      valor: `${clima.koppen.codigo} · ${clima.koppen.descripcion}`,
      fuente: 'mapa global de clima', fuente_real: 'Köppen-Geiger 1 km, Beck et al. (2023)',
      fecha: PERIODOS.presente.etiqueta, resolucion: '1 km',
    });
  }

  if (suelo) {
    filas.push(
      {
        dato: 'Textura (0–5 cm)', valor: suelo.clase_textura,
        fuente: SUELO_GEN, fuente_real: suelo.fuente, fecha: 'v2.0', resolucion: SUELO_RES,
      },
      {
        dato: 'Arcilla / arena / limo',
        valor: `${num(suelo.arcilla, 1)} / ${num(suelo.arena, 1)} / ${num(suelo.limo, 1)} %`,
        fuente: SUELO_GEN, fuente_real: suelo.fuente, fecha: 'v2.0', resolucion: SUELO_RES,
      },
      {
        dato: 'pH en agua', valor: num(suelo.ph, 1),
        fuente: SUELO_GEN, fuente_real: suelo.fuente, fecha: 'v2.0', resolucion: SUELO_RES,
      },
      {
        dato: 'Carbono orgánico', valor: `${num(suelo.carbono_org, 1)} g/kg`,
        fuente: SUELO_GEN, fuente_real: suelo.fuente, fecha: 'v2.0', resolucion: SUELO_RES,
      },
      {
        dato: 'Grupo hidrológico',
        valor: `${suelo.grupo_hidro.grupo} · infiltración ${suelo.grupo_hidro.infiltracion.toLowerCase()}`,
        fuente: SUELO_GEN,
        fuente_real: suelo.fuente,
        fecha: 'v2.0', resolucion: SUELO_RES,
      },
    );
  }

  // ── El índice, con los títulos del informe de verdad ─────────────────────
  //
  // Son los de `TITULOS` en `InformeView.tsx`, en el orden en que la vista
  // numera las secciones, y sólo las que este informe tiene. Agregar una
  // sección que no se calculó sería prometer un análisis que no está.
  const indice: Array<{ n: number; titulo: string }> = [{ n: 1, titulo: 'Datos del terreno' }];
  let numero = 1;
  if (clima) indice.push({ n: ++numero, titulo: 'Clima' });
  indice.push({ n: ++numero, titulo: 'Topografía' });
  if (suelo) indice.push({ n: ++numero, titulo: 'Suelo' });

  // ── El anexo de procedencias, con la misma lista del informe ─────────────
  const anexo = [
    { rubro: 'Imagen satelital', texto: 'ortofoto satelital global.' },
    {
      rubro: 'Topografía',
      texto: `${DEM_GEN} (${DEM_RES}). La app elige el mejor modelo disponible del lugar: `
        + 'servicios nacionales donde existen, el modelo global en el resto.',
    },
    { rubro: 'Clima', texto: `${CLIMA_GEN} (promedio ${CLIMA_FECHA}), ${CLIMA_RES}.` },
    { rubro: 'Clasificación climática', texto: `mapa global de clima de 1 km (${PERIODOS.presente.etiqueta}).` },
  ];
  if (suelo) {
    anexo.push({
      rubro: 'Suelo',
      texto: `${SUELO_GEN} (${SUELO_RES}); agua útil por pedotransferencia Saxton-Rawls (2006).`,
    });
  }

  const datos = {
    predio: PREDIO,
    // El nombre del predio NO se publica. El informe muestra el que cargó el
    // usuario; acá va el rótulo neutro, y la ubicación se omite entera: la
    // portada de la app la dibuja sólo si está.
    titulo: 'Informe de análisis de terreno',
    fecha: new Date().toISOString().slice(0, 10),
    mojones: MOJONES,
    metricas: {
      area_ha: r2(metricas.area_ha),
      area_m2: Math.round(metricas.area_m2),
      perimetro_m: Math.round(metricas.perimetro_m),
      mojones: MOJONES.length,
    },
    topo: {
      elev_min: r1(bajo.z), elev_max: r1(alto.z),
      elev_media: r1(suma / n),
      desnivel: r1(desnivel),
      distancia_m: Math.round(distancia),
      pendiente_pct: r1(pendiente_pct),
      orientacion,
      celdas_dentro: n,
      paso_m: r1(anchoM / cols),
      fuente_real: fuente,
      resolucion_m: paso_fuente_m,
      metodo:
        'Desnivel entre el punto más alto y el más bajo DENTRO del polígono, sobre la distancia '
        + 'entre esos dos puntos. Es la definición de «pendiente general» de la app, aplicada al '
        + 'relieve denso y no a la muestra de veinte puntos del panel.',
    },
    koppen: clima.koppen ?? null,
    clima: {
      precip_anual_mm: Math.round(clima.precip_anual_mm),
      tmean_anual_c: r1(clima.tmean_anual_c),
      etp_anual_mm: Math.round(clima.etp_anual_mm),
      viento_dir_ppal: clima.viento_dir_ppal,
      fuente_real: clima.fuente,
    },
    suelo: suelo
      ? {
        clase_textura: suelo.clase_textura,
        ph: r1(suelo.ph), carbono_org: r1(suelo.carbono_org),
        arcilla: r1(suelo.arcilla), arena: r1(suelo.arena), limo: r1(suelo.limo),
        grupo_hidro: suelo.grupo_hidro.grupo,
        infiltracion: suelo.grupo_hidro.infiltracion,
        fuente_real: suelo.fuente,
      }
      : null,
    indice,
    filas,
    anexo,
    // El párrafo de límites, palabra por palabra el del informe.
    limites:
      'Los valores son orientativos y no reemplazan un relevamiento topográfico, edafológico o '
      + 'climático profesional. Verificar en campo antes de ejecutar obras.',
    bitacora_red: BITACORA,
  };

  mkdirSync(GENERADO, { recursive: true });
  const destino = path.join(GENERADO, `${PREDIO}-informe.json`);
  const texto = JSON.stringify(datos, null, 1);
  writeFileSync(destino, texto);
  console.log('');
  console.log(`filas      ${filas.length} · índice ${indice.length} · anexo ${anexo.length}`);
  console.log(`escrito    ${destino}  (${(Buffer.byteLength(texto) / 1024).toFixed(1)} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
