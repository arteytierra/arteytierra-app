import type { TipoAmbiente } from '../tipos';
import type { InstanciaAmbiente } from './areas';

export interface RectanguloAmbiente extends InstanciaAmbiente {
  x_m: number;
  y_m: number;
  w_m: number;
  h_m: number;
  fila: number;
  exteriorNorte: boolean;
  exteriorSur: boolean;
  exteriorEste: boolean;
  exteriorOeste: boolean;
}

const ASPECTO_POR_TIPO: Partial<Record<TipoAmbiente, number>> = {
  garage: 1.9,
  'estar-cocina-comedor': 1.35,
  galeria: 2.4,
  hall: 1.6,
  bano: 0.85,
  lavadero: 0.9,
  despensa: 0.85,
};

function aspectoDe(tipo: TipoAmbiente): number {
  return ASPECTO_POR_TIPO[tipo] ?? 1.2;
}

/**
 * Ancho mínimo utilizable de cada ambiente, en metros.
 *
 * Sin esto el empaquetado por filas produce tiras: al compartir todos los
 * ambientes de una fila la misma altura, un baño de 5 m² en una fila de 5,3 m
 * de fondo terminaba de 0,9 m de ancho — un pasillo, no un baño. Los valores
 * salen del mueble que tiene que entrar más la circulación: una cama de 1,90
 * más paso, un inodoro más el espacio para usarlo.
 */
const ANCHO_MIN_POR_TIPO: Partial<Record<TipoAmbiente, number>> = {
  dormitorio: 2.4,
  'estar-cocina-comedor': 2.6,
  bano: 1.5,
  garage: 2.5,
  estudio: 1.9,
  taller: 1.9,
  lavadero: 1.2,
  despensa: 0.9,
  hall: 1.0,
  galeria: 1.5,
  invernadero: 1.8,
  biofiltro: 1.2,
};

function anchoMinimoDe(tipo: TipoAmbiente): number {
  return ANCHO_MIN_POR_TIPO[tipo] ?? 1.2;
}

/**
 * Ordena las instancias para que las conectadas por adyacencia deseada
 * queden contiguas: BFS desde una "semilla" (el estar-cocina-comedor si
 * existe, si no el ambiente de mayor superficie), luego el resto de cada
 * componente conexa, luego los ambientes sin adyacencias declaradas.
 */
/**
 * Orden tal como la familia listó los ambientes en el cuaderno, sin
 * reagrupar por adyacencia. Lo usa el perfil "fiel al cliente": el orden en
 * que alguien enumera los ambientes de su casa ya expresa una jerarquía, y
 * ese perfil se define por respetar lo que la familia dijo antes que por
 * optimizar la planta.
 */
export function ordenDeclarado(instancias: InstanciaAmbiente[]): InstanciaAmbiente[] {
  return [...instancias];
}

export function ordenarPorAdyacencia(instancias: InstanciaAmbiente[]): InstanciaAmbiente[] {
  const porOrigen = new Map<string, InstanciaAmbiente[]>();
  for (const inst of instancias) {
    const lista = porOrigen.get(inst.origenId) ?? [];
    lista.push(inst);
    porOrigen.set(inst.origenId, lista);
  }

  // La adyacencia es simétrica: si el baño pide estar junto al estar, el estar
  // está junto al baño. Recorrer sólo las adyacencias declaradas por cada
  // ambiente (aristas dirigidas) dejaba separados justamente los pares que la
  // familia pidió juntos, porque sólo uno de los dos lo había declarado.
  const vecinos = new Map<string, Set<string>>();
  const vincular = (a: string, b: string) => {
    if (a === b) return;
    if (!vecinos.has(a)) vecinos.set(a, new Set());
    vecinos.get(a)!.add(b);
  };
  for (const inst of instancias) {
    for (const otro of inst.adyacenciasDeseadas) {
      if (!porOrigen.has(otro)) continue; // referencia a un ambiente inexistente
      vincular(inst.origenId, otro);
      vincular(otro, inst.origenId);
    }
  }

  const visitados = new Set<string>();
  const orden: InstanciaAmbiente[] = [];

  const semilla =
    instancias.find(i => i.tipo === 'estar-cocina-comedor') ??
    [...instancias].sort((a, b) => b.area_m2 - a.area_m2)[0];

  function visitarComponente(inicio: InstanciaAmbiente) {
    const cola = [inicio];
    while (cola.length) {
      const actual = cola.shift()!;
      if (visitados.has(actual.id)) continue;
      visitados.add(actual.id);
      orden.push(actual);
      for (const origenVecino of vecinos.get(actual.origenId) ?? []) {
        for (const vecino of porOrigen.get(origenVecino) ?? []) {
          if (!visitados.has(vecino.id)) cola.push(vecino);
        }
      }
    }
  }

  if (semilla) visitarComponente(semilla);
  // Resto de instancias no alcanzadas (sin adyacencias o componentes separadas),
  // ordenadas de mayor a menor superficie.
  for (const inst of [...instancias].sort((a, b) => b.area_m2 - a.area_m2)) {
    if (!visitados.has(inst.id)) visitarComponente(inst);
  }
  return orden;
}

/**
 * Empaqueta ambientes en filas horizontales: la altura de cada fila la fija
 * el primer ambiente colocado en ella (según su aspecto ideal); el resto de
 * ambientes de esa fila comparten esa altura y su ancho se calcula como
 * área/altura — así el área de cada ambiente en el plano coincide siempre
 * exactamente con su área de programa, sin huecos ni superposiciones.
 *
 * Es un algoritmo de tipo "shelf packing", suficiente para un anteproyecto
 * esquemático (no reemplaza el ajuste fino de un arquitecto).
 */
export function empaquetarEnFilas(
  ordenadas: InstanciaAmbiente[],
  anchoObjetivo_m: number,
): RectanguloAmbiente[] {
  const resultado: RectanguloAmbiente[] = [];
  let cursorY = 0;
  let fila = 0;
  let i = 0;

  while (i < ordenadas.length) {
    const primero = ordenadas[i]!;
    const alturaFila = Math.sqrt(primero.area_m2 / aspectoDe(primero.tipo));
    let cursorX = 0;
    const filaActual: RectanguloAmbiente[] = [];

    while (i < ordenadas.length) {
      const amb = ordenadas[i]!;
      const anchoAmb = amb.area_m2 / alturaFila;
      if (cursorX + anchoAmb > anchoObjetivo_m && filaActual.length > 0) break;
      // Un ambiente que en esta fila quedaría más angosto que su mínimo
      // utilizable arranca una fila nueva, donde su propio aspecto fija la
      // altura y recupera proporciones sanas.
      if (anchoAmb < anchoMinimoDe(amb.tipo) && filaActual.length > 0) break;
      const rect: RectanguloAmbiente = {
        ...amb,
        x_m: Math.round(cursorX * 100) / 100,
        y_m: Math.round(cursorY * 100) / 100,
        w_m: Math.round(anchoAmb * 100) / 100,
        h_m: Math.round(alturaFila * 100) / 100,
        fila,
        exteriorNorte: false,
        exteriorSur: false,
        exteriorEste: false,
        exteriorOeste: false,
      };
      filaActual.push(rect);
      resultado.push(rect);
      cursorX += anchoAmb;
      i++;
    }
    cursorY += alturaFila;
    fila++;
  }

  marcarExteriores(resultado);
  return resultado;
}

/** Un lado de un ambiente es exterior si no hay otro ambiente pegado en ese lado. */
function marcarExteriores(rects: RectanguloAmbiente[], tolerancia = 0.03) {
  for (const r of rects) {
    r.exteriorOeste = !rects.some(
      o => o !== r && Math.abs(o.x_m + o.w_m - r.x_m) < tolerancia && seSuperponeEnY(o, r),
    );
    r.exteriorEste = !rects.some(
      o => o !== r && Math.abs(r.x_m + r.w_m - o.x_m) < tolerancia && seSuperponeEnY(o, r),
    );
    r.exteriorNorte = !rects.some(
      o => o !== r && Math.abs(o.y_m + o.h_m - r.y_m) < tolerancia && seSuperponeEnX(o, r),
    );
    r.exteriorSur = !rects.some(
      o => o !== r && Math.abs(r.y_m + r.h_m - o.y_m) < tolerancia && seSuperponeEnX(o, r),
    );
  }
}

function seSuperponeEnX(a: RectanguloAmbiente, b: RectanguloAmbiente): boolean {
  return a.x_m < b.x_m + b.w_m && b.x_m < a.x_m + a.w_m;
}
function seSuperponeEnY(a: RectanguloAmbiente, b: RectanguloAmbiente): boolean {
  return a.y_m < b.y_m + b.h_m && b.y_m < a.y_m + a.h_m;
}

// ─── Empaquetado balanceado ─────────────────────────────────────────────────

/**
 * Reparte los ambientes en un número fijo de filas eligiendo los cortes que
 * dan la huella más rectangular.
 *
 * El empaquetado codicioso (`empaquetarEnFilas`) llena cada fila hasta el
 * ancho objetivo, así que la última queda con lo que sobró: una planta de dos
 * filas terminaba con una de 19,8 m y otra de 10,5 m. Como el techo y las
 * fachadas se dibujan sobre el rectángulo envolvente, ese escalón aparecía
 * como superficie techada que en la planta no existe.
 *
 * Acá se prueban todas las formas de cortar la lista ordenada en `filas`
 * grupos contiguos —contiguos para no romper el agrupamiento por adyacencia—
 * y se elige la de filas más parejas. El costo es combinatorio, así que por
 * encima de `MAX_AMBIENTES_PARTICION` se vuelve al método codicioso.
 */
const MAX_AMBIENTES_PARTICION = 14;
const PENALIZACION_ANCHO_MINIMO = 1000;

interface FilaCalculada {
  ambientes: InstanciaAmbiente[];
  altura_m: number;
  ancho_m: number;
  violaciones: number;
}

/**
 * Altura mínima de una banda para que sus ambientes sean habitables: por
 * debajo de esto queda un pasillo, no una habitación.
 */
const ALTURA_MIN_FILA_M = 2.2;

/**
 * Calcula una fila para un ancho de edificio **fijo**.
 *
 * Ésta es la clave para que la huella sea un rectángulo exacto: si todas las
 * filas comparten el mismo ancho `ancho_m`, la altura de cada una queda
 * determinada por su propia área (h = área / ancho). Así la suma de las
 * filas cubre exactamente el área del programa, sin escalones ni sobrantes, y
 * el techo y las fachadas describen el mismo edificio que la planta.
 */
function calcularFilaAnchoFijo(grupo: InstanciaAmbiente[], ancho_m: number): FilaCalculada {
  const areaFila = grupo.reduce((s, a) => s + a.area_m2, 0);
  const altura_m = areaFila / ancho_m;
  let violaciones = 0;
  if (altura_m < ALTURA_MIN_FILA_M) violaciones++;
  for (const amb of grupo) {
    if (amb.area_m2 / altura_m < anchoMinimoDe(amb.tipo)) violaciones++;
  }
  return { ambientes: grupo, altura_m, ancho_m, violaciones };
}

/** Genera todos los cortes de `n` elementos en `k` grupos contiguos no vacíos. */
function particiones(n: number, k: number): number[][] {
  const salida: number[][] = [];
  const cortes: number[] = [];
  const recurrir = (inicio: number, restantes: number) => {
    if (restantes === 0) {
      salida.push([...cortes]);
      return;
    }
    // Deja al menos un elemento para cada grupo que falta.
    for (let c = inicio; c <= n - restantes; c++) {
      cortes.push(c);
      recurrir(c + 1, restantes - 1);
      cortes.pop();
    }
  };
  recurrir(1, k - 1);
  return salida;
}

function construirDesdeFilas(filas: FilaCalculada[]): RectanguloAmbiente[] {
  const rects: RectanguloAmbiente[] = [];
  let cursorY = 0;
  filas.forEach((fila, indice) => {
    let cursorX = 0;
    for (const amb of fila.ambientes) {
      const w = amb.area_m2 / fila.altura_m;
      rects.push({
        ...amb,
        x_m: Math.round(cursorX * 100) / 100,
        y_m: Math.round(cursorY * 100) / 100,
        w_m: Math.round(w * 100) / 100,
        h_m: Math.round(fila.altura_m * 100) / 100,
        fila: indice,
        exteriorNorte: false,
        exteriorSur: false,
        exteriorEste: false,
        exteriorOeste: false,
      });
      cursorX += w;
    }
    cursorY += fila.altura_m;
  });
  marcarExteriores(rects);
  return rects;
}

/**
 * Reparte los ambientes en `filasObjetivo` bandas de igual ancho, dando una
 * huella rectangular exacta con la proporción pedida.
 *
 * `aspecto` es ancho/profundo del edificio: >1 lo alarga en el eje este-oeste,
 * <1 lo hace más profundo. Se prueban todos los cortes contiguos de la lista
 * ordenada y se elige el que deja todos los ambientes por encima de su ancho
 * mínimo utilizable; entre los válidos, el de proporciones de ambiente más
 * parejas.
 */
/**
 * Órdenes alternativos que se prueban además del preferido.
 *
 * Con ancho fijo, la altura de una banda sale de su área, así que una fila
 * formada sólo por ambientes chicos queda aplastada: baño y hall juntos daban
 * una franja de 0,70 m de fondo. Como los grupos deben ser contiguos, el orden
 * por adyacencia a veces vuelve imposible cualquier corte válido —el baño
 * queda pegado al estar y arrastrado a su misma banda—. Probar unos pocos
 * órdenes alternativos destraba esos casos; el orden preferido conserva una
 * ventaja en el puntaje, así que sólo se lo abandona si de verdad no cierra.
 */
function ordenesCandidatos(ordenadas: InstanciaAmbiente[]): InstanciaAmbiente[][] {
  const porAreaDesc = [...ordenadas].sort((a, b) => b.area_m2 - a.area_m2);
  const porAreaAsc = [...porAreaDesc].reverse();
  // Grandes primero y chicos agrupados al final: reparte el área por bandas.
  const grandesLuegoChicos = [...ordenadas].sort((a, b) => {
    const grande = (x: InstanciaAmbiente) => (x.area_m2 >= 10 ? 0 : 1);
    return grande(a) - grande(b) || b.area_m2 - a.area_m2;
  });
  return [ordenadas, grandesLuegoChicos, porAreaDesc, porAreaAsc];
}

/** Cuántos ambientes cambiaron de posición respecto del orden preferido. */
function desvioDeOrden(preferido: InstanciaAmbiente[], candidato: InstanciaAmbiente[]): number {
  let d = 0;
  for (let i = 0; i < preferido.length; i++) if (preferido[i]!.id !== candidato[i]!.id) d++;
  return d;
}

const PESO_DESVIO_ORDEN = 0.4;

export function empaquetarBalanceado(
  ordenadas: InstanciaAmbiente[],
  filasObjetivo: number,
  aspecto = 1.2,
): RectanguloAmbiente[] {
  const n = ordenadas.length;
  if (n === 0) return [];

  const areaTotal = ordenadas.reduce((s, i) => s + i.area_m2, 0);
  // Ancho que da la proporción buscada: ancho × profundo = área, ancho/profundo = aspecto.
  const ancho = Math.sqrt(areaTotal * aspecto);

  if (n > MAX_AMBIENTES_PARTICION) return empaquetarEnFilas(ordenadas, ancho);

  let respaldo: FilaCalculada[] | null = null;
  let puntajeRespaldo = Infinity;

  // Si con la cantidad de bandas pedida no hay ninguna disposición sin
  // ambientes inutilizables, se prueba con menos: es preferible una casa de
  // dos bandas correctas que una de tres con un baño de 70 cm de fondo.
  for (let k = Math.min(filasObjetivo, n); k >= 1; k--) {
    let mejor: FilaCalculada[] | null = null;
    let mejorPuntaje = Infinity;

    for (const candidato of ordenesCandidatos(ordenadas)) {
      const desvio = desvioDeOrden(ordenadas, candidato) * PESO_DESVIO_ORDEN;
      for (const cortes of particiones(n, k)) {
        const limites = [0, ...cortes, n];
        const filas: FilaCalculada[] = [];
        for (let i = 0; i < limites.length - 1; i++) {
          filas.push(calcularFilaAnchoFijo(candidato.slice(limites[i]!, limites[i + 1]!), ancho));
        }
        const violaciones = filas.reduce((s, f) => s + f.violaciones, 0);
        // Entre las disposiciones válidas, preferir ambientes poco alargados.
        const alargamiento = filas.reduce((s, f) => {
          const peor = Math.max(
            ...f.ambientes.map(a => {
              const w = a.area_m2 / f.altura_m;
              return Math.max(w / f.altura_m, f.altura_m / w);
            }),
          );
          return s + peor;
        }, 0);
        const puntaje = violaciones * PENALIZACION_ANCHO_MINIMO + alargamiento + desvio;
        if (puntaje < mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejor = filas;
        }
      }
    }

    if (mejor && mejor.every(f => f.violaciones === 0)) return construirDesdeFilas(mejor);
    if (mejor && mejorPuntaje < puntajeRespaldo) {
      puntajeRespaldo = mejorPuntaje;
      respaldo = mejor;
    }
  }

  return respaldo ? construirDesdeFilas(respaldo) : empaquetarEnFilas(ordenadas, ancho);
}

export interface DimensionesEdificio {
  ancho_m: number;
  profundo_m: number;
  area_total_m2: number;
}

export function dimensionesDe(rects: RectanguloAmbiente[]): DimensionesEdificio {
  const ancho_m = Math.max(...rects.map(r => r.x_m + r.w_m));
  const profundo_m = Math.max(...rects.map(r => r.y_m + r.h_m));
  const area_total_m2 = Math.round(rects.reduce((s, r) => s + r.area_m2, 0) * 10) / 10;
  return { ancho_m: Math.round(ancho_m * 100) / 100, profundo_m: Math.round(profundo_m * 100) / 100, area_total_m2 };
}

/** Ancho objetivo de fila a partir del área bruta (con +10% por espesor de muros/circulación) y el aspecto deseado del edificio. */
export function anchoObjetivoDesdeAspecto(areaProgramaTotal_m2: number, aspectoEdificio: number): number {
  const areaBruta = areaProgramaTotal_m2 * 1.1;
  return Math.sqrt(areaBruta * aspectoEdificio);
}

