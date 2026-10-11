/**
 * Archivo de represas calculadas dentro de un mismo proyecto.
 *
 * POR QUÉ EXISTE
 *
 * La pestaña Represa calcula **una** represa: elegís el espejo, el nivel, el
 * lado del muro, y salen la capacidad, el terraplén y el balance de tierra.
 * Cambiar cualquiera de esas cuatro cosas recalcula arriba de lo anterior, así
 * que comparar dos emplazamientos obligaba a anotar los números en un papel
 * antes de tocar nada. Y comparar es justamente el trabajo: un predio tiene
 * tres o cuatro cuellos de botella donde se podría cerrar un muro, y lo que
 * decide no es si cada uno "da", es cuál da más agua por metro cúbico de tierra
 * movida. `cuencasGuardadas.ts` resolvió lo mismo para la cuenca de aporte y
 * esta capa es su hermana: mismo formato, mismas operaciones.
 *
 * QUÉ SE GUARDA Y QUÉ NO
 *
 * Se guardan **los inputs** —con eso el cálculo se reproduce entero— y una
 * **ficha** chica con los resultados que se comparan entre candidatos. No se
 * guardan ni la grilla de elevación ni el `ResultadoEmbalse` completo: la
 * grilla pesa megas, se descarta al cambiar de pestaña y se vuelve a pedir, y
 * multiplicarla por N represas engordaría el proyecto sin que nadie la lea. Al
 * abrir una archivada se restauran los inputs y el panel recalcula.
 *
 * La ficha es una foto, no una fuente de verdad: si mañana cambia el criterio
 * de ancho de corona, los números guardados siguen siendo los de ayer. Por eso
 * cada una lleva `creada`, y por eso el panel muestra la fecha al listarlas.
 */
import type { RepresaInputs } from './represa';

/**
 * Los resultados que distinguen a un emplazamiento de otro. Todo en unidades de
 * obra: metros, metros cúbicos, hectáreas.
 */
export interface FichaRepresa {
  /** Cota del pelo de agua (m). */
  nivel_m:          number;
  /** Agua embalsada, incluida la que se gana al excavar el préstamo (m³). */
  capacidad_m3:     number;
  area_espejo_m2:   number;
  prof_max_m:       number;
  /** Altura máxima del muro, en la sección más honda (m). */
  alturaMuro_m:     number;
  largoMuro_m:      number;
  /** Terraplén compactado en obra, muro y zanja (m³). */
  compactado_m3:    number;
  /** Tierra a excavar medida en sitio, antes de contraer (m³). */
  banco_m3:         number;
  /** m³ de agua por m³ de tierra en banco. Es el número que ordena candidatos. */
  eficiencia:       number;
  /** `false` cuando el balance de tierra no cierra para este nivel. */
  viable:           boolean;
  /** `true` si el muro se integró sobre el perfil real del terreno del eje. */
  perfilUsado:      boolean;
  /**
   * Los dos de la simulación anual, que sólo existen si el proyecto tiene clima
   * y demanda cargados. `undefined` significa "no se simuló", no "dio cero".
   */
  confiabilidad_pct?: number;
  cuenca_ha?:         number;
}

export interface RepresaGuardada {
  id:      string;
  nombre:  string;
  /** ISO. La ficha es una foto de ese día: ver el docstring del módulo. */
  creada:  string;
  /** Con qué se calculó. Alcanza para reproducir todo. */
  inputs:  RepresaInputs;
  /** Qué dio. */
  ficha:   FichaRepresa;
  /**
   * Cómo se llamaba el polígono del espejo al guardar. Se copia a propósito:
   * el polígono se puede borrar o renombrar después, y entonces la archivada
   * queda sin poder abrirse. Mejor decir de cuál era que mostrar un hueco.
   */
  poligonoNombre: string;
}

export function crearRepresaGuardada(
  inputs:         RepresaInputs,
  ficha:          FichaRepresa,
  poligonoNombre: string,
  existentes:     RepresaGuardada[],
): RepresaGuardada {
  return {
    id:     crypto.randomUUID(),
    nombre: nombreLibre(existentes),
    creada: new Date().toISOString(),
    inputs,
    ficha,
    poligonoNombre,
  };
}

/** "Represa 1", "Represa 2"… salteando los números que ya están tomados. */
function nombreLibre(existentes: RepresaGuardada[]): string {
  const usados = new Set(existentes.map(r => r.nombre));
  for (let n = 1; n <= existentes.length + 1; n++) {
    const nombre = `Represa ${n}`;
    if (!usados.has(nombre)) return nombre;
  }
  return `Represa ${existentes.length + 1}`;
}

/**
 * ¿Esta represa ya está archivada?
 *
 * Son el mismo escenario cuando coinciden el espejo, el lado del muro y la
 * geometría del muro, **y el nivel de agua a cinco centímetros**. El nivel es lo
 * que se mueve con el deslizador para buscar el punto donde el sitio rinde
 * mejor, así que dos niveles distintos del mismo cuello son dos candidatos y
 * valen archivados aparte. Lo que no tiene que duplicar nada es apretar
 * «Guardar» dos veces seguidas.
 *
 * La tolerancia es **medio paso del deslizador**, que se mueve de a 0,1 m. Con
 * un paso entero, dos posiciones vecinas del deslizador se daban por el mismo
 * escenario y la segunda no se podía archivar.
 */
export function yaArchivada(
  inputs:     RepresaInputs,
  existentes: RepresaGuardada[],
): RepresaGuardada | null {
  return existentes.find(r =>
    r.inputs.poligonoId   === inputs.poligonoId &&
    r.inputs.muroIdx      === inputs.muroIdx &&
    r.inputs.tipoMuro     === inputs.tipoMuro &&
    r.inputs.anchoCorona  === inputs.anchoCorona &&
    r.inputs.taludInterno === inputs.taludInterno &&
    r.inputs.taludExterno === inputs.taludExterno &&
    r.inputs.revancha     === inputs.revancha &&
    r.inputs.longMuro     === inputs.longMuro &&
    r.inputs.nivel !== null && inputs.nivel !== null &&
    Math.abs(r.inputs.nivel - inputs.nivel) < 0.05
  ) ?? null;
}

/**
 * Una línea con lo que distingue a esta represa de las otras. Son los tres
 * números con los que se elige un emplazamiento: cuánta agua, cuánto muro, y
 * cuánta agua por tierra movida.
 */
export function resumenRepresa(r: RepresaGuardada): string {
  const { ficha } = r;
  const agua = ficha.capacidad_m3.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const ef   = ficha.eficiencia.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return `${agua} m³ · muro ${ficha.alturaMuro_m.toLocaleString('es-AR', { maximumFractionDigits: 1 })} × ${Math.round(ficha.largoMuro_m)} m · ${ef} m³ agua/m³ tierra`;
}

/**
 * Las archivadas ordenadas por eficiencia, de mayor a menor: el mejor
 * emplazamiento primero.
 *
 * Ordenar por eficiencia y no por capacidad es la decisión de fondo. El muro
 * más grande casi siempre embalsa más agua; lo que no es obvio —y es lo que
 * decide la obra— es cuál de los sitios la embalsa con menos movimiento de
 * suelo. Las no viables van al final, cualquiera sea su eficiencia.
 */
export function porEficiencia(guardadas: RepresaGuardada[]): RepresaGuardada[] {
  return [...guardadas].sort((a, b) => {
    if (a.ficha.viable !== b.ficha.viable) return a.ficha.viable ? -1 : 1;
    return b.ficha.eficiencia - a.ficha.eficiencia;
  });
}

/**
 * Lee una lista archivada de un proyecto guardado sin tirar nunca.
 *
 * Un proyecto guardado antes de que esta capa existiera no trae la clave, y uno
 * guardado por una versión futura puede traer campos que acá no se conocen.
 * Ninguna de las dos cosas puede impedir que el proyecto se abra: se descarta
 * la fila que no se entiende y se conservan las demás.
 */
export function migrarRepresasGuardadas(v: unknown): RepresaGuardada[] {
  if (!Array.isArray(v)) return [];
  return v.filter((r): r is RepresaGuardada => {
    if (!r || typeof r !== 'object') return false;
    const o = r as Record<string, unknown>;
    return typeof o['id'] === 'string'
      && typeof o['nombre'] === 'string'
      && !!o['inputs'] && typeof o['inputs'] === 'object'
      && !!o['ficha']  && typeof o['ficha']  === 'object'
      && typeof (o['ficha'] as Record<string, unknown>)['capacidad_m3'] === 'number';
  });
}
