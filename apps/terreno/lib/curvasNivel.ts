/**
 * Curvas de nivel vectoriales via Marching Squares sobre una GrillaElevacion
 * (densa desde tiles Terrarium, o 10×10 desde el shader como fallback).
 * Los segmentos se encadenan en polilíneas continuas para render limpio.
 * Adecuado para orientación; no reemplaza cartografía de precisión.
 */
import type { GrillaElevacion } from './grillaElevacion';

export interface Punto      { lat: number; lng: number }
export interface LineaNivel { puntos: Punto[]; cerrada: boolean }
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
 * Tope de curvas a dibujar. Cada nivel recorre la grilla entera, así que un
 * intervalo muy chico para el desnivel del predio congela el navegador.
 * `calcularCurvas` devuelve vacío al pasarse; la UI avisa por qué.
 */
export const MAX_NIVELES = 60;

/** Cuántas curvas saldrían — para avisar antes de que no se dibuje ninguna. */
export function nivelesEstimados(desnivel: number, intervalo: number): number {
  if (!(intervalo > 0)) return 0;
  return Math.floor(desnivel / intervalo);
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
  // Guardia de rendimiento: cada nivel recorre toda la grilla.
  if (niveles.length > MAX_NIVELES) return [];

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
        lineas.push({ puntos: cadena.map(k => puntosArista.get(k)!), cerrada: false });
      }
    }
    // Luego loops cerrados (todo lo que quedó)
    for (const key of adyacencia.keys()) {
      if (usado.has(key)) continue;
      const cadena = caminar(key);
      if (cadena.length >= 3) {
        lineas.push({ puntos: cadena.map(k => puntosArista.get(k)!), cerrada: true });
      }
    }

    if (lineas.length > 0) curvas.push({ cota: z, lineas });
  }

  return curvas;
}
