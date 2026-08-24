/**
 * Amoblamiento esquemático por tipo de ambiente.
 *
 * Bloques estándar en metros, ubicados dentro del rectángulo del ambiente.
 * Sirven para verificar que el ambiente *funciona* (que la cama entra, que
 * queda paso alrededor de la mesa) — no son diseño de interiores. Si el
 * ambiente es más chico que el mueble, el mueble simplemente no se dibuja:
 * esa ausencia es en sí un dato de que el ambiente quedó corto.
 */
import type { TipoAmbiente } from '../tipos';
import type { RectanguloAmbiente } from './layout';

export interface Mueble {
  /** Coordenadas absolutas en metros, en el mismo sistema que los ambientes. */
  x_m: number;
  y_m: number;
  w_m: number;
  h_m: number;
  forma: 'rect' | 'elipse';
  etiqueta?: string;
}

const HOLGURA = 0.1; // separación del mueble respecto del muro

/** Coloca un mueble contra el muro superior del ambiente, centrado horizontalmente. */
function contraMuroSuperior(r: RectanguloAmbiente, w: number, h: number, etiqueta?: string): Mueble | null {
  if (w + HOLGURA * 2 > r.w_m || h + HOLGURA * 2 > r.h_m) return null;
  return {
    x_m: r.x_m + (r.w_m - w) / 2,
    y_m: r.y_m + HOLGURA,
    w_m: w,
    h_m: h,
    forma: 'rect',
    etiqueta,
  };
}

/** Coloca un mueble en una esquina del ambiente. */
function enEsquina(
  r: RectanguloAmbiente,
  w: number,
  h: number,
  esquina: 'ne' | 'no' | 'se' | 'so',
  etiqueta?: string,
  forma: 'rect' | 'elipse' = 'rect',
): Mueble | null {
  if (w + HOLGURA > r.w_m || h + HOLGURA > r.h_m) return null;
  const x = esquina === 'no' || esquina === 'so' ? r.x_m + HOLGURA : r.x_m + r.w_m - w - HOLGURA;
  const y = esquina === 'no' || esquina === 'ne' ? r.y_m + HOLGURA : r.y_m + r.h_m - h - HOLGURA;
  return { x_m: x, y_m: y, w_m: w, h_m: h, forma, etiqueta };
}

/** Coloca un mueble centrado en el ambiente. */
function centrado(r: RectanguloAmbiente, w: number, h: number, etiqueta?: string, forma: 'rect' | 'elipse' = 'rect'): Mueble | null {
  if (w + HOLGURA * 2 > r.w_m || h + HOLGURA * 2 > r.h_m) return null;
  return {
    x_m: r.x_m + (r.w_m - w) / 2,
    y_m: r.y_m + (r.h_m - h) / 2,
    w_m: w,
    h_m: h,
    forma,
    etiqueta,
  };
}

/** Corre una franja de mueble a lo largo de un muro (mesada, placard, banco). */
function franja(
  r: RectanguloAmbiente,
  profundidad: number,
  lado: 'norte' | 'sur' | 'este' | 'oeste',
  fraccionLargo: number,
  etiqueta?: string,
): Mueble | null {
  const horizontal = lado === 'norte' || lado === 'sur';
  const largoDisponible = horizontal ? r.w_m : r.h_m;
  const largo = largoDisponible * fraccionLargo;
  if (profundidad + HOLGURA > (horizontal ? r.h_m : r.w_m) || largo < 0.6) return null;

  if (horizontal) {
    return {
      x_m: r.x_m + HOLGURA,
      y_m: lado === 'norte' ? r.y_m + HOLGURA : r.y_m + r.h_m - profundidad - HOLGURA,
      w_m: largo,
      h_m: profundidad,
      forma: 'rect',
      etiqueta,
    };
  }
  return {
    x_m: lado === 'oeste' ? r.x_m + HOLGURA : r.x_m + r.w_m - profundidad - HOLGURA,
    y_m: r.y_m + HOLGURA,
    w_m: profundidad,
    h_m: largo,
    forma: 'rect',
    etiqueta,
  };
}

function noNulos(items: Array<Mueble | null>): Mueble[] {
  return items.filter((m): m is Mueble => m !== null);
}

/**
 * Devuelve el amoblamiento de un ambiente ya posicionado en planta.
 * `esPrincipal` distingue el dormitorio principal (cama de dos plazas) del resto.
 */
export function mobiliarioDe(r: RectanguloAmbiente): Mueble[] {
  const tipo: TipoAmbiente = r.tipo;
  const esPrincipal = /principal/i.test(r.nombre) || r.area_m2 >= 14;

  switch (tipo) {
    case 'dormitorio': {
      // Cama de 2 plazas 1,40×1,90; individual 0,90×1,90.
      const camaW = esPrincipal ? 1.4 : 0.9;
      const cama = contraMuroSuperior(r, camaW, 1.9, 'cama');
      const placard = franja(r, 0.6, 'sur', 0.7, 'placard');
      return noNulos([cama, placard]);
    }

    case 'bano': {
      const inodoro = enEsquina(r, 0.4, 0.6, 'no', 'in.');
      const lavatorio = enEsquina(r, 0.5, 0.4, 'ne', 'lav.');
      const ducha = enEsquina(r, 0.9, 0.9, 'se', 'ducha');
      return noNulos([inodoro, lavatorio, ducha]);
    }

    case 'estar-cocina-comedor': {
      // Mesada en L sobre un muro, mesa de comedor y estar.
      const mesada = franja(r, 0.6, 'norte', 0.45, 'mesada');
      const mesa = centrado(r, Math.min(1.6, r.w_m * 0.35), Math.min(0.9, r.h_m * 0.3), 'comedor');
      const sofa = franja(r, 0.85, 'sur', 0.4, 'estar');
      return noNulos([mesada, mesa, sofa]);
    }

    case 'estudio': {
      const escritorio = franja(r, 0.65, 'norte', 0.7, 'escritorio');
      const biblioteca = franja(r, 0.35, 'sur', 0.6, 'biblioteca');
      return noNulos([escritorio, biblioteca]);
    }

    case 'lavadero': {
      const lavarropas = enEsquina(r, 0.6, 0.6, 'no', 'lav.');
      const pileta = enEsquina(r, 0.6, 0.5, 'ne', 'pileta');
      return noNulos([lavarropas, pileta]);
    }

    case 'despensa':
      return noNulos([franja(r, 0.4, 'norte', 0.9, 'estantería'), franja(r, 0.4, 'sur', 0.9)]);

    case 'garage': {
      // Auto tipo 4,50×1,80.
      const auto = centrado(r, 1.8, 4.5, 'vehículo') ?? centrado(r, 4.5, 1.8, 'vehículo');
      return noNulos([auto]);
    }

    case 'taller':
      return noNulos([franja(r, 0.7, 'norte', 0.8, 'banco de trabajo'), franja(r, 0.5, 'sur', 0.5, 'estantería')]);

    case 'invernadero':
      // Canteros paralelos con pasillo central.
      return noNulos([franja(r, 0.8, 'norte', 0.95, 'cantero'), franja(r, 0.8, 'sur', 0.95, 'cantero')]);

    case 'biofiltro':
      // Lecho filtrante con flujo; se representa como una masa única.
      return noNulos([centrado(r, r.w_m * 0.8, r.h_m * 0.7, 'lecho filtrante')]);

    case 'galeria':
      return noNulos([centrado(r, Math.min(1.4, r.w_m * 0.4), Math.min(0.8, r.h_m * 0.5), 'mesa', 'elipse')]);

    case 'hall':
      return noNulos([franja(r, 0.35, 'norte', 0.5, 'guardado')]);

    case 'otro':
    default:
      return [];
  }
}
