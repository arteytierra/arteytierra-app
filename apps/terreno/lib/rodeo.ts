/**
 * El rodeo del predio: un solo número de hacienda para toda la app.
 *
 * Por qué existe. La misma hacienda se cargaba dos veces y en dos lugares que no
 * se hablaban: Producción estimaba la receptividad del campo (cuántos animales
 * aguanta el pasto) y Represa pedía a mano cuántas cabezas y cuántos litros por
 * cabeza para el balance del embalse. Nada garantizaba que fueran el mismo
 * rodeo, así que el agua se dimensionaba para 40 vacas mientras el pasto se
 * planificaba para 62 — y el usuario no tenía forma de notarlo.
 *
 * Ahora el rodeo vive una sola vez, acá, y las dos pestañas lo leen y lo
 * escriben. Producción sigue calculando la receptividad, pero como una
 * SUGERENCIA que se puede adoptar con un botón; si el productor sabe que tiene
 * 80 vacas, escribe 80 y eso es lo que usa el balance de la represa.
 *
 * El campo `origen` guarda cuál de las dos cosas está pasando, para poder
 * decirlo en pantalla y en el informe: un número sugerido por el modelo y uno
 * declarado por quien conoce el campo no valen lo mismo.
 *
 * ## Por qué ahora son LOTES y no un animal
 *
 * Un campo no se carga con «bovinos adultos»: se carga con 40 vacas con cría, 12
 * vaquillonas y 2 toros. Mientras el rodeo era un solo tipo con un solo
 * coeficiente, la app pedía que el productor promediara a mano su propia
 * hacienda antes de poder usarla — y ese promedio es justo la cuenta que
 * conviene que haga la máquina, porque es donde se equivoca la gente. Con lotes,
 * el EV del predio sale de sumar cada categoría con su coeficiente (ver
 * `categorias.ts`, que trae la tabla de AACREA con su fuente).
 *
 * La compatibilidad con los proyectos guardados es parte del contrato: un
 * `Rodeo` viejo (`animalId` + `cabezas` + `litros_animal_dia`) se lee como un
 * rodeo de un solo lote, y **se conserva el consumo de agua que el usuario tenía
 * escrito**. Lo que sí cambia al migrar es el coeficiente EV, porque el viejo no
 * tenía fuente y el nuevo sí: eso es la corrección, no un efecto colateral.
 */

import { categoriaPorId, type CategoriaAnimal } from './categorias';
import type { PerfilRodeo } from './produccion';

/** Un lote es un grupo de animales de la misma categoría. */
export interface LoteRodeo {
  /** Identificador propio del lote, para poder editar y borrar sin ambigüedad. */
  id: string;
  /** `id` de una fila de `CATEGORIAS`. */
  categoriaId: string;
  cabezas: number;
  /**
   * Litros por cabeza y día. `null` = usar el de la categoría.
   * Un número acá significa que el usuario lo pisó a mano y manda él.
   */
  litros_animal_dia: number | null;
}

export interface Rodeo {
  lotes: LoteRodeo[];
  /** Consumo de riego, en m³ por MES, que sale de la misma fuente de agua. */
  riego_m3_mes: number;
  /** `receptividad` = lo sugirió el cálculo de pasto; `manual` = lo cargó el usuario. */
  origen: 'receptividad' | 'manual';
}

let secuencia = 0;
export function nuevoLote(categoriaId = 'bovino_vaca_prom', cabezas = 0): LoteRodeo {
  secuencia += 1;
  return { id: `lote_${Date.now().toString(36)}_${secuencia}`, categoriaId, cabezas, litros_animal_dia: null };
}

export const RODEO_INICIAL: Rodeo = {
  lotes: [{ id: 'lote_inicial', categoriaId: 'bovino_vaca_prom', cabezas: 40, litros_animal_dia: null }],
  riego_m3_mes: 0,
  origen: 'manual',
};

/** La categoría de un lote, o la primera de la tabla si el id no existe. */
export function categoriaDe(lote: LoteRodeo): CategoriaAnimal | null {
  return categoriaPorId(lote.categoriaId);
}

/** Litros por cabeza y día que corresponden a un lote. */
export function litrosDe(lote: LoteRodeo): number {
  if (lote.litros_animal_dia !== null) return lote.litros_animal_dia;
  return categoriaDe(lote)?.agua_l_dia ?? 0;
}

export function cabezasTotal(rodeo: Rodeo): number {
  return rodeo.lotes.reduce((s, l) => s + Math.max(0, l.cabezas), 0);
}

/**
 * Equivalentes vaca del rodeo entero.
 *
 * Las categorías con `ev === null` quedan afuera a propósito: no cubren su
 * requerimiento con forraje, así que sumarlas a la carga del campo diría que
 * compiten por el pasto cuando no lo hacen. Siguen contando para el agua.
 */
export function evTotal(rodeo: Rodeo): number {
  const ev = rodeo.lotes.reduce((s, l) => {
    const c = categoriaDe(l);
    return c?.ev ? s + Math.max(0, l.cabezas) * c.ev : s;
  }, 0);
  return Math.round(ev * 100) / 100;
}

/** Cabezas que efectivamente pastorean (las que suman al EV). */
export function cabezasQuePastorean(rodeo: Rodeo): number {
  return rodeo.lotes.reduce((s, l) => (categoriaDe(l)?.ev ? s + Math.max(0, l.cabezas) : s), 0);
}

/**
 * EV promedio por cabeza del rodeo, sobre las cabezas que pastorean.
 *
 * Es el número que convierte una capacidad en EV en una capacidad en cabezas
 * **manteniendo la composición que el productor tiene**. Es la misma cuenta que
 * la fuente de AACREA hace al revés cuando dice que un rodeo de cría con su
 * reposición son 1,28 EV por vientre.
 *
 * Sin lotes que pastoreen devuelve 1 (una vaca), que es la unidad: así la
 * receptividad se expresa en EV y nunca divide por cero.
 */
export function evPorCabeza(rodeo: Rodeo): number {
  const n = cabezasQuePastorean(rodeo);
  if (n <= 0) return 1;
  return evTotal(rodeo) / n;
}

/** Sólo la hacienda, en litros por día — como lo dice Producción. */
export function aguaHacienda_l_dia(rodeo: Rodeo): number {
  return Math.round(rodeo.lotes.reduce((s, l) => s + Math.max(0, l.cabezas) * litrosDe(l), 0));
}

/**
 * Demanda mensual total de agua, en m³: hacienda más riego.
 * Es la unidad con la que trabaja el balance de la represa (`demandaMensual`).
 */
export function demandaMensual_m3(rodeo: Rodeo): number {
  const bebida = (aguaHacienda_l_dia(rodeo) * 30) / 1000;
  return Math.round((bebida + rodeo.riego_m3_mes) * 10) / 10;
}

/**
 * El rodeo visto desde la receptividad: los dos únicos números que
 * `calcularReceptividad` necesita saber de la hacienda.
 *
 * El agua es el promedio ponderado sobre TODAS las cabezas, incluidas las que no
 * pastorean, porque el cerdo toma agua igual. El EV es el promedio sobre las que
 * sí pastorean, porque es lo que divide la capacidad de pasto.
 */
export function perfilRodeo(rodeo: Rodeo): PerfilRodeo {
  const n = cabezasTotal(rodeo);
  return {
    ev_por_cabeza: evPorCabeza(rodeo),
    agua_l_dia: n > 0 ? aguaHacienda_l_dia(rodeo) / n : 0,
  };
}

/** Peso vivo total del rodeo, en kg. Lo pide la conversión a UG y el agua por temperatura. */
export function pesoVivoTotal_kg(rodeo: Rodeo): number {
  return Math.round(rodeo.lotes.reduce((s, l) => {
    const c = categoriaDe(l);
    return c ? s + Math.max(0, l.cabezas) * c.pesoVivo_kg : s;
  }, 0));
}

/**
 * Frase corta para explicar de dónde salió el rodeo. Se usa igual en las dos
 * pestañas, así que la respuesta es la misma mire donde mire el usuario.
 */
export function procedencia(rodeo: Rodeo): string {
  const n = cabezasTotal(rodeo);
  const lotes = rodeo.lotes.filter(l => l.cabezas > 0).length;
  const detalle = lotes === 1
    ? (categoriaDe(rodeo.lotes.find(l => l.cabezas > 0) ?? rodeo.lotes[0]!)?.nombre.toLowerCase() ?? 'animales')
    : `${lotes} lotes`;
  return rodeo.origen === 'receptividad'
    ? `${n} cabezas (${detalle}) sugeridas por la receptividad del campo (Producción).`
    : `${n} cabezas (${detalle}) cargadas a mano.`;
}

// ─── Compatibilidad con proyectos guardados ──────────────────────────────────

/**
 * Cómo se lee un `Rodeo` viejo.
 *
 * La tabla anterior tenía seis filas sin fuente; cada una se mapea a la categoría
 * equivalente de `categorias.ts`. Donde el nombre era ambiguo —«Bovinos
 * adultos»— se elige la fila que tenía el MISMO coeficiente EV, para que la carga
 * del campo no se mueva sin motivo:
 *
 *   bovino (1,00)   → Vaca de cría promedio anual (1,00)   mismo EV
 *   bovino_j (0,50) → Ternero de destete a 1 año (0,60)    sube: el 0,50 no tenía fuente
 *   equino (1,25)   → Equino adulto (1,20)                 baja: valor general del yeguarizo
 *   ovino (0,15)    → Oveja de cría (0,16)                 1 EO = 0,16 EV
 *   caprino (0,12)  → Caprinos (0,12)                      igual, y sigue sin fuente
 *   porcino (0,30)  → Porcinos (sin EV)                    sale de la carga del campo
 */
const MAPA_VIEJO: Record<string, string> = {
  bovino:   'bovino_vaca_prom',
  bovino_j: 'bovino_ternero',
  equino:   'equino_adulto',
  ovino:    'ovino_oveja',
  caprino:  'caprino',
  porcino:  'porcino',
};

/** La forma que tenía `Rodeo` antes de los lotes. */
interface RodeoViejo {
  animalId?: unknown;
  cabezas?: unknown;
  litros_animal_dia?: unknown;
  riego_m3_mes?: unknown;
  origen?: unknown;
}

function numero(v: unknown, porDefecto: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : porDefecto;
}

/**
 * Lee un rodeo venga de donde venga: de la forma nueva, de la vieja o de nada.
 *
 * Esto lo llama la restauración del proyecto. Romper un proyecto guardado es la
 * peor forma de arreglar un cálculo, así que la función no tira nunca: ante algo
 * irreconocible devuelve el rodeo inicial.
 */
export function migrarRodeo(v: unknown): Rodeo {
  if (!v || typeof v !== 'object') return RODEO_INICIAL;

  const o = v as RodeoViejo & Partial<Rodeo>;

  // Forma nueva: ya tiene lotes.
  if (Array.isArray(o.lotes)) {
    const lotes = o.lotes
      .filter((l): l is LoteRodeo => !!l && typeof l === 'object' && typeof (l as LoteRodeo).categoriaId === 'string')
      .map((l, i) => ({
        id: typeof l.id === 'string' && l.id ? l.id : `lote_migrado_${i}`,
        categoriaId: categoriaPorId(l.categoriaId) ? l.categoriaId : 'bovino_vaca_prom',
        cabezas: Math.max(0, Math.round(numero(l.cabezas, 0))),
        litros_animal_dia: typeof l.litros_animal_dia === 'number' && Number.isFinite(l.litros_animal_dia)
          ? l.litros_animal_dia : null,
      }));
    return {
      lotes: lotes.length > 0 ? lotes : RODEO_INICIAL.lotes,
      riego_m3_mes: Math.max(0, numero(o.riego_m3_mes, 0)),
      origen: o.origen === 'receptividad' ? 'receptividad' : 'manual',
    };
  }

  // Forma vieja: un solo animal.
  if (typeof o.animalId === 'string') {
    const categoriaId = MAPA_VIEJO[o.animalId] ?? 'bovino_vaca_prom';
    // El agua que el usuario tenía escrita se conserva tal cual: la corrección
    // de esta migración es el coeficiente de pasto, no el consumo declarado.
    const litros = numero(o.litros_animal_dia, NaN);
    return {
      lotes: [{
        id: 'lote_migrado',
        categoriaId,
        cabezas: Math.max(0, Math.round(numero(o.cabezas, 0))),
        litros_animal_dia: Number.isFinite(litros) ? litros : null,
      }],
      riego_m3_mes: Math.max(0, numero(o.riego_m3_mes, 0)),
      origen: o.origen === 'receptividad' ? 'receptividad' : 'manual',
    };
  }

  return RODEO_INICIAL;
}
