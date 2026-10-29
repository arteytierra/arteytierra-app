/**
 * El dato de la pieza C del encargo 04 — el informe.
 *
 * Sale de `generado/cuetiepa-informe.json`, que escribe
 * `apps/terreno/scripts/datos-informe.ts` llamando a `calcularMetricas`,
 * `obtenerClima` y `obtenerSuelo` sobre los mismos siete mojones que las piezas
 * aprobadas. Acá no se calcula nada: se lee y se formatea.
 *
 * Cada fila del JSON trae DOS orígenes: `fuente`, que es la forma genérica que
 * usa la landing y es la que se dibuja, y `fuente_real`, que es el proveedor
 * con nombre y apellido como aparecería en el informe de verdad. El segundo no
 * se muestra nunca; está para poder comprobar que el primero no cambió ningún
 * dato, que es la diferencia entre anonimizar una fuente y borrarla.
 */
import crudo from '../../../generado/cuetiepa-informe.json';

export interface FilaInforme {
  dato: string; valor: string;
  fuente: string; fuente_real: string;
  fecha: string; resolucion: string;
}

interface Crudo {
  predio: string;
  titulo: string;
  fecha: string;
  mojones: Array<{ lat: number; lng: number }>;
  metricas: { area_ha: number; area_m2: number; perimetro_m: number; mojones: number };
  topo: Record<string, unknown>;
  koppen: { codigo: string; grupo: string; descripcion: string } | null;
  clima: Record<string, unknown>;
  suelo: Record<string, unknown> | null;
  indice: Array<{ n: number; titulo: string }>;
  filas: FilaInforme[];
  anexo: Array<{ rubro: string; texto: string }>;
  limites: string;
  bitacora_red: string[];
}

const D = crudo as unknown as Crudo;

/** Punto de miles y coma decimal: las dos reglas del castellano, juntas. */
const num = (x: number, dec = 0) =>
  x.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fechaLarga = (() => {
  try {
    return new Date(`${D.fecha}T12:00:00`).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return D.fecha; }
})();

export const INFORME = {
  titulo: D.titulo,
  fecha_larga: fechaLarga,
  metricas: {
    area_ha_txt: num(D.metricas.area_ha, 2),
    area_m2_txt: num(D.metricas.area_m2),
    perimetro_txt: num(D.metricas.perimetro_m),
    mojones: D.metricas.mojones,
  },
  koppen: D.koppen,
  indice: D.indice,
  filas: D.filas,
  anexo: D.anexo,
  limites: D.limites,
};

/**
 * El perímetro del predio, llevado al cuadro del plano con su proporción
 * respetada.
 *
 * La latitud se corrige por el coseno antes de ajustar: sin eso el predio sale
 * estirado en longitud —a 17,3° el factor es 0,955, o sea un 4,5 % de error de
 * forma—, y la forma del polígono es justamente lo que la portada muestra.
 */
export const LIENZO_PLANO = { w: 360, h: 272, margen: 16 };

export const PLANO = (() => {
  const latC = D.mojones.reduce((s, m) => s + m.lat, 0) / D.mojones.length;
  const k = Math.cos((latC * Math.PI) / 180);
  const xs = D.mojones.map(m => m.lng * k);
  const ys = D.mojones.map(m => m.lat);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const escala = Math.min(
    (LIENZO_PLANO.w - 2 * LIENZO_PLANO.margen) / (x1 - x0),
    (LIENZO_PLANO.h - 2 * LIENZO_PLANO.margen) / (y1 - y0),
  );
  const dx = (LIENZO_PLANO.w - (x1 - x0) * escala) / 2;
  const dy = (LIENZO_PLANO.h - (y1 - y0) * escala) / 2;
  return {
    puntos: D.mojones.map(m => ([
      Math.round((m.lng * k - x0) * escala + dx),
      // La latitud crece hacia arriba y la `y` del SVG hacia abajo.
      Math.round(LIENZO_PLANO.h - ((m.lat - y0) * escala + dy)),
    ] as [number, number])),
  };
})();
