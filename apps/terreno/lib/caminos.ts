/**
 * Caminos: trazado de senderos/caminos sobre el mapa con perfil de elevación.
 * El perfil se obtiene vía OpenTopoData SRTM via POST (evita límites de URL).
 */
import * as turf from '@turf/turf';

export interface Camino {
  id:         string;
  nombre:     string;
  vertices:   Array<{ lat: number; lng: number }>;
  color:      string;
  notas:      string;
  longitud_m?: number;
  perfil?:    PerfilElevacion;
  /** Origen automático (para poder ocultar en bloque las sugerencias generadas). */
  origen?:    'analisis';
}

export interface PuntoPerfilElevacion {
  distancia_m: number;
  elevation:   number;
}

export interface PerfilElevacion {
  puntos:              PuntoPerfilElevacion[];
  elev_min:            number;
  elev_max:            number;
  desnivel_pos:        number;
  desnivel_neg:        number;
  longitud_m:          number;
  pendiente_media_pct: number;
}

export function crearCamino(vertices: Array<{ lat: number; lng: number }>): Camino {
  return {
    id:         crypto.randomUUID(),
    nombre:     'Camino',
    vertices,
    color:      '#8B4513',
    notas:      '',
    longitud_m: calcularLongitud(vertices),
  };
}

export function calcularLongitud(vertices: Array<{ lat: number; lng: number }>): number {
  if (vertices.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    const a = vertices[i]!;
    const b = vertices[i + 1]!;
    total += turf.distance(turf.point([a.lng, a.lat]), turf.point([b.lng, b.lat]), { units: 'meters' });
  }
  return Math.round(total);
}

// ─── Perfil de elevación ──────────────────────────────────────────────────────

export async function fetchPerfilElevacion(
  vertices: Array<{ lat: number; lng: number }>,
): Promise<{ perfil: PerfilElevacion } | { error: string }> {
  if (vertices.length < 2) return { error: 'Se necesitan al menos 2 puntos.' };

  // Construir línea y samplear puntos equidistantes
  let line: ReturnType<typeof turf.lineString>;
  try {
    line = turf.lineString(vertices.map(v => [v.lng, v.lat]));
  } catch {
    return { error: 'No se pudo construir la línea.' };
  }

  const longitud_km = turf.length(line, { units: 'kilometers' });
  const longitud_m  = Math.round(longitud_km * 1000);

  // Samplear entre 10 y 90 puntos equidistantes (POST acepta hasta 100)
  const nPuntos = Math.min(90, Math.max(10, Math.ceil(longitud_km * 30)));
  const paso_km = nPuntos > 1 ? longitud_km / (nPuntos - 1) : 0;

  const muestreados: Array<{ lat: number; lng: number; distancia_m: number }> = [];
  for (let i = 0; i < nPuntos; i++) {
    const d = Math.min(i * paso_km, longitud_km);
    try {
      const pt = turf.along(line, d, { units: 'kilometers' });
      muestreados.push({
        lng:         pt.geometry.coordinates[0]!,
        lat:         pt.geometry.coordinates[1]!,
        distancia_m: Math.round(d * 1000),
      });
    } catch { /* skip bad points */ }
  }

  if (muestreados.length < 2) return { error: 'No se pudieron generar puntos de muestra.' };

  // POST a OpenTopoData (evita límites de longitud de URL)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch('/api/elevacion', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        locations: muestreados.map(p => ({ latitude: p.lat, longitude: p.lng })),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      return { error: `API error ${res.status}: ${txt.slice(0, 120)}` };
    }

    const json = await res.json() as {
      status:  string;
      results: Array<{ elevation: number | null }>;
    };

    if (json.status !== 'OK') return { error: `API status: ${json.status}` };

    const puntos: PuntoPerfilElevacion[] = json.results
      .map((r, i) => ({
        distancia_m: muestreados[i]!.distancia_m,
        elevation:   r.elevation ?? 0,
      }))
      .filter(p => p.elevation > -500);

    if (puntos.length < 2) return { error: 'Sin datos de elevación válidos.' };

    let desnivel_pos = 0, desnivel_neg = 0;
    for (let i = 1; i < puntos.length; i++) {
      const diff = puntos[i]!.elevation - puntos[i - 1]!.elevation;
      if (diff > 0) desnivel_pos += diff;
      else          desnivel_neg += Math.abs(diff);
    }

    const elevs   = puntos.map(p => p.elevation);
    const elev_min = Math.min(...elevs);
    const elev_max = Math.max(...elevs);

    return {
      perfil: {
        puntos,
        elev_min,
        elev_max,
        desnivel_pos:        Math.round(desnivel_pos),
        desnivel_neg:        Math.round(desnivel_neg),
        longitud_m,
        pendiente_media_pct: longitud_m > 0
          ? Math.round(((elev_max - elev_min) / longitud_m) * 1000) / 10
          : 0,
      },
    };
  } catch (e) {
    if ((e as Error).name === 'AbortError') return { error: 'Tiempo de espera agotado (30s). Intentá de nuevo.' };
    return { error: String(e) };
  } finally {
    clearTimeout(timer);
  }
}
