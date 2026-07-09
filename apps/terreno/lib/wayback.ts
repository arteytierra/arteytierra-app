/**
 * Imagen histórica (D2) — cliente de ESRI World Imagery Wayback.
 * Trae la línea de tiempo de releases (una por año) desde /api/wayback.
 */

export interface ReleaseWayback {
  rel:     string;   // número de release (embebido en tileUrl)
  fecha:   string;   // ISO YYYY-MM-DD
  label:   string;   // año (para el slider)
  tileUrl: string;   // plantilla Leaflet {z}/{y}/{x}
}

export async function obtenerReleasesWayback(): Promise<ReleaseWayback[]> {
  const res = await fetch('/api/wayback', { signal: AbortSignal.timeout(30_000) });
  const json = await res.json() as { releases?: ReleaseWayback[]; error?: string };
  if (json.error) throw new Error(json.error);
  if (!res.ok) throw new Error(`El servicio histórico respondió ${res.status}.`);
  return json.releases ?? [];
}
