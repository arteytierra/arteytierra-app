/**
 * Cierre de un trazo en curso: convertir los vértices acumulados en un
 * `ElementoDibujo` del documento.
 *
 * Antes esto era una cadena de `if` dentro del componente, y cada rama repetía
 * su propia condición de largo (`>= 2`, `>= 3`, `=== 2`). El problema no era la
 * repetición sino lo que pasaba cuando ninguna rama daba: el handler igual
 * vaciaba los vértices, así que cerrar un polígono con dos puntos —o una cota
 * con tres— borraba el trazo sin crear nada y sin decir por qué. El usuario veía
 * desaparecer su trabajo y no tenía forma de saber que le faltaba un clic.
 *
 * Acá el mínimo de cada tipo se declara una vez, `motivoNoCierra` dice en
 * castellano qué falta, y `cerrarDibujo` sólo construye cuando puede: el
 * llamador conserva los vértices si le devuelve `null`.
 */
import type { TipoDibujo, ElementoDibujo, DibujoEnCurso } from '@/lib/dibujos';
import { distanciaMetros } from '@/lib/dibujos';

/**
 * Cuántos vértices necesita cada tipo para existir.
 *
 * `punto` y `texto` se colocan de un clic y nunca pasan por un trazo en curso;
 * están acá para que el registro cubra el tipo completo y agregar una forma
 * nueva obligue a decidir su mínimo.
 */
export const VERTICES_MINIMOS: Record<TipoDibujo, number> = {
  linea:    2,
  curva:    2,
  poligono: 3,
  circulo:  2,   // centro + un punto del borde
  cota:     2,   // los dos extremos de la medida
  flecha:   2,   // origen + punta
  punto:    1,
  texto:    1,
};

/** Los tipos que se dibujan acumulando clics. */
export type TipoTrazo = Exclude<TipoDibujo, 'punto' | 'texto'>;

export function esTrazo(t: TipoDibujo): t is TipoTrazo {
  return t !== 'punto' && t !== 'texto';
}

const NOMBRE_FORMA: Record<TipoTrazo, string> = {
  linea:    'Una línea',
  curva:    'Una curva',
  poligono: 'Un polígono',
  circulo:  'Un círculo',
  cota:     'Una cota',
  flecha:   'Una flecha',
};

export function puedeCerrar(d: DibujoEnCurso): boolean {
  return esTrazo(d.tipo) && d.vertices.length >= VERTICES_MINIMOS[d.tipo];
}

/**
 * Por qué no se puede cerrar todavía, en palabras que sirvan en pantalla.
 * `null` cuando sí se puede.
 */
export function motivoNoCierra(d: DibujoEnCurso): string | null {
  if (!esTrazo(d.tipo)) return 'Esta forma se coloca con un solo clic.';
  const min   = VERTICES_MINIMOS[d.tipo];
  const faltan = min - d.vertices.length;
  if (faltan <= 0) return null;
  const puestos = d.vertices.length === 0
    ? 'todavía no marcaste ninguno'
    : d.vertices.length === 1 ? 'marcaste 1' : `marcaste ${d.vertices.length}`;
  const pide = min === 1 ? '1 punto' : `${min} puntos`;
  return `${NOMBRE_FORMA[d.tipo]} necesita ${pide}: ${puestos}.`;
}

/**
 * Lo que el trazo no puede saber de sí mismo: quién lo va a firmar y con qué
 * apariencia. El polígono admite dos disfraces —el sello de un elemento del
 * catálogo, o un espejo de agua— y en ambos casos el color y la opacidad los
 * manda el disfraz, no la paleta de dibujo.
 */
export interface ContextoCierre {
  id:      string;
  color:   string;
  capaId?: string;
  elementoPoli?: { color: string; opacidad: number; emoji?: string; nombre?: string } | null;
  /** Nombre ya numerado del espejo («Espejo de agua 3»); lo cuenta el llamador. */
  nombreEspejo?: string | null;
}

/**
 * Construye el elemento, o `null` si al trazo todavía le faltan vértices.
 *
 * Devolver `null` en vez de lanzar es a propósito: el llamador tiene que poder
 * preguntar sin romper, y `motivoNoCierra` le da el texto para explicar.
 */
export function cerrarDibujo(d: DibujoEnCurso, ctx: ContextoCierre): ElementoDibujo | null {
  if (!puedeCerrar(d)) return null;

  const { id, color, capaId } = ctx;
  const verts = d.vertices;

  switch (d.tipo as TipoTrazo) {
    case 'linea':
      return { id, tipo: 'linea', color, vertices: verts, grosor: 3, capaId };

    case 'curva':
      return { id, tipo: 'curva', color, vertices: verts, grosor: 3, capaId };

    case 'flecha':
      return { id, tipo: 'flecha', color, vertices: verts, grosor: 3, capaId };

    case 'poligono': {
      const el = ctx.elementoPoli;
      if (el) {
        return {
          id, tipo: 'poligono', vertices: verts, capaId,
          color: el.color, opacidad: el.opacidad, simbolo: el.emoji, nombre: el.nombre,
        };
      }
      if (ctx.nombreEspejo) {
        return { id, tipo: 'poligono', vertices: verts, capaId, color: '#1E88E5', opacidad: 0.42, nombre: ctx.nombreEspejo };
      }
      return { id, tipo: 'poligono', vertices: verts, capaId, color, opacidad: 0.22 };
    }

    // Estos dos se definen con dos puntos. Antes exigían exactamente dos y
    // descartaban el trazo si había más; ahora toman los dos primeros, que son
    // los que el usuario marcó primero y los que la forma necesita.
    case 'circulo': {
      const [a, b] = verts as [{ lat: number; lng: number }, { lat: number; lng: number }];
      return {
        id, tipo: 'circulo', color, capaId,
        lat: a.lat, lng: a.lng,
        radio: distanciaMetros(a.lat, a.lng, b.lat, b.lng),
        opacidad: 0.18,
      };
    }

    case 'cota':
      return { id, tipo: 'cota', color, capaId, vertices: verts.slice(0, 2) };
  }
}

/**
 * Cuántos vértices le faltan al trazo para poder cerrarse (0 si ya puede).
 *
 * Es el mismo dato que `motivoNoCierra` cuenta en palabras, pero en número: el
 * banner del mapa lo necesita para no prometer «Enter finaliza» antes de tiempo.
 */
export function faltanVertices(d: DibujoEnCurso): number {
  return Math.max(0, VERTICES_MINIMOS[d.tipo] - d.vertices.length);
}
