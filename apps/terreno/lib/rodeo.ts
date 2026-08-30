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
 */

import { TIPOS_ANIMAL, type TipoAnimal } from './produccion';

export interface Rodeo {
  /** id de `TIPOS_ANIMAL` (bovino, ovino, caprino…). */
  animalId: string;
  /** Cabezas del rodeo. */
  cabezas: number;
  /** Litros por cabeza y por día. Arranca en el valor de tabla del tipo. */
  litros_animal_dia: number;
  /** Consumo de riego, en m³ por MES, que sale de la misma fuente de agua. */
  riego_m3_mes: number;
  /** `receptividad` = lo sugirió el cálculo de pasto; `manual` = lo cargó el usuario. */
  origen: 'receptividad' | 'manual';
}

export function animalDe(rodeo: Rodeo): TipoAnimal {
  return TIPOS_ANIMAL.find(a => a.id === rodeo.animalId) ?? TIPOS_ANIMAL[0]!;
}

export const RODEO_INICIAL: Rodeo = {
  animalId: 'bovino',
  cabezas: 40,
  litros_animal_dia: TIPOS_ANIMAL[0]!.agua_l_dia,
  riego_m3_mes: 0,
  origen: 'manual',
};

/**
 * Cambiar el tipo de animal arrastra su consumo de tabla, salvo que el usuario
 * ya lo haya pisado a mano: pasar de bovinos a ovinos y quedarse con 50 L/día
 * por cabeza sería un error silencioso de un orden de magnitud.
 */
export function cambiarAnimal(rodeo: Rodeo, animalId: string): Rodeo {
  const nuevo = TIPOS_ANIMAL.find(a => a.id === animalId) ?? TIPOS_ANIMAL[0]!;
  const anterior = animalDe(rodeo);
  const seguiaEnTabla = Math.abs(rodeo.litros_animal_dia - anterior.agua_l_dia) < 0.5;
  return {
    ...rodeo,
    animalId: nuevo.id,
    litros_animal_dia: seguiaEnTabla ? nuevo.agua_l_dia : rodeo.litros_animal_dia,
  };
}

/**
 * Demanda mensual total de agua, en m³: hacienda más riego.
 * Es la unidad con la que trabaja el balance de la represa (`demandaMensual`).
 */
export function demandaMensual_m3(rodeo: Rodeo): number {
  const bebida = (rodeo.cabezas * rodeo.litros_animal_dia * 30) / 1000;
  return Math.round((bebida + rodeo.riego_m3_mes) * 10) / 10;
}

/** Sólo la hacienda, en litros por día — como lo dice Producción. */
export function aguaHacienda_l_dia(rodeo: Rodeo): number {
  return Math.round(rodeo.cabezas * rodeo.litros_animal_dia);
}

/**
 * Frase corta para explicar de dónde salió el número de cabezas. Se usa igual en
 * las dos pestañas, así que la respuesta es la misma mire donde mire el usuario.
 */
export function procedencia(rodeo: Rodeo): string {
  const a = animalDe(rodeo);
  return rodeo.origen === 'receptividad'
    ? `${rodeo.cabezas} ${a.nombre.toLowerCase()} sugeridos por la receptividad del campo (Producción).`
    : `${rodeo.cabezas} ${a.nombre.toLowerCase()} cargados a mano.`;
}
