/**
 * Análisis solar: trayectoria del sol, radiación, horas de luz.
 * 100% calculado a partir de latitud + datos de NASA POWER (DatosClima).
 * Sin APIs adicionales.
 *
 * Fórmulas: FAO-56 / algoritmos astronómicos estándar.
 */
import type { DatosClima } from './clima';
import { MESES } from './clima';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface MesSolar {
  mes:              string;
  horas_luz:        number;   // horas de luz solar (amanecer → puesta)
  radiacion_mj:     number;   // Radiación extraterrestre MJ/m²/día
  elev_solar_noon:  number;   // Elevación solar al mediodía (°)
  amanecer_hh:      string;   // hora aprox. "06:32"
  atardecer_hh:     string;   // hora aprox. "19:45"
  estacion:         string;   // Verano / Otoño / Invierno / Primavera
}

export interface DatosSolar {
  lat:                  number;
  lng:                  number;
  angulo_optimo_panel:  number;   // ° desde horizontal (= |lat| + 10–15° por pérdidas)
  orientacion_optima:   string;   // "Norte" en hemisferio sur
  meses:                MesSolar[];
  mes_max_radiacion:    number;   // índice 0-11
  mes_min_radiacion:    number;
  horas_luz_max:        number;
  horas_luz_min:        number;
  interpretacion:       InterpSolar;
}

export interface InterpSolar {
  potencial:      string;
  descripcion:    string;
  color:          'verde' | 'amarillo' | 'rojo';
  usos_optimos:   string[];
}

// ─── Días del año medianos para cada mes ─────────────────────────────────────

const DOY_MID = [17, 47, 75, 105, 135, 162, 198, 228, 259, 289, 319, 345] as const;
const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── Cálculo astronómico ──────────────────────────────────────────────────────

function angHorarioSolar(lat_deg: number, doy: number): number {
  const phi   = (lat_deg * Math.PI) / 180;
  const delta = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);
  const cosWs = -Math.tan(phi) * Math.tan(delta);
  return Math.acos(Math.max(-1, Math.min(1, cosWs)));
}

function radiacionExtraterrestre(lat_deg: number, doy: number): number {
  const Gsc = 0.082;
  const phi  = (lat_deg * Math.PI) / 180;
  const dr   = 1 + 0.033 * Math.cos((2 * Math.PI * doy) / 365);
  const delta = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);
  const ws   = angHorarioSolar(lat_deg, doy);
  const Ra   =
    (24 * 60) / Math.PI * Gsc * dr *
    (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
  return Math.max(Ra, 0);
}

function horasLuz(lat_deg: number, doy: number): number {
  const ws = angHorarioSolar(lat_deg, doy);
  return (24 / Math.PI) * ws;
}

function elevacionMedioDia(lat_deg: number, doy: number): number {
  const phi   = (lat_deg * Math.PI) / 180;
  const delta = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);
  const elev  = (Math.PI / 2) - Math.abs(phi - delta);
  return Math.max(0, (elev * 180) / Math.PI);
}

function formatHora(horasDesdeMedianoche: number): string {
  const h = Math.floor(horasDesdeMedianoche);
  const m = Math.round((horasDesdeMedianoche - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Estación para hemisferio sur
function estacion(mesIdx: number): string {
  if ([11, 0, 1].includes(mesIdx)) return 'Verano';
  if ([2, 3, 4].includes(mesIdx))  return 'Otoño';
  if ([5, 6, 7].includes(mesIdx))  return 'Invierno';
  return 'Primavera';
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularSolar(lat: number, lng: number, _clima?: DatosClima): DatosSolar {
  const meses: MesSolar[] = DOY_MID.map((doy, i) => {
    const hl    = horasLuz(lat, doy);
    const Ra    = radiacionExtraterrestre(lat, doy);
    const elev  = elevacionMedioDia(lat, doy);
    const amanecer  = 12 - hl / 2;
    const atardecer = 12 + hl / 2;

    return {
      mes:             MESES[i] ?? '',
      horas_luz:       Math.round(hl * 10) / 10,
      radiacion_mj:    Math.round(Ra * 10) / 10,
      elev_solar_noon: Math.round(elev * 10) / 10,
      amanecer_hh:     formatHora(amanecer),
      atardecer_hh:    formatHora(atardecer),
      estacion:        estacion(i),
    };
  });

  // Índices extremos
  const raValues    = meses.map(m => m.radiacion_mj);
  const hlValues    = meses.map(m => m.horas_luz);
  const mes_max     = raValues.indexOf(Math.max(...raValues));
  const mes_min     = raValues.indexOf(Math.min(...raValues));
  const horas_max   = Math.max(...hlValues);
  const horas_min   = Math.min(...hlValues);

  // Ángulo óptimo de panel solar (regla general: |lat| + 10–15° para máximo anual)
  const angulo_optimo_panel = Math.round(Math.abs(lat) + 12);

  // En hemisferio sur, paneles apuntan al NORTE
  const orientacion_optima = lat < 0 ? 'Norte' : 'Sur';

  // Interpretación del potencial solar
  const ra_anual_prom = raValues.reduce((s, v) => s + v, 0) / 12;
  const interp = interpretarSolar(ra_anual_prom, lat);

  return {
    lat, lng,
    angulo_optimo_panel,
    orientacion_optima,
    meses,
    mes_max_radiacion: mes_max,
    mes_min_radiacion: mes_min,
    horas_luz_max: Math.round(horas_max * 10) / 10,
    horas_luz_min: Math.round(horas_min * 10) / 10,
    interpretacion: interp,
  };
}

function interpretarSolar(ra_prom: number, lat: number): InterpSolar {
  // Ra promedio > 25 MJ/m²/día → zona muy soleada (ej. NOA, Córdoba)
  const usos: string[] = [];
  if (ra_prom > 22) {
    usos.push('Secado solar de alimentos y semillas');
    usos.push('Calentador solar de agua (termotanque)');
    usos.push('Paneles fotovoltaicos para autoconsumo');
    usos.push('Invernadero solar pasivo con orientación N');
  } else {
    usos.push('Calentador solar de agua (termotanque)');
    usos.push('Diseño de espacios con ventanas al norte');
    usos.push('Paneles FV con seguidor o ángulo optimizado');
  }
  if (Math.abs(lat) < 35) usos.push('Cría de aves con aprovechamiento solar (pollos pastoriles)');

  const potencial =
    ra_prom > 28 ? 'Muy alto' :
    ra_prom > 22 ? 'Alto'     :
    ra_prom > 16 ? 'Medio'    : 'Bajo';

  const color: InterpSolar['color'] =
    ra_prom > 22 ? 'verde' : ra_prom > 16 ? 'amarillo' : 'rojo';

  const descripcion =
    ra_prom > 28 ? 'Zona de altísimo recurso solar. Condiciones excelentes para tecnologías solares.' :
    ra_prom > 22 ? 'Buen recurso solar todo el año. Viable para paneles FV y calentadores solares.' :
    ra_prom > 16 ? 'Recurso solar moderado. Inviernos con menor disponibilidad.' :
                   'Recurso solar limitado. Evaluar otras fuentes energéticas.';

  return { potencial, descripcion, color, usos_optimos: usos };
}
