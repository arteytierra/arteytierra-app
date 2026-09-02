/**
 * El modo del mapa: qué está esperando el próximo clic.
 *
 * Antes eran doce `useState` sueltos (`modoZona`, `modoCuenca`, `modoViewshed`,
 * …). Son mutuamente excluyentes por naturaleza —un clic hace una sola cosa—
 * pero nada lo garantizaba: cada botón apagaba a mano los modos que su autor
 * tenía presentes, y varios no apagaban ninguno. Con dos prendidos a la vez, la
 * cadena de `if` del handler resolvía por orden de escritura y el modo de abajo
 * quedaba mudo: marcabas la cuenca, te ibas a dibujar una zona, y los clics se
 * los seguía comiendo la cuenca sin decir nada.
 *
 * Con una unión, "prender un modo" y "apagar los otros once" son la misma
 * operación, y el compilador exige tratar cada caso.
 */
import type { CategoriaZona } from '@/lib/zonificacion';
import type { TipoSector } from '@/lib/sectores';
import type { TipoDibujo } from '@/lib/dibujos';

export interface Punto { lat: number; lng: number }

/**
 * Las herramientas de dibujo libre. Además de las formas persistibles
 * (`TipoDibujo`) están las que existen sólo mientras se dibuja: `seleccion` no
 * crea nada —mueve y edita lo ya dibujado—, `medir` no persiste, y
 * `rectangulo` / `mano_libre` / `radio_accion` se guardan como polígono, línea
 * y círculo respectivamente.
 */
export type HerramientaDibujo =
  | TipoDibujo | 'seleccion' | 'medir' | 'rectangulo' | 'mano_libre' | 'radio_accion';

/**
 * `null` es el modo de reposo: el clic no hace nada sobre el terreno.
 *
 * Los modos con `vertices` son los que se dibujan clic a clic y se cierran a
 * mano; el resto se resuelve en un clic y vuelve solo a reposo.
 */
export type ModoMapa =
  | null
  | { k: 'mojon' }                                                    // agregar mojón (sólo en la pestaña Lugar)
  | { k: 'pin' }                                                      // colocar pin, suelto o de un bloque
  | { k: 'elemento' }                                                 // sellar el elemento activo, tantas veces como se quiera
  | { k: 'zona0' }                                                    // marcar la casa / edificio principal
  | { k: 'acceso' }                                                   // marcar la tranquera
  | { k: 'viewshed' }                                                 // parar el observador para la cuenca visual
  | { k: 'cuenca' }                                                   // marcar el punto de cierre de la cuenca
  | { k: 'arbol' }                                                    // plantar el árbol pendiente de sombras
  | { k: 'zona';    categoria: CategoriaZona; vertices: Punto[] }
  | { k: 'sector';  tipo: TipoSector;         vertices: Punto[] }
  | { k: 'camino';  proposito?: 'camino' | 'cortina'; vertices: Punto[] }
  | { k: 'dibujo';  tipo: HerramientaDibujo };

/** Los modos que se dibujan vértice a vértice. */
export type ModoConVertices = Extract<ModoMapa, { vertices: Punto[] }>;

export function tieneVertices(m: ModoMapa): m is ModoConVertices {
  return m !== null && 'vertices' in m;
}

/**
 * Si el cursor está "armado": el clic va a hacer algo sobre el terreno en vez
 * de seleccionar. `seleccion` es la excepción entre los dibujos — es la flecha,
 * no una herramienta de trazado.
 */
export function estaDibujando(m: ModoMapa): boolean {
  if (m === null) return false;
  if (m.k === 'dibujo') return m.tipo !== 'seleccion';
  return m.k !== 'mojon';
}

/**
 * Agrega un vértice al modo, si es de los que acumulan. Devuelve el mismo modo
 * cuando no lo es, para poder llamarlo sin preguntar antes.
 */
export function agregarVertice(m: ModoMapa, p: Punto): ModoMapa {
  return tieneVertices(m) ? { ...m, vertices: [...m.vertices, p] } : m;
}

/** Deshace el último vértice (Ctrl+Z mientras se dibuja). */
export function quitarUltimoVertice(m: ModoMapa): ModoMapa {
  return tieneVertices(m) ? { ...m, vertices: m.vertices.slice(0, -1) } : m;
}

/** Etiqueta para la barra de estado. `null` cuando no hay nada que anunciar. */
export function etiquetaModo(m: ModoMapa): string | null {
  if (m === null) return null;
  switch (m.k) {
    case 'zona':     return 'Dibujando zona';
    case 'sector':   return 'Dibujando sector';
    case 'camino':   return m.proposito === 'cortina' ? 'Trazando cortina' : 'Trazando camino';
    case 'pin':      return 'Colocando pin';
    case 'elemento': return 'Colocando elemento';
    case 'cuenca':   return 'Marcá el punto de cierre';
    case 'viewshed': return 'Marcá el punto de observación';
    case 'arbol':    return 'Colocando árbol';
    case 'zona0':    return 'Marcá la casa';
    case 'acceso':   return 'Marcá la tranquera';
    case 'mojon':    return 'Agregando mojones';
    case 'dibujo':   return m.tipo === 'seleccion' ? null : m.tipo === 'medir' ? 'Midiendo' : 'Dibujando';
  }
}
