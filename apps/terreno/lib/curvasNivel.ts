/**
 * Curvas de nivel vectoriales via Marching Squares sobre una GrillaElevacion
 * (densa desde tiles Terrarium, o 10×10 desde el shader como fallback).
 * Los segmentos se encadenan en polilíneas continuas para render limpio.
 * Adecuado para orientación; no reemplaza cartografía de precisión.
 */
import type { GrillaElevacion } from './grillaElevacion';

export interface Punto      { lat: number; lng: number }

/**
 * Qué es una curva cerrada: una cima (el terreno sube hacia adentro) o una
 * depresión (baja hacia adentro). Sin esto, un anillo rotulado `340 m` es
 * ambiguo — puede ser un cerro o una hoya, y la diferencia decide dónde va una
 * represa y dónde no. `null` en las líneas abiertas y en los anillos que caen
 * fuera de la grilla.
 */
export type TipoCerrada = 'cima' | 'depresion';

export interface LineaNivel {
  puntos: Punto[];
  cerrada: boolean;
  /** Sólo en las cerradas: hacia dónde sube el terreno adentro del anillo. */
  tipo: TipoCerrada | null;
}
export interface CurvaNivel { cota: number; lineas: LineaNivel[] }

/**
 * Por debajo de esto las curvas dibujan el ruido del sensor, no el terreno.
 *
 * El modelo de elevación es Terrarium, derivado de SRTM: ~30 m de paso
 * horizontal y varios metros de error absoluto (mejor en error *relativo*
 * entre puntos cercanos, que es lo que importa acá, pero no sub-métrico).
 * Que el formato codifique milímetros no significa que el dato los tenga.
 */
export const INTERVALO_CONFIABLE_M = 2;

/**
 * Intervalo mínimo con sentido para un MDE propio de paso `pasoM` metros.
 *
 * Criterio geométrico, no de exactitud: con celdas de `pasoM` no se pueden
 * separar curvas que caigan dentro de media celda — de ahí para abajo lo que
 * se dibuja es la interpolación, no el terreno. Quien importa su propio
 * relevamiento sabe con qué lo voló, así que no le imponemos más que eso.
 *
 *   dron RTK  ~5 cm/px  → 10 cm  (habilita los 25 cm que el satelital no puede)
 *   LiDAR     ~1 m/px   → 50 cm
 *   MDE IGN   ~5 m/px   → 2.5 m
 *
 * Sin MDE propio vale `INTERVALO_CONFIABLE_M`, que es empírico: SRTM tiene
 * 30 m de paso pero exactitud vertical mucho mejor que eso, así que la regla
 * de la media celda no aplica.
 */
export function intervaloConfiablePara(pasoM: number | null): number {
  if (pasoM == null) return INTERVALO_CONFIABLE_M;
  return Math.max(0.1, Math.round((pasoM / 2) * 100) / 100);
}

/**
 * Lo mismo, pero para un modelo REMOTO (satelital o servicio nacional), donde la
 * regla de la media celda no se aplica igual.
 *
 * El motivo está en el comentario de INTERVALO_CONFIABLE_M: SRTM tiene 30 m de
 * paso pero exactitud vertical mucho mejor, así que pedirle media celda daría
 * 15 m —absurdo— cuando en la práctica 2 m funciona. Al revés, con swissALTI3D
 * (2 m) o AHN (50 cm) sí se puede bajar de 2, y negarse sería tirar el dato.
 * De ahí la regla: el piso nunca es peor que los 2 m empíricos, y mejora cuando
 * el modelo da para más.
 */
export function intervaloConfiableRemoto(pasoM: number | null): number {
  if (pasoM == null) return INTERVALO_CONFIABLE_M;
  return Math.min(INTERVALO_CONFIABLE_M, Math.max(0.1, Math.round((pasoM / 2) * 100) / 100));
}

/**
 * Intervalo automático: apunta a una cantidad de curvas legible y lo redondea
 * a un valor "lindo".
 *
 * Los predios chicos aguantan más curvas: en media hectárea con 3 m de
 * desnivel, cada 5 m no dibuja ninguna. Nunca baja de
 * `INTERVALO_CONFIABLE_M` por su cuenta — para eso está la elección manual,
 * que avisa lo que está haciendo.
 */
export function intervaloAutomatico(desnivel: number, areaHa?: number, pisoM?: number): number {
  // El piso sale del límite del modelo de elevación en uso: con el satelital son
  // 2 m, con un relevamiento propio de dron baja a centímetros.
  const piso = pisoM ?? INTERVALO_CONFIABLE_M;
  const lindos = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50].filter(v => v >= piso);
  if (lindos.length === 0) return piso;
  const curvasDeseadas = areaHa != null && areaHa < 10 ? 12 : 8;
  const objetivo = desnivel / curvasDeseadas;
  return lindos.reduce((best, v) =>
    Math.abs(v - objetivo) < Math.abs(best - objetivo) ? v : best, lindos[0]!);
}

/**
 * A partir de acá son MUCHAS curvas: la app avisa, pero no se niega.
 *
 * Hasta el 24/09/2026 esto era un tope duro y `calcularCurvas` devolvía vacío
 * al pasarse. El efecto real no era limitar: era apagar. Con 67 m de desnivel
 * —un predio de sierra cualquiera— el intervalo de 1 m ya pedía 67 niveles y el
 * mapa salía sin una sola curva. El que subía un relevamiento propio de dron o
 * RTK, que es justamente quien tiene derecho a pedir curvas finas, era el
 * primero en chocarse.
 *
 * El criterio ahora es el del resto de la app: informar el límite del dato y
 * dejar decidir. Quien voló su terreno sabe con qué lo voló, y cualquier
 * trazado se verifica in situ de todos modos.
 *
 * Que se haya podido sacar es consecuencia de haber arreglado el costo: ver la
 * medición en `clasificarAnillo`. Clasificar los anillos se llevaba el 70% del
 * tiempo y ahora no se mide.
 */
export const NIVELES_MUCHOS = 60;

/**
 * Techo absoluto, contra el pedido absurdo: un intervalo de 1 mm sobre 200 m de
 * desnivel son 200.000 niveles y ninguna máquina lo termina.
 *
 * No es el umbral de aviso —ese es `NIVELES_MUCHOS`, y está 60 veces más
 * abajo—: es la red para que un valor mal tipeado no cuelgue la pestaña. En uso
 * legítimo no se toca: 4.000 curvas son 400 m de desnivel a 10 cm, más de lo
 * que cualquier predio real combina con esa precisión.
 */
export const TECHO_NIVELES = 4_000;

/** Cuántas curvas saldrían — para avisar antes de que no se dibuje ninguna. */
export function nivelesEstimados(desnivel: number, intervalo: number): number {
  if (!(intervalo > 0)) return 0;
  return Math.floor(desnivel / intervalo);
}

/**
 * Clasifica un anillo cerrado como cima o depresión SONDEANDO sus extremos.
 *
 * Es la versión rápida, y la que corre casi siempre. La idea: en el vértice más
 * al sur de un anillo simple, el interior queda necesariamente hacia el norte;
 * en el más al norte, hacia el sur; y lo mismo al este y al oeste. Con cuatro
 * sondeos a medio paso de grilla hacia adentro alcanza para decidir, y los
 * cuatro salen de UNA pasada sobre los vértices — sin recorrer la grilla.
 *
 * Por qué importa: el método exhaustivo mira todos los nodos del bbox del
 * anillo y por cada uno hace punto-en-polígono contra todos sus vértices, o sea
 * O(nodos × vértices). Medido el 24/09/2026 sobre una grilla de 300×300 con 67 m
 * de desnivel, eso costaba 14 ms POR ANILLO y se llevaba el 70% del tiempo
 * total de calcular las curvas (564 ms contra 168 ms del mismo relieve sin
 * anillos cerrados). Era lo que obligaba a tener un tope de niveles.
 *
 * Cuando los cuatro sondeos no coinciden —un anillo con forma de U, de herradura
 * o de riñón, donde un extremo puede caer sobre un entrante— no se adivina: se
 * cae al método exhaustivo, que sigue siendo exacto. Son pocos y el costo se
 * paga sólo ahí.
 */
function clasificarAnillo(
  puntos: Punto[],
  z: number,
  g: GrillaElevacion,
): TipoCerrada | null {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  if (puntos.length < 3) return null;

  const fila = (lat: number) => ((lat - latMin) / (latMax - latMin)) * (rows - 1);
  const col  = (lng: number) => ((lng - lngMin) / (lngMax - lngMin)) * (cols - 1);

  // Una sola pasada: los cuatro vértices extremos en coordenadas de grilla.
  let rMin = Infinity, rMax = -Infinity, cMin = Infinity, cMax = -Infinity;
  let pRMin = 0, pRMax = 0, pCMin = 0, pCMax = 0;
  for (let i = 0; i < puntos.length; i++) {
    const p = puntos[i]!;
    const r = fila(p.lat), c = col(p.lng);
    if (r < rMin) { rMin = r; pRMin = i; }
    if (r > rMax) { rMax = r; pRMax = i; }
    if (c < cMin) { cMin = c; pCMin = i; }
    if (c > cMax) { cMax = c; pCMax = i; }
  }
  // Anillo más chico que una celda: no hay "adentro" que sondear.
  if (rMax - rMin < 1 && cMax - cMin < 1) return clasificarAnilloExhaustivo(puntos, z, g);

  // Cada extremo se sondea medio paso hacia el interior del anillo.
  const sondeos: Array<[number, number]> = [
    [fila(puntos[pRMin]!.lat) + 0.5, col(puntos[pRMin]!.lng)],
    [fila(puntos[pRMax]!.lat) - 0.5, col(puntos[pRMax]!.lng)],
    [fila(puntos[pCMin]!.lat),       col(puntos[pCMin]!.lng) + 0.5],
    [fila(puntos[pCMax]!.lat),       col(puntos[pCMax]!.lng) - 0.5],
  ];

  let arriba = 0, abajo = 0, iguales = 0;
  for (const [r, c] of sondeos) {
    const rr = Math.round(r), cc = Math.round(c);
    if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
    const v = elev[rr * cols + cc]!;
    if (isNaN(v)) continue;
    if (v > z) arriba++;
    else if (v < z) abajo++;
    else iguales++;
  }

  // Consenso limpio: todos los sondeos válidos apuntan al mismo lado.
  if (arriba > 0 && abajo === 0 && iguales === 0) return 'cima';
  if (abajo > 0 && arriba === 0 && iguales === 0) return 'depresion';
  // Sin consenso (anillo cóncavo, o interior justo en la cota): el exhaustivo.
  return clasificarAnilloExhaustivo(puntos, z, g);
}

/**
 * El clasificador exacto, por fuerza bruta. Hoy es el respaldo de
 * `clasificarAnillo`, no el camino principal.
 *
 * El criterio es directo: se recorren los nodos de la grilla que caen dentro
 * del anillo y se compara su elevación media contra la cota de la curva. Si el
 * interior está más alto, es una cima; si está más bajo, una hoya. Se trabaja
 * en coordenadas de grilla (fila, columna) y no en grados, para que el test de
 * punto-en-polígono no dependa de la latitud.
 *
 * Los anillos chicos —que son justamente los picos y las depresiones que más
 * importan— pueden no contener ningún nodo. Para esos se cae al centroide del
 * anillo, muestreado por vecino más cercano.
 */
export function clasificarAnilloExhaustivo(
  puntos: Punto[],
  z: number,
  g: GrillaElevacion,
): TipoCerrada | null {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const fila = (lat: number) => ((lat - latMin) / (latMax - latMin)) * (rows - 1);
  const col  = (lng: number) => ((lng - lngMin) / (lngMax - lngMin)) * (cols - 1);

  const rs = puntos.map(p => fila(p.lat));
  const cs = puntos.map(p => col(p.lng));

  const r0 = Math.max(0, Math.floor(Math.min(...rs)));
  const r1 = Math.min(rows - 1, Math.ceil(Math.max(...rs)));
  const c0 = Math.max(0, Math.floor(Math.min(...cs)));
  const c1 = Math.min(cols - 1, Math.ceil(Math.max(...cs)));

  const dentro = (r: number, c: number) => {
    let hit = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
      const ri = rs[i]!, ci = cs[i]!, rj = rs[j]!, cj = cs[j]!;
      if ((ri > r) !== (rj > r) && c < ((cj - ci) * (r - ri)) / (rj - ri) + ci) hit = !hit;
    }
    return hit;
  };

  let suma = 0, n = 0, arriba = 0, abajo = 0;
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const v = elev[r * cols + c]!;
      if (isNaN(v) || !dentro(r, c)) continue;
      suma += v; n++;
      if (v > z) arriba++;
      else if (v < z) abajo++;
    }
  }

  if (n === 0) {
    // Anillo más chico que una celda: el centroide, al vecino más cercano.
    const rc = Math.round(rs.reduce((x, y) => x + y, 0) / rs.length);
    const cc = Math.round(cs.reduce((x, y) => x + y, 0) / cs.length);
    if (rc < 0 || rc >= rows || cc < 0 || cc >= cols) return null;
    const v = elev[rc * cols + cc]!;
    if (isNaN(v)) return null;
    suma = v; n = 1;
    if (v > z) arriba++;
    else if (v < z) abajo++;
  }

  // Primero el caso limpio: si adentro no hay nada por debajo de la cota, el
  // anillo encierra terreno más alto y es una cima; al revés, una hoya. Esto
  // resuelve bien los anillos chicos de la cumbre y del fondo, donde la media
  // empata contra la cota por la resolución de la grilla y el promedio solo no
  // alcanzaría para decidir.
  if (arriba > 0 && abajo === 0) return 'cima';
  if (abajo > 0 && arriba === 0) return 'depresion';
  // Interior mezclado (una cima con una hoya adentro, por ejemplo): manda el
  // promedio. Si tampoco hay diferencia, es una meseta y no se decide.
  const media = suma / n;
  if (media === z) return null;
  return media > z ? 'cima' : 'depresion';
}

// ─── Marching squares con encadenado ─────────────────────────────────────────

export function calcularCurvas(grilla: GrillaElevacion, intervalo: number): CurvaNivel[] {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max } = grilla;
  if (rows < 2 || cols < 2 || elev_max - elev_min < 0.5) return [];

  const lat = (r: number) => latMin + (r / (rows - 1)) * (latMax - latMin);
  const lng = (c: number) => lngMin + (c / (cols - 1)) * (lngMax - lngMin);
  const e   = (r: number, c: number) => elev[r * cols + c]!;

  const start = Math.ceil(elev_min / intervalo) * intervalo;
  const niveles: number[] = [];
  for (let z = start; z <= elev_max; z += intervalo) niveles.push(z);
  // Sólo el absurdo se corta. Lo "mucho" se avisa arriba, en la UI, que es
  // donde se puede decir por qué; acá abajo no hay forma de explicar un vacío.
  if (niveles.length > TECHO_NIVELES) return [];

  const curvas: CurvaNivel[] = [];

  for (const z of niveles) {
    // Punto de cruce por arista (clave canónica de arista → punto interpolado)
    const puntosArista = new Map<string, Punto>();

    function cruce(
      key: string,
      r1: number, c1: number, r2: number, c2: number,
    ): Punto {
      let p = puntosArista.get(key);
      if (p) return p;
      const e1 = e(r1, c1), e2 = e(r2, c2);
      const t = (z - e1) / (e2 - e1);
      p = {
        lat: lat(r1) + t * (lat(r2) - lat(r1)),
        lng: lng(c1) + t * (lng(c2) - lng(c1)),
      };
      puntosArista.set(key, p);
      return p;
    }

    // Segmentos como pares de claves de arista
    const segmentos: Array<[string, string]> = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const e00 = e(r, c), e10 = e(r, c + 1);
        const e01 = e(r + 1, c), e11 = e(r + 1, c + 1);
        if (isNaN(e00) || isNaN(e10) || isNaN(e01) || isNaN(e11)) continue;

        const b00 = e00 >= z, b10 = e10 >= z, b01 = e01 >= z, b11 = e11 >= z;
        const code = (b00 ? 1 : 0) | (b10 ? 2 : 0) | (b11 ? 4 : 0) | (b01 ? 8 : 0);
        if (code === 0 || code === 15) continue;

        // Claves de arista (compartidas entre celdas vecinas → encadenado exacto)
        const abajo  = `H${r},${c}`;       // n00–n10
        const arriba = `H${r + 1},${c}`;   // n01–n11
        const izq    = `V${r},${c}`;       // n00–n01
        const der    = `V${r},${c + 1}`;   // n10–n11

        const pAbajo  = () => { cruce(abajo,  r, c,     r, c + 1);     return abajo;  };
        const pArriba = () => { cruce(arriba, r + 1, c, r + 1, c + 1); return arriba; };
        const pIzq    = () => { cruce(izq,    r, c,     r + 1, c);     return izq;    };
        const pDer    = () => { cruce(der,    r, c + 1, r + 1, c + 1); return der;    };

        switch (code) {
          case 1:  case 14: segmentos.push([pIzq(),   pAbajo()]);  break;
          case 2:  case 13: segmentos.push([pAbajo(), pDer()]);    break;
          case 3:  case 12: segmentos.push([pIzq(),   pDer()]);    break;
          case 4:  case 11: segmentos.push([pDer(),   pArriba()]); break;
          case 6:  case 9:  segmentos.push([pAbajo(), pArriba()]); break;
          case 7:  case 8:  segmentos.push([pIzq(),   pArriba()]); break;
          case 5: {
            // Silla: decidir por el promedio del centro
            const centro = (e00 + e10 + e01 + e11) / 4;
            if (centro >= z) { segmentos.push([pIzq(), pArriba()]); segmentos.push([pAbajo(), pDer()]); }
            else             { segmentos.push([pIzq(), pAbajo()]);  segmentos.push([pDer(), pArriba()]); }
            break;
          }
          case 10: {
            const centro = (e00 + e10 + e01 + e11) / 4;
            if (centro >= z) { segmentos.push([pIzq(), pAbajo()]);  segmentos.push([pDer(), pArriba()]); }
            else             { segmentos.push([pIzq(), pArriba()]); segmentos.push([pAbajo(), pDer()]); }
            break;
          }
        }
      }
    }

    if (segmentos.length === 0) continue;

    // ── Encadenar segmentos en polilíneas ────────────────────────────────────
    const adyacencia = new Map<string, string[]>();
    for (const [a, b] of segmentos) {
      if (!adyacencia.has(a)) adyacencia.set(a, []);
      if (!adyacencia.has(b)) adyacencia.set(b, []);
      adyacencia.get(a)!.push(b);
      adyacencia.get(b)!.push(a);
    }

    const usado = new Set<string>();
    const lineas: LineaNivel[] = [];

    function caminar(inicio: string): string[] {
      const cadena = [inicio];
      usado.add(inicio);
      let actual = inicio;
      for (;;) {
        const vecinos = adyacencia.get(actual) ?? [];
        const siguiente = vecinos.find(v => !usado.has(v));
        if (!siguiente) break;
        usado.add(siguiente);
        cadena.push(siguiente);
        actual = siguiente;
      }
      return cadena;
    }

    // Primero líneas abiertas (extremos con grado 1)
    for (const [key, vecinos] of adyacencia) {
      if (usado.has(key) || vecinos.length !== 1) continue;
      const cadena = caminar(key);
      if (cadena.length >= 2) {
        lineas.push({ puntos: cadena.map(k => puntosArista.get(k)!), cerrada: false, tipo: null });
      }
    }
    // Luego loops cerrados (todo lo que quedó)
    for (const key of adyacencia.keys()) {
      if (usado.has(key)) continue;
      const cadena = caminar(key);
      if (cadena.length >= 3) {
        const puntos = cadena.map(k => puntosArista.get(k)!);
        lineas.push({ puntos, cerrada: true, tipo: clasificarAnillo(puntos, z, grilla) });
      }
    }

    if (lineas.length > 0) curvas.push({ cota: z, lineas });
  }

  return curvas;
}
