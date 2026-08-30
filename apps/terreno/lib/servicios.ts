/**
 * Redes de servicios del predio.
 *
 * Una red de servicio se traza igual que un camino —una polilínea que toma cota
 * del DEM en cada vértice—, así que reusa la misma estructura `Camino` en vez de
 * duplicarla. Lo único que agrega es de qué servicio se trata, para poder
 * dibujarlas con colores distintos y no mezclarlas con los caminos de andar.
 *
 * Los colores siguen el código de señalización de servicios enterrados que se
 * usa en obra: azul agua, amarillo gas, rojo electricidad, marrón cloacas,
 * naranja telecomunicaciones. Que el plano se lea igual que la zanja.
 *
 * Cálculo: por ahora sólo el agua se dimensiona (caudal, diámetro, presión).
 * Gas y electricidad se trazan y se miden, pero su cálculo tiene otra física y
 * otras normas — mejor no dar un número que no podamos sostener.
 */

export type TipoServicio = 'agua' | 'riego' | 'gas' | 'electricidad' | 'cloacas' | 'datos';

export interface FichaServicio {
  id:        TipoServicio;
  nombre:    string;
  color:     string;
  /** La app dimensiona esta red (por ahora, sólo las de agua). */
  calcula:   boolean;
  /** Qué se traza y qué no se calcula, dicho en una línea. */
  nota:      string;
}

export const SERVICIOS: FichaServicio[] = [
  { id: 'agua',          nombre: 'Agua',                 color: '#1565C0', calcula: true,
    nota: 'Se dimensiona: caudal de diseño, diámetro, presión y bombeo.' },
  { id: 'riego',         nombre: 'Riego',                color: '#00897B', calcula: true,
    nota: 'Igual que el agua, pero el consumo es continuo mientras dura el turno.' },
  { id: 'gas',           nombre: 'Gas',                  color: '#F9A825', calcula: false,
    nota: 'Se traza y se mide el recorrido. El dimensionado de gas se rige por otra norma y no lo calculamos.' },
  { id: 'electricidad',  nombre: 'Electricidad',         color: '#E53935', calcula: false,
    nota: 'Se traza y se mide el recorrido, útil para presupuestar zanja y cable.' },
  { id: 'cloacas',       nombre: 'Cloacas / efluentes',  color: '#6D4C41', calcula: false,
    nota: 'Se traza y se mide. Escurre por gravedad: lo que manda es la pendiente del terreno, no la presión.' },
  { id: 'datos',         nombre: 'Datos / teléfono',     color: '#F57C00', calcula: false,
    nota: 'Se traza y se mide el recorrido.' },
];

export function servicioPorId(id: string | undefined): FichaServicio | null {
  if (!id) return null;
  return SERVICIOS.find(s => s.id === id) ?? null;
}

export function colorServicio(id: string | undefined): string | null {
  return servicioPorId(id)?.color ?? null;
}

/** Las redes que la app sabe dimensionar hidráulicamente. */
export function calculaCaudal(id: string | undefined): boolean {
  return servicioPorId(id)?.calcula ?? false;
}
