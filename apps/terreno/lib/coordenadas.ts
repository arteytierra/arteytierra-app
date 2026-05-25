/**
 * Conversión entre sistemas de coordenadas: decimal, GMS (grados-minutos-segundos), UTM.
 * Para UTM usa proj4. Zona como número + hemisferio (ej. "20S"). Argentina: zonas 18S–22S.
 */
import proj4 from 'proj4';

export interface Coordenada {
  lat: number;
  lng: number;
}

function normDecSep(s: string): string {
  return s.replace(/(\d),(\d)/g, '$1.$2');
}

// ─── Decimal ──────────────────────────────────────────────────────────────────

export function parsearDecimal(latStr: string, lngStr: string): Coordenada | null {
  const lat = parseFloat(normDecSep(latStr.trim()));
  const lng = parseFloat(normDecSep(lngStr.trim()));
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// ─── GMS ─────────────────────────────────────────────────────────────────────

export function parsearGMSCampo(input: string): number | null {
  const s = input.trim().toUpperCase();
  let signo = 1;
  let rest = s;

  // Hemisferio al inicio
  const leadMatch = rest.match(/^([NSEOOW])\s*/);
  if (leadMatch && leadMatch[1]) {
    signo = ['S', 'O', 'W'].includes(leadMatch[1]) ? -1 : 1;
    rest = rest.slice(leadMatch[0].length);
  }

  // Con símbolos: 31°14'04.44"S
  const symMatch = rest.match(/^(\d+)[°\s]+(\d+)['\s]+([0-9.]+)["\s]*([NSEOOW])?/);
  if (symMatch) {
    const d   = symMatch[1] ?? '0';
    const m   = symMatch[2] ?? '0';
    const sec = symMatch[3] ?? '0';
    const hemiEnd = symMatch[4];
    if (leadMatch === null && hemiEnd) {
      signo = ['S', 'O', 'W'].includes(hemiEnd) ? -1 : 1;
    }
    return signo * (parseFloat(d) + parseFloat(m) / 60 + parseFloat(sec) / 3600);
  }

  // Sin símbolos: "31 14 04.44" o "31,14,04.44"
  const parts = rest.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 3) {
    const d   = parseFloat(normDecSep(parts[0] ?? ''));
    const m   = parseFloat(normDecSep(parts[1] ?? ''));
    const sec = parseFloat(normDecSep(parts[2] ?? ''));
    const rawHemi = parts[3]?.replace(/[^NSEOOW]/g, '') ?? '';
    if (!isNaN(d) && !isNaN(m) && !isNaN(sec)) {
      if (leadMatch === null && rawHemi) {
        signo = ['S', 'O', 'W'].includes(rawHemi) ? -1 : 1;
      }
      return signo * (d + m / 60 + sec / 3600);
    }
  }

  return null;
}

export function parsearGMS(latStr: string, lngStr: string): Coordenada | null {
  const lat = parsearGMSCampo(latStr);
  const lng = parsearGMSCampo(lngStr);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// ─── UTM ──────────────────────────────────────────────────────────────────────

export function parsearUTM(zona: string, este: number, norte: number): Coordenada | null {
  try {
    const match = zona.trim().toUpperCase().match(/^(\d{1,2})([NS]?)$/);
    if (!match) return null;
    const zoneNum = parseInt(match[1] ?? '0', 10);
    if (zoneNum < 1 || zoneNum > 60) return null;
    // Sin hemisferio explícito: asume Sur (Argentina/Sudamérica)
    const isSouth = (match[2] ?? '') !== 'N';
    const proj = `+proj=utm +zone=${zoneNum}${isSouth ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`;
    const result = proj4(proj, 'WGS84', [este, norte]);
    const lng = result[0];
    const lat = result[1];
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

// ─── Formateo ────────────────────────────────────────────────────────────────

export function decimalAGMS(valor: number, esLatitud: boolean): string {
  const abs = Math.abs(valor);
  const deg = Math.floor(abs);
  const minFrac = (abs - deg) * 60;
  const min = Math.floor(minFrac);
  const sec = ((minFrac - min) * 60).toFixed(2);
  const hemi = esLatitud
    ? valor >= 0 ? 'N' : 'S'
    : valor >= 0 ? 'E' : 'O';
  return `${deg}°${String(min).padStart(2, '0')}'${String(sec).padStart(5, '0')}"${hemi}`;
}
