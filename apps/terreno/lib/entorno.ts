/**
 * Contexto vivo del predio (D1) — datos abiertos (GBIF, OSM/Nominatim, Overpass).
 * Ubicación administrativa, biodiversidad observada en el radio (reinos, especies,
 * categorías de amenaza IUCN) y entorno OSM (agua, áreas protegidas, poblados).
 * Orientativo — depende de la densidad de observaciones ciudadanas (iNaturalist,
 * eBird…) agregadas por GBIF.
 */
import type { Mojon } from './types';

export interface Ubicacion {
  localidad:    string | null;
  departamento: string | null;
  provincia:    string | null;
  pais:         string | null;
}

export interface Biodiversidad {
  total:     number;
  especies:  Array<{ nombre: string; obs: number }>;
  reinos:    Record<string, number>;   // kingdomKey → count
  iucn:      Record<string, number>;   // categoría IUCN → count
}

export interface EntornoOSM {
  cursos_agua:      string[];
  cuerpos_agua:     string[];
  areas_protegidas: string[];
  poblados:         Array<{ nombre: string; tipo: string; dist_km: number }>;
}

export interface DatosEntorno {
  ubicacion:     Ubicacion | null;
  biodiversidad: Biodiversidad | null;
  osm:           EntornoOSM | null;
  radio_km:      number;
  // Derivados
  fauna:         number;
  flora:         number;
  hongos:        number;
  amenazadas:    number;   // VU + EN + CR + NT
  especies_top:  Array<{ nombre: string; obs: number }>;   // nombre sin autor
  resumen_texto: string[];
  fuente:        string;
}

const REINOS: Record<string, string> = { '1': 'Animalia', '5': 'Fungi', '6': 'Plantae' };
const IUCN_LABEL: Record<string, string> = {
  CR: 'En peligro crítico', EN: 'En peligro', VU: 'Vulnerable',
  NT: 'Casi amenazada', LC: 'Preocupación menor', DD: 'Datos insuficientes',
};

/** Radio (km) sugerido según el tamaño del predio (mín 2, según su diagonal). */
export function radioEntorno(mojones: Mojon[]): number {
  if (mojones.length < 2) return 3;
  const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
  const dLat = (Math.max(...lats) - Math.min(...lats)) * 111;
  const dLng = (Math.max(...lngs) - Math.min(...lngs)) * 111 * Math.cos((lats[0]! * Math.PI) / 180);
  const diag = Math.hypot(dLat, dLng);
  return Math.max(2, Math.min(10, Math.round(diag + 2)));
}

/** Quita el autor/año del nombre científico ("Genus species (Autor, 1800)" → "Genus species"). */
export function nombreLimpio(sci: string): string {
  const m = sci.match(/^([A-Z][a-zä-ÿ]+(?:\s[a-zä-ÿ-]+){1,2})/);
  return m ? m[1]! : sci.replace(/\s*\(.*$/, '').trim();
}

export async function obtenerEntorno(mojones: Mojon[]): Promise<DatosEntorno> {
  if (mojones.length < 3) throw new Error('Marcá al menos 3 mojones para ubicar el predio.');
  const lat = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
  const lng = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
  const radio_km = radioEntorno(mojones);

  const res = await fetch('/api/entorno', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lat, lng, radio_km }),
    signal: AbortSignal.timeout(50_000),
  });
  const json = await res.json() as (Partial<DatosEntorno> & { error?: string });
  if (json.error) throw new Error(json.error);
  if (!res.ok) throw new Error(`El servicio de contexto respondió ${res.status}.`);

  const bio = json.biodiversidad ?? null;
  const fauna  = bio?.reinos?.['1'] ?? 0;
  const flora  = bio?.reinos?.['6'] ?? 0;
  const hongos = bio?.reinos?.['5'] ?? 0;
  const amenazadas = ['CR', 'EN', 'VU', 'NT'].reduce((s, k) => s + (bio?.iucn?.[k] ?? 0), 0);
  const especies_top = (bio?.especies ?? []).map(e => ({ nombre: nombreLimpio(e.nombre), obs: e.obs }));

  const resumen_texto: string[] = [];
  const u = json.ubicacion;
  if (u) {
    const partes = [u.localidad, u.departamento, u.provincia, u.pais].filter(Boolean);
    if (partes.length) resumen_texto.push(`Ubicación: ${partes.join(', ')}.`);
  }
  if (bio && bio.total > 0) {
    resumen_texto.push(`${bio.total.toLocaleString('es-AR')} registros de biodiversidad en ${radio_km} km: ${fauna} de fauna, ${flora} de flora${hongos ? `, ${hongos} de hongos` : ''}.`);
    if (amenazadas > 0) {
      const criticas = ['CR', 'EN'].reduce((s, k) => s + (bio.iucn?.[k] ?? 0), 0);
      resumen_texto.push(`${amenazadas} registros de especies con algún grado de amenaza (IUCN)${criticas ? `, ${criticas} en peligro o crítico` : ''}. Verificá presencia de especies protegidas antes de intervenir.`);
    }
  } else {
    resumen_texto.push('Pocas o ninguna observación de biodiversidad en la zona (área poco muestreada). Sumá tus registros en iNaturalist/eBird.');
  }
  const osm = json.osm;
  if (osm) {
    if (osm.areas_protegidas.length) resumen_texto.push(`Áreas protegidas cercanas: ${osm.areas_protegidas.slice(0, 3).join(', ')}.`);
    if (osm.cursos_agua.length) resumen_texto.push(`Cursos de agua próximos: ${osm.cursos_agua.slice(0, 4).join(', ')}.`);
  }

  return {
    ubicacion: u ?? null,
    biodiversidad: bio,
    osm: osm ?? null,
    radio_km,
    fauna, flora, hongos, amenazadas, especies_top,
    resumen_texto,
    fuente: 'GBIF (biodiversidad) · OpenStreetMap/Nominatim + Overpass (ubicación y entorno) — datos abiertos, orientativos',
  };
}

export function etiquetaReino(key: string): string { return REINOS[key] ?? `Reino ${key}`; }
export function etiquetaIUCN(cat: string): string { return IUCN_LABEL[cat] ?? cat; }

// ─── Resumen para el informe ────────────────────────────────────────────────────
export interface EntornoResumen {
  ubicacion:  string | null;
  total_bio:  number;
  fauna:      number;
  flora:      number;
  amenazadas: number;
  especies_top: Array<{ nombre: string; obs: number }>;
  areas_protegidas: string[];
  radio_km:   number;
}

export function resumirEntorno(d: DatosEntorno): EntornoResumen {
  const u = d.ubicacion;
  const ubic = u ? [u.localidad, u.departamento, u.provincia, u.pais].filter(Boolean).join(', ') : null;
  return {
    ubicacion: ubic || null,
    total_bio: d.biodiversidad?.total ?? 0,
    fauna: d.fauna, flora: d.flora, amenazadas: d.amenazadas,
    especies_top: d.especies_top.slice(0, 6),
    areas_protegidas: d.osm?.areas_protegidas ?? [],
    radio_km: d.radio_km,
  };
}
