/**
 * Importación de coordenadas desde KML, KMZ y CSV.
 * Todo corre en el browser — no hay uploads a servidor.
 */
import type { Mojon } from './types';

// ─── KML ─────────────────────────────────────────────────────────────────────

function coordsFromKMLString(kmlText: string): Array<{ lat: number; lng: number }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlText, 'text/xml');
  const puntos: Array<{ lat: number; lng: number }> = [];

  // Extraer <Point><coordinates>lng,lat,alt</coordinates></Point>
  doc.querySelectorAll('Point > coordinates').forEach(el => {
    const raw = el.textContent?.trim() ?? '';
    const parts = raw.split(',');
    const lng = parseFloat(parts[0] ?? '');
    const lat = parseFloat(parts[1] ?? '');
    if (!isNaN(lat) && !isNaN(lng)) puntos.push({ lat, lng });
  });

  // Si hay polígonos: extraer vértices del outerBoundary (excluir último = cierre)
  if (puntos.length === 0) {
    doc.querySelectorAll('outerBoundaryIs coordinates, LinearRing coordinates').forEach(el => {
      const raw = el.textContent?.trim() ?? '';
      const tuples = raw.split(/\s+/).filter(Boolean);
      const poly: Array<{ lat: number; lng: number }> = [];
      for (const t of tuples) {
        const parts = t.split(',');
        const lng = parseFloat(parts[0] ?? '');
        const lat = parseFloat(parts[1] ?? '');
        if (!isNaN(lat) && !isNaN(lng)) poly.push({ lat, lng });
      }
      // Eliminar el último punto si es igual al primero (cierre del polígono)
      if (poly.length > 1) {
        const first = poly[0];
        const last  = poly[poly.length - 1];
        if (
          first && last &&
          Math.abs(first.lat - last.lat) < 0.000001 &&
          Math.abs(first.lng - last.lng) < 0.000001
        ) {
          poly.pop();
        }
      }
      puntos.push(...poly);
    });
  }

  return puntos;
}

export async function importarKML(file: File): Promise<Mojon[]> {
  const text = await file.text();
  return buildMojones(coordsFromKMLString(text));
}

export async function importarKMZ(file: File): Promise<Mojon[]> {
  // KMZ = ZIP que contiene doc.kml (u otro .kml)
  const { unzip } = await import('fflate');
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  return new Promise((resolve, reject) => {
    unzip(uint8, (err, files) => {
      if (err) { reject(new Error('No se pudo leer el archivo KMZ.')); return; }
      const kmlEntry = Object.entries(files).find(([name]) => name.endsWith('.kml'));
      if (!kmlEntry) { reject(new Error('El KMZ no contiene un archivo .kml.')); return; }
      const [, bytes] = kmlEntry;
      if (!bytes) { reject(new Error('Archivo .kml vacío.')); return; }
      const text = new TextDecoder().decode(bytes);
      resolve(buildMojones(coordsFromKMLString(text)));
    });
  });
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

/** Acepta CSV con cualquier combinación de: lat/latitude/latitud, lng/lon/longitude/longitud */
export async function importarCSV(file: File): Promise<Mojon[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('El CSV no tiene datos.');

  const header = lines[0]?.toLowerCase().split(/[,;\t]/).map(h => h.trim()) ?? [];
  const latIdx = header.findIndex(h => ['lat', 'latitude', 'latitud', 'y'].includes(h));
  const lngIdx = header.findIndex(h => ['lng', 'lon', 'long', 'longitude', 'longitud', 'x'].includes(h));

  if (latIdx === -1 || lngIdx === -1) {
    throw new Error(
      'El CSV necesita columnas "lat" y "lng" (o latitude/longitude). ' +
      `Columnas encontradas: ${header.join(', ')}`,
    );
  }

  const puntos: Array<{ lat: number; lng: number }> = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i]?.split(/[,;\t]/) ?? [];
    const lat = parseFloat((cells[latIdx] ?? '').replace(',', '.'));
    const lng = parseFloat((cells[lngIdx] ?? '').replace(',', '.'));
    if (!isNaN(lat) && !isNaN(lng)) puntos.push({ lat, lng });
  }

  if (puntos.length === 0) throw new Error('No se encontraron coordenadas válidas en el CSV.');
  return buildMojones(puntos);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildMojones(puntos: Array<{ lat: number; lng: number }>): Mojon[] {
  if (puntos.length === 0) throw new Error('No se encontraron coordenadas en el archivo.');
  return puntos.map((p, i) => ({
    id: crypto.randomUUID(),
    numero: i + 1,
    lat: p.lat,
    lng: p.lng,
  }));
}

export function exportarCSV(mojones: Mojon[], nombre: string): void {
  const lines = ['numero,lat,lng'];
  mojones.forEach(m => lines.push(`${m.numero},${m.lat},${m.lng}`));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${nombre.replace(/\s+/g, '_')}_mojones.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
