/**
 * arco_solar.ts — Trayectoria del sol proyectada sobre el mapa.
 * 3 fechas clave: solsticio de verano, equinoccios, solsticio de invierno.
 * Proyección azimutal equidistante: centro = cénit, borde = horizonte.
 *
 * Fórmulas: Cooper (1969) para declinación, hora solar verdadera.
 * Azimut: atan2 desde norte, sentido horario (0=N, 90=E, 180=S, 270=O).
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export type FechaArco = 'solsticio_verano' | 'equinoccio' | 'solsticio_invierno';

export interface PuntoArco {
  lat:       number;
  lng:       number;
  hora:      number;   // hora solar decimal
  azimut:    number;   // 0=N, 90=E, 180=S, 270=O
  elevacion: number;   // grados sobre horizonte
}

export interface ArcoSolar {
  fecha:      FechaArco;
  label:      string;
  labelCorto: string;
  color:      string;
  puntos:     PuntoArco[];
  amanecer:   PuntoArco;
  atardecer:  PuntoArco;
  mediodia:   PuntoArco;
  horas_luz:  number;
}

export interface DatosArcoSolar {
  centro:  { lat: number; lng: number };
  radio_m: number;
  arcos:   ArcoSolar[];
  brujula: { N: LL; E: LL; S: LL; O: LL };
}

type LL = { lat: number; lng: number };

// ─── Metadatos de cada fecha ──────────────────────────────────────────────────

const FECHAS_META: Record<FechaArco, { doy: number; label: string; labelCorto: string; color: string }> = {
  solsticio_verano:   { doy: 355, label: 'Solsticio de verano (21 dic)',  labelCorto: 'Verano',     color: '#FF5722' },
  equinoccio:         { doy: 80,  label: 'Equinoccios (21 mar / 23 sep)', labelCorto: 'Equinoccio', color: '#43A047' },
  solsticio_invierno: { doy: 172, label: 'Solsticio de invierno (21 jun)', labelCorto: 'Invierno',  color: '#1E88E5' },
};

// ─── Astronomía ───────────────────────────────────────────────────────────────

function declinacion(doy: number): number {
  // Cooper (1969): error < 0.5°
  return 23.45 * DEG * Math.sin(2 * Math.PI * (284 + doy) / 365);
}

function posicionSolar(
  lat_deg: number,
  doy: number,
  hora_solar: number,
): { elevacion: number; azimut: number } | null {
  const phi  = lat_deg * DEG;
  const decl = declinacion(doy);
  const H    = (hora_solar - 12) * 15 * DEG;  // ángulo horario

  const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
  const elev   = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;

  if (elev < 0) return null;

  // Azimut desde norte, sentido horario
  const azRad = Math.atan2(
    -Math.cos(decl) * Math.sin(H),
    Math.sin(decl) * Math.cos(phi) - Math.cos(decl) * Math.cos(H) * Math.sin(phi),
  );
  return {
    elevacion: elev,
    azimut:    ((azRad * RAD) + 360) % 360,
  };
}

function horasSalida(lat_deg: number, doy: number): { salida: number; puesta: number } {
  const phi    = lat_deg * DEG;
  const decl   = declinacion(doy);
  const cosWs  = -Math.tan(phi) * Math.tan(decl);
  if (cosWs <= -1) return { salida: 0,  puesta: 24 };  // día polar
  if (cosWs >=  1) return { salida: 12, puesta: 12 };  // noche polar
  const ws_h = Math.acos(cosWs) * RAD / 15;
  return { salida: 12 - ws_h, puesta: 12 + ws_h };
}

// ─── Proyección sobre el mapa ─────────────────────────────────────────────────

function proyectar(centro: LL, azimut_deg: number, elevacion_deg: number, radio_m: number): LL {
  // Proyección azimutal equidistante: cénit → horizonte
  const r      = radio_m * Math.max(0, 1 - elevacion_deg / 90);
  const az_rad = azimut_deg * DEG;
  const dN     = r * Math.cos(az_rad);
  const dE     = r * Math.sin(az_rad);
  return {
    lat: centro.lat + dN / 111320,
    lng: centro.lng + dE / (111320 * Math.cos(centro.lat * DEG)),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function horaStr(horaDecimal: number): string {
  const h = Math.floor(horaDecimal);
  const m = Math.round((horaDecimal - h) * 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularArcoSolar(lat: number, lng: number, radio_m: number): DatosArcoSolar {
  const centro: LL = { lat, lng };

  const arcos: ArcoSolar[] = (Object.keys(FECHAS_META) as FechaArco[]).map(fecha => {
    const { doy, label, labelCorto, color } = FECHAS_META[fecha]!;
    const { salida, puesta } = horasSalida(lat, doy);
    const horas_luz = puesta - salida;

    // Muestrear cada 10 minutos
    const puntos: PuntoArco[] = [];
    for (let h = salida - 0.02; h <= puesta + 0.02; h += 1 / 6) {
      const pos = posicionSolar(lat, doy, h);
      if (!pos || pos.elevacion < 0) continue;
      puntos.push({ ...proyectar(centro, pos.azimut, pos.elevacion, radio_m), hora: h, ...pos });
    }

    // Punto de amanecer: azimut proyectado en el horizonte
    const posAman = posicionSolar(lat, doy, salida + 0.25) ?? posicionSolar(lat, doy, salida + 0.5);
    const azAman  = posAman?.azimut ?? 90;
    const amanecer: PuntoArco = { ...proyectar(centro, azAman, 0, radio_m), hora: salida, azimut: azAman, elevacion: 0 };

    const posPuesta = posicionSolar(lat, doy, puesta - 0.25) ?? posicionSolar(lat, doy, puesta - 0.5);
    const azPuesta  = posPuesta?.azimut ?? 270;
    const atardecer: PuntoArco = { ...proyectar(centro, azPuesta, 0, radio_m), hora: puesta, azimut: azPuesta, elevacion: 0 };

    const posMedio  = posicionSolar(lat, doy, 12) ?? { elevacion: 60, azimut: 0 };
    const mediodia: PuntoArco = { ...proyectar(centro, posMedio.azimut, posMedio.elevacion, radio_m), hora: 12, ...posMedio };

    return { fecha, label, labelCorto, color, puntos, amanecer, atardecer, mediodia, horas_luz };
  });

  // Puntos cardinales en la circunferencia del horizonte
  const cosLat = Math.cos(lat * DEG);
  const brujula = {
    N: { lat: centro.lat + radio_m / 111320,                            lng: centro.lng },
    S: { lat: centro.lat - radio_m / 111320,                            lng: centro.lng },
    E: { lat: centro.lat,  lng: centro.lng + radio_m / (111320 * cosLat) },
    O: { lat: centro.lat,  lng: centro.lng - radio_m / (111320 * cosLat) },
  };

  return { centro, radio_m, arcos, brujula };
}

/** Radio automático basado en el tamaño del terreno */
export function calcularRadioArco(
  mojones: Array<{ lat: number; lng: number }>,
  lat_centro: number,
): number {
  if (mojones.length < 2) return 200;
  const lats   = mojones.map(m => m.lat);
  const lngs   = mojones.map(m => m.lng);
  const dLat   = (Math.max(...lats) - Math.min(...lats)) * 111320;
  const dLng   = (Math.max(...lngs) - Math.min(...lngs)) * 111320 * Math.cos(lat_centro * DEG);
  const diag   = Math.sqrt(dLat ** 2 + dLng ** 2);
  return Math.max(150, Math.min(2000, Math.round(diag * 1.3)));
}
