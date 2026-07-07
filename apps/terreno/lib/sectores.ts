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
  | 'viento_calido'
  | 'fuego'
  | 'inundacion'
  | 'helada'
  | 'contaminacion'
  | 'fauna'
  | 'polinizadores'
  | 'privacidad'
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
  viento_calido:  { label: 'Brisa cálida',        descripcion: 'Viento cálido / brisa de verano',        color: '#FFCC80', colorTw: 'bg-orange-200', icono: '🍃' },
  fuego:          { label: 'Riesgo de incendio',  descripcion: 'Zona de mayor riesgo de incendio',       color: '#FF7043', colorTw: 'bg-orange-500', icono: '🔥' },
  inundacion:     { label: 'Riesgo de inundación',descripcion: 'Área susceptible a anegamiento',         color: '#29B6F6', colorTw: 'bg-blue-400',   icono: '💧' },
  helada:         { label: 'Bolsón de helada',    descripcion: 'Acumulación de aire frío / heladas',     color: '#B39DDB', colorTw: 'bg-indigo-200', icono: '❄️' },
  contaminacion:  { label: 'Deriva / contaminación', descripcion: 'Agroquímicos, humo, polvo de vecinos', color: '#A1887F', colorTw: 'bg-stone-400', icono: '☣️' },
  fauna:          { label: 'Corredor de fauna',   descripcion: 'Paso de fauna nativa, biodiversidad',    color: '#8D6E63', colorTw: 'bg-amber-800',  icono: '🦌' },
  polinizadores:  { label: 'Polinizadores',       descripcion: 'Flujo de abejas y polinizadores',        color: '#FFD54F', colorTw: 'bg-yellow-300', icono: '🐝' },
  privacidad:     { label: 'Privacidad / miradas',descripcion: 'Miradas externas a tapar con vegetación',color: '#90A4AE', colorTw: 'bg-slate-400',  icono: '👁️' },
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

// ─── Generación de vértices (geometría aproximada) ────────────────────────────

const DEG_S = Math.PI / 180;
const RAD_S = 180 / Math.PI;

/** Convierte dirección cardinal → azimut en grados (0=N, 90=E…) */
const WIND_AZ: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
  E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSO: 202.5, SO: 225, OSO: 247.5,
  O: 270, ONO: 292.5, NO: 315, NNO: 337.5,
};
function dirAzimut(dir: string): number { return WIND_AZ[dir.toUpperCase()] ?? 0; }

/** Genera una cuña (pie-slice) desde centro hacia un arco azimutal. */
function arcoPolar(
  centro: { lat: number; lng: number },
  azDesde: number,   // inicio del arco (horario desde N)
  azHasta: number,   // fin del arco (avanzando en sentido horario)
  radio_m: number,
  nPts = 30,
): Array<{ lat: number; lng: number }> {
  const cosLat = Math.cos(centro.lat * DEG_S);
  const hasta  = azHasta <= azDesde ? azHasta + 360 : azHasta;
  const pts: Array<{ lat: number; lng: number }> = [{ ...centro }];
  for (let i = 0; i <= nPts; i++) {
    const az = ((azDesde + (hasta - azDesde) * i / nPts) % 360 + 360) % 360;
    const r  = az * DEG_S;
    pts.push({
      lat: centro.lat + radio_m * Math.cos(r) / 111320,
      lng: centro.lng + radio_m * Math.sin(r) / (111320 * cosLat),
    });
  }
  return pts;
}

/** Cuña centrada en un azimut con amplitud dada. */
function cuña(
  centro: { lat: number; lng: number },
  azCentro: number,
  amplitud: number,
  radio_m: number,
): Array<{ lat: number; lng: number }> {
  return arcoPolar(centro, azCentro - amplitud / 2, azCentro + amplitud / 2, radio_m);
}

/** Azimuts de amanecer y atardecer para un día del año. */
function azimutsSolsticio(lat: number, doy: number): { amanecer: number; atardecer: number } {
  const phi  = lat * DEG_S;
  const decl = 23.45 * DEG_S * Math.sin(2 * Math.PI * (284 + doy) / 365);
  const cosWs = -Math.tan(phi) * Math.tan(decl);
  if (Math.abs(cosWs) >= 1) return { amanecer: 90, atardecer: 270 };

  const Hs = Math.acos(cosWs);

  function az(H: number) {
    const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
    const alt    = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const r = Math.atan2(
      -Math.cos(decl) * Math.sin(H),
      Math.sin(decl) * Math.cos(phi) - Math.cos(decl) * Math.cos(H) * Math.sin(phi),
    );
    void alt; // horizon approximation — ignores refraction
    return ((r * RAD_S) + 360) % 360;
  }

  return { amanecer: az(-Hs), atardecer: az(+Hs) };
}

/**
 * Genera vértices aproximados para un sector automático.
 * Devuelve un polígono (cuña/arco) centrado en (lat, lng) con radio radio_m.
 */
export function generarVerticesSector(
  tipo: TipoSector,
  lat: number,
  lng: number,
  radio_m: number,
  clima: DatosClima | null,
  topo: DatosTopografia | null,
): Array<{ lat: number; lng: number }> {
  const centro = { lat, lng };

  switch (tipo) {
    case 'sol_verano': {
      const { amanecer, atardecer } = azimutsSolsticio(lat, 355); // 21 dic
      // El arco va desde el lado del atardecer hacia el amanecer pasando por el norte
      return arcoPolar(centro, atardecer, amanecer, radio_m);
    }
    case 'sol_invierno': {
      const { amanecer, atardecer } = azimutsSolsticio(lat, 172); // 21 jun
      return arcoPolar(centro, atardecer, amanecer, radio_m);
    }
    case 'viento_ppal': {
      const az = clima ? dirAzimut(clima.viento_dir_ppal) : 0;
      return cuña(centro, az, 70, radio_m);
    }
    case 'viento_frio': {
      // Hemisferio sur: viento frío del SO (Pampero); norte: NO
      const az = lat < 0 ? 225 : 315;
      return cuña(centro, az, 55, radio_m);
    }
    case 'fuego': {
      const az = topo ? dirAzimut(topo.orientacion) : (lat < 0 ? 0 : 180);
      return cuña(centro, az, 90, radio_m);
    }
    case 'inundacion': {
      // El agua fluye en la dirección de la pendiente (orientacion)
      const az = topo ? dirAzimut(topo.orientacion) : 180;
      return cuña(centro, az, 80, radio_m);
    }
    default:
      return cuña(centro, 0, 90, radio_m);
  }
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
