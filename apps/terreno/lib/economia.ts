/**
 * Presupuesto de obras y análisis económico simple del diseño.
 *
 * Reúne las cantidades que la app ya calcula (perímetro, tuberías, represa,
 * riego…) en un presupuesto editable, y estima un retorno (payback) a partir de
 * un ingreso anual esperado. Los precios son orientativos y editables: la app
 * aporta la estructura y las cantidades, el usuario pone los valores de su zona.
 */
import type { MetricasPoligono } from './geometria';
import type { RedAguaResumen }   from './hidraulica';
import type { RepresaResumen }   from './represa';
import type { RiegoResumen }     from './riego';
import {
  separacionDePostes,
  type EspecieCierre, type TipoDeCierre,
} from './materiales';

export type Moneda = 'ARS' | 'USD';

export interface RubroPresupuesto {
  id:         string;
  categoria:  string;
  concepto:   string;
  cantidad:   number;
  unidad:     string;
  precioUnit: number;  // en la moneda elegida
}

export interface RubroCalculado extends RubroPresupuesto { subtotal: number; }

export interface EconomiaResumen {
  moneda:              Moneda;
  total:               number;
  porCategoria:        Array<{ categoria: string; subtotal: number }>;
  rubros:              RubroCalculado[];
  ingresoAnual:        number;
  costoOperativoAnual: number;
  margenAnual:         number;
  payback_anios:       number | null;
}

/** Catálogo de conceptos frecuentes con precio orientativo (USD, editable). */
export const CONCEPTOS_SUGERIDOS: Array<{ categoria: string; concepto: string; unidad: string; precioDefault: number }> = [
  { categoria: 'Cierres',    concepto: 'Alambrado perimetral',     unidad: 'm',   precioDefault: 3 },
  { categoria: 'Cierres',    concepto: 'Alambrado interno',        unidad: 'm',   precioDefault: 2.5 },
  { categoria: 'Cierres',    concepto: 'Postes',                   unidad: 'u',   precioDefault: 8 },
  { categoria: 'Cierres',    concepto: 'Conjuntos de esquina',     unidad: 'u',   precioDefault: 60 },
  { categoria: 'Agua',       concepto: 'Cañería',                  unidad: 'm',   precioDefault: 6 },
  { categoria: 'Agua',       concepto: 'Bomba',                    unidad: 'u',   precioDefault: 400 },
  { categoria: 'Agua',       concepto: 'Tanque de reserva',        unidad: 'm³',  precioDefault: 150 },
  { categoria: 'Agua',       concepto: 'Bebedero',                 unidad: 'u',   precioDefault: 120 },
  { categoria: 'Movimiento', concepto: 'Movimiento de suelo (represa)', unidad: 'm³', precioDefault: 4 },
  { categoria: 'Riego',      concepto: 'Instalación de riego',     unidad: 'ha',  precioDefault: 2500 },
  { categoria: 'Plantación', concepto: 'Árboles / plantines',      unidad: 'u',   precioDefault: 3 },
  { categoria: 'Mano obra',  concepto: 'Jornal',                   unidad: 'jornal', precioDefault: 40 },
];

let _n = 0;
const nuevoId = () => `r${Date.now().toString(36)}${(_n++).toString(36)}`;

export function nuevoRubro(base: Partial<RubroPresupuesto> = {}): RubroPresupuesto {
  return {
    id: nuevoId(),
    categoria: base.categoria ?? 'Otros',
    concepto:  base.concepto  ?? '',
    cantidad:  base.cantidad  ?? 0,
    unidad:    base.unidad    ?? 'u',
    precioUnit: base.precioUnit ?? 0,
  };
}

/**
 * Sugiere rubros con cantidades tomadas de los datos ya calculados del proyecto.
 *
 * Dos renglones de acá estaban mal y los arregló `materiales.ts`, que es donde
 * ahora vive la cuenta con su fuente:
 *
 * - **El movimiento de suelo de la represa** tomaba su cantidad de
 *   `represa.capacidad_m3`, que es **el agua**. El volumen de tierra de un muro
 *   no guarda ninguna relación fija con el volumen embalsado. Ahora el renglón
 *   sale sólo si se pasa el volumen calculado (`movimientoTierra_m3`, de
 *   `balanceTierra` en `cutfill.ts`); sin eso **no sale**, porque una cantidad
 *   equivocada en el renglón más caro es peor que un renglón faltante.
 * - **Los postes** iban «~1 poste cada 8 m como referencia» para todo el
 *   planeta. La separación máxima está publicada por especie y tipo de cierre, y
 *   para el caso más común —púa para bovinos sin varillas— son 6,10 m, con lo
 *   cual los 8 m dejaban afuera un 24 % de los postes. Y faltaba el renglón de
 *   los conjuntos de esquina, uno por mojón, que es el más caro del alambrado.
 */
export function rubrosDesdeProyecto(d: {
  metricas?: MetricasPoligono | null;
  redAgua?:  RedAguaResumen | null;
  represa?:  RepresaResumen | null;
  riego?:    RiegoResumen | null;
  /** Volumen de tierra del muro medido en banco (`balanceTierra.banco_m3`). */
  movimientoTierra_m3?: number | null;
  /** Especie y tipo del cierre perimetral. Por defecto, púa para bovinos. */
  cierre?: { especie: EspecieCierre; tipo: TipoDeCierre; conVarillas?: boolean } | null;
}): RubroPresupuesto[] {
  const out: RubroPresupuesto[] = [];
  const p = (concepto: string) => CONCEPTOS_SUGERIDOS.find(c => c.concepto === concepto);

  if (d.metricas) {
    const s = p('Alambrado perimetral')!;
    out.push(nuevoRubro({ ...s, cantidad: Math.round(d.metricas.perimetro_m) }));

    const c   = d.cierre ?? { especie: 'bovino' as EspecieCierre, tipo: 'pua' as TipoDeCierre };
    const sep = separacionDePostes(c.especie, c.tipo, c.conVarillas ?? false);
    // Los linderos pueden faltar en un proyecto viejo deserializado: sin ellos
    // no hay cuenta de esquinas, y cero es la respuesta honesta.
    const esquinas = d.metricas.linderos?.length ?? 0;
    if (sep) {
      const claros = Math.ceil(d.metricas.perimetro_m / sep.maximo_m);
      out.push(nuevoRubro({
        ...p('Postes')!,
        concepto: `Postes de línea (cada ${sep.maximo_m.toFixed(2)} m)`,
        cantidad: Math.max(0, claros - esquinas + 1),
      }));
      if (sep.varillasPorClaro > 0) {
        out.push(nuevoRubro({
          categoria: 'Cierres', concepto: 'Varillas', unidad: 'u', precioUnit: 2,
          cantidad: claros * sep.varillasPorClaro,
        }));
      }
    }
    if (esquinas > 0) out.push(nuevoRubro({ ...p('Conjuntos de esquina')!, cantidad: esquinas }));
  }
  if (d.redAgua) {
    const s = p('Cañería')!;
    out.push(nuevoRubro({ ...s, concepto: `Cañería ${d.redAgua.diametro} PN ${d.redAgua.pn_recomendado}`, cantidad: Math.round(d.redAgua.longitud_m) }));
    if (d.redAgua.bomba_kw) out.push(nuevoRubro({ ...p('Bomba')!, cantidad: 1 }));
  }
  if (d.movimientoTierra_m3 != null && d.movimientoTierra_m3 > 0) {
    const s = p('Movimiento de suelo (represa)')!;
    out.push(nuevoRubro({ ...s, concepto: 'Movimiento de suelo (banco excavado)', cantidad: Math.round(d.movimientoTierra_m3) }));
  }
  if (d.riego) {
    const s = p('Instalación de riego')!;
    out.push(nuevoRubro({ ...s, cantidad: Math.round(d.riego.area_ha * 100) / 100 }));
  }
  return out;
}

export function calcularEconomia(
  rubros: RubroPresupuesto[],
  moneda: Moneda,
  ingresoAnual: number,
  costoOperativoAnual: number,
): EconomiaResumen {
  const calc: RubroCalculado[] = rubros.map(r => ({ ...r, subtotal: (r.cantidad || 0) * (r.precioUnit || 0) }));
  const total = calc.reduce((a, r) => a + r.subtotal, 0);

  const mapa = new Map<string, number>();
  for (const r of calc) mapa.set(r.categoria, (mapa.get(r.categoria) ?? 0) + r.subtotal);
  const porCategoria = [...mapa.entries()].map(([categoria, subtotal]) => ({ categoria, subtotal }))
    .sort((a, b) => b.subtotal - a.subtotal);

  const margenAnual = (ingresoAnual || 0) - (costoOperativoAnual || 0);
  const payback_anios = margenAnual > 0 && total > 0 ? total / margenAnual : null;

  return { moneda, total, porCategoria, rubros: calc, ingresoAnual, costoOperativoAnual, margenAnual, payback_anios };
}

export function formatearMoneda(v: number, moneda: Moneda): string {
  const s = Math.round(v).toLocaleString('es-AR');
  return moneda === 'USD' ? `US$ ${s}` : `$ ${s}`;
}
