/**
 * Exportación de datos del predio a GeoJSON, KML y GPX.
 * Todo corre en el browser — genera strings descargables con URL.createObjectURL.
 */
import type { Mojon } from './types';
import type { Zona } from './zonificacion';
import type { Pin } from './pines';
import type { Camino } from './caminos';
import type { Sector } from './sectores';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function descargar(contenido: string, nombre: string, mime: string) {
  const blob = new Blob([contenido], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ─── GeoJSON ──────────────────────────────────────────────────────────────────

export function exportarGeoJSON(params: {
  mojones:  Mojon[];
  zonas?:   Zona[];
  sectores?: Sector[];
  pines?:   Pin[];
  caminos?: Camino[];
  nombre?:  string;
}): void {
  const { mojones, zonas = [], sectores = [], pines = [], caminos = [], nombre = 'predio' } = params;
  const features: object[] = [];

  // Polígono del predio
  if (mojones.length >= 3) {
    const coords = [...mojones.map(m => [m.lng, m.lat]), [mojones[0]!.lng, mojones[0]!.lat]];
    features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { tipo: 'predio', nombre } });
  }
  // Mojones como puntos
  mojones.forEach(m => features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [m.lng, m.lat] }, properties: { tipo: 'mojon', numero: m.numero } }));
  // Zonas
  zonas.forEach(z => {
    if (z.vertices.length < 3) return;
    const coords = [...z.vertices.map(v => [v.lng, v.lat]), [z.vertices[0]!.lng, z.vertices[0]!.lat]];
    features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { tipo: 'zona', nombre: z.nombre, categoria: z.categoria } });
  });
  // Sectores
  sectores.forEach(s => {
    if (s.vertices.length < 3) return;
    const coords = [...s.vertices.map(v => [v.lng, v.lat]), [s.vertices[0]!.lng, s.vertices[0]!.lat]];
    features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { tipo: 'sector', nombre: s.nombre } });
  });
  // Pines
  pines.forEach(p => features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: { tipo: 'pin', nombre: p.nombre, icono: p.icono } }));
  // Caminos
  caminos.forEach(c => {
    if (c.vertices.length < 2) return;
    features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: c.vertices.map(v => [v.lng, v.lat]) }, properties: { tipo: 'camino', nombre: c.nombre } });
  });

  const geojson = { type: 'FeatureCollection', features };
  descargar(JSON.stringify(geojson, null, 2), `${nombre}.geojson`, 'application/geo+json');
}

// ─── KML ──────────────────────────────────────────────────────────────────────

export function exportarKML(mojones: Mojon[], nombre = 'predio'): void {
  const placemarks = mojones.map(m =>
    `  <Placemark><name>Mojón ${m.numero}</name><Point><coordinates>${m.lng},${m.lat},0</coordinates></Point></Placemark>`,
  ).join('\n');

  let polygon = '';
  if (mojones.length >= 3) {
    const coords = [...mojones, mojones[0]!].map(m => `${m.lng},${m.lat},0`).join(' ');
    polygon = `  <Placemark><name>${nombre}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document><name>${nombre}</name>
${polygon}
${placemarks}
</Document></kml>`;
  descargar(kml, `${nombre}.kml`, 'application/vnd.google-earth.kml+xml');
}

// ─── GPX ──────────────────────────────────────────────────────────────────────

export function exportarGPX(mojones: Mojon[], nombre = 'predio'): void {
  const wpts = mojones.map(m =>
    `  <wpt lat="${m.lat}" lon="${m.lng}"><name>Mojón ${m.numero}</name></wpt>`,
  ).join('\n');

  let rte = '';
  if (mojones.length >= 2) {
    const rtepts = mojones.map(m => `    <rtept lat="${m.lat}" lon="${m.lng}"><name>Mojón ${m.numero}</name></rtept>`).join('\n');
    rte = `  <rte><name>${nombre}</name>\n${rtepts}\n  </rte>`;
  }

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Arte y Tierra" xmlns="http://www.topografix.com/GPX/1/1">
${wpts}
${rte}
</gpx>`;
  descargar(gpx, `${nombre}.gpx`, 'application/gpx+xml');
}

// ─── Import GeoJSON ───────────────────────────────────────────────────────────

export function importarGeoJSON(text: string): Array<{ lat: number; lng: number }> {
  const puntos: Array<{ lat: number; lng: number }> = [];
  try {
    const fc = JSON.parse(text) as { type: string; features?: unknown[]; coordinates?: unknown };
    const features: unknown[] = fc.type === 'FeatureCollection'
      ? (fc.features ?? [])
      : fc.type === 'Feature' ? [fc] : [{ type: 'Feature', geometry: fc }];

    for (const feat of features) {
      const geom = (feat as { geometry?: { type?: string; coordinates?: unknown } }).geometry;
      if (!geom) continue;
      if (geom.type === 'Point') {
        const [lng, lat] = geom.coordinates as [number, number];
        if (!isNaN(lat) && !isNaN(lng)) puntos.push({ lat, lng });
      } else if (geom.type === 'Polygon') {
        const ring = (geom.coordinates as [number, number][][])[0] ?? [];
        const poly = ring.map(([lng, lat]) => ({ lat, lng })).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
        // Quitar punto de cierre si repite el primero
        if (poly.length > 1) {
          const f = poly[0]!, l = poly[poly.length - 1]!;
          if (Math.abs(f.lat - l.lat) < 1e-9 && Math.abs(f.lng - l.lng) < 1e-9) poly.pop();
        }
        puntos.push(...poly);
        return puntos; // para polígono tomamos los vértices del primer feature
      } else if (geom.type === 'LineString') {
        const pts = (geom.coordinates as [number, number][]).map(([lng, lat]) => ({ lat, lng }));
        puntos.push(...pts);
        return puntos;
      }
    }
  } catch { /* JSON inválido */ }
  return puntos;
}

// ─── Import GPX ───────────────────────────────────────────────────────────────

export function importarGPX(text: string): Array<{ lat: number; lng: number }> {
  const puntos: Array<{ lat: number; lng: number }> = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');

  // Waypoints
  doc.querySelectorAll('wpt').forEach(el => {
    const lat = parseFloat(el.getAttribute('lat') ?? '');
    const lng = parseFloat(el.getAttribute('lon') ?? '');
    if (!isNaN(lat) && !isNaN(lng)) puntos.push({ lat, lng });
  });

  // Track points (si no hay wpts)
  if (puntos.length === 0) {
    doc.querySelectorAll('trkpt, rtept').forEach(el => {
      const lat = parseFloat(el.getAttribute('lat') ?? '');
      const lng = parseFloat(el.getAttribute('lon') ?? '');
      if (!isNaN(lat) && !isNaN(lng)) puntos.push({ lat, lng });
    });
  }

  return puntos;
}
