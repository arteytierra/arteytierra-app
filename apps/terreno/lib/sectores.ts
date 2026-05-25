/**
 * Análisis de sectores: influencias externas del predio.
 * Sectores calculados (desde clima/topo) + sectores dibujados manualmente.
 * Referencia metodológica: diseño en permacultura (Mollison, Holmgren).
 */
import type { DatosClima } from './clima';
import type { DatosTopografia } from './topografia';

export type TipoSector =
  | 'sol_verano'
  | 'sol_invierno'
  | 'viento_ppal'
  | 'viento_frio'
  | 'fuego'
  | 'inundacion'
  | 'vista_positiva'
  | 'vista_negativa'
  | 'ruido'
  | 'acceso'
  | 'personalizado';

export const TIPOS_SECTOR: Record<TipoSector, {
  label:       string;
  descripcion: string;
  color:       string;
  colorTw:     string;
  icono:       string;
}> = {
  sol_verano:     { label: 'Sol de verano',       descripcion: 'Trayectoria alta del sol, verano',       color: '#FFD54F', colorTw: 'bg-yellow-300',  icono: '☀️' },
  sol_invierno:   { label: 'Sol de invierno',     descripcion: 'Trayectoria baja del sol, invierno',     color: '#FFB300', colorTw: 'bg-amber-400',   icono: '🌤️' },
  viento_ppal:    { label: 'Viento predominante', descripcion: 'Dirección del viento principal',         color: '#81D4FA', colorTw: 'bg-sky-200',    icono: '💨' },
  viento_frio:    { label: 'Viento frío',         descripcion: 'Viento frío de invierno',                color: '#B3E5FC', colorTw: 'bg-sky-100',    icono: '🌬️' },
  fuego:          { label: 'Riesgo de incendio',  descripcion: 'Zona de mayor riesgo de incendio',       color: '#FF7043', colorTw: 'bg-orange-500', icono: '🔥' },
  inundacion:     { label: 'Riesgo de inundación',descripcion: 'Área susceptible a anegamiento',         color: '#29B6F6', colorTw: 'bg-blue-400',   icono: '💧' },
  vista_positiva: { label: 'Vista positiva',      descripcion: 'Paisaje, cerros, vegetación linda',      color: '#A5D6A7', colorTw: 'bg-green-200',  icono: '🏔️' },
  vista_negativa: { label: 'Vista negativa',      descripcion: 'Ruta, industria, construcción fea',      color: '#BDBDBD', colorTw: 'bg-gray-300',   icono: '🏭' },
  ruido:          { label: 'Fuente de ruido',     descripcion: 'Ruta, vecinos, actividad industrial',    color: '#CE93D8', colorTw: 'bg-purple-200', icono: '📢' },
  acceso:         { label: 'Acceso al predio',    descripcion: 'Entrada, caminos, portal',               color: '#8D6E63', colorTw: 'bg-stone-400',  icono: '🚪' },
  personalizado:  { label: 'Personalizado',       descripcion: 'Sector de uso personalizado',            color: '#90A4AE', colorTw: 'bg-slate-300',  icono: '📍' },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Sector {
  id:       string;
  tipo:     TipoSector;
  nombre:   string;
  vertices: Array<{ lat: number; lng: number }>;
  notas:    string;
  auto:     boolean;   // true = generado automáticamente desde datos
  color?:   string;   // hex personalizado; si no se define usa TIPOS_SECTOR[tipo].color
}

// ─── Sectores automáticos desde datos ────────────────────────────────────────

export function calcularSectoresAuto(
  lat: number,
  clima: DatosClima | null,
  topo: DatosTopografia | null,
): Sector[] {
  const sectores: Sector[] = [];

  // Sector viento desde datos de clima
  if (clima) {
    sectores.push({
      id:       'auto-viento',
      tipo:     'viento_ppal',
      nombre:   `Viento ${clima.viento_dir_ppal}`,
      vertices: [],  // no tiene geometría — mostrar como flecha/info
      notas:    `Dirección predominante del viento: ${clima.viento_dir_ppal}. Promedio anual.`,
      auto:     true,
    });

    // Viento frío: en hemisferio sur suele venir del SO en invierno
    const mesMasF = clima.meses.reduce((b, m, i) => m.tmean_c < clima.meses[b]!.tmean_c ? i : b, 0);
    sectores.push({
      id:    'auto-viento-frio',
      tipo:  'viento_frio',
      nombre: 'Viento frío (invierno)',
      vertices: [],
      notas: `Mes más frío: ${clima.meses[mesMasF]?.mes} (${clima.meses[mesMasF]?.tmean_c}°C). Protegerse del SO con cortinas forestales.`,
      auto: true,
    });
  }

  // Sector sol: en hemisferio sur el sol pasa por el NORTE
  if (lat < 0) {
    sectores.push({
      id:       'auto-sol-verano',
      tipo:     'sol_verano',
      nombre:   'Sol de verano (NE→NO)',
      vertices: [],
      notas:    'En hemisferio sur el sol sale por el NE y se pone en el NO en verano. Máxima elevación al norte.',
      auto:     true,
    });
    sectores.push({
      id:       'auto-sol-invierno',
      tipo:     'sol_invierno',
      nombre:   'Sol de invierno (E→O, bajo)',
      vertices: [],
      notas:    'En invierno el sol describe una trayectoria baja hacia el norte. Importante para invernaderos y termosifones.',
      auto:     true,
    });
  }

  // Sector fuego desde topografía
  if (topo) {
    const orientFuego = orientacionRiesgoFuego(topo.orientacion, lat);
    sectores.push({
      id:    'auto-fuego',
      tipo:  'fuego',
      nombre: `Riesgo de fuego (ladera ${topo.orientacion})`,
      vertices: [],
      notas: `Escurrimiento hacia el ${topo.orientacion}. ${orientFuego}. Pendiente: ${topo.pendiente_pct}%.`,
      auto: true,
    });
  }

  return sectores;
}

function orientacionRiesgoFuego(orient: string, lat: number): string {
  // En hemisferio sur, laderas N son más secas → mayor riesgo
  const altoRiesgo = lat < 0
    ? ['N', 'NNE', 'NE', 'NNO', 'NO'].includes(orient)
    : ['S', 'SSE', 'SE', 'SSO', 'SO'].includes(orient);
  return altoRiesgo
    ? 'Ladera expuesta al sol → mayor desecación → riesgo alto'
    : 'Ladera umbría → menor desecación → riesgo moderado';
}
