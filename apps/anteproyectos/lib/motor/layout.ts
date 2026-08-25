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

export function anchoMinimoDe(tipo: TipoAmbiente): number {
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

/**
 * Ambientes que pueden apilarse en columna dentro de una banda.
 *
 * Son los chicos de servicio. Sin apilar, todo ambiente ocupa el alto completo
 * de su banda, así que un baño de 5 m² en una banda de 4 m de fondo sale de
 * 1,25 m de ancho: una tira, no un baño. Y como el motor prioriza que ningún
 * ambiente quede inutilizable, esa restricción terminaba dictando la planta y
 * los tres perfiles convergían al mismo esquema.
 *
 * Apilados —baño arriba, hall abajo, compartiendo una columna— los dos quedan
 * anchos y la banda queda libre para tener el fondo que el partido pide. Es lo
 * que hace cualquier planta real con el núcleo húmedo.
 */
const TIPOS_APILABLES = new Set<TipoAmbiente>(['bano', 'lavadero', 'despensa', 'hall', 'biofiltro']);

/** Una celda de la banda: un ambiente a todo el alto, o dos apilados. */
interface Celda {
  ambientes: InstanciaAmbiente[];
  ancho_m: number;
}

interface FilaCalculada {
  celdas: Celda[];
  altura_m: number;
  ancho_m: number;
  violaciones: number;
  /** Peor proporción largo/ancho de la banda, para desempatar entre válidas. */
  alargamiento: number;
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
function celdasDe(grupo: InstanciaAmbiente[], altura_m: number, apilar: boolean): Celda[] {
  const celdas: Celda[] = [];
  for (let i = 0; i < grupo.length; i++) {
    const a = grupo[i]!;
    const b = grupo[i + 1];
    if (apilar && b && TIPOS_APILABLES.has(a.tipo) && TIPOS_APILABLES.has(b.tipo)) {
      celdas.push({ ambientes: [a, b], ancho_m: (a.area_m2 + b.area_m2) / altura_m });
      i++;
    } else {
      celdas.push({ ambientes: [a], ancho_m: a.area_m2 / altura_m });
    }
  }
  return celdas;
}

function evaluarFila(grupo: InstanciaAmbiente[], ancho_m: number, apilar: boolean): FilaCalculada {
  const areaFila = grupo.reduce((s, a) => s + a.area_m2, 0);
  const altura_m = areaFila / ancho_m;
  const celdas = celdasDe(grupo, altura_m, apilar);

  let violaciones = altura_m < ALTURA_MIN_FILA_M ? 1 : 0;
  let alargamiento = 0;
  for (const celda of celdas) {
    const areaCelda = celda.ambientes.reduce((s, a) => s + a.area_m2, 0);
    for (const amb of celda.ambientes) {
      // Los apilados se reparten el alto de la banda en proporción a su área.
      const alto = altura_m * (amb.area_m2 / areaCelda);
      if (Math.min(celda.ancho_m, alto) < anchoMinimoDe(amb.tipo)) violaciones++;
      alargamiento = Math.max(alargamiento, Math.max(celda.ancho_m / alto, alto / celda.ancho_m));
    }
  }
  return { celdas, altura_m, ancho_m, violaciones, alargamiento };
}

function calcularFilaAnchoFijo(grupo: InstanciaAmbiente[], ancho_m: number): FilaCalculada {
  const plana = evaluarFila(grupo, ancho_m, false);
  const apilada = evaluarFila(grupo, ancho_m, true);
  // Apilar sólo cuando resuelve algo: no se complica una banda que ya andaba.
  return apilada.violaciones < plana.violaciones ? apilada : plana;
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
    for (const celda of fila.celdas) {
      const areaCelda = celda.ambientes.reduce((s, a) => s + a.area_m2, 0);
      let cursorYCelda = cursorY;
      for (const amb of celda.ambientes) {
        const alto = fila.altura_m * (amb.area_m2 / areaCelda);
        rects.push({
          ...amb,
          x_m: Math.round(cursorX * 100) / 100,
          y_m: Math.round(cursorYCelda * 100) / 100,
          w_m: Math.round(celda.ancho_m * 100) / 100,
          h_m: Math.round(alto * 100) / 100,
          fila: indice,
          exteriorNorte: false,
          exteriorSur: false,
          exteriorEste: false,
          exteriorOeste: false,
        });
        cursorYCelda += alto;
      }
      cursorX += celda.ancho_m;
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

export interface OpcionesEmpaquetado {
  /**
   * Cuánto pesa apartarse del orden recibido, por ambiente desplazado.
   *
   * El orden es la decisión de partido del perfil, no una sugerencia: con el
   * peso por defecto el optimizador probaba cuatro ordenamientos alternativos
   * y elegía por proporción, así que los tres perfiles convergían a la misma
   * planta y las "tres opciones" eran una sola repetida.
   *
   * Pero imponerlo a rajatabla tampoco sirve: el orden zonificado deja el baño
   * pegado al estar y, compartiendo banda, el baño sale de 1,2 m. Por eso es
   * una preferencia fuerte y no una imposición — pesa mucho más que la
   * proporción y mucho menos que un ambiente inutilizable, así que el partido
   * del perfil gana siempre que se pueda habitar.
   */
  pesoOrden?: number;
}

const PESO_DESVIO_ORDEN = 0.4;

export function empaquetarBalanceado(
  ordenadas: InstanciaAmbiente[],
  filasObjetivo: number,
  aspecto = 1.2,
  opciones: OpcionesEmpaquetado = {},
): RectanguloAmbiente[] {
  const pesoOrden = opciones.pesoOrden ?? PESO_DESVIO_ORDEN;
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
      const desvio = desvioDeOrden(ordenadas, candidato) * pesoOrden;
      for (const cortes of particiones(n, k)) {
        const limites = [0, ...cortes, n];
        const filas: FilaCalculada[] = [];
        for (let i = 0; i < limites.length - 1; i++) {
          filas.push(calcularFilaAnchoFijo(candidato.slice(limites[i]!, limites[i + 1]!), ancho));
        }
        const violaciones = filas.reduce((s, f) => s + f.violaciones, 0);
        // Entre las disposiciones válidas, preferir ambientes poco alargados.
        const alargamiento = filas.reduce((s, f) => s + f.alargamiento, 0);
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


/** Ambientes servidos: los que se habitan y merecen la mejor orientación. */
const AMBIENTES_SERVIDOS = new Set<TipoAmbiente>([
  'dormitorio',
  'estar-cocina-comedor',
  'estudio',
  'taller',
  'galeria',
  'invernadero',
]);

/**
 * Zonificación térmica: separa ambientes servidos de servidores para que los
 * servicios formen una banda continua sobre la cara castigada del edificio.
 *
 * Es el partido bioclimático clásico —servidos hacia el ecuador, servidores
 * como colchón hacia el lado frío o hacia el poniente— y es lo que hace que
 * este perfil se lea distinto de los otros dos: los baños, el lavadero y el
 * hall quedan juntos en un lado en vez de repartidos por la planta.
 *
 * Dentro de cada grupo se conserva el orden por adyacencia, para no romper las
 * cercanías que pidió la familia.
 */
export function ordenarPorZonificacionTermica(
  instancias: InstanciaAmbiente[],
  servidosPrimero: boolean,
): InstanciaAmbiente[] {
  const porAdyacencia = ordenarPorAdyacencia(instancias);
  const servidos = porAdyacencia.filter(i => AMBIENTES_SERVIDOS.has(i.tipo));
  const servidores = porAdyacencia.filter(i => !AMBIENTES_SERVIDOS.has(i.tipo));
  return servidosPrimero ? [...servidos, ...servidores] : [...servidores, ...servidos];
}
