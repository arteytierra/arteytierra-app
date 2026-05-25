/**
 * Zonificación predial: zonas dibujadas sobre el mapa con área calculada.
 * Cada zona es un polígono GeoJSON con etiqueta y categoría.
 * Categorías basadas en diseño de permacultura y agroecología.
 */
import * as turf from '@turf/turf';

export type CategoriaZona =
  | 'vivienda'
  | 'huerta'
  | 'frutales'
  | 'monte_nativo'
  | 'pasturas'
  | 'cultivo'
  | 'infraestructura'
  | 'agua'
  | 'compost_vivero'
  | 'personalizado';

export const CATEGORIAS_ZONA: Record<CategoriaZona, {
  label:       string;
  descripcion: string;
  color:       string;   // hex para Leaflet
  colorTw:     string;   // Tailwind class para el panel
}> = {
  vivienda:         { label: 'Zona de vivienda',         descripcion: 'Casa, galpón, construcciones principales',   color: '#8B7355', colorTw: 'bg-amber-700'   },
  huerta:           { label: 'Huerta / jardín',           descripcion: 'Horticultura intensiva, aromáticas, flores', color: '#5A8F3C', colorTw: 'bg-green-600'   },
  frutales:         { label: 'Monte frutal',              descripcion: 'Frutales, berries, árboles productivos',     color: '#E67E22', colorTw: 'bg-orange-500'  },
  monte_nativo:     { label: 'Monte nativo / bosque',     descripcion: 'Vegetación nativa, reserva ecológica',       color: '#2E7D32', colorTw: 'bg-green-800'   },
  pasturas:         { label: 'Pasturas / ganadería',      descripcion: 'Pastizal, paddocks, manejo rotacional',      color: '#9DC183', colorTw: 'bg-lime-400'    },
  cultivo:          { label: 'Cultivo extensivo',         descripcion: 'Granos, forraje, siembra directa',           color: '#F0C040', colorTw: 'bg-yellow-400'  },
  infraestructura:  { label: 'Infraestructura / caminos', descripcion: 'Caminos, alambrados, instalaciones',         color: '#90A4AE', colorTw: 'bg-slate-400'   },
  agua:             { label: 'Cuerpo de agua',            descripcion: 'Represas, jagüeles, zanjas, arroyos',        color: '#1E88E5', colorTw: 'bg-blue-500'    },
  compost_vivero:   { label: 'Compost / vivero',          descripcion: 'Área de compostaje, propagación, semillero', color: '#6D4C41', colorTw: 'bg-brown-600'   },
  personalizado:    { label: 'Uso personalizado',         descripcion: 'Definí el uso específico',                   color: '#9C27B0', colorTw: 'bg-purple-600'  },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Zona {
  id:        string;
  categoria: CategoriaZona;
  nombre:    string;
  vertices:  Array<{ lat: number; lng: number }>;
  area_m2:   number;
  area_ha:   number;
  notas:     string;
  color?:    string;   // hex personalizado; si no se define usa CATEGORIAS_ZONA[categoria].color
}

// ─── Cálculo de área ──────────────────────────────────────────────────────────

export function calcularAreaZona(vertices: Array<{ lat: number; lng: number }>): { m2: number; ha: number } {
  if (vertices.length < 3) return { m2: 0, ha: 0 };
  try {
    const coords = vertices.map(v => [v.lng, v.lat] as [number, number]);
    coords.push(coords[0]!);
    const polygon = turf.polygon([coords]);
    const area_m2 = turf.area(polygon);
    return {
      m2: Math.round(area_m2 * 10) / 10,
      ha: Math.round((area_m2 / 10000) * 10000) / 10000,
    };
  } catch {
    return { m2: 0, ha: 0 };
  }
}

export function crearZona(
  categoria: CategoriaZona,
  vertices: Array<{ lat: number; lng: number }>,
  color?: string,
): Zona {
  const { m2, ha } = calcularAreaZona(vertices);
  return {
    id:        crypto.randomUUID(),
    categoria,
    nombre:    CATEGORIAS_ZONA[categoria].label,
    vertices,
    area_m2:   m2,
    area_ha:   ha,
    notas:     '',
    color,
  };
}

export function actualizarAreaZona(zona: Zona): Zona {
  const { m2, ha } = calcularAreaZona(zona.vertices);
  return { ...zona, area_m2: m2, area_ha: ha };
}

// ─── Resumen de zonificación ──────────────────────────────────────────────────

export interface ResumenZonificacion {
  area_total_zonificada_ha: number;
  zonas_por_categoria: Array<{
    categoria: CategoriaZona;
    label:     string;
    count:     number;
    area_ha:   number;
    porcentaje: number;
  }>;
}

export function calcularResumenZonificacion(zonas: Zona[]): ResumenZonificacion {
  const total = zonas.reduce((s, z) => s + z.area_ha, 0);

  const porCategoria = new Map<CategoriaZona, { count: number; area: number }>();
  for (const z of zonas) {
    const prev = porCategoria.get(z.categoria) ?? { count: 0, area: 0 };
    porCategoria.set(z.categoria, { count: prev.count + 1, area: prev.area + z.area_ha });
  }

  const zonas_por_categoria = Array.from(porCategoria.entries()).map(([cat, d]) => ({
    categoria:  cat,
    label:      CATEGORIAS_ZONA[cat].label,
    count:      d.count,
    area_ha:    Math.round(d.area * 10000) / 10000,
    porcentaje: total > 0 ? Math.round((d.area / total) * 1000) / 10 : 0,
  })).sort((a, b) => b.area_ha - a.area_ha);

  return {
    area_total_zonificada_ha: Math.round(total * 10000) / 10000,
    zonas_por_categoria,
  };
}
