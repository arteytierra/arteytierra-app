import type { AmbienteDeseado, Tamano, TipoAmbiente } from '../tipos';

/** m² por defecto según tipo de ambiente y tamaño cualitativo (chico/mediano/grande). */
const AREA_DEFAULT_M2: Record<TipoAmbiente, Record<Tamano, number>> = {
  dormitorio:            { chico: 9,  mediano: 12, grande: 16 },
  bano:                  { chico: 3.5, mediano: 5, grande: 7 },
  'estar-cocina-comedor':{ chico: 20, mediano: 28, grande: 38 },
  garage:                { chico: 15, mediano: 18, grande: 36 },
  hall:                  { chico: 3,  mediano: 5,  grande: 8 },
  estudio:               { chico: 8,  mediano: 10, grande: 14 },
  lavadero:              { chico: 3,  mediano: 5,  grande: 7 },
  despensa:              { chico: 2,  mediano: 3.5,grande: 5 },
  invernadero:           { chico: 8,  mediano: 12, grande: 20 },
  biofiltro:             { chico: 6,  mediano: 9,  grande: 14 },
  galeria:               { chico: 8,  mediano: 14, grande: 22 },
  taller:                { chico: 9,  mediano: 14, grande: 22 },
  otro:                  { chico: 6,  mediano: 10, grande: 16 },
};

/** Nombre visible por defecto de cada tipo. */
export const NOMBRE_TIPO: Record<TipoAmbiente, string> = {
  dormitorio: 'Dormitorio',
  bano: 'Baño',
  'estar-cocina-comedor': 'Estar-Cocina-Comedor',
  garage: 'Garage',
  hall: 'Hall de ingreso',
  estudio: 'Estudio',
  lavadero: 'Lavadero',
  despensa: 'Despensa',
  invernadero: 'Invernadero',
  biofiltro: 'Biofiltro de aguas grises/negras',
  galeria: 'Galería',
  taller: 'Taller',
  otro: 'Ambiente',
};

export function area_m2(a: AmbienteDeseado): number {
  if (a.m2Aprox && a.m2Aprox > 0) return a.m2Aprox;
  const tamano = a.tamano ?? 'mediano';
  return AREA_DEFAULT_M2[a.tipo][tamano];
}

export interface InstanciaAmbiente {
  /** id único de esta instancia (distinto del id del AmbienteDeseado si cantidad > 1). */
  id: string;
  /** id del AmbienteDeseado del que proviene, para resolver adyacencias. */
  origenId: string;
  tipo: TipoAmbiente;
  nombre: string;
  area_m2: number;
  adyacenciasDeseadas: string[]; // origenId de otros AmbienteDeseado
}

/** Expande `cantidad` en instancias individuales (ej. 3 dormitorios → 3 ambientes). */
export function expandirAmbientes(ambientes: AmbienteDeseado[]): InstanciaAmbiente[] {
  const instancias: InstanciaAmbiente[] = [];
  for (const a of ambientes) {
    const base = a.nombre?.trim() || NOMBRE_TIPO[a.tipo];
    const area = area_m2(a);
    const n = Math.max(1, a.cantidad || 1);
    for (let i = 0; i < n; i++) {
      instancias.push({
        id: n > 1 ? `${a.id}#${i + 1}` : a.id,
        origenId: a.id,
        tipo: a.tipo,
        nombre: n > 1 ? `${base} ${i + 1}` : base,
        area_m2: area,
        adyacenciasDeseadas: a.adyacenciasDeseadas ?? [],
      });
    }
  }
  return instancias;
}
